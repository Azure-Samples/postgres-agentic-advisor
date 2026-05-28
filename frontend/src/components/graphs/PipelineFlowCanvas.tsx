import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type NodeMouseHandler,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type Edge,
  type FitViewOptions,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CanvasContainer } from './graphs.styles';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PipelineFlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  /** Custom node type map — must be stable (defined outside render cycles). */
  nodeTypes: NodeTypes;
  /** Custom edge type map — must be stable (defined outside render cycles). */
  edgeTypes?: EdgeTypes;
  /** Called when any node is clicked. Receives the node id and its type string. */
  onNodeClick?: (nodeId: string, nodeType: string | undefined) => void;
  /**
   * Called once after React Flow initialises. Receives the ReactFlowInstance so
   * callers can set a custom initial viewport (e.g. top-aligned rather than
   * vertically centred). When provided, the built-in fitView is suppressed.
   */
  onInit?: (instance: ReactFlowInstance) => void;
  fitViewOptions?: FitViewOptions;
  /** Background dot grid gap in pixels. Default: 22. */
  backgroundGap?: number;
  /** Background dot radius. Default: 1.2. */
  backgroundSize?: number;
  /** Background dot colour. Default: 'rgba(196, 181, 253, 0.25)'. */
  backgroundDotColor?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const CANVAS_STYLE: React.CSSProperties = { background: 'transparent' };
const DEFAULT_FIT_VIEW: FitViewOptions = { padding: 0.04 };

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Generic pipeline flow canvas built on React Flow.
 *
 * Completely data-driven — bring your own nodes, edges, nodeTypes and edgeTypes.
 * Interaction is locked (no drag/zoom/pan) so it renders as a static diagram;
 * pass an onNodeClick callback to make nodes interactive.
 *
 * Use this wherever you need to show a directed pipeline graph — workflow view,
 * chat panel, embedded previews, etc.
 */
const PipelineFlowCanvas: React.FC<PipelineFlowCanvasProps> = ({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  onNodeClick,
  onInit,
  fitViewOptions = DEFAULT_FIT_VIEW,
  backgroundGap = 18,
  backgroundSize = 1,
  backgroundDotColor = 'rgba(148, 163, 184, 0.35)',
}) => {
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      onNodeClick?.(node.id, node.type);
    },
    [onNodeClick],
  );

  return (
    <CanvasContainer>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick ? handleNodeClick : undefined}
        onInit={onInit}
        style={CANVAS_STYLE}
        nodeOrigin={[0.5, 0]}
        fitView={!onInit}
        fitViewOptions={fitViewOptions}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={backgroundGap}
          size={backgroundSize}
          color={backgroundDotColor}
        />
      </ReactFlow>
    </CanvasContainer>
  );
};

export default PipelineFlowCanvas;
