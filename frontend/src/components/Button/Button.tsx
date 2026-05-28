import React from 'react';
import { StyledButton, ButtonVariant, ButtonSize } from './Button.styles';

/**
 * Props interface for the Button component.
 */
export interface AppButtonProps {
  /** Visual style variant of the button (e.g., 'primary', 'secondary', 'outline') */
  variant?: ButtonVariant;
  /** Size of the button (e.g., 'sm', 'md', 'lg') */
  size?: ButtonSize;
  /** Whether the button should take full width of its container */
  fullWidth?: boolean;
  /** Icon to display on the left side of the button text */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side of the button text */
  rightIcon?: React.ReactNode;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** HTML button type attribute */
  htmlType?: 'button' | 'submit' | 'reset';
  /** Click event handler */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** HTML id attribute */
  id?: string;
  /** Accessibility label */
  'aria-label'?: string;
  /** Button content (text, icons, or other React elements) */
  children?: React.ReactNode;
}

/**
 * Inline styles for icon wrapper elements.
 * Ensures icons are properly aligned with button text.
 */
const iconWrapperStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center' };

/**
 * A versatile button component with customizable variants, sizes, and icon support.
 *
 * @param {AppButtonProps} props - The component props containing button configuration.
 * @param {React.ReactNode} props.children - The content to display inside the button.
 * @param {ButtonVariant} [props.variant='primary'] - The visual style variant of the button.
 * @param {ButtonSize} [props.size='md'] - The size of the button.
 * @param {boolean} [props.fullWidth] - Whether the button should take full width.
 * @param {React.ReactNode} [props.leftIcon] - Icon to display on the left side.
 * @param {React.ReactNode} [props.rightIcon] - Icon to display on the right side.
 * @returns {JSX.Element} A styled button element with optional icons.
 *
 * @remarks
 * This component provides a flexible button implementation that supports:
 * - Multiple visual variants for different use cases
 * - Configurable sizes to fit various UI contexts
 * - Left and right icons with proper alignment
 * - Full accessibility support with ARIA attributes
 * - Loading and disabled states for better UX
 *
 * Icons are wrapped in span elements with flex alignment to ensure proper
 * vertical alignment with the button text content.
 *
 * @example
 * ```tsx
 * <Button
 *   variant="primary"
 *   size="lg"
 *   leftIcon={<SaveIcon />}
 *   onClick={handleSave}
 * >
 *   Save Changes
 * </Button>
 * ```
 */
export const Button: React.FC<AppButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth,
  leftIcon,
  rightIcon,
  ...rest
}) => {
  return (
    <StyledButton $variant={variant} $size={size} $fullWidth={fullWidth} {...(rest as any)}>
      {leftIcon && <span style={iconWrapperStyle}>{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span style={iconWrapperStyle}>{rightIcon}</span>}
    </StyledButton>
  );
};

export default Button;
