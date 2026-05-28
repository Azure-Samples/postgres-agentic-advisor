import React from 'react';
import { CloseOutlined, ExclamationCircleFilled, WarningFilled, InfoCircleFilled } from '@ant-design/icons';
import { SuccessIcon } from '@/icons';
import { ToastContainer, IconContainer, Content, Message, CloseButton, type ToastVariant } from './Toast.styles';

/**
 * Props interface for the Toast component.
 */
export interface ToastProps {
  /** Visual variant determining color scheme and icon */
  variant?: ToastVariant;
  /** The message text to display in the toast */
  message: string;
  /** Callback fired when the toast is closed */
  onClose?: () => void;
  /** Whether the toast should automatically close after a delay */
  autoClose?: boolean;
  /** Time in milliseconds before auto-closing the toast */
  autoCloseDelay?: number;
  /** Additional CSS class name */
  className?: string;
  /** Unique identifier for the toast */
  id?: string;
}

/**
 * Returns the appropriate icon component for a given toast variant.
 *
 * @param {ToastVariant} variant - The toast variant type.
 * @returns {React.ReactNode} The corresponding icon component for the variant.
 *
 * @remarks
 * This function maps toast variants to their visual indicators:
 * - success: Custom success checkmark icon
 * - error: Filled exclamation circle (error state)
 * - warning: Filled warning triangle
 * - info: Filled info circle (default)
 *
 * All icons are sized consistently at 28px for visual harmony.
 */
const getToastIcon = (variant: ToastVariant): React.ReactNode => {
  switch (variant) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ExclamationCircleFilled style={{ fontSize: '28px' }} />;
    case 'warning':
      return <WarningFilled style={{ fontSize: '28px' }} />;
    case 'info':
      return <InfoCircleFilled style={{ fontSize: '28px' }} />;
    default:
      return <InfoCircleFilled style={{ fontSize: '28px' }} />;
  }
};

/**
 * A notification toast component for displaying temporary messages to users.
 *
 * @param {ToastProps} props - The component props containing toast configuration.
 * @param {ToastVariant} [props.variant='info'] - The visual style variant.
 * @param {string} props.message - The message text to display.
 * @param {Function} [props.onClose] - Callback for manual or automatic closure.
 * @param {boolean} [props.autoClose=true] - Whether to auto-close the toast.
 * @param {number} [props.autoCloseDelay=5000] - Auto-close delay in milliseconds.
 * @returns {JSX.Element} A styled toast notification with icon, message, and close button.
 *
 * @remarks
 * This toast component provides user notifications with:
 * - Multiple variants (success, error, warning, info) with appropriate colors and icons
 * - Automatic dismissal with configurable timing
 * - Manual close button for user control
 * - Smooth animations and transitions
 * - Event handling to prevent unwanted bubbling
 *
 * Auto-close behavior:
 * - Enabled by default with 5-second delay
 * - Can be disabled by setting autoClose to false
 * - Timer is automatically cleaned up on component unmount
 * - Custom delays can be set via autoCloseDelay prop
 *
 * The component is designed to work with a toast provider system
 * for managing multiple toasts and proper positioning.
 *
 * Accessibility features include proper color contrast for different
 * variants and clear visual hierarchy with consistent iconography.
 *
 * @example
 * ```tsx
 * <Toast
 *   variant="success"
 *   message="Profile updated successfully!"
 *   autoCloseDelay={3000}
 *   onClose={() => removeToast(id)}
 * />
 * ```
 */
export const Toast: React.FC<ToastProps> = ({
  variant = 'info',
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
  className,
  id,
}) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose?.();
  };

  return (
    <ToastContainer $variant={variant} className={className} id={id} role="alert" aria-live="polite">
      <IconContainer $variant={variant}>{getToastIcon(variant)}</IconContainer>

      <Content>
        <Message $variant={variant}>{message}</Message>
      </Content>

      {onClose && (
        <CloseButton $variant={variant} onClick={handleClose} aria-label="Close notification" type="button">
          <CloseOutlined style={{ fontSize: '14px' }} />
        </CloseButton>
      )}
    </ToastContainer>
  );
};
