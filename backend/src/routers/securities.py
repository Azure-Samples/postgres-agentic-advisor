from fastapi import APIRouter, HTTPException, Query
from src.core.dependencies import DBSession
from src.repositories.securities import SecurityRepository
from src.schemas import (
    SecuritiesByExchangeResponse,
    SecuritiesBySectorResponse,
    SecuritiesListResponse,
    SecurityResponse,
)

router = APIRouter(
    prefix="/securities",
    tags=["securities"],
    responses={404: {"description": "Not found"}},
)


@router.get("/{security_id}", response_model=SecurityResponse)
async def get_security(security_id: int, db: DBSession):
    """Get a specific security by ID."""
    security = await SecurityRepository(db).get_by_id(security_id)
    if not security:
        raise HTTPException(status_code=404, detail="Security not found")
    return security


@router.get("/", response_model=SecuritiesListResponse)
async def get_securities(
    db: DBSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    exchange: str = Query(None),
    sector: str = Query(None),
    industry: str = Query(None),
):
    """Get paginated securities with optional filtering."""
    total, securities = await SecurityRepository(db).get_paginated(
        page=page,
        page_size=page_size,
        exchange=exchange,
        sector=sector,
        industry=industry,
    )

    return SecuritiesListResponse(
        page=page,
        page_size=page_size,
        total=total,
        securities=securities,
    )


@router.get("/ticker/{ticker}", response_model=SecurityResponse)
async def get_security_by_ticker(ticker: str, db: DBSession):
    """Get a security by ticker symbol."""
    security = await SecurityRepository(db).get_by_ticker(ticker)
    if not security:
        raise HTTPException(status_code=404, detail="Security not found")
    return security


@router.get("/exchange/{exchange}", response_model=SecuritiesByExchangeResponse)
async def get_securities_by_exchange(exchange: str, db: DBSession):
    """Get all securities for a specific exchange."""
    securities = await SecurityRepository(db).get_by_exchange(exchange)
    return SecuritiesByExchangeResponse(
        exchange=exchange,
        securities=securities,
        total_securities=len(securities),
    )


@router.get("/sector/{sector}", response_model=SecuritiesBySectorResponse)
async def get_securities_by_sector(sector: str, db: DBSession):
    """Get all securities in a specific sector."""
    securities = await SecurityRepository(db).get_by_sector(sector)
    return SecuritiesBySectorResponse(
        sector=sector,
        securities=securities,
        total_securities=len(securities),
    )
