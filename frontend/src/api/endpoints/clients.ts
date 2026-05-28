import { axiosClient } from '../client/axiosClient';
import type {
  Client,
  ClientsResponse,
  PortfolioMetrics,
  ClientsListResponse,
  ClientsListParams,
} from '../types/client.types';

/**
 * API client for managing client-related operations and data retrieval.
 *
 * @remarks
 * This API client provides methods for interacting with the clients service,
 * handling advisor-specific client data management. It supports:
 * - User-specific client retrieval with proper authentication headers
 * - Paginated response handling and data extraction
 * - Type-safe client data operations
 */
export const ClientsAPI = {
  /**
   * Fetches all clients associated with a specific advisor user.
   *
   * @param {number} userId - The unique identifier of the advisor user.
   * @returns {Promise<Client[]>} A promise resolving to an array of client objects.
   *
   * @remarks
   * This method retrieves the complete list of clients for an advisor with:
   * - User authentication via X-User-Id header
   * - Automatic extraction from paginated response structure
   * - Fallback to empty array if no clients found
   * - Type-safe response handling
   *
   * The API endpoint returns paginated data, but this method extracts
   * and returns only the clients array for simplified consumption.
   *
   * Authentication is handled through request headers, ensuring that
   * clients are properly isolated per advisor user.
   *
   * @example
   * ```typescript
   * const clients = await ClientsAPI.getClients(123);
   * console.log(`Found ${clients.length} clients`);
   * ```
   */
  getClients: async (userId: number): Promise<Client[]> => {
    const config: any = {
      headers: {
        'X-User-Id': userId,
      },
    };
    const { data } = await axiosClient.get<ClientsResponse>('/clients/', config);
    // Extract clients array from paginated response
    return data.clients || [];
  },

  getRiskProfile: async (clientId: number, userId: number): Promise<string | null> => {
    const config: any = {
      headers: {
        'X-User-Id': userId,
      },
    };
    const { data } = await axiosClient.get<{ risk_profile: string | null }>(
      `/clients/${clientId}/risk-profile`,
      config,
    );
    return data.risk_profile ?? null;
  },

  getPortfolioMetrics: async (
    clientId: number,
    userId: number,
    referenceDate?: string,
  ): Promise<PortfolioMetrics> => {
    const { data } = await axiosClient.get<PortfolioMetrics>(
      `/clients/${clientId}/portfolio-metrics`,
      {
        headers: {
          'X-User-Id': userId,
          ...(referenceDate ? { 'X-Simulated-Date': referenceDate } : {}),
        },
      },
    );
    return data;
  },

  /**
   * Fetches a paginated, filtered, and sorted list of clients with portfolio metrics.
   *
   * Maps to: GET /clients/list
   *
   * @param params - Pagination, filter, sort, and search query parameters.
   * @param userId - Advisor user ID passed via X-User-Id header.
   * @param signal - Optional AbortSignal for request cancellation.
   */
  getClientsList: async (
    params: ClientsListParams,
    userId: number,
    signal?: AbortSignal,
    simulatedDate?: string,
  ): Promise<ClientsListResponse> => {
    const { data } = await axiosClient.get<ClientsListResponse>('/clients/list', {
      headers: {
        'X-User-Id': userId,
        ...(simulatedDate ? { 'X-Simulated-Date': simulatedDate } : {}),
      },
      params,
      signal,
    });
    return data;
  },
};

export default ClientsAPI;
