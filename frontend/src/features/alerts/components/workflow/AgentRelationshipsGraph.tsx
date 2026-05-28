import React, { useState } from 'react';
import { type Edge, type Node, type NodeTypes, type EdgeTypes } from '@xyflow/react';
import { RelationshipFlowCanvas } from '../../../../components/graphs';
import RelationshipEntityNode from './nodes/RelationshipEntityNode';
import RelationshipFlowEdge from './edges/RelationshipFlowEdge';
import type { RelationshipEdgeData, RelationshipNodeData } from '../../../../mocks/workflowMockData';
import { RelationshipCanvasWrapper, EmptyRelationshipOverlay } from './AgentRelationshipsGraph.styles';
import WorkflowFullScreenModal from './WorkflowFullScreenModal';
import theme from '../../../../styles/theme';

// Stable module-level constant — prevents React Flow from re-registering on every render.
const nodeTypes: NodeTypes = {
  relationshipEntity: RelationshipEntityNode,
};

const edgeTypes: EdgeTypes = {
  relationshipFlow: RelationshipFlowEdge,
};

const EDGE_OPTIONS = {
  style: { stroke: theme.colors.workflow.relationshipEdge, strokeWidth: 1 },
} as const;

interface AgentRelationshipsGraphProps {
  relationships: {
    nodes: Node<RelationshipNodeData>[];
    edges: Edge<RelationshipEdgeData>[];
  };
}

/**
 * Workflow-specific wrapper around the generic RelationshipFlowCanvas.
 *
 * Extracts node/edge data from the AgentDetail relationships field and
 * delegates all canvas rendering to RelationshipFlowCanvas.
 */
const AgentRelationshipsGraph: React.FC<AgentRelationshipsGraphProps> = ({ relationships }) => {
  const { nodes, edges } = relationships;
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (nodes.length === 0) {
    return (
      <RelationshipCanvasWrapper>
        <EmptyRelationshipOverlay>No relationships found for this agent.</EmptyRelationshipOverlay>
      </RelationshipCanvasWrapper>
    );
  }

  return (
    <>
      <RelationshipCanvasWrapper>
        <RelationshipFlowCanvas
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={EDGE_OPTIONS}
          onExpand={() => setIsFullScreen(true)}
        />
      </RelationshipCanvasWrapper>
      <WorkflowFullScreenModal
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      />
    </>
  );
};

export default AgentRelationshipsGraph;
