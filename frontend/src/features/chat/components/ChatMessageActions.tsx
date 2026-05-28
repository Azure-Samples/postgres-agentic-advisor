import React, { useState, useCallback } from 'react';
import { CopyIcon, ShowWorkflowIcon } from '@/icons';
import { useToastNotifications } from '@/utils/useToastNotifications';
import ChatRelationshipGraph from './ChatRelationshipGraph';
import ChatAgentGraph from './ChatAgentGraph';
import { MOCK_CHAT_SOURCES } from '@/mocks/chat';
import type { ChatRelationshipsPayload } from '@/api/types/chat.types';
import type { AlertAgentsGraph, AlertAgentsOutput } from '@/api/types/alert.types';
import {
  ActionsWrapper,
  ActionButtonsRow,
  ActionIconButton,
  ButtonIconWrapper,
  WorkflowPanelOuter,
  WorkflowPanelInner,
} from './ChatMessageActions.styles';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessageActionsProps {
  /** Message content — used for the copy action */
  content: string;
  /**
   * Optional sources to display above the action buttons.
   * Defaults to MOCK_CHAT_SOURCES when not provided.
   */
  sources?: string[];
  /**
   * Pass true when this is rendered inside the side drawer so the workflow
   * panel can adapt its layout accordingly.
   */
  isInDrawer?: boolean;
  /**
   * Relationship graph payload from the stream.
   * When present (and `agentsGraph` is absent), only the relationship graph
   * is shown inside the toggle panel.
   */
  relationships?: ChatRelationshipsPayload | null;
  /**
   * Full agent pipeline graph from the stream.
   * When present, the full WorkflowView (pipeline → drill-down → relationships)
   * is shown, mirroring the advisor modal behaviour.
   */
  agentsGraph?: AlertAgentsGraph | null;
  /** Per-agent execution output, used alongside `agentsGraph`. */
  agentsOutput?: AlertAgentsOutput | null;
  /** Alert id associated with this message, passed through from the chat stream. */
  alertId?: number | null;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Actions row rendered beneath every completed assistant chat message.
 *
 * Shows:
 *  - Sources chips
 *  - Show Workflow toggle button (only when graph data is available)
 *  - Copy button (copies raw message content to clipboard)
 *
 * Workflow panel behaviour mirrors the advisor modal:
 *  - `agentsGraph` present  → full WorkflowView (pipeline + agent detail + relationships)
 *  - `relationships` only   → ChatRelationshipGraph (relationship canvas only)
 *  - neither                → toggle button is hidden, no panel rendered
 */
const ChatMessageActions: React.FC<ChatMessageActionsProps> = ({
  content,
  sources = MOCK_CHAT_SOURCES,
  isInDrawer = false,
  relationships,
  agentsGraph,
  agentsOutput,
}) => {
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToastNotifications();

  // Determine which graph mode to render:
  // - 'full'         → agent pipeline graph available; show WorkflowView
  // - 'relationship' → only relationship payload available; show ChatRelationshipGraph
  // - 'none'         → no graph data; hide the toggle button entirely
  const graphMode: 'full' | 'relationship' | 'none' = agentsGraph ? 'full' : relationships ? 'relationship' : 'none';

  const handleWorkflowToggle = useCallback(() => {
    setShowWorkflow((prev) => !prev);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.show('success', 'Response copied to clipboard');
    } catch {
      // Clipboard API unavailable — silent fail
    }
  }, [content, toast]);

  return (
    <ActionsWrapper>
      {/* Action buttons */}
      <ActionButtonsRow>
        {graphMode !== 'none' && (
          <ActionIconButton
            type="button"
            $active={showWorkflow}
            onClick={handleWorkflowToggle}
            title="Show Workflow"
            aria-label={showWorkflow ? 'Hide workflow' : 'Show workflow'}
            aria-pressed={showWorkflow}
          >
            <ButtonIconWrapper $rotate={showWorkflow}>
              <ShowWorkflowIcon width={16} height={16} />
            </ButtonIconWrapper>
          </ActionIconButton>
        )}

        <ActionIconButton
          type="button"
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy response'}
          aria-label="Copy response"
        >
          <CopyIcon width={16} height={16} />
        </ActionIconButton>
      </ActionButtonsRow>

      {/* Workflow panel — only mounted when graph data is present, animated open/close */}
      {graphMode !== 'none' && (
        <WorkflowPanelOuter $isOpen={showWorkflow}>
          <WorkflowPanelInner $isOpen={showWorkflow}>
            {graphMode === 'full' ? (
              <ChatAgentGraph agentsGraph={agentsGraph!} />
            ) : (
              <ChatRelationshipGraph relationships={relationships!} />
            )}
          </WorkflowPanelInner>
        </WorkflowPanelOuter>
      )}
    </ActionsWrapper>
  );
};

export default ChatMessageActions;
