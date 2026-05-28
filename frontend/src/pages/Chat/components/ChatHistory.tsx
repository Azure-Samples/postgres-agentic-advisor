import React, { useState, useRef, useEffect } from 'react';
import { ChatSessionSkeleton } from '@/components';
import { HistoryTileIcon, ChatSearchIcon, ChatEllipsisIcon, ChatConfirmIcon } from '@/icons';
import { ChatHistoryContainer, EmptySessionsMessage, NewChatHint, TilesWrapperStyled } from '../Chat.styles';
import type { ChatSession } from '@/api/types/completion.types';
import { useUpdateChatTitle } from '@/api/hooks/useChatSessions';
import { groupSessionsByDate, formatDateToRelativeTime } from '@/utils/dateUtils';
import {
  HistoryTitle,
  SearchWrapper,
  SearchIconWrap,
  SearchInput,
  GroupLabel,
  GroupSection,
  TileWrapper,
  HistoryTileRow,
  TileLeft,
  TileTitleBlock,
  TileTitle,
  TileDate,
  TileMoreButton,
  TileDropdown,
  TileDropdownItem,
  RenameInput,
  SaveButton,
} from './ChatHistory.styles';

interface ChatHistoryProps {
  sessions: ChatSession[];
  isLoading: boolean;
  selectedSessionId: number | null;
  selectedClientId: number | null;
  onSessionSelect: (sessionId: number) => void;
  onDeleteClick: (e: React.MouseEvent, session: ChatSession) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  sessions,
  isLoading,
  selectedSessionId,
  selectedClientId,
  onSessionSelect,
  onDeleteClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const updateTitle = useUpdateChatTitle();

  const filteredSessions = sessions.filter((s) =>
    (s.chat_title || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Close dropdown on outside click
  useEffect(() => {
    if (openMenuId === null) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [openMenuId]);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingId !== null) {
      setTimeout(() => renameInputRef.current?.focus(), 0);
    }
  }, [renamingId]);

  const handleRenameStart = (session: ChatSession) => {
    setRenamingId(session.chat_session_id);
    setRenameValue(session.chat_title?.trim() || '');
    setOpenMenuId(null);
  };

  const handleRenameSave = async (session: ChatSession) => {
    const trimmed = renameValue.trim();
    if (!trimmed || !selectedClientId) {
      setRenamingId(null);
      return;
    }
    try {
      await updateTitle.mutateAsync({
        clientId: selectedClientId,
        chatSessionId: session.chat_session_id,
        newTitle: trimmed,
      });
    } catch {
      /* silent — query invalidation will refresh */
    }
    setRenamingId(null);
  };

  return (
    <ChatHistoryContainer>
      <HistoryTitle>Chat History</HistoryTitle>

      <SearchWrapper>
        <SearchIconWrap>
          <ChatSearchIcon />
        </SearchIconWrap>
        <SearchInput
          type="text"
          placeholder="Search chat"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchWrapper>

      <TilesWrapperStyled>
        {isLoading ? (
          <ChatSessionSkeleton count={4} />
        ) : filteredSessions.length === 0 ? (
          <EmptySessionsMessage>
            <NewChatHint>{searchQuery ? `No chats matching "${searchQuery}".` : 'No conversations yet.'}</NewChatHint>
          </EmptySessionsMessage>
        ) : (
          groupSessionsByDate(filteredSessions).map(({ label, sessions: groupSessions }) => (
            <GroupSection key={label}>
              <GroupLabel>{label}</GroupLabel>
              {groupSessions.map((session) => {
                const displayTitle = session.chat_title?.trim() || `Chat #${session.chat_session_id}`;
                const isActive = session.chat_session_id === selectedSessionId;
                const isMenuOpen = openMenuId === session.chat_session_id;
                const isRenaming = renamingId === session.chat_session_id;
                return (
                  <TileWrapper key={session.chat_session_id}>
                    <HistoryTileRow
                      $isActive={isActive}
                      onClick={() => !isRenaming && onSessionSelect(session.chat_session_id)}
                    >
                      <TileLeft>
                        <HistoryTileIcon />
                        {isRenaming ? (
                          <RenameInput
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameSave(session);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <TileTitleBlock>
                            <TileTitle>{displayTitle}</TileTitle>
                            <TileDate>{formatDateToRelativeTime(session.date)}</TileDate>
                          </TileTitleBlock>
                        )}
                      </TileLeft>
                      {isRenaming ? (
                        <SaveButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameSave(session);
                          }}
                          disabled={updateTitle.isPending}
                          aria-label="Save title"
                        >
                          <ChatConfirmIcon />
                        </SaveButton>
                      ) : (
                        <TileMoreButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : session.chat_session_id);
                          }}
                          aria-label={`Options for ${displayTitle}`}
                          $menuOpen={isMenuOpen}
                        >
                          <ChatEllipsisIcon />
                        </TileMoreButton>
                      )}
                    </HistoryTileRow>

                    {isMenuOpen && (
                      <TileDropdown ref={menuRef}>
                        <TileDropdownItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameStart(session);
                          }}
                        >
                          Rename
                        </TileDropdownItem>
                        <TileDropdownItem
                          $danger
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            onDeleteClick(e, session);
                          }}
                        >
                          Delete
                        </TileDropdownItem>
                      </TileDropdown>
                    )}
                  </TileWrapper>
                );
              })}
            </GroupSection>
          ))
        )}
      </TilesWrapperStyled>
    </ChatHistoryContainer>
  );
};

export default ChatHistory;
