import React, { useCallback, useMemo, useState } from 'react';
import { type Node, type Edge, type NodeTypes, type EdgeTypes, type ReactFlowInstance } from '@xyflow/react';
import { PipelineFlowCanvas } from '../../../../components/graphs';
import AgentNode from './nodes/AgentNode';
import CompactNode from './nodes/CompactNode';
import EventNode from './nodes/EventNode';
import LayoutSpacerNode from './nodes/LayoutSpacerNode';
import PrimaryFlowEdge from './edges/PrimaryFlowEdge';
import RefinementFlowEdge from './edges/RefinementFlowEdge';
import { PIPELINE_NODES, PIPELINE_EDGES } from '../../../../mocks/workflowMockData';
import {
  CanvasFrame,
  GraphCanvasWrapper,
  GraphFlowWrapper,
  GraphMessageCard,
  WorkflowOverviewTitle,
  WorkflowOverviewWrapper,
} from './WorkflowOverviewGraph.styles';

// Node and edge type maps are stable module-level constants to prevent
// React Flow from re-registering them on every render.
const nodeTypes: NodeTypes = {
  agentNode: AgentNode,
  compactNode: CompactNode,
  eventNode: EventNode,
  layoutSpacer: LayoutSpacerNode,
};

const edgeTypes: EdgeTypes = {
  primaryFlowEdge: PrimaryFlowEdge,
  refinementFlowEdge: RefinementFlowEdge,
};

interface WorkflowOverviewGraphProps {
  onNodeClick?: (agentId: string) => void;
  /** When true the "Behind the Scenes Workflow" heading is not rendered */
  hideTitle?: boolean;
  nodes?: Node[];
  edges?: Edge[];
  interactive?: boolean;
  /** Optional content rendered as a scrollable card at the top of the canvas. */
  messageContent?: React.ReactNode;
  /** Controls height behaviour: 'chat' fills the flex parent; 'alert' uses fixed height. */
  variant?: 'alert' | 'chat';
}

const WorkflowOverviewGraph: React.FC<WorkflowOverviewGraphProps> = ({
  onNodeClick,
  hideTitle = false,
  nodes: providedNodes,
  edges: providedEdges,
  interactive = true,
  messageContent,
  variant = 'alert',
}) => {
  const nodes = useMemo(() => providedNodes ?? PIPELINE_NODES, [providedNodes]);
  const edges = useMemo(() => providedEdges ?? PIPELINE_EDGES, [providedEdges]);
  const [isReady, setIsReady] = useState(false);

  const handlePipelineInit = useCallback((rf: ReactFlowInstance) => {
    rf.fitView({ padding: 0.08, duration: 0 });
    // Zoom in one step after fit so the graph fills the canvas more prominently,
    // then defer the reveal so the final transform is painted before becoming visible.
    requestAnimationFrame(() => {
      rf.zoomIn({ duration: 0 });
      requestAnimationFrame(() => setIsReady(true));
    });
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string, nodeType: string | undefined) => {
      if ((nodeType === 'agentNode' || nodeType === 'compactNode') && onNodeClick) {
        onNodeClick(nodeId);
      }
    },
    [onNodeClick],
  );

  return (
    <WorkflowOverviewWrapper $variant={variant}>
      {!hideTitle && <WorkflowOverviewTitle>Behind the Scenes Workflow</WorkflowOverviewTitle>}

      <CanvasFrame $variant={variant}>
        <GraphCanvasWrapper $interactive={interactive} $ready={isReady} $variant={variant}>
          {messageContent && <GraphMessageCard>{messageContent}</GraphMessageCard>}
          <GraphFlowWrapper>
            <PipelineFlowCanvas
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onInit={handlePipelineInit}
              onNodeClick={interactive ? handleNodeClick : undefined}
            />
          </GraphFlowWrapper>
        </GraphCanvasWrapper>
      </CanvasFrame>
    </WorkflowOverviewWrapper>
  );
};

export default WorkflowOverviewGraph;

