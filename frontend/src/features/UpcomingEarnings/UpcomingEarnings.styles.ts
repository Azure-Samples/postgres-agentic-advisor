import styled from 'styled-components';
import { SkeletonBase } from '@/components/Skeleton/Skeleton.styles';

export const EarningsContainer = styled.div`
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

export const EarningsHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
  padding-right: ${({ theme }) => theme.spacing[4]};
`;

export const EarningsTitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const EarningsTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 24px;
`;

export const EarningsTitleSuffix = styled.span`
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 24px;
`;

export const EarningsList = styled.div`
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

export const EarningsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const CompanyAvatar = styled.div<{ $bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 32px;
  border: 1.5px solid #efefef;
  background-color: ${({ $bgColor }) => $bgColor};
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.05);
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1;
  overflow: hidden;

  svg {
    display: block;
    flex-shrink: 0;
    width: 18px;
    height: auto;
  }
`;

export const CompanyInfo = styled.div`
  display: flex;
  flex: 1 0 0;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const CompanyNameRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
  flex: 1 0 0;
`;

export const CompanyName = styled.span`
  color: #272F3A;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
`;

export const EarningsDateGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-shrink: 0;
`;

export const EarningsDate = styled.span`
  color: ${({ theme }) => theme.colors.black};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 18px;
  white-space: nowrap;
`;

export const EarningsDaysLabel = styled.span<{ $trend: 'up' | 'down' }>`
  color: ${({ $trend }) => ($trend === 'up' ? '#06904E' : '#b82020')};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 18px;
  letter-spacing: 0.24px;
  white-space: nowrap;
  flex-shrink: 0;
`;

// ─── Skeleton ────────────────────────────────────────────────────────────────

export const EarningsSkeletonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
`;

export const EarningsSkeletonAvatar = styled(SkeletonBase)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const EarningsSkeletonRowRight = styled.div`
  display: flex;
  flex: 1 0 0;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
`;

export const EarningsSkeletonMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

export const EarningsSkeletonPill = styled(SkeletonBase)<{ $width: string; $height?: string }>`
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height ?? '16px'};
  border-radius: 200px;
  flex-shrink: 0;
`;

// ── No-earnings empty state ───────────────────────────────────────────────────

export const NoEarningsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: ${({ theme }) => theme.spacing[6]} 0;
`;

export const NoEarningsSkeletonCard = styled.div<{ $faded?: boolean }>`
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

export const NoEarningsSkeletonAvatar = styled.div<{ $faded?: boolean }>`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ $faded }) => ($faded ? '#eff1f9' : '#e3e7f1')};
`;

export const NoEarningsSkeletonLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

export const NoEarningsSkeletonPill = styled.div<{ $width: string; $faded?: boolean }>`
  height: 6px;
  border-radius: 200px;
  background: ${({ $faded }) => ($faded ? '#eff1f9' : '#e3e7f1')};
  width: ${({ $width }) => $width};
`;

export const NoEarningsTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.contentSecondary};
  text-align: center;
  margin: 0;
`;

export const NoEarningsSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.contentTertiary};
  text-align: center;
  margin: 0;
`;
