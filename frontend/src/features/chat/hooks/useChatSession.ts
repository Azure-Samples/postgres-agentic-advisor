import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/store/chatStore';
import { useChatSessionsQuery, useDeleteChatSession } from '@/api/hooks/useChatSessions';
import { useChatHandler } from '@/features/chat/components/hooks/useChatHandler';
import { queryKeys } from '@/utils/queryKeys';
import { useToast } from '@/components/Toast';
import type { ChatSession } from '@/api/types/completion.types';

/**
 * Custom hook for managing chat sessions with ChatGPT-level UX.
 *
 * Combines session listing, selection, creation, deletion, and messaging
 * into a single, easy-to-use interface.
 *
 * Key features:
 * - Auto-creates session on first message
 * - Auto-refreshes titles after AI response
 * - Toast notifications for user feedback
 * - Graceful error handling
 */
export const useChatSession = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    selectedClientId,
    selectedSessionId,
    setSelectedClient,
    setSelectedSession,
    resetToNewChat,
    messages,
    isStreaming,
    isSessionPending,
    isLoadingHistory,
    error,
    setError,
  } = useChatStore();

  // Query for chat sessions
  const {
    data: sessions,
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
    error: sessionsError,
  } = useChatSessionsQuery(selectedClientId);

  // Delete mutation
  const deleteSessionMutation = useDeleteChatSession();

  // Chat handler for sending messages
  const chatHandler = useChatHandler();

  /**
   * Select a client and reset the chat state.
   */
  const selectClient = useCallback((clientId: number | null) => {
    setSelectedClient(clientId);
  }, [setSelectedClient]);

  /**
   * Select a specific chat session.
   */
  const selectSession = useCallback((sessionId: number | null) => {
    setSelectedSession(sessionId);
  }, [setSelectedSession]);

  /**
   * Start a new chat - resets to empty state, session created on first message.
   */
  const startNewChat = useCallback(() => {
    resetToNewChat();
  }, [resetToNewChat]);

  /**
   * Delete a chat session with confirmation handled externally.
   */
  const deleteSession = useCallback(async (sessionId: number): Promise<boolean> => {
    if (!selectedClientId) {
      showToast({
        variant: 'error',
        message: 'No client selected',
      });
      return false;
    }

    const wasActive = sessionId === selectedSessionId;

    try {
      await deleteSessionMutation.mutateAsync({
        clientId: selectedClientId,
        chatSessionId: sessionId,
      });

      showToast({
        variant: 'success',
        message: 'Chat deleted successfully',
      });

      // If deleted the active chat, reset to new chat state
      if (wasActive) {
        resetToNewChat();
      }

      // Refetch sessions to update the list
      refetchSessions();

      return true;
    } catch (err) {
      console.error('Failed to delete chat:', err);
      showToast({
        variant: 'error',
        message: 'Failed to delete chat. Please try again.',
      });
      return false;
    }
  }, [
    selectedClientId,
    selectedSessionId,
    deleteSessionMutation,
    showToast,
    resetToNewChat,
    refetchSessions,
  ]);

  /**
   * Send a message. Auto-creates session if needed.
   */
  const sendMessage = useCallback(async (text: string, isTemplate: boolean = false) => {
    if (!selectedClientId) {
      showToast({
        variant: 'error',
        message: 'Please select a client first',
      });
      return;
    }

    try {
      await chatHandler.sendMessage(text, isTemplate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      showToast({
        variant: 'error',
        message: errorMessage,
      });
    }
  }, [selectedClientId, chatHandler, showToast]);

  /**
   * Refresh the chat titles list.
   */
  const refreshTitles = useCallback(async () => {
    await refetchSessions();
  }, [refetchSessions]);

  // Handle errors from sessions query
  useEffect(() => {
    if (sessionsError) {
      console.error('Error loading chat sessions:', sessionsError);
      // Don't show toast for 404 - just means no sessions yet
      if (!String(sessionsError).includes('404')) {
        showToast({
          variant: 'error',
          message: 'Failed to load chat history',
        });
      }
    }
  }, [sessionsError, showToast]);

  // Find current session info
  const currentSession = sessions?.find(
    (s) => s.chat_session_id === selectedSessionId
  );

  return {
    // State
    selectedClientId,
    selectedSessionId,
    sessions: sessions || [],
    currentSession,
    messages,

    // Loading states
    isLoadingSessions,
    isLoadingHistory,
    isStreaming,
    isSessionPending,
    isDeleting: deleteSessionMutation.isPending,

    // Error state
    error,

    // Actions
    selectClient,
    selectSession,
    startNewChat,
    deleteSession,
    sendMessage,
    refreshTitles,
    cancelStream: chatHandler.cancelStream,

    // Computed
    canSendMessage: !!selectedClientId,
    hasMessages: messages.length > 0,
    hasSessions: (sessions?.length || 0) > 0,
  };
};

export default useChatSession;
