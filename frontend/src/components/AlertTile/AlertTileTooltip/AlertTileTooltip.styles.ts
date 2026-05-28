import styled from 'styled-components';

interface TooltipWrapperProps {
  $x: number;
  $y: number;
}

export const TooltipWrapper = styled.div<TooltipWrapperProps>`
  position: fixed;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: ${({ theme }) => theme.zIndex.portalTooltip};
`;

export const TooltipCard = styled.div`
  background: ${({ theme }) => theme.colors.tooltipBg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[3]};
  min-width: 160px;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
  position: relative;
  z-index: 2;
`;

export const TooltipHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const TooltipAvatar = styled.div<{ $color?: string }>`
  width: 18px;
  height: 18px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1.5px solid #efefef;
  background: ${({ $color, theme }) => $color ?? theme.colors.accentPurple};
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  line-height: 0;

  > svg {
    width: 11px;
    height: 11px;
    display: block;
    flex-shrink: 0;
    transform: translateZ(0);
  }
`;

export const TooltipCompanyName = styled.span`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  word-break: break-word;
`;

export const TooltipDescription = styled.span`
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-style: italic;
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  line-height: ${({ theme }) => theme.typography.lineHeight.description};
`;

export const TooltipDivider = styled.hr`
  border: none;
  border-top: 1px dashed rgba(255, 255, 255, 0.18);
  width: 100%;
  margin: 0;
`;

export const TooltipArrow = styled.div`
  position: relative;
  z-index: 1;
  margin-top: -${({ theme }) => theme.spacing[1.5]};
  line-height: 0;
`;
