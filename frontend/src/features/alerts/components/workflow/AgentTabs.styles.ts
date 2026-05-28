import styled, { css } from 'styled-components';

export const TabBarWrapper = styled.div`
  position: relative;
  overflow-x: hidden;
  /* vertical padding gives the absolute-positioned scroll button room so its
     border is never clipped by the parent overflow */
  padding: 2px 0;
`;

export const TabBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[8]};
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const TabItem = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  align-items: center;
  padding: 0 0 2px 0;
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: 18px;

  ${({ $active, theme }) =>
    $active
      ? css`
          font-weight: ${theme.typography.fontWeight.semibold};
          color: ${theme.colors.primary};
        `
      : css`
          font-weight: ${theme.typography.fontWeight.normal};
          color: ${theme.colors.disabledText};
          &:hover {
            color: ${theme.colors.contentPrimary};
          }
        `}
`;

export const TabActiveBar = styled.div`
  height: 2px;
  width: 100%;
  border-radius: 1px;
  background: ${({ theme }) => theme.colors.primary};
`;

/** Gradient fade shown on the right or left when tabs overflow horizontally */
export const TabScrollFade = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 2px;
  bottom: 2px;
  ${({ $side }) => ($side === 'right' ? 'right: 0;' : 'left: 0;')}
  width: 187px;
  height: auto;
  background: ${({ $side }) =>
    $side === 'right'
      ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.00) 0.01%, #FFF 69.78%)'
      : 'linear-gradient(270deg, rgba(255, 255, 255, 0.00) 0.01%, #FFF 69.78%)'};
  pointer-events: none;
  z-index: 1;
`;

/** Chevron button sitting on top of the fade — scrolls tabs on click */
export const TabScrollButton = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === 'right' ? 'right: 4px;' : 'left: 4px;')}
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  z-index: 2;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.12s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.workflow.tabBtnHoverBg};
  }

  &:active {
    background: ${({ theme }) => theme.colors.workflow.tabBtnActiveBg};
  }
`;
