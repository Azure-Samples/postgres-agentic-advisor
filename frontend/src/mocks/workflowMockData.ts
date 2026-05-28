import { type Node, type Edge } from '@xyflow/react';
import { PIPELINE_V_STEP, PIPELINE_V_STEP_UPPER, PIPELINE_H_GAP } from '../constants/workflow';
import { makeRelNodes, makeRelEdges } from '../utils/workflowRelGraph';

// ─── Agent IDs ────────────────────────────────────────────────────────────────

export type AgentId =
  | 'planner'
  | 'news_synthesizer'
  | 'financial_analysis'
  | 'risk_insight'
  | 'brief_generator'
  | 'review'
  | 'response';

// ─── Relationship graph node / edge data shapes ────────────────────────────────

export interface RelationshipNodeData extends Record<string, unknown> {
  label: string;
  description?: string | null;
  highlighted?: boolean;
  terminalHighlighted?: boolean;
  entityType:
    | 'agent'
    | 'client'
    | 'security'
    | 'news'
    | 'data'
    | 'portfolio'
    | 'events'
    | 'articles'
    | 'company';
}

export interface RelationshipEdgeData extends Record<string, unknown> {
  label?: string;
  highlighted?: boolean;
  terminalHighlighted?: boolean;
  isTerminalEdge?: boolean;
  /** True when this edge is part of a bidirectional pair — triggers parallel straight-line rendering */
  isParallel?: boolean;
  /** For parallel edges: 0 = first direction, 1 = second direction. Used to determine lateral shift side. */
  parallelIndex?: number;
}

// ─── Per-agent detail shape ───────────────────────────────────────────────────

export interface AgentDetail {
  id: AgentId;
  label: string;
  input: string;
  output: string;
  reasoning: string;
  sources: string[];
  timestamp: string;
  relationships: {
    nodes: Node<RelationshipNodeData>[];
    edges: Edge<RelationshipEdgeData>[];
  };
}

// ─── Pipeline graph layout ────────────────────────────────────────────────────

export const PIPELINE_AGENT_ORDER: AgentId[] = [
  'planner',
  'news_synthesizer',
  'financial_analysis',
  'risk_insight',
  'brief_generator',
  'review',
  'response',
];

// ─── Node data shapes ──────────────────────────────────────────────────────────

export interface AgentNodeData extends Record<string, unknown> {
  label: string;
  /** Icon name key resolved in AgentNode to an icon component */
  icon: string;
  /** Triggered state controls active/inactive visual style. */
  active?: boolean;
  interactive?: boolean;
  /** Number of bottom (source) handles to render. Default 1 = centered. */
  bottomHandleCount?: number;
  /** Number of top (target) handles to render. Default 1 = centered. */
  topHandleCount?: number;
  /** When true renders the Apache sticker badge in the node's top-right corner */
  showApache?: boolean;
  /** When true renders the memo image badge in the node's top-right corner */
  showMemo?: boolean;
  /** When true renders the agent badge icon in the node's top-right corner */
  showBadge?: boolean;
  /** Execution duration in milliseconds — shown as a badge below the node label */
  durationMs?: number | null;
  /** Force rendering duration strip even when duration is null. */
  showDuration?: boolean;
}

export interface CompactNodeData extends Record<string, unknown> {
  label: string;
  variant: 'event' | 'insight';
  interactive?: boolean;
  /** Number of bottom (source) handles to render. Default 1 = centered. */
  bottomHandleCount?: number;
  /** Number of top (target) handles to render. Default 1 = centered. */
  topHandleCount?: number;
  /** Execution duration in milliseconds — shown as a strip below the node label */
  durationMs?: number | null;
}

// ─── Pipeline nodes ───────────────────────────────────────────────────────────
// Layout mirrors the Figma design:
//   Event (level 0)
//     └─ Relationship Mapping (level 1, badge)
//          └─ Planner (level 2, graph-db)
//               ├─ News Synthesizer (level 3, left)
//               ├─ SEC Filing Analysis (level 3, centre)
//               └─ Stock Analysis (level 3, right)
//                    └─ Risk Insight (level 4, badge) ← driven by SEC Filing

