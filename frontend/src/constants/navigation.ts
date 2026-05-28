/**
 * Navigation constants for consistent routing throughout the application
 */

/**
 * Navigation source identifiers
 */
export const NAVIGATION_SOURCES = {
  DASHBOARD: 'dashboard',
  CLIENTS: 'clients',
} as const;

/**
 * Route patterns for navigation detection
 */
export const ROUTE_PATTERNS = {
  CHAT: /^\/(dashboard|clients)\/[^/]+\/messages(\/[^/]+)?$/,
  DASHBOARD: /^\/dashboard/,
  CLIENTS: /^\/clients/,
} as const;

/**
 * Base paths for navigation
 */
export const BASE_PATHS = {
  DASHBOARD: '/dashboard',
  CLIENTS: '/clients',
  HOME: '/',
} as const;

/**
 * Labels for back navigation
 */
export const BACK_LABELS = {
  DASHBOARD: 'Dashboard',
  CLIENTS: 'Clients',
} as const;
