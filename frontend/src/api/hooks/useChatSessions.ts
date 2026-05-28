import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CompletionsAPI } from '../endpoints/completions';
import { queryKeys } from '@/utils/queryKeys';
import { APP_CONFIG } from '@/constants/config';
import type { ChatSession, ChatSessionCreateResponse, AllClientChat } from '../types/completion.types';

/**
 * Custom hook for fetching chat session titles for a specific client.
 *
 * @param {number | null} clientId - The client ID to fetch sessions for.
 * @returns React Query result containing chat sessions array.
 *
 * @remarks
 * This hook fetches all chat sessions (titles) for a given client from the API.
 * It enables users to see their conversation history with that client and
 * select a session to continue or create a new one.
 *
 * @example
 * ```tsx
 * const { data: sessions, isLoading } = useChatSessionsQuery(clientId);
 * ```
 */
export const useChatSessionsQuery = (clientId: number | null) => {
  return useQuery<ChatSession[], Error>({
    queryKey: [queryKeys.chatSessions, clientId],
    queryFn: async () => {
      if (!clientId) return [];
      try {
        const result = await CompletionsAPI.getChatTitles(clientId, {
          'X-User-Id': APP_CONFIG.userId,
        });
        // Ensure we always return an array
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
        return [];
      }
    },
    enabled: !!clientId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2, // Retry failed requests 2 times
    retryDelay: 1000, // Wait 1 second between retries
    // Ensure data is always an array even if the API returns something unexpected
    select: (data) => Array.isArray(data) ? data : [],
  });
};

/**
 * Custom hook for deleting a chat session's history.
 *
 * @returns React Query mutation for deleting chat history.
 *
 * @remarks
 * This mutation deletes the chat history for a specific session.
 * Upon success, it invalidates both the chat sessions and chat history queries.
 *
 * @example
 * ```tsx
 * const deleteSession = useDeleteChatSession();
 * const handleDelete = async () => {
 *   await deleteSession.mutateAsync({ clientId, chatSessionId });
 * };
 * ```
 */
/**
 * Custom hook for creating a new chat session.
 */
export const useCreateChatSession = () => {
  return useMutation<ChatSessionCreateResponse, Error, number>({
    mutationFn: async (clientId: number) => {
      return CompletionsAPI.createChatSession(clientId, {
        'X-User-Id': APP_CONFIG.userId,
      });
    },
  });
};

export const useDeleteChatSession = () => {
  const queryClient = useQueryClient();
  return useMutation<
    string,
    Error,
    { clientId: number; chatSessionId: number }
  >({
    mutationFn: async ({ clientId, chatSessionId }) => {
      return CompletionsAPI.deleteHistory(clientId, chatSessionId, {
        'X-User-Id': APP_CONFIG.userId,
      });
    },
    onSuccess: (_data, { clientId, chatSessionId }) => {
      // Invalidate chat sessions query
      queryClient.invalidateQueries({
        queryKey: [queryKeys.chatSessions, clientId],
      });
      // Invalidate specific chat history
      queryClient.invalidateQueries({
        queryKey: [queryKeys.chatHistory, clientId, chatSessionId],
      });
      // Invalidate unified all-client chats list used in the drawer history view
      queryClient.invalidateQueries({
        queryKey: [queryKeys.allClientChats],
      });
    },
  });
};

export const useUpdateChatTitle = () => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, { clientId: number; chatSessionId: number; newTitle: string }>({
    mutationFn: ({ clientId, chatSessionId, newTitle }) =>
      CompletionsAPI.updateChatTitle(chatSessionId, clientId, newTitle),
    onSuccess: (_data, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.chatSessions, clientId] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.allClientChats] });
    },
  });
};

export default useChatSessionsQuery;

/**
 * Custom hook for fetching chat sessions across ALL clients for the advisor.
 * Used in the chat history drawer to display a unified, filterable chat list.
 *
 * @returns React Query result containing the flat list of all client chats.
 */
export const useAllClientChatsQuery = () => {
  return useQuery<AllClientChat[], Error>({
    queryKey: [queryKeys.allClientChats],
    queryFn: async () => {
      try {
        return await CompletionsAPI.getAllClientChats({ 'X-User-Id': APP_CONFIG.userId });
      } catch (error) {
        console.error('Error fetching all client chats:', error);
        return [];
      }
    },
    staleTime: 30_000,
    retry: 2,
    retryDelay: 1000,
    select: (data) => (Array.isArray(data) ? data : []),
  });
};
