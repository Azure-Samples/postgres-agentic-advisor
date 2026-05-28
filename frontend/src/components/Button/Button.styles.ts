import styled, { css } from 'styled-components';
import { Button as AntdButton } from 'antd';

export type ButtonVariant = 'primary' | 'text' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface StyledButtonProps { $variant: ButtonVariant; $size: ButtonSize; $fullWidth?: boolean; }

const sizeStyles: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    padding: 0 ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  `,
  md: css`
    padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  `,
  lg: css`
    padding: 0 ${({ theme }) => theme.spacing[5]};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  `,
};

const variantStyles: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    &&.ant-btn {
      background: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.white};
      border: 1px solid ${({ theme }) => theme.colors.primary};
      border-radius: ${({ theme }) => theme.borderRadius.sm};

      &:hover {
        background: ${({ theme }) => theme.colors.hoverPrimary};
        box-shadow: ${({ theme }) => theme.shadows.xs};
        border: 1px solid ${({ theme }) => theme.colors.hoverPrimary};
      }
      
      &:disabled,
      &.ant-btn-loading {
        background: ${({ theme }) => theme.colors.disabledBg};
        color: ${({ theme }) => theme.colors.disabledText};
        border-color: ${({ theme }) => theme.colors.disabledBg};
        cursor: not-allowed;
        
        &:hover{
          background: ${({ theme }) => theme.colors.hoverPrimary};
          box-shadow: ${({ theme }) => theme.shadows.xs};
          border: 1px solid ${({ theme }) => theme.colors.hoverPrimary};
        }
      }
    }
  `,
  text: css` 
    &&.ant-btn {
      background: transparent;
      border: none;
      color: ${({ theme }) => theme.colors.primary};
      box-shadow: none;
      padding: 0;
      margin: 0;
      gap: 6px;

      &:hover{
        color: ${({ theme }) => theme.colors.hoverPrimary};
        border: none;
      }
      
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        
        &:hover {
          background: transparent;
          color: ${({ theme }) => theme.colors.hoverPrimary};
          opacity: 0.4;
        }
      }
    }
  `,
  outline: css`
    &&.ant-btn {
      background: transparent;
      color: ${({ theme }) => theme.colors.primary};
      border: 1px solid ${({ theme }) => theme.colors.primary};
      border-radius: ${({ theme }) => theme.borderRadius.sm};

      &:hover
      {
        background: ${({ theme }) => theme.colors.overlayHover};
        box-shadow: ${({ theme }) => theme.shadows.xs};
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        
        &:hover
        {
          background: ${({ theme }) => theme.colors.overlayHover};
          box-shadow: ${({ theme }) => theme.shadows.xs};
          opacity: 0.5;
        }
      }
    }
  `,
};

export const StyledButton = styled(AntdButton)<StyledButtonProps>`
  &&.ant-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing[2]};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    transition: all 0.2s ease-in;
    line-height: 1;
    box-shadow: none;
    
    ${(p) => sizeStyles[p.$size]};
    ${(p) => variantStyles[p.$variant]};
    ${(p) => p.$fullWidth && css`width: 100%;`};

    &.ant-btn-loading {
      opacity: 0.85;
    }
    
    &:hover,
    &:active {
      box-shadow: none;
    }
  }
`;
