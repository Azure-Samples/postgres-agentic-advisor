import styled from 'styled-components';

export const TooltipWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  isolation: isolate;
`;

export const TooltipCard = styled.div`
  background: ${({ theme }) => theme.colors.black};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[3]};
  width: 217px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  box-shadow: 0 4px 16px ${({ theme }) => theme.colors.shadowOverlay};
  position: relative;
  z-index: 2;
`;

export const TooltipHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
`;

export const TooltipAvatar = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1.5px solid #efefef;
  background: ${({ $color }) => $color};
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: ${({ theme }) => theme.typography.fontSize.xxs};
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  line-height: 1;
  flex-shrink: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};

  > svg {
    width: 12px;
    height: 12px;
    display: block;
    flex-shrink: 0;
  }
`;

export const TooltipCompanyName = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TooltipDescription = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-style: italic;
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  width: 100%;
`;

export const TooltipDivider = styled.hr`
  border: none;
  border-top: 1px dashed rgba(255, 255, 255, 0.18);
  width: 100%;
  margin: 0;
`;

export const TooltipInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
  width: 100%;
`;

export const TooltipDateRow = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};

  strong {
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  }
`;

export const TooltipPerformanceRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

export const TooltipPerformanceValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};

  strong {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.white};
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  }
`;

export const TooltipAlertRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[1]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  flex: 1 0 0;
`;

export const TooltipTrendCircle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  min-width: 1em;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.trendUp};
  flex-shrink: 0;
  margin-top: 0.1em;
`;

export const TooltipArrow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: -${({ theme }) => theme.spacing[1.5]};
  flex-shrink: 0;
  position: relative;
  z-index: 1;
`;
