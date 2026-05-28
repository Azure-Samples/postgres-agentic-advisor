import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  EntityNodeContainer,
  EntityNodeDot,
  EntityNodeIconSlot,
  EntityNodeLabel,
  EntityNodeDescription,
  EntityNodeTextRow,
} from './RelationshipEntityNode.styles';
import type { RelationshipNodeData } from '../../../../../mocks/workflowMockData';
import { getEntityIconColor } from '../../../../../utils/workflowRelGraph';
import {
  EntityAgentIcon,
  EntityClientIcon,
  EntitySecurityIcon,
  EntityNewsEntityIcon,
  EntityPortfolioIcon,
  EntityEventsIcon,
  EntityCompanyIcon,
  EntityDefaultIcon,
} from '../../../../../icons';

// ─── Handle slot configuration ──────────────────────────────────────────────
// 5 evenly-spaced slots per side so multiple edges leaving the same side of a
// node each get their own entry/exit point instead of all sharing one point.
const HIDDEN_HANDLE: React.CSSProperties = { opacity: 0, pointerEvents: 'none' };
const SLOT_PERCENTS = [10, 30, 50, 70, 90];
const SIDE_META = [
  { side: 'top', position: Position.Top, attr: 'left' },
  { side: 'right', position: Position.Right, attr: 'top' },
  { side: 'bottom', position: Position.Bottom, attr: 'left' },
  { side: 'left', position: Position.Left, attr: 'top' },
] as const;

// ─── Entity icon resolver ─────────────────────────────────────────────────────

const EntityIcon: React.FC<{ entityType: string }> = ({ entityType }) => {
  const iconColor = getEntityIconColor(entityType);

  switch (entityType) {
    case 'agent':
      return <EntityAgentIcon iconColor={iconColor} />;
    case 'client':
      return <EntityClientIcon iconColor={iconColor} />;
    case 'security':
      return <EntitySecurityIcon iconColor={iconColor} />;
    case 'news':
      return <EntityNewsEntityIcon iconColor={iconColor} />;
    case 'portfolio':
      return <EntityPortfolioIcon iconColor={iconColor} />;
    case 'events':
    case 'articles':
      return <EntityEventsIcon iconColor={iconColor} />;
    case 'company':
      return <EntityCompanyIcon />;
    default:
      return <EntityDefaultIcon iconColor={iconColor} />;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Custom React Flow node for the Phase 3 relationship graph.
 * Colour-coded per entity type, with an icon, label and optional description.
 * Handles are at Top (target) and Bottom (source) for vertical top-to-bottom layout.
 */
const RelationshipEntityNode = ({ data }: NodeProps) => {
  const nodeData = data as RelationshipNodeData;
  return (
    <EntityNodeContainer $highlighted={Boolean(nodeData.highlighted)}>
      {/* 5 handle slots per side — each edge gets its own slot so lines fan
          out from different points instead of stacking at one spot. */}
      {SIDE_META.flatMap(({ side, position, attr }) =>
        SLOT_PERCENTS.flatMap((pct, slot) => {
          const id = `${side}-${slot}`;
          const style: React.CSSProperties = { ...HIDDEN_HANDLE, [attr]: `${pct}%` };
          return [
            <Handle key={`s-${id}`} id={id} type="source" position={position} style={style} />,
            <Handle key={`t-${id}`} id={id} type="target" position={position} style={style} />,
          ];
        }),
      )}

      <EntityNodeIconSlot>
        <EntityIcon entityType={nodeData.entityType} />
      </EntityNodeIconSlot>

      <EntityNodeTextRow>
        <EntityNodeLabel>
          {nodeData.label}
          {nodeData.terminalHighlighted && <EntityNodeDot aria-hidden="true" />}
        </EntityNodeLabel>
        {nodeData.description && <EntityNodeDescription>{nodeData.description}</EntityNodeDescription>}
      </EntityNodeTextRow>
    </EntityNodeContainer>
  );
};

export default memo(RelationshipEntityNode);
