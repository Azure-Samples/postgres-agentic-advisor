import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTheme } from 'styled-components';
import type { AgentNodeData } from '../../../../../mocks/workflowMockData';
import {
  WorkflowRiskIcon,
  WorkflowBriefIcon,
  AgentNodeArrowIcon,
  TinyClockIcon,
  WorkflowAgentBadgeIcon,
  WorkflowRelationshipMappingIcon,
  WorkflowFlowIcon,
  WorkflowDocumentIcon,
} from '../../../../../icons';
import { HIDDEN_HANDLE_STYLE, CIRCLE_HANDLE_STYLE } from '../../../../../constants/workflow';
import {
  AgentNodeWrapper,
  AgentNodeRow,
  AgentNodeIconSlot,
  AgentNodeLabel,
  AgentNodeDurationStrip,
  AgentNodeClockIcon,
  AgentNodeDurationText,
  AgentNodeBadge,
  AgentNodeApacheBadge,
  AgentNodeMemoBadge,
} from './AgentNode.styles';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  planner: <WorkflowFlowIcon />,
  news: <WorkflowFlowIcon />,
  financial: <WorkflowDocumentIcon />,
  analysis: <WorkflowDocumentIcon />,
  risk: <WorkflowRiskIcon />,
  brief: <WorkflowBriefIcon />,
  review: <WorkflowDocumentIcon />,
  relationship: <WorkflowRelationshipMappingIcon />,
  ask_ai: <WorkflowRelationshipMappingIcon />,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDuration = (ms: number): string => {
  return `${(ms / 1000).toFixed(2)} sec`;
};

// ─── Component ────────────────────────────────────────────────────────────────

// Compute the `left` % for the i-th handle out of N total, evenly spread.
const handleLeft = (i: number, n: number) => `${((i + 1) * 100) / (n + 1)}%`;

const AgentNode = ({ data }: NodeProps) => {
  const {
    label,
    icon,
    interactive = true,
    active = true,
    bottomHandleCount = 1,
    topHandleCount = 1,
    showBadge,
    showApache,
    showMemo,
    durationMs,
    showDuration = false,
  } = data as AgentNodeData;

  const { colors } = useTheme();
  const hasDuration = showDuration || durationMs != null;
  const resolvedDurationMs = durationMs ?? 0;

  // When the node itself is inactive, dim the visible bottom (source) handle
  // circles so they match the inactive edge colour for outgoing edges.
  const circleHandleStyle = {
    ...CIRCLE_HANDLE_STYLE,
    border: `1.5px solid ${active ? colors.workflow.pipelineEdge : colors.workflow.pipelineEdgeInactive}`,
  };

  return (
    <AgentNodeWrapper $interactive={interactive} $active={active}>
      {/* Badge anchored to the top-right corner (e.g. Relationship Mapping, Risk Insight) */}
      {showBadge && (
        <AgentNodeBadge aria-hidden="true">
          <WorkflowAgentBadgeIcon width={14} height={14} />
        </AgentNodeBadge>
      )}
      {showApache && (
        <AgentNodeApacheBadge aria-hidden="true">
          <img
            src="/apache.webp"
            alt=""
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', imageRendering: 'auto' }}
          />
        </AgentNodeApacheBadge>
      )}
      {showMemo && (
        <AgentNodeMemoBadge aria-hidden="true">
          <img src="/memo.webp" alt="" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
        </AgentNodeMemoBadge>
      )}
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

      <AgentNodeRow $active={active}>
        <AgentNodeIconSlot>{ICON_MAP[icon] ?? null}</AgentNodeIconSlot>
        <AgentNodeLabel>{label}</AgentNodeLabel>
        {icon !== 'ask_ai' && (
          <AgentNodeIconSlot>
            <AgentNodeArrowIcon />
          </AgentNodeIconSlot>
        )}
      </AgentNodeRow>

      {hasDuration && (
        <AgentNodeDurationStrip $active={active}>
          <AgentNodeClockIcon>
            <TinyClockIcon />
          </AgentNodeClockIcon>
          <AgentNodeDurationText>{formatDuration(resolvedDurationMs)}</AgentNodeDurationText>
        </AgentNodeDurationStrip>
      )}

      {/* Bottom (source) handles */}
      {Array.from({ length: bottomHandleCount }, (_, i) => (
        <Handle
          key={`bottom-${i}`}
          id={bottomHandleCount === 1 ? 'bottom' : `bottom-${i}`}
          type="source"
          position={Position.Bottom}
          style={{ ...circleHandleStyle, left: handleLeft(i, bottomHandleCount) }}
        />
      ))}
    </AgentNodeWrapper>
  );
};

export default memo(AgentNode);
