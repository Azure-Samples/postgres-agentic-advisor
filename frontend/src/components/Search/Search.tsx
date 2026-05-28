import React, { useState, useCallback, useEffect } from 'react';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { StyledSearchContainer, StyledSearch, SearchIcon, ClearButton, SearchSize } from './Search.styles';

/**
 * Props interface for the Search component.
 */
export interface SearchProps {
  /** Placeholder text displayed when input is empty */
  placeholder?: string;
  /** Current value of the search input */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Size variant of the search input */
  size?: SearchSize;
  /** Whether the search input should take full width */
  fullWidth?: boolean;
  /** Whether the search input is disabled */
  disabled?: boolean;
  /** Whether the search input is in loading state */
  loading?: boolean;
  /** Whether to show a clear button when input has value */
  allowClear?: boolean;
  /** Debounce delay in milliseconds for search callbacks */
  debounceMs?: number;
  /** Maximum character length for input */
  maxLength?: number;
  /** Element to display before the input */
  prefix?: React.ReactNode;
  /** Element to display after the input */
  suffix?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** HTML id attribute */
  id?: string;
  /** Accessibility label */
  'aria-label'?: string;
  /** Test identifier for testing frameworks */
  'data-testid'?: string;
  /** Callback fired on every input change */
  onChange?: (value: string) => void;
  /** Debounced callback fired for search operations */
  onSearch?: (value: string) => void;
  /** Callback fired when clear button is clicked */
  onClear?: () => void;
  /** Callback fired when input gains focus */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Callback fired when input loses focus */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Callback fired when Enter key is pressed */
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * A search input component with debouncing, clear functionality, and customizable styling.
 *
 * @param {SearchProps} props - The component props containing search input configuration.
 * @param {string} [props.placeholder='Search...'] - Placeholder text for the input.
 * @param {string} [props.value] - Current value of the search input.
 * @param {SearchSize} [props.size='md'] - Size variant of the search input.
 * @param {boolean} [props.fullWidth=true] - Whether to take full width.
 * @param {boolean} [props.allowClear=true] - Whether to show clear button.
 * @param {number} [props.debounceMs=300] - Debounce delay for search callback.
 * @param {Function} [props.onChange] - Input change handler.
 * @param {Function} [props.onSearch] - Debounced search handler.
 * @returns {JSX.Element} A styled search input with integrated search and clear functionality.
 *
 * @remarks
 * This search component provides enhanced functionality over a standard input:
 * - Built-in search icon for visual clarity
 * - Optional clear button for easy input clearing
 * - Debounced search callback to optimize performance
 * - Loading state indicator
 * - Keyboard event handling (Enter key support)
 * - Prefix and suffix slot support for custom elements
 *
 * The component implements debouncing to prevent excessive API calls or processing
 * during rapid typing. The debounce delay is configurable via the debounceMs prop.
 *
 * The clear functionality is automatically enabled when allowClear is true and
 * the input has a value, providing a consistent UX pattern.
 *
 * @example
 * ```tsx
 * <Search
 *   placeholder="Search products..."
 *   debounceMs={500}
 *   onSearch={(term) => performSearch(term)}
 *   onChange={(value) => setSearchTerm(value)}
 *   loading={isSearching}
 * />
 * ```
 */
export const Search: React.FC<SearchProps> = ({
  placeholder = 'Search...',
  value,
  defaultValue,
  size = 'md',
  fullWidth = true,
  disabled = false,
  loading = false,
  allowClear = true,
  debounceMs = 300,
  maxLength,
  prefix,
  suffix,
  className,
  style,
  id,
  onChange,
  onSearch,
  onClear,
  onFocus,
  onBlur,
  onPressEnter,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [focused, setFocused] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Use controlled or uncontrolled pattern
  const currentValue = value !== undefined ? value : internalValue;
  const isControlled = value !== undefined;

  // Debounced search handler
  const debouncedSearch = useCallback(
    (searchValue: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        onSearch?.(searchValue);
      }, debounceMs);

      setDebounceTimer(timer);
    },
    [onSearch, debounceMs, debounceTimer],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);

    if (onSearch) {
      debouncedSearch(newValue);
    }
  };

  const handleClear = () => {
    const newValue = '';

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
    onClear?.();

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
    onSearch?.(newValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear debounce timer and trigger immediate search
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
    onSearch?.(currentValue);
    onPressEnter?.(e);
  };

  const prefixIcon = prefix || (
    <SearchIcon>
      <SearchOutlined />
    </SearchIcon>
  );

  const suffixIcon = () => {
    const icons = [];

    if (allowClear && currentValue && !disabled) {
      icons.push(
        <ClearButton key="clear" type="button" onClick={handleClear} aria-label="Clear search" tabIndex={-1}>
          <CloseOutlined />
        </ClearButton>,
      );
    }

    //custom suffix
    if (suffix) {
      icons.push(suffix);
    }

    return icons.length > 0 ? <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{icons}</div> : null;
  };

  return (
    <StyledSearchContainer $size={size} $fullWidth={fullWidth} $focused={focused} className={className} style={style}>
      <StyledSearch
        id={id}
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        prefix={prefixIcon}
        suffix={suffixIcon()}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPressEnter={handlePressEnter}
        $size={size}
        $fullWidth={fullWidth}
        $focused={focused}
        {...rest}
      />
    </StyledSearchContainer>
  );
};

export default Search;
