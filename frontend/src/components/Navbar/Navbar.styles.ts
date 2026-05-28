import styled, { css } from 'styled-components';

export const NavbarContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing[8]};
  background: ${({ theme }) => theme.colors.white};
  border-bottom: ${({ theme }) => theme.border.light};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  height: 72px;
  width: 100%;
  margin: 0;
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.nav};
`;

export const NavbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.logoGradient};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
`;

export const LogoText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.logoText};
`;

export const NavbarCenter = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

export const NavLinksContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  gap: ${({ theme }) => theme.spacing[8]};
`;

export const NavLink = styled.button<{ $isActive?: boolean }>`
  background: none;
  border: none;
  padding: 0 ${({ theme }) => theme.spacing[2]};
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme, $isActive }) => 
    $isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal};
  color: ${({ theme, $isActive }) =>  
    $isActive ? theme.colors.primary : theme.colors.navLinkSecondary};
  transition: color 0.2s ease;
  line-height: 114%;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  ${({ $isActive, theme }) => $isActive && css`
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: -${theme.spacing[1]};
      right: -${theme.spacing[1]};
      height: 3px;
      background: ${theme.colors.primary};
    }
  `}
`;

export const NavbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[8]};
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing[2]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.contentSecondary};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.overlayHover};
    color: ${({ theme }) => theme.colors.contentPrimary};
  }
`;

export const AvatarContainer = styled.div`
  position: relative;
`;

export const Avatar = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
  }
`;

export const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => theme.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.2s ease;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
`;

export const DropdownItem = styled.button<{ $disabled?: boolean; $active?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border: none;
  background: none;
  text-align: left;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: background 0.2s ease, color 0.2s ease;

  ${({ $disabled, $active, theme }) =>
    $disabled
      ? `
        cursor: default;
        color: ${theme.colors.disabledText};
        opacity: 0.45;
        pointer-events: none;
      `
      : $active
        ? `
        cursor: pointer;
        color: ${theme.colors.primary};
        &:hover {
          background: ${theme.colors.chipPrimaryBg};
          color: ${theme.colors.primary};
        }
      `
        : `
        cursor: pointer;
        color: ${theme.colors.contentPrimary};
        &:hover {
          background: ${theme.colors.overlayHover};
        }
      `}

  &:first-child {
    border-radius: ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0 0;
  }

  &:last-child {
    border-radius: 0 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md};
  }
`;

export const DropdownDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing[1]} 0;
`;