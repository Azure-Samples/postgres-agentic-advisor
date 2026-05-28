from fastapi import APIRouter, HTTPException, Query
from src.core.dependencies import DBSession
from src.repositories.account_holdings import AccountHoldingRepository
from src.schemas import (
    AccountHoldingResponse,
    AccountHoldingsByClientResponse,
    AccountHoldingsListResponse,
)

router = APIRouter(
    prefix="/account-holdings",
    tags=["account-holdings"],
    responses={404: {"description": "Not found"}},
)


@router.get("/{holding_id}", response_model=AccountHoldingResponse)
async def get_account_holding(holding_id: int, db: DBSession):
    """Get a specific account holding by ID."""
    holding = await AccountHoldingRepository(db).get_by_id(holding_id)
    if not holding:
        raise HTTPException(status_code=404, detail="Account holding not found")
    return holding


@router.get("/", response_model=AccountHoldingsListResponse)
async def get_account_holdings(
    db: DBSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    client_id: int = Query(None),
    security_id: int = Query(None),
):
    """Get paginated account holdings with optional filtering."""
    total, holdings = await AccountHoldingRepository(db).get_paginated(
        page=page,
        page_size=page_size,
        client_id=client_id,
        security_id=security_id,
    )

    return AccountHoldingsListResponse(
        page=page,
        page_size=page_size,
        total=total,
        holdings=holdings,
    )


@router.get("/client/{client_id}", response_model=AccountHoldingsByClientResponse)
async def get_holdings_by_client(client_id: int, db: DBSession):
    """Get all account holdings for a specific client."""
    holdings = await AccountHoldingRepository(db).get_by_client_id(client_id)
    return AccountHoldingsByClientResponse(
        client_id=client_id,
        holdings=holdings,
        total_holdings=len(holdings),
    )
