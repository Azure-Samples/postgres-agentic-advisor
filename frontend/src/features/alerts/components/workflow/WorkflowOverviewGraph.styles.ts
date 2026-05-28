import styled, { css } from 'styled-components';

export const WorkflowOverviewWrapper = styled.div<{ $variant?: 'alert' | 'chat' }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  width: 100%;
  animation: workflowFadeIn 0.25s ease-out both;

  @keyframes workflowFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }

  ${({ $variant }) =>
    $variant === 'chat' &&
    css`
      flex: 1;
      min-height: 0;
    `}
`;

export const WorkflowOverviewTitle = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.workflow.titleColor};
  letter-spacing: 0.15px;
`;

/**
 * Outer wrapper that holds GraphCanvasWrapper.
 * overflow: visible is preserved so node badges that straddle the node
 * boundary are not clipped.
 */
export const CanvasFrame = styled.div<{ $variant?: 'alert' | 'chat' }>`
  position: relative;
  width: 100%;

  ${({ $variant }) =>
    $variant === 'chat' &&
    css`
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    `}
`;

export const GraphCanvasWrapper = styled.div<{ $interactive: boolean; $ready?: boolean; $variant?: 'alert' | 'chat' }>`
  position: relative;
  width: 100%;
  height: ${({ $variant }) => ($variant === 'chat' ? 'auto' : 'calc(100vh - 350px)')};
  border-radius: 8px;
  border: 1px solid #EBF2FF;
  background-color: #FBFBFB;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  opacity: ${({ $ready }) => ($ready ? 1 : 0)};
  transition: opacity 0.22s ease;

  ${({ $variant }) =>
    $variant === 'chat' &&
    css`
      flex: 1;
    `}

  .react-flow__renderer {
    background: transparent;
  }

  .react-flow__node {
    cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};
  }

  /* Remove default selection box */
  .react-flow__nodesselection-rect,
  .react-flow__selection {
    display: none;
  }
`;

/**
 * White scrollable card rendered inside the graph canvas when a message
 * is provided. Sits 12px inset from the canvas edges and pushes the
 * React Flow graph down — graph content never goes behind the card.
 */
export const GraphMessageCard = styled.div`
  flex-shrink: 0;
  margin: 12px 12px 0;
  height: 116px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #E0E8F6;
  background: #FFF;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.coolGray || '#ccc'};
    border-radius: 2px;
  }
`;

/** Takes the remaining height inside GraphCanvasWrapper for the React Flow canvas. */
export const GraphFlowWrapper = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
`;
