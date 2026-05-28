import styled from 'styled-components';

export const ChatHistoryViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const TopControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]} 0;
  flex-shrink: 0;
`;

export const ClientDropdownRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

export const SessionsListSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing[5]};
  flex: 1;
  overflow: hidden;
  padding: 0;
`;

export const HistoryListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  overflow-y: auto;
  flex: 1;
  padding: 0 ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[4]};

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: ${({ theme }) => theme.spacing[1.5]};
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutralGray};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.contentTertiary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};

    &:hover {
      background: ${({ theme }) => theme.colors.contentSecondary};
    }
  }
`;

export const EmptyStateMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.contentTertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[5]};
  margin: 0;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[5]};
`;

/**
 * Wrapper that sits around each chat tile, enabling hover-reveal of the delete button.
 */
export const TileRow = styled.div`
  position: relative;
  display: flex;
  align-items: stretch;

  &:hover > button[data-delete] {
    opacity: 1;
  }
`;

/**
 * Delete icon button that fades in on tile hover.
 */
export const TileDeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: ${({ theme }) => theme.spacing[2]};
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.contentTertiary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  opacity: 0;
  transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease;
  flex-shrink: 0;
  z-index: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.neutralGray};
    color: #ef4444;
  }

  &:focus-visible {
    opacity: 1;
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

/**
 * "New Chat" tile — visually distinct from regular history tiles.
 * Stays pinned at the top of the list.
 */
export const NewChatTile = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px dashed ${({ theme }) => theme.colors.primary};
  background: transparent;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  width: 100%;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: background-color 0.15s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;
