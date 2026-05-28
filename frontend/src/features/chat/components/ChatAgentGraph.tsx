import React, { useMemo, memo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  getSmoothStepPath,
  useReactFlow,
  type Node,
  type Edge,
  type EdgeTypes,
  type NodeTypes,
  type EdgeProps,
} from '@xyflow/react';
import { useTheme } from 'styled-components';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import '@xyflow/react/dist/style.css';
import type { AlertAgentsGraph, AlertAgentsGraphNode } from '@/api/types/alert.types';
import CanvasControlsPanel from '@/components/graphs/CanvasControlsPanel';
import {
  ChatAgentGraphCard,
  ChatAgentGraphCanvas,
  QueryNodeEl,
  AgentNodeEl,
  ResponseNodeEl,
} from './ChatAgentGraph.styles';

// ─── Constants ─────────────────────────────────────────────────────────────────

const QUERY_ID = '__query__';
const RESPONSE_ID = '__response__';
const ARROW_DEPTH = 8;
const ARROW_SPREAD = 6;
const SOURCE_CIRCLE_R = 3; // radius of hollow source circle (6px diameter)
/** Horizontal gap between sibling node centers in the same level row */
const H_GAP = 200;
/** Vertical gap between level rows */
const V_GAP = 90;
/** Estimated node width used for horizontal centering (React Flow needs pre-set positions) */
const NODE_W = 170;
/** Estimated node height */
const NODE_H = 36;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChatAgentGraphProps {
  agentsGraph: AlertAgentsGraph;
}

// ─── Custom edge ───────────────────────────────────────────────────────────────

const ChatAgentFlowEdge: React.FC<EdgeProps> = memo(
  ({ sourceX, sourceY, sourcePosition = Position.Bottom, targetX, targetY, targetPosition = Position.Top, target }) => {
    const { colors } = useTheme();
    const { getNode } = useReactFlow();
    const targetNode = getNode(target);
    const isActive = (targetNode?.data as { triggered?: boolean } | undefined)?.triggered !== false;
    const edgeColor = '#8791B3';
    const edgeOpacity = isActive ? 1 : 0.5;
    const dynamicOffset = Math.min(44, Math.max(4, Math.abs(targetY - sourceY) * 0.4));
    const [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 8,
      offset: dynamicOffset,
    });
    // Open chevron arrowhead at target (pointing into target node top)
    const arrowPoints = `${targetX - ARROW_SPREAD},${targetY - ARROW_DEPTH} ${targetX},${targetY} ${targetX + ARROW_SPREAD},${targetY - ARROW_DEPTH}`;

    return (
      <g style={{ pointerEvents: 'none', opacity: edgeOpacity }}>
        <path d={path} fill="none" stroke={edgeColor} strokeWidth={1} />
        {/* Hollow circle at source */}
        <circle cx={sourceX} cy={sourceY} r={SOURCE_CIRCLE_R} fill="#FFFFFF" stroke={edgeColor} strokeWidth={1.5} />
        {/* Open chevron arrowhead at target */}
        <polyline
          points={arrowPoints}
          fill="none"
          stroke={edgeColor}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    );
  },
);
ChatAgentFlowEdge.displayName = 'ChatAgentFlowEdge';

const edgeTypes: EdgeTypes = { chatAgentEdge: ChatAgentFlowEdge };

// ─── Custom node renderers ─────────────────────────────────────────────────────

const HANDLE_STYLE: React.CSSProperties = { opacity: 0, pointerEvents: 'none' };

const QueryNodeComponent = ({ data }: { data: { label: string } }) => (
  <QueryNodeEl>
    {data.label}
    <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
  </QueryNodeEl>
);
const AgentNodeComponent = ({ data }: { data: { label: string } }) => (
  <AgentNodeEl>
    <Handle type="target" position={Position.Top} style={HANDLE_STYLE} />
    {data.label}
    <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
  </AgentNodeEl>
);
const ResponseNodeComponent = ({ data }: { data: { label: string } }) => (
  <ResponseNodeEl>
    <Handle type="target" position={Position.Top} style={HANDLE_STYLE} />
    {data.label}
  </ResponseNodeEl>
);

const nodeTypes: NodeTypes = {
  queryNode: QueryNodeComponent,
  agentNode: AgentNodeComponent,
  responseNode: ResponseNodeComponent,
};

