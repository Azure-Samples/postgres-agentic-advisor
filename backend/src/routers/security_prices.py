from datetime import date

from fastapi import APIRouter, HTTPException, Query
from src.core.dependencies import DBSession
from src.repositories.security_prices import SecurityPriceRepository
from src.schemas import (
    SecurityPriceResponse,
    SecurityPricesByDateRangeResponse,
    SecurityPricesBySecurityResponse,
    SecurityPricesListResponse,
    SecurityPriceSummaryResponse,
)

router = APIRouter(
    prefix="/security-prices",
    tags=["security-prices"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=SecurityPricesListResponse)
async def get_security_prices(
    db: DBSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    security_id: int = Query(None),
    start_date: date = Query(None),
    end_date: date = Query(None),
):
    """Get paginated security prices with optional filtering."""
    total, prices = await SecurityPriceRepository(db).get_paginated(
        page=page,
        page_size=page_size,
        security_id=security_id,
        start_date=start_date,
        end_date=end_date,
    )

    return SecurityPricesListResponse(
        page=page,
        page_size=page_size,
        total=total,
        prices=prices,
    )


@router.get("/security/{security_id}", response_model=SecurityPricesBySecurityResponse)
async def get_prices_by_security(
    db: DBSession,
    security_id: int,
    limit: int = Query(30, ge=1, le=365),
):
    """Get price history for a specific security."""
    prices = await SecurityPriceRepository(db).get_by_security_id(
        security_id,
        limit=limit,
    )
    return SecurityPricesBySecurityResponse(
        security_id=security_id,
        prices=prices,
        total_records=len(prices),
    )


@router.get("/security/{security_id}/latest", response_model=SecurityPriceResponse)
async def get_latest_price(security_id: int, db: DBSession):
    """Get the most recent price for a specific security."""
    price = await SecurityPriceRepository(db).get_latest_price(security_id)
    if not price:
        raise HTTPException(status_code=404, detail="No price data found for security")
    return price


@router.get(
    "/security/{security_id}/range",
    response_model=SecurityPricesByDateRangeResponse,
)
async def get_prices_by_date_range(
    security_id: int,
    start_date: date,
    end_date: date,
    db: DBSession,
):
    """Get price data for a security within a date range."""
    prices = await SecurityPriceRepository(db).get_by_date_range(
        security_id,
        start_date,
        end_date,
    )
    return SecurityPricesByDateRangeResponse(
        security_id=security_id,
        start_date=start_date,
        end_date=end_date,
        prices=prices,
        total_records=len(prices),
    )


@router.get(
    "/security/{security_id}/summary",
    response_model=SecurityPriceSummaryResponse,
)
async def get_price_summary(
    db: DBSession,
    security_id: int,
    days: int = Query(30, ge=1, le=365),
):
    """Get a summary of price history for a security."""
    summary = await SecurityPriceRepository(db).get_price_history_summary(
        security_id,
        days=days,
    )
    if not summary:
        raise HTTPException(status_code=404, detail="No price data found for security")
    return SecurityPriceSummaryResponse(
        security_id=security_id,
        period_days=days,
        summary=summary,
    )


@router.get("/{security_id}/{price_date}", response_model=SecurityPriceResponse)
async def get_security_price(security_id: int, price_date: date, db: DBSession):
    """Get a specific security price by security ID and date."""
    price = await SecurityPriceRepository(db).get_by_id((security_id, price_date))
    if not price:
        raise HTTPException(status_code=404, detail="Security price not found")
    return price
