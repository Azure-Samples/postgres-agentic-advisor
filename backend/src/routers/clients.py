from datetime import date as DateType
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, Request
from src.core.dependencies import DBSession
from src.repositories.account_holdings import AccountHoldingRepository
from src.repositories.clients import ClientRepository
from src.repositories.dashboard import DashboardRepository
from src.schemas import (
    ClientResponse,
    ClientsByAdvisorResponse,
    ClientSearchResponse,
    ClientsListResponse,
)
from src.schemas.clients import (
    ClientListResponse,
    ClientListRow,
    ClientPortfolioMetricsResponse,
    ClientRiskProfileResponse,
)

router = APIRouter(
    prefix="/clients",
    tags=["clients"],
    responses={404: {"description": "Not found"}},
)


@router.get("/list", response_model=ClientListResponse)
async def get_clients_list(
    db: DBSession,
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    filter: Literal["all", "active", "high_risk", "tech", "consumer"] = Query("all"),
    sort: Literal["default", "name", "networth", "growth", "risk"] = Query("default"),
    search: str = Query(None),
):
    """
    Get clients list with portfolio metrics for the clients page
    """
    advisor_id = request.state.user_id

    simulated_date_header = request.headers.get("x-simulated-date")
    current_date = (
        datetime.strptime(simulated_date_header, "%Y-%m-%d").date()
        if simulated_date_header
        else DateType.today()
    )

    # Fetch all clients with computed portfolio fields
    dashboard_repo = DashboardRepository(db)
    clients = await dashboard_repo.get_clients_list_data(
        advisor_id=advisor_id,
        current_date=current_date,
    )

    # --- Search ---
    # Filter by name match
    if search:
        search_lower = search.lower()
        clients = [c for c in clients if search_lower in c["full_name"].lower()]

    # --- Filter ---
    if filter == "active":
        clients = [c for c in clients if c["net_worth"] is not None]
    elif filter == "high_risk":
        clients = [c for c in clients if c["risk_profile"] == "Growth-oriented"]
    elif filter == "tech":
        clients = [c for c in clients if c["top_sector"] == "Information Technology"]
    elif filter == "consumer":
        clients = [
            c
            for c in clients
            if c["top_sector"] not in (None, "Information Technology")
        ]
    # "all" — no filter applied

    # --- Sort ---
    if sort == "name":
        clients.sort(key=lambda c: c["full_name"].lower())
    elif sort == "networth":
        clients.sort(key=lambda c: c["net_worth"] or 0.0, reverse=True)
    elif sort == "growth":
        clients.sort(key=lambda c: c["growth_percent"] or 0.0, reverse=True)
    elif sort == "risk":
        risk_order = {"Growth-oriented": 0, "Balanced": 1, "Conservative": 2}
        clients.sort(key=lambda c: risk_order.get(c["risk_profile"] or "", 3))
    else:
        clients.sort(key=lambda c: c["id"])

    # --- Pagination ---
    total = len(clients)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = clients[start:end]

    return ClientListResponse(
        page=page,
        page_size=page_size,
        total=total,
        clients=[ClientListRow(**c) for c in paginated],
    )


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: int, db: DBSession):
    """Get a specific client by ID."""
    client = await ClientRepository(db).get_by_id(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.get("/", response_model=ClientsListResponse)
async def get_clients(
    db: DBSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    advisor_id: int = Query(None),
    risk_profile: str = Query(None),
):
    """Get paginated clients with optional filtering."""
    total, clients = await ClientRepository(db).get_paginated(
        page=page,
        page_size=page_size,
        advisor_id=advisor_id,
        risk_profile=risk_profile,
    )

    return ClientsListResponse(
        page=page,
        page_size=page_size,
        total=total,
        clients=clients,
    )


@router.get("/advisor/{advisor_id}", response_model=ClientsByAdvisorResponse)
async def get_clients_by_advisor(advisor_id: int, db: DBSession):
    """Get all clients for a specific advisor."""
    clients = await ClientRepository(db).get_by_advisor(advisor_id)
    return ClientsByAdvisorResponse(
        advisor_id=advisor_id,
        clients=clients,
        total_clients=len(clients),
    )


@router.get("/search/", response_model=ClientSearchResponse)
async def search_clients(db: DBSession, q: str = Query(..., min_length=2)):
    """Search clients by name or email."""
    clients = await ClientRepository(db).search_by_name_or_email(q)
    return ClientSearchResponse(
        query=q,
        clients=clients,
        total_results=len(clients),
    )


@router.get(
    "/{client_id}/portfolio-metrics",
    response_model=ClientPortfolioMetricsResponse,
)
async def get_client_portfolio_metrics(
    client_id: int,
    db: DBSession,
    request: Request,
    reference_date: DateType = Query(default=None),
):
    """Get calculated portfolio metrics (net worth, portfolio value, growth) for a client."""
    client = await ClientRepository(db).get_by_id(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    if reference_date:
        effective_date = reference_date
    else:
        simulated_date_header = request.headers.get("x-simulated-date")
        effective_date = (
            datetime.strptime(simulated_date_header, "%Y-%m-%d").date()
            if simulated_date_header
            else DateType.today()
        )
    metrics = await AccountHoldingRepository(db).get_client_portfolio_metrics(
        client_id=client_id,
        reference_date=effective_date,
    )
    return ClientPortfolioMetricsResponse(
        net_worth=metrics.get("client_net_worth"),
        portfolio_value=metrics.get("client_portfolio_value"),
        growth=metrics.get("client_growth"),
    )


@router.get("/{client_id}/risk-profile", response_model=ClientRiskProfileResponse)
async def get_client_risk_profile(client_id: int, db: DBSession):
    """Get the stored risk profile label for a client from the DB."""
    client = await ClientRepository(db).get_by_id(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    risk_profile = (client.profile or {}).get("risk_preference")
    return ClientRiskProfileResponse(risk_profile=risk_profile)
