"""
AskAI Trace Parser.

Parses Phoenix spans for the AskAI multi-agent workflow into the same
graph-shaped dict the frontend uses to render the agent execution graph.

Key difference from AlertTraceParser
-------------------------------------
The alert workflow produces ONE trace per (client, company) workflow run.
The AskAI workflow produces MANY per-company isolated traces — one per
company per analysis type (news / stock / sec).  The span names match the
node names used in the isolated tracer.start_as_current_span() calls inside
AskAIWorkflowService:
    "news_synthesizer"  — one trace per company analyzed for news
    "stock_analysis"    — one trace per company analyzed for stock
    "sec_filing_analysis" — one trace per company analyzed for SEC

Because of this, this parser:
  1. Receives a dict {analysis_type → [trace_id, ...]} sourced from the
     askai_chat_analysis_cache table (stored when each result was written).
  2. For each agent node it fetches ALL matching traces from Phoenix and
     collects every AzureChatOpenAI child span.
  3. Aggregates across all per-company runs:
       - inputs  → list of all per-company user inputs
       - output  → combined string of all per-company outputs
       - duration_ms → sum of all per-company LLM durations

The planning agent does not have an isolated trace (it runs inside the outer
LangGraph invocation).  It is marked triggered=True whenever the analysis ran
and the trace_ids dict is non-empty.

Usage:
    from src.services.askai_trace_parser_service import AskAITraceParser

    parser = AskAITraceParser(phoenix_client, trace_ids_by_type)
    result = await parser.parse()
    # result → {"graph": {nodes, edges}, "agent_outputs": {node_id: {input, output, ...}}}
"""

from __future__ import annotations

import json
from typing import Optional

import pandas as pd
from phoenix.client import AsyncClient as PhoenixAsyncClient
from src.configs.config import settings


