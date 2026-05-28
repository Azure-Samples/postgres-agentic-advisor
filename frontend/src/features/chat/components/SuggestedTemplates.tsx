import React from 'react';
import styled from 'styled-components';
import { SuggestedTemplatesContainer, SuggestionsList, SkeletonPill, SkeletonTitle } from './SuggestedTemplates.styles';
import { MagicIcon } from '@/icons';
import { defaultSuggestions } from '@/mocks/suggestions';

export interface SuggestedTemplatesProps {
  /** Called with the original (un-substituted) template string when a pill is clicked. */
  onSuggestionClick?: (suggestion: string) => void;
  suggestions?: string[];
  /** Substitution map applied to placeholder text for display only. */
  substitutions?: Record<string, string>;
  /** Show shimmer skeleton while client/alert data is loading. */
  isLoading?: boolean;
}

const applySubstitutions = (template: string, substitutions?: Record<string, string>) => {
  if (!substitutions) return template;
  return template.replace(/\[([^\]]+)\]/g, (match, key: string) => {
    const value = substitutions[key];
    return value && value.trim() ? value : match;
  });
};

const SuggestedTemplates: React.FC<SuggestedTemplatesProps> = ({
  onSuggestionClick,
  suggestions = defaultSuggestions,
  substitutions,
  isLoading = false,
}) => {
  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick?.(suggestion);
  };

  return (
    <SuggestedTemplatesContainer>
      <MagicIconWrapper>
        <EclipseCircle>
          <MagicIcon />
        </EclipseCircle>
      </MagicIconWrapper>
      {isLoading ? <SkeletonTitle /> : <GreetingTitle>Where Should We Start, Jamie?</GreetingTitle>}
      <SuggestionsList>
        {isLoading
          ? suggestions.map((_, index) => <SkeletonPill key={index} />)
          : suggestions.map((template, index) => (
              <SuggestionBox key={index} onClick={() => handleSuggestionClick(template)}>
                {applySubstitutions(template, substitutions)}
              </SuggestionBox>
            ))}
      </SuggestionsList>
    </SuggestedTemplatesContainer>
  );
};

const MagicIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EclipseCircle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 88px;
  height: 88px;
  background-color: #e4eef1;
  border-radius: 50%;
`;

const GreetingTitle = styled.h2`
  font-family: 'Roboto', sans-serif;
  font-size: 28px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  color: #000;
  margin: 0;
  text-align: center;
  white-space: nowrap;
`;

const SuggestionBox = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 16px;
  background-color: rgba(222, 235, 239, 0.8);
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.contentPrimary};
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
  text-align: left;
  line-height: 1.5;
  width: 100%;

  &:hover {
    background-color: rgba(222, 235, 239, 1);
    border-color: rgba(6, 115, 148, 0.25);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &:active {
    background-color: rgba(210, 228, 234, 1);
    box-shadow: none;
  }
`;

export default SuggestedTemplates;
