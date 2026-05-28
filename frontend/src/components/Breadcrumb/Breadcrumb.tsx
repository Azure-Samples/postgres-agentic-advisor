import React from 'react';
import { BreadcrumbContainer, Crumb, CrumbLink, Separator } from './Breadcrumb.styles';

/**
 * Props interface for the Breadcrumb component.
 */
export interface BreadcrumbProps {
  /** Array of React nodes representing breadcrumb items */
  children: React.ReactNode[];
  /** Custom separator element to display between breadcrumb items */
  separator?: React.ReactNode;
}

/**
 * Default separator element used between breadcrumb items.
 */
const defaultSeparator = <Separator>/</Separator>;

/**
 * A breadcrumb navigation component that displays a series of linked items with separators.
 *
 * @param {BreadcrumbProps} props - The component props containing breadcrumb configuration.
 * @param {React.ReactNode[]} props.children - Array of breadcrumb items to display.
 * @param {React.ReactNode} [props.separator] - Custom separator between items (defaults to '/').
 * @returns {JSX.Element} A horizontal breadcrumb navigation with items and separators.
 *
 * @remarks
 * This component creates a horizontal navigation trail that helps users understand
 * their current location within a hierarchical structure and provides quick
 * navigation back to parent levels.
 *
 * Features:
 * - Automatic separator insertion between items
 * - Customizable separator elements
 * - Support for any React node as breadcrumb items
 * - Responsive layout that adapts to content
 *
 * The component automatically handles the placement of separators, ensuring
 * they appear between items but not after the last item.
 *
 * Breadcrumb items should typically be interactive elements like links or buttons
 * that allow navigation to parent pages or sections.
 *
 * @example
 * ```tsx
 * <Breadcrumb separator={<ChevronRightIcon />}>
 *   <CrumbLink href="/">Home</CrumbLink>
 *   <CrumbLink href="/products">Products</CrumbLink>
 *   <Crumb>Current Product</Crumb>
 * </Breadcrumb>
 * ```
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ children, separator = defaultSeparator }) => {
  const items = React.Children.toArray(children);
  return (
    <BreadcrumbContainer>
      {items.map((child, idx) => (
        <React.Fragment key={idx}>
          {child}
          {idx < items.length - 1 && separator}
        </React.Fragment>
      ))}
    </BreadcrumbContainer>
  );
};

export { Crumb, CrumbLink };
