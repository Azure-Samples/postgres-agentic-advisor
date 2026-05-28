import styled from 'styled-components';

export const EntityNodeContainer = styled.div<{ $highlighted: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ $highlighted }) => ($highlighted ? '16px 20px' : '16px 24px')};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  /* Use white (not canvas colour) for the gap ring so it stays opaque
     over any edge path that passes beneath the node. */
  border: ${({ $highlighted }) => ($highlighted ? '4px solid #FFFFFF' : 'none')};
  background: #FFFFFF;
  box-shadow: ${({ $highlighted, theme }) =>
    $highlighted
      ? `0 0 0 4px #8677FF`
      : `0 0 0 1px ${theme.colors.workflow.pipelineEdge}`};
  width: 260px;
  min-height: 56px;
  box-sizing: border-box;
`;

export const EntityNodeIconSlot = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

export const EntityNodeTextRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const EntityNodeLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.contentPrimary};
  white-space: normal;
  word-break: break-word;
`;

export const EntityNodeDescription = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.contentTertiary};
  white-space: normal;
  word-break: break-word;
`;

export const EntityNodeDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.workflow.entityRingBorder};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  flex-shrink: 0;
  align-self: center;
`;
