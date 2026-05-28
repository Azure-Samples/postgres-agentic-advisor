import styled from 'styled-components';
import { theme } from '@/styles/theme';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface StyledToastProps {
  $variant: ToastVariant;
}

export const ToastPortal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: ${theme.zIndex.toast};

  > * {
    pointer-events: auto;
  }
`;

const getToastStyles = (variant: ToastVariant) => {
  switch (variant) {
    case 'success':
      return theme.colors.toast.success;
    case 'error':
      return theme.colors.toast.error;
    case 'warning':
      return theme.colors.toast.warning;
    case 'info':
      return theme.colors.toast.info;
    default:
      return theme.colors.toast.success;
  }
};

export const ToastContainer = styled.div<StyledToastProps>`
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${theme.zIndex.toast};
  
  display: flex;
  width: 539px;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  flex-direction: row;
  align-items: center;
  gap: ${theme.spacing[2]};
  
  border-radius: ${theme.borderRadius.lg};
  background: ${({ $variant }) => getToastStyles($variant).background};
  
  box-shadow: ${theme.shadows.sm};
  
  animation: slideDown 0.3s ease-out;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

export const IconContainer = styled.div<StyledToastProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: ${theme.borderRadius.full};
  background: ${({ $variant }) => getToastStyles($variant).iconBg};
  color: ${({ $variant }) => getToastStyles($variant).icon};
  
  .anticon {
    color: inherit;
  }
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[1]};
`;

export const Message = styled.div<StyledToastProps>`
  color: ${({ $variant }) => getToastStyles($variant).text};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-style: normal;
  font-weight: ${theme.typography.fontWeight.bold};
  line-height: ${theme.typography.lineHeight.normal};
  letter-spacing: 0.15px;
`;

export const CloseButton = styled.button<StyledToastProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${theme.spacing[1]};
  border-radius: ${theme.borderRadius.sm};
  transition: background-color 0.2s ease;
  color: ${({ $variant }) => getToastStyles($variant).closeIcon};
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  &:focus {
    outline: 2px solid ${({ $variant }) => getToastStyles($variant).text};
    outline-offset: 2px;
  }
  
  svg {
    fill: currentColor;
  }
`;