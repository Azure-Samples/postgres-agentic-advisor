import { type Edge, type Node, Position } from '@xyflow/react';
import type {
  AlertAgentsGraph,
  AlertAgentsGraphNode,
  AlertSourceLike,
  AlertSourceObject,
  AlertAgentsOutput,
  AlertAgentExecutionPayload,
  AlertAgentResponsePayload,
  AlertAgentRelationshipNodePayload,
  AlertAgentRelationshipEdgePayload,
} from '@/api/types/alert.types';
import type { RelationshipEdgeData, RelationshipNodeData } from '@/mocks/workflowMockData';
import { isEvaluationAgent } from './workflowGraphAdapter';

/** Estimated rendered width of a relationship node (px) */
const NODE_WIDTH = 260;
/** Estimated rendered height of a relationship node (px) — tall enough for 3 lines of wrapped text */
const NODE_HEIGHT = 110;
// ── Hub-centric radial layout ─────────────────────────────────────────────
// Hub (most connections) in the center. Ring-1 neighbors fan uniformly on an
// ellipse. Ring-2+ nodes are placed in the same angular sector as their
// ring-1 parent so deeper nodes stay close to their branch — no node is sent
// to a random corner of the canvas.
function buildHubCentricLayout(
  nodeIds: string[],
  layoutEdges: { source: string; target: string }[],
): Map<string, { x: number; y: number }> {
  if (!nodeIds.length) return new Map();
  if (nodeIds.length === 1) return new Map([[nodeIds[0], { x: 0, y: 0 }]]);

  // Build undirected adjacency
  const adj = new Map<string, Set<string>>();
  nodeIds.forEach((id) => adj.set(id, new Set()));
  layoutEdges.forEach(({ source, target }) => {
    adj.get(source)?.add(target);
    adj.get(target)?.add(source);
  });

  // Hub = node with highest degree
  const hub = nodeIds.reduce(
    (best, id) => ((adj.get(id)?.size ?? 0) > (adj.get(best)?.size ?? 0) ? id : best),
    nodeIds[0],
  );

  const positions = new Map<string, { x: number; y: number }>();
  // Stores the angle each node is placed at so children inherit the same sector
  const placedAngle = new Map<string, number>();
  const visited = new Set<string>([hub]);

  positions.set(hub, { x: 0, y: 0 });

  // Elliptical ring radii: wide X, compressed Y so the graph stays flat
  const RING_X_RADII = [460, 820];
  // Y is compressed to ~55% of X to avoid huge vertical spread
  const Y_FACTOR = 0.55;
  // Max angular fan when multiple siblings share a parent sector
  const CHILD_SPREAD = Math.PI / 5;

  // ── Ring 1: direct hub neighbors, uniformly spread ─────────────────────
  const ring1 = [...(adj.get(hub) ?? [])];
  ring1.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / ring1.length - Math.PI / 2;
    placedAngle.set(id, angle);
    visited.add(id);
    positions.set(id, {
      x: Math.round(RING_X_RADII[0] * Math.cos(angle)),
      y: Math.round(RING_X_RADII[0] * Y_FACTOR * Math.sin(angle)),
    });
  });

  // ── Ring 2+: each node fans out from its parent's sector ───────────────
  let frontier = ring1;
  let ringIndex = 1;

  while (frontier.length > 0 && ringIndex < RING_X_RADII.length) {
    const xRadius = RING_X_RADII[ringIndex];
    const nextFrontier: string[] = [];

    // Group unvisited children by their ring-1 (or prior-ring) parent
    const byParent = new Map<string, string[]>();
    frontier.forEach((parentId) => {
      [...(adj.get(parentId) ?? [])]
        .filter((n) => !visited.has(n))
        .forEach((child) => {
          visited.add(child);
          nextFrontier.push(child);
          if (!byParent.has(parentId)) byParent.set(parentId, []);
          byParent.get(parentId)!.push(child);
        });
    });

    // Fan children around their parent's angle
    byParent.forEach((children, parentId) => {
      const pAngle = placedAngle.get(parentId) ?? 0;
      children.forEach((id, i) => {
        const angle = pAngle + CHILD_SPREAD * (i - (children.length - 1) / 2);
        placedAngle.set(id, angle);
        positions.set(id, {
          x: Math.round(xRadius * Math.cos(angle)),
          y: Math.round(xRadius * Y_FACTOR * Math.sin(angle)),
        });
      });
    });

    frontier = nextFrontier;
    ringIndex++;
  }

  // Any disconnected nodes get a compact extra ring
  const remaining = nodeIds.filter((id) => !positions.has(id));
  const extraRadius = RING_X_RADII[RING_X_RADII.length - 1] + 280;
  remaining.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / Math.max(remaining.length, 1) - Math.PI / 2;
    positions.set(id, {
      x: Math.round(extraRadius * Math.cos(angle)),
      y: Math.round(extraRadius * Y_FACTOR * Math.sin(angle)),
    });
  });

  return positions;
}

