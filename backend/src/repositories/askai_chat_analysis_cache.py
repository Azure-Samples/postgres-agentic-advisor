from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.askai_chat_analysis_cache import AskAIChatAnalysisCache
from src.repositories.base import BaseRepository


class AskAIChatAnalysisCacheRepository(BaseRepository):
    """
    Repository for reading and writing AskAI chat analysis cache entries.

    Each entry stores the result of running one analysis agent (news, stock,
    or sec) for one company within a specific chat session, enabling later
    turns in the same session to reuse results without re-invoking the agent.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    # ------------------------------------------------------------------
    # BaseRepository required methods
    # ------------------------------------------------------------------

    async def add(self, entity: AskAIChatAnalysisCache) -> AskAIChatAnalysisCache:
        self.db.add(entity)
        await self.db.commit()
        return entity

    async def get_by_id(self, id: int) -> AskAIChatAnalysisCache | None:
        result = await self.db.execute(
            select(AskAIChatAnalysisCache).where(AskAIChatAnalysisCache.id == id),
        )
        return result.scalar_one_or_none()

    async def update(self, entity: AskAIChatAnalysisCache) -> AskAIChatAnalysisCache:
        raise NotImplementedError

    async def delete(self, id: int) -> bool:
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Domain-specific methods
    # ------------------------------------------------------------------

    async def get(
        self,
        session_id: uuid.UUID,
        company_id: int,
        analysis_type: str,
    ) -> Optional[AskAIChatAnalysisCache]:
        """
        Retrieve a single cache entry for (session_id, company_id, analysis_type).
        Returns None if not yet cached.
        """
        result = await self.db.execute(
            select(AskAIChatAnalysisCache).where(
                AskAIChatAnalysisCache.session_id == session_id,
                AskAIChatAnalysisCache.company_id == company_id,
                AskAIChatAnalysisCache.analysis_type == analysis_type,
            ),
        )
        return result.scalar_one_or_none()

    async def set(
        self,
        session_id: uuid.UUID,
        company_id: int,
        analysis_type: str,
        result_text: str,
        retrieved_docs: Optional[list] = None,
        phoenix_trace_id: Optional[str] = None,
        turn_id: Optional[int] = None,
    ) -> AskAIChatAnalysisCache:
        """
        Insert or update a cache entry for (session_id, company_id, analysis_type).
        Uses ON CONFLICT DO UPDATE so calling set() twice is safe.

        Args:
            phoenix_trace_id: The 32-char hex OTel trace ID from the workflow run
                              that produced this result. Used by the trace parser to
                              fetch per-run Phoenix spans for agents-graph enrichment.
            turn_id: Monotonically increasing integer per workflow invocation within
                     a session. Used to filter trace IDs to a specific turn.
        """
        stmt = (
            pg_insert(AskAIChatAnalysisCache)
            .values(
                session_id=session_id,
                company_id=company_id,
                analysis_type=analysis_type,
                result_text=result_text,
                retrieved_docs=retrieved_docs,
                phoenix_trace_id=phoenix_trace_id,
                turn_id=turn_id,
            )
            .on_conflict_do_update(
                constraint="uq_askai_chat_analysis_cache_session_company_type",
                set_={
                    "result_text": result_text,
                    "retrieved_docs": retrieved_docs,
                    "phoenix_trace_id": phoenix_trace_id,
                    "turn_id": turn_id,
                },
            )
            .returning(AskAIChatAnalysisCache)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalar_one()

    async def get_all_for_session(
        self,
        session_id: uuid.UUID,
    ) -> list[AskAIChatAnalysisCache]:
        """
        Return all cached entries for a session.
        Used by the agents-graph endpoint to determine which agents ran.
        """
        result = await self.db.execute(
            select(AskAIChatAnalysisCache).where(
                AskAIChatAnalysisCache.session_id == session_id,
            ),
        )
        return list(result.scalars().all())

    async def get_cached_types_for_company(
        self,
        session_id: uuid.UUID,
        company_id: int,
    ) -> set[str]:
        """
        Return the set of analysis_type values already cached for a
        (session_id, company_id) pair.  e.g. {'news'} means only news was run.
        """
        result = await self.db.execute(
            select(AskAIChatAnalysisCache.analysis_type).where(
                AskAIChatAnalysisCache.session_id == session_id,
                AskAIChatAnalysisCache.company_id == company_id,
            ),
        )
        return {row[0] for row in result.all()}

    async def get_trace_ids_for_session(
        self,
        session_id: uuid.UUID,
        turn_id: Optional[int] = None,
    ) -> dict[str, list[str]]:
        """
        Return all non-null phoenix_trace_ids for a session, grouped by
        analysis_type.  When turn_id is supplied only rows from that specific
        workflow invocation are returned, giving an accurate per-turn graph.

        Returns:
            Dict mapping analysis_type → list of unique trace ID strings.
            e.g. {"news": ["abc123..."], "stock": ["def456...", "ghi789..."]}
            Used by AskAITraceParser to look up per-run spans from Phoenix.
        """
        conditions = [
            AskAIChatAnalysisCache.session_id == session_id,
            AskAIChatAnalysisCache.phoenix_trace_id.isnot(None),
        ]
        if turn_id is not None:
            conditions.append(AskAIChatAnalysisCache.turn_id == turn_id)

        result = await self.db.execute(
            select(
                AskAIChatAnalysisCache.analysis_type,
                AskAIChatAnalysisCache.phoenix_trace_id,
            ).where(*conditions),
        )
        grouped: dict[str, list[str]] = {}
        for analysis_type, trace_id in result.all():
            grouped.setdefault(analysis_type, [])
            if trace_id not in grouped[analysis_type]:
                grouped[analysis_type].append(trace_id)
        return grouped

    async def get_next_turn_id(
        self,
        session_id: uuid.UUID,
    ) -> int:
        """
        Return the next turn_id for a session (MAX(turn_id) + 1, starting at 1).
        Called once per stream request before the workflow runs.
        """
        result = await self.db.execute(
            select(func.coalesce(func.max(AskAIChatAnalysisCache.turn_id), 0)).where(
                AskAIChatAnalysisCache.session_id == session_id,
            ),
        )
        return result.scalar_one() + 1
