import React from 'react';
import { Modal, Button } from '@/components';
import {
  DeleteModalBody,
  DeleteModalMessage,
  DeleteModalClientName,
  DeleteModalFooter,
  DeleteButton,
} from './DeleteAlertModal.styles';

export interface DeleteAlertModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Name of the client associated with the alert — shown in the confirmation copy */
  clientName?: string;
  /** Whether the delete API call is in-flight */
  isDeleting: boolean;
  /** Called when the user confirms the deletion */
  onConfirm: () => void;
  /** Called when the user cancels or closes the modal */
  onClose: () => void;
}

/**
 * DeleteAlertModal
 *
 * A focused confirmation dialog that guards against accidental alert deletion.
 * Displays the client name so the user is certain which alert will be removed.
 * Disables both actions while the delete request is in-flight to prevent
 * double-submission.
 */
export const DeleteAlertModal: React.FC<DeleteAlertModalProps> = ({
  isOpen,
  clientName,
  isDeleting,
  onConfirm,
  onClose,
}) => {
  const footer = (
    <DeleteModalFooter>
      <Button variant="outline" size="md" onClick={onClose} disabled={isDeleting}>
        Cancel
      </Button>
      <DeleteButton onClick={onConfirm} disabled={isDeleting}>
        {isDeleting ? 'Deleting…' : 'Delete'}
      </DeleteButton>
    </DeleteModalFooter>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Alert"
      footer={footer}
      width={440}
      closeOnOverlayClick={!isDeleting}
      closeOnEscape={!isDeleting}
    >
      <DeleteModalBody>
        <DeleteModalMessage>
          Are you sure you want to delete the alert for{' '}
          {clientName ? <DeleteModalClientName>{clientName}</DeleteModalClientName> : 'this client'}? This action cannot
          be undone.
        </DeleteModalMessage>
      </DeleteModalBody>
    </Modal>
  );
};
