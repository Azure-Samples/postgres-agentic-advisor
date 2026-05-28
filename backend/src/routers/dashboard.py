from datetime import date, datetime

from fastapi import APIRouter, HTTPException, Query, Request
from sqlalchemy import select
from src.core.dependencies import DBSession
from src.models.clients import Client
from src.models.meetings import Meeting
from src.repositories.dashboard import DashboardRepository
from src.schemas import (
    Alert,
    AllClientsPortfolioResponse,
    ClientPerformance,
    ClientPortfolioPerformance,
    PortfolioHolding,
    PortfolioHoldingDetail,
    PortfolioHoldingsResponse,
    PortfolioOverview,
    PortfolioOverviewResponse,
    RecentAlertsResponse,
    SectorTrendsResponse,
    SecurityInfo,
    TickerDayData,
    TopPerformingClientsResponse,
    TopRegressingClientsResponse,
    UpcomingEarningsItem,
    UpcomingEarningsResponse,
    UpcomingMeeting,
    UpcomingMeetingsResponse,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    responses={404: {"description": "Not found"}},
)


@router.get("/portfolio/{client_id}", response_model=PortfolioOverviewResponse)
async def get_client_portfolio_overview(
    client_id: int,
    db: DBSession,
    request: Request,
):
    """
    Get a client's portfolio overview including:
    - Client name, net worth, growth, top sector, holdings, risk profile
    """
    # Get simulated date from request state, fallback to current date
    simulated_date = getattr(request.state, "simulated_date", datetime.now())
    current_date = (
        simulated_date.date()
        if isinstance(simulated_date, datetime)
        else simulated_date
    )

    dashboard_repo = DashboardRepository(db)
    result = await dashboard_repo.get_client_portfolio_overview(client_id, current_date)

    if not result:
        raise HTTPException(status_code=404, detail="Client not found")

    client, holdings_with_prices = result

    # Calculate portfolio metrics
    total_current_value = 0.0
    total_cost_basis = 0.0
    sector_values = {}
    portfolio_holdings = []

    for holding, security, current_price in holdings_with_prices:
        current_value = float(holding.quantity * current_price)
        cost_basis = float(holding.cost_basis_total_usd)
        gain_loss = float(current_value - cost_basis)
        gain_loss_percentage = (gain_loss / cost_basis * 100) if cost_basis > 0 else 0.0

        total_current_value += current_value
        total_cost_basis += cost_basis

        # Track sector values for top sector calculation
        sector = security.sector or "Unknown"
        sector_values[sector] = sector_values.get(sector, 0.0) + current_value

        portfolio_holdings.append(
            PortfolioHolding(
                security_ticker=security.ticker,
                security_name=security.name,
                sector=sector,
                quantity=holding.quantity,
                current_value=current_value,
                cost_basis=cost_basis,
                percentage_of_portfolio=(
                    (current_value / total_current_value * 100)
                    if total_current_value > 0
                    else 0.0
                ),
                gain_loss=gain_loss,
                gain_loss_percentage=gain_loss_percentage,
            ),
        )

    # Calculate overall growth
    overall_growth = (
        (total_current_value - total_cost_basis) / total_cost_basis * 100
        if total_cost_basis > 0
        else 0.0
    )

    # Find top sector
    top_sector = (
        max(sector_values.keys(), key=sector_values.get) if sector_values else "Unknown"
    )

    # Update percentage of portfolio for each holding now that we have total
    for holding in portfolio_holdings:
        holding.percentage_of_portfolio = (
            holding.current_value / total_current_value * 100
            if total_current_value > 0
            else 0.0
        )

    # Get risk profile from client profile
    risk_profile = client.profile.get("risk_preference") if client.profile else None

    portfolio_overview = PortfolioOverview(
        client_name=client.full_name,
        net_worth=total_current_value,
        growth=overall_growth,
        top_sector=top_sector,
        holdings_count=len(portfolio_holdings),
        risk_profile=risk_profile,
        holdings=portfolio_holdings,
    )

    return PortfolioOverviewResponse(portfolio=portfolio_overview)