export const PIPELINE_NODES: Node[] = [
  // Level 0 — Event trigger
  {
    id: 'event',
    type: 'eventNode',
    position: { x: 0, y: 0 },
    data: { label: 'Event', bottomHandleCount: 1 },
    selectable: false,
    draggable: false,
  },
  // Level 1 — Relationship Mapping (uses tighter upper step)
  {
    id: 'relationship_mapping',
    type: 'agentNode',
    position: { x: 0, y: PIPELINE_V_STEP_UPPER },
    data: {
      label: 'Relationship Mapping',
      icon: 'relationship',
      showApache: true,
      topHandleCount: 1,
      bottomHandleCount: 1,
    } satisfies AgentNodeData,
  },
  // Level 2 — Planner (uses tighter upper step × 2)
  {
    id: 'planner',
    type: 'agentNode',
    position: { x: 0, y: PIPELINE_V_STEP_UPPER * 2 },
    data: {
      label: 'Planner',
      icon: 'planner',
      topHandleCount: 1,
      bottomHandleCount: 3,
    } satisfies AgentNodeData,
  },
  // Level 3 — parallel research agents (sorted left → right for handle alignment)
  {
    id: 'news_synthesizer',
    type: 'agentNode',
    position: { x: -PIPELINE_H_GAP, y: PIPELINE_V_STEP_UPPER * 2 + PIPELINE_V_STEP },
    data: {
      label: 'News Synthesizer',
      icon: 'news',
      topHandleCount: 1,
      bottomHandleCount: 0,
    } satisfies AgentNodeData,
  },
  {
    id: 'sec_filing',
    type: 'agentNode',
    position: { x: 0, y: PIPELINE_V_STEP_UPPER * 2 + PIPELINE_V_STEP },
    data: {
      label: 'SEC Filing Analysis',
      icon: 'review',
      topHandleCount: 1,
      bottomHandleCount: 1,
    } satisfies AgentNodeData,
  },
  {
    id: 'stock_analysis',
    type: 'agentNode',
    position: { x: PIPELINE_H_GAP, y: PIPELINE_V_STEP_UPPER * 2 + PIPELINE_V_STEP },
    data: {
      label: 'Stock Analysis',
      icon: 'financial',
      topHandleCount: 1,
      bottomHandleCount: 0,
    } satisfies AgentNodeData,
  },
  // Level 4 — Risk Analysis Agent
  {
    id: 'risk_insight',
    type: 'agentNode',
    position: { x: 0, y: PIPELINE_V_STEP_UPPER * 2 + PIPELINE_V_STEP * 2 },
    data: {
      label: 'Risk Analysis Agent',
      icon: 'risk',
      showMemo: true,
      topHandleCount: 1,
      bottomHandleCount: 0,
    } satisfies AgentNodeData,
  },
];

// ─── Pipeline edges ───────────────────────────────────────────────────────────

export const PIPELINE_EDGES: Edge[] = [
  // Spine: Event → Relationship Mapping → Planner
  {
    id: 'e-event-rel',
    source: 'event',
    sourceHandle: 'bottom',
    target: 'relationship_mapping',
    targetHandle: 'top',
    type: 'primaryFlowEdge',
    data: {},
  },
  {
    id: 'e-rel-planner',
    source: 'relationship_mapping',
    sourceHandle: 'bottom',
    target: 'planner',
    targetHandle: 'top',
    type: 'primaryFlowEdge',
    data: {},
  },
  // Fan-out: Planner → three parallel agents (handles spread left → right)
  {
    id: 'e-planner-news',
    source: 'planner',
    sourceHandle: 'bottom-0',
    target: 'news_synthesizer',
    targetHandle: 'top',
    type: 'primaryFlowEdge',
    data: {},
  },
  {
    id: 'e-planner-sec',
    source: 'planner',
    sourceHandle: 'bottom-1',
    target: 'sec_filing',
    targetHandle: 'top',
    type: 'primaryFlowEdge',
    data: {},
  },
  {
    id: 'e-planner-stock',
    source: 'planner',
    sourceHandle: 'bottom-2',
    target: 'stock_analysis',
    targetHandle: 'top',
    type: 'primaryFlowEdge',
    data: {},
  },
  // SEC Filing → Risk Insight
  {
    id: 'e-sec-risk',
    source: 'sec_filing',
    sourceHandle: 'bottom',
    target: 'risk_insight',
    targetHandle: 'top',
    type: 'primaryFlowEdge',
    data: {},
  },
];

// ─── Shared lorem placeholder text ────────────────────────────────────────────

const SHORT_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

const LONG_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

