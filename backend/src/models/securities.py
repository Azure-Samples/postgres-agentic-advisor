import datetime

from fastapi.encoders import jsonable_encoder
from sqlalchemy import func, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models.base import Base


class Security(Base):
    __tablename__ = "security"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )
    ticker: Mapped[str] = mapped_column(unique=True, nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=True)
    earnings_date: Mapped[datetime.date | None] = mapped_column(nullable=True)
    has_data: Mapped[bool] = mapped_column(
        nullable=False,
        server_default=text("true"),
    )
    exchange: Mapped[str] = mapped_column(
        nullable=False,
        server_default=text("'NASDAQ'"),
    )
    sector: Mapped[str] = mapped_column(nullable=True)
    industry: Mapped[str] = mapped_column(nullable=True)
    extra_metadata: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        server_default=text("'{}'::jsonb"),
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        nullable=False,
        server_default=func.now(),
    )

    holdings = relationship("AccountHolding", back_populates="security")

    def to_dict(self):
        return jsonable_encoder(self)
