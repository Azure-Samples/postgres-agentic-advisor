import { useMutation } from '@tanstack/react-query';
import { CompletionsAPI } from '../endpoints/completions';
import { queryKeys } from '../../utils/queryKeys';
import { StreamCompletionRequest, CompletionResponse } from '../types/completion.types';

/**
 * Custom hook for handling AI completion requests with streaming support.
 *
 * @returns {UseMutationResult<CompletionResponse, unknown, StreamCompletionRequest>} 
 *   A React Query mutation object for managing completion requests.
 *
 * @remarks
 * This hook provides a React Query mutation for interacting with the AI completion API:
 * - Handles streaming chat completions from the AI service
 * - Manages loading, error, and success states automatically
 * - Integrates with React Query's caching and invalidation system
 * - Uses optimized mutation keys for proper request deduplication
 * 
 * The hook is specifically designed for streaming AI responses, allowing
 * real-time updates as the AI generates content. This enables responsive
 * user interfaces that show progress during longer AI operations.
 * 
 * Usage patterns:
 * - Call mutate() or mutateAsync() to trigger a completion request
 * - Access loading state via isLoading or isPending
 * - Handle errors through the error property and onError callback
 * - Process successful responses via onSuccess callback or data property
 * 
 * The underlying API call supports streaming protocols for efficient
 * handling of large AI-generated responses without blocking the UI.
 *
 * @example
 * ```tsx
 * const completion = useCompletion();
 * 
 * const handleSendMessage = (message: string) => {
 *   completion.mutate({
 *     messages: [{ role: 'user', content: message }],
 *     stream: true
 *   }, {
 *     onSuccess: (response) => {
 *       console.log('AI response:', response);
 *     }
 *   });
 * };
 * ```
 */
export const useCompletion = () =>
  useMutation<CompletionResponse, unknown, StreamCompletionRequest>({
    mutationKey: [queryKeys.completion],
    mutationFn: (payload) => CompletionsAPI.streamChat(payload),
  });

export default useCompletion;
