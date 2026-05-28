import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { FormEvent } from 'react';
import { InputField, AgentResponse, Loader } from '@/components';
import { SendIcon, AnalyzingIcon } from '@/icons';
import { useChatStore } from '../../../store/chatStore';
import { useClientAlertsQuery } from '@/api/hooks/useAlertsQuery';
import {
  ChatBoxContainerStyled,
  ChatInputWrapper,
  InputWrapperStyled,
  SendButtonStyled,
  ChatContainer,
  WelcomeScreen,
  WelcomeContent,
  CenteredContent,
  MessagesWrapper,
  AgentThinkingMessage,
  AgentSpinner,
  AgentThinkingText,
  ChatFormWrapper,
  AssistantMessageWrapper,
  MemoryUpdatedBadge,
  MemoryUpdatedIcon,
  MemoryUpdatedText,
} from './ChatWidget.styles';
import { useChatHandler } from '@/features/chat/components/hooks/useChatHandler';
import { UserPrompt } from '@/components';
import ChatMessageActions from './ChatMessageActions';
import ChatErrorBubble from './ChatErrorBubble';

interface ChatWidgetProps {
  hideInput?: boolean;
  isInDrawer?: boolean;
}

/**
 * ChatWidget - A ChatGPT-level chat interface component.
 *
 * Key UX features:
 * - User messages appear instantly
 * - Assistant responses stream progressively
 * - Auto-creates session on first message (no manual "New Chat" required)
 * - Smooth auto-scroll on new messages
 * - Typing indicator while streaming
 */
