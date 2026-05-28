import React, { useCallback, useEffect, useReducer } from 'react';
import type { AlertAgentsGraph, AlertAgentsOutput, AlertSourceLike } from '@/api/types/alert.types';
import WorkflowOverviewGraph from './WorkflowOverviewGraph';
import WorkflowAgentDetail from './WorkflowAgentDetail';
import type { ContentView } from './WorkflowAgentDetail';
import { buildWorkflowOverviewGraph } from './workflowGraphAdapter';
import { buildWorkflowDetailModel } from './workflowDetailAdapter';
import { PIPELINE_AGENT_ORDER, type AgentId } from './workflowMockData';

// ─── State machine ────────────────────────────────────────────────────────────

type Phase = 'graph' | 'detail';

interface WorkflowState {
  phase: Phase;
  activeAgent: string;
  contentView: ContentView;
}

type WorkflowAction =
  | { type: 'NODE_CLICK'; agentId: string; defaultToRelationships: boolean }
  | { type: 'GO_BACK' }
  | { type: 'CHANGE_AGENT'; agentId: string; defaultToRelationships: boolean }
  | { type: 'CHANGE_VIEW'; view: ContentView }
  | { type: 'RESET'; activeAgent: string };

const DEFAULT_AGENT: AgentId = PIPELINE_AGENT_ORDER[0];

const createInitialState = (activeAgent: string): WorkflowState => ({
  phase: 'graph',
  activeAgent,
  contentView: 'response',
});

function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'NODE_CLICK':
      return {
        phase: 'detail',
        activeAgent: action.agentId,
        contentView: action.defaultToRelationships ? 'relationships' : 'response',
      };

    case 'GO_BACK':
      return { ...state, phase: 'graph' };

    case 'CHANGE_AGENT':
      return {
        ...state,
        activeAgent: action.agentId,
        contentView: action.defaultToRelationships ? 'relationships' : 'response',
      };

    case 'CHANGE_VIEW':
      return { ...state, contentView: action.view };

    case 'RESET':
      return createInitialState(action.activeAgent);

    default:
      return state;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface WorkflowViewProps {
  /** When the parent Show Workflow toggle is switched off, we reset to Phase 1. */
  isVisible: boolean;
  /** When true the "Behind the Scenes Workflow" heading inside the graph view is hidden */
  hideTitle?: boolean;
  /** Graph rendering variant for different surfaces (alert modal vs chat modal). */
  variant?: 'alert' | 'chat';
  workflowGraph?: AlertAgentsGraph;
  agentsOutput?: AlertAgentsOutput;
  /** Top-level alert sources — filtered per agent by type (news / sec_filing) */
  topLevelSources?: AlertSourceLike[] | null;
  /** Alert ID forwarded to SourceViewerModal so individual sources can be fetched */
  alertId?: number | null;
  /** Called whenever the phase changes: 'graph' = overview, 'detail' = agent tabs */
  onPhaseChange?: (phase: 'graph' | 'detail') => void;
  /** Optional content rendered as a scrollable card inside the graph canvas. */
  messageContent?: React.ReactNode;
  /** When true, shows the mem0 memory badge on the Risk Insight Agent node. */
  mem0Used?: boolean;
}

/**
 * Top-level orchestrator for the three-phase workflow explorer.
 *
 * Phase 1 – WorkflowOverviewGraph       (pipeline graph)
 * Phase 2 – WorkflowAgentDetail         (response view)
 * Phase 3 – WorkflowAgentDetail         (relationship graph)
 *
 * The component owns the phase/agent/contentView state via a reducer to keep
 * all transitions explicit and auditable.
 */
const WorkflowView: React.FC<WorkflowViewProps> = ({
  isVisible,
  hideTitle = false,
  variant = 'alert',
  workflowGraph,
  agentsOutput,
  topLevelSources,
  alertId,
  onPhaseChange,
  messageContent,
  mem0Used = false,
}) => {
  const detailModel = buildWorkflowDetailModel(workflowGraph, agentsOutput, topLevelSources);
  const defaultActiveAgent = detailModel?.agents[0]?.id ?? DEFAULT_AGENT;
  const [state, dispatch] = useReducer(workflowReducer, createInitialState(defaultActiveAgent));
  const nodesWithRelationships = new Set(
    detailModel?.agents.filter((a) => a.hasRelationships).map((a) => a.id) ?? [],
  );
  const dynamicOverviewGraph = buildWorkflowOverviewGraph(workflowGraph, Boolean(detailModel), {
    rootLabel: variant === 'chat' ? 'Query' : 'Event',
    injectAskAi: variant === 'chat',
    forceDurationDisplay: variant === 'chat',
    mem0Used,
    nodesWithRelationships,
  });
  const enableDetail = Boolean(detailModel);

  // Reset when the toggle is turned off so Phase 1 is always shown on re-open
  useEffect(() => {
    if (!isVisible) {
      dispatch({ type: 'RESET', activeAgent: defaultActiveAgent });
    }
  }, [defaultActiveAgent, isVisible]);

  useEffect(() => {
    if (enableDetail && detailModel && !detailModel.agentMap.has(state.activeAgent)) {
      dispatch({ type: 'RESET', activeAgent: defaultActiveAgent });
    }
  }, [defaultActiveAgent, detailModel, enableDetail, state.activeAgent]);

  const handleNodeClick = useCallback(
    (agentId: string) => {
      if (!enableDetail || !detailModel?.agentMap.has(agentId)) return;
      dispatch({ type: 'NODE_CLICK', agentId, defaultToRelationships: false });
      onPhaseChange?.('detail');
    },
    [detailModel, enableDetail, onPhaseChange],
  );

  const handleGoBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
    onPhaseChange?.('graph');
  }, [onPhaseChange]);

  const handleAgentChange = useCallback(
    (agentId: string) => {
      dispatch({ type: 'CHANGE_AGENT', agentId, defaultToRelationships: false });
    },
    [detailModel],
  );

  const handleContentViewChange = useCallback((view: ContentView) => {
    dispatch({ type: 'CHANGE_VIEW', view });
  }, []);

  if (state.phase === 'graph' || !enableDetail || !detailModel) {
    return (
      <WorkflowOverviewGraph
        onNodeClick={enableDetail ? handleNodeClick : undefined}
        hideTitle={hideTitle}
        nodes={dynamicOverviewGraph?.nodes}
        edges={dynamicOverviewGraph?.edges}
        interactive={enableDetail}
        messageContent={messageContent}
        variant={variant}
      />
    );
  }

  const detail = (
    <WorkflowAgentDetail
      activeAgentId={state.activeAgent}
      agents={detailModel.agents}
      contentView={state.contentView}
      onGoBack={handleGoBack}
      onAgentChange={handleAgentChange}
      onContentViewChange={handleContentViewChange}
      alertId={alertId}
    />
  );

  // In the chat variant, ChatContentBox has the graph surface background and no internal
  // padding. Wrap with a white fill so the surface colour doesn't bleed behind the tab UI.
  if (variant === 'chat') {
    return (
      <div
        style={{
          background: 'white',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          boxSizing: 'border-box',
          minHeight: 0,
        }}
      >
        {detail}
      </div>
    );
  }

  return detail;
};

export default WorkflowView;
