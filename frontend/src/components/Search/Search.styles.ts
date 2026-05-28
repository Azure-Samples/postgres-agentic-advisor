import styled, { css } from 'styled-components';
import { Input } from 'antd';

export type SearchSize = 'sm' | 'md' | 'lg';

interface StyledSearchProps {
  $size: SearchSize;
  $fullWidth?: boolean;
  $focused?: boolean;
}

const sizeStyles: Record<SearchSize, ReturnType<typeof css>> = {
  sm: css`
    height: 35px;

    .ant-input {
      padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
    }

    .ant-input-prefix {
      margin-inline-end: ${({ theme }) => theme.spacing[1]};
    }
  `,
  md: css`
    height: 44px;

    .ant-input {
      padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }

    .ant-input-prefix {
      margin-inline-end: ${({ theme }) => theme.spacing[2]};
    }
  `,
  lg: css`
    height: 48px;

    .ant-input {
      padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
      font-size: ${({ theme }) => theme.typography.fontSize.base};
    }

    .ant-input-prefix {
      margin-inline-end: ${({ theme }) => theme.spacing[2]};
    }
  `,
};

export const StyledSearchContainer = styled.div<StyledSearchProps>`
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  display: flex;
  align-items: center;
  position: relative;
  ${({ $size }) => sizeStyles[$size]}
`;

export const StyledSearch = styled(Input)<StyledSearchProps>`
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.coolGray};
  background: ${({ theme }) => theme.colors.white};
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus,
  &.ant-input-focused {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }

  .ant-input {
    border: none;
    background: transparent;
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    color: ${({ theme }) => theme.colors.contentPrimary};
    box-shadow: none;
    outline: none;

    &::placeholder {
      color: ${({ theme }) => theme.colors.contentTertiary};
      font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      opacity: 0.5;
    }

    &:focus {
      border: none;
      box-shadow: none;
      outline: none;
    }
  }

  .ant-input-prefix {
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.contentTertiary};

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .ant-input-suffix {
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.contentTertiary};

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &.ant-input-affix-wrapper {
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    gap: ${({ theme }) => theme.spacing[2]};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    border: 1px solid ${({ theme }) => theme.colors.coolGray};
    background: ${({ theme }) => theme.colors.white};

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
    }

    &:focus,
    &.ant-input-affix-wrapper-focused {
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }

  ${({ $size }) => sizeStyles[$size]}
`;

export const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.contentTertiary};

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.contentTertiary};
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.contentSecondary};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;
