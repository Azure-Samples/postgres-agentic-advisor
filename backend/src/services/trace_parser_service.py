""" Parses a Phoenix spans DataFrame (pre-filtered to one trace_id) into the
graph-shaped dict the frontend needs to render the agent execution graph.
"""

from __future__ import annotations

import json

import pandas as pd


class AlertTraceParser:
    """
    Parses a Phoenix spans DataFrame (pre-filtered to one trace_id) into
    a structured dict describing the agent execution graph.

    The graph topology (nodes + edges) is hardcoded to mirror the compiled
    LangGraph workflow in AlertWorkflowService._build_workflow(). Phoenix spans
    are used only to enrich each node with runtime data: whether it was triggered,
    its execution duration, and LLM-level input/output.

    Usage:
        import phoenix as px
        df = px.Client(endpoint=settings.PHOENIX_BASE_URL).get_spans_dataframe(
            project_name=settings.PHOENIX_PROJECT_NAME
        )
        trace_df = df[df["context.trace_id"] == phoenix_trace_id]
        result = AlertTraceParser(trace_df).parse()
    """

    # This topology — mirrors _build_workflow() in AlertWorkflowService.
    # level determines the column position in the frontend DAG view:
    #   level 1 → planning (sequential entry point)
    #   level 2 → three parallel agents
    #   level 3 → risk_insight (fan-in)
    NODES: list[dict] = [
        {"id": "client_impact_analysis", "label": "Client Impact Analysis", "level": 1},
        {"id": "planning", "label": "Planning Agent", "level": 2},
        {"id": "news_synthesizer", "label": "News Analysis Agent", "level": 3},
        {"id": "stock_analysis", "label": "Stock Analysis Agent", "level": 3},
        {"id": "sec_filing_analysis", "label": "SEC Filing Analysis Agent", "level": 3},
        {"id": "risk_insight", "label": "Risk Insight Agent", "level": 4},
    ]

    EDGES: list[dict] = [
        {"from": "client_impact_analysis", "to": "planning"},
        {"from": "planning", "to": "news_synthesizer"},
        {"from": "planning", "to": "stock_analysis"},
        {"from": "planning", "to": "sec_filing_analysis"},
        {"from": "news_synthesizer", "to": "risk_insight"},
        {"from": "stock_analysis", "to": "risk_insight"},
        {"from": "sec_filing_analysis", "to": "risk_insight"},
    ]

    def __init__(self, df: pd.DataFrame) -> None:
        self._df = df
        self._span_lookup: dict[str, pd.Series] = self._build_span_lookup()

    # -------------------------------------------------------------------------
    # Public
    # -------------------------------------------------------------------------

    def parse(self) -> dict:
        """
        Entry point. Iterates the hardcoded node topology and enriches each node
        with runtime data sourced from the Phoenix spans.

        For each node:
          - If a matching span exists → triggered=True, duration/IO extracted.
          - If no span exists        → triggered=False.

        Returns a dict with two keys:
          - "graph":        nodes (with runtime metadata) + hardcoded edges.
          - "agent_outputs": per-agent {input, output} extracted from LLM child spans.
        """
        nodes = []
        agent_outputs = {}

        for node_def in self.NODES:
            node_id = node_def["id"]
            span = self._span_lookup.get(node_id)
            triggered = span is not None

            duration_ms = None

            if triggered:
                llm_span = self._get_last_llm_child(span)
                duration_ms = self._calc_duration_ms(
                    llm_span if llm_span is not None else span,
                )
                agent_outputs[node_id] = self._extract_io_from_llm_span(llm_span)
                if node_id == "risk_insight":
                    agent_outputs[node_id] = self._parse_risk_insight_output(
                        agent_outputs[node_id],
                    )
                if node_id == "evaluation":
                    agent_outputs[node_id] = self._parse_evaluation_output(
                        agent_outputs[node_id],
                    )

            node_entry = {
                "id": node_id,
                "label": node_def["label"],
                "level": node_def["level"],
                "triggered": (
                    True if node_id == "client_impact_analysis" else triggered
                ),
            }
            if node_id != "client_impact_analysis":
                node_entry["duration_ms"] = duration_ms
            nodes.append(node_entry)

        return {
            "graph": {"nodes": nodes, "edges": self.EDGES},
            "agent_outputs": agent_outputs,
        }

    # -------------------------------------------------------------------------
    # Private
    # -------------------------------------------------------------------------

    def _build_span_lookup(self) -> dict[str, pd.Series]:
        """
        Scans the DataFrame once and builds a {span_name → span_row} index
        for the 5 known agent node names. Any span whose name does not match
        a known node (e.g. the root wrapper span, LLM child spans) is ignored.
        Only the first occurrence of each name is kept.
        """
        node_ids = {n["id"] for n in self.NODES}
        lookup: dict[str, pd.Series] = {}
        for _, row in self._df.iterrows():
            name = row.get("name")
            if name in node_ids and name not in lookup:
                lookup[name] = row
        return lookup

    def _get_span_id(self, span: pd.Series) -> str | None:
        """Extracts span_id which is nested inside the context dict."""
        ctx = span.get("context")
        if isinstance(ctx, dict):
            return ctx.get("span_id")
        return None

    def _get_last_llm_child(self, span: pd.Series) -> pd.Series | None:
        """
        Returns the last AzureChatOpenAI span that is a descendant (any depth)
        of the given agent span.
        """
        root_span_id = self._get_span_id(span)
        if root_span_id is None or self._df.empty:
            return None

        # BFS: collect all descendant span_ids
        visited = set()
        queue = [root_span_id]
        while queue:
            current = queue.pop()
            if current in visited:
                continue
            visited.add(current)
            children = self._df[self._df["parent_id"] == current]
            for _, child in children.iterrows():
                child_id = self._get_span_id(child)
                if child_id:
                    queue.append(child_id)

        # Find AzureChatOpenAI spans among all descendants
        descendant_ids = visited - {root_span_id}
        llm_spans = self._df[
            self._df.apply(lambda r: self._get_span_id(r) in descendant_ids, axis=1)
            & self._df["name"].str.contains("AzureChatOpenAI", case=False, na=False)
        ]
        if llm_spans.empty:
            return None
        return llm_spans.sort_values("start_time", ascending=True).iloc[-1]

    def _parse_risk_insight_output(self, extracted: dict) -> dict:
        """
        The risk_insight LLM returns a JSON string with the shape:
            {"risk_analysis": {"personalized_output": "...", "reasoning": "..."},
             "alert_response_formatted": {...}}

        Extract personalized_output → output and reasoning → reasoning.
        Falls back to the raw string if parsing fails.
        """
        raw_output = extracted.get("output") or ""
        try:
            parsed = json.loads(raw_output)
            risk_analysis = parsed.get("risk_analysis", {})
            return {
                **extracted,
                "output": risk_analysis.get("personalized_output") or raw_output,
                "reasoning": risk_analysis.get("reasoning")
                or extracted.get("reasoning")
                or "",
            }
        except (json.JSONDecodeError, Exception):
            return extracted

    def _parse_evaluation_output(self, extracted: dict) -> dict:
        """
        The evaluation agent returns a JSON string with the shape:
            {"status": "retrigger" | "approved", "explanation": "..."}

        Extract status → output and explanation → reasoning.
        Falls back to the raw string if parsing fails.
        """
        raw_output = extracted.get("output") or ""
        try:
            parsed = json.loads(raw_output)
            return {
                **extracted,
                "output": parsed.get("status") or raw_output,
                "reasoning": parsed.get("explanation")
                or extracted.get("reasoning")
                or "",
            }
        except (json.JSONDecodeError, Exception):
            return extracted

    def _calc_duration_ms(self, span: pd.Series) -> int | None:
        """
        Computes the wall-clock execution time of a span in milliseconds.
        Handles both datetime objects and ISO string timestamps.
        """
        try:
            start = pd.Timestamp(span["start_time"])
            end = pd.Timestamp(span["end_time"])
            return round((end - start).total_seconds() * 1000)
        except Exception:
            return None

    def _extract_io_from_llm_span(self, llm_span: pd.Series | None) -> dict:
        """
        Extracts {input, output, reasoning} from the last AzureChatOpenAI child span.

        Agents now return JSON with at least "output" and "reasoning" keys.
        We try to parse the raw output string as JSON and extract those fields.
        Falls back to treating the raw string as output if parsing fails.
        """

        def _na_to_none(v):
            try:
                return None if pd.isna(v) else v
            except (TypeError, ValueError):
                return v

        if llm_span is None:
            return {"input": None, "output": None, "reasoning": None}

        attrs = llm_span.get("attributes") or {}

        # Collect only user input messages (skip system prompt)
        input_messages = []
        i = 0
        while f"llm.input_messages.{i}.message.role" in attrs:
            if attrs.get(f"llm.input_messages.{i}.message.role") == "user":
                input_messages.append(
                    attrs.get(f"llm.input_messages.{i}.message.content"),
                )
            i += 1

        raw_output = (
            _na_to_none(attrs.get("llm.output_messages.0.message.content")) or ""
        )

        # Try to parse JSON output produced by the updated agent prompts
        output = raw_output
        reasoning = None
        try:
            parsed = json.loads(raw_output)
            output = parsed.get("output") or raw_output
            reasoning = parsed.get("reasoning")
        except (json.JSONDecodeError, Exception):
            pass

        return {
            "input": (
                input_messages[0]
                if len(input_messages) == 1
                else (input_messages or None)
            ),
            "output": output,
            "reasoning": reasoning,
        }
