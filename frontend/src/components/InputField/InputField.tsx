import React, { useState, useRef, useEffect, useCallback, memo, useLayoutEffect } from 'react';
import { useTheme } from 'styled-components';
import {
  InputWrapper,
  InputLabel,
  StyledInputContainer,
  StyledInput,
  StyledTemplateContainer,
  TemplateText,
  EditablePlaceholder,
  EditablePlaceholderSelect,
  HiddenSizer,
  ErrorMessage,
  HelperText,
  TemplateClearButton,
  InputFieldSize,
} from './InputField.styles';

/**
 * Represents a segment in template mode, either static text or an editable placeholder.
 */
export interface TemplateSegment {
  /** Unique identifier for the segment */
  id: string;
  /** Type of segment - either static text or editable placeholder */
  type: 'text' | 'placeholder';
  /** Current content/value of the segment */
  content: string;
  /** Original placeholder name (for placeholder type segments) */
  placeholder?: string;
}

/**
 * Props interface for the InputField component.
 */
export interface InputFieldProps {
  // Basic props
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  size?: InputFieldSize;
  fullWidth?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;

  // Template mode props
  isTemplateMode?: boolean;
  templateSegments?: TemplateSegment[];
  /**
   * Optional map of placeholder name -> list of option values. When a placeholder's
   * name matches a key here, the placeholder is rendered as a dropdown rather than
   * a free-text input. The static template text always remains non-editable.
   */
  placeholderOptions?: Record<string, string[]>;

  // Event handlers
  onChange?: (value: string) => void;
  onTemplateChange?: (segments: TemplateSegment[]) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;

  // HTML attributes
  id?: string;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
  'aria-label'?: string;
}

/**
 * Parses a template string containing placeholder patterns into structured segments.
 *
 * @param {string} template - The template string containing text and placeholders in [placeholder] format.
 * @returns {TemplateSegment[]} An array of segments representing text and placeholder parts.
 *
 * @remarks
 * This function processes template strings that contain placeholders wrapped in square brackets.
 * It splits the template into alternating text and placeholder segments, preserving the order
 * and structure for dynamic input field rendering.
 *
 * Placeholder pattern: [placeholder_name]
 * Text segments contain static content between placeholders.
 *
 * @example
 * ```tsx
 * const template = "Hello [name], welcome to [place]!";
 * const segments = parseTemplate(template);
 * // Returns: [
 * //   { id: "segment-0", type: "text", content: "Hello " },
 * //   { id: "segment-1", type: "placeholder", content: "", placeholder: "name" },
 * //   { id: "segment-2", type: "text", content: ", welcome to " },
 * //   { id: "segment-3", type: "placeholder", content: "", placeholder: "place" },
 * //   { id: "segment-4", type: "text", content: "!" }
 * // ]
 * ```
 */
