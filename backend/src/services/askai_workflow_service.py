"""
AskAI Workflow Service.

Implements a LangGraph workflow for the AskAI chat feature that routes
market-analysis queries (news / stock / SEC) through a multi-agent pipeline:

    planning → [news_synthesizer ‖ stock_analysis ‖ sec_filing_analysis] → END

The planner (with a search_companies DB tool) interprets the advisor's raw
query, resolves company names to tickers, and decides which analysis types to
run.  Each triggered agent node then runs all resolved companies in parallel
(asyncio.gather) within the single workflow invocation, with each per-company
invocation wrapped in its own isolated OTel span so Phoenix captures a
dedicated trace.  Trace IDs are persisted to the askai_chat_analysis_cache
table alongside the result text for later graph enrichment.

Session-level caching is preserved: already-analyzed (company, type) pairs
are skipped and their stored result reused.
"""

from __future__ import annotations

import asyncio
import json
import time
import uuid
from datetime import date as date_type
from typing import Optional, TypedDict

import opentelemetry.context as otel_context
import opentelemetry.trace as otel_trace
from langchain_core.messages import HumanMessage
from langchain_core.runnables.config import var_child_runnable_config
from langchain_openai import AzureChatOpenAI
from langgraph.graph import END, START, StateGraph
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker
from src.agents import (
    get_news_synthesizer_agent,
    get_sec_filing_analysis_agent,
    get_stock_analysis_agent,
)
from src.agents.askai_planner_agent import get_askai_planner_agent
from src.agents.news_synthesizer_agent import news_retrieved_docs_var
from src.configs.config import settings
from src.configs.rag_questions import (
    news_analysis_rag_questions,
    sec_file_rag_questions,
)
from src.models.securities import Security
from src.repositories.askai_chat_analysis_cache import AskAIChatAnalysisCacheRepository
from src.repositories.securities import SecurityRepository
from src.utils.utils import run_parallel_rag_with_docs

# ---------------------------------------------------------------------------
# Workflow state
# ---------------------------------------------------------------------------


