import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { SearchOutlined } from '@ant-design/icons';
import { ChevronUpDownIcon } from '@/icons';
import {
  DropdownWrapper,
  StyledDropdown,
  DropdownContent,
  DropdownText,
  DropdownPlaceholder,
  DropdownIcon,
  StyledDropdownList,
  DropdownSearchContainer,
  DropdownSearchInput,
  DropdownSearchInputWrapper,
  DropdownSearchIcon,
  StyledDropdownItem,
  DropdownItemText,
  DropdownEmptyState,
  DropdownLoadingState,
  DropdownSize,
  DropdownPlacement,
} from './Dropdown.styles';

/**
 * Represents a single option in the dropdown list.
 */
export interface DropdownOption {
  /** The display text for the option */
  label: string;
  /** The underlying value of the option */
  value: string | number;
  /** Whether this option is disabled and cannot be selected */
  disabled?: boolean;
  /** Optional icon to display alongside the option */
  icon?: React.ReactNode;
  /** Additional descriptive text for the option */
  description?: string;
}

/**
 * Props interface for the Dropdown component.
 */
export interface DropdownProps {
  options?: DropdownOption[];
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  size?: DropdownSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  hasSearch?: boolean;
  searchPlaceholder?: string;
  maxHeight?: number;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'aria-label'?: string;
  'data-testid'?: string;
  // Async support
  onSearch?: (searchTerm: string) => void;
  searchDebounceMs?: number;
  // Event handlers
  onChange?: (value: string | number, option: DropdownOption) => void;
  onDropdownToggle?: (isOpen: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  // Custom render functions
  renderOption?: (option: DropdownOption, index: number) => React.ReactNode;
  renderSelected?: (option: DropdownOption) => React.ReactNode;
  // States
  emptyText?: string;
  loadingText?: string;
}

/**
 * A flexible dropdown component with search, async loading, and customization support.
 *
 * @param {DropdownProps} props - The component props containing dropdown configuration.
 * @param {DropdownOption[]} [props.options=[]] - Array of options to display.
 * @param {string | number} [props.value] - Currently selected value.
 * @param {string} [props.placeholder='Select an option'] - Placeholder text.
 * @param {DropdownSize} [props.size='md'] - Size variant of the dropdown.
 * @param {boolean} [props.hasSearch=false] - Whether to include search functionality.
 * @param {number} [props.maxHeight=200] - Maximum height of the dropdown list.
 * @param {Function} [props.onChange] - Selection change handler.
 * @returns {JSX.Element} A feature-rich dropdown component with portal-based positioning.
 *
 * @remarks
 * This dropdown component provides comprehensive functionality including:
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Search/filtering capabilities with debouncing
 * - Async option loading support
 * - Portal-based rendering for proper z-index handling
 * - Automatic positioning (top/bottom based on available space)
 * - Custom renderers for options and selected values
 * - Full accessibility support with ARIA attributes
 * - Loading and empty states
 *
 * The component uses React Portal to render the dropdown list, ensuring it appears
 * above other UI elements regardless of container overflow or z-index constraints.
 *
 * Position calculation is performed dynamically to prevent the dropdown from
 * extending beyond viewport boundaries.
 *
 * @example
 * ```tsx
 * <Dropdown
 *   options={[
 *     { label: 'Option 1', value: '1', icon: <Icon1 /> },
 *     { label: 'Option 2', value: '2', disabled: true }
 *   ]}
 *   hasSearch
 *   placeholder="Choose an option"
 *   onChange={(value, option) => console.log(value, option)}
 * />
 * ```
 */
export const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  value,
  defaultValue,
  placeholder = 'Select an option',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  hasSearch = false,
  searchPlaceholder = 'Search...',
  maxHeight = 200,
  className,
  style,
  id,
  onSearch,
  searchDebounceMs = 300,
  onChange,
  onDropdownToggle,
  onFocus,
  onBlur,
  renderOption,
  renderSelected,
  emptyText = 'No options available',
  loadingText = 'Loading...',
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [placement, setPlacement] = useState<DropdownPlacement>('bottom');
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle controlled/uncontrolled value
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value !== undefined ? value : internalValue;

