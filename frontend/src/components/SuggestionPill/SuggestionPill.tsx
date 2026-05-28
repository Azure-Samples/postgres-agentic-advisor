import React from 'react';
import { StyledSuggestionPill, MessageText, BracketText, InlineWrapper, Content } from './SuggestionPill.styles';

/**
 * Props interface for the SuggestionPill component.
 */
export interface SuggestionPillProps {
  /** The message text with optional bracket notation for highlighted sections */
  message?: string;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** HTML id attribute */
  id?: string;
  /** Callback fired when the pill is clicked */
  onClick?: () => void;
}

/**
 * A pill-shaped component for displaying suggestion messages with special formatting for bracketed content.
 *
 * @param {SuggestionPillProps} props - The component props containing suggestion configuration.
 * @param {string} [props.message] - The suggestion text with optional [bracketed] sections.
 * @param {Function} [props.onClick] - Click handler for pill interaction.
 * @returns {JSX.Element} A styled pill component with formatted text content.
 *
 * @remarks
 * This component is designed for displaying AI-generated suggestions or prompts
 * with special visual treatment for placeholder or variable sections:
 *
 * - Regular text appears in standard styling
 * - Text within square brackets [like this] gets special bracket styling
 * - The component automatically parses and formats mixed content
 * - Click interactions enable suggestion selection or insertion
 *
 * The parsing logic splits the message on bracket patterns and applies
 * different styling to bracketed vs regular text sections, creating
 * visual distinction for template variables or placeholders.
 *
 * This is commonly used in:
 * - AI prompt suggestion interfaces
 * - Template selection components
 * - Quick action buttons with variable content
 * - Contextual help and guidance systems
 *
 * The component handles edge cases like empty messages, malformed brackets,
 * and complex nested content gracefully.
 *
 * @example
 * ```tsx
 * <SuggestionPill
 *   message="Analyze the [metric] for [time period]"
 *   onClick={() => insertSuggestion(message)}
 * />
 * ```
 */
export const SuggestionPill: React.FC<SuggestionPillProps> = ({ message, onClick, ...rest }) => {
  const renderContent = () => {
    if (!message) return null;
    const parts = message.split(/(\[[^\]]*\])/g).filter(Boolean);

    return (
      <Content>
        {parts.map((part, idx) => {
          if (/^\[[^\]]*\]$/.test(part)) {
            return (
              <InlineWrapper key={idx}>
                <BracketText>{part}</BracketText>
              </InlineWrapper>
            );
          }
          return (
            <InlineWrapper key={idx}>
              <MessageText>{part}</MessageText>
            </InlineWrapper>
          );
        })}
      </Content>
    );
  };

  return (
    <StyledSuggestionPill {...rest} onClick={onClick}>
      {renderContent()}
    </StyledSuggestionPill>
  );
};

export default SuggestionPill;
