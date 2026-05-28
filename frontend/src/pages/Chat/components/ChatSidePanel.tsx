import React from 'react';
import { ChatSidePanelWrapper } from '../Chat.styles';
import { ChatHistory } from './ChatHistory';
import { AlertBox } from './AlertBox';
import type { ChatSession } from '@/api/types/completion.types';

interface ChatSidePanelProps {
  sessions: ChatSession[];
  isLoading: boolean;
  selectedSessionId: number | null;
  onSessionSelect: (sessionId: number) => void;
  onDeleteClick: (e: React.MouseEvent, session: ChatSession) => void;
  selectedClientId: number | null;
}

export const ChatSidePanel: React.FC<ChatSidePanelProps> = ({
  sessions,
  isLoading,
  selectedSessionId,
  onSessionSelect,
  onDeleteClick,
  selectedClientId,
}) => {
  return (
    <ChatSidePanelWrapper>
      <ChatHistory
        sessions={sessions}
        isLoading={isLoading}
        selectedSessionId={selectedSessionId}
        selectedClientId={selectedClientId}
        onSessionSelect={onSessionSelect}
        onDeleteClick={onDeleteClick}
      />
      <AlertBox selectedClientId={selectedClientId} />
    </ChatSidePanelWrapper>
  );
};
