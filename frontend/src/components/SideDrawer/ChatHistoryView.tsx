import React, { useMemo, useState } from 'react';
import { Dropdown } from '@/components/Dropdown';
import { Loader, Search } from '@/components';
import ChatHistoryTile from '@/components/ChatHistoryTile/ChatHistoryTile';
import { TrashIcon } from '@/icons';
import type { DropdownOption } from '@/components/Dropdown/Dropdown';
import type { AllClientChat } from '@/api/types/completion.types';
import {
  ChatHistoryViewContainer,
  TopControlsSection,
  ClientDropdownRow,
  SessionsListSection,
  HistoryListContainer,
  EmptyStateMessage,
  LoadingContainer,
  TileRow,
  TileDeleteButton,
} from './ChatHistoryView.styles';

interface ChatHistoryViewProps {
  /** All chat sessions across every client */
  allChats: AllClientChat[];
  /** Loading state */
  isLoadingChats: boolean;
  /** Error state */
  chatsError: unknown;
  /** Currently selected client ID used for filtering (null = show all) */
  selectedClientId: number | null;
  /** Callback when client filter changes */
  onClientFilterChange: (clientId: number | null) => void;
  /** Callback when a chat session tile is clicked */
  onChatSessionSelect: (clientId: number, sessionId: number) => void;
  /** Callback when the delete icon on a tile is clicked */
  onDeleteChat: (chat: AllClientChat, e: React.MouseEvent) => void;
  /** Callback when the "New Chat" tile is clicked */
  onNewChat: () => void;
}

/**
 * Displays the unified chat history list for all clients with optional
 * client-filter dropdown and title search bar.
 *
 * - No client is selected by default; all chats are shown.
 * - A pinned "New Chat" tile always appears at the top of the list.
 * - Each tile has a hover-reveal delete icon.
 */
const ChatHistoryView: React.FC<ChatHistoryViewProps> = ({
  allChats,
  isLoadingChats,
  chatsError,
  selectedClientId,
  onClientFilterChange,
  onChatSessionSelect,
  onDeleteChat,
  onNewChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const safeChats = Array.isArray(allChats) ? allChats : [];

  /** Unique client options derived directly from the chats list, prefixed with "All Clients" */
  const clientOptions: DropdownOption[] = useMemo(() => {
    const seen = new Map<number, string>();
    for (const chat of safeChats) {
      if (!seen.has(chat.client_id)) {
        seen.set(chat.client_id, chat.client_name || `Client ${chat.client_id}`);
      }
    }
    const clientEntries: DropdownOption[] = Array.from(seen.entries()).map(([id, name]) => ({
      label: name,
      value: id,
    }));
    return [{ label: 'All Clients', value: -1 }, ...clientEntries];
  }, [safeChats]);

  /** Chats filtered by selected client and search query */
  const filteredChats = useMemo(() => {
    let result = safeChats;

    if (selectedClientId !== null) {
      result = result.filter((c) => c.client_id === selectedClientId);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) => (c.chat_title || '').toLowerCase().includes(q) || (c.client_name || '').toLowerCase().includes(q),
      );
    }

    return result;
  }, [safeChats, selectedClientId, searchQuery]);

  const handleClientChange = (value: string | number) => {
    const id = Number(value);
    // -1 means "All Clients"
    onClientFilterChange(id === -1 ? null : id);
  };

  /** Dropdown value: undefined when all clients should be shown (shows placeholder) */
  const dropdownValue = selectedClientId === null ? undefined : selectedClientId;

  return (
    <ChatHistoryViewContainer>
      <TopControlsSection>
        <Search fullWidth placeholder="Search" value={searchQuery} onChange={setSearchQuery} allowClear size="md" />
        <ClientDropdownRow>
          <Dropdown
            options={clientOptions}
            value={dropdownValue}
            onChange={handleClientChange}
            placeholder="Select Client..."
            size="md"
            disabled={isLoadingChats}
            hasSearch={clientOptions.length > 7}
          />
        </ClientDropdownRow>
      </TopControlsSection>

      <SessionsListSection>
        <HistoryListContainer>
          {isLoadingChats ? (
            <LoadingContainer>
              <Loader size="sm" />
            </LoadingContainer>
          ) : chatsError ? (
            <EmptyStateMessage>Failed to load chat history. Please try again.</EmptyStateMessage>
          ) : filteredChats.length === 0 ? (
            <EmptyStateMessage>
              {searchQuery
                ? `No chats matching "${searchQuery}".`
                : selectedClientId
                  ? 'No chat history found for this client.'
                  : 'No previous chats yet.'}
            </EmptyStateMessage>
          ) : (
            filteredChats.map((chat) => {
              const title = chat.chat_title?.trim() || `Chat #${chat.chat_session_id}`;
              return (
                <TileRow key={`${chat.client_id}-${chat.chat_session_id}`}>
                  <ChatHistoryTile
                    title={title}
                    clientName={chat.client_name}
                    subtitle={chat.client_name || ''}
                    timeAgo=""
                    onClick={() => onChatSessionSelect(chat.client_id, chat.chat_session_id)}
                    style={{ paddingRight: '40px' }}
                  />
                  <TileDeleteButton
                    data-delete="true"
                    onClick={(e) => onDeleteChat(chat, e)}
                    aria-label={`Delete "${title}"`}
                    title="Delete chat"
                  >
                    <TrashIcon width={14} height={14} />
                  </TileDeleteButton>
                </TileRow>
              );
            })
          )}
        </HistoryListContainer>
      </SessionsListSection>
    </ChatHistoryViewContainer>
  );
};

export default ChatHistoryView;
