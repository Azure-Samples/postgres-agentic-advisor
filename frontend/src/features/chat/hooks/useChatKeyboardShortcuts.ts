import { useEffect, useCallback } from 'react';

/**
 * Hook for handling keyboard shortcuts in the chat interface.
 *
 * Shortcuts:
 * - Ctrl/Cmd + N: Start new chat
 * - Escape: Cancel streaming (if active)
 */
export const useChatKeyboardShortcuts = (options: {
  onNewChat?: () => void;
  onCancelStream?: () => void;
  isStreaming?: boolean;
  isDisabled?: boolean;
}) => {
  const { onNewChat, onCancelStream, isStreaming, isDisabled } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isDisabled) return;

    // Ctrl/Cmd + N for new chat
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      onNewChat?.();
      return;
    }

    // Escape to cancel streaming
    if (event.key === 'Escape' && isStreaming) {
      event.preventDefault();
      onCancelStream?.();
      return;
    }
  }, [onNewChat, onCancelStream, isStreaming, isDisabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useChatKeyboardShortcuts;
