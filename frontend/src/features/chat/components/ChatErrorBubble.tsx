import React from 'react';
import { AlertWarningIcon } from '@/icons';
import {
  ErrorBubbleWrapper,
  ErrorIconCircle,
  ErrorContent,
  ErrorTitle,
  ErrorBody,
  RetryButton,
} from './ChatErrorBubble.styles';

interface ChatErrorBubbleProps {
  kind?: 'stream' | 'history';
  onRetry?: () => void;
}

const COPY = {
  stream: {
    title: "Couldn't get a response",
    body: "Something went wrong on our end. Your message was received but the response failed to load.",
    retry: "Try again",
  },
  history: {
    title: "Couldn't load conversation",
    body: "We had trouble reaching the server. Your previous messages may not be shown right now.",
    retry: "Reload",
  },
} as const;

const ChatErrorBubble: React.FC<ChatErrorBubbleProps> = ({ kind = 'stream', onRetry }) => {
  const { title, body, retry } = COPY[kind];

  return (
    <ErrorBubbleWrapper role="alert">
      <ErrorIconCircle>
        <AlertWarningIcon width={16} height={16} />
      </ErrorIconCircle>
      <ErrorContent>
        <ErrorTitle>{title}</ErrorTitle>
        <ErrorBody>{body}</ErrorBody>
        {onRetry && (
          <RetryButton type="button" onClick={onRetry}>
            ↺ {retry}
          </RetryButton>
        )}
      </ErrorContent>
    </ErrorBubbleWrapper>
  );
};

export default ChatErrorBubble;
