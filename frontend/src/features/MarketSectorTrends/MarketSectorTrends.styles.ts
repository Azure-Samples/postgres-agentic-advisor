import styled, { keyframes } from 'styled-components';

const fadeSlideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const SectorTrendsContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[4]};
  flex: 1 1 0;
  min-width: 0;
  height: 512px;
  overflow: hidden;
  animation: ${fadeSlideUp} 0.4s ease-out;
`;

export const SectorTrendsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-shrink: 0;
`;

export const SectorTrendsTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 24px;
`;

export const LastDaysChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  height: 32px;
  padding: 6px 12px 6px 8px;
  flex-shrink: 0;
  cursor: default;

  .anticon {
    display: flex;
    align-items: center;
    line-height: 1;
  }
`;

export const LastDaysChipText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.contentTertiary};
  white-space: nowrap;
  line-height: 18px;
`;

export const ChartWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const LegendList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0;
  width: 100%;
  list-style: none;
  margin: 0 0 ${({ theme }) => theme.spacing[3]} 0;
  padding: 0 8px;
`;

export const LegendItem = styled.li`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
`;

export const LegendDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1px solid white;
  background-color: ${({ color }) => color};
  flex-shrink: 0;
`;

export const LegendLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 14px;
  font-weight: 500;
  font-style: normal;
  color: rgba(0, 0, 0, 0.7);
  white-space: nowrap;
`;

export const CalendarIconWrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.contentTertiary};
`;

export const ChartArea = styled.div`
  flex: 1;
  min-height: 0;
  height: 100%;
  position: relative;
  overflow: visible;
`;

/* Flex row that holds the rotated Y-axis label + the chart side-by-side */
export const ChartRow = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  align-items: stretch;
  width: 100%;
`;

/* 15 px-wide column that centres the rotated label vertically */
export const YAxisLabelWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  flex-shrink: 0;
`;

export const YAxisLabel = styled.span`
  color: #617692;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  white-space: nowrap;
  transform: rotate(-90deg);
  pointer-events: none;
`;

export const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.contentTertiary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const ErrorWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;
