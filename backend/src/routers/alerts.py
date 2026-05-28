import json

from fastapi import APIRouter, Depends, HTTPException, Request
from src.lifespan_manager import (
    get_alert_workflow_service,
    get_async_db_session,
    get_source_highlight_service,
)
from src.repositories.alerts import AlertRepository
from src.repositories.graph import GraphRepository
from src.schemas.alerts import (
    AgentOutput,
    AgentResponse,
    AgentsGraph,
    AgentsOutput,
    AlertWorkflowRequest,
    EventToImpactOutput,
    EventToImpactResponse,
    GetAllAlertsResponse,
    GraphEdge,
    GraphNode,
    RelationshipGraph,
    SummaryResponse,
)

router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
)


@router.get("/all", response_model=GetAllAlertsResponse)
async def get_alerts_for_client(
    http_request: Request,
    client_id: int,
    workflow_service=Depends(get_alert_workflow_service),
    async_db_session=Depends(get_async_db_session),
):

    result = await workflow_service.get_alerts_for_client(
        client_id=client_id,
        user_id=int(http_request.headers.get("x-user-id")),
        async_db_session=async_db_session,
    )

    return GetAllAlertsResponse(alerts=result)


@router.get("/{alert_id}", response_model=SummaryResponse)
async def get_alert_summary(
    alert_id: int,
    workflow_service=Depends(get_alert_workflow_service),
    async_db_session=Depends(get_async_db_session),
):
    """Get a summary of the alert workflow."""
    details, trigger, security = (
        await workflow_service.get_alert_details_for_view_summary_endpoint(
            alert_id,
            async_db_session,
        )
    )

    if not details:
        raise HTTPException(
            status_code=404,
            detail=f"Alert with id {alert_id} not found.",
        )

    # True only if interactive advisor preferences were active when this alert was generated.
    risk_insight_mem0_used = bool(details.mem0_used)

    trace = details.trace_graph or {}
    graph_data = trace.get("graph", {"nodes": [], "edges": []})
    agent_outputs_raw = trace.get("agent_outputs", {})

    graph_repo = GraphRepository(async_db_session)
    chain_names: list[str] = details.supply_chain_path or []
    # Indirect = alert was triggered through a supply chain relationship (>1 hop)
    is_indirect = len(chain_names) > 1

    # Only build the relationship graph for indirect alerts; direct alerts were
    # found in the relational DB and have no graph path to visualize.
    company_graph: RelationshipGraph | None = None
    if is_indirect:
        graph_raw = await graph_repo.get_companies_and_relationships_for_chain(
            chain_names,
        )
        # Nodes/edges on the chain path are highlighted for the frontend
        highlighted_names: set[str] = set(chain_names)
        company_graph = RelationshipGraph(
            nodes=[
                GraphNode(
                    name=n["name"],
                    description=n.get("description"),
                    highlighted=n["name"] in highlighted_names,
                )
                for n in graph_raw["nodes"]
            ],
            edges=[
                GraphEdge(
                    source=e["source"],
                    target=e["target"],
                    relationship_type=e["relationship_type"],
                    highlighted=e["source"] in highlighted_names
                    and e["target"] in highlighted_names,
                )
                for e in graph_raw["edges"]
            ],
        )

    def _build_agent_output(node_id: str) -> AgentOutput:
        raw = agent_outputs_raw.get(node_id, {})
        return AgentOutput(
            responses=AgentResponse(
                input=raw.get("input") or "",
                output=raw.get("output") or "",
                reasoning=raw.get("reasoning") or "",
            ),
        )

    def _build_client_impact_analysis_output() -> EventToImpactOutput:
        trigger_type = trigger.trigger_type if trigger else "unknown"
        company_name = security.name if security else "unknown"
        alert_date = str(details.date) if details.date else "unknown"
        signal = (
            trigger.news_text
            if trigger and trigger.news_text
            else "No signal text available."
        )

        input_text = (
            f"Trigger: {trigger_type}\n"
            f"Company: {company_name}\n"
            f"Date: {alert_date}\n"
            f"Signal: {signal}"
        )

        chain = details.supply_chain_path or []
        if len(chain) > 1:
            chain_str = " → ".join(chain)
            output_text = (
                f"Client: {details.client_name} → "
                f"{chain[-1]} (Indirect via {chain_str})"
            )
        else:
            output_text = (
                f"Client: {details.client_name} → {company_name} (Direct holding)"
            )

        return EventToImpactOutput(
            responses=EventToImpactResponse(
                input=input_text,
                output=output_text,
            ),
            relationship_graph=company_graph if is_indirect else None,
        )

    def _parse_json_field(value):
        """Safely parse a JSON string field into a Python object."""
        if not value:
            return None
        if isinstance(value, (list, dict)):
            return value
        try:
            return json.loads(value)
        except Exception:
            return None

    return SummaryResponse(
        alert_id=details.id,
        client_name=details.client_name,
        client_net_worth=details.client_net_worth,
        client_portfolio_value=details.client_portfolio_value,
        client_growth=details.client_growth,
        client_risk_profile=details.client_risk_profile,
        alert_heading_1=details.alert_heading_1,
        alert_heading_2=details.alert_heading_2,
        key_insight=details.key_insight,
        advice_headline=details.advice_headline,
        advice_detail=details.advice_detail,
        alert_drivers=details.alert_drivers or [],
        reasoning_behind_advice=_parse_json_field(details.reasoning_behind_advice)
        or [],
        impact_summary=details.impact_summary,
        sources=details.sources or [],
        agents_graph=AgentsGraph(
            nodes=graph_data.get("nodes", []),
            edges=graph_data.get("edges", []),
        ),
        agents_output=AgentsOutput(
            client_impact_analysis=_build_client_impact_analysis_output(),
            planning_agent=_build_agent_output("planning"),
            news_synthesizer_agent=_build_agent_output("news_synthesizer"),
            stock_analysis_agent=_build_agent_output("stock_analysis"),
            sec_filing_agent=_build_agent_output("sec_filing_analysis"),
            risk_insight_agent=_build_agent_output("risk_insight"),
        ),
        supply_chain_path=[
            t for t in (details.supply_chain_path or []) if t is not None
        ],
        risk_insight_mem0_used=risk_insight_mem0_used,
        trigger=trigger.trigger_type if trigger else None,
    )


