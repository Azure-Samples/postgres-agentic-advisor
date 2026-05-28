import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { TinyChevronDownIcon } from '@/icons';
import {
  KeyValueItem,
  KeyValueLabel,
  KeyValueValue,
  JsonArrayList,
  JsonArrayListItem,
  JsonArraySection,
  JsonKey,
  JsonObjectCard,
  JsonObjectGrid,
  JsonPrimitiveBadge,
  JsonSectionTitle,
  JsonStringValue,
  MarkdownCodeBlock,
  MarkdownInlineCode,
  MarkdownLink,
  MarkdownParagraph,
  ReportSection,
  ReportSectionBody,
  ReportSectionTitle,
  SecFilingChevron,
  SecFilingContextBody,
  SecFilingContextText,
  SecFilingHeader,
  SecFilingHeaderText,
  SecFilingSectionLabel,
  SecFilingQACard,
  SecFilingQAHeader,
  SecFilingQAList,
  SecFilingQANumber,
  SecFilingQuestion,
  SecFilingTickerBadge,
  SecFilingWrapper,
  StructuredReport,
  WorkflowMarkdown,
} from './AgentResponseView.styles';

interface WorkflowMarkdownContentProps {
  content: string;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type ReportBlock = { type: 'pair'; label: string; value: string } | { type: 'section'; title: string; body: string };

const stripCommonIndentation = (value: string) => {
  const lines = value.replace(/\t/g, '  ').split('\n');
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  if (!nonEmptyLines.length) {
    return value.trim();
  }

  const commonIndent = Math.min(
    ...nonEmptyLines.map((line) => {
      const match = line.match(/^\s*/);
      return match ? match[0].length : 0;
    }),
  );

  return lines
    .map((line) => line.slice(commonIndent))
    .join('\n')
    .trim();
};

const tryParseJson = (value: string): JsonValue | null => {
  const normalized = value.trim();

  if (!normalized || !/^[\[{]/.test(normalized)) {
    return null;
  }

  try {
    return JSON.parse(normalized) as JsonValue;
  } catch {
    return null;
  }
};

const formatJsonForCode = (value: JsonValue) => JSON.stringify(value, null, 2);

const normalizeMarkdownContent = (value: string) => {
  const normalized = stripCommonIndentation(value);
  const parsedJson = tryParseJson(normalized);

  if (parsedJson !== null) {
    return `\`\`\`json\n${formatJsonForCode(parsedJson)}\n\`\`\``;
  }

  return normalized;
};

// ─── SEC Filing Input ─────────────────────────────────────────────────────────

interface SecFilingSection {
  question: string;
  context: string;
}

interface ParsedSecFiling {
  taskLine: string;
  tickerId: string | null;
  sections: SecFilingSection[];
}

const isSecFilingInput = (value: string): boolean => /SEC FILING CONTEXT/i.test(value);

const parseSecFilingInput = (value: string): ParsedSecFiling => {
  // First non-empty line is the task description
  const taskLine =
    value
      .split('\n')
      .map((l) => l.trim())
      .find(Boolean) ?? 'SEC Filing Analysis';

  // Extract ticker id (e.g. "ticker id 2")
  const tickerMatch = value.match(/ticker\s+(?:id\s+)?(\S+?)[\.\s]/i);
  const tickerId = tickerMatch?.[1] ?? null;

  // Grab the block between "SEC FILING CONTEXT:" and the final "Analyze" instruction
  const contextBlockMatch = value.match(/SEC FILING CONTEXT[^:]*:\s*([\s\S]+?)(?=\n\s*Analyze\b|\n\s*Output\b)/i);
  const rawBlock = contextBlockMatch?.[1]?.trim() ?? '';

  // Split sections on "---" separators
  const rawSections = rawBlock
    .split(/\n\s*---\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const sections: SecFilingSection[] = rawSections
    .map((section) => {
      const qMatch = section.match(/(?:^|\n)\s*Q:\s*(.+?)(?:\n|$)/);
      const ctxMatch = section.match(/\bContext:\s*([\s\S]+?)$/);
      return {
        question: qMatch?.[1]?.trim() ?? '',
        context: ctxMatch?.[1]?.trim() ?? '',
      };
    })
    .filter((s) => s.question);

  return { taskLine, tickerId, sections };
};

const SecFilingContent: React.FC<{ content: string }> = ({ content }) => {
  const { taskLine, tickerId, sections } = parseSecFilingInput(content);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <SecFilingWrapper>
      {/* Task header */}
      <SecFilingHeader>
        <SecFilingHeaderText>{taskLine}</SecFilingHeaderText>
        {tickerId && <SecFilingTickerBadge>Ticker #{tickerId}</SecFilingTickerBadge>}
      </SecFilingHeader>

      {sections.length > 0 && (
        <>
          <SecFilingSectionLabel>SEC Filing Context ({sections.length} questions)</SecFilingSectionLabel>
          <SecFilingQAList>
            {sections.map((section, idx) => {
              const isOpen = openSections.has(idx);
              return (
                <SecFilingQACard key={idx}>
                  <SecFilingQAHeader onClick={() => toggle(idx)}>
                    <SecFilingQANumber>{idx + 1}</SecFilingQANumber>
                    <SecFilingQuestion>{section.question}</SecFilingQuestion>
                    <SecFilingChevron $open={isOpen}>
                      <TinyChevronDownIcon />
                    </SecFilingChevron>
                  </SecFilingQAHeader>
                  {isOpen && section.context && (
                    <SecFilingContextBody>
                      <SecFilingContextText>{section.context}</SecFilingContextText>
                    </SecFilingContextBody>
                  )}
                </SecFilingQACard>
              );
            })}
          </SecFilingQAList>
        </>
      )}
    </SecFilingWrapper>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const parseReportBlocks = (value: string): ReportBlock[] => {
  const blocks = value
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const lines = block.split('\n');
      const firstLine = lines[0]?.trim() ?? '';
      const inlinePairMatch = firstLine.match(/^([^:\n]+):\s+(.+)$/);

      if (inlinePairMatch && lines.length === 1) {
        return {
          type: 'pair',
          label: inlinePairMatch[1].trim(),
          value: inlinePairMatch[2].trim(),
        } satisfies ReportBlock;
      }

      const titledSectionMatch = firstLine.match(/^([^:\n]+):\s*$/);

      if (titledSectionMatch) {
        return {
          type: 'section',
          title: titledSectionMatch[1].trim(),
          body: lines.slice(1).join('\n').trim(),
        } satisfies ReportBlock;
      }

      return null;
    })
    .filter((block): block is ReportBlock => block !== null);
};

const shouldRenderAsStructuredReport = (value: string) => {
  const blocks = parseReportBlocks(value);
  return blocks.length >= 3;
};

const formatJsonKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());

const renderPrimitive = (value: string | number | boolean | null) => {
  if (typeof value === 'string') {
    return <JsonStringValue>{value || 'Empty string'}</JsonStringValue>;
  }

  if (value === null) {
    return <JsonPrimitiveBadge $tone="muted">null</JsonPrimitiveBadge>;
  }

  if (typeof value === 'boolean') {
    return <JsonPrimitiveBadge $tone={value ? 'success' : 'muted'}>{String(value)}</JsonPrimitiveBadge>;
  }

  return <JsonPrimitiveBadge $tone="info">{String(value)}</JsonPrimitiveBadge>;
};

const StructuredJsonValue: React.FC<{ value: JsonValue; depth?: number }> = ({ value, depth = 0 }) => {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return renderPrimitive(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <JsonPrimitiveBadge $tone="muted">No items</JsonPrimitiveBadge>;
    }

    const hasComplexChildren = value.some((item) => item !== null && (Array.isArray(item) || typeof item === 'object'));

    if (!hasComplexChildren) {
      return (
        <JsonArrayList>
          {value.map((item, index) => (
            <JsonArrayListItem key={`${depth}_${index}`}>
              {renderPrimitive(item as string | number | boolean | null)}
            </JsonArrayListItem>
          ))}
        </JsonArrayList>
      );
    }

    return (
      <JsonArraySection>
        {value.map((item, index) => (
          <JsonObjectCard key={`${depth}_${index}`}>
            <JsonSectionTitle>Item {index + 1}</JsonSectionTitle>
            <StructuredJsonValue value={item} depth={depth + 1} />
          </JsonObjectCard>
        ))}
      </JsonArraySection>
    );
  }

  const entries = Object.entries(value);

  if (!entries.length) {
    return <JsonPrimitiveBadge $tone="muted">Empty object</JsonPrimitiveBadge>;
  }

  return (
    <JsonObjectGrid>
      {entries.map(([key, nestedValue]) => (
        <JsonObjectCard key={`${depth}_${key}`}>
          <JsonKey>{formatJsonKey(key)}</JsonKey>
          <StructuredJsonValue value={nestedValue} depth={depth + 1} />
        </JsonObjectCard>
      ))}
    </JsonObjectGrid>
  );
};

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  const normalizedContent = normalizeMarkdownContent(content);

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <MarkdownParagraph>{children}</MarkdownParagraph>,
        a: ({ href, children }) => (
          <MarkdownLink href={href} target="_blank" rel="noreferrer">
            {children}
          </MarkdownLink>
        ),
        pre: ({ children }) => <MarkdownCodeBlock>{children}</MarkdownCodeBlock>,
        code: ({ children, className }) => {
          const isBlock = Boolean(className);

          if (isBlock) {
            return <code className={className}>{children}</code>;
          }

          return <MarkdownInlineCode>{children}</MarkdownInlineCode>;
        },
      }}
    >
      {normalizedContent}
    </ReactMarkdown>
  );
};