@router.get("/portfolio/{client_id}/holdings", response_model=PortfolioHoldingsResponse)
async def get_client_portfolio_holdings(
    client_id: int,
    db: DBSession,
    request: Request,
):
    """
    Get detailed portfolio holdings information for the Portfolio Holdings Table.
    """
    # Get simulated date from request state, fallback to current date
    simulated_date = getattr(request.state, "simulated_date", datetime.now())
    current_date = (
        simulated_date.date()
        if isinstance(simulated_date, datetime)
        else simulated_date
    )

    dashboard_repo = DashboardRepository(db)
    result = await dashboard_repo.get_client_portfolio_holdings(client_id, current_date)

    if not result:
        raise HTTPException(status_code=404, detail="Client not found")

    client, holdings_with_prices, _ = result

    # Calculate total portfolio value for percentage calculations
    total_portfolio_value = sum(
        holding.quantity * current_price
        for holding, _, current_price in holdings_with_prices
    )

    holdings_details = []
    for holding, security, current_price in holdings_with_prices:
        current_value = holding.quantity * current_price
        gain_loss = current_value - holding.cost_basis_total_usd
        gain_loss_percentage = (
            gain_loss / holding.cost_basis_total_usd * 100
            if holding.cost_basis_total_usd > 0
            else 0.0
        )
        percentage_of_portfolio = (
            current_value / total_portfolio_value * 100
            if total_portfolio_value > 0
            else 0.0
        )

        holdings_details.append(
            PortfolioHoldingDetail(
                id=holding.id,
                security_ticker=security.ticker,
                security_name=security.name,
                sector=security.sector or "Unknown",
                quantity=holding.quantity,
                cost_basis=holding.cost_basis_total_usd,
                current_price=current_price,
                current_value=current_value,
                gain_loss=gain_loss,
                gain_loss_percentage=gain_loss_percentage,
                percentage_of_portfolio=percentage_of_portfolio,
                as_of=holding.as_of,
            ),
        )

    return PortfolioHoldingsResponse(
        client_id=client.id,
        client_name=client.full_name,
        total_portfolio_value=total_portfolio_value,
        holdings=holdings_details,
        last_updated=simulated_date,
    )


@router.get("/alerts/recent", response_model=RecentAlertsResponse)
async def get_recent_alerts(
    db: DBSession,
    request: Request,
    limit: int = Query(10, ge=1, le=50, description="Number of alerts to fetch"),
):
    """
    Get recent alerts for the dashboard.
    """
    # Get simulated date from request state, fallback to current date
    simulated_date = getattr(request.state, "simulated_date", datetime.now())
    current_date = (
        simulated_date.date()
        if isinstance(simulated_date, datetime)
        else simulated_date
    )

    dashboard_repo = DashboardRepository(db)
    alerts_data = await dashboard_repo.get_recent_alerts(limit, current_date)

    alerts = [
        Alert(
            id=alert["id"],
            client_id=alert["client_id"],
            client_name=alert["client_name"],
            alert_type=alert["alert_type"],
            message=alert["message"],
            severity=alert["severity"],
            created_at=alert["created_at"],
            is_read=alert["is_read"],
        )
        for alert in alerts_data
    ]

    total_unread = sum(1 for alert in alerts if not alert.is_read)

    return RecentAlertsResponse(
        alerts=alerts,
        total_unread=total_unread,
    )


