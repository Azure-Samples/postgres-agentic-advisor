import styled, { css, keyframes } from 'styled-components';

const contentFadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0);   }
`;

export const AgentDetailPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  width: 100%;
`;

export const GoBackButton = styled.button`
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

export const ContentCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.lightBlueBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[5]};
  width: 100%;
  box-sizing: border-box;
  animation: ${contentFadeIn} 0.2s ease-out both;
  height: calc(100vh - 320px);
`;

export const GraphOverlayWrapper = styled.div`
  position: relative;
  width: 100%;
  animation: ${contentFadeIn} 0.2s ease-out both;
`;

export const GraphOverlayToggle = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  left: ${({ theme }) => theme.spacing[3]};
  z-index: 10;
`;

export const ViewToggleGroup = styled.div`
  display: inline-flex;
  width: fit-content;
  gap: 0;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.drawerBorder};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.05);
  overflow: visible;
`;

export const ViewToggleButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1.5]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  opacity: 0.8;
  transition: background 0.15s ease, color 0.15s ease;
  line-height: 20px;
  letter-spacing: -0.01em;

  /* Left button always has left rounded corners */
  &:first-child {
    border-radius: ${({ theme }) => theme.borderRadius.md} 0 0 ${({ theme }) => theme.borderRadius.md};
    margin-right: -1px;
  }

  /* Right button always has right rounded corners */
  &:last-child {
    border-radius: 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0;
  }

  ${({ $active, theme }) =>
    $active
      ? css`
          background: ${theme.colors.primary};
          color: ${theme.colors.white};
        `
      : css`
          background: ${theme.colors.white};
          color: ${theme.colors.contentPrimary};
          &:hover {
            background: ${theme.colors.lightCyanBg};
          }
        `}
`;

export const ScrollableCardBody = styled.div`
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.coolGray} transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.coolGray};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.contentTertiary};
  }
`;
