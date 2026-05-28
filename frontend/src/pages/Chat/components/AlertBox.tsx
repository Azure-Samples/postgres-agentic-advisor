import React, { useState, useCallback } from 'react';
import { AlertTile } from '@/components';
import { useClientAlertsQuery } from '@/api/hooks/useAlertsQuery';
import { AlertBoxWrapper, AlertsContainer, ContainerTitleStyled } from '../Chat.styles';
import { AlertSummaryModal } from '@/features/alerts/AlertSummaryModal';
import type { Alert } from '@/api/types/alert.types';

interface AlertBoxProps {
  selectedClientId: number | null;
}

export const AlertBox: React.FC<AlertBoxProps> = ({ selectedClientId }) => {
  const { data: alerts = [], isLoading, error } = useClientAlertsQuery(selectedClientId);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const handleTileClick = useCallback((alert: Alert) => {
    setSelectedAlert(alert);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAlert(null);
  }, []);

  return (
    <AlertBoxWrapper>
      <ContainerTitleStyled>Recent Alerts</ContainerTitleStyled>
      <AlertsContainer>
        {isLoading ? (
          <div style={{ padding: '12px', color: '#666', fontSize: '12px' }}>Loading alerts...</div>
        ) : error ? (
          <div style={{ padding: '12px', color: '#d32f2f', fontSize: '12px' }}>Failed to load alerts</div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: '12px', color: '#666', fontSize: '12px' }}>No alerts for this client</div>
        ) : (
          alerts.map((alert) => (
            <AlertTile
              key={alert.id}
              id={String(alert.id)}
              trend={alert.trend}
              title={alert.alert_heading_1}
              subtitle={alert.alert_heading_2}
              companies={alert.companies}
              createdAt={alert.date}
              hideSummaryButton
              onClick={() => handleTileClick(alert)}
            />
          ))
        )}
      </AlertsContainer>

      <AlertSummaryModal
        alertId={selectedAlert?.id ? String(selectedAlert.id) : null}
        isOpen={!!selectedAlert}
        onClose={handleCloseModal}
        trend={selectedAlert?.trend}
      />
    </AlertBoxWrapper>
  );
};
