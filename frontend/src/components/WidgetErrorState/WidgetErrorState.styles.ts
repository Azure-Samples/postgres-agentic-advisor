import styled from 'styled-components';

export const ErrorStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 10px;
  padding: ${({ theme }) => theme.spacing[6]} 0;
`;

export const ErrorIconCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  flex-shrink: 0;
`;

export const ErrorTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
`;

export const ErrorTitle = styled.p`
  font-family: 'Roboto', sans-serif;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.contentSecondary};
  text-align: center;
  margin: 0;
`;

export const ErrorSubtitle = styled.p`
  font-family: 'Roboto', sans-serif;
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.contentTertiary};
  text-align: center;
  margin: 0;
`;

export const ErrorRetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  padding: 6px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.error};
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.errorBg};
  }
`;
