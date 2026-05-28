import React, { useCallback, useReducer } from 'react';
import { useTheme } from 'styled-components';
import { WorkflowNewsIcon, WorkflowGlobeIcon, ArrowLeftIcon, NewsSynthArrowIcon } from '@/icons';
import AgentRelationshipsGraph from '@/features/alerts/components/workflow/AgentRelationshipsGraph';
import { AGENT_DETAIL_MAP } from '@/features/alerts/components/workflow/workflowMockData';
import { GraphDetailWrapper, GoBackOverlayButton } from './ChatWorkflowGraph.styles';
import {
  ChatGraphWrapper,
  QueryNode,
  PlannerNode,
  NewsSynthNode,
  NewsSynthIconSlot,
  NewsSynthLabel,
  NewsSynthGlobe,
  NewsSynthArrow,
  ResponseNode,
  ConnectorSvg,
  PipelineGraphCard,
} from './ChatWorkflowGraph.styles';

// ─── Connector SVG ─────────────────────────────────────────────────────────────

const CONNECTOR_H = 36;
const ARROW_H = 7;
const ARROW_W = 5;
const CX = 7;

interface ConnectorProps {
  edgeColor: string;
}

const Connector: React.FC<ConnectorProps> = ({ edgeColor }) => (
  <ConnectorSvg width={14} height={CONNECTOR_H}>
    {/* Hollow circle at the top */}
    <circle cx={CX} cy={3} r={3} fill="#FFFFFF" stroke={edgeColor} strokeWidth={1.5} />
    {/* Vertical line */}
    <line x1={CX} y1={6} x2={CX} y2={CONNECTOR_H - ARROW_H} stroke={edgeColor} strokeWidth={1} />
    {/* Chevron arrowhead */}
    <polyline
      points={`${CX - ARROW_W},${CONNECTOR_H - ARROW_H} ${CX},${CONNECTOR_H} ${CX + ARROW_W},${CONNECTOR_H - ARROW_H}`}
      fill="none"
      stroke={edgeColor}
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </ConnectorSvg>
);

// ─── State machine ─────────────────────────────────────────────────────────────

type Phase = 'graph' | 'detail';

interface State {
  phase: Phase;
}

type Action = { type: 'OPEN_DETAIL' } | { type: 'GO_BACK' };

const initialState: State = { phase: 'graph' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'OPEN_DETAIL':
      return { phase: 'detail' };
    case 'GO_BACK':
      return { phase: 'graph' };
    default:
      return state;
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Simplified chat workflow graph as shown in Figma node 2176-47389.
 *
 * Renders a static 4-node pipeline:
 *   Query → Planner Agent → News Synthesizer Agent → Response
 *
 * Clicking the → on "News Synthesizer Agent" drills into WorkflowAgentDetail.
 */
const ChatWorkflowGraph: React.FC = () => {
  const { colors } = useTheme();
  const edgeColor = colors.workflow.pipelineEdge;

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleOpenDetail = useCallback(() => dispatch({ type: 'OPEN_DETAIL' }), []);
  const handleGoBack = useCallback(() => dispatch({ type: 'GO_BACK' }), []);

  if (state.phase === 'detail') {
    const agent = AGENT_DETAIL_MAP.get('news_synthesizer');
    if (!agent) return null;
    return (
      <GraphDetailWrapper>
        <AgentRelationshipsGraph relationships={agent.relationships} />
        <GoBackOverlayButton type="button" onClick={handleGoBack} aria-label="Go back to workflow overview">
          <ArrowLeftIcon width={16} height={16} />
          Go Back
        </GoBackOverlayButton>
      </GraphDetailWrapper>
    );
  }

  return (
    <PipelineGraphCard>
      <ChatGraphWrapper>
        <QueryNode>Query</QueryNode>
        <Connector edgeColor={edgeColor} />
        <PlannerNode>Planner Agent</PlannerNode>
        <Connector edgeColor={edgeColor} />
        <NewsSynthNode type="button" onClick={handleOpenDetail} aria-label="View News Synthesizer Agent detail">
          <NewsSynthIconSlot>
            <WorkflowNewsIcon width={20} height={20} />
          </NewsSynthIconSlot>
          <NewsSynthLabel>News Synthesizer Agent</NewsSynthLabel>
          <NewsSynthGlobe>
            <WorkflowGlobeIcon width={20} height={20} />
          </NewsSynthGlobe>
          <NewsSynthArrow>
            <NewsSynthArrowIcon width={20} height={20} />
          </NewsSynthArrow>
        </NewsSynthNode>
        <Connector edgeColor={edgeColor} />
        <ResponseNode>Response</ResponseNode>
      </ChatGraphWrapper>
    </PipelineGraphCard>
  );
};

export default ChatWorkflowGraph;
