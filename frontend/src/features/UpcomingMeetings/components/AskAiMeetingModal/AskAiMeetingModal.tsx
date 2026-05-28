import React, { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react';
import AvatarImage from '@/components/AvatarImage/AvatarImage';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { normalizeMarkdown } from '@/utils/normalizeMarkdown';
import { Modal } from '@/components/Modal/Modal';
import { Button } from '@/components/Button/Button';
import { Switch } from '@/components/Switch/Switch';
import { Loader } from '@/components/Loader/Loader';
import { WorkflowView } from '@/features/alerts/components';
import ChatWidget from '@/features/chat/components/ChatWidget';
import { SuggestedTemplates } from '@/features/chat';
import { ChatHistory } from '@/pages/Chat/components/ChatHistory';
import { SparkleIcon, SendIcon, ChatHistoryIcon, RiskProfileIcon } from '@/icons';
import { useChatStore } from '@/store/chatStore';
import { useChatHandler } from '@/features/chat/hooks';
import { useClientsQuery, useClientRiskProfile, useClientPortfolioMetrics } from '@/api/hooks/useClientsQuery';
import { useClientAlertsQuery } from '@/api/hooks/useAlertsQuery';
import { useChatSessionsQuery, useDeleteChatSession } from '@/api/hooks/useChatSessions';
import { InputField, parseTemplate } from '@/components/InputField';
import type { TemplateSegment } from '@/components/InputField';
import { useChatAgentsGraphQuery } from '@/api/hooks/useChatAgentsGraph';
import { useToast } from '@/components/Toast';
import { getInitials } from '@/features/alerts/utils/alertSummaryUtils';
import { formatRiskProfile } from '@/utils/clientUtils';
import { getClientAvatarUrl } from '@/utils/clientAvatarMap';
import type { ChatSession } from '@/api/types/completion.types';
import type { AlertAgentsGraph } from '@/api/types/alert.types';
import {
  MeetingClientSection,
  MeetingClientRow,
  MeetingClientLeft,
  MeetingClientAvatar,
  MeetingClientName,
  ChatHistoryButton,
  NewChatButton,
  MeetingMetricsRow,
  MeetingMetricPair,
  MeetingMetricLabel,
  MeetingMetricValue,
  ChatContentBox,
  HistorySlidePanel,
  HistoryInnerContainer,
  EmptyStateWrapper,
  EmptyStateIconCircle,
  EmptyStateTitle,
  EmptyStateInputRow,
  MessagesArea,
  ChatInputRow,
  ChatInputField,
  SendButton,
  ChatForm,
  WorkflowMessageRole,
  WorkflowMessageText,
  RiskProfileBadge,
  RiskProfileLabel,
  SkeletonRiskBadge,
  SkeletonMetricValue,
  WorkflowSkeletonOuter,
  WorkflowSkeletonCanvas,
  WorkflowSkeletonCard,
  WorkflowSkeletonFlow,
  WorkflowSkeletonRow,
  WorkflowSkeletonNode,
  WorkflowSkeletonEdge,
  WorkflowSkeletonBranch,
  WorkflowErrorWrapper,
  WorkflowErrorTitle,
  WorkflowErrorBody,
} from './AskAiMeetingModal.styles';

/**
 * rehype-sanitize schema extended to allow <mark> highlighting tags produced
 * by the AI backend.
 */
const markdownSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'mark'],
};

/** Stable plugin tuple — constant reference prevents unnecessary re-mounts. */
const mdRehypePlugins: any[] = [rehypeRaw, [rehypeSanitize, markdownSchema]];

const formatMoney = (value: number): string => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

/** Format a growth string like "-8.5%" or "12.4" → "+12.4%" for display */
const formatGrowth = (value: string | number): string => {
  // API already returns a fully formatted string like "+1.2%" or "-8.5%" — use as-is
  if (typeof value === 'string') return value;
  return value >= 0 ? `+${value}%` : `${value}%`;
};

