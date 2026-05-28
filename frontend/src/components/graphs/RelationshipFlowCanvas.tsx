import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type Edge,
  type DefaultEdgeOptions,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CanvasControlsPanel from './CanvasControlsPanel';
import { CanvasContainer } from './graphs.styles';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface RelationshipFlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  /** Custom node type map — must be stable (defined outside render cycles). */
  nodeTypes?: NodeTypes;
  /** Custom edge type map — must be stable (defined outside render cycles). */
  edgeTypes?: EdgeTypes;
  /** Show the zoom / pan / fit-view control panel. Default: true. */
  showControls?: boolean;
  /** Dot colour for the canvas background pattern. Default: #DFDFDF. */
  bgPatternColor?: string;
  /** Default style/options applied to every edge. */
  defaultEdgeOptions?: DefaultEdgeOptions;
  /**
   * Called when the user clicks the expand / full-screen button in the controls panel.
   * When omitted the expand button is not rendered.
   */
  onExpand?: () => void;
  /**
   * Called when the user clicks the collapse / exit full-screen button in the controls panel.
   * When omitted the collapse button is not rendered.
   */
  onCollapse?: () => void;
  /** Padding passed to fitView. Smaller = more zoomed in. Default: 0.25. */
  fitPadding?: number;
  /** Number of zoomIn steps applied after fitView. Default: 2. */
  zoomSteps?: number;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Generic knowledge-graph / relationship canvas built on React Flow.
 *
 * Completely data-driven — bring your own nodes and edges.
 * Interaction is fully enabled: nodes can be dragged, the canvas can be
 * panned, and scroll-to-zoom is active. An optional control panel
 * (zoom in/out + fit view) is shown by default.
 *
 * Use this wherever you need to show a radial relationship graph — workflow
 * agent detail pages, chat panel, embedded previews, etc.
 *
 * Empty-state rendering is the caller's responsibility — if nodes is empty
 * the canvas is simply not rendered and null is returned.
 */
const RelationshipFlowCanvas: React.FC<RelationshipFlowCanvasProps> = ({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  showControls = true,
  bgPatternColor = '#DFDFDF',
  defaultEdgeOptions,
  onExpand,
  onCollapse,
  fitPadding = 0.25,
  zoomSteps = 2,
}) => {
  const stableNodes = useMemo(() => nodes, [nodes]);
  const stableEdges = useMemo(() => edges, [edges]);

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      // Chain exactly `zoomSteps` zoomIn calls after fitView, each deferred to
      // the next animation frame so React Flow has settled before each step.
      const chainZoom = (stepsLeft: number) => {
        if (stepsLeft <= 0) return;
        requestAnimationFrame(() => {
          instance.zoomIn({ duration: 0 });
          chainZoom(stepsLeft - 1);
        });
      };

      requestAnimationFrame(() => {
        instance.fitView({ padding: fitPadding, duration: 0 });
        chainZoom(zoomSteps);
      });
    },
    [fitPadding, zoomSteps],
  );

  if (nodes.length === 0) {
    return null;
  }

  return (
    <CanvasContainer>
      <ReactFlow
        nodes={stableNodes}
        edges={stableEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onInit={handleInit}
        nodesDraggable
        nodesConnectable={false}
        panOnDrag
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Cross} gap={18} size={1} color={bgPatternColor} />
        {showControls && <CanvasControlsPanel onExpand={onExpand} onCollapse={onCollapse} />}
      </ReactFlow>
    </CanvasContainer>
  );
};

export default RelationshipFlowCanvas;
