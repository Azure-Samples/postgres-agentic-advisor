import styled from 'styled-components';
import { PrimaryCircleButton } from '../../../components/Button/PrimaryCircleButton.styles';

interface ChatBoxProps {
  /** Transient prop — consumed by styled-components, never forwarded to the DOM. */
  $isInDrawer?: boolean;
  $shouldFlex?: boolean;
}

export const ChatBoxContainerStyled = styled.div<ChatBoxProps>`
  display: flex;
  flex-direction: column;
  flex: ${({ $shouldFlex }) => ($shouldFlex ? '1' : '0 1 auto')};
  padding: ${({ theme }) => `${theme.spacing[4]} ${theme.spacing[5]}`};
  overflow-y: auto;
  max-height: ${({ $isInDrawer }) => ($isInDrawer ? 'none' : 'calc(100vh - 200px)')};
`;

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

export const WelcomeScreen = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 0;
`;

export const WelcomeContent = styled.div`
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

export const ChatInputWrapper = styled.div<{ $welcome?: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  border-top: none;
  padding: 0;
  background-color: transparent;
  width: 100%;
  max-width: ${({ $welcome }) => ($welcome ? '724px' : '456px')};
`;

export const ChatFormWrapper = styled.form<{ $welcome?: boolean }>`
  display: flex;
  width: 100%;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing[5]};
  border-top: ${({ $welcome, theme }) => ($welcome ? 'none' : theme.border.light)};
  padding-top: ${({ $welcome, theme }) => ($welcome ? '0' : theme.spacing[4])};
  background-color: ${({ $welcome, theme }) => ($welcome ? 'transparent' : theme.colors.white || '#FFFFFF')};
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  animation: analyzingPulse 1.6s ease-in-out infinite;

  @keyframes analyzingPulse {
    0%, 100% { transform: scale(1);    opacity: 1;    }
    50%       { transform: scale(1.22); opacity: 0.7; }
  }
`;

export const AgentThinkingText = styled.span`
  animation: thinkingFadeIn 0.3s ease-out both;

  @keyframes thinkingFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

/* ── Assistant message wrapper (badge + content stacked vertically) ───────── */
export const AssistantMessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
`;

/* ── Memory Updated badge ─────────────────────────────────────────────────── */
export const MemoryUpdatedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  background: #f7f6ff;
  border: 1px solid #dedaff;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 0 ${({ theme }) => theme.spacing[2]};
  height: 30px;
  margin-left: ${({ theme }) => theme.spacing[5]};
`;

export const MemoryUpdatedIcon = styled.img`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

export const MemoryUpdatedText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: #2f2e38;
  white-space: nowrap;
  line-height: 1.3;
`;
