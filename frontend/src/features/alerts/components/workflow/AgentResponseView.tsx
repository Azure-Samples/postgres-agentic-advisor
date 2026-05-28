import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { normalizeAgentText } from '@/utils/normalizeMarkdown';
import { LinkIcon } from '@/icons';
import type { AlertSourceObject } from '@/api/types/alert.types';
import type { WorkflowAgentDetailModel } from './workflowDetailAdapter';
import { SourceViewerModal } from '../SourceViewerModal';
import ReasoningContextCollapsible from './ReasoningContextCollapsible';
import {
  AgentDetailWrapper,
  DetailSection,
  DetailSectionLabel,
  SectionContentBox,
  EmptyDetailState,
  SectionsWrapper,
  SourceChip,
  SourcesChipsRow,
  SourcesHeaderRow,
  SourcesIconWrapper,
  SourcesLabel,
  SourcesRow,
  Timestamp,
  TimestampRow,
  PreferenceAwareInputBox,
  PlainInputBlock,
  PreferenceBlock,
  WorkflowMarkdown,
  HighlightMark,
} from './AgentResponseView.styles';

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
 * is constant across renders and avoids unnecessary ReactMarkdown re-mounts.
 */
const rehypePlugins: any[] = [rehypeRaw, [rehypeSanitize, markdownSchema]];

/**
 * Custom ReactMarkdown component overrides for preference segments.
 *
 * Instead of a full-width yellow block (which looks like a section highlight),
 * each <p> and <li> wraps its text in an inline HighlightMark so the yellow
 * background hugs the text exactly — identical to the <mark> treatment in the
 * sources view.  box-decoration-break: clone on HighlightMark repeats the
 * background on every wrapped line for multi-line sentences.
 */
const highlightComponents = {
  p: ({ children, node: _node, ...props }: any) => (
    <p {...props} style={{ margin: '0 0 4px' }}>
      <HighlightMark>{children}</HighlightMark>
    </p>
  ),
  li: ({ children, node: _node, ...props }: any) => (
    <li {...props}>
      <HighlightMark>{children}</HighlightMark>
    </li>
  ),
};

interface AgentResponseViewProps {
  agent: WorkflowAgentDetailModel;
  alertId?: number | null;
}

const PREFER_RE = /\bprefer/i;

const isRiskInsightAgent = (agent: WorkflowAgentDetailModel) =>
  /risk|insight/i.test(agent.id) || /risk|insight/i.test(agent.label);

const parseInputSegments = (text: string) =>
  text.split(/\n{2,}/).map((para) => ({ text: para, isPreference: PREFER_RE.test(para) }));

/**
 * Phase 2 – the "Response" half of the content card.
 * Renders Input / Output / Reasoning sections and Sources chips.
 * All sections are conditionally rendered — empty strings hide the section.
 */
const AgentResponseView: React.FC<AgentResponseViewProps> = ({ agent, alertId }) => {
  const { input, output, reasoning, sources, timestamp } = agent;
  const hasContent = Boolean(input || output || reasoning || sources.length);
  const isRisk = isRiskInsightAgent(agent);

  const [selectedSource, setSelectedSource] = useState<AlertSourceObject | null>(null);

  const { alertData } = agent;

  if (!hasContent) {
    return (
      <AgentDetailWrapper>
        <EmptyDetailState>No response data available for this agent.</EmptyDetailState>
        {timestamp && (
          <TimestampRow>
            <Timestamp>{timestamp}</Timestamp>
          </TimestampRow>
        )}
      </AgentDetailWrapper>
    );
  }

  return (
    <AgentDetailWrapper>
      <SectionsWrapper>
        {input && (
          <DetailSection>
            <DetailSectionLabel>Input</DetailSectionLabel>
            {isRisk ? (
              <PreferenceAwareInputBox>
                {parseInputSegments(input).map((seg, i) =>
                  seg.isPreference ? (
                    <PreferenceBlock key={i}>
                      <WorkflowMarkdown>
                        <ReactMarkdown
                          rehypePlugins={rehypePlugins}
                          components={highlightComponents}
                        >
                          {normalizeAgentText(seg.text)}
                        </ReactMarkdown>
                      </WorkflowMarkdown>
                    </PreferenceBlock>
                  ) : (
                    <PlainInputBlock key={i}>
                      <WorkflowMarkdown>
                        <ReactMarkdown rehypePlugins={rehypePlugins}>
                          {normalizeAgentText(seg.text)}
                        </ReactMarkdown>
                      </WorkflowMarkdown>
                    </PlainInputBlock>
                  )
                )}
              </PreferenceAwareInputBox>
            ) : (
              <SectionContentBox>
                <WorkflowMarkdown>
                  <ReactMarkdown rehypePlugins={rehypePlugins}>
                    {normalizeAgentText(input)}
                  </ReactMarkdown>
                </WorkflowMarkdown>
              </SectionContentBox>
            )}
          </DetailSection>
        )}

        {output && (
          <DetailSection>
            <DetailSectionLabel>Output</DetailSectionLabel>
            <SectionContentBox>
              <WorkflowMarkdown>
                <ReactMarkdown rehypePlugins={rehypePlugins}>
                  {normalizeAgentText(output)}
                </ReactMarkdown>
              </WorkflowMarkdown>
              {alertData && <ReasoningContextCollapsible data={alertData} />}
            </SectionContentBox>
          </DetailSection>
        )}

        {reasoning && (
          <DetailSection>
            <DetailSectionLabel>Reasoning</DetailSectionLabel>
            <SectionContentBox>
              <WorkflowMarkdown>
                <ReactMarkdown rehypePlugins={rehypePlugins}>
                  {normalizeAgentText(reasoning)}
                </ReactMarkdown>
              </WorkflowMarkdown>
            </SectionContentBox>
          </DetailSection>
        )}
      </SectionsWrapper>

      {sources.length > 0 && (
        <SourcesRow>
          <SourcesHeaderRow>
            <SourcesIconWrapper>
              <LinkIcon width={16} height={16} />
            </SourcesIconWrapper>
            <SourcesLabel>Sources</SourcesLabel>
          </SourcesHeaderRow>
          <SourcesChipsRow>
            {sources.map((source, idx) => {
              const label = source.title ?? source.source_type ?? String(source.id ?? 'Source');
              const isClickable = !!alertId && source.id != null;
              return (
                <SourceChip
                  key={`${label}-${idx}`}
                  type="button"
                  disabled={!isClickable}
                  onClick={isClickable ? () => setSelectedSource(source) : undefined}
                  style={!isClickable ? { cursor: 'default' } : undefined}
                >
                  {label}
                </SourceChip>
              );
            })}
          </SourcesChipsRow>
        </SourcesRow>
      )}

      {timestamp && (
        <TimestampRow>
          <Timestamp>{timestamp}</Timestamp>
        </TimestampRow>
      )}

      {/* ── Source viewer (full-screen) ── */}
      <SourceViewerModal
        isOpen={!!selectedSource}
        onClose={() => setSelectedSource(null)}
        source={selectedSource}
        alertId={alertId}
      />
    </AgentDetailWrapper>
  );
};

export default AgentResponseView;
