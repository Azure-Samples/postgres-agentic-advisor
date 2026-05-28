import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import AvatarImage from '@/components/AvatarImage/AvatarImage';
import { TooltipArrowIcon } from '@/icons';
import theme from '@/styles/theme';
import {
  TooltipArrow,
  TooltipCard,
  TooltipWrapper,
  TooltipHeaderRow,
  TooltipAvatar,
  TooltipCompanyName,
  TooltipDivider,
} from '@/components/AlertTile/AlertTileTooltip/AlertTileTooltip.styles';
import type { DashboardClientItem } from '@/api/types/dashboardClients.types';
import { getClientAvatarUrl, getInitials, getAvatarColor } from '@/utils/clientAvatarMap';
import {
  ClientTooltipMetricRow,
  ClientTooltipLabel,
  ClientTooltipValue,
  TooltipHoldingsGroup,
  TooltipHoldingPill,
  TooltipOverflowPill,
} from './DashboardClientTooltip.styles';

const formatPortfolioValue = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}B`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}M`;
  return `$${value.toFixed(1)}K`;
};

const MAX_VISIBLE_HOLDINGS = 2;

interface DashboardClientTooltipProps {
  client: DashboardClientItem;
  x: number;
  y: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const DashboardClientTooltip: React.FC<DashboardClientTooltipProps> = ({
  client,
  x,
  y,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [holdingsExpanded, setHoldingsExpanded] = useState(false);

  const avatarUrl = getClientAvatarUrl(client.client_name);
  const initials = getInitials(client.client_name);
  const avatarColor = getAvatarColor(client.client_name);
  const isPositive = client.total_return_percentage >= 0;
  const changeLabel = `${isPositive ? '+' : ''}${client.total_return_percentage.toFixed(1)}%`;

  const holdings = client.holdings ?? [];
  const visibleHoldings = holdings.slice(0, MAX_VISIBLE_HOLDINGS);
  const hiddenHoldings = holdings.slice(MAX_VISIBLE_HOLDINGS);

  return ReactDOM.createPortal(
    <TooltipWrapper $x={x} $y={y} style={{ zIndex: 100, pointerEvents: 'auto' }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <TooltipCard>
        <TooltipHeaderRow>
          <TooltipAvatar $color={avatarColor}>
            {avatarUrl ? (
              <AvatarImage
                src={avatarUrl}
                alt={client.client_name}
                imgStyle={{ borderRadius: '50%' }}
                fallback={<span style={{ fontSize: '7px', fontWeight: 600, color: '#fff', fontFamily: 'inherit', lineHeight: 1 }}>{initials}</span>}
              />
            ) : (
              <span style={{ fontSize: '7px', fontWeight: 600, color: '#fff', fontFamily: 'inherit', lineHeight: 1 }}>
                {initials}
              </span>
            )}
          </TooltipAvatar>
          <TooltipCompanyName>{client.client_name}</TooltipCompanyName>
        </TooltipHeaderRow>
        <TooltipDivider />

        <ClientTooltipMetricRow>
          <ClientTooltipLabel>Portfolio</ClientTooltipLabel>
          <ClientTooltipValue>{formatPortfolioValue(client.current_portfolio_value)}</ClientTooltipValue>
        </ClientTooltipMetricRow>

        <ClientTooltipMetricRow>
          <ClientTooltipLabel>Return</ClientTooltipLabel>
          <ClientTooltipValue $positive={isPositive}>{changeLabel}</ClientTooltipValue>
        </ClientTooltipMetricRow>

        {holdings.length > 0 && (
          <ClientTooltipMetricRow>
            <ClientTooltipLabel>Holdings</ClientTooltipLabel>
            <TooltipHoldingsGroup>
              {visibleHoldings.map((ticker) => (
                <TooltipHoldingPill key={ticker}>{ticker}</TooltipHoldingPill>
              ))}

              {!holdingsExpanded && hiddenHoldings.length > 0 && (
                <TooltipOverflowPill
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHoldingsExpanded(true);
                  }}
                >
                  +{hiddenHoldings.length}
                </TooltipOverflowPill>
              )}

              {holdingsExpanded &&
                hiddenHoldings.map((ticker) => (
                  <TooltipHoldingPill key={ticker}>{ticker}</TooltipHoldingPill>
                ))}
            </TooltipHoldingsGroup>
          </ClientTooltipMetricRow>
        )}
      </TooltipCard>
      <TooltipArrow>
        <TooltipArrowIcon style={{ color: theme.colors.tooltipBg }} />
      </TooltipArrow>
    </TooltipWrapper>,
    document.body,
  );
};
