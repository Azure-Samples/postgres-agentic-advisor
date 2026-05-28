import asyncio
import json
import re
import time
from datetime import date, datetime
from typing import List, Optional, TypedDict

import opentelemetry.context as otel_context
import opentelemetry.trace as otel_trace
import pandas as pd
from langchain_core.messages import HumanMessage
from langchain_core.runnables.config import var_child_runnable_config
from langchain_openai import AzureChatOpenAI
from langgraph.graph import END, START, StateGraph
from phoenix.client import AsyncClient as PhoenixAsyncClient
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from src.agents import (
    get_news_synthesizer_agent,
    get_planner_agent,
    get_risk_insight_agent,
    get_sec_filing_analysis_agent,
    get_stock_analysis_agent,
)
from src.agents.news_synthesizer_agent import news_retrieved_docs_var
from src.configs.config import settings
from src.configs.rag_questions import sec_file_rag_questions
from src.models import Alert
from src.repositories import (
    AccountHoldingRepository,
    AlertRepository,
    AlertSourceRepository,
    ClientRepository,
    GraphRepository,
    SecurityRepository,
    UserRepository,
    WorkflowTriggerRepository,
)
from src.services.memory_service import fetch_preferences, get_mem0_memory
from src.services.source_highlight_service import SourceHighlightService
from src.services.trace_parser_service import AlertTraceParser
from src.utils.utils import (
    build_companies,
    prompt_client_info,
    prompt_holdings,
    prompt_security_info,
    prompt_supply_chain,
    run_parallel_rag_with_docs,
    sanitize_json_strings,
)


class AlertWorkflowState(TypedDict):
    """State definition for the alert workflow."""

    # Input
    date: Optional[str]
    company: Optional[str]
    news: Optional[str]
    user_information: Optional[dict]
    security_information: Optional[dict]
    client_information: Optional[dict]
    client_account_holdings: Optional[dict]
    client_preferences: Optional[list[str]]

    workflow_type: Optional[str]
    supply_chain_context: Optional[dict]
    trigger_type: Optional[str]

    # Agent outputs
    planning_agent_result: dict
    agents_to_trigger: List[str]
    news_synthesizer_agent_result: str
    risk_insight_agent_result: str
    stock_analysis_agent_result: str
    sec_filing_analysis_agent_result: str

    # Retrieved document chunks after RAG
    news_retrieved_docs: Optional[list]
    sec_filing_retrieved_docs: Optional[list]

    # Reference sentences extracted from agent JSON outputs for source highlighting
    news_reference_sentences: Optional[list]
    sec_reference_sentences: Optional[list]


