import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { NavigationContext, NavigationSource, NavigationState } from '@/types/navigation';
import { NAVIGATION_SOURCES, BASE_PATHS, BACK_LABELS, ROUTE_PATTERNS } from '@/constants/navigation';

/**
 * Custom hook for determining navigation context and breadcrumb information based on current route.
 *
 * @returns {NavigationContext} An object containing navigation source, back path, and back label.
 *
 * @remarks
 * This hook intelligently determines the user's navigation context to enable
 * proper breadcrumb navigation and back button functionality. It uses a
 * priority-based approach to determine navigation source:
 * 
 * Priority order:
 * 1. URL path analysis (survives page refresh and bookmarks)
 * 2. React Router location state (for programmatic navigation)
 * 3. Default fallback to dashboard
 * 
 * The hook analyzes route patterns to determine if the user came from:
 * - Client pages (client list, client details)
 * - Dashboard pages (main dashboard, widgets)
 * - Other application sections
 * 
 * Based on the source, it provides appropriate back navigation paths
 * and user-friendly labels for breadcrumb components.
 * 
 * Navigation context includes:
 * - source: Where the user navigated from
 * - backPath: URL to navigate back to
 * - backLabel: Human-readable label for the back action
 * 
 * This enables consistent navigation patterns across the application
 * and improves user experience with proper breadcrumb trails.
 *
 * @example
 * ```tsx
 * const { source, backPath, backLabel } = useNavigationContext();
 * 
 * return (
 *   <Breadcrumb>
 *     <CrumbLink to={backPath}>← {backLabel}</CrumbLink>
 *     <Crumb>Current Page</Crumb>
 *   </Breadcrumb>
 * );
 * ```
 */
export const useNavigationContext = (): NavigationContext => {
  const location = useLocation();

  const context = useMemo((): NavigationContext => {
    let source: NavigationSource;

    // Derive source from URL path (priority #1 - survives refresh/bookmark)
    if (ROUTE_PATTERNS.CLIENTS.test(location.pathname)) {
      source = NAVIGATION_SOURCES.CLIENTS;
    } else if (ROUTE_PATTERNS.DASHBOARD.test(location.pathname)) {
      source = NAVIGATION_SOURCES.DASHBOARD;
    } else {
      // Fallback to location.state for programmatic navigation (priority #2)
      const state = location.state as NavigationState | null;
      source = state?.from || NAVIGATION_SOURCES.DASHBOARD;
    }

    // Determine back path and label based on source
    const backPath = source === NAVIGATION_SOURCES.CLIENTS 
      ? BASE_PATHS.CLIENTS 
      : BASE_PATHS.DASHBOARD;

    const backLabel = source === NAVIGATION_SOURCES.CLIENTS 
      ? BACK_LABELS.CLIENTS 
      : BACK_LABELS.DASHBOARD;

    return {
      source,
      backPath,
      backLabel,
    };
  }, [location.pathname, location.state]);

  return context;
};

