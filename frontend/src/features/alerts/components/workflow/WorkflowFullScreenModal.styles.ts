import styled from 'styled-components';

export const FullScreenOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
`;

export const FullScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: ${({ theme }) => theme.spacing[8]};
  box-sizing: border-box;
`;

export const FullScreenHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

export const FullScreenTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  position: relative;
`;

export const FullScreenTitle = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

export const FullScreenCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.contentPrimary};
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.lightBlueBg};
  }
`;

export const FullScreenCanvasWrapper = styled.div`
  flex: 1;
  position: relative;
  min-height: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.lightBlueBg};
  background: ${({ theme }) => theme.colors.workflow.surfaceBorder};
  box-shadow: ${({ theme }) => theme.shadows.workflowCanvas};
  overflow: hidden;

  .react-flow__edges {
    z-index: 0;
  }
  .react-flow__nodes {
    z-index: 1;
  }
`;

export const FullScreenLogoImage = styled.img`
  width: ${({ theme }) => theme.layout.workflowHeaderLogoSize};
  height: ${({ theme }) => theme.layout.workflowHeaderLogoSize};
  object-fit: contain;
  image-rendering: auto;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  pointer-events: none;
`;