class AlertWorkflowService:
    """
    Service for running the alert workflow that analyzes market events
    and generates investment recommendations.

    """

    def __init__(
        self,
        llm: AzureChatOpenAI,
        vector_store_news_articles,
        vector_store_sec_filings,
        async_db_engine,
    ):
        """
        Initialize the AlertWorkflowService.

        Args:
            llm: The Azure OpenAI chat client for agent interactions.
            vector_store_news_articles: The vector store for news articles.
            vector_store_sec_filings: The vector store for SEC filings.
            async_db_engine: The asynchronous database engine for fetching stock data.
        """
        self.llm = llm
        self.async_db_engine = async_db_engine
        self.session_factory = async_sessionmaker(
            async_db_engine,
            expire_on_commit=False,
        )
        self.vector_store_news_articles = vector_store_news_articles
        self.vector_store_sec_filings = vector_store_sec_filings
        # Per-date locks prevent two concurrent requests for the same date from
        # both launching the full LLM workflow pipeline simultaneously.
        self._date_locks: dict[str, asyncio.Lock] = {}

        # Create agents
        self.planner_agent = get_planner_agent(llm)
        self.news_synthesizer_agent = get_news_synthesizer_agent(
            llm,
            vector_store_news_articles,
        )
        self.risk_insight_agent = get_risk_insight_agent(llm)
        self.stock_analysis_agent = get_stock_analysis_agent(
            llm,
            self.async_db_engine,
        )
        self.sec_filing_analysis_agent = get_sec_filing_analysis_agent(llm)

        self.workflow = self._build_workflow()

        # visualize the graph. This will create a file named workflow_graph.png in the current directory
        # self._save_graph_png()

    # -------------------------------------------------------------------------
    # Public methods
    # -------------------------------------------------------------------------

    async def run(
        self,
        user_id: int,
        async_db_session,
        date: str,
    ) -> dict:
        """
        Execute the alert workflow.

        Args:
            date: The date to trigger the workflow for

        Returns:
            dict: Workflow results including all agent outputs
        """

        # Acquire a per-date lock so that if two requests for the same date
        # arrive simultaneously, the second waits for the first to finish
        # rather than launching duplicate LLM workflows.
        if date not in self._date_locks:
            self._date_locks[date] = asyncio.Lock()
        async with self._date_locks[date]:
            trigger_pairs = await self._get_trigger_pairs_from_db(
                date,
                async_db_session,
            )

            tasks = [
                self._trigger_and_store_workflow_for_client_company_pair(
                    date=date,
                    news=pair["news"],
                    user_id=user_id,
                    client_id=pair["client_id"],
                    company_id=pair["company_id"],
                    trigger_id=pair["trigger_id"],
                    trigger_type=pair["trigger_type"],
                    workflow_type=pair["workflow_type"],
                    supply_chain_context=pair["supply_chain_context"],
                )
                for pair in trigger_pairs
            ]
            await asyncio.gather(*tasks)

        # fetch all alerts
        alert_repository = AlertRepository(async_db_session)
        alerts = await alert_repository.get_all_alerts_in_ui_format(date)

        return [
            {
                "id": alert.id,
                "trend": alert.trend,
                "date": (
                    alert.date.isoformat()
                    if hasattr(alert.date, "isoformat")
                    else alert.date
                ),
                "client_name": alert.client_name,
                "alert_heading_1": alert.alert_heading_1,
                "alert_heading_2": alert.alert_heading_2,
                "companies": build_companies(alert),
            }
            for alert in alerts
        ]

    async def get_alert_details_for_view_summary_endpoint(
        self,
        alert_id: int,
        async_db_session,
    ):
        details, trigger, security = await AlertRepository(
            async_db_session,
        ).get_view_summary_endpoint_details_by_id(alert_id)

        # Lazy-populate trace_graph field on first read .
        if details and details.trace_graph is None and details.phoenix_trace_id:
            await self._fetch_parse_and_store_trace(
                trace_id=details.phoenix_trace_id,
                alert_id=alert_id,
                async_db_session=async_db_session,
            )
            # Refresh the object so trace_graph reflects what was just stored
            await async_db_session.refresh(details)

        return details, trigger, security

    async def get_alerts_for_client(
        self,
        client_id: int,
        user_id: int,
        async_db_session,
    ):
        """Fetch all alerts for a specific client."""
        alerts = await AlertRepository(async_db_session).get_alerts_for_client(
            user_id=user_id,
            client_id=client_id,
        )
        return [
            {
                "id": alert.id,
                "trend": alert.trend,
                "date": (
                    alert.date.isoformat()
                    if hasattr(alert.date, "isoformat")
                    else alert.date
                ),
                "client_name": alert.client_name,
                "alert_heading_1": alert.alert_heading_1,
                "alert_heading_2": alert.alert_heading_2,
                "companies": build_companies(alert),
            }
            for alert in alerts
        ]

    def _agents_graph_from_trace(self, trace_graph) -> dict:
        """
        Extract the agents graph from a stored trace_graph value.
        Returns the graph section of the trace JSON which already carries
        the canonical format (id, label, level, triggered, duration_ms, from/to).
        Falls back to an empty graph if the trace is absent or malformed.
        """
        if not trace_graph:
            # No trace stored yet — return empty graph rather than crashing
            return {"nodes": [], "edges": []}
        try:
            # trace_graph may already be a dict (JSONB) or a raw JSON string
            parsed = (
                trace_graph
                if isinstance(trace_graph, dict)
                else json.loads(trace_graph)
            )
            # The trace JSON wraps the graph under a "graph" key
            return parsed.get("graph", {"nodes": [], "edges": []})
        except (json.JSONDecodeError, Exception):
            # Return empty graph on any parse failure so the caller isn't broken
            return {"nodes": [], "edges": []}

    def _build_agents_graph(self, final_state: dict) -> dict:
        """
        Build an agents-graph dict from the live workflow final_state.
        Matches the canonical trace JSON format (id, label, level, triggered,
        duration_ms, from/to) so the frontend receives a consistent shape
        regardless of whether the data came from a stored trace or a fresh run.
        duration_ms is null here because timing is only available in Phoenix traces.
        """
        nodes = [
            {
                "id": "client_impact_analysis",
                "label": "Client Impact Analysis",
                "level": 1,
                "triggered": True,
            },
            {
                "id": "planning",
                "label": "Planning Agent",
                "level": 2,
                "triggered": bool(final_state.get("planning_agent_result")),
                "duration_ms": None,
            },
            {
                "id": "news_synthesizer",
                "label": "News Analysis Agent",
                "level": 3,
                "triggered": bool(final_state.get("news_synthesizer_agent_result")),
                "duration_ms": None,
            },
            {
                "id": "stock_analysis",
                "label": "Stock Analysis Agent",
                "level": 3,
                "triggered": bool(final_state.get("stock_analysis_agent_result")),
                "duration_ms": None,
            },
            {
                "id": "sec_filing_analysis",
                "label": "SEC Filing Analysis Agent",
                "level": 3,
                "triggered": bool(final_state.get("sec_filing_analysis_agent_result")),
                "duration_ms": None,
            },
            {
                "id": "risk_insight",
                "label": "Risk Insight Agent",
                "level": 4,
                "triggered": bool(final_state.get("risk_insight_agent_result")),
                "duration_ms": None,
            },
        ]
        edges = [
            {"from": "client_impact_analysis", "to": "planning"},
            {"from": "planning", "to": "news_synthesizer"},
            {"from": "planning", "to": "stock_analysis"},
            {"from": "planning", "to": "sec_filing_analysis"},
            {"from": "news_synthesizer", "to": "risk_insight"},
            {"from": "stock_analysis", "to": "risk_insight"},
            {"from": "sec_filing_analysis", "to": "risk_insight"},
        ]
        return {"nodes": nodes, "edges": edges}

    # -------------------------------------------------------------------------
    # Private methods
    # -------------------------------------------------------------------------

    def _build_workflow(self):
        """Build and compile the LangGraph workflow."""

        graph = StateGraph(AlertWorkflowState)

        # Define nodes
        graph.add_node("planning", self._run_planning_agent)
        graph.add_node("news_synthesizer", self._run_news_synthesizer_agent)
        graph.add_node("stock_analysis", self._run_stock_analysis_agent)
        graph.add_node("sec_filing_analysis", self._run_sec_filing_analysis_agent)
        graph.add_node("risk_insight", self._run_risk_insight_agent)

        # Define edges
        graph.add_edge(START, "planning")
        graph.add_conditional_edges(
            "planning",
            self._route_after_planning,
            ["news_synthesizer", "stock_analysis", "sec_filing_analysis"],
        )
        graph.add_edge("news_synthesizer", "risk_insight")
        graph.add_edge("stock_analysis", "risk_insight")
        graph.add_edge("sec_filing_analysis", "risk_insight")
        graph.add_edge("risk_insight", END)

        return graph.compile()

    def _route_after_planning(self, state: AlertWorkflowState) -> list[str]:
        """
        Read the planning agent's decision and return the list of agent node names
        to trigger. Falls back to all three if the list is empty or missing.
        """
        agents = state.get("agents_to_trigger") or []
        valid = {"news_synthesizer", "stock_analysis", "sec_filing_analysis"}
        chosen = [a for a in agents if a in valid]
        if not chosen:
            print("   → Planning returned no valid agents — defaulting to all three")
            return ["news_synthesizer", "stock_analysis", "sec_filing_analysis"]
        print(f"   → Planning agent selected: {chosen}")
        return chosen

    async def _run_planning_agent(self, state: AlertWorkflowState) -> dict:
        """
        Planning agent: Decides which analysis agents to trigger based on
        client preferences, the news trigger, and the company involved.
        """
        print("Planning agent analyzing...")
        _t0 = time.perf_counter()

        preferences_text = (
            "\n".join(f"- {p}" for p in (state.get("client_preferences") or []))
            or "No preferences stored."
        )

        prompt = f"""
        Advisor-stored client preferences:
        {preferences_text}

        Based on the above, decide which of the three analysis agents to trigger:
        "news_synthesizer", "stock_analysis", "sec_filing_analysis".
        """

        response = await self.planner_agent.ainvoke(
            {"messages": [HumanMessage(content=prompt)]},
        )
        result = json.loads(response["messages"][-1].content)
        agents_to_trigger = result.get(
            "agents_to_trigger",
            ["news_synthesizer", "stock_analysis", "sec_filing_analysis"],
        )

        print(f"   → Planning complete  [{time.perf_counter() - _t0:.2f}s]")
        return {"planning_agent_result": result, "agents_to_trigger": agents_to_trigger}

    async def _run_news_synthesizer_agent(self, state: AlertWorkflowState) -> dict:
        """
        News Synthesizer agent: Analyzes and synthesizes relevant financial news.
        """
        print("News Synthesizer agent working...")
        _t0 = time.perf_counter()

        # # Run all RAG questions in parallel
        # news_rag_context = await self._run_parallel_rag(
        #     vector_store=self.vector_store_news_articles,
        #     questions=news_articles_rag_questions,
        #     ticker_id=state.get("ticker_id"),
        #     top_k=settings.TOP_K_NEWS_ARTICLES,
        # )

        # For indirect alerts, retrieve news about the trigger company (the one whose
        # event is causing the downstream impact).
        is_indirect = state.get("workflow_type") == "indirect_chain"
        supply_chain = state.get("supply_chain_context") or {}
        rag_ticker_id = (
            supply_chain.get("trigger_security_id")
            if is_indirect
            else state.get("security_information").get("id")
        )

        prompt = f"""News Snippet: {state.get('news', '')} and
        the ticker id {rag_ticker_id}"""

        # Reset the ContextVar capture list for this invocation so docs from a
        # previous run in the same async task don't bleed in.
        news_retrieved_docs_var.set([])

        response = await self.news_synthesizer_agent.ainvoke(
            {"messages": [HumanMessage(content=prompt)]},
        )
        result = response["messages"][-1].content

        # Read docs captured as a side-effect by news_search_tool.
        retrieved_docs = list(news_retrieved_docs_var.get())
        reference_sentences = self._extract_reference_sentences(result)

        print(
            f"   → News synthesis complete  [{time.perf_counter() - _t0:.2f}s] | {len(retrieved_docs)} chunks captured",
        )
        return {
            "news_synthesizer_agent_result": result,
            "news_retrieved_docs": retrieved_docs,
            "news_reference_sentences": reference_sentences,
        }

    async def _run_stock_analysis_agent(self, state: AlertWorkflowState) -> dict:
        """
        Stock Analysis agent: Analyzes recent stock-price behavior.
        """
        print("Stock Analysis agent analyzing...")
        _t0 = time.perf_counter()

        # For indirect alerts, analyze the trigger company (the one whose event
        # is causing the downstream impact), not the client's held company.
        is_indirect = state.get("workflow_type") == "indirect_chain"
        supply_chain = state.get("supply_chain_context") or {}
        ticker_id = (
            supply_chain.get("trigger_security_id")
            if is_indirect
            else state.get("security_information").get("id")
        )

        prompt = f"""
            Analyze the recent stock-price behavior for ticker id {ticker_id}.\n\n

            STOCK PRICE DATA:\n
            Use your stocks_information_tool with security_id={ticker_id} and the target date as {state.get("date")}
            to fetch the data and analyze the trend, volatility, and volume behavior.\n\n

            Output only the stock analysis paragraph.
        """

        response = await self.stock_analysis_agent.ainvoke(
            {"messages": [HumanMessage(content=prompt)]},
        )
        result = response["messages"][-1].content

        print(f"   → Stock analysis complete  [{time.perf_counter() - _t0:.2f}s]")
        return {"stock_analysis_agent_result": result}

    async def _run_sec_filing_analysis_agent(self, state: AlertWorkflowState) -> dict:
        """
        SEC Filing Analysis agent: Analyzes company fundamentals from SEC reports.
        """
        print("SEC Filing Analysis agent analyzing...")
        _t0 = time.perf_counter()

        # For indirect alerts, retrieve SEC filings about the trigger company.
        is_indirect = state.get("workflow_type") == "indirect_chain"
        supply_chain = state.get("supply_chain_context") or {}
        rag_ticker_id = (
            supply_chain.get("trigger_security_id")
            if is_indirect
            else state.get("security_information").get("id")
        )

        _rag_t0 = time.perf_counter()
        sec_rag_context, sec_retrieved_docs = await run_parallel_rag_with_docs(
            vector_store=self.vector_store_sec_filings,
            questions=sec_file_rag_questions,
            ticker_id=rag_ticker_id,
            top_k=settings.TOP_K_SEC_FILINGS,
        )
        print(
            f"      [SEC RAG retrieval: {time.perf_counter() - _rag_t0:.2f}s] | {len(sec_retrieved_docs)} chunks captured",
        )

        prompt = f"""
            Perform a SEC-filing-based fundamental assessment of ticker id {rag_ticker_id}.\n\n

            Analyze the company's fundamentals, management outlook, and key risk factors.
            Output only the SEC filing analysis paragraph.\n\n

            SEC FILING CONTEXT (pre-retrieved):
            {sec_rag_context}
        """

        response = await self.sec_filing_analysis_agent.ainvoke(
            {"messages": [HumanMessage(content=prompt)]},
        )
        result = response["messages"][-1].content
        reference_sentences = self._extract_reference_sentences(result)

        print(
            f"   → SEC filing analysis complete  [{time.perf_counter() - _t0:.2f}s]",
        )
        return {
            "sec_filing_analysis_agent_result": result,
            "sec_filing_retrieved_docs": sec_retrieved_docs,
            "sec_reference_sentences": reference_sentences,
        }

    @staticmethod
    def _extract_agent_output(result: str) -> str:
        """
        Agents now return a JSON string with an "output" key.
        Extract that value for use in downstream prompts.
        Falls back to the raw string if parsing fails.
        """
        if not result:
            return ""
        try:
            parsed = json.loads(result)
            return parsed.get("output") or result
        except (json.JSONDecodeError, Exception):
            return result

    @staticmethod
    def _extract_reference_sentences(result: str) -> list[str]:
        """
        Extract the reference_sentences array from agent JSON output.
        Returns an empty list on any failure or if the key is absent.
        """
        if not result:
            return []
        try:
            parsed = json.loads(result)
            sentences = parsed.get("reference_sentences", [])
            return sentences if isinstance(sentences, list) else []
        except (json.JSONDecodeError, Exception):
            return []

    @staticmethod
    def _annotate_and_filter_sources(chunk_rows: list) -> list:
        """
        Run sentence matching for each source row at alert creation time.
        Rows where at least one sentence matches get annotated_markdown pre-computed.
        Rows with no matches are dropped so the frontend never sees unhighlightable sources.
        """
        from pathlib import Path

        db_setup_dir = Path(__file__).parent.parent / "db_setup"
        filtered = []

        for row in chunk_rows:
            if not row.source_file_path or not row.reference_sentences:
                continue
            try:
                full_text = (db_setup_dir / row.source_file_path).read_text(
                    encoding="utf-8",
                )
            except FileNotFoundError:
                continue

            annotated = SourceHighlightService._build_annotated_markdown(
                full_text=full_text,
                reference_sentences=row.reference_sentences,
            )

            if "<mark>" in annotated:
                row.annotated_markdown = annotated
                filtered.append(row)

        return filtered

    async def _run_risk_insight_agent(self, state: AlertWorkflowState) -> dict:
        """
        Risk Insight agent: Performs risk analysis based on the client profile and news.
        """
        print("Risk Insight agent analyzing...")
        _t0 = time.perf_counter()

        prompt = f"""
            Date: {state.get('date')}

            Workflow Type: {state.get('workflow_type', 'direct')}

            Trigger Type: {state.get('trigger_type') or 'unknown'}

            Security Information:
            {json.dumps(prompt_security_info(state.get('security_information') or {}), default=str)}

            Client Information:
            {json.dumps(prompt_client_info(state.get('client_information') or {}), default=str)}

            Client Holdings:
            {json.dumps(prompt_holdings(state.get('client_account_holdings') or {}), default=str)}

            Client Investment Preferences (advisor-stored memory):
            {chr(10).join(f"- {p}" for p in (state.get('client_preferences') or [])) or "No preferences stored."}

            News Summary:
            {self._extract_agent_output(state.get('news_synthesizer_agent_result', '')) or 'Not triggered'}

            Stock Analysis:
            {self._extract_agent_output(state.get('stock_analysis_agent_result', '')) or 'Not triggered'}

            SEC Filing Analysis:
            {self._extract_agent_output(state.get('sec_filing_analysis_agent_result', '')) or 'Not triggered'}

            Held Company Next SEC Filing Date:
            {(state.get('security_information') or {}).get('earnings_date') or 'Not available'}

            Supply Chain Context:
            {json.dumps(prompt_supply_chain(state.get('supply_chain_context') or {}), default=str)}

            Based on the above, produce a comprehensive Risk Insight Report for this client and company.
        """

        response = await self.risk_insight_agent.ainvoke(
            {"messages": [HumanMessage(content=prompt)]},
        )
        result = response["messages"][-1].content

        print(f"   → Risk analysis complete  [{time.perf_counter() - _t0:.2f}s]")
        return {"risk_insight_agent_result": result}

    def _save_graph_png(self, path: str = "workflow_graph.png"):
        """Save workflow graph as PNG."""
        png_bytes = self.workflow.get_graph().draw_mermaid_png()
        with open(path, "wb") as f:
            f.write(png_bytes)
        print(f"Graph picture saved to {path}")

    async def _get_trigger_pairs_from_db(
        self,
        date: str,
        async_db_session,
    ) -> list[dict]:
        """
        Return (client_id, company_id, news) triples to run the workflow for,
        driven entirely by the ``workflow_trigger`` table.

        For each trigger on the given date every client who holds the triggered
        security gets an entry.  News-type triggers forward their ``news_text``
        into the workflow; stock-price-drop triggers pass ``None``.

        Args:
            date: Target date in 'YYYY-MM-DD' format.
            async_db_session: Async DB session used for all queries.

        Returns:
            List of dicts with keys ``client_id``, ``company_id``, ``news``, ``trigger_id``,
            ``trigger_type``, ``workflow_type``, and ``supply_chain_context``.
        """
        triggers = await WorkflowTriggerRepository(async_db_session).get_by_date(date)
        client_repository = ClientRepository(async_db_session)
        alert_repository = AlertRepository(async_db_session)

        clients = await client_repository.get_all()
        pairs: list[dict] = []

        for trigger in triggers:
            for client in clients:
                print(f"Trigger Security ID: {trigger.security_id}")

                # Resolve direct vs indirect_chain relationship for this trigger/client pair
                resolved = await self._resolve_workflow_params(
                    trigger_security_id=trigger.security_id,
                    client_id=client.id,
                    async_db_session=async_db_session,
                    trigger_date=trigger.date,
                )

                print(f"Resolved Params: {resolved}")

                # Build a pair entry for each resolved holding relationship found.
                # The pre-flight check is done per (trigger, client, ticker) so that
                # a client holding multiple upstream companies for the same trigger
                # correctly generates one alert per company.
                for param in resolved:
                    ticker = param["ticker"]
                    existing = await alert_repository.get_by_trigger_client_ticker(
                        trigger_id=trigger.id,
                        client_id=client.id,
                        ticker=ticker,
                    )

                    if existing and not existing.is_outdated:
                        print(
                            f"   → Alert already up-to-date for trigger {trigger.id}, "
                            f"client {client.id}, ticker {ticker}. Skipping.",
                        )
                        continue

                    if existing and existing.is_outdated:
                        # Stale alert — delete it so the workflow inserts a fresh row.
                        print(
                            f"   → Alert {existing.id} is stale for trigger {trigger.id}, "
                            f"client {client.id}, ticker {ticker}. Deleting and regenerating.",
                        )
                        await alert_repository.delete(existing.id)

                    pairs.append(
                        {
                            "client_id": client.id,
                            "company_id": param["company_id"],
                            "ticker": ticker,
                            "news": trigger.news_text,
                            "trigger_id": trigger.id,
                            "trigger_type": trigger.trigger_type,
                            "workflow_type": param["workflow_type"],
                            "supply_chain_context": param["supply_chain_context"],
                        },
                    )

        return pairs

    async def _resolve_workflow_params(
        self,
        trigger_security_id: int,
        client_id: int,
        async_db_session,
        trigger_date=None,
    ) -> list[dict]:
        """
        Determine workflow_type and supply_chain_context for a given trigger company / client pair.

        Returns:
            List of param dicts with keys (company_id, ticker, workflow_type, supply_chain_context).
            Empty list means the client has no relevant holding relationship with this trigger.
        """
        # Fetch the upstream supply chain for the trigger company from the graph DB
        graph_repo = GraphRepository(async_db_session)
        upstream_chain = await graph_repo.get_upstream_chain(trigger_security_id)

        # Fetch the client's holdings that were open on the trigger date
        holding_repository = AccountHoldingRepository(async_db_session)
        holdings = await holding_repository.get_by_client_id(
            client_id,
            as_of_date=trigger_date,
        )
        holding_ids = {h.security_id for h in holdings}

        params = []

        if trigger_security_id in holding_ids:
            # Client directly holds the trigger company — standard direct workflow
            trigger_security = await SecurityRepository(async_db_session).get_by_id(
                trigger_security_id,
            )
            params.append(
                {
                    "company_id": trigger_security_id,
                    "ticker": trigger_security.ticker if trigger_security else None,
                    "workflow_type": "direct",
                    "supply_chain_context": None,
                },
            )
        elif upstream_chain:
            # Filter upstream chain nodes to those the client actually holds
            held_chain_nodes = [
                node for node in upstream_chain if node["security_id"] in holding_ids
            ]
            for held_node in held_chain_nodes:
                # Each upstream holding that relates to this trigger is an indirect_chain entry
                params.append(
                    {
                        "company_id": held_node["security_id"],
                        "ticker": held_node["ticker"],
                        "workflow_type": "indirect_chain",
                        "supply_chain_context": {
                            "trigger_security_id": trigger_security_id,
                            "upstream_chain": upstream_chain,
                        },
                    },
                )

        return params

    def _assemble_alert_response(
        self,
        raw_response: str,
        final_state: dict,
        initial_state: dict,
    ) -> tuple[str, dict]:
        """
        Parse the risk insight agent's JSON output and assemble the full alert response dict.

        Args:
            raw_response: The raw string output from the consolidated risk insight agent containing:
                                - risk_analysis: JSON object containing personalized_output and reasoning
                                    - personalized_output: advisor-facing brief with bullet points
                                    - reasoning: concise risk assessment and reasoning paragraph
                - alert_response_formatted: structured alert fields for the platform
            final_state: The completed LangGraph workflow state.
            initial_state: The initial workflow state (used for user/client IDs).

        Returns:
            A tuple of (brief_text, alert_response_formatted) where:
              - brief_text is the human-readable bullet-point brief string (personalized_output).
              - alert_response_formatted is the fully assembled dict ready for DB storage.
        """

        # Strip markdown code fences the LLM sometimes adds despite instructions
        cleaned_response = raw_response.strip()
        if cleaned_response.startswith("```"):
            cleaned_response = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned_response)
            cleaned_response = re.sub(r"\n?```$", "", cleaned_response.strip())

        try:
            parsed = json.loads(sanitize_json_strings(cleaned_response))
        except json.JSONDecodeError:
            parsed = {}
            print(
                f"ERROR: Unable to parse risk insight agent output as JSON. Raw output:\n{cleaned_response}",
            )

        risk_analysis = parsed.get("risk_analysis", {})
        alert_response_formatted = parsed.get("alert_response_formatted", {})

        # Attach agent outputs (not LLM-generated, appended here)
        alert_response_formatted["planning_agent_response"] = final_state.get(
            "planning_agent_result",
            {},
        ).get("output", "")
        alert_response_formatted["news_synthesizer_agent_response"] = final_state.get(
            "news_synthesizer_agent_result",
            "",
        )
        alert_response_formatted["financial_analysis_agent_response"] = (
            "Stock Analysis:\n"
            + final_state.get("stock_analysis_agent_result", "")
            + "\n\nSEC Filing Analysis:\n"
            + final_state.get("sec_filing_analysis_agent_result", "")
        )
        alert_response_formatted["risk_insight_agent_response"] = final_state.get(
            "risk_insight_agent_result",
            "",
        )
        alert_response_formatted["date"] = initial_state.get("date")
        alert_response_formatted["user_id"] = initial_state["user_information"].get(
            "id",
            "",
        )
        alert_response_formatted["client_id"] = initial_state["client_information"].get(
            "id",
            "",
        )
        client_info = initial_state.get("client_information") or {}
        profile = client_info.get("profile") or {}
        risk_pref = profile.get("risk_preference")
        if isinstance(risk_pref, str):
            risk_pref = risk_pref.strip() or None
        alert_response_formatted["client_risk_profile"] = risk_pref

        # Normalise empty strings to None
        for key, value in alert_response_formatted.items():
            if value == "":
                alert_response_formatted[key] = None

        return risk_analysis, alert_response_formatted

    async def _run_workflow_isolated(self, initial_state: dict) -> tuple[dict, str]:
        """
        Run the workflow with an isolated Phoenix trace.

        Resets two contextvars before invoking so the alert spans never
        appear inside the outer chat trace:
        - var_child_runnable_config = None  →  clears LangChain's parent_run_id
        - blank OTel context              →  gives the "alert" span a new trace_id
        """

        _tracer = otel_trace.get_tracer("alert_workflow")
        _blank_ctx = otel_context.Context()
        _otel_token = otel_context.attach(_blank_ctx)
        _lc_token = var_child_runnable_config.set(None)
        try:
            with _tracer.start_as_current_span("alert") as _wf_span:
                final_state = await self.workflow.ainvoke(initial_state)
                _span_ctx = _wf_span.get_span_context()
                phoenix_trace_id = format(_span_ctx.trace_id, "032x")
        finally:
            var_child_runnable_config.reset(_lc_token)
            otel_context.detach(_otel_token)
        return final_state, phoenix_trace_id

    async def _trigger_and_store_workflow_for_client_company_pair(
        self,
        user_id: int,
        client_id: int,
        company_id: int,
        trigger_id: int,
        trigger_type: Optional[str] = None,
        date: Optional[date] = None,
        news: Optional[str] = None,
        workflow_type: Optional[str] = "direct",
        supply_chain_context: Optional[dict] = None,
    ) -> dict:

        print("=" * 60)
        print(" ALERT WORKFLOW STARTED")
        print("=" * 60)
        print(f"Date: {date}")
        print(f"News: {news}")
        print("-" * 60)

        async with self.session_factory() as async_db_session:
            client_respository = ClientRepository(async_db_session)
            security_repository = SecurityRepository(async_db_session)
            user_repository = UserRepository(async_db_session)

            # Fetch advisor-client preferences from mem0 memory
            _memory = get_mem0_memory()
            client_preferences = await fetch_preferences(
                memory=_memory,
                advisor_id=user_id,
                client_id=client_id,
            )

            reference_date = (
                datetime.strptime(date, "%Y-%m-%d").date()
                if isinstance(date, str)
                else date
            )
            client_information = await AccountHoldingRepository(
                async_db_session,
            ).enrich_client_information_with_metrics(
                client_information=await client_respository.get_client_json_by_id(
                    client_id,
                ),
                company_id=company_id,
                reference_date=reference_date,
            )

            initial_state = {
                "date": date,
                "news": news,
                "user_information": await user_repository.get_user_json_by_id(user_id),
                "security_information": await security_repository.get_security_json_by_id(
                    company_id,
                ),
                "client_account_holdings": await AccountHoldingRepository(
                    async_db_session,
                ).get_holding_for_client_and_security(
                    client_id=client_id,
                    security_id=company_id,
                    as_of_date=reference_date,
                ),
                "client_information": client_information,
                "client_preferences": client_preferences,
                "workflow_type": workflow_type,
                "supply_chain_context": supply_chain_context,
                "trigger_type": trigger_type,
                "planning_agent_result": {},
                "agents_to_trigger": [],
                "news_synthesizer_agent_result": "",
                "risk_insight_agent_result": "",
                "stock_analysis_agent_result": "",
                "sec_filing_analysis_agent_result": "",
            }

            final_state, phoenix_trace_id = await self._run_workflow_isolated(
                initial_state,
            )

            raw_response = final_state.get("risk_insight_agent_result", "")
            risk_analysis, formatted_alert_response = self._assemble_alert_response(
                raw_response,
                final_state,
                initial_state,
            )
            # Stamp whether interactive advisor preferences were active at generation time.
            # Reads the flag set by save_client_preference / clear_client_preferences so that
            # seeded preferences never trigger a True value here.
            formatted_alert_response["mem0_used"] = bool(
                (client_information.get("profile") or {}).get(
                    "has_interactive_preferences",
                    False,
                ),
            )
            formatted_alert_response["ticker"] = initial_state.get(
                "security_information",
                {},
            ).get("ticker")
            formatted_alert_response["trigger_id"] = trigger_id
            formatted_alert_response["phoenix_trace_id"] = phoenix_trace_id
            formatted_alert_response["supply_chain_path"] = (
                supply_chain_context.get("upstream_chain", [{}])[-1].get(
                    "chain_names",
                )
                if supply_chain_context
                else None
            )
            alert_id = await self._save_alert_to_db(
                formatted_alert_response,
                async_db_session,
                final_state=final_state,
            )

            return {
                "planning_analysis": final_state["planning_agent_result"],
                "news_analysis": final_state["news_synthesizer_agent_result"],
                "stock_analysis": final_state["stock_analysis_agent_result"],
                "sec_filing_analysis": final_state["sec_filing_analysis_agent_result"],
                "financial_analysis": (
                    "Stock Analysis:\n"
                    + final_state["stock_analysis_agent_result"]
                    + "\n\nSEC Filing Analysis:\n"
                    + final_state["sec_filing_analysis_agent_result"]
                ),
                "risk_assessment": risk_analysis,
                "alert_id": alert_id,
                "alert_trend": formatted_alert_response.get("trend"),
                "alert_client_name": formatted_alert_response.get("client_name"),
                "alert_heading_1": formatted_alert_response.get("alert_heading_1"),
                "alert_heading_2": formatted_alert_response.get("alert_heading_2"),
                "alert_date": formatted_alert_response.get("date"),
            }

    async def _save_alert_to_db(
        self,
        alert_data: dict,
        async_db_session: AsyncSession,
        final_state: Optional[dict] = None,
    ):
        """Insert a new alert row and its source chunks in a single transaction."""
        chunk_repo = AlertSourceRepository(async_db_session)

        # Build source rows from retrieved docs (may be empty if no RAG agents ran)
        chunk_rows = AlertSourceRepository.build_from_docs(
            news_docs=final_state.get("news_retrieved_docs") if final_state else [],
            sec_docs=(
                final_state.get("sec_filing_retrieved_docs") if final_state else []
            ),
            news_reference_sentences=(
                final_state.get("news_reference_sentences") if final_state else []
            ),
            sec_reference_sentences=(
                final_state.get("sec_reference_sentences") if final_state else []
            ),
        )

        # Run matching now — only keep sources that have at least one highlighted sentence
        chunk_rows = self._annotate_and_filter_sources(chunk_rows)

        def _to_numeric(value):
            """Coerce a value to a decimal-compatible type, or None if not parseable."""
            if value is None:
                return None
            try:
                return float(value)
            except (TypeError, ValueError):
                return None

        # Guard against a second concurrent writer that beat us to the insert. We re-query and return the existing alert's id rather than crashing.
        existing_on_conflict = await AlertRepository(
            async_db_session,
        ).get_by_trigger_client_ticker(
            trigger_id=alert_data.get("trigger_id"),
            client_id=int(alert_data.get("client_id")),
            ticker=alert_data.get("ticker"),
        )
        if existing_on_conflict is not None:
            print(
                f"   [race] Alert already exists for trigger {alert_data.get('trigger_id')}, "
                f"client {alert_data.get('client_id')}, ticker {alert_data.get('ticker')} "
                f"— skipping duplicate insert",
            )
            return existing_on_conflict.id

        alert = Alert(
            trigger_id=alert_data.get("trigger_id"),
            ticker=alert_data.get("ticker"),
            client_id=int(alert_data.get("client_id")),
            user_id=int(alert_data.get("user_id")),
            date=datetime.strptime(alert_data.get("date"), "%Y-%m-%d").date(),
            trend=alert_data.get("trend"),
            client_name=alert_data.get("client_name"),
            client_risk_profile=alert_data.get("client_risk_profile"),
            alert_heading_1=alert_data.get("alert_heading_1"),
            alert_heading_2=alert_data.get("alert_heading_2"),
            client_net_worth=_to_numeric(alert_data.get("client_net_worth")),
            client_portfolio_value=_to_numeric(
                alert_data.get("client_portfolio_value"),
            ),
            client_growth=alert_data.get("client_growth"),
            key_insight=alert_data.get("key_insight"),
            reasoning_behind_advice=json.dumps(
                alert_data.get("reasoning_behind_advice") or [],
            ),
            advice_headline=alert_data.get("advice_headline"),
            advice_detail=alert_data.get("advice_detail"),
            alert_drivers=alert_data.get("alert_drivers") or [],
            impact_summary=alert_data.get("impact_summary"),
            sources=[],
            planning_agent_response=alert_data.get("planning_agent_response"),
            news_synthesizer_agent_response=alert_data.get(
                "news_synthesizer_agent_response",
            ),
            financial_analysis_agent_response=alert_data.get(
                "financial_analysis_agent_response",
            ),
            risk_insight_agent_response=alert_data.get("risk_insight_agent_response"),
            phoenix_trace_id=alert_data.get("phoenix_trace_id"),
            supply_chain_path=alert_data.get("supply_chain_path"),
            mem0_used=alert_data.get("mem0_used", False),
            is_outdated=False,
        )

        # insert alert to db
        try:
            async_db_session.add(alert)
            await async_db_session.flush()  # populates alert.id without closing the transaction

            # Insert chunk rows now that alert.id is known, then update sources JSONB
            if chunk_rows:
                for row in chunk_rows:
                    row.alert_id = alert.id
                await chunk_repo.bulk_insert(chunk_rows)
                alert.sources = [
                    {
                        "id": row.id,
                        "title": row.source_title,
                        "source_type": row.source_type,
                        "reporting_company": row.reporting_company,
                    }
                    for row in chunk_rows
                ]

            await async_db_session.commit()
        except IntegrityError:
            # Rollback before any further queries on this session.
            await async_db_session.rollback()

            # Only treat this as a duplicate-alert race if a row with the same
            # (trigger_id, client_id, ticker) actually exists. If not, the
            # IntegrityError came from a different constraint (e.g. alert_source)
            # and must be re-raised so it isn't silently swallowed.
            async with self.session_factory() as recovery_session:
                existing = await AlertRepository(
                    recovery_session,
                ).get_by_trigger_client_ticker(
                    trigger_id=alert_data.get("trigger_id"),
                    client_id=int(alert_data.get("client_id")),
                    ticker=alert_data.get("ticker"),
                )

            if existing is not None:
                print(
                    f"   [race] Duplicate alert insert blocked by DB constraint for trigger "
                    f"{alert_data.get('trigger_id')}, client {alert_data.get('client_id')}, "
                    f"ticker {alert_data.get('ticker')} — returning existing id {existing.id}",
                )
                return existing.id

            print(
                f"   [error] IntegrityError on alert save for trigger "
                f"{alert_data.get('trigger_id')}, client {alert_data.get('client_id')}, "
                f"ticker {alert_data.get('ticker')} — not a duplicate alert. Re-raising.",
            )
            raise
        return alert.id

    async def _fetch_parse_and_store_trace(
        self,
        trace_id: str,
        alert_id: int,
        async_db_session: AsyncSession,
    ) -> None:
        """
        Fetch all spans for the given trace from Phoenix, parse them with
        TraceParser, and store the result in the alert's ``trace_graph`` column.

        Args:
            trace_id: The 32-char hex trace ID stored in phoenix_trace_id.
            alert_id: The database ID of the Alert row to update.
            async_db_session: Active async DB session.
        """
        try:
            phoenix_client = PhoenixAsyncClient(base_url=settings.PHOENIX_BASE_URL)
            spans = await phoenix_client.spans.get_spans(
                project_identifier=settings.PHOENIX_PROJECT_NAME,
                trace_ids=[trace_id],
            )
            df = pd.DataFrame(spans)

            alert = await async_db_session.get(Alert, alert_id)
            if alert:
                trace_graph = AlertTraceParser(df).parse()
                alert.trace_graph = trace_graph
                await async_db_session.commit()
                print(
                    f"   → trace_graph stored for alert {alert_id} ({len(spans)} spans)",
                )
        except Exception as exc:
            print(f"   [WARN] Could not fetch/store trace graph: {exc}")