@router.get("/clients/top-performing", response_model=TopPerformingClientsResponse)
async def get_top_performing_clients(
    db: DBSession,
    request: Request,
    limit: int = Query(
        10,
        ge=1,
        le=50,
        description="Number of top performing clients to fetch",
    ),
):
    """
    Get top-performing clients based on today's portfolio performance.
    Returns client name, current net worth, and today's percentage change.
    """
    # Get simulated date from request state, fallback to current date
    simulated_date = getattr(request.state, "simulated_date", datetime.now())
    current_date = (
        simulated_date.date()
        if isinstance(simulated_date, datetime)
        else simulated_date
    )

    dashboard_repo = DashboardRepository(db)
    client_performances = await dashboard_repo.get_top_performing_clients(
        limit,
        current_date,
    )

    clients = [
        ClientPerformance(
            client_id=client.id,
            client_name=client.full_name,
            current_net_worth=net_worth,
            todays_percentage_change=change_percent,
            todays_dollar_change=change_amount,
        )
        for client, net_worth, change_percent, change_amount in client_performances
    ]

    return TopPerformingClientsResponse(
        clients=clients,
        date=simulated_date,
    )


@router.get("/clients/top-regressing", response_model=TopRegressingClientsResponse)
async def get_top_regressing_clients(
    db: DBSession,
    request: Request,
    limit: int = Query(
        10,
        ge=1,
        le=50,
        description="Number of top regressing clients to fetch",
    ),
):
    """
    Get top-regressing clients based on today's portfolio performance.
    Returns client name, current net worth, and today's percentage change.
    """
    # Get simulated date from request state, fallback to current date
    simulated_date = getattr(request.state, "simulated_date", datetime.now())
    current_date = (
        simulated_date.date()
        if isinstance(simulated_date, datetime)
        else simulated_date
    )

    dashboard_repo = DashboardRepository(db)
    client_performances = await dashboard_repo.get_top_regressing_clients(
        limit,
        current_date,
    )

    clients = [
        ClientPerformance(
            client_id=client.id,
            client_name=client.full_name,
            current_net_worth=net_worth,
            todays_percentage_change=change_percent,
            todays_dollar_change=change_amount,
        )
        for client, net_worth, change_percent, change_amount in client_performances
    ]

    return TopRegressingClientsResponse(
        clients=clients,
        date=simulated_date,
    )


# Hardcoded performance sentences per ticker
SECTOR_TRENDS_SENTENCES: dict[str, str] = {
    "EDUC": "EduCare faces significant subscriber decline and market pressure due to rising competition from AI-powered study tools.",
    "AWKS": "Adventure Works is experiencing strong revenue growth and consecutive profitable quarters driven by its enterprise AI platform.",
    "ZVTC": "Zava Technologies faces reduced material demand due to upstream supply chain disruptions in the semiconductor sector.",
    "NFEQ": "NanoFab Equipment faces declining fabrication equipment orders amid broader semiconductor manufacturing slowdowns.",
    "NWND": "Northwind is under pressure from persistent memory oversupply and weak end-market demand.",
    "CCMP": "Contoso Compute faces potential supply chain disruption for critical AI hardware components amid supplier production cutbacks.",
}

# Fallback
SECTOR_TRENDS_DEFAULT_SENTENCE = (
    "No significant market events recorded for this company on this date."
)


