import { useState, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { useDeleteChatSession } from '@/api/hooks/useChatSessions';
import { useChatStore } from '@/store/chatStore';
import type { ChatSession } from '@/api/types/completion.types';

interface UseDeleteSessionOptions {
  selectedClientId: number | null;
  refetchSessions: () => void;
}

/**
 * Encapsulates delete-session confirmation state and handlers.
 */
export const useDeleteSession = ({ selectedClientId, refetchSessions }: UseDeleteSessionOptions) => {
  const { showToast } = useToast();
  const { selectedSessionId, resetToNewChat } = useChatStore();
  const deleteSessionMutation = useDeleteChatSession();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);

  const handleDeleteClick = useCallback((e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setSessionToDelete(session);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!sessionToDelete || !selectedClientId) return;

    const sessionId = sessionToDelete.chat_session_id;
    const wasActive = sessionId === selectedSessionId;

    try {
      await deleteSessionMutation.mutateAsync({
        clientId: selectedClientId,
        chatSessionId: sessionId,
      });

      showToast({ variant: 'success', message: 'Chat deleted successfully' });

      if (wasActive) {
        resetToNewChat();
      }

      refetchSessions();
    } catch (error) {
      console.error('Failed to delete chat:', error);
      showToast({ variant: 'error', message: 'Failed to delete chat. Please try again.' });
    } finally {
      setDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  }, [
    sessionToDelete,
    selectedClientId,
    selectedSessionId,
    deleteSessionMutation,
    showToast,
    resetToNewChat,
    refetchSessions,
  ]);

  const handleCancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setSessionToDelete(null);
  }, []);

  return {
    deleteModalOpen,
    sessionToDelete,
    isPending: deleteSessionMutation.isPending,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
};
