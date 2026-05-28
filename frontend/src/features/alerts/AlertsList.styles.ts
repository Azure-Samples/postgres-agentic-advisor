import styled from 'styled-components';

export const AlertsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  flex: 1;
  min-height: 0;
`;

export const AlertsScrollable = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  /* Thin, unobtrusive scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.cardBorder} transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.cardBorder};
    border-radius: 4px;
  }
`;

export const ViewAllLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-align: left;
  text-decoration: underline;
  align-self: flex-start;

  &:hover {
    opacity: 0.8;
  }
`;

export const ErrorContainer = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  text-align: center;
  color: ${({ theme }) => theme.colors.error};
  background-color: ${({ theme }) => theme.colors.errorBg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

export const ErrorMessage = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export const RetryButton = styled.button`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

// ── No-alerts empty state ─────────────────────────────────────────────────────

export const NoAlertsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: ${({ theme }) => theme.spacing[6]} 0;
`;

export const NoAlertsSkeletonCard = styled.div<{ $faded?: boolean }>`
  display: flex;
  gap: 9px;
  align-items: flex-start;
  background: ${({ $faded }) =>
    $faded
      ? 'linear-gradient(to bottom, #f2f4f9 4.167%, transparent 100%)'
      : '#f2f4f9'};
  border-radius: 8px;
  padding: 16px;
  width: 262px;
`;

export const NoAlertsSkeletonAvatar = styled.div<{ $faded?: boolean }>`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ $faded }) => ($faded ? '#eff1f9' : '#e3e7f1')};
`;

export const NoAlertsSkeletonLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

export const NoAlertsSkeletonRow = styled.div<{ $width: string; $faded?: boolean }>`
  height: 6px;
  border-radius: 200px;
  background: ${({ $faded }) => ($faded ? '#eff1f9' : '#e3e7f1')};
  width: ${({ $width }) => $width};
`;

export const NoAlertsTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.contentSecondary};
  text-align: center;
  margin: 0;
`;

export const NoAlertsSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.contentTertiary};
  text-align: center;
  margin: 0;
`;
