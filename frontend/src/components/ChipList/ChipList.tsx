import React, { useState, useMemo } from 'react';
import { Chip, ChipProps } from '../Chip';
import { ChipListWrapper } from './ChipList.styles';

/**
 * Represents a single chip item in the chip list.
 * Extends ChipProps but replaces the onClick handler with item-specific version.
 */
export interface ChipItem extends Omit<ChipProps, 'onClick'> {
  /** Unique identifier for the chip item */
  key: string | number;
  /** Click handler that receives the chip item and event */
  onClick?: (item: ChipItem, e: React.MouseEvent) => void;
}

/**
 * Props interface for the ChipList component.
 */
export interface ChipListProps {
  /** Array of chip items to display */
  items: ChipItem[];
  /** Maximum number of chips to show before truncating */
  maxVisible?: number;
  /** Whether chips should wrap to multiple lines */
  wrap?: boolean;
  /** Gap spacing between chips in pixels */
  gap?: number;
  /** Default size for all chips in the list */
  size?: ChipProps['size'];
  /** Default variant for all chips in the list */
  variant?: ChipProps['variant'];
  /** Whether chips should be clickable by default */
  clickable?: boolean;
  /** Global click handler for chip items */
  onItemClick?: (item: ChipItem, e: React.MouseEvent) => void;
  /** Function to generate overflow label text */
  overflowLabelBuilder?: (hiddenCount: number) => string;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** HTML id attribute */
  id?: string;
}

/**
 * A flexible component for displaying collections of chips with overflow handling and interaction support.
 *
 * @param {ChipListProps} props - The component props containing chip list configuration.
 * @param {ChipItem[]} props.items - Array of chip items to display.
 * @param {number} [props.maxVisible=5] - Maximum chips shown before truncation.
 * @param {boolean} [props.wrap=false] - Whether to allow wrapping to multiple lines.
 * @param {number} [props.gap=8] - Spacing between chips in pixels.
 * @param {string} [props.size='md'] - Default size for all chips.
 * @param {string} [props.variant='default'] - Default variant for all chips.
 * @param {Function} [props.overflowLabelBuilder] - Custom overflow text generator.
 * @returns {JSX.Element} A responsive chip list with overflow management and interactions.
 *
 * @remarks
 * This component provides advanced chip collection management with:
 * - Automatic overflow handling with expandable "show more" functionality
 * - Flexible layout options (wrapping vs single line)
 * - Consistent styling across all chips with individual overrides
 * - Individual and global click handling
 * - Customizable spacing and appearance
 *
 * Overflow behavior:
 * - When items exceed maxVisible, remaining chips are hidden
 * - A special overflow chip shows the count of hidden items
 * - Clicking the overflow chip expands to show all items
 * - The overflow label is customizable via overflowLabelBuilder
 *
 * The component efficiently manages state to track expansion while
 * maintaining performance through memoization of visible/hidden item calculations.
 *
 * Each chip can have individual properties while inheriting defaults
 * from the list-level configuration.
 *
 * @example
 * ```tsx
 * <ChipList
 *   items={[
 *     { key: '1', label: 'JavaScript', onClick: handleTagClick },
 *     { key: '2', label: 'React', variant: 'primary' },
 *     { key: '3', label: 'TypeScript' }
 *   ]}
 *   maxVisible={3}
 *   size="sm"
 *   overflowLabelBuilder={(count) => `+${count} technologies`}
 * />
 * ```
 */
export const ChipList: React.FC<ChipListProps> = ({
  items,
  maxVisible = 5,
  wrap = false,
  gap = 8,
  size = 'md',
  variant = 'default',
  clickable,
  onItemClick,
  overflowLabelBuilder = (n) => `+${n} more`,
  ...rest
}) => {
  const [showAll, setShowAll] = useState(false);

  const { visibleItems, hiddenItems } = useMemo(() => {
    if (showAll || items.length <= maxVisible) {
      return { visibleItems: items, hiddenItems: [] as ChipItem[] };
    }
    return { visibleItems: items.slice(0, maxVisible), hiddenItems: items.slice(maxVisible) };
  }, [items, maxVisible, showAll]);

  const hiddenCount = hiddenItems.length;

  return (
    <ChipListWrapper $wrap={wrap} $gap={gap} {...rest}>
      {visibleItems.map((item) => (
        <Chip
          key={item.key}
          variant={item.variant || variant}
          size={item.size || size}
          label={item.label}
          clickable={item.clickable ?? clickable}
          selected={item.selected}
          disabled={item.disabled}
          startIcon={item.startIcon}
          endIcon={item.endIcon}
          onClick={(e) => (item.onClick ? item.onClick(item, e) : onItemClick?.(item, e))}
        />
      ))}
      {!showAll && hiddenCount > 0 && (
        <Chip
          key="__overflow"
          label={overflowLabelBuilder(hiddenCount)}
          variant={variant}
          size={size}
          onClick={() => setShowAll(true)}
        />
      )}
      {showAll &&
        hiddenCount > 0 &&
        hiddenItems.map((item) => (
          <Chip
            key={item.key}
            variant={item.variant || variant}
            size={item.size || size}
            label={item.label}
            clickable={item.clickable ?? clickable}
            selected={item.selected}
            disabled={item.disabled}
            startIcon={item.startIcon}
            endIcon={item.endIcon}
            onClick={(e) => (item.onClick ? item.onClick(item, e) : onItemClick?.(item, e))}
          />
        ))}
    </ChipListWrapper>
  );
};

export default ChipList;