export const parseTemplate = (template: string): TemplateSegment[] => {
  const segments: TemplateSegment[] = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;
  let segmentId = 0;

  while ((match = regex.exec(template)) !== null) {
    // Add text before the placeholder
    if (match.index > lastIndex) {
      const textContent = template.slice(lastIndex, match.index);
      if (textContent) {
        segments.push({
          id: `segment-${segmentId++}`,
          type: 'text',
          content: textContent,
        });
      }
    }

    // Add the placeholder
    segments.push({
      id: `segment-${segmentId++}`,
      type: 'placeholder',
      content: '',
      placeholder: match[1],
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text after the last placeholder
  if (lastIndex < template.length) {
    const textContent = template.slice(lastIndex);
    if (textContent) {
      segments.push({
        id: `segment-${segmentId++}`,
        type: 'text',
        content: textContent,
      });
    }
  }

  return segments;
};

/**
 * Converts an array of template segments back into a complete string representation.
 *
 * @param {TemplateSegment[]} segments - The array of template segments to convert.
 * @returns {string} The complete string representation of all segments combined.
 *
 * @remarks
 * This function reconstructs a template string from its segment representation.
 * Text segments are included as-is, while placeholder segments are converted back
 * to their bracket notation. If a placeholder has content, that content is used;
 * otherwise, the original placeholder name is wrapped in brackets.
 *
 * @example
 * ```tsx
 * const segments = [
 *   { id: "1", type: "text", content: "Hello " },
 *   { id: "2", type: "placeholder", content: "John", placeholder: "name" },
 *   { id: "3", type: "text", content: "!" }
 * ];
 * const result = segmentsToString(segments);
 * // Returns: "Hello John!"
 * ```
 */
export const segmentsToString = (segments: TemplateSegment[]): string => {
  return segments
    .map((segment) => {
      if (segment.type === 'text') {
        return segment.content;
      } else {
        return segment.content || `[${segment.placeholder}]`;
      }
    })
    .join('');
};

// Auto-resizing input component - moved outside to prevent recreation
const AutoResizingInput = memo<{
  segment: TemplateSegment;
  size: InputFieldSize;
  disabled?: boolean;
  onContentChange: (content: string) => void;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
}>(({ segment, size, disabled, onContentChange, onInputFocus, onInputBlur }) => {
  const theme = useTheme();
  const cfg = theme.component.inputField;
  const [inputValue, setInputValue] = useState(segment.content);
  const [inputWidth, setInputWidth] = useState<number>(cfg.minPlaceholderWidth);
  const sizerRef = useRef<HTMLSpanElement>(null);
  const inputElementRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<number | null>(null);
  const lastMeasuredWidth = useRef<number>(cfg.minPlaceholderWidth);

  useEffect(() => {
    setInputValue(segment.content);
  }, [segment.content]);

  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      // Prefer measuring the hidden sizer (accurate with same padding)
      let measure = 0;
      if (sizerRef.current) {
        measure = sizerRef.current.offsetWidth;
      } else if (inputElementRef.current) {
        measure = inputElementRef.current.scrollWidth; // fallback
      }
      // Add buffer so last glyph isn't clipped and space for caret
      const desired = Math.max(cfg.minPlaceholderWidth, Math.min(cfg.maxPlaceholderWidth, measure + cfg.widthBuffer));
      // Allow growth immediately; allow shrink only if big difference (>threshold) to prevent oscillation
      const prev = lastMeasuredWidth.current;
      const shouldUpdate = desired > prev || prev - desired > cfg.shrinkThreshold;
      if (shouldUpdate) {
        lastMeasuredWidth.current = desired;
        setInputWidth(desired);
      }
    });
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [inputValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onContentChange(newValue);
    },
    [onContentChange],
  );

  const handleFocus = useCallback(() => {
    onInputFocus?.();
  }, [onInputFocus]);

  const handleBlur = useCallback(() => {
    onInputBlur?.();
  }, [onInputBlur]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputElementRef.current) {
      inputElementRef.current.focus();
    }
  }, []);

  // Listen for custom focus events to programmatically focus correct placeholder
  useEffect(() => {
    const listener = (e: Event) => {
      const custom = e as CustomEvent<{ id: string }>;
      if (custom.detail?.id === segment.id && inputElementRef.current) {
        // Focus without scrolling
        inputElementRef.current.focus({ preventScroll: true } as any);
      }
    };
    document.addEventListener('focus-template-placeholder', listener as EventListener);
    return () => document.removeEventListener('focus-template-placeholder', listener as EventListener);
  }, [segment.id]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} onClick={handleClick}>
      <HiddenSizer ref={sizerRef}>{inputValue || segment.placeholder || 'placeholder'}</HiddenSizer>
      <EditablePlaceholder
        ref={inputElementRef}
        $size={size}
        value={inputValue}
        placeholder={segment.placeholder}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        style={{ width: inputWidth, transition: 'width 90ms ease-out' }}
      />
    </div>
  );
});

