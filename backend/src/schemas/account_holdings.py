from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AccountHoldingBase(BaseModel):
    client_id: int
    security_id: int
    quantity: float = Field(..., ge=0, description="Quantity must be non-negative")
    cost_basis_total_usd: float = Field(
        ...,
        ge=0,
        description="Cost basis must be non-negative",
    )
    as_of: datetime
    closed_at: Optional[datetime] = None


class AccountHoldingResponse(AccountHoldingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class AccountHoldingsListResponse(BaseModel):
    page: int
    page_size: int
    total: int
    holdings: list[AccountHoldingResponse]


class AccountHoldingsByClientResponse(BaseModel):
    client_id: int
    holdings: list[AccountHoldingResponse]
    total_holdings: int