// ── Edge handle selection based on relative node positions ────────────────
function getEdgeHandles(
  src: { x: number; y: number },
  tgt: { x: number; y: number },
): { sourceHandle: string; targetHandle: string } {
  // Node handles are named "${side}-${slotIndex}" — slot 2 = 50% = center
  const dx = tgt.x - src.x;
  const dy = tgt.y - src.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: 'right-2', targetHandle: 'left-2' }
      : { sourceHandle: 'left-2', targetHandle: 'right-2' };
  }
  return dy >= 0
    ? { sourceHandle: 'bottom-2', targetHandle: 'top-2' }
    : { sourceHandle: 'top-2', targetHandle: 'bottom-2' };
}

const normalizeToken = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');

const tokenize = (value: string) =>
  normalizeToken(value)
    .split(' ')
    .filter((token) => token && token !== 'agent');

const normalizeKey = (value: string) => normalizeToken(value).replace(/\s+/g, '_').replace(/_agent$/, '');

const scoreOutputKeyMatch = (node: AlertAgentsGraphNode, candidateKey: string) => {
  const nodeKeys = [normalizeKey(node.id), normalizeKey(node.label)];
  const candidate = normalizeKey(candidateKey);

  if (nodeKeys.includes(candidate)) {
    return 100;
  }

  if (nodeKeys.some((nodeKey) => nodeKey.startsWith(candidate) || candidate.startsWith(nodeKey))) {
    return 70;
  }

  const nodeTokens = new Set([...tokenize(node.id), ...tokenize(node.label)]);
  const candidateTokens = tokenize(candidateKey);
  const tokenOverlap = candidateTokens.filter((token) => nodeTokens.has(token)).length;

  return tokenOverlap * 10 - Math.abs(nodeTokens.size - candidateTokens.length);
};

const resolveOutputPayload = (
  node: AlertAgentsGraphNode,
  agentsOutput?: AlertAgentsOutput,
): AlertAgentExecutionPayload | undefined => {
  if (!agentsOutput) {
    return undefined;
  }

  const bestMatch = Object.entries(agentsOutput)
    .map(([key, value]) => ({ key, value, score: scoreOutputKeyMatch(node, key) }))
    .sort((left, right) => right.score - left.score)[0];

  if (!bestMatch || bestMatch.score <= 0) {
    return undefined;
  }

  return bestMatch.value;
};

