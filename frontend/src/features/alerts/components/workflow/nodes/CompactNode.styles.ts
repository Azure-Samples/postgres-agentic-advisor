import styled, { css } from 'styled-components';

/** Root wrapper for compact pipeline nodes.
 *  'insight' variant gets a purple gradient fill; default is neutral. */
export const CompactNodeWrapper = styled.div<{ $variant: 'event' | 'insight'; $interactive: boolean }>`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};
  overflow: hidden;

  ${({ $variant, theme }) =>
    $variant === 'insight'
      ? css`
          border: none;
          background: ${theme.colors.workflow.insightGradient};
          box-shadow: ${theme.shadows.workflowInsight};
        `
      : css`
          border: 1px solid ${theme.colors.workflow.nodeBorder};
          background: ${theme.colors.white};
          box-shadow: none;
        `}
`;

/** Inner row holding the label — preserves original padding */
export const CompactNodeRow = styled.div`
  display: inline-flex;
  padding: ${({ theme }) => theme.spacing[4]};
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2.5]};
  width: 100%;
  box-sizing: border-box;
`;

/** Text label inside a compact pipeline node */
export const CompactNodeLabel = styled.span<{ $variant: 'event' | 'insight' }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ $variant, theme }) =>
    $variant === 'insight' ? theme.colors.white : theme.colors.contentPrimary};
  line-height: normal;
`;

/** Duration strip — appearance adapts to the node variant */
export const CompactNodeDurationStrip = styled.div<{ $variant: 'event' | 'insight' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[4]};
  box-sizing: border-box;

  ${({ $variant, theme }) =>
    $variant === 'insight'
      ? css`
          background: rgba(60, 40, 180, 0.28);
          border-top: 1px solid rgba(255, 255, 255, 0.18);
        `
      : css`
          background: ${theme.colors.workflow.refinementLabelBg};
          border-top: 1px solid ${theme.colors.workflow.nodeBorder};
        `}
`;

/** Clock icon wrapper — colour adapts to variant */
export const CompactNodeClockIcon = styled.span<{ $variant: 'event' | 'insight' }>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ $variant, theme }) =>
    $variant === 'insight' ? 'rgba(255,255,255,0.75)' : theme.colors.workflow.accentPurple};
`;

/** Duration text — colour adapts to variant */
export const CompactNodeDurationText = styled.span<{ $variant: 'event' | 'insight' }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: 0;
  line-height: 1;
  color: ${({ $variant, theme }) =>
    $variant === 'insight' ? 'rgba(255,255,255,0.85)' : theme.colors.workflow.refinementLabelColor};
`;
