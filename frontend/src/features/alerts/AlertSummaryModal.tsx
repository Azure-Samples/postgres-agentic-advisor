import React, { useMemo, useState } from 'react';
import { Button, Modal, Switch } from '@/components';
import type { WorkflowSummary } from '@/mocks/alertSummaries';
import { ClientInfoSection, InsightContent, WorkflowView } from './components';
import {
  EmptySummaryState,
  SummaryContainer,
  SummaryErrorMessage,
  SummaryErrorState,
  SummaryRetryButton,
  SkeletonBlock,
  ClientInfoCard,
  ClientInfoRow,
  ClientInfoLeft,
  ClientMetrics,
  MetricPair,
  MetricPairLabel,
  AnalyzeResultCard,
} from './AlertSummaryModal.styles';
import { useAlertSummaryQuery } from '@/api/hooks/useAlertsQuery';

export interface AlertSummaryModalProps {
  alertId: string | null;
  isOpen: boolean;
  onClose: () => void;
  trend?: 'up' | 'down';
  simulatedDate?: string;
}

export const AlertSummaryModal: React.FC<AlertSummaryModalProps> = ({ alertId, isOpen, onClose, trend, simulatedDate }) => {
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowPhase, setWorkflowPhase] = useState<'graph' | 'detail'>('graph');

  const numericAlertId = alertId !== null ? Number(alertId) : null;
  const { data: summaryData, isLoading, error, refetch } = useAlertSummaryQuery(numericAlertId, simulatedDate);

  const legacyWorkflowSummary = useMemo<WorkflowSummary | undefined>(() => {
    if (!summaryData) return undefined;

    const workflow = {
      planning_agent: summaryData.planning_agent,
      news_synthesizer_agent: summaryData.news_synthesizer_agent,
      financial_advisor_agent: summaryData.financial_advisor_agent,
      risk_insight_agent: summaryData.risk_insight_agent,
      brief_agent: summaryData.brief_agent,
    };

    return Object.values(workflow).some(Boolean) ? workflow : undefined;
  }, [summaryData]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <SummaryContainer>
          {/* Client info skeleton */}
          <ClientInfoCard>
            <ClientInfoRow>
              <ClientInfoLeft>
                <SkeletonBlock $w="32px" $h="32px" $radius="50%" />
                <SkeletonBlock $w="140px" $h="16px" />
                <SkeletonBlock $w="88px" $h="24px" $radius="4px" />
              </ClientInfoLeft>
            </ClientInfoRow>
            <ClientMetrics>
              {(['Net Worth:', 'Portfolio Value:', 'Growth:'] as const).map((label) => (
                <MetricPair key={label}>
                  <MetricPairLabel>{label}</MetricPairLabel>
                  <SkeletonBlock $w="64px" $h="16px" $radius="4px" />
                </MetricPair>
              ))}
            </ClientMetrics>
          </ClientInfoCard>

          {/* Content area skeleton */}
          <AnalyzeResultCard>
            <SkeletonBlock $w="55%" $h="24px" />
            <SkeletonBlock $w="100%" $h="88px" $radius="8px" />
            <SkeletonBlock $w="100%" $h="112px" $radius="8px" />
            <SkeletonBlock $w="40%" $h="16px" />
            <SkeletonBlock $w="100%" $h="14px" />
            <SkeletonBlock $w="90%" $h="14px" />
            <SkeletonBlock $w="80%" $h="14px" />
            <SkeletonBlock $w="40%" $h="16px" />
            <SkeletonBlock $w="100%" $h="14px" />
            <SkeletonBlock $w="75%" $h="14px" />
            <SkeletonBlock $w="60%" $h="14px" />
          </AnalyzeResultCard>
        </SummaryContainer>
      );
    }
    if (error) {
      const isNotFound = error.message?.includes('404') || error.message?.includes('not found');
      return (
        <SummaryErrorState>
          <SummaryErrorMessage>
            {isNotFound ? 'Summary not found for this alert.' : 'Failed to load summary. Please try again.'}
          </SummaryErrorMessage>
          {!isNotFound && (
            <SummaryRetryButton type="button" onClick={() => refetch()}>
              Retry
            </SummaryRetryButton>
          )}
        </SummaryErrorState>
      );
    }
    if (!summaryData) {
      return <EmptySummaryState>No summary available for this alert yet.</EmptySummaryState>;
    }
    return (
      <SummaryContainer>
        {/* Show client info when: workflow OFF, OR workflow ON but still on the graph phase */}
        {(!showWorkflow || workflowPhase === 'graph') && (
          <ClientInfoSection
            clientName={summaryData.client_name}
            netWorth={summaryData.client_net_worth}
            portfolioValue={summaryData.client_portfolio_value}
            growth={summaryData.client_growth}
            riskProfile={summaryData.client_risk_profile}
          />
        )}
        {showWorkflow ? (
          <WorkflowView
            isVisible={showWorkflow}
            hideTitle
            workflowGraph={summaryData?.agents_graph}
            agentsOutput={summaryData?.agents_output}
            topLevelSources={summaryData?.sources}
            alertId={numericAlertId}
            onPhaseChange={setWorkflowPhase}
            mem0Used={summaryData?.risk_insight_mem0_used ?? false}
          />
        ) : (
          <InsightContent
            trend={trend}
            trigger={summaryData.trigger}
            keyInsight={summaryData.key_insight}
            adviceHeadline={summaryData.advice_headline}
            adviceDetail={summaryData.advice_detail}
            alertDrivers={summaryData.alert_drivers}
            reasoningBehindAdvice={summaryData.reasoning_behind_advice}
            impactSummary={summaryData.impact_summary}
            sources={summaryData.sources}
            alertId={numericAlertId}
          />
        )}
      </SummaryContainer>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setShowWorkflow(false);
        setWorkflowPhase('graph');
        onClose();
      }}
      title="Advisor Insight"
      headerAction={
        <Switch
          checked={showWorkflow}
          onChange={(val) => {
            setShowWorkflow(val);
            if (!val) setWorkflowPhase('graph');
          }}
          label="Show workflow"
        />
      }
        bodyProps={{ style: { height: 'calc(100vh - 350px)', overflowY: 'auto' } }}
      footer={
        <Button
          variant="outline"
          htmlType="button"
          onClick={() => {
            setShowWorkflow(false);
            setWorkflowPhase('graph');
            onClose();
          }}
        >
          Close
        </Button>
      }
      footerProps={{ className: 'footer-right', style: { borderTop: 'none' } }}
    >
      {renderContent()}
    </Modal>
  );
};
