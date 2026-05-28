import { MarkerType, Position, type Edge, type Node } from '@xyflow/react';
import type { AlertAgentsGraph, AlertAgentsGraphNode } from '@/api/types/alert.types';
import { PIPELINE_V_STEP, PIPELINE_V_STEP_UPPER, PIPELINE_H_GAP } from '@/constants/workflow';
import type { AgentNodeData, CompactNodeData } from '@/mocks/workflowMockData';

// Horizontal gap between sibling node centers — node width (220) + 52px gutter
const LEVEL_H_GAP = PIPELINE_H_GAP;

// Synthetic node id for the event trigger placed above the first backend level
export const EVENT_NODE_ID = 'workflow_event_trigger';
// Synthetic Ask AI node injected between Event/Query and backend root nodes in the chat variant
export const ASK_AI_NODE_ID = 'workflow_ask_ai';

interface WorkflowOverviewGraphOptions {
  /** Label for the synthetic root node (default: Event). */
  rootLabel?: string;
  /** Whether to inject a static Ask AI node between Event and backend root nodes (chat variant). */
  injectAskAi?: boolean;
  /** Always show duration strip on agent nodes (uses 0.00 sec when null). */
  forceDurationDisplay?: boolean;
  /** When true, shows the mem0 memory badge on the Risk Insight Agent node. */
  mem0Used?: boolean;
  /** Node IDs that have actual relationship graph data — Apache icon only shown when the node is in this set. */
  nodesWithRelationships?: Set<string>;
}

const normalizeAgentToken = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');

/** Returns true for evaluation agents that should be hidden on the frontend. */
export const isEvaluationAgent = ({ id, label }: AlertAgentsGraphNode): boolean => {
  const norm = normalizeAgentToken(id + ' ' + label);
  return norm.includes('evaluation') || norm.includes('evaluator');
};

/** Returns true for ask_ai agents — replaced by the synthetic Ask AI node in the chat variant. */
const isAskAiAgent = ({ id, label }: AlertAgentsGraphNode): boolean => {
  const norm = normalizeAgentToken(id + ' ' + label);
  return norm.includes('ask_ai') || (norm.includes('ask') && norm.includes('ai'));
};

const resolveAgentIcon = ({ id, label }: AlertAgentsGraphNode): AgentNodeData['icon'] => {
  const normalized = `${normalizeAgentToken(id)} ${normalizeAgentToken(label)}`;

  if (normalized.includes('plan')) return 'planner';
  if (normalized.includes('news')) return 'news';
  if (normalized.includes('relationship') || normalized.includes('mapping') || normalized.includes('impact')) {
    return 'relationship';
  }
  if (normalized.includes('stock') || normalized.includes('financial')) {
    return 'financial';
  }
  if (normalized.includes('risk') || normalized.includes('insight')) return 'risk';
  if (normalized.includes('analysis')) return 'analysis';
  if (normalized.includes('brief')) return 'brief';
  if (normalized.includes('review') || normalized.includes('sec') || normalized.includes('filing')) return 'review';

  return 'review';
};

// ─── Spatial handle spreading ──────────────────────────────────────────────────
// Instead of invisible bus nodes, we give each fan-out source and fan-in target
// N physical handles spread across the node width (sorted left-to-right so no
// edges ever cross). Each edge then gets a unique sourceHandle / targetHandle.
/**
 * Given a list of node IDs, sort them left-to-right by their X position.
 * Nodes not in posMap fall back to x=0 (treated as center).
 */
const sortByX = (ids: string[], posMap: Map<string, { x: number; y: number }>) =>
  [...ids].sort((a, b) => (posMap.get(a)?.x ?? 0) - (posMap.get(b)?.x ?? 0));

/** Resolve the handle id string given the index and the total count. */
const resolveHandleId = (base: 'bottom' | 'top', idx: number, count: number) =>
  count === 1 ? base : `${base}-${idx}`;

