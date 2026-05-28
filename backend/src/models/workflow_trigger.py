import datetime

from fastapi.encoders import jsonable_encoder
from sqlalchemy import Date, ForeignKey, Index, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models.base import Base


class WorkflowTrigger(Base):
    __tablename__ = "workflow_trigger"
    __table_args__ = (Index("ix_workflow_trigger_date", "date"),)

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )
    date: Mapped[datetime.date] = mapped_column(
        Date,
        nullable=False,
    )
    trigger_type: Mapped[str] = mapped_column(
        nullable=False,
    )  # 'stock_price_drop' | 'news'
    security_id: Mapped[int] = mapped_column(
        ForeignKey("security.id", ondelete="RESTRICT"),
        nullable=False,
    )
    news_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        nullable=False,
        server_default=func.now(),
    )

    security = relationship("Security")

    def to_dict(self):
        return jsonable_encoder(self)
