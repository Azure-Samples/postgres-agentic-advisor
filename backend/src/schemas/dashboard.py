from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# Portfolio Overview Schemas
class PortfolioHolding(BaseModel):
    security_ticker: str
    security_name: str
    sector: str
    quantity: float
    current_value: float
    cost_basis: float
    percentage_of_portfolio: float
    gain_loss: float
    gain_loss_percentage: float


class PortfolioOverview(BaseModel):
    client_name: str
    net_worth: float
    growth: float  # Total portfolio growth percentage
    top_sector: str
    holdings_count: int
    risk_profile: Optional[str]
    holdings: List[PortfolioHolding]


class PortfolioOverviewResponse(BaseModel):
    portfolio: PortfolioOverview


# Portfolio Holdings Table Schema
class PortfolioHoldingDetail(BaseModel):
    id: int
    security_ticker: str
    security_name: str
    sector: str
    quantity: float
    cost_basis: float
    current_price: float
    current_value: float
    gain_loss: float
    gain_loss_percentage: float
    percentage_of_portfolio: float
    as_of: datetime


class PortfolioHoldingsResponse(BaseModel):
    client_id: int
    client_name: str
    total_portfolio_value: float
    holdings: List[PortfolioHoldingDetail]
    last_updated: datetime


# Recent Alerts Schema
class Alert(BaseModel):
    id: str
    client_id: int
    client_name: str
    alert_type: str  # e.g., "Price Drop", "Risk Change", "Performance Alert"
    message: str
    severity: str  # e.g., "Low", "Medium", "High", "Critical"
    created_at: datetime
    is_read: bool


class RecentAlertsResponse(BaseModel):
    alerts: List[Alert]
    total_unread: int


# Top Performing/Regressing Clients Schema
class ClientPerformance(BaseModel):
    client_id: int
    client_name: str
    current_net_worth: float
    todays_percentage_change: float
    todays_dollar_change: float


class TopPerformingClientsResponse(BaseModel):
    clients: List[ClientPerformance]
    date: datetime


class TopRegressingClientsResponse(BaseModel):
    clients: List[ClientPerformance]
    date: datetime


class SecurityInfo(BaseModel):
    name: str
    description: str


class TickerDayData(BaseModel):
    normalized_change: Optional[float]
    relative_performance: Optional[float]
    trend: Optional[str]
    performance_sentence: str


class SectorTrendsResponse(BaseModel):
    days: int
    tickers: list[str]
    securities_info: dict[str, SecurityInfo]
    data: list[dict]


class ClientPortfolioPerformance(BaseModel):
    client_name: str
    current_portfolio_value: float
    trend: str
    total_return_percentage: float
    holdings: List[str] = []


class AllClientsPortfolioResponse(BaseModel):
    clients: List[ClientPortfolioPerformance]
    date: datetime


class UpcomingMeeting(BaseModel):
    client_name: str
    scheduled_at: datetime


class UpcomingMeetingsResponse(BaseModel):
    meetings: List[UpcomingMeeting]


class UpcomingEarningsItem(BaseModel):
    company_name: str
    days_from_reference: Optional[int]
    trend: Optional[str]
    earnings_date: str


class UpcomingEarningsResponse(BaseModel):
    reference_date: str
    earnings: list[UpcomingEarningsItem]