@router.post("/all", response_model=GetAllAlertsResponse)
async def get_alerts_on_date(
    request: AlertWorkflowRequest,
    http_request: Request,
    workflow_service=Depends(get_alert_workflow_service),
    async_db_session=Depends(get_async_db_session),
):
    """Trigger the alert workflow for a specific date."""
    result = await workflow_service.run(
        date=request.date,
        user_id=int(http_request.headers.get("x-user-id")),
        async_db_session=async_db_session,
    )

    return GetAllAlertsResponse(alerts=result)


@router.delete("/{alert_id}")
async def delete_alert(
    alert_id: int,
    async_db_session=Depends(get_async_db_session),
):

    alert_repository = AlertRepository(async_db_session)
    result = await alert_repository.delete(alert_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Alert with id {alert_id} not found.",
        )


@router.get("/{alert_id}/sources/{source_id}")
async def get_source_highlight(
    alert_id: int,
    source_id: int,
    highlight_service=Depends(get_source_highlight_service),
    async_db_session=Depends(get_async_db_session),
):
    """
    Return annotated markdown for a source document with reference sentences highlighted.
    Generated and cached on first call; returned directly from DB on subsequent calls.
    """
    annotated_markdown = await highlight_service.get_or_generate_highlight(
        alert_id=alert_id,
        source_id=source_id,
        db_session=async_db_session,
    )

    if not annotated_markdown:
        raise HTTPException(
            status_code=404,
            detail=f"Source {source_id} not found for alert {alert_id}.",
        )

    return {"annotated_markdown": annotated_markdown}
