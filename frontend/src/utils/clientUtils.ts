import type { ClientListRow } from '@/features/ClientList/ClientList';
import type { ClientListItem, ClientSortValue } from '@/api/types/client.types';
import { getClientAvatarUrl } from '@/utils/clientAvatarMap';

export const filterBySearch = (clients: ClientListRow[], searchQuery: string): ClientListRow[] => {
  if (!searchQuery) return clients;

  const normalizedQuery = searchQuery.toLowerCase();
  return clients.filter((client) => client.name.toLowerCase().includes(normalizedQuery));
};

export const filterByCategory = (clients: ClientListRow[], selectedFilter: string): ClientListRow[] => {
  if (selectedFilter === 'all') return clients;

  switch (selectedFilter) {
    case 'active':
      return clients;
    case 'high_risk':
      return clients.filter((client) => client.riskProfile === 'Growth-oriented' || client.riskProfile === 'Risk Aversive');
    case 'tech':
      return clients.filter((client) => client.topSector === 'Information Technology');
    case 'consumer':
      return clients.filter(
        (client) =>
          client.topSector === 'Consumer Discretionary' ||
          client.topSector === 'Consumer Staples',
      );
    default:
      return clients;
  }
};

export const sortClients = (clients: ClientListRow[], selectedSort: string): ClientListRow[] => {
  return [...clients].sort((a, b) => {
    switch (selectedSort) {
      case 'default':
        return 0; // preserve server order
      case 'name':
        return a.name.localeCompare(b.name);
      case 'networth':
        const aValue = Number(a.netWorth.replace(/[$,M]/g, ''));
        const bValue = Number(b.netWorth.replace(/[$,M]/g, ''));
        return bValue - aValue;
      case 'growth':
        return b.growthPercent - a.growthPercent;
      case 'risk':
        return a.riskProfile.localeCompare(b.riskProfile);
      default:
        return 0;
    }
  });
};

// ─── API ↔ UI mapping utilities ───────────────────────────────────────────────

/**
 * Formats a raw numeric net-worth value into a compact display string.
 * e.g. 4_800_000 → "$4.8M", 350_000 → "$350.0K", 800 → "$800"
 */
export function formatNetWorth(value: number): string {
  if (value == null || isNaN(value)) return '–';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

// Predefined sparkline shapes used when the API returns a direction string
const SERIES_UP   = [4, 5, 6, 7, 9, 11, 12, 13];
const SERIES_DOWN = [13, 12, 11, 9, 8, 7, 6, 4];
const SERIES_FLAT = [8, 8, 8, 8, 8, 8, 8, 8];

/**
 * Parses the `growth_series` field from the API into a number array for the sparkline.
 *
 * The API may return:
 *  - A direction keyword: "up" | "down" | "flat"
 *  - A JSON array string: "[4,5,6,7]"
 *  - A comma-separated string: "4,5,6,7"
 */
export function parseGrowthSeries(growthSeries: string): number[] {
  if (!growthSeries) return [];
  const trimmed = growthSeries.trim().toLowerCase();

  // Direction keywords
  if (trimmed === 'up')   return SERIES_UP;
  if (trimmed === 'down') return SERIES_DOWN;
  if (trimmed === 'flat') return SERIES_FLAT;

  // JSON array
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map(Number).filter((n) => !isNaN(n));
  } catch {
    // not valid JSON — fall through to comma-separated parse
  }

  // Comma-separated
  return trimmed
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !isNaN(n));
}


/**
 * Maps a UI sort-option value to the API `sort` parameter.
 * Falls back to 'default' for any unrecognised value.
 */
export function mapSortToApi(sortValue: string): ClientSortValue {
  const map: Record<string, ClientSortValue> = {
    default: 'default',
    name: 'name',
    networth: 'networth',
    growth: 'growth',
    risk: 'risk',
  };
  return map[sortValue] ?? 'default';
}

/**
 * Maps raw risk-profile labels from the API to the display-friendly form.
 * Currently rewrites "Conservative" to "Risk-adverse"; all other values
 * (and null/empty) are passed through unchanged.
 */
export function formatRiskProfile<T extends string | null | undefined>(value: T): T {
  if (value && value.toLowerCase() === 'conservative') {
    return 'Risk-adverse' as T;
  }
  return value;
}

/**
 * Transforms a raw `ClientListItem` from GET /clients/list into a `ClientListRow`
 * ready to be rendered by the ClientList table component.
 * Sector and risk-profile values are passed through as-is from the API.
 */
export function mapClientListItem(item: ClientListItem): ClientListRow {
  return {
    id: item.id,
    name: item.full_name,
    avatar: getClientAvatarUrl(item.full_name),
    netWorth: formatNetWorth(item.net_worth),
    growthPercent: item.growth_percent ?? 0,
    growthSeries: parseGrowthSeries(item.growth_series),
    topSector: item.top_sector,
    holdings: item.holdings ?? [],
    riskProfile: item.risk_profile ?? 'None',
  };
}
