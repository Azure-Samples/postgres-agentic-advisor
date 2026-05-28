from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class SecurityPriceBase(BaseModel):
    security_id: int
    price_date: date
    open: float | None = None
    close: float
    high: float | None = None
    low: float | None = None
    volume: int | None = None


class SecurityPriceResponse(SecurityPriceBase):
    model_config = ConfigDict(from_attributes=True)

    created_at: datetime


class SecurityPricesListResponse(BaseModel):
    page: int
    page_size: int
    total: int
    prices: list[SecurityPriceResponse]


class SecurityPricesBySecurityResponse(BaseModel):
    security_id: int
    prices: list[SecurityPriceResponse]
    total_records: int


class SecurityPricesByDateRangeResponse(BaseModel):
    security_id: int
    start_date: date
    end_date: date
    prices: list[SecurityPriceResponse]
    total_records: int


class SecurityPriceSummaryResponse(BaseModel):
    security_id: int
    period_days: int
    summary: dict
