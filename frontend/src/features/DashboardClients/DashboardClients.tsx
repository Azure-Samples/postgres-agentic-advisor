import React, { useState, useCallback, useRef } from 'react';
import AvatarImage from '@/components/AvatarImage/AvatarImage';
import { useNavigate } from 'react-router-dom';
import { GrowthSparkline } from '@/features/ClientList/GrowthSparkline';
import { getClientAvatarUrl, getInitials, getAvatarColor } from '@/utils/clientAvatarMap';
import { TrendingUpIcon, TrendingDownIcon, ArrowRightIcon } from '@/icons';
import { useDashboardClientsQuery } from '@/api/hooks/useDashboardClientsQuery';
import type { DashboardClientItem } from '@/api/types/dashboardClients.types';
import { BASE_PATHS } from '@/constants/navigation';
import { WidgetErrorState } from '@/components/WidgetErrorState';
import { DashboardClientTooltip } from './DashboardClientTooltip';
import {
  DashboardClientsContainer,
  DashboardClientsHeader,
  DashboardClientsTitle,
  ViewAllClientsButton,
  DashboardClientsList,
  DashboardClientRow,
  ClientAvatar,
  ClientInfo,
  ClientNameGroup,
  ClientName,
  ClientAum,
  ClientMetrics,
  ChangeGroup,
  TrendIcon,
  ChangeValue,
  ClientSkeletonRow,
  ClientSkeletonAvatar,
  ClientSkeletonRowRight,
  ClientSkeletonMetrics,
  ClientSkeletonPill,
  NoClientsWrapper,
  NoClientsSkeletonCard,
  NoClientsSkeletonAvatar,
  NoClientsSkeletonLines,
  NoClientsSkeletonPill,
  NoClientsTitle,
  NoClientsSubtitle,
} from './DashboardClients.styles';

// Representative sparklines per trend direction
const UP_SPARKLINE = [2.5, 2.7, 2.9, 3.0, 3.2, 3.4];
const DOWN_SPARKLINE = [3.5, 3.2, 2.8, 2.5, 2.2, 2.0];

/** Format portfolio value — API returns values already in thousands (e.g. 22.9 = $22.9K) */
const formatPortfolioValue = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}B`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}M`;
  return `$${value.toFixed(1)}K`;
};

interface DashboardClientsProps {
  simulatedDate?: string;
}

const SKELETON_ROWS = 6;

const NoClientsEmptyState: React.FC = () => (
  <NoClientsWrapper>
    <NoClientsSkeletonCard>
      <NoClientsSkeletonAvatar />
      <NoClientsSkeletonLines>
        <NoClientsSkeletonPill $width="79px" />
        <NoClientsSkeletonPill $width="100%" />
        <NoClientsSkeletonPill $width="100%" />
      </NoClientsSkeletonLines>
    </NoClientsSkeletonCard>
    <NoClientsSkeletonCard>
      <NoClientsSkeletonAvatar />
      <NoClientsSkeletonLines>
        <NoClientsSkeletonPill $width="79px" />
        <NoClientsSkeletonPill $width="100%" />
        <NoClientsSkeletonPill $width="100%" />
      </NoClientsSkeletonLines>
    </NoClientsSkeletonCard>
    <div>
      <NoClientsTitle>No Client Activity</NoClientsTitle>
      <NoClientsSubtitle>No client data is available for the selected date.</NoClientsSubtitle>
    </div>
  </NoClientsWrapper>
);

const ClientSkeletonItem: React.FC = () => (
  <ClientSkeletonRow>
    <ClientSkeletonAvatar />
    <ClientSkeletonRowRight>
      <ClientSkeletonPill $width="152px" />
      <ClientSkeletonMetrics>
        <ClientSkeletonPill $width="38px" />
        <ClientSkeletonPill $width="70px" />
      </ClientSkeletonMetrics>
    </ClientSkeletonRowRight>
  </ClientSkeletonRow>
);

export const DashboardClients: React.FC<DashboardClientsProps> = ({ simulatedDate }) => {
  const { data, isLoading, isError, refetch } = useDashboardClientsQuery(simulatedDate);
  const [hoveredClient, setHoveredClient] = useState<DashboardClientItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleNameMouseEnter = useCallback(
    (client: DashboardClientItem, e: React.MouseEvent<HTMLSpanElement>) => {
      clearHideTimeout();
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
      setHoveredClient(client);
    },
    [clearHideTimeout],
  );

  const handleNameMouseLeave = useCallback(() => {
    // Short delay so mouse can travel from name → tooltip without flicker
    hideTimeoutRef.current = setTimeout(() => setHoveredClient(null), 150);
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    clearHideTimeout();
  }, [clearHideTimeout]);

  const handleTooltipMouseLeave = useCallback(() => {
    setHoveredClient(null);
  }, []);

  return (
    <DashboardClientsContainer>
      <DashboardClientsHeader>
        <DashboardClientsTitle>Clients</DashboardClientsTitle>
        {!isLoading && (data?.clients ?? []).length > 0 && (
          <ViewAllClientsButton
            type="button"
            onClick={() => {
              const dateSuffix = simulatedDate?.slice(5); // '2023-MM-DD' → 'MM-DD'
              navigate(dateSuffix ? `${BASE_PATHS.CLIENTS}?date=${dateSuffix}` : BASE_PATHS.CLIENTS);
            }}
          >
            Show All Clients
            <ArrowRightIcon width={12} height={12} />
          </ViewAllClientsButton>
        )}
      </DashboardClientsHeader>

      {isError ? (
        <WidgetErrorState onRetry={refetch} />
      ) : !isLoading && (data?.clients ?? []).length === 0 ? (
        <NoClientsEmptyState />
      ) : (
        <DashboardClientsList>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }).map((_, i) => <ClientSkeletonItem key={i} />)
            : (data?.clients ?? []).map((client) => {
                const isPositive = client.total_return_percentage >= 0;
                const changeLabel = `${isPositive ? '+' : ''}${client.total_return_percentage.toFixed(1)}%`;
                const sparkline = client.trend === 'up' ? UP_SPARKLINE : DOWN_SPARKLINE;
                const avatarUrl = getClientAvatarUrl(client.client_name);
                const initials = getInitials(client.client_name);
                const avatarColor = avatarUrl ? undefined : getAvatarColor(client.client_name);

                return (
                  <DashboardClientRow key={client.client_name}>
                    <ClientAvatar $bgColor={avatarColor}>
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={client.client_name} fallback={initials} />
                      ) : (
                        initials
                      )}
                    </ClientAvatar>
                    <ClientInfo>
                      <ClientNameGroup>
                        <ClientName
                          onMouseEnter={(e) => handleNameMouseEnter(client, e)}
                          onMouseLeave={handleNameMouseLeave}
                          style={{ cursor: 'default' }}
                        >
                          {client.client_name}
                        </ClientName>
                        <ClientAum>{formatPortfolioValue(client.current_portfolio_value)}</ClientAum>
                      </ClientNameGroup>
                      <ClientMetrics>
                        <ChangeGroup>
                          <TrendIcon>{isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}</TrendIcon>
                          <ChangeValue>{changeLabel}</ChangeValue>
                        </ChangeGroup>
                        <GrowthSparkline data={sparkline} width={70} height={16} />
                      </ClientMetrics>
                    </ClientInfo>
                  </DashboardClientRow>
                );
              })}
        </DashboardClientsList>
      )}

      {hoveredClient && (
        <DashboardClientTooltip
          client={hoveredClient}
          x={tooltipPos.x}
          y={tooltipPos.y}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      )}
    </DashboardClientsContainer>
  );
};

export default DashboardClients;