  // Find selected option
  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === currentValue);
  }, [options, currentValue]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!hasSearch || !searchTerm) return options;
    return options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm, hasSearch]);

  // Calculate optimal placement and position based on available space
  // Default to bottom, only use top if there's insufficient space below
  const calculatePlacement = useCallback(() => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const minRequiredSpace = 250; // Minimum space needed for dropdown menu

    // Prefer bottom placement, only switch to top if not enough space below
    setPlacement(spaceBelow >= minRequiredSpace ? 'bottom' : 'top');

    // Detect right-edge overflow: if left-anchoring would push the list off screen,
    // right-anchor it so the list's right edge aligns with the trigger's right edge.
    const LIST_MIN_WIDTH = 360;
    const wouldOverflowRight = rect.left + LIST_MIN_WIDTH > window.innerWidth - 16;
    const left = wouldOverflowRight
      ? rect.right + window.scrollX - LIST_MIN_WIDTH
      : rect.left + window.scrollX;

    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left,
      width: rect.width,
    });
  }, []);

  // Handle search with debouncing
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      if (onSearch) {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
          onSearch(value);
        }, searchDebounceMs);
      }
    },
    [onSearch, searchDebounceMs],
  );

  // Handle dropdown toggle
  const handleToggle = useCallback(() => {
    if (disabled) return;

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen) {
      calculatePlacement();
      // Focus search input if search is enabled
      if (hasSearch) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    } else {
      setSearchTerm('');
      setHoveredIndex(-1);
    }

    onDropdownToggle?.(newIsOpen);
  }, [disabled, isOpen, calculatePlacement, hasSearch, onDropdownToggle]);

  // Handle option selection
  const handleOptionSelect = useCallback(
    (option: DropdownOption) => {
      if (option.disabled) return;

      const newValue = option.value;

      if (value === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(newValue, option);
      setIsOpen(false);
      setSearchTerm('');
      setHoveredIndex(-1);
    },
    [value, onChange],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          handleToggle();
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setHoveredIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setHoveredIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHoveredIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (hoveredIndex >= 0 && hoveredIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[hoveredIndex]);
          }
          break;
      }
    },
    [isOpen, filteredOptions, hoveredIndex, handleToggle, handleOptionSelect],
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside both the dropdown trigger AND the portaled dropdown list
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
        setHoveredIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle window resize and scroll to recalculate placement
  useEffect(() => {
    if (isOpen) {
      const handleResize = () => calculatePlacement();
      const handleScroll = () => calculatePlacement();

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true); // Use capture for all scrollable elements

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen, calculatePlacement]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <DropdownWrapper ref={dropdownRef} className={className} style={style}>
      <StyledDropdown
        $size={size}
        $fullWidth={fullWidth}
        $disabled={disabled}
        $isOpen={isOpen}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={rest['aria-label']}
        data-testid={rest['data-testid']}
        id={id}
      >
        <DropdownContent>
          {selectedOption ? (
            renderSelected ? (
              renderSelected(selectedOption)
            ) : (
              <>
                {selectedOption.icon && selectedOption.icon}
                <DropdownText>{selectedOption.label}</DropdownText>
              </>
            )
          ) : (
            <DropdownPlaceholder>{placeholder}</DropdownPlaceholder>
          )}
        </DropdownContent>

        <DropdownIcon>
          <ChevronUpDownIcon />
        </DropdownIcon>
      </StyledDropdown>

      {/* Render dropdown menu in portal to avoid overflow issues */}
      {isOpen &&
        createPortal(
          <StyledDropdownList
            ref={listRef}
            $placement={placement}
            $maxHeight={maxHeight}
            $position={dropdownPosition}
            role="listbox"
          >
            {hasSearch && (
              <DropdownSearchContainer>
                <DropdownSearchInputWrapper>
                  <DropdownSearchInput
                    ref={searchInputRef}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <DropdownSearchIcon>
                    <SearchOutlined />
                  </DropdownSearchIcon>
                </DropdownSearchInputWrapper>
              </DropdownSearchContainer>
            )}

            {loading ? (
              <DropdownLoadingState>
                <span>{loadingText}</span>
              </DropdownLoadingState>
            ) : filteredOptions.length === 0 ? (
              <DropdownEmptyState>{emptyText}</DropdownEmptyState>
            ) : (
              filteredOptions.map((option, index) => (
                <StyledDropdownItem
                  key={option.value}
                  $isSelected={option.value === currentValue}
                  $isHovered={index === hoveredIndex}
                  onClick={() => handleOptionSelect(option)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(-1)}
                  role="option"
                  aria-selected={option.value === currentValue}
                >
                  {renderOption ? (
                    renderOption(option, index)
                  ) : (
                    <>
                      {option.icon && option.icon}
                      <DropdownItemText>{option.label}</DropdownItemText>
                    </>
                  )}
                </StyledDropdownItem>
              ))
            )}
          </StyledDropdownList>,
          document.body,
        )}
    </DropdownWrapper>
  );
};

export default Dropdown;
