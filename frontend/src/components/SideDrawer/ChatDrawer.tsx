import React, { useMemo, useCallback, useEffect, FormEvent, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import SideDrawer from '../SideDrawer/SideDrawer';
import { useChatStore } from '@/store/chatStore';
import { useChatHandler } from '@/features/chat/components/hooks/useChatHandler';
import { useAllClientChatsQuery, useDeleteChatSession } from '@/api/hooks/useChatSessions';
import { useClientsQuery } from '@/api/hooks/useClientsQuery';
import { useClientAlertsQuery } from '@/api/hooks/useAlertsQuery';
import { queryKeys } from '@/utils/queryKeys';
import { useNavigate, useLocation } from 'react-router-dom';
import { clientToSlug } from '@/utils/clientSlug';
import { InputField, Button, Modal } from '../index';
import { Dropdown } from '../Dropdown';
import { SendIcon, CloseIcon, ExternalLinkIcon, BackIcon } from '@/icons';
import ChatWidget from '@/features/chat/components/ChatWidget';
import { NAVIGATION_SOURCES } from '@/constants/navigation';
import type { NavigationSource } from '@/types/navigation';
import type { AllClientChat } from '@/api/types/completion.types';
import type { DropdownOption } from '../Dropdown/Dropdown';
import ChatHistoryView from './ChatHistoryView';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from '@/components/Toast';
import {
  ChatDrawerHeader,
  ChatDrawerHeaderLeft,
  ChatDrawerTitle,
  ChatDrawerHeaderRight,
  ChatDrawerCloseButton,
  ChatDrawerExternalLinkButton,
  ChatDrawerBackButton,
  ChatDrawerDivider,
  ChatDrawerContent,
  ChatDrawerBottomBox,
  ChatDrawerInputWrapper,
  ChatDrawerInputContainer,
  ChatDrawerSendButton,
  NewChatEmptyState,
  NewChatEmptyStateMessage,
} from './ChatDrawer.styles';

export interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChatDrawerView = 'history' | 'chat';

const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const queryClient = useQueryClient();

  // All-client chats (used in history view)
  const { data: allChats = [], isLoading: isLoadingChats, error: chatsError } = useAllClientChatsQuery();

  // Clients list — needed for the client picker in the new-chat empty state
  const { data: clients = [], isLoading: isLoadingClients } = useClientsQuery();

  const { selectedClientId, selectedSessionId, setSelectedClient, setSelectedSession, resetToNewChat } = useChatStore();

  // Active view
  const [currentView, setCurrentView] = useState<ChatDrawerView>('history');

  // Client filter in the history list (null = show all)
  const [historyClientFilter, setHistoryClientFilter] = useState<number | null>(null);

  // Delete confirmation state
  const [chatToDelete, setChatToDelete] = useState<AllClientChat | null>(null);
  const deleteSessionMutation = useDeleteChatSession();

  // ─── Derived ──────────────────────────────────────────────────────────────

  /** Client name resolved from allChats (used in header and external-link) */
  const selectedClientName = useMemo(() => {
    if (!selectedClientId) return null;
    const fromChats = allChats.find((c) => c.client_id === selectedClientId);
    if (fromChats) return fromChats.client_name;
    const fromClients = clients.find((c: any) => c.id === selectedClientId);
    return fromClients?.full_name ?? null;
  }, [selectedClientId, allChats, clients]);

  /** Dropdown options for the client picker in the new-chat empty state */
  const clientPickerOptions: DropdownOption[] = useMemo(() => {
    if (!Array.isArray(clients) || clients.length === 0) return [];
    return (clients as any[]).map((c) => ({
      label: c.full_name || c.email || `Client ${c.id}`,
      value: c.id,
    }));
  }, [clients]);

  // ─── Navigation handlers ──────────────────────────────────────────────────

  const handleChatSessionSelect = useCallback(
    (clientId: number, sessionId: number) => {
      if (sessionId === -1) {
        resetToNewChat();
      } else {
        // Only mutate the store when something actually changes.
        // Calling setSelectedClient even with the same ID wipes selectedSessionId → null,
        // and React batching then hides the null→123 round-trip from the useEffect,
        // so fetchHistory is never called and messages silently vanish.
        const clientChanged = clientId !== selectedClientId;
        const sessionChanged = sessionId !== selectedSessionId || clientChanged;
        if (clientChanged) setSelectedClient(clientId);
        if (sessionChanged) setSelectedSession(sessionId);
      }
      setCurrentView('chat');
    },
    [setSelectedClient, setSelectedSession, resetToNewChat, selectedClientId, selectedSessionId],
  );

  const handleBackToHistory = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [queryKeys.allClientChats] });
    setCurrentView('history');
  }, [queryClient]);

  /** "New Chat" tile in history → go to chat view with no client pre-selected */
  const handleNewChatFromHistory = useCallback(() => {
    resetToNewChat();
    setSelectedClient(null);
    setCurrentView('chat');
  }, [resetToNewChat, setSelectedClient]);

  /** "New Chat" button in chat-view header → keep current client, reset session */
  const handleNewChatFromHeader = useCallback(() => {
    if (!selectedClientId) return;
    resetToNewChat();
  }, [selectedClientId, resetToNewChat]);

  // Reset to history view when drawer opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView('history');
    }
  }, [isOpen]);

  const handleExternalLink = useCallback(() => {
    if (!selectedClientId || !selectedClientName) return;

    const clientSlug = clientToSlug(selectedClientName);
    const from: NavigationSource = location.pathname.startsWith('/clients')
      ? NAVIGATION_SOURCES.CLIENTS
      : NAVIGATION_SOURCES.DASHBOARD;

    const sessionSuffix = selectedSessionId ? `/${selectedSessionId}` : '';
    const routePath =
      from === NAVIGATION_SOURCES.CLIENTS
        ? `/clients/${clientSlug}/messages${sessionSuffix}`
        : `/dashboard/${clientSlug}/messages${sessionSuffix}`;

    navigate(routePath, { state: { from } });
    onClose();
  }, [selectedClientId, selectedClientName, selectedSessionId, location.pathname, navigate, onClose]);

  // ─── Delete handlers ──────────────────────────────────────────────────────

  const handleDeleteClick = useCallback((chat: AllClientChat, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chat);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!chatToDelete) return;

    const { client_id, chat_session_id, chat_title } = chatToDelete;
    const wasActive = chat_session_id === selectedSessionId && client_id === selectedClientId;

    try {
      await deleteSessionMutation.mutateAsync({ clientId: client_id, chatSessionId: chat_session_id });

      showToast({ variant: 'success', message: 'Chat deleted successfully' });

      if (wasActive) {
        resetToNewChat();
      }
    } catch {
      showToast({ variant: 'error', message: 'Failed to delete chat. Please try again.' });
    } finally {
      setChatToDelete(null);
    }
  }, [chatToDelete, selectedSessionId, selectedClientId, deleteSessionMutation, showToast, resetToNewChat]);

  const handleCancelDelete = useCallback(() => {
    setChatToDelete(null);
  }, []);

  // ─── Chat input ───────────────────────────────────────────────────────────

  const { isTemplateMode, isLoadingHistory } = useChatStore();
  const { sendMessage, isLoading, error: chatError } = useChatHandler();
  const [text, setText] = useState('');
  const [templateSegments, setTemplateSegments] = useState<any[]>([]);

  const canSendMessage = !!selectedClientId;

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !canSendMessage) return;

    const messageToSend = trimmed;
    const isTemplate = isTemplateMode && templateSegments.length > 0;
    setText('');
    setTemplateSegments([]);

    try {
      await sendMessage(messageToSend, isTemplate);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  useEffect(() => {
    if (!isTemplateMode) setTemplateSegments([]);
    setText('');
  }, [isTemplateMode, selectedClientId, selectedSessionId]);

  // Companies relevant to active client (derived from their alerts) — used to render
  // the [Company Name] placeholder as a dropdown in the template input.
  const { data: clientAlerts = [] } = useClientAlertsQuery(selectedClientId);
  const placeholderOptions = useMemo(() => {
    const set = new Set<string>();
    for (const a of clientAlerts) {
      for (const company of a.companies ?? []) {
        const name = company.company_name?.trim();
        if (name) set.add(name);
      }
    }
    return { 'Company Name': Array.from(set).sort((a, b) => a.localeCompare(b)) };
  }, [clientAlerts]);

  // ─── Header meta ──────────────────────────────────────────────────────────

  const showBackButton = currentView === 'chat';
  const showGotoButton = currentView === 'chat' && !!selectedClientId && !!selectedClientName;

  const headerTitle = useMemo(() => {
    if (currentView === 'history') return 'Chat History';
    return selectedClientName ?? 'New Chat';
  }, [currentView, selectedClientName]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SideDrawer isOpen={isOpen} onClose={onClose}>
      {/* ── Header ── */}
      <ChatDrawerHeader>
        <ChatDrawerHeaderLeft>
          {showBackButton && (
            <ChatDrawerBackButton onClick={handleBackToHistory} aria-label="Back to chat history">
              <BackIcon />
            </ChatDrawerBackButton>
          )}
          <ChatDrawerTitle>{headerTitle}</ChatDrawerTitle>
        </ChatDrawerHeaderLeft>
        <ChatDrawerHeaderRight>
          {currentView === 'history' && (
            <Button variant="outline" size="sm" onClick={handleNewChatFromHistory}>
              New Chat
            </Button>
          )}
          {showGotoButton && (
            <ChatDrawerExternalLinkButton onClick={handleExternalLink} aria-label="Open in full chat">
              <ExternalLinkIcon />
            </ChatDrawerExternalLinkButton>
          )}
          <ChatDrawerCloseButton onClick={onClose} aria-label="Close chat">
            <CloseIcon />
          </ChatDrawerCloseButton>
        </ChatDrawerHeaderRight>
      </ChatDrawerHeader>
      <ChatDrawerDivider />

      {/* ── Content ── */}
      <ChatDrawerContent>
        {currentView === 'history' ? (
          <ErrorBoundary
            fallback={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Error loading chat history. Please refresh and try again.</p>
              </div>
            }
          >
            <ChatHistoryView
              allChats={allChats}
              isLoadingChats={isLoadingChats}
              chatsError={chatsError}
              selectedClientId={historyClientFilter}
              onClientFilterChange={setHistoryClientFilter}
              onChatSessionSelect={handleChatSessionSelect}
              onDeleteChat={handleDeleteClick}
              onNewChat={handleNewChatFromHistory}
            />
          </ErrorBoundary>
        ) : !selectedClientId ? (
          /* ── New Chat: no client selected yet → show centered message ── */
          <NewChatEmptyState>
            <NewChatEmptyStateMessage>Select a client to get started</NewChatEmptyStateMessage>
          </NewChatEmptyState>
        ) : (
          <ChatWidget hideInput isInDrawer />
        )}
      </ChatDrawerContent>

      {/* ── Bottom input box (shown in all chat view states) ── */}
      {currentView === 'chat' && (
        <ChatDrawerBottomBox>
          {!selectedClientId && (
            <Dropdown
              options={clientPickerOptions}
              value={undefined}
              onChange={(value) => setSelectedClient(Number(value))}
              placeholder={isLoadingClients ? 'Loading clients...' : 'Select Client...'}
              size="md"
              disabled={isLoadingClients || clientPickerOptions.length === 0}
              hasSearch={clientPickerOptions.length > 5}
            />
          )}
          <form onSubmit={selectedClientId ? handleSend : (e) => e.preventDefault()} style={{ width: '100%' }}>
            <ChatDrawerInputWrapper>
              <ChatDrawerInputContainer>
                <InputField
                  name="message"
                  placeholder={!selectedClientId ? 'Select client to initiate chat' : 'Enter a message...'}
                  value={selectedClientId ? text : ''}
                  onChange={(v) => {
                    if (selectedClientId) setText(v);
                  }}
                  isTemplateMode={isTemplateMode && templateSegments.length > 0}
                  templateSegments={templateSegments.length > 0 ? templateSegments : undefined}
                  onTemplateChange={setTemplateSegments}
                  placeholderOptions={placeholderOptions}
                  disabled={!selectedClientId || isLoading || isLoadingHistory}
                  error={
                    chatError
                      ? chatError instanceof Error
                        ? chatError.message
                        : typeof chatError === 'string'
                          ? chatError
                          : 'Failed to send message'
                      : undefined
                  }
                />
              </ChatDrawerInputContainer>
              <ChatDrawerSendButton
                type="submit"
                aria-label="Send message"
                disabled={!selectedClientId || isLoading || isLoadingHistory || !text.trim()}
                style={!selectedClientId ? { opacity: 0.5 } : undefined}
              >
                <SendIcon />
              </ChatDrawerSendButton>
            </ChatDrawerInputWrapper>
          </form>
        </ChatDrawerBottomBox>
      )}

      {/* ── Delete confirmation modal ── */}
      <Modal
        isOpen={!!chatToDelete}
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
          {chatToDelete?.chat_title?.trim() || `Chat #${chatToDelete?.chat_session_id}`}&quot;? This action cannot be
          undone.
        </p>
      </Modal>
    </SideDrawer>
  );
};

export default ChatDrawer;
