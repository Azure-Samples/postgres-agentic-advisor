/**
 * Calendar component constants and configuration
 */

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** The implicit year used for all data queries – intentionally never shown in the UI */
export const FIXED_YEAR = 2023;

/** Hard-coded recommended demo dates shown as quick-select preset cards */
export const PRESET_DATES: [Date, Date] = [
  new Date(FIXED_YEAR, 9, 24),  // Oct 24, 2023
  new Date(FIXED_YEAR, 10, 20), // Nov 20, 2023
];

export const DEFAULT_PLACEHOLDER = 'Today';

/** Date format for the trigger button label – year intentionally omitted */
export const CALENDAR_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
};
