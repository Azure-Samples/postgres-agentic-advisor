import styled from 'styled-components';

export const ClientTooltipMetricRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[6]};
`;

export const ClientTooltipLabel = styled.span`
  color: rgba(255, 255, 255, 0.55);
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.4;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const ClientTooltipValue = styled.span<{ $positive?: boolean }>`
  color: ${({ $positive, theme }) =>
    $positive === undefined
      ? theme.colors.white
      : $positive
        ? theme.colors.trendUp
        : theme.colors.trendDown};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1.4;
`;

// ── Holdings pills ────────────────────────────────────────────────────────────

export const TooltipHoldingsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  justify-content: flex-end;
  max-width: 120px;
`;

export const TooltipHoldingPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  background: #3f3f3f;
  color: #ffffff;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: -0.24px;
  line-height: 1.27;
  white-space: nowrap;
  border-radius: 2px;
  flex-shrink: 0;
`;

export const TooltipOverflowPill = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  background: #555555;
  color: #ffffff;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: -0.24px;
  line-height: 1.27;
  white-space: nowrap;
  border-radius: 2px;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;

  &:hover {
    background: #6b6b6b;
  }
`;
