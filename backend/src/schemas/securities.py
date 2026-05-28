from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SecurityBase(BaseModel):
    ticker: str
    name: str
    exchange: str = "NASDAQ"
    sector: str | None = None
    industry: str | None = None
    extra_metadata: dict = {}


class SecurityResponse(SecurityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class SecuritiesListResponse(BaseModel):
    page: int
    page_size: int
    total: int
    securities: list[SecurityResponse]


class SecuritiesByExchangeResponse(BaseModel):
    exchange: str
    securities: list[SecurityResponse]
    total_securities: int


class SecuritiesBySectorResponse(BaseModel):
    sector: str
    securities: list[SecurityResponse]
    total_securities: int
