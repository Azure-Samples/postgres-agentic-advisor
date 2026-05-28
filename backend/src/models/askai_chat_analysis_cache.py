from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from src.models.base import Base


class AskAIChatAnalysisCache(Base):
    """
    Caches per-company analysis results for an AskAI chat session.

    Keyed by (session_id, company_id, analysis_type) so that results produced
    in one conversation turn can be reused in a later turn without re-running
    the underlying analysis agent.

    Columns:
        id:             Surrogate primary key.
        session_id:     UUID FK → chat_session.id (ON DELETE CASCADE).
                        Deleting a ChatSession automatically removes all cache rows.
        company_id:     FK-style reference to securities.id (not enforced as FK
                        to keep the cache table lightweight).
        analysis_type:  One of 'news', 'stock', 'sec'.
        result_text:    The plain-text analysis paragraph produced by the agent.
        retrieved_docs: Raw vector-store chunks returned during RAG retrieval,
                        stored as JSONB for optional source attribution.
        created_at:     Insertion timestamp — set by the DB server.
    """

    __tablename__ = "askai_chat_analysis_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("chat_session.id", ondelete="CASCADE"),
        nullable=False,
    )
    company_id = Column(Integer, nullable=False)
    analysis_type = Column(Text, nullable=False)
    result_text = Column(Text, nullable=False)
    retrieved_docs = Column(JSONB, nullable=True)
    phoenix_trace_id = Column(Text, nullable=True)
    turn_id = Column(Integer, nullable=True)  # which workflow invocation wrote this row
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default="now()",
    )

    __table_args__ = (
        UniqueConstraint(
            "session_id",
            "company_id",
            "analysis_type",
            name="uq_askai_chat_analysis_cache_session_company_type",
        ),
    )
