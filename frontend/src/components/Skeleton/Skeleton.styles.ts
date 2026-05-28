import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

export const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.neutralGray} 25%,
    ${({ theme }) => theme.colors.coolGray} 50%,
    ${({ theme }) => theme.colors.neutralGray} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

export const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[2]} 0;
`;

export const SkeletonChatItem = styled(SkeletonBase)`
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

export const SkeletonMessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]};
`;

export const SkeletonUserMessage = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SkeletonUserBubble = styled(SkeletonBase)`
  width: 60%;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

export const SkeletonAssistantMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const SkeletonAssistantLine = styled(SkeletonBase)<{ $width?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: 16px;
`;
// ----- Generic shimmer skeleton tile -----
export const PulseSkeletonItem = styled(SkeletonBase)`
  height: 80px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.neutralGray} 25%,
    ${({ theme }) => theme.colors.coolGray} 50%,
    ${({ theme }) => theme.colors.neutralGray} 75%
  );
  background-size: 200% 100%;
`;

// ----- Alert tile skeleton -----
export const AlertSkeletonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: ${({ theme }) => theme.border.light};
  box-shadow: 0 2px 4px 0 hsla(194, 92%, 30%, 0.15);
  background-color: ${({ theme }) => theme.colors.white};
  padding: 14px ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[3]};
  width: 100%;
  height: 118px;
  align-items: flex-start;
  box-sizing: border-box;
  flex-shrink: 0;
`;

export const AlertSkeletonAvatar = styled(SkeletonBase)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const AlertSkeletonBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  min-width: 0;
`;

/* Mirrors RowWrapper + ClientTitleWrapper — vertical stack of chip / title / subtitle */
export const AlertSkeletonRowGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

/* Chip (client name) — 24px matches the sm Chip height */
export const AlertSkeletonTitle = styled(SkeletonBase)`
  width: 80px;
  height: 24px;
  border-radius: 3px;
  flex-shrink: 0;
`;

/* Title text line — 18px = base(16px) × lineHeight.snug(1.14) */
export const AlertSkeletonTag = styled(SkeletonBase)`
  width: 70%;
  height: 18px;
  border-radius: 200px;
`;

/* Subtitle text line — 17px = smPlus(15px) × lineHeight.snug(1.14) */
export const AlertSkeletonDescription = styled(SkeletonBase)`
  width: 50%;
  height: 17px;
  border-radius: 200px;
`;

/* "View Summary" button area — ~22px matches antd text button sm height */
export const AlertSkeletonLabel = styled(SkeletonBase)`
  width: 70px;
  height: 22px;
  border-radius: 200px;
`;

// ----- Bar chart card skeleton -----
export const BarChartSkeletonCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.white};
  padding: 24px;
  height: 500px;
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
`;

export const BarChartSkeletonHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-shrink: 0;
`;

export const BarChartSkeletonChip = styled(SkeletonBase)`
  width: 103px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
`;

export const BarChartSkeletonTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 24px;
`;

export const BarChartSkeletonBody = styled.div`
  margin-top: ${({ theme }) => theme.spacing[6]};
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

export const BarChartSkeletonMainChart = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
`;

export const BarChartSkeletonYAxis = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: 6px 4px;
  flex-shrink: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
`;

export const BarChartSkeletonPlotArea = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;
`;

export const BarChartSkeletonGridArea = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  border-bottom: 1px solid #d9d9dd;
`;

export const BarChartSkeletonHLines = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px 0;
  pointer-events: none;
`;

export const BarChartSkeletonHLine = styled.div`
  width: 100%;
  height: 1px;
  background: transparent;
  border-top: 1px dashed rgba(214, 219, 237, 0.8);
`;

export const BarChartSkeletonBarGroups = styled.div`
  position: absolute;
  inset: 6px 0 7px 0;
  display: flex;
  align-items: stretch;
`;

export const BarChartSkeletonBarGroup = styled.div`
  flex: 1;
  display: flex;
  gap: 2px;
  padding: 0 23px;
`;

export const BarChartSkeletonBar = styled.div`
  flex: 1;
  background: rgba(214, 219, 237, 0.4);
  opacity: 0.8;
`;

export const BarChartSkeletonXAxis = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 28px 0 46px;
  flex-shrink: 0;
`;

export const BarChartSkeletonXLabel = styled(SkeletonBase)`
  width: 56px;
  height: 8px;
  border-radius: 200px;
`;

export const BarChartSkeletonLegend = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 8px;
  width: 100%;
  list-style: none;
  margin: ${({ theme }) => theme.spacing[3]} 0 0 0;
  padding: 0;
`;

export const BarChartSkeletonLegendItem = styled.li`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
`;

export const BarChartSkeletonLegendDot = styled.div`
  width: 8px;
  height: 8px;
  background: #d9d9dd;
  border: 1px solid ${({ theme }) => theme.colors.white};
  flex-shrink: 0;
`;

export const BarChartSkeletonLegendLabel = styled(SkeletonBase)`
  width: 56px;
  height: 8px;
  border-radius: 200px;
`;

// ----- Line/area chart skeleton -----

export const LineChartSkeletonCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[4]};
  height: 512px;
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
`;

export const LineChartSkeletonHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-shrink: 0;
`;

export const LineChartSkeletonTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 24px;
`;

export const LineChartSkeletonChip = styled(SkeletonBase)`
  width: 103px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
`;

export const LineChartSkeletonBody = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

export const LineChartSkeletonLegend = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  padding: 0 8px;
`;

export const LineChartSkeletonLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
`;

export const LineChartSkeletonLegendDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d9d9dd;
  flex-shrink: 0;
`;

export const LineChartSkeletonLegendLabel = styled(SkeletonBase)`
  width: 70px;
  height: 8px;
  border-radius: 200px;
`;

export const LineChartSkeletonChartArea = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const LineChartSkeletonXAxis = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 30px 0 50px;
  flex-shrink: 0;
`;

export const LineChartSkeletonXLabel = styled(SkeletonBase)`
  width: 56px;
  height: 8px;
  border-radius: 200px;
`;

// ----- Generic empty-state -----
export const EmptyStateContainer = styled.div`
  padding: ${({ theme }) => theme.spacing[10]} ${({ theme }) => theme.spacing[6]};
  text-align: center;
`;

export const EmptyStateText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentTertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;
