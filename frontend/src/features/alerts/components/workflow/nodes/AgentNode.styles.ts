import styled from 'styled-components';

/** Root wrapper for an agent node box inside the pipeline React Flow canvas */
export const AgentNodeWrapper = styled.div<{ $interactive: boolean; $active: boolean }>`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: ${({ $active, theme }) =>
    $active
      ? `1.5px solid ${theme.colors.workflow.entityRingBorder}`
      : `1px solid ${theme.colors.workflow.nodeBorder}`};
  background: ${({ theme }) => theme.colors.white};
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};
  overflow: hidden;
`;

/** Inner row holding icon + label + arrow — sits on top */
export const AgentNodeRow = styled.div<{ $active: boolean }>`
  display: inline-flex;
  padding: ${({ theme }) => theme.spacing[4]};
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2.5]};
  width: 100%;
  box-sizing: border-box;
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
`;

/** Flex wrapper for icon slots on the left and right of the agent node */
export const AgentNodeIconSlot = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

/** Text label inside an agent node */
export const AgentNodeLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.contentPrimary};
  line-height: normal;
`;

/** Duration strip — sits flush at the bottom of the node card */
export const AgentNodeDurationStrip = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[4]};
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.workflow.refinementLabelBg};
  border-top: 1px solid ${({ theme }) => theme.colors.workflow.nodeBorder};
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
`;

/** Clock icon svg wrapper */
export const AgentNodeClockIcon = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.workflow.accentPurple};
  opacity: 0.75;
`;

/**
 * Absolute badge anchored to the top-right corner of the node card.
 * Matches the circular badge on the canvas in the previous design but is
 * now per-node (e.g. Relationship Mapping, Risk Insight).
 */
export const AgentNodeBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
  border-radius: 200px;
  border: 1px solid ${({ theme }) => theme.colors.workflow.badgeBorder};
  background: ${({ theme }) => theme.colors.white};
  z-index: 5;
  pointer-events: none;
`;

/**
 * Rectangular Apache sticker badge anchored to the top-right corner of the
 * Relationship Mapping node card.
 */
export const AgentNodeApacheBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 29px;
  height: 19px;
  border-radius: 3px;
  overflow: hidden;
  z-index: 5;
  pointer-events: none;
  aspect-ratio: 29 / 19;
`;

/**
 * Rectangular memo image badge anchored to the top-right corner of the
 * Risk Insight node card.
 */
export const AgentNodeMemoBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 30px;
  height: 30px;
  border-radius: 3px;
  overflow: hidden;
  z-index: 5;
  pointer-events: none;
`;

/** Duration text label */
export const AgentNodeDurationText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.workflow.refinementLabelColor};
  letter-spacing: 0;
  line-height: 1;
`;