const ChatWidget: React.FC<ChatWidgetProps> = ({ hideInput = false, isInDrawer = false }) => {
  const {
    messages,
    isTemplateMode,
    isLoadingHistory,
    selectedClientId,
    selectedSessionId,
    isSessionPending,
  } = useChatStore();
  const { sendMessage, fetchHistory, isLoading } = useChatHandler();
  const { removeMessage } = useChatStore();
  const [text, setText] = useState('');
  const [templateSegments, setTemplateSegments] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Companies relevant to the active client (derived from their alerts).
  const { data: clientAlerts = [] } = useClientAlertsQuery(selectedClientId);
  const relevantCompanies = useMemo(() => {
    const set = new Set<string>();
    for (const a of clientAlerts) {
      for (const company of a.companies ?? []) {
        const name = company.company_name?.trim();
        if (name) set.add(name);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [clientAlerts]);

  const placeholderOptions = useMemo(() => ({ 'Company Name': relevantCompanies }), [relevantCompanies]);

  // Show loading whenever a session is selected but messages haven't arrived yet —
  // regardless of isTemplateMode, which can briefly be true even when a session is
  // selected (race between store updates and the fetchHistory effect firing).
  const showLoading = isLoadingHistory || (messages.length === 0 && !!selectedSessionId && !isSessionPending);
  // Show welcome screen only when there is genuinely no session selected.
  const showSuggestions = messages.length === 0 && isTemplateMode && !showLoading && !isSessionPending && !selectedSessionId;

  // User can send messages if they have a client selected
  // Session will be auto-created on first message if needed
  const canSendMessage = !!selectedClientId;

  const messageSignature = useMemo(
    () => messages.map((m) => `${m.id}:${m.content?.length ?? 0}`).join('|'),
    [messages],
  );

  // Auto-scroll on new messages or content updates
  useEffect(() => {
    if (messages.length > 0) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messageSignature, messages.length]);

  // Reset input when template mode changes or client/session changes
  useEffect(() => {
    if (!isTemplateMode) {
      setTemplateSegments([]);
    }
    setText('');
  }, [isTemplateMode, selectedClientId, selectedSessionId]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !canSendMessage || isLoading) return;

    const messageToSend = trimmed;
    const isTemplate = isTemplateMode && templateSegments.length > 0;

    // Clear input immediately for instant feedback
    setText('');
    setTemplateSegments([]);

    try {
      await sendMessage(messageToSend, isTemplate);
    } catch (err) {
      console.error('Error sending message:', err);
      // Error is already handled in the chat handler and displayed
    }
  };

  // Show a lightweight loader message while waiting for first assistant chunk
  const showAgentThinking = useMemo(() => {
    if (!isLoading) return false;
    if (messages.length === 0) return isSessionPending;
    const last = messages[messages.length - 1];
    return last.role === 'user' || (last.role === 'assistant' && !last.content);
  }, [isLoading, messages, isSessionPending]);

  const thinkingMessage = isSessionPending ? 'Starting new conversation...' : 'Agent is thinking...';

  // Analyzing agents from the in-progress assistant message (populated by stream events)
  const analyzingAgents = useMemo(() => {
    if (!showAgentThinking) return [];
    const last = messages[messages.length - 1];
    return last?.role === 'assistant' && last.analyzingAgents ? last.analyzingAgents : [];
  }, [showAgentThinking, messages]);

  // Retry a failed stream: remove the error assistant message + preceding user message, re-send
  const handleStreamRetry = useCallback(
    (errorMsgId: string) => {
      const errorIdx = messages.findIndex((m) => m.id === errorMsgId);
      const userMsg = errorIdx > 0 ? messages[errorIdx - 1] : null;
      removeMessage(errorMsgId);
      if (userMsg?.role === 'user' && userMsg.content) {
        removeMessage(userMsg.id);
        sendMessage(userMsg.content, false);
      }
    },
    [messages, removeMessage, sendMessage],
  );

  // Retry loading history for the current session
  const handleHistoryRetry = useCallback(() => {
    if (selectedClientId && selectedSessionId) {
      fetchHistory(selectedClientId, selectedSessionId, true);
    }
  }, [fetchHistory, selectedClientId, selectedSessionId]);

  // Determine placeholder text
  const placeholderText = useMemo(() => {
    if (!selectedClientId) return 'Select a client to start messaging...';
    if (showSuggestions) return 'Select a template or type your message...';
    return 'Enter a message...';
  }, [selectedClientId, showSuggestions]);

  const inputField = !hideInput && (
    <ChatInputWrapper>
      <InputWrapperStyled>
        <InputField
          name="message"
          placeholder={placeholderText}
          value={text}
          onChange={(v) => setText(v)}
          isTemplateMode={isTemplateMode && templateSegments.length > 0}
          templateSegments={templateSegments.length > 0 ? templateSegments : undefined}
          onTemplateChange={setTemplateSegments}
          placeholderOptions={placeholderOptions}
          disabled={isLoading || showLoading || !canSendMessage}
        />
      </InputWrapperStyled>
      <SendButtonStyled
        type="submit"
        aria-label="Send message"
        disabled={isLoading || showLoading || !canSendMessage || !text.trim()}
      >
        <SendIcon />
      </SendButtonStyled>
    </ChatInputWrapper>
  );

  if (showLoading) {
    return (
      <ChatContainer>
        <CenteredContent>
          <Loader size="md" />
        </CenteredContent>
      </ChatContainer>
    );
  }

  if (showSuggestions) {
    const welcomeInputField = !hideInput && (
      <ChatInputWrapper $welcome>
        <InputWrapperStyled>
          <InputField
            name="message"
            placeholder="Chat with AI"
            value={text}
            onChange={(v) => setText(v)}
            isTemplateMode={isTemplateMode && templateSegments.length > 0}
            templateSegments={templateSegments.length > 0 ? templateSegments : undefined}
            onTemplateChange={setTemplateSegments}
            placeholderOptions={placeholderOptions}
            disabled={isLoading || showLoading || !canSendMessage}
          />
        </InputWrapperStyled>
        <SendButtonStyled
          type="submit"
          aria-label="Send message"
          disabled={isLoading || showLoading || !canSendMessage || !text.trim()}
        >
          <SendIcon />
        </SendButtonStyled>
      </ChatInputWrapper>
    );

    return (
      <ChatContainer>
        <WelcomeScreen>
          <WelcomeContent>
            <ChatFormWrapper $welcome onSubmit={handleSend}>
              {welcomeInputField}
            </ChatFormWrapper>
          </WelcomeContent>
        </WelcomeScreen>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatBoxContainerStyled aria-live="polite" $isInDrawer={isInDrawer} $shouldFlex>
        <MessagesWrapper>
          {messages.map((m, idx) => {
            const isLastMessage = idx === messages.length - 1;
            const isStreamingThisMessage = isLastMessage && isLoading;
            return (
              <div key={m.id}>
                {m.isError ? (
                  <ChatErrorBubble
                    kind={m.errorKind ?? 'stream'}
                    onRetry={
                      m.errorKind === 'history'
                        ? handleHistoryRetry
                        : () => handleStreamRetry(m.id)
                    }
                  />
                ) : m.role === 'assistant' ? (
                  <AssistantMessageWrapper>
                    {m.memorySaved && (
                      <MemoryUpdatedBadge>
                        <MemoryUpdatedIcon src="/memo.webp" alt="" />
                        <MemoryUpdatedText>Memory Updated</MemoryUpdatedText>
                      </MemoryUpdatedBadge>
                    )}
                    <AgentResponse markdownText={m.content} />
                    {!isStreamingThisMessage && m.content && (
                      <ChatMessageActions
                        content={m.content}
                        isInDrawer={isInDrawer}
                        relationships={m.relationships}
                        agentsGraph={m.agentsGraph}
                        agentsOutput={m.agentsOutput}
                        alertId={m.alertId}
                      />
                    )}
                  </AssistantMessageWrapper>
                ) : (
                  <UserPrompt content={m.content} />
                )}
              </div>
            );
          })}
          {showAgentThinking && (
            <AgentThinkingMessage>
              <AgentSpinner>
                <AnalyzingIcon />
              </AgentSpinner>
              {analyzingAgents.length > 0 ? (
                <AgentThinkingText key={analyzingAgents.join(',')}>
                  Analyzing {analyzingAgents.join(', ')}...
                </AgentThinkingText>
              ) : (
                <AgentThinkingText key={thinkingMessage}>{thinkingMessage}</AgentThinkingText>
              )}
            </AgentThinkingMessage>
          )}
          <div ref={endRef} />
        </MessagesWrapper>
      </ChatBoxContainerStyled>
      {!hideInput && <ChatFormWrapper onSubmit={handleSend}>{inputField}</ChatFormWrapper>}
    </ChatContainer>
  );
};

export default ChatWidget;
