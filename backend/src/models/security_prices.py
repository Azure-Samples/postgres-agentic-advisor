import datetime

from fastapi.encoders import jsonable_encoder
from sqlalchemy import TIMESTAMP, BigInteger, Date, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from src.models.base import Base


class SecurityPrice(Base):
    __tablename__ = "security_price"

    security_id: Mapped[int] = mapped_column(
        ForeignKey("security.id", ondelete="CASCADE"),
        primary_key=True,
    )
    price_date: Mapped[Date] = mapped_column(Date, primary_key=True)
    open: Mapped[float] = mapped_column(Numeric(20, 6), nullable=True)
    high: Mapped[float] = mapped_column(Numeric(20, 6), nullable=True)
    low: Mapped[float] = mapped_column(Numeric(20, 6), nullable=True)
    close: Mapped[float] = mapped_column(Numeric(20, 6), nullable=False)
    volume: Mapped[int] = mapped_column(BigInteger, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    def to_dict(self):
        return jsonable_encoder(self)
