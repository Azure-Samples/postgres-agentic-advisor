import React from 'react';
import { AlertWarningIcon } from '@/icons';
import {
  ErrorStateWrapper,
  ErrorIconCircle,
  ErrorTextGroup,
  ErrorTitle,
  ErrorSubtitle,
  ErrorRetryButton,
} from './WidgetErrorState.styles';

interface WidgetErrorStateProps {
  onRetry?: () => void;
}

export const WidgetErrorState: React.FC<WidgetErrorStateProps> = ({ onRetry }) => (
  <ErrorStateWrapper>
    <ErrorIconCircle>
      <AlertWarningIcon width={22} height={22} />
    </ErrorIconCircle>
    <ErrorTextGroup>
      <ErrorTitle>Something went wrong</ErrorTitle>
      <ErrorSubtitle>We couldn't load this data right now.</ErrorSubtitle>
    </ErrorTextGroup>
    {onRetry && (
      <ErrorRetryButton type="button" onClick={onRetry}>
        Try Again
      </ErrorRetryButton>
    )}
  </ErrorStateWrapper>
);

export default WidgetErrorState;
