/**
 * Centralized query key constants for React Query cache management.
 *
 * @remarks
 * This object provides standardized query keys used throughout the application
 * for React Query caching, invalidation, and state management. Using consistent
 * query keys ensures proper cache behavior and prevents key collision issues.
 *
 * Query keys are used for:
 * - Identifying cached data in React Query
 * - Cache invalidation when data changes
 * - Optimistic updates and rollbacks
 * - Query deduplication and sharing
 *
 * Best practices:
 * - Use these constants instead of string literals in hooks
 * - Combine with additional parameters for specific queries
 * - Keep keys descriptive and unique across the application
 *
 * @example
 * ```typescript
 * // In useQuery hooks
 * const { data } = useQuery({
 *   queryKey: [queryKeys.chatHistory, userId],
 *   queryFn: () => fetchChatHistory(userId)
 * });
 *
 * // For cache invalidation
 * queryClient.invalidateQueries({ queryKey: [queryKeys.completion] });
 * ```
 */
export const queryKeys = {
  /** Query key for chat history data operations */
  chatHistory: 'chatHistory',
  /** Query key for chat sessions list */
  chatSessions: 'chatSessions',
  /** Query key for per-turn chat agents graph */
  chatAgentsGraph: 'chatAgentsGraph',
  /** Query key for AI completion requests and responses */
  completion: 'completion',
  /** Query key for chat titles */
  chatTitles: 'chatTitles',
  /** Query key for clients list */
  clients: 'clients',
  /** Query key for alerts by date */
  alertsByDate: 'alertsByDate',
  /** Query key for alerts by client */
  alertsByClient: 'alertsByClient',
  /** Query key for a single alert summary */
  alertSummary: 'alertSummary',
  /** Query key for dashboard sector trends */
  sectorTrends: 'sectorTrends',
  /** Query key for all-clients chat list */
  allClientChats: 'allClientChats',
  /** Query key for upcoming earnings widget */
  upcomingEarnings: 'upcomingEarnings',
  /** Query key for dashboard clients widget */
  dashboardClients: 'dashboardClients',
  /** Query key for upcoming meetings widget */
  upcomingMeetings: 'upcomingMeetings',
  /** Query key for client risk profile from advisor memory */
  clientRiskProfile: 'clientRiskProfile',
  /** Query key for a single alert source highlight (annotated markdown) */
  alertSourceHighlight: 'alertSourceHighlight',
};

export default queryKeys;
