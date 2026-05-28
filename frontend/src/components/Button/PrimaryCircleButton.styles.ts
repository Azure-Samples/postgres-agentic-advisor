import styled from 'styled-components';

export const PrimaryCircleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.hoverPrimary || '#1194BC'};
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabledBg};
    cursor: not-allowed;
    opacity: 0.6;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const PrimaryPillButton = styled(PrimaryCircleButton)`
  width: auto;
  height: auto;
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: 60px;
`;
