import React, { useMemo } from 'react';
import { GrowthSparkline } from '@/features/ClientList/GrowthSparkline';
import { getCompanyConfig } from '@/utils/companyMapper';
import theme from '@/styles/theme';
import { useUpcomingEarningsQuery } from '@/api/hooks/useUpcomingEarningsQuery';
import { WidgetErrorState } from '@/components/WidgetErrorState';
import {
  EarningsContainer,
  EarningsHeader,
  EarningsTitleRow,
  EarningsTitle,
  EarningsTitleSuffix,
  EarningsList,
  EarningsRow,
  CompanyAvatar,
  CompanyInfo,
  CompanyNameRow,
  CompanyName,
  EarningsDateGroup,
  EarningsDate,
  EarningsDaysLabel,
  EarningsSkeletonRow,
  EarningsSkeletonAvatar,
  EarningsSkeletonRowRight,
  EarningsSkeletonMetrics,
  EarningsSkeletonPill,
  NoEarningsWrapper,
  NoEarningsSkeletonCard,
  NoEarningsSkeletonAvatar,
  NoEarningsSkeletonLines,
  NoEarningsSkeletonPill,
  NoEarningsTitle,
  NoEarningsSubtitle,
} from './UpcomingEarnings.styles';

// Representative sparklines for each trend direction
const UP_SPARKLINE = [1, 1.5, 1.2, 1.8, 1.6, 2.2];
const DOWN_SPARKLINE = [2.2, 1.8, 2, 1.5, 1.2, 1];

/** Format a days_from_reference number into a human-readable label. */
const formatDaysLabel = (days: number): string => {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days === -1) return 'Yesterday';
  if (days > 0) return `${days} days ago`;
  return `${Math.abs(days)} days ago`;
};

/** Parse an ISO date string (YYYY-MM-DD) into a short display string like "24 Oct". */
const formatEarningsDate = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00`);
  if (isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

interface UpcomingEarningsProps {
  simulatedDate?: string;
}

const SKELETON_ROWS = 6;

const NoEarningsEmptyState: React.FC = () => (
  <NoEarningsWrapper>
    <NoEarningsSkeletonCard>
      <NoEarningsSkeletonAvatar />
      <NoEarningsSkeletonLines>
        <NoEarningsSkeletonPill $width="79px" />
        <NoEarningsSkeletonPill $width="100%" />
        <NoEarningsSkeletonPill $width="100%" />
      </NoEarningsSkeletonLines>
    </NoEarningsSkeletonCard>
    <NoEarningsSkeletonCard>
      <NoEarningsSkeletonAvatar />
      <NoEarningsSkeletonLines>
        <NoEarningsSkeletonPill $width="79px" />
        <NoEarningsSkeletonPill $width="100%" />
        <NoEarningsSkeletonPill $width="100%" />
      </NoEarningsSkeletonLines>
    </NoEarningsSkeletonCard>
    <div>
      <NoEarningsTitle>No Earnings Scheduled</NoEarningsTitle>
      <NoEarningsSubtitle>No companies have earnings reports for this period.</NoEarningsSubtitle>
    </div>
  </NoEarningsWrapper>
);

const EarningsSkeletonItem: React.FC = () => (
  <EarningsSkeletonRow>
    <EarningsSkeletonAvatar />
    <EarningsSkeletonRowRight>
      <EarningsSkeletonPill $width="152px" />
      <EarningsSkeletonMetrics>
        <EarningsSkeletonPill $width="38px" />
        <EarningsSkeletonPill $width="70px" />
      </EarningsSkeletonMetrics>
    </EarningsSkeletonRowRight>
  </EarningsSkeletonRow>
);

export const UpcomingEarnings: React.FC<UpcomingEarningsProps> = ({ simulatedDate }) => {
  const { data, isLoading, isError, refetch } = useUpcomingEarningsQuery(simulatedDate);

  const earnings = useMemo(() => {
    const list = [...(data?.earnings ?? [])];
    const PINNED = ['zava', 'contoso'];
    list.sort((a, b) => {
      const ai = PINNED.findIndex((p) => a.company_name.toLowerCase().startsWith(p));
      const bi = PINNED.findIndex((p) => b.company_name.toLowerCase().startsWith(p));
      const ar = ai === -1 ? PINNED.length : ai;
      const br = bi === -1 ? PINNED.length : bi;
      return ar - br;
    });
    return list;
  }, [data]);

  return (
    <EarningsContainer>
      <EarningsHeader>
        <EarningsTitleRow>
          <EarningsTitle>Upcoming Earnings</EarningsTitle>
          <EarningsTitleSuffix>(For Relevant Companies)</EarningsTitleSuffix>
        </EarningsTitleRow>
      </EarningsHeader>

      {isError ? (
        <WidgetErrorState onRetry={refetch} />
      ) : !isLoading && earnings.length === 0 ? (
        <NoEarningsEmptyState />
      ) : (
      <EarningsList>
        {isLoading
          ? Array.from({ length: SKELETON_ROWS }).map((_, i) => <EarningsSkeletonItem key={i} />)
          : earnings.map((item) => {
              const company = getCompanyConfig(item.company_name);
              const sparkline = item.trend === 'up' ? UP_SPARKLINE : DOWN_SPARKLINE;
              return (
                <EarningsRow key={item.company_name}>
                  <CompanyAvatar $bgColor={company?.bgColor ?? theme.colors.contentTertiary}>
                    {company?.Icon ? <company.Icon /> : item.company_name.charAt(0)}
                  </CompanyAvatar>
                  <CompanyInfo>
                    <CompanyNameRow>
                      <CompanyName>{item.company_name}</CompanyName>
                      {item.days_from_reference !== null && (
                        <EarningsDaysLabel $trend={item.trend}>
                          {formatDaysLabel(item.days_from_reference)}
                        </EarningsDaysLabel>
                      )}
                    </CompanyNameRow>
                    <EarningsDateGroup>
                      <GrowthSparkline data={sparkline} width={70} height={16} />
                      <EarningsDate>{formatEarningsDate(item.earnings_date)}</EarningsDate>
                    </EarningsDateGroup>
                  </CompanyInfo>
                </EarningsRow>
              );
            })}
      </EarningsList>
      )}
    </EarningsContainer>
  );
};

export default UpcomingEarnings;
