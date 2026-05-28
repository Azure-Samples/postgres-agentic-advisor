import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { AgentResponseContainer } from './AgentResponse.styles';
import { normalizeMarkdown } from '@/utils/normalizeMarkdown';

/**
 * rehype-sanitize schema that extends the safe default to allow the <mark>
 * element used by the backend for text highlighting.
 */
const markdownSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'mark'],
};

/**
 * Stable plugin tuple — defined outside the component so the array reference
 * is constant across renders and does not cause unnecessary ReactMarkdown re-mounts.
 */
const rehypePlugins: any[] = [rehypeRaw, [rehypeSanitize, markdownSchema]];

/**
 * Props interface for the AgentResponse component.
 */
interface AgentResponseProps {
  /** The markdown text content to be rendered */
  markdownText: string;
}

/**
 * Renders markdown text content from an AI agent response with proper formatting
 * and styling.
 *
 * Pre-processing (normalizeMarkdown):
 *  - Strips leading indentation that would otherwise trigger Markdown's code-block rule.
 *  - Moves ATX headings (##) that appear mid-line onto their own line with surrounding
 *    blank lines so the Markdown parser treats them as block-level headings.
 *
 * HTML support (rehype-raw + rehype-sanitize):
 *  - <mark> tags in AI output are rendered as highlighted text instead of showing
 *    raw HTML, while all potentially unsafe tags are stripped.
 *
 * @example
 * ```tsx
 * <AgentResponse markdownText="## Hello\nThis is **bold** text." />
 * ```
 */
export const AgentResponse: React.FC<AgentResponseProps> = ({ markdownText }) => {
  return (
    <AgentResponseContainer>
      <div className="markdown-container">
        <ReactMarkdown rehypePlugins={rehypePlugins}>
          {normalizeMarkdown(markdownText || '')}
        </ReactMarkdown>
      </div>
    </AgentResponseContainer>
  );
};

export default AgentResponse;
