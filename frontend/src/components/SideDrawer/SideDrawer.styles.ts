import styled from 'styled-components';

export const DrawerOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${({ $isOpen }) => $isOpen ? '1' : '0'};
  z-index: ${({ theme }) => theme.zIndex.overlay};
  pointer-events: ${({ $isOpen }) => $isOpen ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
  overflow: hidden;
`;

export const SideDrawerContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: ${({ theme }) => theme.spacing[6]};
  right: ${({ theme }) => theme.spacing[6]};
  bottom: ${({ theme }) => theme.spacing[6]};
  width: 538px;
  max-width: calc(100vw - 48px);
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  z-index: ${({ theme }) => theme.zIndex.modal};
  transform: translateX(${({ $isOpen }) => $isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const DrawerContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;