// ─── Layout builder ────────────────────────────────────────────────────────────

/**
 * Converts AlertAgentsGraph into React Flow nodes + edges.
 *
 * Synthetic rows are prepended (Query) and appended (Response).
 * Nodes in the same level are laid out in a horizontal row, centered on x=0.
 * Synthetic edges connect Query → level-min nodes and level-max nodes → Response.
 */
function buildFlowGraph(graph: AlertAgentsGraph): { nodes: Node[]; edges: Edge[] } {
  const levelGroups = new Map<number, AlertAgentsGraphNode[]>();
  for (const node of graph.nodes) {
    const arr = levelGroups.get(node.level) ?? [];
    arr.push(node);
    levelGroups.set(node.level, arr);
  }
  const sortedLevels = [...levelGroups.keys()].sort((a, b) => a - b);
  const minLevel = sortedLevels[0] ?? 0;
  const maxLevel = sortedLevels[sortedLevels.length - 1] ?? 0;

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Row index 0 = Query, rows 1..n = agent levels, last row = Response
  let rowIdx = 0;

  // ── Query node ────────────────────────────────────────────────────────────
  nodes.push({
    id: QUERY_ID,
    type: 'queryNode',
    position: { x: -NODE_W / 2, y: rowIdx * V_GAP },
    data: { label: 'Query' },
    draggable: false,
    selectable: false,
    style: { width: NODE_W, height: NODE_H },
  });
  rowIdx++;

  // ── Agent level rows ──────────────────────────────────────────────────────
  for (const level of sortedLevels) {
    const levelNodes = levelGroups.get(level)!;
    const count = levelNodes.length;
    const totalWidth = (count - 1) * H_GAP;

    levelNodes.forEach((n, i) => {
      const x = i * H_GAP - totalWidth / 2 - NODE_W / 2;
      nodes.push({
        id: n.id,
        type: 'agentNode',
        position: { x, y: rowIdx * V_GAP },
        data: { label: n.label, triggered: n.triggered },
        draggable: false,
        selectable: false,
        style: { width: NODE_W, height: NODE_H },
      });
    });
    rowIdx++;
  }

  // ── Response node ──────────────────────────────────────────────────────────
  nodes.push({
    id: RESPONSE_ID,
    type: 'responseNode',
    position: { x: -NODE_W / 2, y: rowIdx * V_GAP },
    data: { label: 'Response' },
    draggable: false,
    selectable: false,
    style: { width: NODE_W, height: NODE_H },
  });

  // ── Edges: real graph ─────────────────────────────────────────────────────
  for (const e of graph.edges) {
    edges.push({ id: `e-${e.from}-${e.to}`, source: e.from, target: e.to, type: 'chatAgentEdge' });
  }

  // ── Synthetic edges: Query → level-min nodes ──────────────────────────────
  for (const n of levelGroups.get(minLevel) ?? []) {
    edges.push({ id: `e-${QUERY_ID}-${n.id}`, source: QUERY_ID, target: n.id, type: 'chatAgentEdge' });
  }

  // ── Synthetic edges: level-max nodes → Response ───────────────────────────
  for (const n of levelGroups.get(maxLevel) ?? []) {
    edges.push({ id: `e-${n.id}-${RESPONSE_ID}`, source: n.id, target: RESPONSE_ID, type: 'chatAgentEdge' });
  }

  return { nodes, edges };
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Chat-specific agent pipeline diagram using React Flow.
 *
 * - Query node at the top, Response at the bottom (both inside boundary)
 * - Agent nodes grouped by `level` with one horizontal row per level
 * - SmoothStep edges with arrowheads for clean fan-out / fan-in
 * - Zoom/pan controls via CanvasControlsPanel (same as RelationshipFlowCanvas)
 * - No agent icons, no drill-down interaction
 */
const ChatAgentGraph: React.FC<ChatAgentGraphProps> = ({ agentsGraph }) => {
  const { nodes, edges } = useMemo(() => buildFlowGraph(agentsGraph), [agentsGraph]);

  return (
    <ChatAgentGraphCard>
      <ChatAgentGraphCanvas>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="rgba(196,181,253,0.25)" />
          <CanvasControlsPanel position="bottom-right" />
        </ReactFlow>
      </ChatAgentGraphCanvas>
    </ChatAgentGraphCard>
  );
};

export default ChatAgentGraph;
