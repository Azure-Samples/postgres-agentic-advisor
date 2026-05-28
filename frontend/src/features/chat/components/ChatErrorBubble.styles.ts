import styled from 'styled-components';

export const ErrorBubbleWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: #fffbf2;
  border: 1px solid rgba(217, 119, 6, 0.18);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  max-width: 560px;
`;

export const ErrorIconCircle = styled.div`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(217, 119, 6, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
  margin-top: 1px;
`;

export const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  flex: 1;
  min-width: 0;
`;

export const ErrorTitle = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: #92400e;
  line-height: 1.4;
`;

export const ErrorBody = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: #a16207;
  line-height: 1.55;
`;

export const RetryButton = styled.button`
  margin-top: ${({ theme }) => theme.spacing[2]};
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  background: none;
  border: 1px solid rgba(217, 119, 6, 0.35);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: #92400e;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: rgba(217, 119, 6, 0.08);
    border-color: rgba(217, 119, 6, 0.5);
  }

  &:active {
    background: rgba(217, 119, 6, 0.14);
  }
`;
