import styled, { css } from 'styled-components';

// ─── Outer wrapper ─────────────────────────────────────────────────────────────

export const ChatGraphWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 0;
`;

// ─── Nodes ─────────────────────────────────────────────────────────────────────

const baseNode = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: normal;
  white-space: nowrap;
`;

/** "Query" — white bg, primary purple border */
export const QueryNode = styled.div`
  ${baseNode}
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.workflow.eventBorder};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

/** "Planner Agent" — white bg, active purple border */
export const PlannerNode = styled.div`
  ${baseNode}
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.workflow.entityRingBorder};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

/** "News Synthesizer Agent" row — fully clickable, active purple border */
export const NewsSynthNode = styled.button`
  ${baseNode}
  gap: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.workflow.entityRingBorder};
  color: ${({ theme }) => theme.colors.contentPrimary};
  padding-left: ${({ theme }) => theme.spacing[2.5]};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const NewsSynthIconSlot = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.workflow.nodeBorder};
`;

export const NewsSynthLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

export const NewsSynthGlobe = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const NewsSynthArrow = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.contentSecondary};
`;

/** "Response" — purple gradient bg, white text */
export const ResponseNode = styled.div`
  ${baseNode}
  background: ${({ theme }) => theme.colors.workflow.insightGradient};
  border: none;
  color: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.workflowInsight};
`;

// ─── Connector (circle + line + arrowhead) ────────────────────────────────────

/** Vertical SVG connector drawn between each pair of nodes */
export const ConnectorSvg = styled.svg`
  flex-shrink: 0;
  display: block;
  overflow: visible;
`;

// ─── Detail view ──────────────────────────────────────────────────────────────
/** Card that wraps the pipeline graph (first phase only) */
export const PipelineGraphCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[5]};
  width: 100%;
  box-sizing: border-box;
`;
/** Wraps the graph canvas with Go Back button absolutely positioned on top-left */
export const GraphDetailWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const GoBackOverlayButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  left: ${({ theme }) => theme.spacing[3]};
  z-index: 10;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.primary};
  line-height: 18px;

  &:hover {
    color: ${({ theme }) => theme.colors.hoverPrimary};
  }
`;
