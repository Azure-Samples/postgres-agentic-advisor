import React, { useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Modal } from '@/components';
import { Breadcrumb, Crumb, CrumbLink } from '@/components/Breadcrumb';
import { Dropdown } from '@/components/Dropdown';
import { BackIcon } from '@/icons';
import {
  ChatMainArea,
  DropDownWrapper,
  GoBackButton,
  HeaderContentWrapper,
  ShellContentWrapper,
  ShellHeader,
  ShellStyled,
} from './Chat.styles';
import ChatWidget from '@/features/chat/components/ChatWidget';
import { useClientsQuery } from '@/api/hooks/useClientsQuery';
import { useChatStore } from '@/store/chatStore';
import { useChatSessionsQuery } from '@/api/hooks/useChatSessions';
import type { DropdownOption } from '@/components/Dropdown/Dropdown';
import { clientToSlug } from '@/utils/clientSlug';
import { useNavigationContext } from '@/hooks';
import { ChatSidePanel } from './components/ChatSidePanel';
import { ChatContainerHeader } from './components/ChatContainerHeader';
import { useChatClientInit } from './hooks/useChatClientInit';
import { useDeleteSession } from './hooks/useDeleteSession';

/**
 * ChatInterface - Main chat page with ChatGPT-level UX.
 *
 * Key features:
 * - No manual "New Chat" required - just start typing
 * - Chat titles auto-generate from first message
 * - Seamless session management
 * - Delete confirmation with toast feedback
 * - Real alerts API integration for selected client
 */
const ChatInterface = () => {
  const { clientName, '*': sessionWildcard } = useParams<{ clientName: string; '*': string }>();
  const sessionIdParam = sessionWildcard && sessionWildcard !== '' ? sessionWildcard : undefined;
  const navigate = useNavigate();
  const location = useLocation();
  // Stable base path (/dashboard or /clients) captured when the component first mounts.
  const basePathRef = useRef(location.pathname.startsWith('/clients') ? '/clients' : '/dashboard');
  const { backPath, backLabel } = useNavigationContext();

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useClientsQuery();
  const { selectedClientId, selectedSessionId, setSelectedClient, setSelectedSession, resetToNewChat } = useChatStore();

  const {
    data: chatSessions,
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useChatSessionsQuery(selectedClientId);

  useChatClientInit({ clients, clientName, sessionIdParam, backPath, basePathRef });

  const {
    deleteModalOpen,
    sessionToDelete,
    isPending: isDeletePending,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  } = useDeleteSession({ selectedClientId, refetchSessions });

  // Convert clients to dropdown options
  const clientOptions: DropdownOption[] = useMemo(() => {
    if (!clients || !Array.isArray(clients)) return [];
    return clients.map((client) => ({
      label: client.full_name || client.email || `Client ${client.id}`,
      value: client.id,
    }));
  }, [clients]);

  const handleClientChange = (value: string | number, _option: DropdownOption) => {
    const newClientId = Number(value);
    setSelectedClient(newClientId);
    // Update the URL to reflect the new client (drop any active session from the path).
    const newClient = clients?.find((c) => c.id === newClientId);
    if (newClient) {
      const slug = clientToSlug(newClient.full_name);
      navigate(`${basePathRef.current}/${slug}/messages`, { replace: true });
    }
  };

  const handleNewChat = useCallback(async () => {
    if (!selectedClientId) return;
    resetToNewChat();
  }, [selectedClientId, resetToNewChat]);

  const handleSessionSelect = useCallback(
    (sessionId: number) => {
      if (sessionId === selectedSessionId) return;
      setSelectedSession(sessionId);
    },
    [setSelectedSession, selectedSessionId],
  );

  const handleGoBack = () => {
    navigate(backPath);
  };

  return (
    <ShellStyled>
      <ShellHeader>
        <HeaderContentWrapper>
          <Breadcrumb>
            <CrumbLink href="/">Home</CrumbLink>
            <DropDownWrapper>
              <Dropdown
                options={clientOptions}
                value={selectedClientId || undefined}
                onChange={handleClientChange}
                placeholder={isLoadingClients ? 'Loading clients...' : 'Select client'}
                size="md"
                disabled={isLoadingClients || !!clientsError}
                hasSearch={clientOptions.length > 5}
              />
            </DropDownWrapper>
            <Crumb>Messages</Crumb>
          </Breadcrumb>
          <GoBackButton onClick={handleGoBack}>
            <BackIcon />
            <span>{backLabel}</span>
          </GoBackButton>
        </HeaderContentWrapper>
        <Button variant="primary" onClick={handleNewChat} disabled={!selectedClientId}>
          New Chat
        </Button>
      </ShellHeader>
      <ShellContentWrapper>
        <ChatSidePanel
          sessions={chatSessions || []}
          isLoading={isLoadingSessions}
          selectedSessionId={selectedSessionId}
          onSessionSelect={handleSessionSelect}
          onDeleteClick={handleDeleteClick}
          selectedClientId={selectedClientId}
        />
        <ChatMainArea>
          <ChatContainerHeader selectedSessionId={selectedSessionId} sessions={chatSessions} />
          <ChatWidget />
        </ChatMainArea>
      </ShellContentWrapper>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Chat"
        footer={
          <>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmDelete} disabled={isDeletePending}>
              {isDeletePending ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete "
          {sessionToDelete?.chat_title?.trim() || `Chat #${sessionToDelete?.chat_session_id}`}"? This action cannot be
          undone.
        </p>
      </Modal>
    </ShellStyled>
  );
};

export default ChatInterface;
