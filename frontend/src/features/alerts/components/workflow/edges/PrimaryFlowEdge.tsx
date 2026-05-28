import React, { memo } from 'react';
import { BaseEdge, getSmoothStepPath, Position, type EdgeProps } from '@xyflow/react';

const ARROW_DEPTH = 4;
const ARROW_SPREAD = 3.5;

interface PrimaryFlowEdgeData {
  /** When false, the edge is rendered in the dimmer "inactive" colour. */
  active?: boolean;
  borderRadius?: number;
  [key: string]: unknown;
}

const getArrowHeadPoints = (targetX: number, targetY: number, targetPosition: Position) => {
  switch (targetPosition) {
    case Position.Left:
      return `${targetX - ARROW_DEPTH},${targetY - ARROW_SPREAD} ${targetX},${targetY} ${targetX - ARROW_DEPTH},${targetY + ARROW_SPREAD}`;
    case Position.Right:
      return `${targetX + ARROW_DEPTH},${targetY - ARROW_SPREAD} ${targetX},${targetY} ${targetX + ARROW_DEPTH},${targetY + ARROW_SPREAD}`;
    case Position.Bottom:
      return `${targetX - ARROW_SPREAD},${targetY + ARROW_DEPTH} ${targetX},${targetY} ${targetX + ARROW_SPREAD},${targetY + ARROW_DEPTH}`;
    case Position.Top:
    default:
      return `${targetX - ARROW_SPREAD},${targetY - ARROW_DEPTH} ${targetX},${targetY} ${targetX + ARROW_SPREAD},${targetY - ARROW_DEPTH}`;
  }
};

/**
 * PrimaryFlowEdge — orthogonal smooth-step path + marker-end arrow.
 *
 * Reads `data.active` to switch between the active edge colour
 * (`workflow.pipelineEdge`) and the dimmer `workflow.pipelineEdgeInactive`
 * used for edges leading into non-triggered nodes (matches Figma 3097-58829).
 */
const PrimaryFlowEdge: React.FC<EdgeProps> = ({
  sourceX,
  sourceY,
  sourcePosition = Position.Bottom,
  targetX,
  targetY,
  targetPosition = Position.Top,
  data,
}) => {
  const edgeData = data as PrimaryFlowEdgeData | undefined;
  const isActive = edgeData?.active !== false;
  const borderRadius = edgeData?.borderRadius ?? 10;
  const edgeColor = '#8791B3';
  const edgeOpacity = isActive ? 1 : 0.5;

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius,
  });

  const arrowHeadPoints = getArrowHeadPoints(targetX, targetY, targetPosition);

  return (
    <g style={{ pointerEvents: 'none', opacity: edgeOpacity }}>
      <BaseEdge path={path} style={{ stroke: edgeColor, strokeWidth: 1.25 }} />
      <polyline
        points={arrowHeadPoints}
        fill="none"
        stroke={edgeColor}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};

export default memo(PrimaryFlowEdge);
