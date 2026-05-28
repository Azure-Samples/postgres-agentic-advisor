import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AlertsAPI } from '../endpoints/alerts';
import type { Alert, AlertSummary } from '../types/alert.types';
import { queryKeys } from '@/utils/queryKeys';
import { APP_CONFIG } from '@/constants/config';

const DEFAULT_DEBOUNCE_MS = 400;

/** Converts a local Date to 'YYYY-MM-DD' without UTC offset shift */
function localDateToString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Retry only on network failures, never on HTTP error responses (4xx/5xx) */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;
  if (axios.isAxiosError(error) && error.response) return false;
  return true;
}

/**
 * Fetches alerts for a given date, debouncing rapid changes.
 *
 * No caching is applied — alerts are always fetched fresh on every date change
 * because the backend runs a live workflow and cached results would be stale.
 * RQ's built-in signal cancels in-flight requests when the query is superseded.
 */
export const useAlertsQuery = (date: string | Date | null, debounceMs: number = DEFAULT_DEBOUNCE_MS) => {
  // Compute initial string synchronously so the first render fires immediately
  const [debouncedDate, setDebouncedDate] = useState<string | null>(() => {
    if (!date) return null;
    return typeof date === 'string' ? date : localDateToString(date);
  });

  useEffect(() => {
    if (!date) {
      setDebouncedDate(null);
      return;
    }
    const dateStr = typeof date === 'string' ? date : localDateToString(date);
    const timer = setTimeout(() => setDebouncedDate(dateStr), debounceMs);
    return () => clearTimeout(timer);
  }, [date, debounceMs]);

  const queryResult = useQuery<Alert[], Error>({
    queryKey: [queryKeys.alertsByDate, debouncedDate],
    queryFn: ({ signal }) => AlertsAPI.getAlertsByDate(debouncedDate!, APP_CONFIG.userId, signal),
    enabled: !!debouncedDate,
    staleTime: 0,  // never cache — always fetch fresh
    gcTime: 0,     // discard from memory immediately after the query becomes inactive
    retry: shouldRetry,
    retryDelay: 1000,
  });

  return {
    ...queryResult,
    retry: queryResult.refetch,
    isTimeoutError: queryResult.error?.message?.includes('timeout') ?? false,
  };
};

/**
 * Fetches the full AI-generated summary for a single alert.
 *
 * Results are cached per alertId — reopening the same alert within the session
 * uses cached data without a network round-trip.
 */
export const useAlertSummaryQuery = (alertId: number | null, simulatedDate?: string) =>
  useQuery<AlertSummary, Error>({
    queryKey: [queryKeys.alertSummary, alertId, simulatedDate ?? null],
    queryFn: ({ signal }) => AlertsAPI.getAlertSummary(alertId!, APP_CONFIG.userId, signal, simulatedDate),
    enabled: !!alertId,
    staleTime: 10 * 60 * 1000, // 10 minutes — summary content doesn't change during a session
    gcTime: 15 * 60 * 1000,
    retry: shouldRetry,
  });

/**
 * Fetches alerts for a specific client.
 *
 * Client selection is a deliberate user action so no debouncing is needed.
 * React Query handles caching and deduplication.
 */
export const useClientAlertsQuery = (clientId: number | null) =>
  useQuery<Alert[], Error>({
    queryKey: [queryKeys.alertsByClient, clientId],
    queryFn: ({ signal }) => AlertsAPI.getAlertsByClientId(clientId!, APP_CONFIG.userId, signal),
    enabled: !!clientId,
    staleTime: 10 * 60 * 1000, // 10 minutes — matches the alertsByDate staleTime
    gcTime: 30 * 60 * 1000,    // 30 minutes — survive a typical work session
    retry: shouldRetry,
  });

/**
 * Deletes an alert and removes it from the local list immediately.
 *
 * Because alertsByDate has no caching (staleTime: 0), we only need to update
 * the currently-rendered list in place so the deleted tile disappears without
 * waiting for a refetch. The individual alert summary is also evicted.
 */
/**
 * Fetches annotated markdown for a single alert source highlight.
 * Results are cached — first call generates, subsequent calls hit the DB.
 */
export const useAlertSourceHighlightQuery = (alertId: number | null, sourceId: number | null) =>
  useQuery<string, Error>({
    queryKey: [queryKeys.alertSourceHighlight, alertId, sourceId],
    queryFn: ({ signal }) => AlertsAPI.getAlertSourceHighlight(alertId!, sourceId!, APP_CONFIG.userId, signal),
    enabled: !!alertId && !!sourceId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: shouldRetry,
  });

export const useDeleteAlertMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { alertId: number; dateKey?: string | null; clientId?: number | null }>({
    mutationFn: ({ alertId }) => AlertsAPI.deleteAlert(alertId, APP_CONFIG.userId),
    onSuccess: (_data, { alertId, dateKey, clientId }) => {
      // Remove the deleted alert from the active date list so the tile disappears instantly
      if (dateKey) {
        queryClient.setQueryData<Alert[]>([queryKeys.alertsByDate, dateKey], (prev) =>
          prev ? prev.filter((a) => a.id !== alertId) : prev,
        );
      }
      // Remove from client-based list
      if (clientId != null) {
        queryClient.setQueryData<Alert[]>([queryKeys.alertsByClient, clientId], (prev) =>
          prev ? prev.filter((a) => a.id !== alertId) : prev,
        );
      }
      // Drop the individual summary — it is no longer valid
      queryClient.removeQueries({ queryKey: [queryKeys.alertSummary, alertId] });
    },
  });
};
