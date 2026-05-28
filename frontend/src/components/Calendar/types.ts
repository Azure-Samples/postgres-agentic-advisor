/**
 * Type definitions for the Calendar component
 */

/** Calendar trigger button + modal props */
export interface CalendarProps {
  /** The currently selected date value */
  value?: Date | string | null;

  /** Callback fired when a date is confirmed */
  onChange?: (date: Date) => void;

  /** Placeholder text shown when no date is selected */
  placeholder?: string;

  /** HTML id for the trigger button */
  id?: string;

  /** Whether the calendar is disabled */
  disabled?: boolean;

  /** Additional CSS class name */
  className?: string;

  /** Additional inline styles */
  style?: React.CSSProperties;
}

/** Props for the DateSelectModal */
export interface DateSelectModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;

  /** Close the modal without committing */
  onClose: () => void;

  /** The currently committed date value */
  currentValue: Date | null;

  /** Called with the chosen date when the user clicks Done */
  onConfirm: (date: Date) => void;
}
