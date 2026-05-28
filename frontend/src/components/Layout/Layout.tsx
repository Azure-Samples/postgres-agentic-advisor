import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { StyledContent, StyledLayout } from './Layout.styles';

/**
 * The main application layout component that provides the structural foundation for all pages.
 *
 * @returns {JSX.Element} A layout structure with navigation bar and dynamic content area.
 *
 * @remarks
 * This component serves as the root layout for the entire application, providing:
 * - Consistent navigation bar across all pages
 * - Proper content area for route-specific components
 * - Structured layout with appropriate spacing and styling
 *
 * The layout uses React Router's Outlet component to render the current
 * route's component within the content area, enabling seamless navigation
 * between different application sections while maintaining the navigation structure.
 *
 * The component implements a standard web application layout pattern with:
 * - Fixed navigation header at the top
 * - Flexible content area that adapts to different page requirements
 * - Consistent styling and theming across all child routes
 *
 * This layout is typically used as the root component for authenticated
 * parts of the application, wrapping all main feature pages.
 *
 * @example
 * ```tsx
 * // In route configuration
 * {
 *   path: "/",
 *   element: <Layout />,
 *   children: [
 *     { path: "dashboard", element: <Dashboard /> },
 *     { path: "clients", element: <Clients /> }
 *   ]
 * }
 * ```
 */
export const Layout: React.FC = () => {
  return (
    <StyledLayout>
      <Navbar />
      <StyledContent>
        <Outlet />
      </StyledContent>
    </StyledLayout>
  );
};

export default Layout;
