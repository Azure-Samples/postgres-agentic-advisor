import React from 'react';
import { FlameSmallIcon } from '@/icons';
import AvatarImage from '@/components/AvatarImage/AvatarImage';
import {
  ClientAvatarCircle,
  ClientInfoCard,
  ClientInfoLeft,
  ClientInfoRow,
  ClientMetrics,
  ClientNameText,
  CrmNoteText,
  MetricPair,
  MetricPairLabel,
  MetricPairValue,
  RiskProfileBadge,
  RiskProfileText,
} from '../AlertSummaryModal.styles';
import { formatCurrency, getInitials } from '../utils/alertSummaryUtils';
import { getClientAvatarUrl } from '@/utils/clientAvatarMap';
import { formatRiskProfile } from '@/utils/clientUtils';

interface ClientInfoSectionProps {
  clientName: string;
  netWorth: number | null;
  portfolioValue: number | null;
  growth: string | null;
  riskProfile?: string | null;
  lastCrmNote?: string | null;
}

export const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
  clientName,
  netWorth,
  portfolioValue,
  growth,
  riskProfile,
  lastCrmNote,
}) => {
  const formattedGrowth = growth ?? null;

  return (
    <ClientInfoCard>
      <ClientInfoRow>
        <ClientInfoLeft>
          <ClientAvatarCircle>
            {(() => {
              const avatarUrl = getClientAvatarUrl(clientName);
              return avatarUrl ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={clientName}
                  imgStyle={{ borderRadius: '50%' }}
                  fallback={getInitials(clientName)}
                />
              ) : (
                getInitials(clientName)
              );
            })()}
          </ClientAvatarCircle>
          <ClientNameText>{clientName}</ClientNameText>
          {riskProfile && (
            <RiskProfileBadge>
              <FlameSmallIcon style={{ color: '#f06a2f' }} />
              <RiskProfileText>{formatRiskProfile(riskProfile)}</RiskProfileText>
            </RiskProfileBadge>
          )}
        </ClientInfoLeft>

        {lastCrmNote && <CrmNoteText>{lastCrmNote}</CrmNoteText>}
      </ClientInfoRow>

      <ClientMetrics>
        {netWorth != null && (
          <MetricPair>
            <MetricPairLabel>Net Worth:</MetricPairLabel>
            <MetricPairValue>{formatCurrency(netWorth)}</MetricPairValue>
          </MetricPair>
        )}
        {portfolioValue != null && (
          <MetricPair>
            <MetricPairLabel>Portfolio Value:</MetricPairLabel>
            <MetricPairValue>{formatCurrency(portfolioValue)}</MetricPairValue>
          </MetricPair>
        )}
        {formattedGrowth != null && (
          <MetricPair>
            <MetricPairLabel>Growth:</MetricPairLabel>
            <MetricPairValue>{formattedGrowth}</MetricPairValue>
          </MetricPair>
        )}
      </ClientMetrics>
    </ClientInfoCard>
  );
};