const StructuredReportContent: React.FC<{ content: string }> = ({ content }) => {
  const blocks = parseReportBlocks(content);

  return (
    <StructuredReport>
      {blocks.map((block, index) => {
        if (block.type === 'pair') {
          const parsedValue = tryParseJson(block.value);

          return (
            <KeyValueItem key={`${block.label}_${index}`}>
              <KeyValueLabel>{block.label}</KeyValueLabel>
              <KeyValueValue>
                {parsedValue !== null ? (
                  <StructuredJsonValue value={parsedValue} depth={1} />
                ) : (
                  <MarkdownContent content={block.value} />
                )}
              </KeyValueValue>
            </KeyValueItem>
          );
        }

        const parsedValue = tryParseJson(block.body);

        return (
          <ReportSection key={`${block.title}_${index}`}>
            <ReportSectionTitle>{block.title}</ReportSectionTitle>
            <ReportSectionBody>
              {parsedValue !== null ? (
                <StructuredJsonValue value={parsedValue} depth={1} />
              ) : (
                <MarkdownContent content={block.body} />
              )}
            </ReportSectionBody>
          </ReportSection>
        );
      })}
    </StructuredReport>
  );
};

const WorkflowMarkdownContent: React.FC<WorkflowMarkdownContentProps> = ({ content }) => {
  const strippedContent = stripCommonIndentation(content);
  const parsedJson = tryParseJson(strippedContent);

  if (parsedJson !== null) {
    return (
      <WorkflowMarkdown>
        <StructuredJsonValue value={parsedJson} />
      </WorkflowMarkdown>
    );
  }

  if (isSecFilingInput(strippedContent)) {
    return <SecFilingContent content={strippedContent} />;
  }

  if (shouldRenderAsStructuredReport(strippedContent)) {
    return (
      <WorkflowMarkdown>
        <StructuredReportContent content={strippedContent} />
      </WorkflowMarkdown>
    );
  }

  return (
    <WorkflowMarkdown>
      <MarkdownContent content={strippedContent} />
    </WorkflowMarkdown>
  );
};

export default WorkflowMarkdownContent;
