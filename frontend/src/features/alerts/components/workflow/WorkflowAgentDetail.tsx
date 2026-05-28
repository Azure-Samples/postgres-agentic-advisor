import React from 'react';
import { ArrowLeftIcon, WorkflowRelationshipsIcon, WorkflowResponseIcon } from '@/icons';
import AgentTabs from './AgentTabs';
import AgentResponseView from './AgentResponseView';
import AgentRelationshipsGraph from './AgentRelationshipsGraph';
import type { WorkflowAgentDetailModel } from './workflowDetailAdapter';
import {
  AgentDetailPageWrapper,
  GoBackButton,
  ContentCard,
  GraphOverlayWrapper,
  GraphOverlayToggle,
  ViewToggleGroup,
  ViewToggleButton,
  ScrollableCardBody,
} from './WorkflowAgentDetail.styles';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentView = 'response' | 'relationships';

interface WorkflowAgentDetailProps {
  activeAgentId: string;
  agents: WorkflowAgentDetailModel[];
  contentView: ContentView;
  onGoBack: () => void;
  onAgentChange: (agentId: string) => void;
  onContentViewChange: (view: ContentView) => void;
  alertId?: number | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Phase 2 + 3 container.
 *
 * Renders:
 *  - ← Go Back button
 *  - Agent tabs
 *  - Content card with Response / Relationships toggle and the matching view
 */
const WorkflowAgentDetail: React.FC<WorkflowAgentDetailProps> = ({
  activeAgentId,
  agents,
  contentView,
  onGoBack,
  onAgentChange,
  onContentViewChange,
  alertId,
}) => {
  const agent = agents.find((candidate) => candidate.id === activeAgentId);

  // Defensive safeguard — the selected agent should always exist in the supplied workflow model
  if (!agent) return null;

  // Toggle is only shown when BOTH response content AND relationship data exist
  const hasResponse = Boolean(agent.input || agent.output || agent.reasoning);
  const showToggle = agent.hasRelationships && hasResponse;
  const isRelationships = showToggle && contentView === 'relationships';

  const toggleButtons = (
    <ViewToggleGroup>
      <ViewToggleButton
        type="button"
        $active={!isRelationships}
        onClick={() => onContentViewChange('response')}
        aria-pressed={!isRelationships}
      >
        <WorkflowResponseIcon active={!isRelationships} />
        Response
      </ViewToggleButton>
      <ViewToggleButton
        type="button"
        $active={isRelationships}
        onClick={() => onContentViewChange('relationships')}
        aria-pressed={isRelationships}
        style={{ position: 'relative' }}
      >
        <WorkflowRelationshipsIcon active={isRelationships} />
        Relationships
        <img
          src="/apache.webp"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 29,
            height: 19,
            objectFit: 'contain',
            imageRendering: 'auto',
            borderRadius: 3,
            pointerEvents: 'none',
          }}
        />
      </ViewToggleButton>
    </ViewToggleGroup>
  );

  return (
    <AgentDetailPageWrapper>
      {/* ← Go Back */}
      <GoBackButton type="button" onClick={onGoBack} aria-label="Go back to workflow overview">
        <ArrowLeftIcon width={16} height={16} />
        Go Back
      </GoBackButton>

      {/* Tab bar */}
      <AgentTabs
        activeAgentId={activeAgentId}
        tabs={agents.map(({ id, label }) => ({ id, label }))}
        onTabChange={onAgentChange}
      />

      {/* Relationships view: no card boundary, toggle overlaid on the graph */}
      {isRelationships ? (
        <GraphOverlayWrapper key={`rel-${activeAgentId}`}>
          {showToggle && <GraphOverlayToggle>{toggleButtons}</GraphOverlayToggle>}
          <AgentRelationshipsGraph relationships={agent.relationships} />
        </GraphOverlayWrapper>
      ) : (
        <ContentCard key={`res-${activeAgentId}`} role="tabpanel">
          {showToggle && toggleButtons}
          <ScrollableCardBody>
            <AgentResponseView agent={agent} alertId={alertId} />
          </ScrollableCardBody>
        </ContentCard>
      )}
    </AgentDetailPageWrapper>
  );
};

export default WorkflowAgentDetail;
