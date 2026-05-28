import styled from 'styled-components';
import { PrimaryCircleButton } from '../../../components/Button/PrimaryCircleButton.styles';

interface ChatBoxProps {
  isInDrawer?: boolean;
}

export const ChatBoxContainerStyled = styled.div<ChatBoxProps>`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing[4]} ${theme.spacing[5]}`};
  overflow-y: auto;
  max-height: ${({ isInDrawer }) => (isInDrawer ? 'none' : 'calc(100vh - 200px)')};
`;

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export const WelcomeContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  width: 100%;
`;

export const CenteredContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

export const MessagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const ChatInputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  border-top: none;
  padding: 0;
  background-color: transparent;
  width: 100%;
  max-width: 456px;
  justify-content: center;
`;

export const ChatFormWrapper = styled.form`
  display: flex;
  width: 100%;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing[5]};
  flex-shrink: 0;
`;

export const SendButtonStyled = styled(PrimaryCircleButton)``;

export const InputWrapperStyled = styled.div`
  flex: 1;
`;

export const ErrorMessageStyled = styled.div`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[5]};
  background-color: ${({ theme }) => theme.colors.toast.error.background};
  color: ${({ theme }) => theme.colors.toast.error.text};
  border-top: ${({ theme }) => theme.border.light};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const AgentThinkingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.contentTertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

export const AgentSpinner = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2.5px solid ${({ theme }) => theme.colors.disabledBg};
  border-top-color: ${({ theme }) => theme.colors.contentTertiary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;