import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { TinyClockIcon } from '../../../../../icons';
import type { CompactNodeData } from '../../../../../mocks/workflowMockData';
import { HIDDEN_HANDLE_STYLE, CIRCLE_HANDLE_STYLE } from '../../../../../constants/workflow';
import {
  CompactNodeWrapper,
  CompactNodeRow,
  CompactNodeLabel,
  CompactNodeDurationStrip,
  CompactNodeClockIcon,
  CompactNodeDurationText,
} from './CompactNode.styles';

/**
 * Compact node used for the pipeline's Event (top) and Insight (bottom).
 * The 'insight' variant renders with a purple gradient background.
 */
const handleLeft = (i: number, n: number) => `${((i + 1) * 100) / (n + 1)}%`;

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const mins = Math.floor(ms / 60_000);
  const secs = Math.round((ms % 60_000) / 1000);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

const CompactNode = ({ data }: NodeProps) => {
  const {
    label,
    variant,
    interactive = true,
    bottomHandleCount = 1,
    topHandleCount = 1,
    durationMs,
  } = data as CompactNodeData;
  const isInsight = variant === 'insight';
  const hasDuration = durationMs != null && durationMs > 0;

  return (
    <CompactNodeWrapper $variant={variant} $interactive={interactive}>
      {/* Top (target) handles */}
      {Array.from({ length: topHandleCount }, (_, i) => (
        <Handle
          key={`top-${i}`}
          id={topHandleCount === 1 ? 'top' : `top-${i}`}
          type="target"
          position={Position.Top}
          style={{ ...HIDDEN_HANDLE_STYLE, left: handleLeft(i, topHandleCount) }}
        />
      ))}

      <CompactNodeRow>
        <CompactNodeLabel $variant={variant}>{label}</CompactNodeLabel>
      </CompactNodeRow>

      {hasDuration && (
        <CompactNodeDurationStrip $variant={variant}>
          <CompactNodeClockIcon $variant={variant}>
            <TinyClockIcon />
          </CompactNodeClockIcon>
          <CompactNodeDurationText $variant={variant}>{formatDuration(durationMs as number)}</CompactNodeDurationText>
        </CompactNodeDurationStrip>
      )}

      {/* Bottom (source) handles */}
      {Array.from({ length: bottomHandleCount }, (_, i) => (
        <Handle
          key={`bottom-${i}`}
          id={bottomHandleCount === 1 ? 'bottom' : `bottom-${i}`}
          type="source"
          position={Position.Bottom}
          style={{
            ...(isInsight ? HIDDEN_HANDLE_STYLE : CIRCLE_HANDLE_STYLE),
            left: handleLeft(i, bottomHandleCount),
          }}
        />
      ))}
    </CompactNodeWrapper>
  );
};

export default memo(CompactNode);
