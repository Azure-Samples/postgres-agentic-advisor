import React, { memo } from 'react';
import { EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import { useTheme } from 'styled-components';
import { EdgeLabel } from './RefinementFlowEdge.styles';

/**
 * RefinementFlowEdge — custom dashed loop-back edge.
 *
 * Rendered as an SVG path that loops around the left or right side of
 * the main node column, connecting source and target nodes with a
 * smooth curved dashed line.
 *
 * data.side: 'left' | 'right'  — which side to loop around
 * data.label: string            — optional floating label (e.g. "Refinement")
 */
const RefinementFlowEdge: React.FC<EdgeProps> = ({ sourceX, sourceY, targetX, targetY, data }) => {
  const { colors } = useTheme();
  const edgeColor = colors.workflow.pipelineEdge;
  const side = (data?.side as 'left' | 'right') ?? 'left';
  const label = (data?.label as string) ?? '';
  const offset = side === 'left' ? -90 : 90;

  // The loop path: exit horizontally from source, loop around the column,
  // re-enter horizontally at target. All drawn with cubic bezier curves.
  const midY = (sourceY + targetY) / 2;

  // Control points push the curve out to the side by `offset`
  const path = `
    M ${sourceX} ${sourceY}
    C ${sourceX + offset * 1.6} ${sourceY},
      ${targetX + offset * 1.6} ${targetY},
      ${targetX} ${targetY}
  `;

  // Arrow head as a small SVG polygon pointing inward
  const arrowSize = 6;
  // We approximate the arrival tangent: the line arrives horizontally at targetX, targetY
  const arrowPoints =
    side === 'left'
      ? // arriving from the left → arrow points right
        `${targetX},${targetY} ${targetX - arrowSize},${targetY - arrowSize / 2} ${targetX - arrowSize},${targetY + arrowSize / 2}`
      : // arriving from the right → arrow points left
        `${targetX},${targetY} ${targetX + arrowSize},${targetY - arrowSize / 2} ${targetX + arrowSize},${targetY + arrowSize / 2}`;

  // Label position: midpoint of the loop, offset to the side
  const labelX = sourceX + offset * 1.8;
  const labelY = midY;

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke={edgeColor}
        strokeWidth={1.5}
        strokeDasharray="5 4"
        style={{ pointerEvents: 'none' }}
      />
      {/* Arrowhead */}
      <polygon
        points={arrowPoints}
        fill="none"
        stroke={edgeColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      />
      {/* Origin dot */}
      <circle cx={sourceX} cy={sourceY} r={3} fill={edgeColor} style={{ pointerEvents: 'none' }} />
      {/* Floating label */}
      {label && (
        <EdgeLabelRenderer>
          <EdgeLabel $x={labelX} $y={labelY}>
            {label}
          </EdgeLabel>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(RefinementFlowEdge);
