import React, { useMemo, useState } from 'react';
import {
  AlertTileContainer,
  AlertTileContentWrapper,
  ClientTitleWrapper,
  CompanyNameHoverAnchor,
  DateBadge,
  DeleteIconButton,
  HoverWrapper,
  RowWrapper,
  TrendIconWrapper,
  Subtitle,
  SummaryTimeRightSection,
  SummaryTimeWrapper,
  Title,
  TitleWrapper,
} from './AlertTile.styles';
import { AlertTileTooltip } from './AlertTileTooltip';
import { Chip } from '../Chip';
import { Button } from '../Button';
import { CalendarIcon, ChipAvatar, GenAiIcon, TrashIcon, TrendingUpIcon, TrendingDownIcon } from '@/icons';
import { getCompanyConfig } from '@/utils/companyMapper';
import type { AlertCompany } from '@/api/types/alert.types';

type TitleSegment = { type: 'text'; text: string } | { type: 'company'; text: string; company: AlertCompany };

interface HoveredCompanyState {
  company: AlertCompany;
  x: number;
  y: number;
}

const normalizeWithMap = (value: string): { normalized: string; indexMap: number[] } => {
  const normalizedChars: string[] = [];
  const indexMap: number[] = [];

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (/[a-z0-9]/i.test(char)) {
      normalizedChars.push(char.toLowerCase());
      indexMap.push(i);
    }
  }

  return { normalized: normalizedChars.join(''), indexMap };
};

const findCompanyNameRange = (heading: string, companyName: string): { start: number; end: number } | null => {
  const trimmedName = companyName.trim();
  if (!trimmedName) return null;

  const exactMatchIndex = heading.indexOf(trimmedName);
  if (exactMatchIndex >= 0) {
    return { start: exactMatchIndex, end: exactMatchIndex + trimmedName.length };
  }

  const normalizedHeading = normalizeWithMap(heading);
  const normalizedCompany = normalizeWithMap(trimmedName).normalized;
  if (!normalizedHeading.normalized || !normalizedCompany) return null;

  const normalizedStartIndex = normalizedHeading.normalized.indexOf(normalizedCompany);
  if (normalizedStartIndex < 0) return null;

  const normalizedEndIndex = normalizedStartIndex + normalizedCompany.length - 1;
  const start = normalizedHeading.indexMap[normalizedStartIndex];
  const end = normalizedHeading.indexMap[normalizedEndIndex] + 1;

  return { start, end };
};

function buildTitleSegments(title: string, companies: AlertCompany[]): TitleSegment[] {
  if (!companies.length || !title) return [{ type: 'text', text: title }];

  const ranges: Array<{ start: number; end: number; company: AlertCompany }> = [];
  for (const company of companies) {
    const range = findCompanyNameRange(title, company.company_name);
    if (range) ranges.push({ ...range, company });
  }

  if (!ranges.length) return [{ type: 'text', text: title }];

  ranges.sort((a, b) => a.start - b.start);

  const segments: TitleSegment[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) segments.push({ type: 'text', text: title.slice(cursor, r.start) });
    segments.push({ type: 'company', text: title.slice(r.start, r.end), company: r.company });
    cursor = r.end;
  }
  if (cursor < title.length) segments.push({ type: 'text', text: title.slice(cursor) });

  return segments;
}

/**
 * Props interface for the AlertTile component.
 */
export interface AlertTileProps {
  /** Unique identifier for the alert tile */
  id?: string;
  /** Trend direction indicator ('up' or 'down') */
  trend: 'up' | 'down';
  /** Name of the client associated with the alert */
  clientName?: string;
  /** Primary title text of the alert */
  title: string;
  /** Secondary subtitle text providing additional context */
  subtitle: string;
  /** Human-readable relative time label displayed on the alert (e.g. "2 hours ago") */
  relativeTime?: string;
  /** Timestamp when the alert was created */
  createdAt?: Date | string;
  /** Callback fired when the tile is clicked */
  onClick?: (e: React.MouseEvent) => void;
  /** Callback fired when the summary button is clicked */
  onSummaryClick?: (e: React.MouseEvent) => void;
  /** Callback fired when the delete icon button is clicked */
  onDeleteClick?: (e: React.MouseEvent) => void;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Companies referenced in the alert heading — each gets a hoverable tooltip span */
  companies?: AlertCompany[];
  /** Fallback single company name when companies array is not provided */
  tooltipCompanyName?: string;
  /** Fallback single company description when companies array is not provided */
  tooltipDescription?: string;
  /** Tooltip avatar color override */
  tooltipColor?: string;
  /**
   * When true, hides the "View Summary" button and shows createdAt date
   * inline in the title row. Clicking the entire tile triggers the action.
   * Used in the chat side panel alerts variant.
   */
  hideSummaryButton?: boolean;
  /** When true, removes hover border/background styles from the tile. */
  disableHover?: boolean;
}

