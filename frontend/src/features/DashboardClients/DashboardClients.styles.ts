import styled from 'styled-components';
import { SkeletonBase } from '@/components/Skeleton/Skeleton.styles';

export const DashboardClientsContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[4]} 0 ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[4]};
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
`;

export const DashboardClientsHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
  padding-right: ${({ theme }) => theme.spacing[4]};
`;

export const ViewAllClientsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-decoration: underline;
  flex-shrink: 0;
  transition: opacity 0.15s ease, gap 0.15s ease;

  &:hover {
    opacity: 0.8;
    gap: 7px;
  }
`;

export const DashboardClientsTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 24px;
`;

export const DashboardClientsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[4]};
  max-height: 260px;
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing[4]};

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.25);
  }
`;

export const DashboardClientRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const ClientAvatar = styled.div<{ $bgColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  color: #ffffff;
  background: ${({ $bgColor, theme }) => $bgColor ?? theme.colors.neutralGray};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: 0.4px;
`;

export const ClientInfo = styled.div`
  display: flex;
  flex: 1 0 0;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const ClientNameGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  min-width: 0;
  white-space: nowrap;
`;

export const ClientName = styled.span`
  color: #272F3A;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 20px;
  white-space: nowrap;
`;

export const ClientAum = styled.span`
  color: ${({ theme }) => theme.colors.disabledText};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 16px;
  letter-spacing: -0.02em;
  white-space: nowrap;
`;

export const ClientMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-shrink: 0;
`;

export const ChangeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  flex-shrink: 0;
`;

export const TrendIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

export const ChangeValue = styled.span`
  color: ${({ theme }) => theme.colors.black};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 18px;
  white-space: nowrap;
`;

// ─── Skeleton ────────────────────────────────────────────────────────────────

export const ClientSkeletonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
`;

export const ClientSkeletonAvatar = styled(SkeletonBase)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const ClientSkeletonRowRight = styled.div`
  display: flex;
  flex: 1 0 0;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
`;

export const ClientSkeletonMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

export const ClientSkeletonPill = styled(SkeletonBase)<{ $width: string; $height?: string }>`
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height ?? '16px'};
  border-radius: 200px;
  flex-shrink: 0;
`;

// ── No-clients empty state ────────────────────────────────────────────────────

export const NoClientsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: ${({ theme }) => theme.spacing[6]} 0;
`;

export const NoClientsSkeletonCard = styled.div<{ $faded?: boolean }>`
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

export const NoClientsSkeletonAvatar = styled.div<{ $faded?: boolean }>`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ $faded }) => ($faded ? '#eff1f9' : '#e3e7f1')};
`;

export const NoClientsSkeletonLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

export const NoClientsSkeletonPill = styled.div<{ $width: string; $faded?: boolean }>`
  height: 6px;
  border-radius: 200px;
  background: ${({ $faded }) => ($faded ? '#eff1f9' : '#e3e7f1')};
  width: ${({ $width }) => $width};
`;

export const NoClientsTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.contentSecondary};
  text-align: center;
  margin: 0;
`;

export const NoClientsSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.contentTertiary};
  text-align: center;
  margin: 0;
`;