// ─── Mock data — 7 agents ─────────────────────────────────────────────────────

export const AGENT_DETAILS: AgentDetail[] = [
  {
    id: 'planner',
    label: 'Planner',
    input: LONG_TEXT,
    output: LONG_TEXT,
    reasoning: SHORT_TEXT,
    sources: ['Alert Config – May 12', 'Client Profile – May 12', 'Risk Policy – May 12'],
    timestamp: 'May 12 · 14:00 UTC',
    relationships: {
      nodes: makeRelNodes('planner', 'Planner', [
        { id: 'client-jw',   label: 'Client: J. Walsh',     entityType: 'client',    angle: -90 },
        { id: 'portfolio-1', label: 'Portfolio: XLK Heavy',  entityType: 'portfolio', angle: -30 },
        { id: 'alert-1',     label: 'Alert: XLK Pullback',   entityType: 'events',    angle: 30  },
        { id: 'risk-pol-1',  label: 'Risk Policy v3',        entityType: 'articles',  angle: 90  },
        { id: 'news-feed',   label: 'News Feed',             entityType: 'articles',  angle: 150 },
        { id: 'mkt-data-1',  label: 'Market Data',           entityType: 'company',   angle: 210 },
      ]),
      edges: makeRelEdges('planner', ['client-jw', 'portfolio-1', 'alert-1', 'risk-pol-1', 'news-feed', 'mkt-data-1']),
    },
  },
  {
    id: 'news_synthesizer',
    label: 'News Synthesizer',
    input: LONG_TEXT,
    output: LONG_TEXT,
    reasoning: SHORT_TEXT,
    sources: ['CRM Note – May 12', 'Tech-A Business Update – May 12', 'Market Briefing – May 12'],
    timestamp: 'May 12 · 14:00 UTC',
    relationships: {
      nodes: makeRelNodes('news_synthesizer', 'News Synthesizer', [
        { id: 'crm-note-1',  label: 'CRM Note – May 12',           entityType: 'articles',  angle: -90 },
        { id: 'tech-update', label: 'Tech-A Business Update',       entityType: 'company',   angle: -30 },
        { id: 'mkt-brief',   label: 'Market Briefing – May 12',     entityType: 'articles',  angle: 30  },
        { id: 'xlk-sec',     label: 'Security: XLK ETF',            entityType: 'security',  angle: 90  },
        { id: 'nvda-sec',    label: 'Security: NVDA',               entityType: 'security',  angle: 150 },
        { id: 'client-jw2',  label: 'Client: J. Walsh',             entityType: 'client',    angle: 210 },
      ]),
      edges: makeRelEdges('news_synthesizer', ['crm-note-1', 'tech-update', 'mkt-brief', 'xlk-sec', 'nvda-sec', 'client-jw2']),
    },
  },
  {
    id: 'financial_analysis',
    label: 'Financial Analysis',
    input: LONG_TEXT,
    output: LONG_TEXT,
    reasoning: SHORT_TEXT,
    sources: ['Portfolio Snapshot – May 12', 'Model Portfolio v4', 'Benchmark Data – May 12'],
    timestamp: 'May 12 · 14:01 UTC',
    relationships: {
      nodes: makeRelNodes('financial_analysis', 'Financial Analysis', [
        { id: 'port-snap',   label: 'Portfolio Snapshot',    entityType: 'portfolio', angle: -90 },
        { id: 'model-port',  label: 'Model Portfolio v4',    entityType: 'portfolio', angle: -30 },
        { id: 'bench-data',  label: 'Benchmark Data',        entityType: 'company',   angle: 30  },
        { id: 'xlk-alloc',   label: 'XLK Allocation (9%↑)',  entityType: 'events',    angle: 90  },
        { id: 'factor-data', label: 'Factor Risk Data',      entityType: 'articles',  angle: 150 },
        { id: 'client-pf',   label: 'Client: Portfolio',     entityType: 'client',    angle: 210 },
      ]),
      edges: makeRelEdges('financial_analysis', ['port-snap', 'model-port', 'bench-data', 'xlk-alloc', 'factor-data', 'client-pf']),
    },
  },
  {
    id: 'risk_insight',
    label: 'Risk Analysis Agent',
    input: SHORT_TEXT,
    output: LONG_TEXT,
    reasoning: SHORT_TEXT,
    sources: ['Risk Model v2 – May 12', 'Drawdown Analysis – May 12'],
    timestamp: 'May 12 · 14:02 UTC',
    relationships: {
      nodes: makeRelNodes('risk_insight', 'Risk Analysis Agent', [
        { id: 'risk-model',  label: 'Risk Model v2',         entityType: 'articles',  angle: -90 },
        { id: 'drawdown-a',  label: 'Drawdown Analysis',     entityType: 'events',    angle: -30 },
        { id: 'xlk-risk',    label: 'XLK Sector Risk',       entityType: 'security',  angle: 30  },
        { id: 'semi-risk',   label: 'Semiconductor Risk',    entityType: 'articles',  angle: 90  },
        { id: 'client-risk', label: 'Client Risk Profile',   entityType: 'client',    angle: 150 },
      ]),
      edges: makeRelEdges('risk_insight', ['risk-model', 'drawdown-a', 'xlk-risk', 'semi-risk', 'client-risk']),
    },
  },
  {
    id: 'brief_generator',
    label: 'Brief Generator',
    input: SHORT_TEXT,
    output: LONG_TEXT,
    reasoning: SHORT_TEXT,
    sources: ['Advisor Template – May 12', 'Client Brief History'],
    timestamp: 'May 12 · 14:03 UTC',
    relationships: {
      nodes: makeRelNodes('brief_generator', 'Brief Generator', [
        { id: 'adv-tmpl',   label: 'Advisor Template',     entityType: 'events',    angle: -90 },
        { id: 'brief-hist', label: 'Client Brief History', entityType: 'client',    angle: -30 },
        { id: 'risk-out',   label: 'Risk Insight Output',  entityType: 'articles',  angle: 30  },
        { id: 'fin-out',    label: 'Fin Analysis Output',  entityType: 'company',   angle: 90  },
        { id: 'client-br',  label: 'Client: J. Walsh',     entityType: 'client',    angle: 150 },
      ]),
      edges: makeRelEdges('brief_generator', ['adv-tmpl', 'brief-hist', 'risk-out', 'fin-out', 'client-br']),
    },
  },
  {
    id: 'review',
    label: 'Review',
    input: SHORT_TEXT,
    output: LONG_TEXT,
    reasoning: SHORT_TEXT,
    sources: ['Compliance Rules – May 12', 'Draft Brief – May 12'],
    timestamp: 'May 12 · 14:04 UTC',
    relationships: {
      nodes: makeRelNodes('review', 'Review', [
        { id: 'comp-rules', label: 'Compliance Rules',  entityType: 'articles',  angle: -90 },
        { id: 'draft-brief',label: 'Draft Brief',       entityType: 'events',    angle: -30 },
        { id: 'reg-data',   label: 'Regulatory Data',   entityType: 'company',   angle: 30  },
        { id: 'suitability',label: 'Suitability Check', entityType: 'portfolio', angle: 90  },
        { id: 'client-rv',  label: 'Client: J. Walsh',  entityType: 'client',    angle: 150 },
      ]),
      edges: makeRelEdges('review', ['comp-rules', 'draft-brief', 'reg-data', 'suitability', 'client-rv']),
    },
  },
  {
    id: 'response',
    label: 'Response',
    input: SHORT_TEXT,
    output: LONG_TEXT,
    reasoning: SHORT_TEXT,
    sources: ['Approved Brief – May 12', 'Send Config – May 12'],
    timestamp: 'May 12 · 14:05 UTC',
    relationships: {
      nodes: makeRelNodes('response', 'Response', [
        { id: 'appr-brief',   label: 'Approved Brief',      entityType: 'articles', angle: -90 },
        { id: 'send-cfg',     label: 'Send Configuration',  entityType: 'events',   angle: -30 },
        { id: 'channel-email',label: 'Channel: Email',      entityType: 'events',   angle: 30  },
        { id: 'client-resp',  label: 'Client: J. Walsh',    entityType: 'client',   angle: 90  },
        { id: 'crm-update',   label: 'CRM Update Log',      entityType: 'company',  angle: 150 },
      ]),
      edges: makeRelEdges('response', ['appr-brief', 'send-cfg', 'channel-email', 'client-resp', 'crm-update']),
    },
  },
];

/** O(1) lookup by agent id */
export const AGENT_DETAIL_MAP = new Map<AgentId, AgentDetail>(
  AGENT_DETAILS.map((a) => [a.id, a]),
);
