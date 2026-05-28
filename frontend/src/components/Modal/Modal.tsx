import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseOutlined } from '@ant-design/icons';
import {
  StyledModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from './Modal.styles';

/**
 * Props interface for the Modal component.
 */
export interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Function to handle modal close */
  onClose: () => void;
  /** Modal title */
  title?: React.ReactNode;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content (buttons, actions, etc.) */
  footer?: React.ReactNode;
  /** Whether to show the close button in header */
  showCloseButton?: boolean;
  /** Whether clicking the overlay closes the modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Custom width for the modal */
  width?: string | number;
  /** Custom height for the modal */
  height?: string | number;
  /** Whether the modal should be centered */
  centered?: boolean;
  /** Z-index for the modal */
  zIndex?: number;
  /** Additional props for the modal header */
  headerProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Additional props for the modal body */
  bodyProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Additional props for the modal footer */
  footerProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Header action content (positioned between title and close button) */
  headerAction?: React.ReactNode;
}

/**
 * A reusable modal component with customizable header, body, and footer.
 * Built with Ant Design integration and following the project's design system.
 *
 * @param {ModalProps} props - The component props containing modal configuration.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  width,
  height,
  centered = true,
  zIndex = 1000,
  headerProps,
  bodyProps,
  footerProps,
  headerAction,
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <StyledModal $zIndex={zIndex} className={className}>
      <ModalOverlay onClick={handleOverlayClick} />
      <ModalContent
        $width={width}
        $height={height}
        $centered={centered}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showCloseButton) && (
          <ModalHeader {...headerProps}>
            {title && <ModalTitle id="modal-title">{typeof title === 'string' ? <h4>{title}</h4> : title}</ModalTitle>}
            {headerAction && <div>{headerAction}</div>}
            {showCloseButton && (
              <ModalCloseButton onClick={onClose} aria-label="Close modal" type="button">
                <CloseOutlined />
              </ModalCloseButton>
            )}
          </ModalHeader>
        )}

        <ModalBody {...bodyProps}>{children}</ModalBody>

        {footer && <ModalFooter {...footerProps}>{footer}</ModalFooter>}
      </ModalContent>
    </StyledModal>,
    document.body,
  );
};
