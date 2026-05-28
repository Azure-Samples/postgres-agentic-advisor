import React, { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, Position, type EdgeProps } from '@xyflow/react';
import { useTheme } from 'styled-components';
import type { RelationshipEdgeData } from '@/mocks/workflowMockData';

const ARROW_HALF = 5;
const ARROW_DEPTH = 8;
const ALIGN_THRESHOLD = 8;
/** Lateral px to shift each line of a bidirectional pair so they don't overlap */
const PARALLEL_OFFSET = 13;

const RelationshipFlowEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  sourcePosition = Position.Bottom,
  targetX,
  targetY,
  targetPosition = Position.Top,
  data,
}) => {
  const { colors } = useTheme();
  const edgeData = (data ?? {}) as RelationshipEdgeData;
  const stroke = edgeData.highlighted ? '#8677FF' : colors.workflow.pipelineEdge;

  const parallelIndex = edgeData.parallelIndex ?? 0;
  const isParallel = Boolean(edgeData.isParallel);

  // ── Step 1: apply lateral shift for parallel (bidirectional) pairs ─────────
  // Vertical-handle edges (top/bottom) → shift X; horizontal-handle edges → shift Y
  const isVertHandle = sourcePosition === Position.Bottom || sourcePosition === Position.Top;
  const shift = isParallel ? (parallelIndex === 0 ? -PARALLEL_OFFSET : PARALLEL_OFFSET) : 0;

  const fsx = isVertHandle ? sourceX + shift : sourceX;
  const fsy = isVertHandle ? sourceY : sourceY + shift;
  const ftx = isVertHandle ? targetX + shift : targetX;
  const fty = isVertHandle ? targetY : targetY + shift;

  // ── Step 2: arrowhead geometry from final target point ─────────────────────
  let pathEndX = ftx;
  let pathEndY = fty;
  let arrowPath: string;

  if (targetPosition === Position.Top) {
    pathEndY = fty - ARROW_DEPTH;
    arrowPath = `M ${ftx - ARROW_HALF},${fty - ARROW_DEPTH} L ${ftx},${fty} L ${ftx + ARROW_HALF},${fty - ARROW_DEPTH}`;
  } else if (targetPosition === Position.Bottom) {
    pathEndY = fty + ARROW_DEPTH;
    arrowPath = `M ${ftx - ARROW_HALF},${fty + ARROW_DEPTH} L ${ftx},${fty} L ${ftx + ARROW_HALF},${fty + ARROW_DEPTH}`;
  } else if (targetPosition === Position.Left) {
    pathEndX = ftx - ARROW_DEPTH;
    arrowPath = `M ${ftx - ARROW_DEPTH},${fty - ARROW_HALF} L ${ftx},${fty} L ${ftx - ARROW_DEPTH},${fty + ARROW_HALF}`;
  } else {
    pathEndX = ftx + ARROW_DEPTH;
    arrowPath = `M ${ftx + ARROW_DEPTH},${fty - ARROW_HALF} L ${ftx},${fty} L ${ftx + ARROW_DEPTH},${fty + ARROW_HALF}`;
  }

  // ── Step 3: edge path ──────────────────────────────────────────────────────
  const isVertical = Math.abs(fsx - ftx) < ALIGN_THRESHOLD;
  const isHorizontal = Math.abs(fsy - fty) < ALIGN_THRESHOLD;

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (isParallel) {
    // Always draw straight lines for parallel pairs (clean two-arrow look)
    if (isVertHandle) {
      edgePath = `M ${fsx},${fsy} L ${ftx},${pathEndY}`;
      labelX = (fsx + ftx) / 2;
      labelY = (fsy + fty) / 2;
    } else {
      edgePath = `M ${fsx},${fsy} L ${pathEndX},${fty}`;
      labelX = (fsx + ftx) / 2;
      labelY = (fsy + fty) / 2;
    }
  } else if (isVertical) {
    edgePath = `M ${fsx},${fsy} L ${fsx},${pathEndY}`;
    labelX = fsx;
    labelY = (fsy + fty) / 2;
  } else if (isHorizontal) {
    edgePath = `M ${fsx},${fsy} L ${pathEndX},${fsy}`;
    labelX = (fsx + ftx) / 2;
    labelY = fsy;
  } else {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX: fsx,
      sourceY: fsy,
      sourcePosition,
      targetX: pathEndX,
      targetY: pathEndY,
      targetPosition,
      curvature: 0.3,
    });
  }

  // ── Step 4: label ──────────────────────────────────────────────────────────
  const edgeLabel = (edgeData.label?.trim() || 'INFLUENCED BY').toUpperCase();

  // Centre the label on the true midpoint of the path.
  const labelTransform = `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`;

  const isHighlighted = Boolean(edgeData.highlighted);
  const edgeStrokeWidth = isHighlighted ? 3 : 1;
  const arrowStrokeWidth = isHighlighted ? 3 : 1.5;

  return (
    <>
      <g style={{ pointerEvents: 'none' }} aria-label={edgeLabel}>
        <path id={id} d={edgePath} fill="none" stroke={stroke} strokeWidth={edgeStrokeWidth} strokeLinecap="round" />
        <path
          d={arrowPath}
          fill={isHighlighted ? stroke : 'none'}
          stroke={stroke}
          strokeWidth={arrowStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: labelTransform,
            pointerEvents: 'none',
            fontFamily: '"Roboto", sans-serif',
            fontSize: '10px',
            fontStyle: 'normal',
            fontWeight: isHighlighted ? 600 : 500,
            color: isHighlighted ? '#8677FF' : colors.contentTertiary,
            letterSpacing: isHighlighted ? undefined : '0.4px',
            lineHeight: isHighlighted ? '130%' : undefined,
            whiteSpace: 'nowrap',
            userSelect: 'none',
            backgroundColor: colors.workflow.relationshipCanvasBg,
            padding: '1px 6px',
            borderRadius: '3px',
          }}
          className="nodrag nopan"
        >
          {edgeLabel}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(RelationshipFlowEdge);
