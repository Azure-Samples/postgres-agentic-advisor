import React from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import { CanvasZoomOutIcon, CanvasZoomInIcon, CanvasExpandIcon, CanvasCollapseIcon } from '@/icons';
import { ToolsContainer, ToolButton, ToolDivider } from './CanvasControlsPanel.styles';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PanelPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface CanvasControlsPanelProps {
  /** Where to anchor the panel inside the canvas. Default: 'bottom-right'. */
  position?: PanelPosition;
  /**
   * Called when the user clicks the expand / full-screen button.
   * When omitted the expand button is not rendered.
   */
  onExpand?: () => void;
  /**
   * Called when the user clicks the collapse / exit full-screen button.
   * When omitted the collapse button is not rendered.
   */
  onCollapse?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Zoom controls panel rendered inside a React Flow canvas.
 *
 * Must be placed as a direct child of <ReactFlow> so it can access
 * the useReactFlow() context. Provides zoom-out, zoom-in, and an optional
 * expand-to-full-screen action.
 */
const CanvasControlsPanel: React.FC<CanvasControlsPanelProps> = ({ position = 'bottom-right', onExpand, onCollapse }) => {
  const { zoomIn, zoomOut } = useReactFlow();

  return (
    <Panel position={position}>
      <ToolsContainer>
        <ToolButton type="button" onClick={() => zoomOut()} aria-label="Zoom out">
          <CanvasZoomOutIcon />
        </ToolButton>
        <ToolButton type="button" onClick={() => zoomIn()} aria-label="Zoom in">
          <CanvasZoomInIcon />
        </ToolButton>
        {(onExpand || onCollapse) && (
          <>
            <ToolDivider />
            {onExpand && (
              <ToolButton type="button" onClick={onExpand} aria-label="Expand to full screen">
                <CanvasExpandIcon />
              </ToolButton>
            )}
            {onCollapse && (
              <ToolButton type="button" onClick={onCollapse} aria-label="Exit full screen">
                <CanvasCollapseIcon />
              </ToolButton>
            )}
          </>
        )}
      </ToolsContainer>
    </Panel>
  );
};

export default CanvasControlsPanel;
