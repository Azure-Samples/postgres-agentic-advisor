import React from 'react';
import {
  SkeletonContainer,
  SkeletonChatItem,
  SkeletonMessageWrapper,
  SkeletonUserMessage,
  SkeletonUserBubble,
  SkeletonAssistantMessage,
  SkeletonAssistantLine,
  PulseSkeletonItem,
  EmptyStateContainer,
  EmptyStateText,
  AlertSkeletonContainer,
  AlertSkeletonAvatar,
  AlertSkeletonBody,
  AlertSkeletonRowGroup,
  AlertSkeletonTitle,
  AlertSkeletonTag,
  AlertSkeletonDescription,
  AlertSkeletonLabel,
  BarChartSkeletonCard,
  BarChartSkeletonHeader,
  BarChartSkeletonTitle,
  BarChartSkeletonChip,
  BarChartSkeletonBody,
  BarChartSkeletonMainChart,
  BarChartSkeletonYAxis,
  BarChartSkeletonPlotArea,
  BarChartSkeletonGridArea,
  BarChartSkeletonHLines,
  BarChartSkeletonHLine,
  BarChartSkeletonBarGroups,
  BarChartSkeletonBarGroup,
  BarChartSkeletonBar,
  BarChartSkeletonXAxis,
  BarChartSkeletonXLabel,
  BarChartSkeletonLegend,
  BarChartSkeletonLegendItem,
  BarChartSkeletonLegendDot,
  BarChartSkeletonLegendLabel,
  LineChartSkeletonCard,
  LineChartSkeletonHeader,
  LineChartSkeletonTitle,
  LineChartSkeletonChip,
  LineChartSkeletonBody,
  LineChartSkeletonLegend,
  LineChartSkeletonLegendItem,
  LineChartSkeletonLegendDot,
  LineChartSkeletonLegendLabel,
  LineChartSkeletonChartArea,
  LineChartSkeletonXAxis,
  LineChartSkeletonXLabel,
} from './Skeleton.styles';

/**
 * Props for skeleton loader components.
 */
interface SkeletonProps {
  /** Number of skeleton items to render */
  count?: number;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Skeleton loader for chat session list items.
 * Shows animated placeholders while sessions are loading.
 */
export const ChatSessionSkeleton: React.FC<SkeletonProps> = ({ count = 3, className }) => {
  return (
    <SkeletonContainer className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonChatItem key={index} />
      ))}
    </SkeletonContainer>
  );
};

/**
 * Skeleton loader for chat message history.
 * Shows animated placeholders simulating a conversation.
 */
export const ChatMessageSkeleton: React.FC<SkeletonProps> = ({ count = 2, className }) => {
  return (
    <SkeletonMessageWrapper className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <SkeletonUserMessage>
            <SkeletonUserBubble />
          </SkeletonUserMessage>
          <SkeletonAssistantMessage>
            <SkeletonAssistantLine $width="90%" />
            <SkeletonAssistantLine $width="75%" />
            <SkeletonAssistantLine $width="60%" />
          </SkeletonAssistantMessage>
        </React.Fragment>
      ))}
    </SkeletonMessageWrapper>
  );
};

export default { ChatSessionSkeleton, ChatMessageSkeleton };

// ----- Generic pulse loading skeleton -----
interface LoadingSkeletonProps {
  /** Number of skeleton rows to render */
  count?: number;
}

/**
 * Generic pulse-animated loading skeleton.
 * Usable anywhere a list of items is loading.
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <PulseSkeletonItem key={`skeleton-${i}`} />
    ))}
  </>
);

// ----- Alert tile skeleton -----
/**
 * Skeleton loader that mirrors the AlertTile layout.
 * Shows shimmer placeholders for avatar, title, tag, description, and label.
 */
export const AlertTileSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <AlertSkeletonContainer key={`alert-skeleton-${i}`}>
        <AlertSkeletonAvatar />
        <AlertSkeletonBody>
          <AlertSkeletonRowGroup>
            <AlertSkeletonTitle />
            <AlertSkeletonTag />
            <AlertSkeletonDescription />
          </AlertSkeletonRowGroup>
          <AlertSkeletonLabel />
        </AlertSkeletonBody>
      </AlertSkeletonContainer>
    ))}
  </>
);

// ----- Bar chart card skeleton -----
const BAR_GROUPS = 5;
const BARS_PER_GROUP = 5;
const X_LABELS = 5;
const LEGEND_ITEMS = 5;
const H_LINES = 4;

/**
 * Skeleton loader for the Market Sector Trends bar chart card.
 * Mirrors the Figma design: title, chip, chart grid with bar columns,
 * x-axis label pills, and legend rows.
 */
