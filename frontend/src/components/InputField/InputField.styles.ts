import styled, { css } from 'styled-components';

export type InputFieldSize = 'sm' | 'md' | 'lg';

interface StyledInputContainerProps {
  $size: InputFieldSize;
  $fullWidth?: boolean;
  $disabled?: boolean;
  $focused?: boolean;
  $hasError?: boolean;
}

interface StyledTemplateContainerProps {
  $size: InputFieldSize;
  $fullWidth?: boolean;
  $disabled?: boolean;
  $focused?: boolean;
  $hasError?: boolean;
}

interface EditablePlaceholderProps {
  $size: InputFieldSize;
}

const sizeStyles: Record<InputFieldSize, ReturnType<typeof css>> = {
  sm: css`
    padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2.5]};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  `,
  md: css`
    padding: ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  `,
  lg: css`
    padding: ${({ theme }) => theme.spacing[5]};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  `,
};

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const InputLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

export const StyledInputContainer = styled.div<StyledInputContainerProps>`
  display: flex;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: ${({ theme }) => theme.border.light};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.10);
  cursor: ${props => props.$disabled ? 'not-allowed' : 'text'};
  transition: all 0.2s ease;
  
  ${(p) => sizeStyles[p.$size]};
  
  ${props => props.$disabled && css`
    opacity: 0.5;
    background: ${({ theme }) => theme.colors.disabledBg};
    color: ${({ theme }) => theme.colors.disabledText};
  `}
  
  ${props => props.$hasError && css`
    border-color: ${({ theme }) => theme.colors.toast.error.text};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.toast.error.background};
  `}
  
  &:hover:not([disabled]) {
    border-color: ${({ theme }) => props => props.$hasError ? theme.colors.toast.error.text : theme.colors.primary};
  }
`;

export const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.contentPrimary};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.contentTertiary};
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

export const StyledTemplateContainer = styled.div<StyledTemplateContainerProps>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: ${({ theme }) => theme.border.light};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.10);
  color: ${({ theme }) => theme.colors.contentPrimary};
  cursor: text;
  transition: all 0.2s ease;
  
  ${(p) => sizeStyles[p.$size]};
  
  ${props => props.$disabled && css`
    opacity: 0.5;
    background: ${({ theme }) => theme.colors.disabledBg};
    color: ${({ theme }) => theme.colors.disabledText};
    cursor: not-allowed;
  `}
  
  ${props => props.$hasError && css`
    border-color: ${({ theme }) => theme.colors.toast.error.text};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.toast.error.background};
  `}
  
  &:hover:not([disabled]) {
    border-color: ${({ theme }) => props => props.$hasError ? theme.colors.toast.error.text : theme.colors.dropDownText};
  }
`;

export const TemplateText = styled.span`
  color: ${({ theme }) => theme.colors.dropDownItemText};
  white-space: pre-wrap;
  line-height: 1.4;
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
`;

export const EditablePlaceholder = styled.input<EditablePlaceholderProps>`
  border: none;
  outline: none;
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => theme.border.light};
  color: ${({ theme }) => theme.colors.dropDownText};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.component.inputField.placeholderPaddingY} ${({ theme }) => theme.component.inputField.placeholderPaddingX};
  margin: 0 ${({ theme }) => theme.spacing[0]};
  min-width: ${({ theme }) => theme.component.inputField.minPlaceholderWidth}px;
  max-width: ${({ theme }) => theme.component.inputField.maxPlaceholderWidth}px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  display: inline-block;
  transition: ${({ theme }) => theme.component.inputField.transition};
  will-change: width;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  letter-spacing: ${({ theme }) => theme.component.inputField.placeholderLetterSpacing};
  
  &:focus {
    background: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadows.xs};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.dropDownText};
  }
`;

export const EditablePlaceholderSelect = styled.select<EditablePlaceholderProps>`
  border: ${({ theme }) => theme.border.light};
  outline: none;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.dropDownText};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.component.inputField.placeholderPaddingY} ${({ theme }) => theme.component.inputField.placeholderPaddingX};
  font-family: inherit;
  font-size: inherit;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.component.inputField.transition};

  &:focus {
    box-shadow: ${({ theme }) => theme.shadows.xs};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const HiddenSizer = styled.span`
  position: absolute;
  visibility: hidden;
  white-space: pre;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: 1.2;
  pointer-events: none;
  padding: ${({ theme }) => theme.component.inputField.placeholderPaddingY} ${({ theme }) => theme.component.inputField.placeholderPaddingX};
  box-sizing: border-box;
`;

export const TemplateClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  flex-shrink: 0;
  padding: 2px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.contentTertiary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  line-height: 1;
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.contentPrimary};
    background: ${({ theme }) => theme.colors.lightBlueBg};
  }
`;

export const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.toast.error.text};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

export const HelperText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.contentTertiary};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;