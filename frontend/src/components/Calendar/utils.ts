/**
 * Utility functions for date calculations and formatting
 */

/**
 * Parse a date value from various formats (Date, string, null)
 */
export const parseDateValue = (value?: Date | string | null): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Get today's date normalized to the start of day
 */
export const getTodayDate = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Format a date as an ordinal string, e.g. "12th May" or "3rd Oct"
 */
export const formatOrdinalDate = (date: Date): string => {
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const mod100 = day % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? 'th'
      : day % 10 === 1
        ? 'st'
        : day % 10 === 2
          ? 'nd'
          : day % 10 === 3
            ? 'rd'
            : 'th';
  return `${day}${suffix} ${month}`;
};

/**
 * Returns true when two dates fall on the same calendar day
 */
export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined): boolean => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

/**
 * Build a Monday-indexed calendar grid for the given year and month.
 * Each row contains 7 cells; cells that fall outside the month are null.
 */
export const getCalendarGrid = (year: number, month: number): (Date | null)[][] => {
  const firstDay = new Date(year, month, 1);
  // JS getDay(): Sun=0 … Sat=6 → convert to Mon=0 … Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const grid: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) grid.push(cells.slice(i, i + 7));
  return grid;
};
