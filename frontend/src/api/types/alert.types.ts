/**
 * Alert-related types and response interfaces
 */

export interface AlertCompany {
  ticker: string;
  company_name: string;
  company_description: string;
}

export interface Alert {
  /** Unique identifier for the alert */
  id: number;
  /** Trend direction ('up' or 'down') */
  trend: 'up' | 'down';
  /** Name of the client associated with the alert */
  client_name: string;
  /** Primary title text of the alert */
  alert_heading_1: string;
  /** Secondary description text providing additional context */
  alert_heading_2: string;
  /** Companies referenced in this alert (for hover tooltips) */
  companies?: AlertCompany[];
  /** Date of the alert (YYYY-MM-DD format) */
  date: string;
}

export interface GetAlertsResponse {
  /** Array of alert objects */
  alerts: Alert[];
}

export interface SuggestedResponse {
  suggested_response_id: number;
  alert_id: number;
  title: string;
  description: string;
}

export interface AlertAgentsGraphNode {
  id: string;
  label: string;
  level: number;
  triggered: boolean;
  duration_ms: number | null;
}

export interface AlertAgentsGraphEdge {
  to: string;
  from: string;
}

export interface AlertAgentsGraph {
  nodes: AlertAgentsGraphNode[];
  edges: AlertAgentsGraphEdge[];
}

export interface AlertAgentResponsePayload {
  input: string;
  output: string;
  reasoning: string;
  sources: AlertSourceLike[] | null;
}

export interface AlertSourceObject {
  id?: number | string;
  title?: string;
  source_type?: string;
  /** Short code identifying the reporting organisation — used to select a banner image */
  reporting_company?: string;
  [key: string]: unknown;
}

export type AlertSourceLike = string | AlertSourceObject;

export interface AlertAgentRelationshipNodePayload {
  /** New backend field – primary source of the node name */
  name?: string;
  /** Legacy field – kept for backward compatibility */
  label?: string;
  /** Optional description shown below the node label */
  description?: string | null;
  highlighted: boolean;
}

export interface AlertAgentRelationshipEdgePayload {
  source: string;
  target: string;
  relationship_type: string;
  highlighted: boolean;
}

export interface AlertAgentRelationshipsPayload {
  nodes: AlertAgentRelationshipNodePayload[];
  edges: AlertAgentRelationshipEdgePayload[];
}

export interface AlertAgentExecutionPayload {
  responses: AlertAgentResponsePayload;
  /** Legacy key used by planner-style agents */
  relationships?: AlertAgentRelationshipsPayload;
  /** New key used by event_to_impact_mapping and future agents */
  relationship_graph?: AlertAgentRelationshipsPayload;
  /**
   * Structured summary produced by the Risk Insight Agent.
   * Present as a sibling of `responses` in the execution payload.
   * Rendered as a "Reasoning Context" collapsible at the end of the output box.
   */
  alert_data?: Record<string, unknown> | null;
}

export type AlertAgentsOutput = Record<string, AlertAgentExecutionPayload>;

export interface ReasoningBehindAdviceItem {
  title: string;
  status_in_alert_chain: string;
  reason: string;
}

export interface AlertSummary {
  alert_id: number;
  client_name: string;
  client_net_worth: number | null;
  client_portfolio_value: number | null;
  client_growth: string | null;
  client_risk_profile?: string | null;
  ai_summary_title: string;
  ai_summary_description: string;
  /** e.g. "Earnings Report" — displayed as "Trigger: <value>" at the top of the insight card */
  trigger?: string | null;
  key_insight?: string | null;
  advice_headline?: string | null;
  advice_detail?: string | null;
  alert_drivers?: string[] | null;
  reasoning_behind_advice?: ReasoningBehindAdviceItem[] | null;
  impact_summary?: string | null;
  sources?: AlertSourceLike[] | null;
  suggested_responses: SuggestedResponse[];
  agents_graph?: AlertAgentsGraph;
  agents_output?: AlertAgentsOutput;
  supply_chain_path?: string[];
  planning_agent?: string;
  news_synthesizer_agent?: string;
  financial_advisor_agent?: string;
  risk_insight_agent?: string;
  brief_agent?: string;
  /** True when the Risk Insight Agent used mem0 memory during this alert's analysis. */
  risk_insight_mem0_used?: boolean;
}