@router.get("/sector-trends", response_model=SectorTrendsResponse)
async def get_sector_trends(
    db: DBSession,
    request: Request,
):
    """
    Get daily percentage price change per ticker
    for the last 6 trading days.
    """
    simulated_date = getattr(request.state, "simulated_date", None)
    current_date = (
        simulated_date.date()
        if simulated_date and isinstance(simulated_date, datetime)
        else simulated_date
    )

    dashboard_repo = DashboardRepository(db)

    # Step 1 — Fetch raw percentage change data for last 6 days
    trend_data = await dashboard_repo.get_sector_trends(
        days=6,
        simulated_date=current_date,
    )

    if not trend_data:
        return SectorTrendsResponse(
            days=6,
            tickers=[],
            securities_info={},
            data=[],
        )

    # Step 2 — Apply robust scaling normalization
    # median and IQR are calculated from ALL historical data for stability
    median, iqr = await dashboard_repo.get_robust_scaling_params()

    # Step 3 — Fetch static securities info (name + description) from DB
    securities_info_raw = await dashboard_repo.get_securities_info()

    # Step 4 — Extract ticker list from the first row
    tickers = [key for key in trend_data[0].keys() if key != "date"]

    # Step 5 — Build response
    enriched_data = []
    for row in trend_data:
        date_str = row["date"]
        enriched_row: dict = {"date": date_str}

        for ticker in tickers:
            raw_value = row.get(ticker)

            # Calculate normalized change and trend from raw percentage value
            if raw_value is None:
                normalized_change = None
                trend = None
            else:
                normalized_change = round((raw_value - median) / iqr, 3)
                trend = "up" if raw_value >= 0 else "down"

            # use hardcoded sentence regardless of date or ticker
            enriched_row[ticker] = TickerDayData(
                normalized_change=normalized_change,
                relative_performance=raw_value,
                trend=trend,
                performance_sentence=SECTOR_TRENDS_SENTENCES.get(
                    ticker,
                    SECTOR_TRENDS_DEFAULT_SENTENCE,
                ),
            ).model_dump()

        enriched_data.append(enriched_row)

    # Step 6 — Build securities_info dict using only tickers present in the data
    securities_info = {
        ticker: SecurityInfo(
            name=securities_info_raw[ticker]["name"],
            description=securities_info_raw[ticker]["description"],
        )
        for ticker in tickers
        if ticker in securities_info_raw
    }

    return SectorTrendsResponse(
        days=6,
        tickers=tickers,
        securities_info=securities_info,
        data=enriched_data,
    )


@router.get("/clients", response_model=AllClientsPortfolioResponse)
async def get_all_clients_portfolio_performance(
    db: DBSession,
    request: Request,
):
    """
    Get all clients with their current portfolio value and total return
    since original investment.
    """
    simulated_date = getattr(request.state, "simulated_date", datetime.now())
    current_date = (
        simulated_date.date()
        if isinstance(simulated_date, datetime)
        else simulated_date
    )

    dashboard_repo = DashboardRepository(db)
    performances = await dashboard_repo.get_all_clients_portfolio_performance(
        current_date,
    )

    clients = [
        ClientPortfolioPerformance(
            client_name=item["client"].full_name,
            current_portfolio_value=item["current_portfolio_value"],
            trend=item["trend"],
            total_return_percentage=item["total_return_percentage"],
            holdings=item["holdings"],
        )
        for item in performances
    ]

    return AllClientsPortfolioResponse(
        clients=clients,
        date=simulated_date,
    )


@router.get("/upcoming-meetings", response_model=UpcomingMeetingsResponse)
async def get_upcoming_meetings(db: DBSession):
    """
    Get upcoming meetings for the advisor from the database.
    """

    result = await db.execute(
        select(Meeting, Client)
        .join(Client, Meeting.client_id == Client.id)
        .order_by(Meeting.scheduled_at),
    )
    rows = result.all()

    meetings = [
        UpcomingMeeting(
            client_name=client.full_name,
            scheduled_at=meeting.scheduled_at,
        )
        for meeting, client in rows
    ]

    return UpcomingMeetingsResponse(meetings=meetings)


@router.get("/upcoming-earnings", response_model=UpcomingEarningsResponse)
async def get_upcoming_earnings(
    db: DBSession,
    request: Request,
):
    """
    Get upcoming earnings dates for all securities.
    """
    simulated_date = getattr(request.state, "simulated_date", None)
    reference_date = (
        simulated_date.date()
        if simulated_date and isinstance(simulated_date, datetime)
        else (simulated_date or date.today())
    )

    dashboard_repo = DashboardRepository(db)
    earnings_data = await dashboard_repo.get_upcoming_earnings(
        reference_date=reference_date,
    )

    earnings = [
        UpcomingEarningsItem(
            company_name=item["company_name"],
            days_from_reference=item["days_from_reference"],
            trend=item["trend"],
            earnings_date=item["earnings_date"],
        )
        for item in earnings_data
    ]

    return UpcomingEarningsResponse(
        reference_date=reference_date.isoformat(),
        earnings=earnings,
    )
