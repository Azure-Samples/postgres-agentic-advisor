import styled from 'styled-components';

export const ToolsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.drawerBorder};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

export const ToolButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.12s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutralGray};
  }

  &:active {
    background: ${({ theme }) => theme.colors.disabledBg};
  }
`;

export const ToolDivider = styled.div`
  width: 1px;
  min-height: 4px;
  align-self: stretch;
  background: ${({ theme }) => theme.colors.drawerBorder};
  border-radius: 10000px;
  flex-shrink: 0;
`;
