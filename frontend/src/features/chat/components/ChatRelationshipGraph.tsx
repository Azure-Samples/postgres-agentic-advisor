import React, { useMemo } from 'react';
import { type Edge, type Node, type NodeTypes, type EdgeTypes } from '@xyflow/react';
import { RelationshipFlowCanvas } from '@/components/graphs';
import RelationshipEntityNode from '@/features/alerts/components/workflow/nodes/RelationshipEntityNode';
import RelationshipFlowEdge from '@/features/alerts/components/workflow/edges/RelationshipFlowEdge';
import { buildRelationshipGraph } from '@/features/alerts/components/workflow/workflowDetailAdapter';
import type { ChatRelationshipsPayload } from '@/api/types/chat.types';
import type { RelationshipNodeData, RelationshipEdgeData } from '@/mocks/workflowMockData';
import theme from '@/styles/theme';
import { RelationshipGraphWrapper, EmptyOverlay } from './ChatRelationshipGraph.styles';

// ─── Stable module-level constants ────────────────────────────────────────────
// Defined outside the component to prevent React Flow from re-registering on
// every render, matching the pattern used in AgentRelationshipsGraph.

const nodeTypes: NodeTypes = {
  relationshipEntity: RelationshipEntityNode,
};

const edgeTypes: EdgeTypes = {
  relationshipFlow: RelationshipFlowEdge,
};

const EDGE_OPTIONS = {
  style: { stroke: theme.colors.workflow.relationshipEdge, strokeWidth: 1 },
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChatRelationshipGraphProps {
  relationships: ChatRelationshipsPayload;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Renders a dynamic relationship graph from the chat stream's
 * `type: "relationships"` payload.
 *
 * Delegates layout and rendering to the shared RelationshipFlowCanvas,
 * using the same node/edge types as the advisor modal's AgentRelationshipsGraph.
 */
const ChatRelationshipGraph: React.FC<ChatRelationshipGraphProps> = ({ relationships }) => {
  const { nodes, edges } = useMemo<{
    nodes: Node<RelationshipNodeData>[];
    edges: Edge<RelationshipEdgeData>[];
  }>(
    () => buildRelationshipGraph(relationships.nodes, relationships.edges as any),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [relationships.nodes, relationships.edges],
  );

  if (nodes.length === 0) {
    return (
      <RelationshipGraphWrapper>
        <EmptyOverlay>No relationship data available.</EmptyOverlay>
      </RelationshipGraphWrapper>
    );
  }

  return (
    <RelationshipGraphWrapper>
      <RelationshipFlowCanvas
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={EDGE_OPTIONS}
      />
    </RelationshipGraphWrapper>
  );
};

export default ChatRelationshipGraph;