interface Meeting {
  client_name: string;
  scheduled_at: string;
}

interface AskAiMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  simulatedDate?: string;
}

/** Mock financial data keyed by client name — kept as fallback only */
const MOCK_FINANCIAL_DATA: Record<string, { netWorth: number; portfolioValue: number; growth: number }> = {
  'Daniel Reed': {
    netWorth: 4800000,
    portfolioValue: 1200000,
    growth: 12.4,
  },
};

const DEFAULT_FINANCIAL_DATA = {
  netWorth: null as number | null,
  portfolioValue: null as number | null,
  growth: null as string | number | null,
};

const NULL_TURN_WORKFLOW_GRAPH: AlertAgentsGraph = {
  nodes: [
    { id: 'ask_ai', label: 'Ask AI', level: 0, triggered: true, duration_ms: null },
    { id: 'planning', label: 'Planning Agent', level: 1, triggered: false, duration_ms: null },
    { id: 'news_synthesizer', label: 'News Analysis Agent', level: 2, triggered: false, duration_ms: null },
    { id: 'stock_analysis', label: 'Stock Analysis Agent', level: 2, triggered: false, duration_ms: null },
    { id: 'sec_filing_analysis', label: 'SEC Filing Analysis Agent', level: 2, triggered: false, duration_ms: null },
  ],
  edges: [
    { from: 'ask_ai', to: 'planning' },
    { from: 'planning', to: 'news_synthesizer' },
    { from: 'planning', to: 'stock_analysis' },
    { from: 'planning', to: 'sec_filing_analysis' },
  ],
};

