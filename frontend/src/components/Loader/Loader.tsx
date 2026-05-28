import React from 'react';
import { LoaderWrapper, Spinner, LoaderSize, getAriaLabel, LoaderSpeed } from './Loader.styles';
import { theme } from '../../styles/theme';

/**
 * Props interface for the Loader component.
 */
export interface LoaderProps {
  /** Size variant of the loader spinner */
  size?: LoaderSize;
  /** Rotation speed of the spinner animation */
  speed?: LoaderSpeed;
  /** Whether to display inline with text or as block element */
  inline?: boolean;
  /** Whether to center the loader horizontally in its container */
  center?: boolean;
  /** Custom accessibility label (overrides default aria-label) */
  label?: string;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** HTML id attribute */
  id?: string;
}

/**
 * A customizable loading spinner component with accessibility support and flexible styling options.
 *
 * @param {LoaderProps} props - The component props containing loader configuration.
 * @param {LoaderSize} [props.size='md'] - Size variant of the spinner.
 * @param {LoaderSpeed} [props.speed='normal'] - Animation speed of the rotation.
 * @param {boolean} [props.inline] - Whether to display inline with surrounding content.
 * @param {boolean} [props.center] - Whether to center the loader horizontally.
 * @param {string} [props.label] - Custom accessibility label for screen readers.
 * @returns {JSX.Element} An animated SVG spinner with customizable appearance and behavior.
 *
 * @remarks
 * This loader component provides a smooth, customizable loading indicator with:
 * - Multiple size options for different contexts
 * - Configurable animation speed
 * - Flexible layout options (inline vs block, centered vs natural)
 * - Full accessibility support with proper ARIA attributes
 * - Theme-based coloring using primary and neutral colors
 *
 * The spinner is implemented as an SVG with CSS animations for smooth performance
 * across different devices and browsers. The circular progress indicator uses
 * stroke-dasharray and rotation to create a spinning arc effect.
 *
 * Layout modes:
 * - Block (default): Takes full width and appears on its own line
 * - Inline: Flows with surrounding text and content
 * - Centered: Horizontally centers within its container
 *
 * The component automatically provides appropriate accessibility attributes
 * including role="status" and aria-label for screen reader compatibility.
 *
 * @example
 * ```tsx
 * <Loader
 *   size="lg"
 *   speed="fast"
 *   center
 *   label="Loading user data..."
 * />
 * ```
 */
export const Loader: React.FC<LoaderProps> = ({ size = 'md', speed = 'normal', inline, center, label, ...rest }) => {
  const trackColor = theme.colors['lavender-gray-40'];
  const primary = theme.colors.primary;
  const r = 20;
  const circumference = Math.PI * 2 * r;
  const arcPortion = 0.25;
  const dashArray = circumference * arcPortion;
  const gap = circumference - dashArray;

  return (
    <LoaderWrapper $inline={inline} $center={center} role="status" aria-label={getAriaLabel(label)} {...rest}>
      <Spinner $size={size} $speed={speed} viewBox="0 0 50 50" fill="none">
        <circle className="track" cx="25" cy="25" r={r} stroke={trackColor} strokeLinecap="round" />
        <circle
          className="indicator"
          cx="25"
          cy="25"
          r={r}
          stroke={primary}
          strokeLinecap="round"
          strokeDasharray={`${dashArray} ${gap}`}
          strokeDashoffset={0}
        />
      </Spinner>
    </LoaderWrapper>
  );
};

export default Loader;
