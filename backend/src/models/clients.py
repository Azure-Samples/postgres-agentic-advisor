import datetime

from fastapi.encoders import jsonable_encoder
from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from src.models.base import Base


class Client(Base):
    __tablename__ = "client"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )
    primary_advisor_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"),
        nullable=True,
    )
    full_name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str | None] = mapped_column(Text, unique=True)
    phone: Mapped[str | None] = mapped_column(Text)
    profile: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    age: Mapped[int | None] = mapped_column(nullable=True)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    holdings = relationship(
        "AccountHolding",
        back_populates="client",
        cascade="all, delete-orphan",
    )

    meetings = relationship(
        "Meeting",
        back_populates="client",
        cascade="all, delete-orphan",
    )

    def to_dict(self):
        return jsonable_encoder(self)
