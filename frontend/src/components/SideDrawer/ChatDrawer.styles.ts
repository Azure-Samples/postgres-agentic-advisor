import styled from 'styled-components';

export const ChatDrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[5]};
`;

export const ChatDrawerDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.drawerDivider};
  flex-shrink: 0;
`;

export const ChatDrawerHeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const ChatDrawerTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

export const ChatDrawerHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: background-color 0.2s ease;
  color: ${({ theme }) => theme.colors.contentSecondary};

  &:hover {
    background: ${({ theme }) => theme.colors.neutralGray};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const ChatDrawerCloseButton = styled(IconButton)``;

export const ChatDrawerBackButton = styled(IconButton)`
  margin-right: ${({ theme }) => theme.spacing[2]};
`;

export const ChatDrawerExternalLinkButton = styled(IconButton)``;

export const ChatDrawerContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ChatDrawerBottomBox = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[5]};
  gap: ${({ theme }) => theme.spacing[4]};
  margin: ${({ theme }) => `${theme.spacing[0]} ${theme.spacing[6]} ${theme.spacing[6]} ${theme.spacing[6]}`};
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  border: 1px solid ${({ theme }) => theme.colors.chatPanelBorder};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const ChatDrawerInputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  width: 100%;
`;

export const ChatDrawerInputContainer = styled.div`
  flex: 1;
`;

import { PrimaryCircleButton } from '../../components/Button/PrimaryCircleButton.styles';

export const ChatDrawerSendButton = styled(PrimaryCircleButton)`
  svg {
    fill: ${({ theme }) => theme.colors.white};
  }
`;

/**
 * Centered empty state shown inside the chat view when no client has been selected yet.
 */
export const NewChatEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[6]};
  text-align: center;
`;

export const NewChatEmptyStateMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
`;
