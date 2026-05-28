from sqlalchemy import (
    TIMESTAMP,
    Boolean,
    Column,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from src.models.base import Base


class Alert(Base):
    __tablename__ = "alert"
    __table_args__ = (
        UniqueConstraint(
            "trigger_id",
            "client_id",
            "ticker",
            name="uq_alert_trigger_client_ticker",
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    trigger_id = Column(
        Integer,
        ForeignKey("workflow_trigger.id", ondelete="SET NULL"),
        nullable=True,
    )
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    trend = Column(String, nullable=False)
    ticker = Column(String, nullable=True)
    client_id = Column(Integer, nullable=False)
    client_name = Column(String, nullable=False)
    alert_heading_1 = Column(String, nullable=False)
    alert_heading_2 = Column(Text, nullable=False)
    supply_chain_path = Column(JSONB, nullable=True)

    client_net_worth = Column(Numeric(20, 2), nullable=True)
    client_portfolio_value = Column(Numeric(20, 2), nullable=True)
    client_growth = Column(String, nullable=True)
    client_risk_profile = Column(String, nullable=True)

    key_insight = Column(String, nullable=True)
    reasoning_behind_advice = Column(Text, nullable=True)

    advice_headline = Column(String, nullable=True)
    advice_detail = Column(Text, nullable=True)
    alert_drivers = Column(JSONB, nullable=True)
    impact_summary = Column(Text, nullable=True)
    sources = Column(JSONB, nullable=True)

    planning_agent_response = Column(Text, nullable=True)
    news_synthesizer_agent_response = Column(Text, nullable=True)
    financial_analysis_agent_response = Column(Text, nullable=True)
    risk_insight_agent_response = Column(Text, nullable=True)
    phoenix_trace_id = Column(String, nullable=True, index=True)
    trace_graph = Column(JSONB, nullable=True)

    is_outdated = Column(Boolean, nullable=False, default=False, server_default="false")
    mem0_used = Column(Boolean, nullable=False, default=False, server_default="false")

    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
