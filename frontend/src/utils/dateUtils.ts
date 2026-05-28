/**
 * Parse a backend-supplied date string as UTC.
 *
 * The backend returns naive datetime strings such as "2026-05-23T23:27:21"
 * that represent UTC time but carry no timezone suffix.
 *
 * Per ECMA-262, an ISO datetime string that contains "T" but has NO timezone
 * indicator is parsed as LOCAL time by the browser — the opposite of what we
 * want, and different from the UTC treatment of date-only strings (YYYY-MM-DD).
 *
 * Concretely:
 *   new Date("2026-05-23T23:27:21")        → local midnight in the user's tz
 *   new Date("2026-05-23T23:27:21Z")  → UTC, correctly offset to local display
 *
 * This function appends "Z" whenever the input is a naive datetime string so
 * that every consumer works correctly in every timezone without any server change.
 *
 * Rules:
 *   - Already has timezone suffix (Z / ±HH:MM / ±HHMM) → parse as-is.
 *   - Naive datetime (YYYY-MM-DDTHH:mm…, no suffix)    → append "Z" (treat as UTC).
 *   - Date-only  (YYYY-MM-DD)                           → parse as-is (spec says UTC).
 *   - Anything else                                     → delegate to Date constructor.
 */
export function parseBackendDate(dateStr: string | Date | number): Date {
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'number') return new Date(dateStr);
  if (!dateStr) return new Date(NaN);

  // Already carries timezone info — no adjustment needed.
  if (/Z$|[+-]\d{2}:\d{2}$|[+-]\d{4}$/.test(dateStr)) {
    return new Date(dateStr);
  }

  // Naive datetime string (has T separator, no tz suffix) → treat as UTC.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateStr)) {
    return new Date(dateStr + 'Z');
  }

  // Date-only (YYYY-MM-DD) — already treated as UTC by ECMA-262.
  return new Date(dateStr);
}

/**
 * Format a date value to YYYY-MM-DD string, regardless of the input format.
 *
 * Handles:
 *   - Date objects (uses local calendar date to avoid UTC-offset shifts)
 *   - ISO strings       "2025-06-27T00:00:00Z"
 *   - Already-formatted "2025-06-27"  (returned as-is)
 *   - US slash format   "06/27/2025"
 *   - Invalid input     (returns empty string)
 *
 * @param date - Value to format
 * @returns YYYY-MM-DD string, or '' if the input cannot be parsed
 */
export function formatDateToYYYYMMDD(date: Date | string): string {
  if (date instanceof Date) {
    if (isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  // ISO string with time component e.g. "2025-06-27T00:00:00Z"
  if (/^\d{4}-\d{2}-\d{2}T/.test(date)) return date.slice(0, 10);

  // US slash format e.g. "06/27/2025"
  const slash = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, mm, dd, yyyy] = slash;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  // Last resort: let Date parse it and extract local calendar fields
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return '';
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type HistoryGroup = 'Latest' | 'Last Week' | 'Last Month' | 'Older';

const GROUP_ORDER: HistoryGroup[] = ['Latest', 'Last Week', 'Last Month', 'Older'];

export function getSessionGroup(dateStr: string): HistoryGroup {
  const date = parseBackendDate(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((todayStart.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24));

  // diffDays === 0  → today
  // diffDays === 1  → yesterday (still feels recent; "20 hours ago" crossing midnight
  //                   should not appear under "Last Week")
  if (diffDays <= 1) return 'Latest';
  if (diffDays <= 7) return 'Last Week';
  if (diffDays <= 30) return 'Last Month';
  return 'Older';
}

export function groupSessionsByDate<T extends { date: string }>(
  sessions: T[],
): Array<{ label: HistoryGroup; sessions: T[] }> {
  const sorted = [...sessions].sort(
    (a, b) => parseBackendDate(b.date).getTime() - parseBackendDate(a.date).getTime(),
  );
  const groupMap: Record<HistoryGroup, T[]> = { Latest: [], 'Last Week': [], 'Last Month': [], Older: [] };
  for (const session of sorted) {
    groupMap[getSessionGroup(session.date)].push(session);
  }
  return GROUP_ORDER.filter((label) => groupMap[label].length > 0).map((label) => ({
    label,
    sessions: groupMap[label],
  }));
}

/**
 * Format a date string or timestamp to a human-readable "time ago" format.
 * @param dateInput - ISO date string, Date object, or timestamp
 * @returns Human-readable string like "2 hours ago", "Yesterday", etc.
 */
export const formatDateToRelativeTime = (dateInput: string | Date | number): string => {
  const date = parseBackendDate(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else {
    // For older dates, return formatted date
    return date.toLocaleDateString();
  }
};
