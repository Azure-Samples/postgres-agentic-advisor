from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class ClientBase(BaseModel):
    """Base schema for Client"""

    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    profile: Dict = {}
    primary_advisor_id: Optional[int] = None


class ClientResponse(ClientBase):
    """Schema for client response"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class ClientsListResponse(BaseModel):
    """Schema for paginated clients list response"""

    page: int
    page_size: int
    total: int
    clients: List[ClientResponse]


class ClientSearchResponse(BaseModel):
    """Schema for client search response"""

    query: str
    clients: List[ClientResponse]
    total_results: int


class ClientsByAdvisorResponse(BaseModel):
    """Schema for clients by advisor response"""

    advisor_id: int
    clients: List[ClientResponse]
    total_clients: int


class ClientPortfolioMetricsResponse(BaseModel):
    """Schema for client portfolio metrics response"""

    net_worth: Optional[float] = None
    portfolio_value: Optional[float] = None
    growth: Optional[str] = None


class ClientRiskProfileResponse(BaseModel):
    """Schema for client risk profile response"""

    risk_profile: Optional[str] = None


class ClientListRow(BaseModel):
    """Schema for a single client row in the clients list page."""

    id: int
    full_name: str
    net_worth: Optional[float] = None
    growth_percent: Optional[float] = None
    growth_series: Optional[str] = None
    top_sector: Optional[str] = None
    holdings: List[str] = []
    risk_profile: Optional[str] = None


class ClientListResponse(BaseModel):
    """Schema for paginated clients list with computed portfolio fields."""

    page: int
    page_size: int
    total: int
    clients: List[ClientListRow]
