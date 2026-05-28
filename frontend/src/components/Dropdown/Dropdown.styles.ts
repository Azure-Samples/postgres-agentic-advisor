import styled, { css } from 'styled-components';

export type DropdownSize = 'sm' | 'md' | 'lg';
export type DropdownPlacement = 'top' | 'bottom';

interface StyledDropdownProps {
  $size: DropdownSize;
  $fullWidth?: boolean;
  $disabled?: boolean;
  $isOpen?: boolean;
}

interface StyledDropdownListProps {
  $placement: DropdownPlacement;
  $maxHeight?: number;
  $position?: { top: number; left: number; width: number };
}

interface StyledDropdownItemProps {
  $isSelected?: boolean;
  $isHovered?: boolean;
}

const sizeStyles: Record<DropdownSize, ReturnType<typeof css>> = {
  sm: css`
    padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2.5]};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  `,
  md: css`
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  `,
  lg: css`
    padding: ${({ theme }) => theme.spacing[2.5]} ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  `,
};

export const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const StyledDropdown = styled.div<StyledDropdownProps>`
  display: flex;
  width: ${props => props.$fullWidth ? '100%' : '200px'};
  justify-content: space-between;
  text-align: left;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: ${({ theme }) => theme.border.light};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.10);
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  ${(p) => sizeStyles[p.$size]};
  
  ${props => props.$disabled && css`
    opacity: 0.5;
    background: ${({ theme }) => theme.colors.disabledBg};
    color: ${({ theme }) => theme.colors.disabledText};
  `}
  
  ${props => props.$isOpen && css`
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  `}
  
  &:hover:not([disabled]) {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

export const DropdownContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const DropdownText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.dropDownText};
`;

export const DropdownPlaceholder = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.dropDownText};
`;

export const DropdownIcon = styled.div`
  display: flex;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing[1.5]};
  
  svg {
    transition: transform 0.2s ease;
  }
`;

export const StyledDropdownList = styled.div<StyledDropdownListProps>`
  /* Fixed positioning for portal rendering - prevents overflow issues */
  position: fixed;
  text-align: left;
  z-index: 1800;
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => theme.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: ${({ theme }) => theme.spacing[1]};
  max-height: ${props => props.$maxHeight ? `${props.$maxHeight}px` : '200px'};
  overflow-y: auto;
  
  /* Use position from component to align with dropdown field */
  ${props => props.$position && css`
    left: ${props.$position.left}px;
  `}
  
  /* Responsive min-width for dropdown menu */
  min-width: max(360px, ${props => props.$position?.width || 200}px);
  width: max-content;
  max-width: min(calc(100vw - 32px), 500px); /* Responsive max-width */
  
  /* Calculate top position based on placement */
  ${props => {
    if (!props.$position) return '';
    
    if (props.$placement === 'top') {
      // Position above the dropdown field
      return css`
        bottom: calc(100vh - ${props.$position.top}px + 8px);
      `;
    } else {
      // Position below the dropdown field (default)
      return css`
        top: ${props.$position.top + 8}px;
      `;
    }
  }}
  
  /* Responsive adjustments for smaller screens */
  @media (max-width: 480px) {
    min-width: max(280px, ${props => props.$position?.width || 200}px);
    max-width: calc(100vw - 32px);
  }
  
  @media (max-width: 375px) {
    min-width: max(240px, ${props => props.$position?.width || 200}px);
    max-width: calc(100vw - 24px);
  }
`;

export const DropdownSearchContainer = styled.div`
  border-bottom: ${({ theme }) => theme.border.light};;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  margin-left: -${({ theme }) => theme.spacing[1]};
  margin-right: -${({ theme }) => theme.spacing[1]};
`;

export const DropdownSearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[8]};
  border: none;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  outline: none;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.darkGray};
  }
`;

export const DropdownSearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const DropdownSearchIcon = styled.div`
  position: absolute;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  left: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.darkGray};
  pointer-events: none;
`;

export const StyledDropdownItem = styled.div<StyledDropdownItemProps>`
  display: flex;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[2]};
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: background-color 0.1s ease;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.dropDownText};
  
  ${props => (props.$isSelected || props.$isHovered) && css`
    background: ${({ theme }) => theme.colors.neutralGray};
  `}
  
  &:hover {
    background: ${({ theme }) => theme.colors.neutralGray};
  }
`;

export const DropdownItemText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.dropDownItemText};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
`;

export const DropdownEmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[2]};
  text-align: center;
  color: ${({ theme }) => theme.colors.contentTertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const DropdownLoadingState = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[2]};
  text-align: center;
  color: ${({ theme }) => theme.colors.contentTertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;