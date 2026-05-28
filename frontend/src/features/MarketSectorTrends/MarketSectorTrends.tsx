import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CalendarOutlined } from '@ant-design/icons';
import { useSectorTrendsQuery } from '@/api/hooks/useSectorTrendsQuery';
import { LineChartSkeleton } from '@/components';
import { WidgetErrorState } from '@/components/WidgetErrorState';
import { BarChartTooltip } from './BarChartTooltip';
import type { BarChartTooltipInfo } from './BarChartTooltip';
import type { SectorTrendTickerData } from '@/api/types/sectorTrends.types';
import { getCompanyConfig } from '@/utils/companyMapper';
import {
  SectorTrendsContainer,
  SectorTrendsHeader,
  SectorTrendsTitle,
  LastDaysChip,
  LastDaysChipText,
  ChartWrapper,
  ChartRow,
  ChartArea,
  YAxisLabelWrapper,
  YAxisLabel,
  CalendarIconWrapper,
  LegendList,
  LegendItem,
  LegendDot,
  LegendLabel,
  ErrorWrapper,
} from './MarketSectorTrends.styles';

const TICKER_COLORS = ['#ffae4c', '#1c908c', '#0089d3', '#bf3d52', '#537ff1', '#9852d5'];

const DESIGN_TICKER_COLORS: Record<string, string> = {
  ZVTC: '#ffae4c',
  EDC: '#1c908c',
  CTC: '#0089d3',
  NFEQ: '#bf3d52',
  NWD: '#537ff1',
  ADW: '#9852d5',
};

const COMPANY_ABBREVIATION_LABELS: Record<string, string> = {
  'zava tech': 'ZVTC',
  'zava technologies': 'ZVTC',
  educare: 'EDUC',
  'contose compute': 'CCMP',
  'contoso compute': 'CCMP',
  'nanofab equipments': 'NFEQ',
  'nanofab equipment': 'NFEQ',
  norwind: 'NWND',
  northwind: 'NWND',
  'northwind memory technologies': 'NWND',
  'adventure world': 'AWKS',
  'adventure works': 'AWKS',
};

const TICKER_ABBREVIATION_LABELS: Record<string, string> = {
  ZVTC: 'ZVTC',
  EDC: 'EDUC',
  CTC: 'CCMP',
  NFEQ: 'NFEQ',
  NWD: 'NWND',
  ADW: 'AWKS',
};

// Fallback colors for tickers not found in the company map
const getFallbackColor = (index: number) => TICKER_COLORS[index % TICKER_COLORS.length];

// ----- Tooltip state -----
interface BarTooltipState {
  ticker: string;
  x: number;
  y: number;
  date: string;
  trend: 'up' | 'down';
  relativePerformance: number;
  performanceSentence: string;
}

const AXIS_TICK_STYLE = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: 12,
  fill: 'rgba(0,0,0,0.7)',
};

function normalizeTooltipText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.performance_sentence === 'string') return obj.performance_sentence;
    if (typeof obj.title === 'string') return obj.title;
  }
  return '';
}

function formatAxisDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${day} ${month}`;
}

function normalizeCompanyName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getAbbreviationLabel(companyName: string | undefined, ticker: string): string {
  if (companyName?.trim()) {
    const normalizedCompanyName = normalizeCompanyName(companyName);
    const byCompany = COMPANY_ABBREVIATION_LABELS[normalizedCompanyName];
    if (byCompany) return byCompany;
  }

  return TICKER_ABBREVIATION_LABELS[ticker] ?? ticker;
}

interface MarketSectorTrendsProps {
  simulatedDate?: string;
}

export const MarketSectorTrends: React.FC<MarketSectorTrendsProps> = ({ simulatedDate }) => {
  const { data, isLoading, isError, refetch } = useSectorTrendsQuery(simulatedDate, 6);
  const [tooltipState, setTooltipState] = useState<BarTooltipState | null>(null);
  const [dotsVisible, setDotsVisible] = useState(false);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimerRef.current = setTimeout(() => {
      setTooltipState(null);
      hideTimerRef.current = null;
    }, 80);
  }, [cancelHide]);

  const tickers = useMemo(() => data?.tickers ?? [], [data]);

  // Hide tooltip when mouse leaves the chart area (recharts synthetic events are unreliable —
  // onMouseEnter fires for any bar group under the cursor rectangle, continuously cancelling
  // the hide timer even after the mouse has visually left the bars).
  useEffect(() => {
    if (!tooltipState) return;
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const chartRect = chartAreaRef.current?.getBoundingClientRect();
      if (!chartRect) return;
      const { clientX: x, clientY: y } = e;
      if (x < chartRect.left || x > chartRect.right || y < chartRect.top || y > chartRect.bottom) {
        setTooltipState(null);
      }
    };
    document.addEventListener('mousemove', handleGlobalMouseMove);
    return () => document.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [tooltipState]);

  const tickerCompanyMap = useMemo<Record<string, BarChartTooltipInfo>>(() => {
    const securitiesInfo = data?.securities_info ?? {};
    const map: Record<string, BarChartTooltipInfo> = {};
    tickers.forEach((ticker, index) => {
      const info = securitiesInfo[ticker];
      const companyConfig = info?.name ? getCompanyConfig(info.name) : undefined;
      map[ticker] = {
        name: info?.name ?? ticker,
        description: info?.description ?? '',
        color: DESIGN_TICKER_COLORS[ticker] ?? companyConfig?.bgColor ?? getFallbackColor(index),
        Icon: companyConfig?.Icon ?? null,
      };
    });
    return map;
  }, [tickers, data?.securities_info]);

  const tickerLegendLabelMap = useMemo<Record<string, string>>(() => {
    const securitiesInfo = data?.securities_info ?? {};
    const map: Record<string, string> = {};

    tickers.forEach((ticker) => {
      const companyName = securitiesInfo[ticker]?.name;
      map[ticker] = getAbbreviationLabel(companyName, ticker);
    });

    return map;
  }, [tickers, data?.securities_info]);

  // Flatten chart data for recharts (bar height = normalized_change).
  // Per-ticker raw data is stored under a `_<ticker>` key for tooltip lookup.
  const chartData = useMemo(
    () =>
      (data?.data ?? []).slice(1).map((entry) => {
        const flat: Record<string, string | number | SectorTrendTickerData> = {
          date: formatAxisDate(entry.date as string),
        };
        tickers.forEach((ticker) => {
          const d = entry[ticker] as SectorTrendTickerData | undefined;
          flat[ticker] = d?.normalized_change ?? 0;
          flat[`_${ticker}`] = d ?? ({} as SectorTrendTickerData);
        });
        return flat;
      }),
    [data, tickers],
  );

  const xTick = useCallback(
    (props: { x?: number | string; y?: number | string; payload?: { value: string }; index?: number }) => {
      return (
        <text
          x={Number(props.x ?? 0)}
          y={Number(props.y ?? 0) + 10}
          textAnchor="middle"
          fill="rgba(0,0,0,0.7)"
          fontSize={12}
          fontFamily="Roboto, sans-serif"
        >
          {props.payload?.value}
        </text>
      );
    },
    [],
  );

  if (isLoading) return <LineChartSkeleton />;

  return (
    <SectorTrendsContainer>
      <SectorTrendsHeader>
        <SectorTrendsTitle>Portfolio Company Trends</SectorTrendsTitle>
        <LastDaysChip>
          <CalendarIconWrapper>
            <CalendarOutlined />
          </CalendarIconWrapper>
          <LastDaysChipText>Last 5 days</LastDaysChipText>
        </LastDaysChip>
      </SectorTrendsHeader>

      {isError && <WidgetErrorState onRetry={refetch} />}

      {!isError && data && (
        <ChartWrapper>
          <LegendList>
            {tickers.map((ticker) => (
              <LegendItem key={ticker}>
                <LegendDot color={tickerCompanyMap[ticker]?.color ?? '#8979FF'} />
                <LegendLabel>{tickerLegendLabelMap[ticker] ?? ticker}</LegendLabel>
              </LegendItem>
            ))}
          </LegendList>

          <ChartRow>
            <YAxisLabelWrapper>
              <YAxisLabel>Relative Stock Price Change</YAxisLabel>
            </YAxisLabelWrapper>
            <ChartArea ref={chartAreaRef} onMouseLeave={scheduleHide}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 20, bottom: 8, left: 5 }}>
                  <defs>
                    {tickers.map((ticker) => {
                      const color = tickerCompanyMap[ticker]?.color ?? '#8979FF';
                      return (
                        <linearGradient key={`grad-${ticker}`} id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <CartesianGrid stroke="rgba(214,219,237,0.5)" strokeDasharray="4 4" />
                  <XAxis dataKey="date" tick={xTick} axisLine={false} tickLine={false} interval={0} />
                  <YAxis
                    tick={AXIS_TICK_STYLE}
                    axisLine={false}
                    tickLine={false}
                    tickCount={4}
                    width={30}
                    domain={[
                      (dataMin: number) => Math.floor(dataMin - 0.2),
                      (dataMax: number) => Math.ceil(dataMax + 0.2),
                    ]}
                  />
                  <ReferenceLine y={0} stroke="rgba(148,163,184,0.4)" strokeWidth={1} />
                  <Tooltip content={() => null} cursor={{ stroke: 'rgba(100,116,139,0.3)', strokeWidth: 1 }} />
                  {tickers.map((ticker, index) => {
                    const color = tickerCompanyMap[ticker]?.color ?? '#8979FF';
                    const isLastTicker = index === tickers.length - 1;
                    return (
                      <Area
                        key={ticker}
                        type="linear"
                        dataKey={ticker}
                        stroke={color}
                        strokeWidth={2.5}
                        fill={`url(#grad-${ticker})`}
                        activeDot={false}
                        isAnimationActive
                        animationBegin={index * 60}
                        animationDuration={700}
                        animationEasing="ease-out"
                        onAnimationEnd={isLastTicker ? () => setDotsVisible(true) : undefined}
                        dot={(rawDotProps) => {
                          const {
                            cx,
                            cy,
                            index: dotIndex,
                            payload,
                          } = rawDotProps as {
                            cx?: number;
                            cy?: number;
                            index: number;
                            payload: Record<string, unknown>;
                          };
                          if (!dotsVisible || cx == null || cy == null)
                            return <g key={`dot-${ticker}-${dotIndex}-empty`} />;
                          return (
                            <circle
                              key={`dot-${ticker}-${dotIndex}`}
                              cx={cx}
                              cy={cy}
                              r={4.5}
                              fill={color}
                              stroke="white"
                              strokeWidth={2}
                              style={{ cursor: 'pointer', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }}
                              onMouseEnter={(e) => {
                                cancelHide();
                                const tickerData = payload?.[`_${ticker}`] as Record<string, unknown> | undefined;
                                setTooltipState({
                                  ticker,
                                  x: e.clientX,
                                  y: e.clientY,
                                  date: String(payload?.date ?? ''),
                                  trend: tickerData?.trend === 'down' ? 'down' : 'up',
                                  relativePerformance:
                                    typeof tickerData?.relative_performance === 'number'
                                      ? tickerData.relative_performance
                                      : 0,
                                  performanceSentence: normalizeTooltipText(tickerData?.performance_sentence),
                                });
                              }}
                              onMouseLeave={scheduleHide}
                            />
                          );
                        }}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
              {tooltipState && tickerCompanyMap[tooltipState.ticker] && (
                <BarChartTooltip
                  ticker={tooltipState.ticker}
                  date={tooltipState.date}
                  trend={tooltipState.trend}
                  relativePerformance={tooltipState.relativePerformance}
                  performanceSentence={tooltipState.performanceSentence}
                  x={tooltipState.x}
                  y={tooltipState.y}
                  info={tickerCompanyMap[tooltipState.ticker]}
                />
              )}
            </ChartArea>
          </ChartRow>
        </ChartWrapper>
      )}
    </SectorTrendsContainer>
  );
};
