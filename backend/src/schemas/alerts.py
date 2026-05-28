import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, field_validator


class AlertWorkflowRequest(BaseModel):
    date: Optional[str] = None


class GraphNode(BaseModel):
    name: str
    description: Optional[str] = None
    highlighted: bool = False


class GraphEdge(BaseModel):
    source: str
    target: str
    relationship_type: str
    highlighted: bool = False


class RelationshipGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class AgentResponse(BaseModel):
    input: str
    output: str
    reasoning: str


class EventToImpactResponse(BaseModel):
    input: str
    output: str


class AgentOutput(BaseModel):
    responses: AgentResponse


class EventToImpactOutput(BaseModel):
    responses: EventToImpactResponse
    relationship_graph: Optional[RelationshipGraph] = None


class AgentsGraph(BaseModel):
    nodes: List[dict]
    edges: List[dict]


class AgentsOutput(BaseModel):
    client_impact_analysis: EventToImpactOutput
    planning_agent: AgentOutput
    news_synthesizer_agent: AgentOutput
    stock_analysis_agent: AgentOutput
    sec_filing_agent: AgentOutput
    risk_insight_agent: AgentOutput


class SummaryResponse(BaseModel):
    alert_id: int
    client_name: str
    client_net_worth: Optional[float] = None
    client_portfolio_value: Optional[float] = None
    client_growth: Optional[str] = None
    client_risk_profile: Optional[str] = None
    alert_heading_1: Optional[str] = None
    alert_heading_2: Optional[str] = None
    key_insight: Optional[str] = None
    advice_headline: Optional[str] = None
    advice_detail: Optional[str] = None
    alert_drivers: Optional[List] = None
    reasoning_behind_advice: Optional[List] = None
    impact_summary: Optional[str] = None
    sources: Optional[List] = None
    agents_graph: AgentsGraph
    agents_output: AgentsOutput
    supply_chain_path: Optional[List[str]] = None
    risk_insight_mem0_used: bool = False
    trigger: Optional[str] = None


class CompanyInfo(BaseModel):
    ticker: str
    company_name: str | None
    company_description: str | None

    model_config = ConfigDict(from_attributes=True)


class Alert(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trend: str
    client_name: str
    alert_heading_1: str
    alert_heading_2: str
    date: str
    companies: list[CompanyInfo] = []

    @field_validator("date", mode="before")
    @classmethod
    def coerce_date_to_str(cls, v: Any) -> str:
        if isinstance(v, (datetime.date, datetime.datetime)):
            return v.isoformat()
        return v


class GetAllAlertsResponse(BaseModel):
    alerts: List[Alert]
