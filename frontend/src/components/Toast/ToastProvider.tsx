import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProps } from './Toast';
import { ToastPortal } from './Toast.styles';

/**
 * Interface for the toast context API, providing methods to manage toast notifications.
 */
export interface ToastContextType {
  /** Shows a new toast notification */
  showToast: (toast: Omit<ToastProps, 'onClose'>) => void;
  /** Hides a specific toast by its ID */
  hideToast: (id: string) => void;
  /** Hides all currently displayed toasts */
  hideAllToasts: () => void;
}

/**
 * Internal interface representing a toast item with a unique identifier.
 */
interface ToastItem extends ToastProps {
  /** Unique identifier for the toast */
  id: string;
}

/**
 * React context for managing toast notifications throughout the application.
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Provider component for managing and displaying toast notifications globally.
 *
 * @param {Object} props - The provider props.
 * @param {React.ReactNode} props.children - Child components that will have access to toast functionality.
 * @returns {JSX.Element} A provider wrapper with toast management context and portal for rendering toasts.
 *
 * @remarks
 * This provider component enables global toast notification management throughout the application:
 *
 * Features:
 * - Centralized toast state management using React context
 * - Automatic unique ID generation for each toast
 * - Portal-based rendering for proper z-index layering
 * - Multiple toast support with stacking
 * - Programmatic toast control (show, hide, hide all)
 *
 * The provider maintains an internal array of active toasts and provides
 * methods for adding and removing toasts. Each toast receives a unique
 * identifier combining timestamp and random string for collision resistance.
 *
 * Toast lifecycle:
 * 1. showToast() adds a new toast with generated ID
 * 2. Toast renders with auto-close timer (if enabled)
 * 3. hideToast() removes specific toast by ID
 * 4. hideAllToasts() clears all active toasts
 *
 * The component uses React Portal to render toasts outside the normal
 * DOM hierarchy, ensuring they appear above all other content regardless
 * of parent component z-index or overflow settings.
 *
 * @example
 * ```tsx\n * // App setup\n * <ToastProvider>\n *   <App />\n * </ToastProvider>\n * \n * // Using in components\n * const { showToast } = useToast();\n * showToast({\n *   variant: 'success',\n *   message: 'Operation completed successfully!'\n * });\n * ```
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((toastProps: Omit<ToastProps, 'onClose'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = {
      ...toastProps,
      id,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    hideAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastPortal>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => hideToast(toast.id)} />
        ))}
      </ToastPortal>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
