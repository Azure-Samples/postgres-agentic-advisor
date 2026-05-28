from sqlalchemy import (
    ARRAY,
    TIMESTAMP,
    Column,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
)
from sqlalchemy.sql import func
from src.models.base import Base


class AlertSource(Base):
    __tablename__ = "alert_source"
    __table_args__ = (
        UniqueConstraint(
            "alert_id",
            "source_type",
            "source_id",
            name="uq_alert_source",
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_id = Column(
        Integer,
        ForeignKey("alert.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Identifies the source document (e.g. news_article_id or sec_file_id from vector store metadata)
    source_id = Column(Text, nullable=False)
    source_type = Column(Text, nullable=False)  # "news" | "sec_filing"
    source_title = Column(
        Text,
        nullable=True,
    )  # display name shown in the frontend widget

    # Raw chunk texts retrieved from the vector store at agent run time
    chunk_texts = Column(ARRAY(Text), nullable=True)

    # Absolute path to the source .md file on disk (null if no markdown version exists)
    source_file_path = Column(Text, nullable=True)

    reporting_company = Column(Text, nullable=True)  # banner code, e.g. GWN, SEC_10K

    # Populated lazily on first click of the source widget
    reference_sentences = Column(
        ARRAY(Text),
        nullable=True,
    )  # verbatim sentences extracted by LLM
    annotated_markdown = Column(
        Text,
        nullable=True,
    )  # full source markdown with <mark> tags applied around reference sentences

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
