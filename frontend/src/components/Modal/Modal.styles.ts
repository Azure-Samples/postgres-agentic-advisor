import styled, { css, keyframes } from 'styled-components';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
`;

interface StyledModalProps {
  $zIndex: number;
}

interface ModalContentProps {
  $width?: string | number;
  $height?: string | number;
  $centered?: boolean;
}

export const StyledModal = styled.div<StyledModalProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ $zIndex }) => $zIndex};
  animation: ${fadeIn} ${({ theme }) => theme.component.inputField.transition.split(' ')[1] || '0.2s'} ease-out;
`;

export const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.drawerOverlay};
  opacity: ${({ theme }) => theme.colors.drawerOverlayOpacity};
  backdrop-filter: blur(${({ theme }) => theme.spacing[1] || '2px'});
`;

export const ModalContent = styled.div<ModalContentProps>`
  position: absolute;
  ${({ $centered }) =>
    $centered
      ? css`
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `
      : css`
          top: ${({ theme }) => theme.spacing[2]};
          left: 50%;
          transform: translateX(-50%);
        `}

  width: ${({ $width }) =>
    typeof $width === 'number' ? `${$width}px` : $width || '817px'};
  height: ${({ $height }) =>
    typeof $height === 'number' ? `${$height}px` : $height || 'auto'};

  max-width: 90vw;
  max-height: 95vh;

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};

  display: flex;
  flex-direction: column;

  animation: ${slideIn} ${({ theme }) => theme.component.inputField.transition.split(' ')[1] || '0.2s'} ease-out;

  /* Smooth height changes when content loads/switches */
  transition: height 0.3s ease, min-height 0.3s ease;

  /* Ensure proper scrolling if content overflows */
  overflow: hidden;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing[4]};

  & > div:nth-child(2) {
    margin-right: 12px;
  }
`;

export const ModalTitle = styled.div`
  flex: 1;

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.logoText};
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }
`;

export const ModalCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing[8]};
  height: ${({ theme }) => theme.spacing[8]};
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.contentTertiary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  flex-shrink: 0;

  transition: ${({ theme }) => theme.component.inputField.transition || 'all 0.2s ease-in-out'};

  &:hover {
    background: ${({ theme }) => theme.colors.overlayHover};
    color: ${({ theme }) => theme.colors.contentPrimary};
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.spacing[1] || '2px'} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.spacing[1] || '2px'};
  }

  .anticon {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }
`;

export const ModalBody = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[8]};
  overflow-y: auto;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: ${({ theme }) => theme.spacing[1.5]};
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutralGray};
    border-radius: ${({ theme }) => theme.borderRadius.xs};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.coolGray};
    border-radius: ${({ theme }) => theme.borderRadius.xs};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.contentTertiary};
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[8]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing[4]};

  /* Common footer layout patterns */
  &.footer-right {
    justify-content: flex-end;
  }

  &.footer-center {
    justify-content: center;
  }

  &.footer-left {
    justify-content: flex-start;
  }

  &.footer-space-between {
    justify-content: space-between;
  }
`;

// Additional styled components for common modal patterns

export const ModalSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ModalSectionTitle = styled.h5`
  margin: 0 0 ${({ theme }) => theme.spacing[3]} 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

export const ModalButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};

  &.button-group-vertical {
    flex-direction: column;
    align-items: stretch;
  }

  &.button-group-right {
    justify-content: flex-end;
  }

  &.button-group-center {
    justify-content: center;
  }
`;