/**
 * A tile component for displaying alert information with trend indicators and client details.
 *
 * @param {AlertTileProps} props - The component props containing alert information.
 * @param {string} props.trend - Trend direction ('up' or 'down') that determines the icon.
 * @param {string} props.title - Primary title text of the alert.
 * @param {string} props.subtitle - Secondary subtitle providing additional context.
 * @param {string} props.relativeTime - Human-readable relative time label (e.g. "2 hours ago").
 * @param {string} [props.clientName] - Optional client name displayed as a chip.
 * @param {Function} [props.onClick] - Click handler for the entire tile.
 * @param {Function} [props.onSummaryClick] - Click handler for the summary button.
 * @returns {JSX.Element} A styled alert tile with trend icon, content, and interactive elements.
 *
 * @remarks
 * This component displays alert information in a card-like format with:
 * - Trend indicator icon (up/down arrow based on trend direction)
 * - Optional client name displayed as a chip with avatar icon
 * - Title and subtitle text content
 * - Time ago information
 * - Summary button with AI icon for additional actions
 *
 * The component adjusts its layout based on whether a client name is provided,
 * ensuring optimal space utilization and visual hierarchy.
 *
 * Visual indicators help users quickly identify trend direction and take
 * appropriate actions based on the alert type and associated client.
 *
 * @example
 * ```tsx
 * <AlertTile
 *   trend="up"
 *   title="Performance Alert"
 *   subtitle="CPU usage increased by 25%"
 *   clientName="Acme Corp"
 *   relativeTime="2 hours ago"
 *   onClick={handleTileClick}
 *   onSummaryClick={handleSummaryClick}
 * />
 * ```
 */
const AlertTile: React.FC<AlertTileProps> = ({
  title,
  subtitle,
  onClick,
  className,
  style,
  trend,
  clientName,
  relativeTime,
  onSummaryClick,
  onDeleteClick,
  id,
  createdAt,
  hideSummaryButton = false,
  disableHover = false,
  companies,
  tooltipCompanyName,
  tooltipDescription,
  tooltipColor,
}) => {
  const [hoveredCompany, setHoveredCompany] = useState<HoveredCompanyState | null>(null);

  // Prefer the companies array from the API; fall back to legacy single-company props.
  const resolvedCompanies = useMemo<AlertCompany[]>(() => {
    if (companies && companies.length > 0) return companies;
    if (tooltipCompanyName?.trim()) {
      return [{
        ticker: '__legacy__',
        company_name: tooltipCompanyName.trim(),
        company_description: tooltipDescription ?? 'Company details will be available soon.',
      }];
    }
    return [];
  }, [companies, tooltipCompanyName, tooltipDescription]);

  const titleSegments = useMemo(() => buildTitleSegments(title, resolvedCompanies), [title, resolvedCompanies]);

  const hoveredCompanyConfig = hoveredCompany ? getCompanyConfig(hoveredCompany.company.company_name) : undefined;
  const resolvedTooltipColor = tooltipColor ?? hoveredCompanyConfig?.bgColor ?? '#CA763A';
  const resolvedTooltipIcon = hoveredCompanyConfig?.Icon ?? null;

  /** Format createdAt to "Jun 21, 2025" using local time (avoids UTC offset drift). */
  const formattedDate = useMemo(() => {
    if (!createdAt) return undefined;
    let d: Date;
    if (typeof createdAt === 'string') {
      // Parse YYYY-MM-DD as local midnight to avoid UTC conversion shifting the day
      const parts = createdAt.split('-');
      d = parts.length === 3 ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) : new Date(createdAt);
    } else {
      d = createdAt;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [createdAt]);

  return (
    <HoverWrapper>
      <AlertTileContainer
        id={id}
        className={className}
        style={style}
        onClick={onClick}
        $hasClientName={!!clientName}
        $disableHover={disableHover}
      >
        <TrendIconWrapper $trend={trend.toLowerCase() === 'up' ? 'up' : 'down'}>
          {trend.toLowerCase() === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
        </TrendIconWrapper>
        <AlertTileContentWrapper>
          <RowWrapper>
            <ClientTitleWrapper $column={!!clientName}>
              {clientName && <Chip variant="secondary" startIcon={<ChipAvatar />} label={clientName} />}
              <TitleWrapper>
                {hoveredCompany && (
                  <AlertTileTooltip
                    companyName={hoveredCompany.company.company_name}
                    description={hoveredCompany.company.company_description}
                    color={resolvedTooltipColor}
                    Icon={resolvedTooltipIcon}
                    x={hoveredCompany.x}
                    y={hoveredCompany.y}
                  />
                )}
                <Title>
                  {titleSegments.map((segment, i) => {
                    if (segment.type === 'text') return <React.Fragment key={i}>{segment.text}</React.Fragment>;
                    return (
                      <CompanyNameHoverAnchor
                        key={`${segment.company.ticker}-${i}`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCompany({ company: segment.company, x: rect.left + rect.width / 2, y: rect.top - 8 });
                        }}
                        onMouseLeave={() => setHoveredCompany(null)}
                      >
                        {segment.text}
                      </CompanyNameHoverAnchor>
                    );
                  })}
                </Title>
                {hideSummaryButton && formattedDate && <DateBadge>{formattedDate}</DateBadge>}
              </TitleWrapper>
            </ClientTitleWrapper>
            <Subtitle>{subtitle}</Subtitle>
          </RowWrapper>

          {!hideSummaryButton && (
            <SummaryTimeWrapper>
              <Button
                leftIcon={<GenAiIcon />}
                variant="text"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSummaryClick?.(e);
                }}
              >
                View Summary
              </Button>
              <SummaryTimeRightSection>
                {relativeTime ? (
                  <DateBadge>
                    <CalendarIcon />
                    {relativeTime}
                  </DateBadge>
                ) : null}
                {onDeleteClick && (
                  <DeleteIconButton
                    type="button"
                    aria-label="Delete alert"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(e);
                    }}
                  >
                    <TrashIcon />
                  </DeleteIconButton>
                )}
              </SummaryTimeRightSection>
            </SummaryTimeWrapper>
          )}
        </AlertTileContentWrapper>
      </AlertTileContainer>
    </HoverWrapper>
  );
};

export default AlertTile;
