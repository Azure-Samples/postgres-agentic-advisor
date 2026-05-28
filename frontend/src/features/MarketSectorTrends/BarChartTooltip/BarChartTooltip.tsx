import React from 'react';
import ReactDOM from 'react-dom';
import { AlertWarningIcon, SelectedCheckIcon, TooltipArrowIcon, TrendingDownIcon, TrendingUpIcon } from '@/icons';
import theme from '@/styles/theme';
import {
  TooltipWrapper,
  TooltipCard,
  TooltipHeaderRow,
  TooltipAvatar,
  TooltipCompanyName,
  TooltipDescription,
  TooltipDivider,
  TooltipInfoSection,
  TooltipDateRow,
  TooltipPerformanceRow,
  TooltipPerformanceValue,
  TooltipAlertRow,
  TooltipArrow,
  TooltipTrendCircle,
} from './BarChartTooltip.styles';

export interface BarChartTooltipInfo {
  name: string;
  description: string;
  color: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>> | null;
}

export interface BarChartTooltipProps {
  ticker: string;
  date: string;
  relativePerformance: number;
  trend: 'up' | 'down';
  performanceSentence: string;
  x: number;
  y: number;
  info: BarChartTooltipInfo;
}

function getRenderableText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.title === 'string') return obj.title;
  }
  return '';
}

const TOOLTIP_WIDTH = 217;
const TOOLTIP_MARGIN = 8;

export const BarChartTooltip: React.FC<BarChartTooltipProps> = ({
  ticker,
  date,
  relativePerformance,
  trend,
  performanceSentence,
  x,
  y,
  info,
}) => {
  const isNegative = trend === 'down';
  const performanceSentenceText = getRenderableText(performanceSentence as unknown);

  // Clamp the card so it never overflows left or right of the viewport.
  // Then shift the arrow by the opposite amount so it still points at the dot.
  const clampedX = Math.max(
    TOOLTIP_WIDTH / 2 + TOOLTIP_MARGIN,
    Math.min(x, window.innerWidth - TOOLTIP_WIDTH / 2 - TOOLTIP_MARGIN),
  );
  const arrowShift = x - clampedX;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        left: clampedX,
        top: y,
        transform: `translate(-50%, calc(-100% - ${theme.spacing[2]}))`,
        pointerEvents: 'none',
        zIndex: theme.zIndex.portalTooltip,
      }}
    >
      <TooltipWrapper>
        <TooltipCard>
          <TooltipHeaderRow>
            <TooltipAvatar $color={info.color}>
              {info.Icon ? <info.Icon width={12} height={12} /> : ticker.charAt(0)}
            </TooltipAvatar>
            <TooltipCompanyName>{info.name}</TooltipCompanyName>
          </TooltipHeaderRow>
          <TooltipDescription>{info.description}</TooltipDescription>
          <TooltipDivider />
          <TooltipInfoSection>
            <TooltipDateRow>
              {'Date: '}
              <strong>{date}</strong>
            </TooltipDateRow>
            <TooltipPerformanceRow>
              <span>Relative Performance:</span>
              <TooltipPerformanceValue>
                {isNegative ? <TrendingDownIcon width={16} height={16} /> : <TrendingUpIcon width={16} height={16} />}
                <strong>{relativePerformance.toFixed(2)}</strong>
              </TooltipPerformanceValue>
            </TooltipPerformanceRow>
            <TooltipAlertRow>
              {isNegative ? (
                <AlertWarningIcon width="1em" height="1em" style={{ flexShrink: 0 }} />
              ) : (
                <TooltipTrendCircle>
                  <SelectedCheckIcon style={{ width: '0.6em', height: '0.6em', color: 'white' }} />
                </TooltipTrendCircle>
              )}
              <span>{performanceSentenceText}</span>
            </TooltipAlertRow>
          </TooltipInfoSection>
        </TooltipCard>
        <TooltipArrow style={{ transform: `translateX(${arrowShift}px)` }}>
          <TooltipArrowIcon style={{ color: theme.colors.tooltipBg }} />
        </TooltipArrow>
      </TooltipWrapper>
    </div>,
    document.body,
  );
};

export default BarChartTooltip;