class AskAIWorkflowState(TypedDict):
    """State definition for the AskAI analysis workflow."""

    # Input
    query: str
    date: str
    session_id: str  # UUID string — used as cache key
    turn_id: int  # monotonically increasing per workflow invocation in this session

    # Resolved by planning node
    companies: list[dict]  # [{company_id, ticker, name}, ...]
    analysis_types: list[str]  # subset of ["news", "stock", "sec"]
    planner_result: dict  # raw JSON from planner agent

    # Agent outputs — keyed by ticker symbol
    news_results: dict  # ticker → result_text
    stock_results: dict  # ticker → result_text
    sec_results: dict  # ticker → result_text
    news_retrieved_docs: dict  # ticker → list[doc]


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class AskAIWorkflowService:
    """
    Runs the AskAI multi-agent analysis workflow.

    One instance lives for the lifetime of the application (created in
    lifespan_manager).  Individual runs are stateless — all per-request
    context is carried in the workflow state dict.
    """

    def __init__(
        self,
        llm: AzureChatOpenAI,
        vector_store_news_articles,
        vector_store_sec_filings,
        async_db_engine,
    ):
        self.llm = llm
        self.async_db_engine = async_db_engine
        self.session_factory = async_sessionmaker(
            async_db_engine,
            expire_on_commit=False,
        )
        self.vector_store_news_articles = vector_store_news_articles
        self.vector_store_sec_filings = vector_store_sec_filings

        # Agents — created once and reused across requests
        self.planner_agent = get_askai_planner_agent(llm, self.session_factory)
        self.news_synthesizer_agent = get_news_synthesizer_agent(
            llm,
            vector_store_news_articles,
        )
        self.stock_analysis_agent = get_stock_analysis_agent(llm, async_db_engine)
        self.sec_filing_analysis_agent = get_sec_filing_analysis_agent(llm)

        self.workflow = self._build_workflow()

    # -------------------------------------------------------------------------
    # Public API
    # -------------------------------------------------------------------------

    async def run_analysis(
        self,
        query: str,
        session_id: str,
        turn_id: int,
        date: Optional[str] = None,
    ) -> dict:
        """
        Run the AskAI analysis workflow for an advisor's query.

        Args:
            query:      Raw natural-language question from the advisor.
            session_id: UUID string of the ChatSession row — used as cache key.
            turn_id:    Monotonically increasing integer for this invocation,
                        generated by the stream endpoint before calling the tool.
            date:       Target date for stock analysis (YYYY-MM-DD).
                        Defaults to today.
        """
        analysis_date = date or date_type.today().isoformat()

        initial_state: AskAIWorkflowState = {
            "query": query,
            "date": analysis_date,
            "session_id": session_id,
            "turn_id": turn_id,
            "companies": [],
            "analysis_types": [],
            "planner_result": {},
            "news_results": {},
            "stock_results": {},
            "sec_results": {},
            "news_retrieved_docs": {},
        }

        final_state = await self.workflow.ainvoke(initial_state)
        return self._assemble_output(final_state)

    # -------------------------------------------------------------------------
    # Workflow construction
    # -------------------------------------------------------------------------

    def _build_workflow(self):
        graph = StateGraph(AskAIWorkflowState)

        graph.add_node("planning", self._run_planning_node)
        graph.add_node("news_synthesizer", self._run_news_synthesizer_node)
        graph.add_node("stock_analysis", self._run_stock_analysis_node)
        graph.add_node("sec_filing_analysis", self._run_sec_filing_analysis_node)

        graph.add_edge(START, "planning")
        graph.add_conditional_edges(
            "planning",
            self._route_after_planning,
            ["news_synthesizer", "stock_analysis", "sec_filing_analysis"],
        )
        graph.add_edge("news_synthesizer", END)
        graph.add_edge("stock_analysis", END)
        graph.add_edge("sec_filing_analysis", END)

        return graph.compile()

    def _route_after_planning(self, state: AskAIWorkflowState) -> list[str]:
        """Fan out to the agents chosen by the planner."""
        valid = {"news_synthesizer", "stock_analysis", "sec_filing_analysis"}
        _short_to_node = {
            "news": "news_synthesizer",
            "stock": "stock_analysis",
            "sec": "sec_filing_analysis",
        }

        chosen = [a for a in state.get("analysis_types", []) if a in valid]

        if not chosen:
            # Empty analysis_types has two distinct causes:
            #   1. All planner-chosen types were fully cached — _check_and_preload_cache
            #      filtered them all out. We must route to only those nodes so that
            #      nodes not requested by the planner never run.
            #   2. The planner returned unparseable output — genuine fallback needed.
            # Distinguish by checking the planner's original raw decision.
            raw_planner_types = state.get("planner_result", {}).get(
                "analysis_types",
                [],
            )
            original = [
                _short_to_node.get(t, t)
                for t in raw_planner_types
                if _short_to_node.get(t, t) in valid
            ]
            if original:
                # Case 1 — all results are cached; route only to the originally-chosen
                # nodes so they serve from pre-loaded state without running fresh agents.
                print(f"   [AskAI] All types fully cached — routing to: {original}")
                chosen = original
            else:
                # Case 2 — planner returned nothing parseable; run all three safely.
                print(
                    "   [AskAI] Planner returned no valid agents — defaulting to all three",
                )
                chosen = ["news_synthesizer", "stock_analysis", "sec_filing_analysis"]

        print(f"   [AskAI] Routing to: {chosen}")
        return chosen

    # -------------------------------------------------------------------------
    # Planning node
    # -------------------------------------------------------------------------

    async def _run_planning_node(self, state: AskAIWorkflowState) -> dict:
        """
        Invoke the AskAI planner agent.

        The planner receives the raw advisor query, optionally calls
        search_companies to resolve names → tickers, and returns a JSON plan
        with company_ids, tickers, and analysis_types.

        If the planner returns empty company lists, all companies in the DB
        are fetched and used.
        """
        print("[AskAI] Planning agent analyzing query...")
        _t0 = time.perf_counter()

        _tracer = otel_trace.get_tracer("askai_workflow")
        _blank_ctx = otel_context.Context()
        _otel_tok = otel_context.attach(_blank_ctx)
        _lc_tok = var_child_runnable_config.set(None)
        try:
            with _tracer.start_as_current_span("planning") as _span:
                response = await self.planner_agent.ainvoke(
                    {"messages": [HumanMessage(content=state["query"])]},
                )
                planner_trace_id = format(_span.get_span_context().trace_id, "032x")
        finally:
            var_child_runnable_config.reset(_lc_tok)
            otel_context.detach(_otel_tok)

        raw = response["messages"][-1].content

        try:
            result = json.loads(raw)
        except (json.JSONDecodeError, Exception):
            print(f"   [AskAI] Planner output parse error — raw: {raw[:200]}")
            result = {
                "company_ids": [],
                "tickers": [],
                "analysis_types": ["news", "stock", "sec"],
            }

        analysis_types = result.get("analysis_types") or [
            "news_synthesizer",
            "stock_analysis",
            "sec_filing_analysis",
        ]

        # Normalise: accept both short names ("news") and full node names ("news_synthesizer")
        _short_to_node = {
            "news": "news_synthesizer",
            "stock": "stock_analysis",
            "sec": "sec_filing_analysis",
        }
        analysis_types = [_short_to_node.get(t, t) for t in analysis_types]
        company_ids: list[int] = result.get("company_ids") or []
        tickers: list[str] = result.get("tickers") or []

        # Build companies list from planner output or fall back to all-companies
        if company_ids and tickers:
            companies = [
                {"company_id": cid, "ticker": t, "name": ""}
                for cid, t in zip(company_ids, tickers)
            ]
            # Enrich with DB names in one query
            companies = await self._enrich_company_names(companies)
        else:
            # Broad query — analyze all securities in the DB
            companies = await self._fetch_all_companies()

        # Check cache coverage — skip agent nodes that are fully satisfied by cache
        session_id_uuid = uuid.UUID(state["session_id"])
        types_to_run, pre_news, pre_stock, pre_sec = (
            await self._check_and_preload_cache(
                session_id_uuid,
                companies,
                analysis_types,
            )
        )

        # Store planner trace ID as a sentinel cache row so the trace parser
        # can fetch planning node I/O and duration from Phoenix.
        async with self.session_factory() as db:
            repo = AskAIChatAnalysisCacheRepository(db)
            await repo.set(
                session_id=session_id_uuid,
                company_id=0,
                analysis_type="planning",
                result_text="",
                phoenix_trace_id=planner_trace_id,
                turn_id=state["turn_id"],
            )

        print(
            f"   [AskAI] Plan: {len(companies)} companies, "
            f"types={analysis_types}, running={types_to_run}  [{time.perf_counter() - _t0:.2f}s]",
        )
        return {
            "planner_result": result,
            "companies": companies,
            "analysis_types": types_to_run,
            "news_results": pre_news,
            "stock_results": pre_stock,
            "sec_results": pre_sec,
        }

    # -------------------------------------------------------------------------
    # Agent nodes — each loops over all companies in parallel
    # -------------------------------------------------------------------------

    async def _run_news_synthesizer_node(self, state: AskAIWorkflowState) -> dict:
        """Run the news synthesizer for all companies in parallel."""
        print("[AskAI] News Synthesizer node starting...")
        _t0 = time.perf_counter()

        session_id = uuid.UUID(state["session_id"])
        companies = state["companies"]

        cached, pending = await self._split_cached(session_id, companies, "news")

        async def _run_one(company: dict):
            result_text, retrieved_docs, trace_id = await self._run_news_isolated(
                company,
            )
            return company, result_text, retrieved_docs, trace_id

        fresh = await asyncio.gather(*[_run_one(c) for c in pending])

        async with self.session_factory() as db:
            repo = AskAIChatAnalysisCacheRepository(db)
            for company, result_text, retrieved_docs, trace_id in fresh:
                await repo.set(
                    session_id=session_id,
                    company_id=company["company_id"],
                    analysis_type="news",
                    result_text=result_text,
                    retrieved_docs=(
                        [
                            {"page_content": d.page_content, "metadata": d.metadata}
                            for d in retrieved_docs
                        ]
                        if retrieved_docs
                        else None
                    ),
                    phoenix_trace_id=trace_id,
                    turn_id=state["turn_id"],
                )

        news_results = dict(cached)
        for company, result_text, _, _ in fresh:
            news_results[company["ticker"]] = result_text

        print(
            f"   [AskAI] News complete — {len(fresh)} fresh, "
            f"{len(cached)} cached  [{time.perf_counter() - _t0:.2f}s]",
        )
        return {"news_results": news_results}

    async def _run_stock_analysis_node(self, state: AskAIWorkflowState) -> dict:
        """Run the stock analysis agent for all companies in parallel."""
        print("[AskAI] Stock Analysis node starting...")
        _t0 = time.perf_counter()

        session_id = uuid.UUID(state["session_id"])
        companies = state["companies"]
        date = state["date"]

        cached, pending = await self._split_cached(session_id, companies, "stock")

        async def _run_one(company: dict):
            result_text, trace_id = await self._run_stock_isolated(company, date)
            return company, result_text, trace_id

        fresh = await asyncio.gather(*[_run_one(c) for c in pending])

        async with self.session_factory() as db:
            repo = AskAIChatAnalysisCacheRepository(db)
            for company, result_text, trace_id in fresh:
                await repo.set(
                    session_id=session_id,
                    company_id=company["company_id"],
                    analysis_type="stock",
                    result_text=result_text,
                    phoenix_trace_id=trace_id,
                    turn_id=state["turn_id"],
                )

        stock_results = dict(cached)
        for company, result_text, _ in fresh:
            stock_results[company["ticker"]] = result_text

        print(
            f"   [AskAI] Stock complete — {len(fresh)} fresh, "
            f"{len(cached)} cached  [{time.perf_counter() - _t0:.2f}s]",
        )
        return {"stock_results": stock_results}

    async def _run_sec_filing_analysis_node(self, state: AskAIWorkflowState) -> dict:
        """Run the SEC filing analysis agent for all companies in parallel."""
        print("[AskAI] SEC Filing Analysis node starting...")
        _t0 = time.perf_counter()

        session_id = uuid.UUID(state["session_id"])
        companies = state["companies"]

        cached, pending = await self._split_cached(session_id, companies, "sec")

        async def _run_one(company: dict):
            result_text, trace_id = await self._run_sec_isolated(company)
            return company, result_text, trace_id

        fresh = await asyncio.gather(*[_run_one(c) for c in pending])

        async with self.session_factory() as db:
            repo = AskAIChatAnalysisCacheRepository(db)
            for company, result_text, trace_id in fresh:
                await repo.set(
                    session_id=session_id,
                    company_id=company["company_id"],
                    analysis_type="sec",
                    result_text=result_text,
                    phoenix_trace_id=trace_id,
                    turn_id=state["turn_id"],
                )

        sec_results = dict(cached)
        for company, result_text, _ in fresh:
            sec_results[company["ticker"]] = result_text

        print(
            f"   [AskAI] SEC complete — {len(fresh)} fresh, "
            f"{len(cached)} cached  [{time.perf_counter() - _t0:.2f}s]",
        )
        return {"sec_results": sec_results}

    # -------------------------------------------------------------------------
    # Isolated per-company runners (each gets its own Phoenix trace)
    # -------------------------------------------------------------------------

    async def _run_news_isolated(
        self,
        company: dict,
    ) -> tuple[str, list, str]:
        """Run news synthesis for one company inside an isolated OTel trace."""
        _tracer = otel_trace.get_tracer("askai_workflow")
        _blank_ctx = otel_context.Context()
        _otel_tok = otel_context.attach(_blank_ctx)
        _lc_tok = var_child_runnable_config.set(None)
        try:
            with _tracer.start_as_current_span("news_synthesizer") as _span:
                result_text, retrieved_docs = await self._invoke_news_agent(company)
                trace_id = format(_span.get_span_context().trace_id, "032x")
        finally:
            var_child_runnable_config.reset(_lc_tok)
            otel_context.detach(_otel_tok)
        return result_text, retrieved_docs, trace_id

    async def _run_stock_isolated(
        self,
        company: dict,
        date: str,
    ) -> tuple[str, str]:
        """Run stock analysis for one company inside an isolated OTel trace."""
        _tracer = otel_trace.get_tracer("askai_workflow")
        _blank_ctx = otel_context.Context()
        _otel_tok = otel_context.attach(_blank_ctx)
        _lc_tok = var_child_runnable_config.set(None)
        try:
            with _tracer.start_as_current_span("stock_analysis") as _span:
                result_text = await self._invoke_stock_agent(company, date)
                trace_id = format(_span.get_span_context().trace_id, "032x")
        finally:
            var_child_runnable_config.reset(_lc_tok)
            otel_context.detach(_otel_tok)
        return result_text, trace_id

    async def _run_sec_isolated(
        self,
        company: dict,
    ) -> tuple[str, str]:
        """Run SEC filing analysis for one company inside an isolated OTel trace."""
        _tracer = otel_trace.get_tracer("askai_workflow")
        _blank_ctx = otel_context.Context()
        _otel_tok = otel_context.attach(_blank_ctx)
        _lc_tok = var_child_runnable_config.set(None)
        try:
            with _tracer.start_as_current_span("sec_filing_analysis") as _span:
                result_text = await self._invoke_sec_agent(company)
                trace_id = format(_span.get_span_context().trace_id, "032x")
        finally:
            var_child_runnable_config.reset(_lc_tok)
            otel_context.detach(_otel_tok)
        return result_text, trace_id

    # -------------------------------------------------------------------------
    # Agent invocation helpers
    # -------------------------------------------------------------------------

    async def _invoke_news_agent(self, company: dict) -> tuple[str, list]:
        """Invoke the news synthesizer for a single company using decomposed RAG."""
        ticker = company["ticker"]
        company_id = company["company_id"]
        name = company.get("name") or ticker

        formatted_questions = [
            q.format(ticker=ticker) for q in news_analysis_rag_questions
        ]
        rag_context, retrieved_docs = await run_parallel_rag_with_docs(
            vector_store=self.vector_store_news_articles,
            questions=formatted_questions,
            ticker_id=company_id,
            top_k=settings.TOP_K_NEWS_ARTICLES,
        )

        prompt = (
            f"Synthesize the recent news situation for {name} (ticker: {ticker}).\n\n"
            f"Retrieved news context:\n{rag_context}\n\n"
            f"Summarize the overall news sentiment, key recent events, and what they "
            f"mean for the company's near-term outlook. Be concise and factual."
        )

        news_retrieved_docs_var.set([])
        response = await self.news_synthesizer_agent.ainvoke(
            {"messages": [HumanMessage(content=prompt)]},
        )
        result = response["messages"][-1].content
        return result, retrieved_docs

    async def _invoke_stock_agent(self, company: dict, date: str) -> str:
        """Invoke the stock analysis agent for a single company."""
        ticker = company["ticker"]
        company_id = company["company_id"]

        prompt = (
            f"Analyze the recent stock-price behavior for {ticker} "
            f"(security_id={company_id}).\n\n"
            f"Use your stocks_information_tool with security_id={company_id} and "
            f"target_date={date} to fetch the data, then analyze the trend, "
            f"volatility, and volume behavior. Output only the stock analysis paragraph."
        )

        response = await self.stock_analysis_agent.ainvoke(
            {"messages": [HumanMessage(content=prompt)]},
        )
        return response["messages"][-1].content

    async def _invoke_sec_agent(self, company: dict) -> str:
        """Invoke the SEC filing analysis agent for a single company."""
        ticker = company["ticker"]
        company_id = company["company_id"]
        name = company.get("name") or ticker

        sec_rag_context, _ = await run_parallel_rag_with_docs(
            vector_store=self.vector_store_sec_filings,
            questions=sec_file_rag_questions,
            ticker_id=company_id,
            top_k=settings.TOP_K_SEC_FILINGS,
        )

        prompt = (
            f"Perform a SEC-filing-based fundamental assessment of "
            f"{name} (ticker: {ticker}, security_id={company_id}).\n\n"
            f"SEC FILING CONTEXT (pre-retrieved):\n{sec_rag_context}\n\n"
            f"Analyze the company's fundamentals, management outlook, and key risk "
            f"factors. Output only the SEC filing analysis paragraph."
        )

        response = await self.sec_filing_analysis_agent.ainvoke(
            {"messages": [HumanMessage(content=prompt)]},
        )
        return response["messages"][-1].content

    # -------------------------------------------------------------------------
    # Cache helpers
    # -------------------------------------------------------------------------

    async def _check_and_preload_cache(
        self,
        session_id: uuid.UUID,
        companies: list[dict],
        analysis_types: list[str],
    ) -> tuple[list[str], dict, dict, dict]:
        """
        Check which analysis types are fully covered by existing cache entries.

        Types where ALL companies are already cached are removed from the run
        list and their results pre-loaded so the corresponding agent nodes are
        never dispatched.  Partially-cached types remain in types_to_run —
        the per-node _split_cached handles the per-company skip.

        Args:
            session_id:     Current chat session UUID.
            companies:      Resolved companies [{company_id, ticker, name}].
            analysis_types: Full node-name list from the planner.

        Returns:
            (types_to_run, pre_news, pre_stock, pre_sec)
        """
        _node_to_short = {
            "news_synthesizer": "news",
            "stock_analysis": "stock",
            "sec_filing_analysis": "sec",
        }

        # Single bulk DB read for the whole session
        async with self.session_factory() as db:
            repo = AskAIChatAnalysisCacheRepository(db)
            all_entries = await repo.get_all_for_session(session_id)

        cache_map: dict[tuple[int, str], str] = {
            (e.company_id, e.analysis_type): e.result_text for e in all_entries
        }

        types_to_run: list[str] = []
        pre_news: dict[str, str] = {}
        pre_stock: dict[str, str] = {}
        pre_sec: dict[str, str] = {}

        for analysis_type in analysis_types:
            short = _node_to_short.get(analysis_type, analysis_type)
            fully_cached = bool(companies) and all(
                (c["company_id"], short) in cache_map for c in companies
            )
            if fully_cached:
                results = {
                    c["ticker"]: cache_map[(c["company_id"], short)] for c in companies
                }
                print(
                    f"   [AskAI] Fully cached — skipping {analysis_type} node "
                    f"({len(companies)} companies)",
                )
                if analysis_type == "news_synthesizer":
                    pre_news = results
                elif analysis_type == "stock_analysis":
                    pre_stock = results
                elif analysis_type == "sec_filing_analysis":
                    pre_sec = results
            else:
                types_to_run.append(analysis_type)

        return types_to_run, pre_news, pre_stock, pre_sec

    async def _split_cached(
        self,
        session_id: uuid.UUID,
        companies: list[dict],
        analysis_type: str,
    ) -> tuple[dict, list[dict]]:
        """
        Split companies into already-cached (ticker → result_text) and pending.

        Returns:
            (cached_dict, pending_companies)
        """
        cached: dict[str, str] = {}
        pending: list[dict] = []

        async with self.session_factory() as db:
            repo = AskAIChatAnalysisCacheRepository(db)
            for company in companies:
                entry = await repo.get(session_id, company["company_id"], analysis_type)
                if entry:
                    print(
                        f"   [AskAI] cache HIT  {company['ticker']} / {analysis_type}",
                    )
                    cached[company["ticker"]] = entry.result_text
                else:
                    print(
                        f"   [AskAI] cache MISS {company['ticker']} / {analysis_type}",
                    )
                    pending.append(company)

        return cached, pending

    # -------------------------------------------------------------------------
    # DB helpers
    # -------------------------------------------------------------------------

    async def _fetch_all_companies(self) -> list[dict]:
        """Return securities with ``has_data`` as [{company_id, ticker, name}] via ``SecurityRepository.get_all``."""
        async with self.session_factory() as db:
            securities = await SecurityRepository(db).get_all()
            return [
                {"company_id": s.id, "ticker": s.ticker, "name": s.name}
                for s in securities
            ]

    async def _enrich_company_names(self, companies: list[dict]) -> list[dict]:
        """
        Look up the DB name for each company in the list.
        Falls back to ticker if the ID is not found.
        """
        ids = [c["company_id"] for c in companies]
        async with self.session_factory() as db:
            rows = await db.execute(
                select(Security.id, Security.name).where(Security.id.in_(ids)),
            )
            name_map = {r[0]: r[1] for r in rows.all()}

        return [
            {**c, "name": name_map.get(c["company_id"], c.get("name") or c["ticker"])}
            for c in companies
        ]

    # -------------------------------------------------------------------------
    # Output assembly
    # -------------------------------------------------------------------------

    def _assemble_output(self, final_state: AskAIWorkflowState) -> dict:
        """
        Build the dict returned to the AskAI agent's run_analysis tool.

        Shape:
            {
                "results":          {ticker: {name, news, stock, sec}},
                "planner_decision": {...},
            }
        """
        companies = final_state.get("companies", [])
        news_results = final_state.get("news_results", {})
        stock_results = final_state.get("stock_results", {})
        sec_results = final_state.get("sec_results", {})

        results = {}
        for company in companies:
            ticker = company["ticker"]
            results[ticker] = {
                "name": company.get("name", ticker),
                "news": news_results.get(ticker),
                "stock": stock_results.get(ticker),
                "sec": sec_results.get(ticker),
            }

        return {
            "results": results,
            "planner_decision": final_state.get("planner_result", {}),
        }