export const BarChartSkeleton: React.FC = () => (
  <BarChartSkeletonCard>
    <BarChartSkeletonHeader>
      <BarChartSkeletonTitle>Market Sector Trends</BarChartSkeletonTitle>
      <BarChartSkeletonChip />
    </BarChartSkeletonHeader>

    <BarChartSkeletonBody>
      <BarChartSkeletonMainChart>
        <BarChartSkeletonYAxis>
          {Array.from({ length: H_LINES }).map((_, i) => (
            <span key={i}>-</span>
          ))}
        </BarChartSkeletonYAxis>

        <BarChartSkeletonPlotArea>
          <BarChartSkeletonGridArea>
            <BarChartSkeletonHLines>
              {Array.from({ length: H_LINES }).map((_, i) => (
                <BarChartSkeletonHLine key={i} />
              ))}
            </BarChartSkeletonHLines>

            <BarChartSkeletonBarGroups>
              {Array.from({ length: BAR_GROUPS }).map((_, gi) => (
                <BarChartSkeletonBarGroup key={gi}>
                  {Array.from({ length: BARS_PER_GROUP }).map((_, bi) => (
                    <BarChartSkeletonBar key={bi} />
                  ))}
                </BarChartSkeletonBarGroup>
              ))}
            </BarChartSkeletonBarGroups>
          </BarChartSkeletonGridArea>

          <BarChartSkeletonXAxis>
            {Array.from({ length: X_LABELS }).map((_, i) => (
              <BarChartSkeletonXLabel key={i} />
            ))}
          </BarChartSkeletonXAxis>
        </BarChartSkeletonPlotArea>
      </BarChartSkeletonMainChart>

      <BarChartSkeletonLegend>
        {Array.from({ length: LEGEND_ITEMS }).map((_, i) => (
          <BarChartSkeletonLegendItem key={i}>
            <BarChartSkeletonLegendDot />
            <BarChartSkeletonLegendLabel />
          </BarChartSkeletonLegendItem>
        ))}
      </BarChartSkeletonLegend>
    </BarChartSkeletonBody>
  </BarChartSkeletonCard>
);

// ----- Line/area chart card skeleton -----
const LINE_X_LABELS = 5;
const LINE_LEGEND_ITEMS = 6;
const H_LINE_COUNT = 5;

// Static wavy-line paths simulating an area chart
const WAVE_PATHS = [
  'M0,120 C30,100 60,140 90,110 C120,80 150,130 180,100 C210,70 240,120 270,90 C300,60 330,110 360,80 L360,180 L0,180 Z',
  'M0,140 C30,120 60,160 90,130 C120,100 150,150 180,120 C210,90 240,140 270,110 C300,80 330,130 360,100 L360,180 L0,180 Z',
  'M0,100 C30,80 60,120 90,90 C120,60 150,110 180,80 C210,50 240,100 270,70 C300,40 330,90 360,60 L360,180 L0,180 Z',
];

/**
 * Skeleton loader for the Market Sector Trends area/line chart card.
 * Shows wavy SVG line placeholders instead of bar columns.
 */
export const LineChartSkeleton: React.FC = () => (
  <LineChartSkeletonCard>
    <LineChartSkeletonHeader>
      <LineChartSkeletonTitle>Portfolio Company Trends</LineChartSkeletonTitle>
      <LineChartSkeletonChip />
    </LineChartSkeletonHeader>

    <LineChartSkeletonBody>
      <LineChartSkeletonLegend>
        {Array.from({ length: LINE_LEGEND_ITEMS }).map((_, i) => (
          <LineChartSkeletonLegendItem key={i}>
            <LineChartSkeletonLegendDot />
            <LineChartSkeletonLegendLabel />
          </LineChartSkeletonLegendItem>
        ))}
      </LineChartSkeletonLegend>

      <LineChartSkeletonChartArea>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 360 200"
          preserveAspectRatio="none"
          style={{ display: 'block', flex: 1 }}
        >
          {/* Horizontal grid lines */}
          {Array.from({ length: H_LINE_COUNT }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={20 + i * 36}
              x2="360"
              y2={20 + i * 36}
              stroke="rgba(214,219,237,0.6)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          {/* Zero baseline */}
          <line x1="0" y1="140" x2="360" y2="140" stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
          {/* Wavy area paths (different vertical offsets for depth) */}
          {WAVE_PATHS.map((d, i) => (
            <g key={i}>
              <path d={d} fill="rgba(214,219,237,0.18)" />
              <path
                d={d.split(' L')[0]}
                fill="none"
                stroke="rgba(214,219,237,0.55)"
                strokeWidth="1.5"
              />
            </g>
          ))}
        </svg>

        <LineChartSkeletonXAxis>
          {Array.from({ length: LINE_X_LABELS }).map((_, i) => (
            <LineChartSkeletonXLabel key={i} />
          ))}
        </LineChartSkeletonXAxis>
      </LineChartSkeletonChartArea>
    </LineChartSkeletonBody>
  </LineChartSkeletonCard>
);

// ----- Generic empty state -----
interface EmptyStateProps {
  /** Text to display when there is nothing to show */
  message: string;
}

/**
 * Generic empty state component.
 * Pass the context-specific message from the parent.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <EmptyStateContainer>
    <EmptyStateText>{message}</EmptyStateText>
  </EmptyStateContainer>
);
