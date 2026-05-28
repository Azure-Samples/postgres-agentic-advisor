import { useToast } from '@/components/Toast';
import { ToastVariant } from '@/components/Toast/Toast.styles';

/**
 * Custom hook providing a simplified interface for displaying toast notifications.
 *
 * @returns {Object} An object with methods for managing toast notifications.
 *
 * @remarks
 * This utility hook wraps the base toast functionality to provide a more
 * convenient API for common toast operations. It offers:
 * 
 * Features:
 * - Simplified show() method with variant-first parameter order
 * - Support for custom auto-close behavior and timing
 * - Direct access to toast management functions
 * - Type-safe variant selection
 * 
 * The hook abstracts the underlying toast context complexity while maintaining
 * full flexibility for customization. It's designed for components that need
 * to show notifications without dealing with toast context details.
 * 
 * Available variants:
 * - 'success': Green theme for successful operations
 * - 'error': Red theme for error states
 * - 'warning': Orange/yellow theme for warnings
 * - 'info': Blue theme for informational messages
 * 
 * Auto-close behavior can be customized per notification, allowing for
 * different display durations based on message importance or type.
 *
 * @example
 * ```tsx
 * const toast = useToastNotifications();
 * 
 * const handleSave = () => {
 *   try {
 *     saveData();
 *     toast.show('success', 'Data saved successfully!');
 *   } catch (error) {
 *     toast.show('error', 'Failed to save data', { 
 *       autoCloseDelay: 10000 
 *     });
 *   }
 * };
 * ```
 */
export const useToastNotifications = () => {
  const { showToast, hideToast, hideAllToasts } = useToast();

  /**
   * Displays a toast notification with the specified variant and message.
   *
   * @param {ToastVariant} variant - The visual style variant of the toast.
   * @param {string} message - The message text to display.
   * @param {Object} [options] - Optional configuration for the toast behavior.
   * @param {boolean} [options.autoClose] - Whether the toast should auto-close.
   * @param {number} [options.autoCloseDelay] - Delay in milliseconds before auto-close.
   */
  const show = (
    variant: ToastVariant,
    message: string,
    options?: { autoClose?: boolean; autoCloseDelay?: number }
  ) => {
    showToast({ variant, message, ...options });
  };

  return {
    show,
    hideToast,
    hideAllToasts,
  };
};