import React, { useMemo } from 'react';
import { ThreeDotsIcon } from '@/icons';
import { ChatHeaderStyled, ContainerTitleStyled } from '../Chat.styles';
import type { ChatSession } from '@/api/types/completion.types';

interface ChatContainerHeaderProps {
  selectedSessionId: number | null;
  sessions: ChatSession[] | undefined;
}

export const ChatContainerHeader: React.FC<ChatContainerHeaderProps> = ({ selectedSessionId, sessions }) => {
  const currentSession = useMemo(() => {
    if (!sessions || !selectedSessionId) return null;
    return sessions.find((s) => s.chat_session_id === selectedSessionId);
  }, [sessions, selectedSessionId]);

  const displayTitle = useMemo(() => {
    if (!currentSession) return 'New Chat';
    return currentSession.chat_title?.trim() || `Chat #${currentSession.chat_session_id}`;
  }, [currentSession]);

  return (
    <ChatHeaderStyled>
      <ContainerTitleStyled>{displayTitle}</ContainerTitleStyled>
      <ThreeDotsIcon />
    </ChatHeaderStyled>
  );
};
