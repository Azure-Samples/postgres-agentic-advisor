import { axiosClient } from '../client/axiosClient';
import { formatDateToYYYYMMDD } from '@/utils/dateUtils';
import type { Alert, AlertSummary, GetAlertsResponse, SuggestedResponse } from '../types/alert.types';

/**
 * API client for managing alert-related operations and data retrieval.
 *
 * @remarks
 * This API client provides methods for interacting with the alerts service,
 * handling advisor-specific alert data retrieval. It supports:
 * - User-specific alert retrieval with proper authentication headers
 * - Date-based alert filtering for dashboard view
 * - Client-specific alert filtering for chat view
 * - Proper error handling and timeout management
 * - Request cancellation for concurrent requests
 */
export const AlertsAPI = {
  /**
   * Fetches all alerts for a specific date across all clients.
   *
   * @param {string | Date} date - The date to fetch alerts for (YYYY-MM-DD format or Date object)
   * @param {number} userId - The unique identifier of the advisor user
   * @param {AbortSignal} [signal] - Optional AbortSignal for canceling the request
   * @returns {Promise<Alert[]>} A promise resolving to an array of alert objects
   *
   * @remarks
   * This method retrieves all alerts for a given date, which is used primarily
   * in the dashboard view. The API endpoint is relatively slow (~60 seconds)
   * and should be managed with proper loading states and timeout handling.
   *
   * Request behavior:
   * - Sends POST request with body: { "date": "YYYY-MM-DD" }
   * - Includes X-User-Id header for authentication
   * - Supports optional X-Simulated-Date header (if app already supports it)
   * - Returns paginated response with alerts array
   * - Implements automatic timeout at 90 seconds
   *
   * Error handling:
   * - Network errors are propagated to caller
   * - Timeout errors should be handled with user-friendly messaging
   * - Canceled requests (AbortController) are silently ignored
   *
   * @example
   * ```typescript
   * // Fetch alerts for today
   * const alerts = await AlertsAPI.getAlertsByDate('2025-06-27', 123);
   * console.log(`Found ${alerts.length} alerts`);
   *
   * // Cancel in-flight request
   * const controller = new AbortController();
   * try {
   *   const alerts = await AlertsAPI.getAlertsByDate('2025-06-27', 123, controller.signal);
   * } catch (error) {
   *   if (error.name === 'AbortError') console.log('Request canceled');
   * }
   * ```
   */
  getAlertsByDate: async (
    date: string | Date,
    userId: number,
    signal?: AbortSignal,
  ): Promise<Alert[]> => {
    const formattedDate = formatDateToYYYYMMDD(date);

    const config = {
      headers: {
        'X-User-Id': userId,
        // X-Simulated-Date can be added if the app supports it
      },
      signal,
    };

    const { data } = await axiosClient.post<GetAlertsResponse>(
      '/alerts/all',
      { date: formattedDate },
      config,
    );
    return data.alerts || [];
  },

  /**
   * Fetches all alerts for a specific client.
   *
   * @param {number} clientId - The unique identifier of the client
   * @param {number} userId - The unique identifier of the advisor user
   * @param {AbortSignal} [signal] - Optional AbortSignal for canceling the request
   * @returns {Promise<Alert[]>} A promise resolving to an array of alert objects
   *
   * @remarks
   * This method retrieves all alerts associated with a specific client,
   * which is used primarily in the chat interface. It's generally faster
   * than the date-based query and does not have as strict timeout requirements.
   *
   * Request behavior:
   * - Sends GET request with query parameter: client_id=<id>
   * - Includes X-User-Id header for authentication
   * - Response shape is identical to getAlertsByDate
   * - Returns paginated response with alerts array
   *
   * Error handling:
   * - Network errors are propagated to caller
   * - Canceled requests (AbortController) are silently ignored
   * - Empty results return an empty array
   *
   * @example
   * ```typescript
   * // Fetch alerts for a specific client
   * const alerts = await AlertsAPI.getAlertsByClientId(456, 123);
   * console.log(`Found ${alerts.length} alerts for this client`);
   * ```
   */
  getAlertsByClientId: async (
    clientId: number,
    userId: number,
    signal?: AbortSignal,
  ): Promise<Alert[]> => {
    const config = {
      headers: {
        'X-User-Id': userId,
      },
      params: {
        client_id: clientId,
      },
      signal,
    };

    const { data } = await axiosClient.get<GetAlertsResponse>(
      '/alerts/all',
      config,
    );
    return data.alerts || [];
  },

  /**
   * Fetches the full AI-generated summary for a single alert.
   *
   * @param {number} alertId - The unique identifier of the alert
   * @param {number} userId - The unique identifier of the advisor user
   * @param {AbortSignal} [signal] - Optional AbortSignal for canceling the request
   * @returns {Promise<AlertSummary>} A promise resolving to the alert summary object
   */
  getAlertSummary: async (
    alertId: number,
    userId: number,
    signal?: AbortSignal,
    simulatedDate?: string,
  ): Promise<AlertSummary> => {
    const { data } = await axiosClient.get<AlertSummary>(`/alerts/${alertId}`, {
      headers: {
        'X-User-Id': userId,
        ...(simulatedDate ? { 'X-Simulated-Date': simulatedDate } : {}),
      },
      signal,
    });
    return data;
  },

  /**
   * Edits an existing suggested response using an AI agent based on the user's query.
   *
   * @param {number} suggestedResponseId - The ID of the suggested response to edit
   * @param {string} userQuery - The user's instruction for how to edit the response
   * @param {AbortSignal} [signal] - Optional AbortSignal for canceling the request
   * @returns {Promise<SuggestedResponse[]>} All suggested responses for the alert, including the new edited one
   *
   * @remarks
   * Sends the user's freeform editing instruction to the AI agent, which rewrites
   * the specified suggested response accordingly. The full updated list of suggested
   * responses for the parent alert is returned so the caller can replace its local
   * state in one step without an additional fetch.
   *
   * @example
   * ```typescript
   * const updated = await AlertsAPI.editSuggestedResponse(42, 'Make it more concise');
   * console.log(`Now have ${updated.length} suggested responses`);
   * ```
   */
  editSuggestedResponse: async (
    suggestedResponseId: number,
    userQuery: string,
    signal?: AbortSignal,
  ): Promise<SuggestedResponse[]> => {
    const { data } = await axiosClient.post<SuggestedResponse[]>(
      `/alerts/suggested_response/${suggestedResponseId}/edit`,
      { user_query: userQuery },
      { signal },
    );
    return data;
  },

  /**
   * Permanently deletes an alert by ID.
   *
   * @param {number} alertId - The unique identifier of the alert to delete
   * @param {number} userId - The unique identifier of the advisor user
   * @returns {Promise<void>}
   *
   * @remarks
   * This is a destructive operation — the alert cannot be recovered after deletion.
   * The caller is responsible for confirming with the user before invoking this method.
   */
  deleteAlert: async (alertId: number, userId: number): Promise<void> => {
    await axiosClient.delete(`/alerts/${alertId}`, {
      headers: { 'X-User-Id': userId },
    });
  },

  /**
   * Fetches annotated markdown for a source document with reference sentences highlighted.
   * Generated and cached on first call; returned from DB on subsequent calls.
   */
  getAlertSourceHighlight: async (
    alertId: number,
    sourceId: number,
    userId: number,
    signal?: AbortSignal,
  ): Promise<string> => {
    const { data } = await axiosClient.get<{ annotated_markdown: string }>(
      `/alerts/${alertId}/sources/${sourceId}`,
      { headers: { 'X-User-Id': userId }, signal },
    );
    return data.annotated_markdown;
  },
};

export default AlertsAPI;
