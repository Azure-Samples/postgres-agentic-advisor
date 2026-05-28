/**
 * Navigation type definitions for the application
 */

/**
 * Available navigation sources in the application
 */
export type NavigationSource = 'dashboard' | 'clients';

/**
 * Navigation state passed through React Router location state
 */
export interface NavigationState {
  from: NavigationSource;
}

/**
 * Navigation context returned by useNavigationContext hook
 */
export interface NavigationContext {
  source: NavigationSource;
  backPath: string;
  backLabel: string;
}