/**
 * A flexible input field component supporting both standard text input and template mode with dynamic placeholders.
 *
 * @param {InputFieldProps} props - The component props containing input configuration.
 * @param {string} [props.label] - Optional label displayed above the input.
 * @param {string} [props.placeholder=''] - Placeholder text for empty input.
 * @param {string} [props.value] - Controlled value of the input.
 * @param {string} [props.defaultValue] - Default value for uncontrolled usage.
 * @param {InputFieldSize} [props.size='md'] - Size variant of the input.
 * @param {boolean} [props.fullWidth=false] - Whether input takes full container width.
 * @param {boolean} [props.disabled=false] - Whether the input is disabled.
 * @param {boolean} [props.readOnly=false] - Whether the input is read-only.
 * @param {boolean} [props.required=false] - Whether the input is required.
 * @param {string} [props.error] - Error message to display below input.
 * @param {string} [props.helperText] - Helper text displayed below input.
 * @param {boolean} [props.isTemplateMode=false] - Enable template mode with editable placeholders.
 * @param {TemplateSegment[]} [props.templateSegments] - Initial template segments for template mode.
 * @param {Function} [props.onChange] - Callback fired when input value changes.
 * @param {Function} [props.onTemplateChange] - Callback fired when template segments change.
 * @returns {JSX.Element} A versatile input component with standard or template editing capabilities.
 *
 * @remarks
 * This input component provides two distinct modes of operation:
 *
 * **Standard Mode:**
 * - Functions as a regular text input with styling and validation
 * - Supports all standard input props and behaviors
 * - Includes error states, helper text, and accessibility features
 *
 * **Template Mode:**
 * - Enables editing of template strings with placeholder segments
 * - Parses template strings into editable text and placeholder sections
 * - Provides real-time template editing with auto-resizing inputs
 * - Maintains template structure while allowing content modification
 *
 * Key features:
 * - Flexible sizing options for different contexts
 * - Comprehensive error handling and validation display
 * - Full accessibility support with proper ARIA attributes
 * - Auto-focus and keyboard navigation support
 * - Seamless switching between controlled and uncontrolled modes
 *
 * Template mode is particularly useful for creating dynamic prompts,
 * message templates, or any scenario where users need to customize
 * predefined text structures while maintaining consistent formatting.
 *
 * @example
 * ```tsx
 * // Standard input
 * <InputField
 *   label="Username"
 *   placeholder="Enter your username"
 *   value={username}
 *   onChange={setUsername}
 *   error={usernameError}
 * />
 *
 * // Template mode
 * <InputField
 *   isTemplateMode
 *   templateSegments={parseTemplate("Hello [name], welcome to [place]!")}
 *   onTemplateChange={handleTemplateChange}
 * />
 * ```
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder = '',
  value,
  defaultValue,
  size = 'md',
  fullWidth = false,
  disabled = false,
  readOnly = false,
  required = false,
  error,
  helperText,
  isTemplateMode = false,
  templateSegments: initialTemplateSegments,
  placeholderOptions,
  onChange,
  onTemplateChange,
  onClear,
  onFocus,
  onBlur,
  onKeyDown,
  id,
  name,
  autoComplete,
  autoFocus,
  className,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || defaultValue || '');
  // Keep templateSegments in a ref to avoid remounting placeholder inputs each keystroke
  const templateSegmentsRef = useRef<TemplateSegment[]>(initialTemplateSegments || []);
  const [, forceRerender] = useState(0); // for controlled updates without recreating component tree
  const lastFocusedPlaceholderId = useRef<string | null>(null);
  const firstPlaceholderAutoFocused = useRef(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update internal value when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (initialTemplateSegments) {
      templateSegmentsRef.current = initialTemplateSegments;
      forceRerender((v) => v + 1);
      firstPlaceholderAutoFocused.current = false;
    }
  }, [initialTemplateSegments]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
    },
    [onChange],
  );

  const handleTemplateSegmentChange = useCallback(
    (segmentId: string, newContent: string) => {
      const updated = templateSegmentsRef.current.map((s) => (s.id === segmentId ? { ...s, content: newContent } : s));
      templateSegmentsRef.current = updated;
      const fullValue = segmentsToString(updated);
      onChange?.(fullValue);
      onTemplateChange?.(updated);
      lastFocusedPlaceholderId.current = segmentId;
      forceRerender((v) => v + 1);
    },
    [onChange, onTemplateChange],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (!disabled && !readOnly) {
        // Focus first placeholder if in template mode
        if (isTemplateMode) {
          const firstEditable = templateSegmentsRef.current.find((s) => s.type === 'placeholder');
          if (firstEditable) {
            lastFocusedPlaceholderId.current = firstEditable.id;
            forceRerender((v) => v + 1);
            return;
          }
        }
        if (inputRef.current) inputRef.current.focus();
      }
    },
    [disabled, readOnly, isTemplateMode],
  );

  // Outside click handler to blur component in template mode
  useEffect(() => {
    if (!isTemplateMode) return;
    const handleDocMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(e.target as Node)) return; // inside
      setIsFocused(false);
      lastFocusedPlaceholderId.current = null;
      const active = document.activeElement as HTMLElement | null;
      if (active && containerRef.current.contains(active)) {
        active.blur();
      }
    };
    document.addEventListener('mousedown', handleDocMouseDown);
    return () => document.removeEventListener('mousedown', handleDocMouseDown);
  }, [isTemplateMode]);

  // After each render, if we have a placeholder to focus (new template or last tracked), dispatch a custom event that inputs listen for
  useLayoutEffect(() => {
    if (!isTemplateMode) return;
    if (!isFocused) return; // only auto-focus placeholders while component is focused
    const placeholders = templateSegmentsRef.current.filter((s) => s.type === 'placeholder');
    if (placeholders.length === 0) return;
    // On first template load focus first placeholder
    if (!firstPlaceholderAutoFocused.current) {
      lastFocusedPlaceholderId.current = placeholders[0].id;
      firstPlaceholderAutoFocused.current = true;
    }
    if (lastFocusedPlaceholderId.current) {
      // Fire a document event carrying the id to focus
      const evt = new CustomEvent('focus-template-placeholder', { detail: { id: lastFocusedPlaceholderId.current } });
      document.dispatchEvent(evt);
    }
  }, [isTemplateMode, isFocused]);

  const hasError = Boolean(error);

  return (
    <InputWrapper className={className} style={style}>
      {label && (
        <InputLabel htmlFor={id}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </InputLabel>
      )}

      {isTemplateMode ? (
        <StyledTemplateContainer
          ref={containerRef}
          $size={size}
          $fullWidth={fullWidth}
          $disabled={disabled}
          $focused={isFocused}
          $hasError={hasError}
          onClick={handleContainerClick}
          {...rest}
        >
          {templateSegmentsRef.current.map((segment) => {
            if (segment.type === 'text') {
              return (
                <React.Fragment key={segment.id}>
                  <TemplateText>{segment.content}</TemplateText>
                </React.Fragment>
              );
            }
            if (segment.placeholder === 'Client Name') {
              return (
                <React.Fragment key={segment.id}>
                  <TemplateText>{segment.content || segment.placeholder}</TemplateText>
                </React.Fragment>
              );
            }
            const options =
              segment.placeholder && placeholderOptions?.[segment.placeholder]
                ? placeholderOptions[segment.placeholder]
                : undefined;
            if (options) {
              return (
                <EditablePlaceholderSelect
                  key={segment.id}
                  $size={size}
                  value={segment.content}
                  disabled={disabled || options.length === 0}
                  onChange={(e) => handleTemplateSegmentChange(segment.id, e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="" disabled>
                    {segment.placeholder || 'Select'}
                  </option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </EditablePlaceholderSelect>
              );
            }
            return (
              <AutoResizingInput
                key={segment.id}
                segment={segment}
                size={size}
                disabled={disabled}
                onContentChange={(content) => handleTemplateSegmentChange(segment.id, content)}
                onInputFocus={handleFocus}
                onInputBlur={handleBlur}
              />
            );
          })}
          {onClear && (
            <TemplateClearButton
              type="button"
              aria-label="Clear template"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => { e.stopPropagation(); onClear(); }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </TemplateClearButton>
          )}
        </StyledTemplateContainer>
      ) : (
        <StyledInputContainer
          $size={size}
          $fullWidth={fullWidth}
          $disabled={disabled}
          $focused={isFocused}
          $hasError={hasError}
          onClick={handleContainerClick}
        >
          <StyledInput
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            value={internalValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
            {...rest}
          />
        </StyledInputContainer>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </InputWrapper>
  );
};
