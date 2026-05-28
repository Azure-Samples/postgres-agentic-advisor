import uuid

from sqlalchemy import TIMESTAMP, Column, Integer, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from src.models.base import Base


class ChatSession(Base):
    __tablename__ = "chat_session"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    advisor_id = Column(Integer, nullable=False)
    client_id = Column(Integer, nullable=False)
    chat_session_id = Column(Integer, nullable=False)
    chat_title = Column(Text, nullable=True)
    latest_agents_graph = Column(JSONB, nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("clock_timestamp()"),
    )

    __table_args__ = (
        UniqueConstraint(
            "advisor_id",
            "client_id",
            "chat_session_id",
            name="uq_chat_session_advisor_client_session",
        ),
    )
