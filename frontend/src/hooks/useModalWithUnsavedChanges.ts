import { useEffect, useCallback } from 'react';

interface UseModalWithUnsavedChangesProps {
  isOpen: boolean;
  onClose: () => void;
  hasUnsavedChanges: boolean;
}

/**
 * Hook to handle modal closing with Escape key and unsaved changes warning
 * 
 * Usage:
 * const { handleClose } = useModalWithUnsavedChanges({
 *   isOpen: showModal,
 *   onClose: () => setShowModal(false),
 *   hasUnsavedChanges: formHasChanged,
 *   onSave: handleSave
 * });
 */
export const useModalWithUnsavedChanges = ({
  isOpen,
  onClose,
  hasUnsavedChanges
}: UseModalWithUnsavedChangesProps) => {
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmed) {
        return;
      }
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return { handleClose };
};
