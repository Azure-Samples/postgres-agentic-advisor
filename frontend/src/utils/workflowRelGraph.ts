import { type Node, type Edge } from '@xyflow/react';
import type { AgentId, RelationshipNodeData, RelationshipEdgeData } from '../mocks/workflowMockData';

// ─── Radial layout constants ───────────────────────────────────────────────────

const DEFAULT_RADIUS = 180;
const CANVAS_CX = 300;
const CANVAS_CY = 200;

// ─── Graph builder helpers ─────────────────────────────────────────────────────

type SatelliteSpec = {
  id: string;
  label: string;
  entityType: RelationshipNodeData['entityType'];
  angle: number;
  r?: number;
};

/**
 * Builds a radial cluster of relationship nodes: one center agent node
 * surrounded by satellite entity nodes at the given angles.
 */
export function makeRelNodes(
  agentId: AgentId,
  agentLabel: string,
  satellites: SatelliteSpec[],
): Node<RelationshipNodeData>[] {
  const center: Node<RelationshipNodeData> = {
    id: agentId,
    type: 'relationshipEntity',
    position: { x: CANVAS_CX, y: CANVAS_CY },
    data: { label: agentLabel, entityType: 'agent' },
  };

  const leaves = satellites.map(({ id, label, entityType, angle, r = DEFAULT_RADIUS }) => ({
    id,
    type: 'relationshipEntity' as const,
    position: {
      x: CANVAS_CX + r * Math.cos((angle * Math.PI) / 180),
      y: CANVAS_CY + r * Math.sin((angle * Math.PI) / 180),
    },
    data: { label, entityType },
  }));

  return [center, ...leaves];
}

/**
 * Builds edges from the center agent node to each satellite target id.
 */
export function makeRelEdges(
  agentId: AgentId,
  targetIds: string[],
): Edge<RelationshipEdgeData>[] {
  return targetIds.map((tid) => ({
    id: `e-${agentId}-${tid}`,
    source: agentId,
    target: tid,
    type: 'smoothstep',
  }));
}

// ─── Entity icon colour resolver ───────────────────────────────────────────────

/**
 * Returns the icon colour for a given relationship entity type.
 * Relationship nodes now use a shared white-card treatment, so icons stay
 * on the darker neutral text colour for consistency with the Figma design.
 */
export function getEntityIconColor(entityType: string): string {
  if (entityType === 'events' || entityType === 'articles' || entityType === 'company') return '#252B37';
  return '#252B37';
}
