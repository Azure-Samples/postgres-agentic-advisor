from sqlalchemy import Column, ForeignKey, Integer, String, Text
from src.models.base import Base


class SuggestedResponse(Base):
    __tablename__ = "suggested_response"

    suggested_response_id = Column(Integer, primary_key=True, autoincrement=True)
    alert_id = Column(
        Integer,
        ForeignKey("alert.id", ondelete="CASCADE"),
        nullable=False,
    )
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
