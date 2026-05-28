import React, { useCallback, useState } from 'react';
import type { AlertSourceLike, AlertSourceObject, ReasoningBehindAdviceItem } from '@/api/types/alert.types';
import { SourceViewerModal } from './SourceViewerModal';
import {
  AlertWarningIcon,
  CopyIcon,
  LinkIcon,
  SelectedCheckIcon,
  TimelineMarkerFinalIcon,
  TimelineMarkerNormalIcon,
  TinyChevronDownIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from '@/icons';
import {
  AdviceCard,
  AdviceDetail,
  AdviceHeadline,
  AnalyzeResultCard,
  CopyAdviceButton,
  DriverListItem,
  DriversList,
  DriverText,
  DriversSection,
  ImpactSummaryRow,
  ImpactSummaryText,
  TrendNoteCircle,
  InsightBox,
  InsightBoxHeader,
  InsightIconCircle,
  InsightTextColumn,
  InsightSection,
  InsightSourceChip,
  InsightSourcesContainer,
  InsightSourcesHeader,
  InsightSourcesLabel,
  InsightText,
  KeyInsightLabel,
  PrimaryAdviceBadge,
  ReasoningSection,
  SectionLabel,
  TimelineArrowConnector,
  TimelineArrowLine,
  TimelineContainer,
  TimelineItem,
  TimelineItemReason,
  TimelineItemTitle,
  TimelineStepLeft,
  TimelineStepRow,
  TriggerLabel,
  TriggerRow,
  TriggerValue,
} from '../AlertSummaryModal.styles';
import { useToastNotifications } from '@/utils/useToastNotifications';

export interface InsightContentProps {
  trend?: 'up' | 'down';
  trigger?: string | null;
  keyInsight?: string | null;
  adviceHeadline?: string | null;
  adviceDetail?: string | null;
  alertDrivers?: string[] | null;
  reasoningBehindAdvice?: ReasoningBehindAdviceItem[] | null;
  impactSummary?: string | null;
  sources?: AlertSourceLike[] | null;
  alertId?: number | null;
}

const getSourceLabel = (source: AlertSourceLike): string => {
  if (typeof source === 'string') {
    return source;
  }

  if (source && typeof source.title === 'string' && source.title.trim()) {
    return source.title;
  }

  if (source && typeof source.source_type === 'string' && source.source_type.trim()) {
    return source.source_type;
  }

  if (source && source.id != null) {
    return String(source.id);
  }

  return 'Unknown source';
};

export const InsightContent: React.FC<InsightContentProps> = ({
  trend,
  trigger,
  keyInsight,
  adviceHeadline,
  adviceDetail,
  alertDrivers,
  reasoningBehindAdvice,
  impactSummary,
  sources,
  alertId,
}) => {
  const toast = useToastNotifications();
  const [selectedSource, setSelectedSource] = useState<AlertSourceObject | null>(null);

  const handleCopyAdvice = useCallback(async () => {
    const text = [adviceHeadline, adviceDetail].filter(Boolean).join('\n');
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.show('success', 'Copied to clipboard!');
    } catch {
      toast.show('error', 'Failed to copy.');
    }
  }, [adviceHeadline, adviceDetail, toast]);

  const hasDrivers = alertDrivers && alertDrivers.length > 0;
  const hasReasoning = reasoningBehindAdvice && reasoningBehindAdvice.length > 0;
  const hasSources = sources && sources.length > 0;

  return (
    <AnalyzeResultCard>
      <KeyInsightLabel>Key Insight:</KeyInsightLabel>

      {/* ── Insight box (trend-coloured) ── */}
      {(keyInsight || adviceHeadline) && (
        <InsightBox $trend={trend}>
          {keyInsight && (
            <InsightBoxHeader>
              <InsightIconCircle $trend={trend}>
                {trend === 'up' ? (
                  <TrendingUpIcon width={18} height={18} />
                ) : (
                  <TrendingDownIcon width={18} height={18} />
                )}
              </InsightIconCircle>
              <InsightTextColumn>
                {trigger && (
                  <TriggerRow>
                    <TriggerLabel $trend={trend}>Trigger:</TriggerLabel>
                    <TriggerValue $trend={trend}>{trigger}</TriggerValue>
                  </TriggerRow>
                )}
                <InsightText>{keyInsight}</InsightText>
              </InsightTextColumn>
            </InsightBoxHeader>
          )}

          {(adviceHeadline || adviceDetail) && (
            <AdviceCard $trend={trend}>
              <PrimaryAdviceBadge $trend={trend}>Primary Advice</PrimaryAdviceBadge>
              {adviceHeadline && <AdviceHeadline>{adviceHeadline}</AdviceHeadline>}
              {adviceDetail && <AdviceDetail>{adviceDetail}</AdviceDetail>}
              <CopyAdviceButton type="button" aria-label="Copy advice" onClick={handleCopyAdvice}>
                <CopyIcon />
              </CopyAdviceButton>
            </AdviceCard>
          )}
        </InsightBox>
      )}

      <InsightSection>
        {/* ── Key Drivers of Alert ── */}
        {hasDrivers && (
          <DriversSection>
            <SectionLabel>Key Drivers of Alert:</SectionLabel>
            <DriverText>{alertDrivers![0]}</DriverText>
            {alertDrivers!.length > 1 && (
              <DriversList>
                {alertDrivers!.slice(1).map((driver, idx) => (
                  <DriverListItem key={idx}>{driver}</DriverListItem>
                ))}
              </DriversList>
            )}
          </DriversSection>
        )}

        {/* ── Reasoning Behind Advice ── */}
        {hasReasoning && (
          <ReasoningSection>
            <SectionLabel>Reasoning Behind Advice:</SectionLabel>
            <TimelineContainer>
              {reasoningBehindAdvice!.map((item, idx) => {
                const isLast = idx === reasoningBehindAdvice!.length - 1;
                const connectorColor = trend === 'up' ? '#1A7A4A' : '#B82020';
                return (
                  <TimelineStepRow key={idx}>
                    <TimelineStepLeft>
                      {isLast ? (
                        <TimelineMarkerFinalIcon style={{ color: connectorColor }} />
                      ) : (
                        <TimelineMarkerNormalIcon style={{ color: connectorColor }} />
                      )}
                      {!isLast && (
                        <TimelineArrowConnector>
                          <TimelineArrowLine $trend={trend} />
                          <TinyChevronDownIcon width={14} height={9} style={{ color: connectorColor, flexShrink: 0 }} />
                        </TimelineArrowConnector>
                      )}
                    </TimelineStepLeft>
                    <TimelineItem $isLast={isLast}>
                      <TimelineItemTitle>
                        {item.title}
                        {item.status_in_alert_chain ? ` (${item.status_in_alert_chain})` : ''}
                      </TimelineItemTitle>
                      <TimelineItemReason>{item.reason}</TimelineItemReason>
                    </TimelineItem>
                  </TimelineStepRow>
                );
              })}
            </TimelineContainer>
          </ReasoningSection>
        )}

        {/* ── Impact summary ── */}
        {impactSummary && (
          <ImpactSummaryRow>
            {trend === 'up' ? (
              <TrendNoteCircle>
                <SelectedCheckIcon style={{ width: '0.6em', height: '0.6em', color: 'white' }} />
              </TrendNoteCircle>
            ) : (
              <AlertWarningIcon width="1em" height="1em" style={{ flexShrink: 0, marginTop: '3px' }} />
            )}
            <ImpactSummaryText>{impactSummary}</ImpactSummaryText>
          </ImpactSummaryRow>
        )}

        {/* ── Sources ── */}
        {hasSources && (
          <div>
            <InsightSourcesHeader>
              <LinkIcon width={20} height={20} style={{ color: '#292A31' }} />
              <InsightSourcesLabel>Sources</InsightSourcesLabel>
            </InsightSourcesHeader>
            <InsightSourcesContainer style={{ marginTop: '12px' }}>
              {sources!.map((source, idx) => {
                const sourceObj = typeof source === 'string' ? null : (source as AlertSourceObject);
                const isClickable = !!alertId && !!sourceObj?.id;
                return (
                  <InsightSourceChip
                    key={`${getSourceLabel(source)}-${idx}`}
                    type="button"
                    disabled={!isClickable}
                    onClick={isClickable ? () => setSelectedSource(sourceObj!) : undefined}
                    style={!isClickable ? { cursor: 'default' } : undefined}
                  >
                    {getSourceLabel(source)}
                  </InsightSourceChip>
                );
              })}
            </InsightSourcesContainer>
          </div>
        )}

        {/* ── Source viewer (full-screen) ── */}
        <SourceViewerModal
          isOpen={!!selectedSource}
          onClose={() => setSelectedSource(null)}
          source={selectedSource}
          alertId={alertId}
        />
      </InsightSection>
    </AnalyzeResultCard>
  );
};

// Keep the old export name as an alias so nothing else breaks if it's imported elsewhere
export { InsightContent as AISummaryContent };