const formatDuration = (durationMs: number | null) => {
  if (durationMs == null) {
    return null;
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(1)} s`;
};

const formatExecutionMeta = (node: AlertAgentsGraphNode) => {
  const duration = formatDuration(node.duration_ms);

  return duration;
};

const sourceToLabel = (source: AlertSourceLike): string => {
  if (typeof source === 'string') {
    return source;
  }

  if (source && typeof source.title === 'string' && source.title.trim()) {
    return source.title;
  }

  if (source && typeof source.source_type === 'string' && source.source_type.trim()) {
    return source.source_type;
  }

  if (source && source.id != null) {
    return String(source.id);
  }

  return 'Unknown source';
};

/** Resolve the display label from the payload, preferring the `name` field (new
 * backend format) over the legacy `label` field. */
const resolveNodeLabel = (node: AlertAgentRelationshipNodePayload): string =>
  (node.name ?? node.label ?? '').trim();

const inferEntityType = (
  relationshipNode: AlertAgentRelationshipNodePayload,
): RelationshipNodeData['entityType'] => {
  const label = resolveNodeLabel(relationshipNode);

  if (/^client\b/i.test(label)) return 'client';
  if (/^portfolio\b/i.test(label)) return 'portfolio';
  if (/\.(pdf|txt|csv)$/i.test(label) || /(filing|article|news|brief|report|note|policy)/i.test(label)) {
    return 'articles';
  }
  if (/(alert|event|trigger|update)/i.test(label)) return 'events';

  return 'company';
};

export const buildRelationshipGraph = (
  relationshipNodes: AlertAgentRelationshipNodePayload[] = [],
  relationshipEdges: AlertAgentRelationshipEdgePayload[] = [],
): { nodes: Node<RelationshipNodeData>[]; edges: Edge<RelationshipEdgeData>[] } => {
  if (!relationshipNodes.length) {
    return { nodes: [], edges: [] };
  }

  // Deduplicate by resolved label
  const dedupedNodes = Array.from(
    new Map(relationshipNodes.map((node) => [resolveNodeLabel(node), node])).values(),
  );

  const edgePairs = relationshipEdges.filter((edge) => edge.source && edge.target);

  // Build stable id map (label → nodeId) upfront so dagre and React Flow share the same ids
  const nodeIdByLabel = new Map<string, string>();
  dedupedNodes.forEach((node, index) => {
    const nodeLabel = resolveNodeLabel(node);
    nodeIdByLabel.set(nodeLabel, normalizeKey(nodeLabel) || `relationship_node_${index}`);
  });

  // Track outgoing degree — needed to detect terminal (leaf) nodes
  const outgoingCount = new Map<string, number>();
  dedupedNodes.forEach((node) => outgoingCount.set(resolveNodeLabel(node), 0));
  edgePairs.forEach((edge) => {
    outgoingCount.set(edge.source, (outgoingCount.get(edge.source) ?? 0) + 1);
  });

  // ── Dagre layout ────────────────────────────────────────────────────────────
  const layoutNodeIds = dedupedNodes.map((node, index) => {
    const nodeLabel = resolveNodeLabel(node);
    return nodeIdByLabel.get(nodeLabel) ?? `relationship_node_${index}`;
  });
  // Deduplicate layout edges: one entry per directed pair (Dagre doesn't need duplicates)
  const layoutEdgeSet = new Set<string>();
  const layoutEdgePairs = edgePairs.flatMap((edge) => {
    const sourceId = nodeIdByLabel.get(edge.source);
    const targetId = nodeIdByLabel.get(edge.target);
    if (!sourceId || !targetId || sourceId === targetId) return [];
    const key = `${sourceId}→${targetId}`;
    if (layoutEdgeSet.has(key)) return [];
    layoutEdgeSet.add(key);
    return [{ source: sourceId, target: targetId }];
  });
  const radialPositions = buildHubCentricLayout(layoutNodeIds, layoutEdgePairs);

  // ── Build React Flow nodes ─────────────────────────────────────────────────
  const flowNodes = dedupedNodes.map((node, index) => {
    const nodeLabel = resolveNodeLabel(node);
    const nodeId = nodeIdByLabel.get(nodeLabel) ?? `relationship_node_${index}`;
    const center = radialPositions.get(nodeId) ?? { x: 0, y: index * (NODE_HEIGHT + 120) };

    // radial positions are centre-based; React Flow expects top-left corner
    const position = { x: center.x - NODE_WIDTH / 2, y: center.y - NODE_HEIGHT / 2 };

    return {
      id: nodeId,
      type: 'relationshipEntity',
      position,
      data: {
        label: nodeLabel,
        description: node.description ?? null,
        entityType: inferEntityType(node),
        highlighted: node.highlighted,
        terminalHighlighted: node.highlighted && (outgoingCount.get(nodeLabel) ?? 0) === 0,
      } satisfies RelationshipNodeData,
    } satisfies Node<RelationshipNodeData>;
  });

  const idByLabel = new Map(flowNodes.map((node) => [node.data.label as string, node.id]));
  const idToLabel = new Map(flowNodes.map((node) => [node.id, node.data.label as string]));

  // ── Merge multi-edges: collapse all edges with same (source, target) into one ──
  // This prevents visual bundles of 3-4 parallel lines between the same node pair.
  type MergedEdge = {
    source: string;
    target: string;
    labels: string[];
    highlighted: boolean;
  };
  const mergedEdgeMap = new Map<string, MergedEdge>();
  edgePairs.forEach((edge) => {
    const source = idByLabel.get(edge.source);
    const target = idByLabel.get(edge.target);
    if (!source || !target || source === target) return;
    const dirKey = `${source}→${target}`;
    const existing = mergedEdgeMap.get(dirKey);
    if (existing) {
      if (edge.relationship_type && !existing.labels.includes(edge.relationship_type)) {
        existing.labels.push(edge.relationship_type);
      }
      if (edge.highlighted) existing.highlighted = true;
    } else {
      mergedEdgeMap.set(dirKey, {
        source,
        target,
        labels: edge.relationship_type ? [edge.relationship_type] : [],
        highlighted: Boolean(edge.highlighted),
      });
    }
  });

  const mergedEdges = [...mergedEdgeMap.values()];

  // Detect which merged directed edges form a bidirectional pair
  const dirKeySet = new Set(mergedEdges.map((e) => `${e.source}→${e.target}`));
  // For each bidirectional pair assign parallelIndex 0 / 1
  const pairFirstSeen = new Map<string, number>(); // pairKey → parallelIndex for next edge

  const flowEdges = mergedEdges.length
    ? mergedEdges.map((edge, index) => {
        const { source, target } = edge;
        const targetLabel = idToLabel.get(target) ?? '';
        const isTerminalEdge = (outgoingCount.get(targetLabel) ?? 0) === 0;
        const srcCenter = radialPositions.get(source) ?? { x: 0, y: 0 };
        const tgtCenter = radialPositions.get(target) ?? { x: 0, y: 0 };
        const handles = getEdgeHandles(srcCenter, tgtCenter);

        const isBidirectional = dirKeySet.has(`${target}→${source}`);
        const pairKey = [source, target].sort().join('↔');
        let parallelIndex = 0;
        if (isBidirectional) {
          parallelIndex = pairFirstSeen.get(pairKey) ?? 0;
          pairFirstSeen.set(pairKey, parallelIndex + 1);
        }

        const label = edge.labels.join(' · ');

        return {
          id: `relationship_edge_${index}`,
          source,
          target,
          type: 'relationshipFlow',
          sourceHandle: handles.sourceHandle,
          targetHandle: handles.targetHandle,
          data: {
            label,
            highlighted: edge.highlighted,
            isTerminalEdge,
            terminalHighlighted: edge.highlighted && isTerminalEdge,
            isParallel: isBidirectional,
            parallelIndex,
          },
        } satisfies Edge<RelationshipEdgeData>;
      })
    : flowNodes.slice(1).map((node, index) => {
        const srcCenter = radialPositions.get(flowNodes[0].id) ?? { x: 0, y: 0 };
        const tgtCenter = radialPositions.get(node.id) ?? { x: 0, y: 0 };
        const handles = getEdgeHandles(srcCenter, tgtCenter);
        return {
          id: `relationship_edge_fallback_${index}`,
          source: flowNodes[0].id,
          target: node.id,
          type: 'relationshipFlow',
          sourceHandle: handles.sourceHandle,
          targetHandle: handles.targetHandle,
          data: { isTerminalEdge: true },
        };
      });

  return { nodes: flowNodes, edges: flowEdges };
};

export interface WorkflowAgentDetailModel {
  id: string;
  label: string;
  triggered: boolean;
  durationMs: number | null;
  timestamp: string;
  input: string;
  output: string;
  reasoning: string;
  /** Filtered subset of the alert's top-level sources relevant to this agent */
  sources: AlertSourceObject[];
  /** True when this agent has relationship graph data to display */
  hasRelationships: boolean;
  relationships: {
    nodes: Node<RelationshipNodeData>[];
    edges: Edge<RelationshipEdgeData>[];
  };
  /**
   * Structured alert summary from the Risk Insight Agent (`alert_data` sibling
   * of `responses` in the execution payload).  Null for all other agents.
   */
  alertData: Record<string, unknown> | null;
}

export interface WorkflowDetailModel {
  agents: WorkflowAgentDetailModel[];
  agentMap: Map<string, WorkflowAgentDetailModel>;
}

// ── Top-level source filtering ────────────────────────────────────────────────

/** True when the agent is the News Synthesizer / News Analysis agent */
const isNewsAgent = (node: AlertAgentsGraphNode): boolean =>
  /news/i.test(node.id) || /news/i.test(node.label);

/** True when the agent is the SEC Filing Analysis agent */
const isSecFilingAgent = (node: AlertAgentsGraphNode): boolean =>
  /sec/i.test(node.id) || /sec/i.test(node.label);

/**
 * Returns the subset of the alert's top-level sources that should be shown
 * for a given agent:
 *  - News agents      → source_type === "news"
 *  - SEC filing agents → source_type === "sec_filing"
 *  - All other agents  → empty (they don't surface source chips)
 */
const filterSourcesForAgent = (
  node: AlertAgentsGraphNode,
  sources: AlertSourceLike[],
): AlertSourceObject[] => {
  const objectSources = sources.filter(
    (s): s is AlertSourceObject => typeof s !== 'string',
  );

  if (isNewsAgent(node)) {
    return objectSources.filter((s) => s.source_type === 'news');
  }
  if (isSecFilingAgent(node)) {
    return objectSources.filter((s) => s.source_type === 'sec_filing');
  }
  return [];
};

export const buildWorkflowDetailModel = (
  graph?: AlertAgentsGraph,
  agentsOutput?: AlertAgentsOutput,
  topLevelSources?: AlertSourceLike[] | null,
): WorkflowDetailModel | null => {
  if (!graph?.nodes?.length) {
    return null;
  }

  const agents = [...graph.nodes]
    .filter((node) => !isEvaluationAgent(node))
    .sort((left, right) => left.level - right.level)
    .map((node) => {
      const outputPayload = node.triggered ? resolveOutputPayload(node, agentsOutput) : undefined;
      // Support both the nested shape { responses: { input, output, ... } } used by alert
      // agents and the flat shape { input, output, ... } returned by the chat/Ask AI API.
      const responses = outputPayload?.responses ?? (outputPayload as unknown as AlertAgentResponsePayload | undefined);
      // Accept either `relationship_graph` (event_to_impact_mapping) or the legacy
      // `relationships` key (planner-style agents).
      const relationshipsPayload = outputPayload?.relationship_graph ?? outputPayload?.relationships;

      const relationshipGraph = buildRelationshipGraph(relationshipsPayload?.nodes, relationshipsPayload?.edges);

      return {
        id: node.id,
        label: node.label,
        triggered: node.triggered,
        durationMs: node.duration_ms,
        timestamp: formatExecutionMeta(node) ?? '',
        // Coerce to string defensively: the backend can return arrays/objects
        // even though the TypeScript type says string. nullish-coalesce only
        // catches null/undefined — truthy non-strings would survive the ??
        // check and later crash normalizeMarkdown's .split() call.
        input: typeof responses?.input === 'string' ? responses.input : '',
        output: typeof responses?.output === 'string' ? responses.output : '',
        reasoning: typeof responses?.reasoning === 'string' ? responses.reasoning : '',
        sources: filterSourcesForAgent(node, topLevelSources ?? []),
        hasRelationships: relationshipGraph.nodes.length > 0,
        relationships: relationshipGraph,
        alertData:
          outputPayload?.alert_data != null &&
          typeof outputPayload.alert_data === 'object' &&
          !Array.isArray(outputPayload.alert_data)
            ? (outputPayload.alert_data as Record<string, unknown>)
            : null,
      } satisfies WorkflowAgentDetailModel;
    });

  return {
    agents,
    agentMap: new Map(agents.map((agent) => [agent.id, agent])),
  };
};
