import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ClientsAPI } from '../endpoints/clients';
import type { Client, PortfolioMetrics, ClientsListParams, ClientsListResponse } from '../types/client.types';
import { ADVISOR_USER_ID } from '@/constants/config';
import { queryKeys } from '@/utils/queryKeys';

/**
 * Custom hook for fetching and caching client data for the current advisor.
 *
 * @returns {UseQueryResult<Client[], unknown>} A React Query result object containing client data and query state.
 *
 * @remarks
 * This hook provides optimized client data fetching with:
 * - Automatic caching with 5-minute stale time for performance
 * - Retry logic (up to 2 attempts) for resilient error handling
 * - User-specific data isolation using ADVISOR_USER_ID
 * - Background refetching to keep data current
 * - Automatic loading and error state management
 *
 * Cache behavior:
 * - Data remains "fresh" for 5 minutes before background refetch
 * - Failed requests are retried automatically (max 2 attempts)
 * - Query key includes user ID for proper data isolation
 * - Supports manual refetching via refetch() method
 *
 * The hook fetches all clients associated with the current advisor user,
 * enabling client selection and management throughout the application.
 * This data is typically used in:
 * - Client selection dropdowns
 * - Client dashboard displays
 * - Client-specific filtering and routing
 *
 * Error handling is managed by React Query, providing consistent
 * error states and retry mechanisms across the application.
 *
 * @example
 * ```tsx
 * const ClientsList = () => {
 *   const { data: clients, isLoading, error } = useClientsQuery();
 *
 *   if (isLoading) return <Loader />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <div>
 *       {clients?.map(client => (
 *         <ClientTile key={client.id} client={client} />
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */
export const useClientsQuery = () => {
  return useQuery<Client[]>({
    queryKey: ['clients', ADVISOR_USER_ID],
    queryFn: () => ClientsAPI.getClients(ADVISOR_USER_ID),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Fetches and caches the risk profile label for a specific client from advisor memory.
 * Returns null if no risk profile has been saved yet.
 * Refetch is triggered automatically when memory_saved events invalidate this query.
 */
export const useClientRiskProfile = (clientId: number | null) => {
  return useQuery<string | null>({
    queryKey: [queryKeys.clientRiskProfile, clientId],
    queryFn: () => ClientsAPI.getRiskProfile(clientId!, ADVISOR_USER_ID),
    enabled: clientId != null,
    staleTime: 0, // always refetch when invalidated
    retry: 1,
  });
};

export const useClientPortfolioMetrics = (clientId: number | null, referenceDate?: string) => {
  return useQuery<PortfolioMetrics>({
    queryKey: ['clientPortfolioMetrics', clientId, referenceDate ?? null],
    queryFn: () => ClientsAPI.getPortfolioMetrics(clientId!, ADVISOR_USER_ID, referenceDate),
    enabled: clientId != null,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Fetches a paginated, filtered, sorted, and searchable list of clients with
 * portfolio metrics from GET /clients/list.
 *
 * Features:
 * - Keeps previous page data visible while the next page loads (`placeholderData`)
 * - 5-minute stale time; 10-minute garbage-collect window
 * - Cache key includes all params so each unique combination is cached separately
 * - Supports request cancellation via AbortSignal
 *
 * @param params - Page, page size, filter, sort, and search parameters.
 */
export const useClientsListQuery = (params: ClientsListParams = {}, simulatedDate?: string) => {
  return useQuery<ClientsListResponse>({
    queryKey: [queryKeys.clients, 'list', params, ADVISOR_USER_ID, simulatedDate ?? null],
    queryFn: ({ signal }) => ClientsAPI.getClientsList(params, ADVISOR_USER_ID, signal, simulatedDate),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    placeholderData: keepPreviousData,
  });
};

export default useClientsQuery;
