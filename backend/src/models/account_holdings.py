import datetime

from fastapi.encoders import jsonable_encoder
from sqlalchemy import CheckConstraint, ForeignKey, func
from sqlalchemy.dialects.postgresql import NUMERIC, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models.base import Base


class AccountHolding(Base):
    __tablename__ = "account_holding"
    __table_args__ = (
        CheckConstraint("quantity >= 0", name="check_quantity_nonnegative"),
        CheckConstraint(
            "cost_basis_total_usd >= 0",
            name="check_cost_basis_nonnegative",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )
    client_id: Mapped[int] = mapped_column(
        ForeignKey("client.id", ondelete="CASCADE"),
        nullable=False,
    )
    security_id: Mapped[int] = mapped_column(
        ForeignKey("security.id", ondelete="RESTRICT"),
        nullable=False,
    )
    quantity: Mapped[float] = mapped_column(NUMERIC(38, 8), nullable=False)
    cost_basis_total_usd: Mapped[float] = mapped_column(NUMERIC(38, 6), nullable=False)
    as_of: Mapped[datetime.datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
    )
    closed_at: Mapped[datetime.datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    client = relationship("Client", back_populates="holdings")
    security = relationship("Security", back_populates="holdings")

    def to_dict(self):
        return jsonable_encoder(self)