export const buildWorkflowOverviewGraph = (
  graph?: AlertAgentsGraph,
  interactive = false,
  options?: WorkflowOverviewGraphOptions,
): { nodes: Node[]; edges: Edge[] } | null => {
  if (!graph?.nodes?.length) return null;

  const rootLabel = options?.rootLabel ?? 'Event';
  const injectAskAi = options?.injectAskAi ?? false;
  const forceDurationDisplay = options?.forceDurationDisplay ?? false;
  const mem0Used = options?.mem0Used ?? false;
  const nodesWithRelationships = options?.nodesWithRelationships;

  // Filter out evaluation agents and (optionally) ask_ai agents.
  // The Event-to-Impact Mapping node is now provided by the backend so we no
  // longer filter or synthesize it — it renders dynamically like any other.
  const sortedNodes = [...graph.nodes]
    .filter((n) => !isEvaluationAgent(n) && (!injectAskAi || !isAskAiAgent(n)))
    .sort((a, b) => a.level - b.level);

  if (!sortedNodes.length) return null;

  const minLevel = sortedNodes[0].level;

  // Group backend nodes by their level
  const nodesByLevel = new Map<number, AlertAgentsGraphNode[]>();
  sortedNodes.forEach((node) => {
    const list = nodesByLevel.get(node.level) ?? [];
    list.push(node);
    nodesByLevel.set(node.level, list);
  });

  // Synthesize the "Event" trigger — rendered as an eventNode at the top of
  // the pipeline canvas, providing a natural anchor for the outgoing edges.
  // The enrichedNodes step below will inject bottomHandleCount so the node's
  // handles match the edge IDs.
  const eventNode: Node = {
    id: EVENT_NODE_ID,
    type: 'eventNode',
    position: { x: 0, y: 0 },
    data: { label: rootLabel },
    selectable: false,
    draggable: false,
  };

  // Synthetic Ask AI node — always shown between Query and backend root nodes in the chat variant
  const askAiNode: Node = {
    id: ASK_AI_NODE_ID,
    type: 'agentNode',
    position: { x: 0, y: PIPELINE_V_STEP_UPPER },
    data: {
      label: 'Ask AI',
      icon: 'ask_ai',
      interactive,
      active: true,
    } satisfies AgentNodeData,
    selectable: false,
    draggable: false,
  };

  // Vertical offset for backend nodes:
  //   alert variant — Event(0), backend rows start at 1
  //   chat  variant — Query(0), Ask AI(1), backend rows start at 2
  const backendRowOffset = injectAskAi ? 2 : 1;

  // Build all agent / insight nodes
  const agentNodes: Node[] = [...nodesByLevel.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([, levelNodes]) => {
      const totalWidth = (levelNodes.length - 1) * LEVEL_H_GAP;
      const startX = -totalWidth / 2;

      return levelNodes.map((node, i) => {
        const row = node.level - minLevel + backendRowOffset;
        // Rows 1 & 2 (Event→root, root→planning) use the tighter upper step.
        // All rows below planning keep the original uniform step so the
        // fan-out section stays visually consistent.
        const y = row <= 2
          ? row * PIPELINE_V_STEP_UPPER
          : 2 * PIPELINE_V_STEP_UPPER + (row - 2) * PIPELINE_V_STEP;
        const position = {
          x: startX + i * LEVEL_H_GAP,
          y,
        };

        const agentIcon = resolveAgentIcon(node);
        // event_to_impact_mapping is always active — it is the entry point
        // for the relationship graph and has no meaningful "not triggered" state.
        const isAlwaysActive = agentIcon === 'relationship';
        return {
          id: node.id,
          type: 'agentNode',
          position,
          data: {
            label: node.label,
            icon: agentIcon,
            interactive,
            active: isAlwaysActive || node.triggered,
            showBadge: false,
            // Show the Apache supply-chain sticker only when the relationship
            // node has actual relationship data in the API response.
            showApache: agentIcon === 'relationship' && (nodesWithRelationships?.has(node.id) ?? false),
            showMemo: agentIcon === 'risk' && mem0Used,
            durationMs: node.duration_ms ?? null,
            showDuration: forceDurationDisplay,
          } satisfies AgentNodeData,
        } as Node;
      });
    });

  const allNodes = injectAskAi ? [eventNode, askAiNode, ...agentNodes] : [eventNode, ...agentNodes];
  const posMap = new Map(allNodes.map((n) => [n.id, n.position]));
  const nodeIds = new Set(agentNodes.map((n) => n.id));

  // Root nodes = backend nodes with no incoming edge from another backend node.
  // Only count internal backend→backend edges to avoid synthetic/filtered nodes
  // (e.g. ask_ai) corrupting root detection.
  const nodesWithIncoming = new Set(
    graph.edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to)).map((e) => e.to),
  );
  const rootNodeIds = sortedNodes.filter((n) => !nodesWithIncoming.has(n.id)).map((n) => n.id);

  const rawPairs: { source: string; target: string }[] = [
    ...(injectAskAi
      ? [
          // Query → Ask AI (always single edge)
          { source: EVENT_NODE_ID, target: ASK_AI_NODE_ID },
          // Ask AI → backend root nodes
          ...rootNodeIds.map((id) => ({ source: ASK_AI_NODE_ID, target: id })),
        ]
      : [
          // Event/Query synthetic root connects to all backend roots
          ...rootNodeIds.map((id) => ({ source: EVENT_NODE_ID, target: id })),
        ]),
    // Internal backend edges
    ...graph.edges
      .filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to))
      .map((e) => ({ source: e.from, target: e.to })),
  ];

  // ── Build per-node fan lists, sorted spatially left→right ─────────────────
  // outTargets[sourceId] = targets sorted by X (left to right)
  const outTargets = new Map<string, string[]>();
  // inSources[targetId]  = sources sorted by X (left to right)
  const inSources = new Map<string, string[]>();

  rawPairs.forEach(({ source, target }) => {
    const ot = outTargets.get(source) ?? [];
    ot.push(target);
    outTargets.set(source, ot);
    const ins = inSources.get(target) ?? [];
    ins.push(source);
    inSources.set(target, ins);
  });

  // Sort spatially so the i-th handle connects to the i-th node (no crossings)
  outTargets.forEach((targets, src) => outTargets.set(src, sortByX(targets, posMap)));
  inSources.forEach((sources, tgt) => inSources.set(tgt, sortByX(sources, posMap)));

  // ── Inject handle counts into node data ───────────────────────────────────
  const enrichedNodes = allNodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      bottomHandleCount: outTargets.get(n.id)?.length ?? 0,
      topHandleCount: inSources.get(n.id)?.length ?? 1,
    },
  }));

  // ── Build final edges with unique, spatially-ordered handle IDs ───────────
  // An edge is "active" when its target node is triggered (or when target is
  // a synthetic node like Event/Ask AI/Relationship Mapping, which we always
  // consider active). Inactive edges render in the lighter
  // `workflow.pipelineEdgeInactive` colour to mirror the inactive state of
  // their target node — see Figma 3097-58829.
  const triggeredById = new Map(sortedNodes.map((n) => [n.id, n.triggered]));
  // Collect IDs of nodes that are always considered active (relationship/impact mapping).
  const alwaysActiveIds = new Set(sortedNodes.filter((n) => resolveAgentIcon(n) === 'relationship').map((n) => n.id));
  const isEdgeActive = (targetId: string): boolean => {
    if (!nodeIds.has(targetId)) return true; // synthetic targets are always active
    if (alwaysActiveIds.has(targetId)) return true; // relationship/impact mapping always active
    return triggeredById.get(targetId) ?? false;
  };

  const edges: Edge[] = rawPairs.map(({ source, target }) => {
    const targets = outTargets.get(source) ?? [target];
    const sources = inSources.get(target) ?? [source];
    const srcIdx = targets.indexOf(target);
    const tgtIdx = sources.indexOf(source);

    return {
      id: `e-${source}-${target}`,
      source,
      sourceHandle: resolveHandleId('bottom', srcIdx, targets.length),
      sourcePosition: Position.Bottom,
      target,
      targetHandle: resolveHandleId('top', tgtIdx, sources.length),
      targetPosition: Position.Top,
      type: 'primaryFlowEdge',
      markerEnd: {
        type: MarkerType.Arrow,
        color: 'currentColor',
        width: 16,
        height: 16,
        strokeWidth: 1.75,
      },
      data: { active: isEdgeActive(target), borderRadius: 10 },
    };
  });

  return { nodes: enrichedNodes, edges };
};
