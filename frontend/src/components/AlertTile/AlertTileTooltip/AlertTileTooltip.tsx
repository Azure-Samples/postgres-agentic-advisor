import React from 'react';
import ReactDOM from 'react-dom';
import { TooltipArrowIcon } from '@/icons';
import theme from '@/styles/theme';
import {
  TooltipArrow,
  TooltipAvatar,
  TooltipCard,
  TooltipCompanyName,
  TooltipDescription,
  TooltipHeaderRow,
  TooltipWrapper,
} from './AlertTileTooltip.styles';

export interface AlertTileTooltipProps {
  companyName: string;
  description: string;
  color?: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>> | null;
  x: number;
  y: number;
}

export const AlertTileTooltip: React.FC<AlertTileTooltipProps> = ({ companyName, description, color, Icon, x, y }) =>
  ReactDOM.createPortal(
    <TooltipWrapper $x={x} $y={y}>
      <TooltipCard>
        <TooltipHeaderRow>
          <TooltipAvatar $color={color}>{Icon ? <Icon width={12} height={12} /> : companyName.charAt(0)}</TooltipAvatar>
          <TooltipCompanyName>{companyName}</TooltipCompanyName>
        </TooltipHeaderRow>
        <TooltipDescription>{description}</TooltipDescription>
      </TooltipCard>
      <TooltipArrow>
        <TooltipArrowIcon style={{ color: theme.colors.tooltipBg }} />
      </TooltipArrow>
    </TooltipWrapper>,
    document.body,
  );