class AskAITraceParser:
    """
    Async trace parser for the AskAI multi-company workflow.

    Args:
        phoenix_client:    Initialised Phoenix AsyncClient.
        trace_ids_by_type: Dict mapping analysis_type to list of trace ID hex
                           strings stored in askai_chat_analysis_cache.
                           e.g. {"news": ["abc...", "def..."], "stock": [...]}
                           Pass an empty dict if no analyses have been traced yet.
    """

    # Topology mirrors AskAIWorkflowService._build_workflow().
    # Planning is level 1; the three analysis agents are all level 2 (parallel).
    NODES: list[dict] = [
        {"id": "planning", "label": "Planning Agent", "level": 1},
        {"id": "news_synthesizer", "label": "News Analysis Agent", "level": 2},
        {"id": "stock_analysis", "label": "Stock Analysis Agent", "level": 2},
        {"id": "sec_filing_analysis", "label": "SEC Filing Analysis Agent", "level": 2},
    ]

    EDGES: list[dict] = [
        {"from": "planning", "to": "news_synthesizer"},
        {"from": "planning", "to": "stock_analysis"},
        {"from": "planning", "to": "sec_filing_analysis"},
    ]

    # Maps node_id → the analysis_type key in trace_ids_by_type
    _NODE_TO_TYPE: dict[str, str] = {
        "news_synthesizer": "news",
        "stock_analysis": "stock",
        "sec_filing_analysis": "sec",
    }

    def __init__(
        self,
        phoenix_client: PhoenixAsyncClient,
        trace_ids_by_type: dict[str, list[str]],
    ) -> None:
        self._client = phoenix_client
        self._trace_ids_by_type = trace_ids_by_type

    # -------------------------------------------------------------------------
    # Public
    # -------------------------------------------------------------------------

    async def parse(self) -> dict:
        """
        Fetch all relevant Phoenix spans and build the enriched graph dict.

        Returns:
            {
                "graph":         {"nodes": [...], "edges": [...]},
                "agent_outputs": {node_id: {"input", "output", "reasoning", "sources"}},
            }
        """
        # planning is always triggered if there are any trace IDs at all
        planning_triggered = bool(self._trace_ids_by_type)

        nodes = []
        agent_outputs = {}

        for node_def in self.NODES:
            node_id = node_def["id"]

            if node_id == "planning":
                planning_trace_ids = self._trace_ids_by_type.get("planning", [])
                if planning_trace_ids:
                    # Fetch the isolated planning span from Phoenix
                    aggregated = await self._aggregate_agent_spans(
                        "planning",
                        planning_trace_ids,
                    )
                    nodes.append(
                        {
                            "id": node_id,
                            "label": node_def["label"],
                            "level": node_def["level"],
                            "triggered": True,
                            "duration_ms": aggregated["total_duration_ms"],
                        },
                    )
                    agent_outputs[node_id] = {
                        "input": aggregated["inputs"],
                        "output": aggregated["output"],
                        "reasoning": aggregated["reasoning"],
                        "sources": aggregated["sources"],
                    }
                else:
                    nodes.append(
                        {
                            "id": node_id,
                            "label": node_def["label"],
                            "level": node_def["level"],
                            "triggered": planning_triggered,
                            "duration_ms": None,
                        },
                    )
                    if planning_triggered:
                        agent_outputs[node_id] = {
                            "input": None,
                            "output": None,
                            "reasoning": None,
                            "sources": None,
                        }
                continue

            # For analysis agents, attempt to fetch and aggregate spans
            analysis_type = self._NODE_TO_TYPE[node_id]
            trace_ids = self._trace_ids_by_type.get(analysis_type, [])

            if not trace_ids:
                nodes.append(
                    {
                        "id": node_id,
                        "label": node_def["label"],
                        "level": node_def["level"],
                        "triggered": False,
                        "duration_ms": None,
                    },
                )
                continue

            # Fetch all per-company spans for this agent type and aggregate
            aggregated = await self._aggregate_agent_spans(node_id, trace_ids)

            nodes.append(
                {
                    "id": node_id,
                    "label": node_def["label"],
                    "level": node_def["level"],
                    "triggered": True,
                    "duration_ms": aggregated["total_duration_ms"],
                },
            )
            agent_outputs[node_id] = {
                "input": aggregated["inputs"],  # list of per-company inputs
                "output": aggregated["output"],  # combined output string
                "reasoning": aggregated["reasoning"],
                "sources": aggregated["sources"],
            }

        return {
            "graph": {"nodes": nodes, "edges": self.EDGES},
            "agent_outputs": agent_outputs,
        }

    # -------------------------------------------------------------------------
    # Private — span aggregation
    # -------------------------------------------------------------------------

    async def _aggregate_agent_spans(
        self,
        node_id: str,
        trace_ids: list[str],
    ) -> dict:
        """
        Fetch one Phoenix DataFrame per trace ID, extract the LLM child span
        from each, then aggregate results across all per-company runs.

        Returns:
            {
                "inputs":           list[str | None],  # one entry per company
                "output":           str,               # newline-joined outputs
                "reasoning":        str | None,
                "sources":          list | None,
                "total_duration_ms": int | None,
            }
        """
        inputs: list[Optional[str]] = []
        outputs: list[str] = []
        reasonings: list[str] = []
        all_sources: list = []
        min_start: Optional[pd.Timestamp] = None
        max_end: Optional[pd.Timestamp] = None

        for trace_id in trace_ids:
            df = await self._fetch_trace_df(trace_id)
            if df is None or df.empty:
                continue

            # Find the root agent span (named after node_id) and its last LLM child
            agent_span = self._find_root_span(df, node_id)
            if agent_span is None:
                continue

            llm_span = self._get_last_llm_child(df, agent_span)
            target = llm_span if llm_span is not None else agent_span

            # Wall-clock duration: track earliest start and latest end across parallel instances
            try:
                span_start = pd.Timestamp(target["start_time"])
                span_end = pd.Timestamp(target["end_time"])
                if min_start is None or span_start < min_start:
                    min_start = span_start
                if max_end is None or span_end > max_end:
                    max_end = span_end
            except Exception:
                pass

            # Input / output extraction
            extracted = self._extract_io_from_llm_span(llm_span)
            inputs.append(extracted.get("input"))

            raw_output = extracted.get("output") or ""
            if raw_output:
                outputs.append(raw_output)

            reasoning = extracted.get("reasoning")
            if reasoning:
                reasonings.append(reasoning)

            sources = extracted.get("sources")
            if sources:
                all_sources.extend(sources)

        combined_output = "\n\n---\n\n".join(outputs) if outputs else None

        return {
            "inputs": inputs or None,
            "output": combined_output,
            "reasoning": "\n\n".join(reasonings) if reasonings else None,
            "sources": list(dict.fromkeys(all_sources)) if all_sources else None,
            "total_duration_ms": round((max_end - min_start).total_seconds() * 1000) if min_start and max_end else None,
        }

    async def _fetch_trace_df(self, trace_id: str) -> Optional[pd.DataFrame]:
        """
        Fetch all spans for a single trace ID from Phoenix.
        Returns None on any error or when no spans are found.
        Uses the same API pattern as AlertWorkflowService._fetch_parse_and_store_trace.
        """
        try:
            spans = await self._client.spans.get_spans(
                project_identifier=settings.PHOENIX_PROJECT_NAME,
                trace_ids=[trace_id],
            )
            if not spans:
                return None
            df = pd.DataFrame(spans)
            return df if not df.empty else None
        except Exception as exc:
            print(f"   [AskAITraceParser] Failed to fetch trace {trace_id}: {exc}")
            return None

    def _find_root_span(
        self,
        df: pd.DataFrame,
        span_name: str,
    ) -> Optional[pd.Series]:
        """
        Find the first span whose name matches span_name.
        This is the top-level agent span created by tracer.start_as_current_span().
        """
        matches = df[df["name"] == span_name]
        if matches.empty:
            return None
        return matches.iloc[0]

    def _get_last_llm_child(
        self,
        df: pd.DataFrame,
        span: pd.Series,
    ) -> Optional[pd.Series]:
        """
        Returns the last AzureChatOpenAI descendant span of the given agent span.
        Mirrors the same BFS logic used in AlertTraceParser.
        """
        root_span_id = self._get_span_id(span)
        if root_span_id is None or df.empty:
            return None

        # BFS to collect all descendant span IDs
        visited: set[str] = set()
        queue = [root_span_id]
        while queue:
            current = queue.pop()
            if current in visited:
                continue
            visited.add(current)
            children = df[df["parent_id"] == current]
            for _, child in children.iterrows():
                child_id = self._get_span_id(child)
                if child_id:
                    queue.append(child_id)

        descendant_ids = visited - {root_span_id}
        llm_spans = df[
            df.apply(
                lambda r: self._get_span_id(r) in descendant_ids,
                axis=1,
            )
            & df["name"].str.contains("AzureChatOpenAI", case=False, na=False)
        ]
        if llm_spans.empty:
            return None
        return llm_spans.sort_values("start_time", ascending=True).iloc[-1]

    # -------------------------------------------------------------------------
    # Private — span utilities (mirrors AlertTraceParser helpers)
    # -------------------------------------------------------------------------

    def _get_span_id(self, span: pd.Series) -> Optional[str]:
        """Extract span_id from the context dict column."""
        ctx = span.get("context")
        if isinstance(ctx, dict):
            return ctx.get("span_id")
        return None

    def _extract_io_from_llm_span(
        self,
        llm_span: Optional[pd.Series],
    ) -> dict:
        """
        Extract {input, output, reasoning, sources} from the last
        AzureChatOpenAI child span, following the same field layout as
        AlertTraceParser._extract_io_from_llm_span().

        Agents return a JSON string with at least "output" and "reasoning".
        Falls back to the raw string as output if JSON parsing fails.
        """

        def _na_to_none(v):
            try:
                return None if pd.isna(v) else v
            except (TypeError, ValueError):
                return v

        if llm_span is None:
            return {"input": None, "output": None, "reasoning": None, "sources": None}

        attrs = llm_span.get("attributes") or {}

        # Collect user-role input messages (skip system prompt)
        input_messages: list[str] = []
        i = 0
        while f"llm.input_messages.{i}.message.role" in attrs:
            if attrs.get(f"llm.input_messages.{i}.message.role") == "user":
                content = attrs.get(f"llm.input_messages.{i}.message.content")
                if content:
                    input_messages.append(content)
            i += 1

        raw_output = (
            _na_to_none(attrs.get("llm.output_messages.0.message.content")) or ""
        )

        # Try to parse JSON produced by agent prompts
        output = raw_output
        reasoning = None
        sources = None
        try:
            parsed = json.loads(raw_output)
            output = parsed.get("output") or raw_output
            reasoning = parsed.get("reasoning")
            sources = parsed.get("sources")
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
            "sources": sources,
        }
