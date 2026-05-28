import type { AlertAgentsGraph, AlertAgentsOutput } from './alert.types';

export interface ChatRelationshipNode {
  label: string;
  highlighted: boolean;
}

export interface ChatRelationshipEdge {
  source: string;
  target: string;
  relationship_type: string;
  highlighted: boolean;
}

export interface ChatRelationshipsPayload {
  nodes: ChatRelationshipNode[];
  edges: ChatRelationshipEdge[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
  /** Stream turn id emitted after done; used to fetch backend workflow graph. */
  turnId?: number | null;
  /** Populated when the stream includes a `type: "relationships"` chunk. */
  relationships?: ChatRelationshipsPayload | null;
  /** Populated when the stream includes a `type: "agents_graph"` chunk (full workflow). */
  agentsGraph?: AlertAgentsGraph | null;
  /** Populated alongside `agentsGraph` with per-agent execution output. */
  agentsOutput?: AlertAgentsOutput | null;
  /** Populated when the stream includes a `type: "alert"` chunk — the alert id can be used to fetch full workflow graph. */
  alertId?: number | null;
  /** True when the stream emitted a `type: "memory_saved"` chunk — shows the Memory Updated badge in UI. */
  memorySaved?: boolean;
  /** Agents currently being analyzed, populated by `type: "analyzing"` stream events before content arrives. */
  analyzingAgents?: string[];
  /** When true the message should be rendered as a graceful error bubble instead of normal content. */
  isError?: boolean;
  /** Discriminates the error kind so the bubble shows the right copy. */
  errorKind?: 'stream' | 'history';
}

export interface SendMessageRequest {
  text: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
}