export const AskAiMeetingModal: React.FC<AskAiMeetingModalProps> = ({ isOpen, onClose, meeting, simulatedDate }) => {
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowPhase, setWorkflowPhase] = useState<'graph' | 'detail'>('graph');
  const [showHistory, setShowHistory] = useState(false);
  const [text, setText] = useState('');
  const [templateSegments, setTemplateSegments] = useState<TemplateSegment[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);

  /**
   * Tracks which meeting has been initialised so that a React-Query background
   * refetch of `clients` (which changes the `clients` array reference) doesn't
   * re-run the init effect and call resetToNewChat() mid-conversation.
   */
  const initDoneRef = React.useRef<string | null>(null);

  const {
    messages,
    isTemplateMode,
    isLoadingHistory,
    selectedClientId,
    selectedSessionId,
    latestTurnId,
    setSelectedClient,
    setSelectedSession,
    resetToNewChat,
  } = useChatStore();
  const { sendMessage, isLoading } = useChatHandler();
  const { showToast } = useToast();
  const deleteSessionMutation = useDeleteChatSession();
  const { data: clients = [], isLoading: isLoadingClients } = useClientsQuery();
  const { data: chatSessions = [], isLoading: isLoadingSessions } = useChatSessionsQuery(selectedClientId);
  const { data: riskProfile, isLoading: isLoadingRiskProfile } = useClientRiskProfile(selectedClientId);
  const { data: portfolioMetrics, isLoading: isLoadingMetrics } = useClientPortfolioMetrics(selectedClientId ?? null, simulatedDate);
  const { data: clientAlerts = [], isLoading: isLoadingAlerts } = useClientAlertsQuery(selectedClientId);

  const activeClientName = useMemo(() => {
    if (selectedClientId) {
      const found = clients.find((c) => c.id === selectedClientId)?.full_name;
      if (found) return found;
    }
    return meeting?.client_name ?? '';
  }, [clients, selectedClientId, meeting]);

  const relevantCompanies = useMemo(() => {
    // Track the most recent alert date per company so the most recently-alerted
    // company appears first in suggestion pills.
    const latestDate = new Map<string, string>();
    for (const a of clientAlerts) {
      for (const company of a.companies ?? []) {
        const name = company.company_name?.trim();
        if (!name) continue;
        const prev = latestDate.get(name);
        if (!prev || a.date > prev) latestDate.set(name, a.date);
      }
    }
    const sorted = Array.from(latestDate.keys()).sort((a, b) => {
      const da = latestDate.get(a) ?? '';
      const db = latestDate.get(b) ?? '';
      return db.localeCompare(da); // most recent first
    });

    if (activeClientName.toLowerCase().includes('daniel')) {
      const zavaIdx = sorted.findIndex((c) => c.toLowerCase().startsWith('zava'));
      if (zavaIdx > 0) sorted.unshift(sorted.splice(zavaIdx, 1)[0]);
    }

    return sorted;
  }, [clientAlerts, activeClientName]);

  const placeholderOptions = useMemo(() => ({ 'Company Name': relevantCompanies }), [relevantCompanies]);
  const { data: fetchedGraphData, isFetching: isGraphFetching } = useChatAgentsGraphQuery({
    clientId: selectedClientId,
    sessionId: selectedSessionId,
    turnId: latestTurnId,
    enabled: showWorkflow,
    simulatedDate,
  });

  // Resolve clientId from client name — runs only once per modal open.
  // Guarded by initDoneRef so a React-Query background refetch of `clients`
  // (which bumps the array reference) does NOT call resetToNewChat() again and
  // wipe an in-progress conversation.
  useEffect(() => {
    if (!isOpen || !meeting) return;
    // Wait until clients have loaded so we can resolve the name → id mapping.
    if (clients.length === 0) return;

    const meetingKey = `${meeting.client_name}::${meeting.scheduled_at}`;
    if (initDoneRef.current === meetingKey) return; // already initialised for this meeting

    const client = clients.find((c) => c.full_name.toLowerCase() === meeting.client_name.toLowerCase());
    setSelectedClient(client ? client.id : null);
    resetToNewChat();
    initDoneRef.current = meetingKey;
  }, [isOpen, meeting, clients, setSelectedClient, resetToNewChat]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setShowWorkflow(false);
      setWorkflowPhase('graph');
      setShowHistory(false);
      setText('');
      setTemplateSegments([]);
      resetToNewChat();
      // Clear the init flag so the next open re-initialises cleanly.
      initDoneRef.current = null;
    }
  }, [isOpen, resetToNewChat]);

  // Reset template segments when template mode exits
  useEffect(() => {
    if (!isTemplateMode) setTemplateSegments([]);
    setText('');
  }, [isTemplateMode]);

  // If the user switches to an empty chat while workflow is on, turn it off
  // so they are never stuck in workflow view with a disabled toggle
  useEffect(() => {
    if (messages.length === 0 && showWorkflow) {
      setShowWorkflow(false);
      setWorkflowPhase('graph');
    }
  }, [messages, showWorkflow]);

  const handleWorkflowToggle = useCallback(
    (checked: boolean) => {
      setShowWorkflow(checked);
      if (!checked) setWorkflowPhase('graph');
    },
    [setShowWorkflow, setWorkflowPhase],
  );

  const handleSend = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      const isTemplate = isTemplateMode && templateSegments.length > 0;
      setText('');
      setTemplateSegments([]);
      try {
        await sendMessage(trimmed, isTemplate, simulatedDate);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    },
    [text, isLoading, isTemplateMode, templateSegments, sendMessage],
  );

  const applyTemplate = useCallback(
    (template: string) => {
      const parsed = parseTemplate(template);
      const defaultCompany = relevantCompanies[0] ?? '';
      const segments = parsed.map((s) => {
        if (s.type !== 'placeholder') return s;
        if (s.placeholder === 'Client Name') return { ...s, content: activeClientName || '' };
        if (s.placeholder === 'Company Name') return { ...s, content: defaultCompany };
        return s;
      });
      const filledText = segments
        .map((s) => (s.type === 'text' ? s.content : s.content || `[${s.placeholder}]`))
        .join('');
      setTemplateSegments(segments);
      setText(filledText);
    },
    [activeClientName, relevantCompanies],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      applyTemplate(suggestion);
    },
    [applyTemplate],
  );

  const handleSessionSelect = useCallback(
    (sessionId: number) => {
      if (sessionId !== selectedSessionId) {
        setSelectedSession(sessionId);
      }
      setShowHistory(false);
    },
    [setSelectedSession, selectedSessionId],
  );

  const handleDeleteChat = useCallback((e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setSessionToDelete(session);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!sessionToDelete || !selectedClientId) return;
    const sessionId = sessionToDelete.chat_session_id;
    const wasActive = sessionId === selectedSessionId;
    try {
      await deleteSessionMutation.mutateAsync({ clientId: selectedClientId, chatSessionId: sessionId });
      showToast({ variant: 'success', message: 'Chat deleted successfully' });
      if (wasActive) resetToNewChat();
    } catch {
      showToast({ variant: 'error', message: 'Failed to delete chat. Please try again.' });
    } finally {
      setSessionToDelete(null);
    }
  }, [sessionToDelete, selectedClientId, selectedSessionId, deleteSessionMutation, showToast, resetToNewChat]);

  const handleCancelDelete = useCallback(() => {
    setSessionToDelete(null);
  }, []);

  const handleNewChat = useCallback(() => {
    resetToNewChat();
    setShowHistory(false);
  }, [resetToNewChat]);

  const financialData = portfolioMetrics
    ? {
        netWorth: portfolioMetrics.net_worth,
        portfolioValue: portfolioMetrics.portfolio_value,
        growth: portfolioMetrics.growth,
      }
    : DEFAULT_FINANCIAL_DATA;

  const showSuggestions = isTemplateMode && messages.length === 0 && !selectedSessionId;
  const hasMessages = messages.length > 0;
  const isWaitingForSession = messages.length === 0 && !!selectedSessionId;
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const mem0Used = messages.some((m) => m.role === 'assistant' && m.memorySaved);
  const workflowGraph = latestTurnId === null ? NULL_TURN_WORKFLOW_GRAPH : (fetchedGraphData?.graph ?? null);
  // true when the fetch finished but the server had no graph for this turn (404)
  const isGraphUnavailable = latestTurnId !== null && !isGraphFetching && fetchedGraphData === null;
  const agentsOutput = fetchedGraphData?.agentsOutput;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={showWorkflow ? 'Advisor Insight' : 'Ask AI'}
      width="900px"
      height="960px"
      headerAction={
        <Switch checked={showWorkflow} onChange={handleWorkflowToggle} label="Show Workflow" disabled={!hasMessages} />
      }
      bodyProps={{
        style: { padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 },
      }}
    >
      {meeting && (
        <>
          {(!showWorkflow || workflowPhase === 'graph') && (
            <MeetingClientSection>
              <MeetingClientRow>
                <MeetingClientLeft>
                  <MeetingClientAvatar>
                    {(() => {
                      const avatarUrl = getClientAvatarUrl(meeting.client_name);
                      return avatarUrl ? (
                        <AvatarImage
                          src={avatarUrl}
                          alt={meeting.client_name}
                          imgStyle={{ borderRadius: '50%' }}
                          fallback={getInitials(meeting.client_name)}
                        />
                      ) : (
                        getInitials(meeting.client_name)
                      );
                    })()}
                  </MeetingClientAvatar>
                  <MeetingClientName>{meeting.client_name}</MeetingClientName>
                  {isLoadingClients || isLoadingRiskProfile ? (
                    <SkeletonRiskBadge />
                  ) : riskProfile ? (
                    <RiskProfileBadge>
                      <RiskProfileIcon aria-hidden="true" />
                      <RiskProfileLabel>{formatRiskProfile(riskProfile)}</RiskProfileLabel>
                    </RiskProfileBadge>
                  ) : null}
                </MeetingClientLeft>
                {showHistory ? (
                  <NewChatButton type="button" onClick={handleNewChat}>
                    + New Chat
                  </NewChatButton>
                ) : (
                  <ChatHistoryButton type="button" onClick={() => setShowHistory(true)}>
                    <ChatHistoryIcon width={16} height={16} />
                    Chat History
                  </ChatHistoryButton>
                )}
              </MeetingClientRow>
              {(isLoadingClients || isLoadingMetrics || financialData.netWorth !== null) && (
                <MeetingMetricsRow>
                  <MeetingMetricPair>
                    <MeetingMetricLabel>Net Worth:</MeetingMetricLabel>
                    {isLoadingClients || isLoadingMetrics ? (
                      <SkeletonMetricValue />
                    ) : (
                      <MeetingMetricValue>{formatMoney(financialData.netWorth!)}</MeetingMetricValue>
                    )}
                  </MeetingMetricPair>
                  <MeetingMetricPair>
                    <MeetingMetricLabel>Portfolio Value:</MeetingMetricLabel>
                    {isLoadingClients || isLoadingMetrics ? (
                      <SkeletonMetricValue />
                    ) : (
                      <MeetingMetricValue>{formatMoney(financialData.portfolioValue!)}</MeetingMetricValue>
                    )}
                  </MeetingMetricPair>
                  <MeetingMetricPair>
                    <MeetingMetricLabel>Growth:</MeetingMetricLabel>
                    {isLoadingClients || isLoadingMetrics ? (
                      <SkeletonMetricValue />
                    ) : (
                      <MeetingMetricValue>{formatGrowth(financialData.growth!)}</MeetingMetricValue>
                    )}
                  </MeetingMetricPair>
                </MeetingMetricsRow>
              )}
            </MeetingClientSection>
          )}

          <ChatContentBox>
            <HistorySlidePanel $visible={showHistory}>
              <HistoryInnerContainer>
                <ChatHistory
                  sessions={chatSessions as ChatSession[]}
                  isLoading={isLoadingSessions}
                  selectedSessionId={null}
                  selectedClientId={selectedClientId}
                  onSessionSelect={handleSessionSelect}
                  onDeleteClick={handleDeleteChat}
                />
              </HistoryInnerContainer>
            </HistorySlidePanel>

            {showWorkflow ? (
              latestTurnId !== null && isGraphFetching ? (
                <WorkflowSkeletonOuter>
                  <WorkflowSkeletonCanvas>
                    <WorkflowSkeletonCard />
                    <WorkflowSkeletonFlow>
                      <WorkflowSkeletonRow>
                        <WorkflowSkeletonNode $w="110px" />
                        <WorkflowSkeletonEdge />
                        <WorkflowSkeletonNode $w="120px" />
                        <WorkflowSkeletonEdge />
                        <WorkflowSkeletonBranch>
                          <WorkflowSkeletonNode $w="150px" />
                          <WorkflowSkeletonNode $w="150px" />
                          <WorkflowSkeletonNode $w="150px" />
                        </WorkflowSkeletonBranch>
                      </WorkflowSkeletonRow>
                    </WorkflowSkeletonFlow>
                  </WorkflowSkeletonCanvas>
                </WorkflowSkeletonOuter>
              ) : isGraphUnavailable ? (
                <WorkflowErrorWrapper>
                  <WorkflowErrorTitle>Workflow data unavailable</WorkflowErrorTitle>
                  <WorkflowErrorBody>
                    The agent graph couldn't be loaded for this response. Try toggling the workflow view off and on, or send a new message.
                  </WorkflowErrorBody>
                </WorkflowErrorWrapper>
              ) : (
                <WorkflowView
                  isVisible={showWorkflow}
                  hideTitle
                  variant="chat"
                  workflowGraph={workflowGraph ?? undefined}
                  agentsOutput={agentsOutput}
                  onPhaseChange={setWorkflowPhase}
                  mem0Used={mem0Used}
                  messageContent={
                    lastMessage ? (
                      <>
                        <WorkflowMessageRole>
                          {lastMessage.role === 'assistant' ? 'AI Response' : 'You'}
                        </WorkflowMessageRole>
                        <WorkflowMessageText>
                          <div className="markdown-container">
                            <ReactMarkdown rehypePlugins={mdRehypePlugins}>
                              {normalizeMarkdown(lastMessage.content)}
                            </ReactMarkdown>
                          </div>
                        </WorkflowMessageText>
                      </>
                    ) : undefined
                  }
                />
              )
            ) : isLoadingHistory || isWaitingForSession ? (
              <EmptyStateWrapper>
                <Loader size="lg" center />
              </EmptyStateWrapper>
            ) : showSuggestions || !hasMessages ? (
              <EmptyStateWrapper>
                {showSuggestions ? (
                  <SuggestedTemplates
                    onSuggestionClick={handleSuggestionClick}
                    substitutions={{
                      'Client Name': activeClientName,
                      'Company Name': relevantCompanies[0] ?? '',
                    }}
                    isLoading={isLoadingClients || isLoadingAlerts}
                  />
                ) : (
                  <>
                    <EmptyStateIconCircle>
                      <SparkleIcon width={40} height={40} />
                    </EmptyStateIconCircle>
                    <EmptyStateTitle>Where Should We Start, Jamie?</EmptyStateTitle>
                  </>
                )}
                <EmptyStateInputRow>
                  <ChatForm onSubmit={handleSend}>
                    <InputField
                      placeholder="Chat with AI"
                      value={text}
                      onChange={(v) => setText(v)}
                      isTemplateMode={isTemplateMode && templateSegments.length > 0}
                      templateSegments={templateSegments.length > 0 ? templateSegments : undefined}
                      onTemplateChange={(segs) => setTemplateSegments(segs)}
                      onClear={() => { setTemplateSegments([]); setText(''); }}
                      placeholderOptions={placeholderOptions}
                      style={{ flex: 1 }}
                    />
                    <SendButton
                      type="submit"
                      $hasText={!!text.trim()}
                      aria-label="Send"
                      disabled={!text.trim() || isLoading}
                    >
                      <SendIcon width={20} height={20} />
                    </SendButton>
                  </ChatForm>
                </EmptyStateInputRow>
              </EmptyStateWrapper>
            ) : (
              <>
                <MessagesArea>
                  <ChatWidget hideInput isInDrawer />
                </MessagesArea>
                <ChatInputRow>
                  <ChatForm onSubmit={handleSend}>
                    <InputField
                      placeholder="Chat with AI"
                      value={text}
                      onChange={(v) => setText(v)}
                      isTemplateMode={isTemplateMode && templateSegments.length > 0}
                      templateSegments={templateSegments.length > 0 ? templateSegments : undefined}
                      onTemplateChange={(segs) => setTemplateSegments(segs)}
                      onClear={() => { setTemplateSegments([]); setText(''); }}
                      placeholderOptions={placeholderOptions}
                      style={{ flex: 1 }}
                    />
                    <SendButton
                      type="submit"
                      $hasText={!!text.trim()}
                      aria-label="Send"
                      disabled={!text.trim() || isLoading}
                    >
                      <SendIcon width={20} height={20} />
                    </SendButton>
                  </ChatForm>
                </ChatInputRow>
              </>
            )}
          </ChatContentBox>
        </>
      )}

      {/* Delete confirmation */}
      <Modal
        isOpen={!!sessionToDelete}
        onClose={handleCancelDelete}
        title="Delete Chat"
        footer={
          <>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmDelete} disabled={deleteSessionMutation.isPending}>
              {deleteSessionMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete &quot;
          {sessionToDelete?.chat_title?.trim() || `Chat #${sessionToDelete?.chat_session_id}`}&quot;? This action cannot
          be undone.
        </p>
      </Modal>
    </Modal>
  );
};

export default AskAiMeetingModal;
