import React, { useState, useCallback } from 'react';
import { AlertTile, AlertTileSkeleton } from '@/components';
import { useAlertsQuery, useDeleteAlertMutation } from '@/api/hooks/useAlertsQuery';
import { WidgetErrorState } from '@/components/WidgetErrorState';
import type { Alert } from '@/api/types/alert.types';
import { AlertSummaryModal } from './AlertSummaryModal';
import { DeleteAlertModal } from './DeleteAlertModal';
import {
  AlertsListWrapper,
  AlertsScrollable,
  ViewAllLink,
  NoAlertsWrapper,
  NoAlertsSkeletonCard,
  NoAlertsSkeletonRow,
  NoAlertsSkeletonAvatar,
  NoAlertsSkeletonLines,
  NoAlertsTitle,
  NoAlertsSubtitle,
} from './AlertsList.styles';

const NoAlertsEmptyState: React.FC = () => (
  <NoAlertsWrapper>
    <NoAlertsSkeletonCard>
      <NoAlertsSkeletonAvatar />
      <NoAlertsSkeletonLines>
        <NoAlertsSkeletonRow $width="79px" />
        <NoAlertsSkeletonRow $width="100%" />
        <NoAlertsSkeletonRow $width="100%" />
      </NoAlertsSkeletonLines>
    </NoAlertsSkeletonCard>
    <NoAlertsSkeletonCard>
      <NoAlertsSkeletonAvatar />
      <NoAlertsSkeletonLines>
        <NoAlertsSkeletonRow $width="79px" />
        <NoAlertsSkeletonRow $width="100%" />
        <NoAlertsSkeletonRow $width="100%" />
      </NoAlertsSkeletonLines>
    </NoAlertsSkeletonCard>
    <NoAlertsSkeletonCard $faded>
      <NoAlertsSkeletonAvatar $faded />
      <NoAlertsSkeletonLines>
        <NoAlertsSkeletonRow $width="79px" />
        <NoAlertsSkeletonRow $width="100%" $faded />
        <NoAlertsSkeletonRow $width="100%" $faded />
      </NoAlertsSkeletonLines>
    </NoAlertsSkeletonCard>
    <div>
      <NoAlertsTitle>A Calm Day in the Market</NoAlertsTitle>
      <NoAlertsSubtitle>No major movements or highlights to report.</NoAlertsSubtitle>
    </div>
  </NoAlertsWrapper>
);

export interface AlertsListProps {
  /** The date to fetch alerts for. If null, displays empty state. */
  selectedDate?: Date | string | null;
}

/** Converts a local Date to 'YYYY-MM-DD' without UTC offset shift */
function toDateKey(date: Date | string): string {
  if (typeof date === 'string') return date;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * AlertsList Component
 *
 * Displays a list of alerts for a selected date.
 * Delegates all async concerns (debouncing, caching, retry, request cancellation)
 * to the `useAlertsQuery` hook. Supports inline deletion of alerts with
 * a confirmation dialog to prevent accidental removal.
 *
 * @param {AlertsListProps} props - Component props
 * @returns {React.ReactElement} Rendered alerts list with modals
 */
const AlertsList: React.FC<AlertsListProps> = ({ selectedDate }) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alertToDelete, setAlertToDelete] = useState<Alert | null>(null);

  const {
    data: allAlerts = [],
    isLoading,
    isFetching,
    error,
    retry,
    isTimeoutError = false,
  } = useAlertsQuery(selectedDate ?? null);

  // Sort: Daniel Reed alerts first, then everyone else. No limit — all alerts are rendered;
  // the parent card handles the scroll viewport.
  const alerts = allAlerts.sort((a, b) => {
    const aIsDaniel = a.client_name?.toLowerCase() === 'daniel reed' ? 0 : 1;
    const bIsDaniel = b.client_name?.toLowerCase() === 'daniel reed' ? 0 : 1;
    return aIsDaniel - bIsDaniel;
  });
  const { mutate: deleteAlert, isPending: isDeleting } = useDeleteAlertMutation();

  const handleSummaryClick = useCallback((alert: Alert) => {
    setSelectedAlert(alert);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAlert(null);
  }, []);

  const handleDeleteClick = useCallback((alert: Alert) => {
    setAlertToDelete(alert);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setAlertToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!alertToDelete) return;

    const dateKey = selectedDate ? toDateKey(selectedDate) : undefined;

    deleteAlert(
      { alertId: alertToDelete.id, dateKey },
      {
        onSuccess: () => {
          setAlertToDelete(null);
        },
      },
    );
  }, [alertToDelete, selectedDate, deleteAlert]);

  return (
    <AlertsListWrapper>
      <AlertsScrollable>
        {isLoading || isFetching ? (
          <AlertTileSkeleton count={3} />
        ) : error ? (
          <WidgetErrorState onRetry={retry} />
        ) : allAlerts.length === 0 ? (
          <NoAlertsEmptyState />
        ) : (
          alerts.map((alert) => (
            <AlertTile
              key={alert.id}
              id={String(alert.id)}
              trend={alert.trend}
              clientName={alert.client_name}
              title={alert.alert_heading_1}
              subtitle={alert.alert_heading_2}
              companies={alert.companies ?? []}
              createdAt={alert.date}
              onClick={() => handleSummaryClick(alert)}
              onSummaryClick={() => handleSummaryClick(alert)}
              onDeleteClick={() => handleDeleteClick(alert)}
              disableHover
            />
          ))
        )}
      </AlertsScrollable>

      <AlertSummaryModal
        alertId={selectedAlert?.id ? String(selectedAlert.id) : null}
        isOpen={!!selectedAlert}
        onClose={handleCloseModal}
        trend={selectedAlert?.trend}
        simulatedDate={selectedDate ? String(selectedDate) : undefined}
      />

      <DeleteAlertModal
        isOpen={!!alertToDelete}
        clientName={alertToDelete?.client_name}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
      />
    </AlertsListWrapper>
  );
};

export { AlertsList };
