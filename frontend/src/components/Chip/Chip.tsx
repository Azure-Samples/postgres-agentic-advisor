import React from 'react';
import { StyledChip, ChipVariant, ChipSize } from './Chip.styles';

/**
 * Props interface for the Chip component.
 */
export interface ChipProps {
  /** The text content displayed in the chip */
  label: string;
  /** Visual style variant of the chip */
  variant?: ChipVariant;
  /** Size of the chip */
  size?: ChipSize;
  /** Icon displayed at the start of the chip */
  startIcon?: React.ReactNode;
  /** Icon displayed at the end of the chip */
  endIcon?: React.ReactNode;
  /** Whether the chip is in a selected state */
  selected?: boolean;
  /** Whether the chip is disabled */
  disabled?: boolean;
  /** Whether the chip should be clickable (overrides auto-detection) */
  clickable?: boolean;
  /** Click event handler */
  onClick?: (e: React.MouseEvent) => void;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** HTML id attribute */
  id?: string;
  /** Tooltip text for the chip */
  title?: string;
}

/**
 * A compact UI element that represents a piece of information, tag, or filter option.
 *
 * @param {ChipProps} props - The component props containing chip configuration.
 * @param {string} props.label - The text content to display in the chip.
 * @param {ChipVariant} [props.variant='default'] - The visual style variant.
 * @param {ChipSize} [props.size='sm'] - The size of the chip.
 * @param {React.ReactNode} [props.startIcon] - Icon to display at the start.
 * @param {React.ReactNode} [props.endIcon] - Icon to display at the end.
 * @param {boolean} [props.selected] - Whether the chip is selected.
 * @param {boolean} [props.disabled] - Whether the chip is disabled.
 * @param {boolean} [props.clickable] - Override for clickable behavior.
 * @param {Function} [props.onClick] - Click event handler.
 * @returns {JSX.Element} A styled chip element with optional icons and interactions.
 *
 * @remarks
 * Chips are commonly used for:
 * - Tags and labels
 * - Filter options in search interfaces
 * - Selection indicators
 * - Status badges
 *
 * The component automatically determines if it should be clickable based on the
 * presence of an onClick handler, but this can be overridden with the clickable prop.
 *
 * Accessibility features include:
 * - Proper ARIA attributes for interactive chips
 * - Keyboard navigation support (tab index management)
 * - Screen reader friendly structure with aria-hidden icons
 *
 * @example
 * ```tsx
 * <Chip
 *   label="JavaScript"
 *   variant="primary"
 *   startIcon={<JsIcon />}
 *   onClick={handleTagClick}
 *   selected={isSelected}
 * />
 * ```
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'default',
  size = 'sm',
  startIcon,
  endIcon,
  selected,
  disabled,
  clickable,
  onClick,
  ...rest
}) => {
  return (
    <StyledChip
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : -1}
      aria-disabled={disabled}
      $variant={variant}
      $size={size}
      $clickable={clickable !== undefined ? clickable : !!onClick}
      $selected={selected}
      $disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {startIcon && (
        <span className="chip-icon" aria-hidden>
          {startIcon}
        </span>
      )}
      <span className="chip-label" title={rest.title || label}>
        {label}
      </span>
      {endIcon && (
        <span className="chip-icon" aria-hidden>
          {endIcon}
        </span>
      )}
    </StyledChip>
  );
};

export default Chip;
