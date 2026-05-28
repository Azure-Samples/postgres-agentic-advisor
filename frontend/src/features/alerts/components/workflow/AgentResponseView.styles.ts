import styled, { css } from 'styled-components';

/** Small muted label — used for "Input", "Output", "Reasoning" section headings */
const sectionLabel = css`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.contentPrimary};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

/** Body text used under section headings */
const sectionBody = css`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.contentTertiary};
  line-height: ${({ theme }) => theme.typography.lineHeight.description};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.bodyContent};
`;

export const AgentDetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  width: 100%;
`;

export const SectionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

export const DetailSectionLabel = styled.span`
  ${sectionLabel};
`;

/** Gray background box for section content — replaces markdown rendering */
export const SectionContentBox = styled.div`
  background: ${({ theme }) => theme.colors.surfaceSubtle};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[3]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.contentTertiary};
  line-height: ${({ theme }) => theme.typography.lineHeight.description};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.bodyContent};
  /* Use normal white-space so backend soft-wrap artefacts (single \n mid-sentence)
     reflow naturally instead of jumping back to column 0. Double-newline paragraph
     breaks are handled by parseInputSegments on the risk-insight path; for all
     other agents the text is prose that wraps correctly without pre-wrap. */
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
`;

export const WorkflowMarkdown = styled.div`
  ${sectionBody};
  overflow-wrap: anywhere;

  /* ── Paragraphs ── */
  p {
    margin: 0;
  }

  p + p {
    margin-top: ${({ theme }) => theme.spacing[2]};
  }

  /* ── Inline emphasis ── */
  strong,
  b {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.contentPrimary};
  }

  em,
  i {
    font-style: italic;
  }

  /* ── Links ── */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      opacity: 0.8;
    }
  }

  /* ── Inline code ── */
  code {
    font-family: Consolas, 'Courier New', monospace;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.contentPrimary};
    background: ${({ theme }) => theme.colors.neutralGray};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    padding: 1px ${({ theme }) => theme.spacing[1]};
  }

  /* ── Code blocks ── */
  pre {
    margin: ${({ theme }) => theme.spacing[2]} 0 0;
    background: ${({ theme }) => theme.colors.neutralGray};
    border: 1px solid ${({ theme }) => theme.colors.coolGray};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: ${({ theme }) => theme.spacing[3]};
    overflow-x: auto;
    white-space: pre;

    code {
      background: transparent;
      padding: 0;
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
    }
  }

  /* ── Highlighted text (<mark> from backend) ── */
  mark {
    background: #ffe9a8;
    border-radius: 2px;
    padding: 0 2px;
    color: inherit;
  }

  /* ── Headings ── */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: ${({ theme }) => theme.spacing[3]} 0 ${({ theme }) => theme.spacing[2]} 0;
    color: ${({ theme }) => theme.colors.contentPrimary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: 1.25;

    &:first-child {
      margin-top: 0;
    }
  }

  /* ── Lists ── */
  ul,
  ol {
    margin: 0;
    padding-left: ${({ theme }) => theme.spacing[5]};
  }

  li + li {
    margin-top: ${({ theme }) => theme.spacing[1]};
  }

  /* ── Blockquote ── */
  blockquote {
    margin: 0;
    padding-left: ${({ theme }) => theme.spacing[3]};
    border-left: 3px solid ${({ theme }) => theme.colors.coolGray};
    color: ${({ theme }) => theme.colors.contentSecondary};
  }
`;

export const JsonObjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const JsonObjectCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
  padding: ${({ theme }) => theme.spacing[2.5]};
  border: 1px solid ${({ theme }) => theme.colors.chatPanelBorder};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.white} 0%, ${({ theme }) => theme.colors.lightCyanBg} 100%);
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

export const JsonKey = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.allCaps};
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
`;

export const JsonStringValue = styled.div`
  ${sectionBody};
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.contentSecondary};
`;

export const JsonPrimitiveBadge = styled.span<{ $tone: 'info' | 'success' | 'muted' }>`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ $tone, theme }) =>
    $tone === 'success'
      ? theme.colors.green[100]
      : $tone === 'info'
        ? theme.colors.primary
        : theme.colors.contentTertiary};
  background: ${({ $tone, theme }) =>
    $tone === 'success'
      ? 'rgba(27, 176, 35, 0.10)'
      : $tone === 'info'
        ? theme.colors.chipPrimaryBg
        : theme.colors.neutralGray};
`;

export const JsonArrayList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

export const JsonArrayListItem = styled.div`
  display: flex;
`;

export const JsonArraySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const JsonSectionTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

export const StructuredReport = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const KeyValueItem = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing[2.5]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

export const KeyValueLabel = styled.div`
  min-width: 140px;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.allCaps};
  color: ${({ theme }) => theme.colors.primary};
`;

export const KeyValueValue = styled.div`
  flex: 1;
  min-width: 200px;
`;

export const ReportSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.chatPanelBorder};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

export const ReportSectionTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

export const ReportSectionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const MarkdownParagraph = styled.p`
  ${sectionBody};
  margin: 0;
  white-space: pre-wrap;
`;

export const MarkdownInlineCode = styled.code`
  font-family: Consolas, 'Courier New', monospace;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.contentPrimary};
  background: ${({ theme }) => theme.colors.neutralGray};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 1px ${({ theme }) => theme.spacing[1]};
`;

export const MarkdownCodeBlock = styled.pre`
  background: ${({ theme }) => theme.colors.neutralGray};
  border: 1px solid ${({ theme }) => theme.colors.coolGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[3]};
  overflow-x: auto;
  white-space: pre;

  code {
    font-family: Consolas, 'Courier New', monospace;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.contentPrimary};
    background: transparent;
    padding: 0;
  }
`;

export const MarkdownLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
`;

export const EmptyDetailState = styled.div`
  ${sectionBody};
`;

/** Outer container replacing SectionContentBox for Risk Insight input — flex column so segments stack */
export const PreferenceAwareInputBox = styled.div`
  background: ${({ theme }) => theme.colors.surfaceSubtle};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[3]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.contentTertiary};
  line-height: ${({ theme }) => theme.typography.lineHeight.description};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.bodyContent};
  word-break: break-word;
`;

/** Plain paragraph inside PreferenceAwareInputBox */
export const PlainInputBlock = styled.div`
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
`;

/**
 * Container for preference paragraphs — no background; the yellow highlight
 * is applied per-line via HighlightMark so it hugs the text like a marker pen
 * instead of filling the whole block.
 */
export const PreferenceBlock = styled.div`
  overflow-wrap: break-word;
  word-break: break-word;
  line-height: 1.9;
`;

/**
 * Inline text highlighter — mirrors the <mark> style in SourceViewerModal.
 * box-decoration-break: clone repeats the background on every wrapped line
 * so long sentences look like they were drawn over with a highlighter pen.
 */
export const HighlightMark = styled.span`
  display: inline;
  background: #FFE9A8;
  color: ${({ theme }) => theme.colors.contentPrimary};
  padding: 0.1em 0.3em;
  border-radius: 3px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
`;

export const SourcesRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const SourcesHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const SourcesIconWrapper = styled.div`
  width: ${({ theme }) => theme.spacing[5]};
  height: ${({ theme }) => theme.spacing[5]};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const SourcesLabel = styled.span`
  ${sectionLabel};
`;

export const SourcesChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const SourceChip = styled.button`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[2.5]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: none;
  background: ${({ theme }) => theme.colors.lightGray};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.contentSecondary};
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.coolGray};
    color: ${({ theme }) => theme.colors.contentPrimary};
  }
`;

export const TimestampRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Timestamp = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.disabledText};
`;

// ─── SEC Filing Input Renderer ────────────────────────────────────────────────

export const SecFilingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const SecFilingHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.lightCyanBg};
  border: 1px solid ${({ theme }) => theme.colors.chatPanelBorder};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
`;

export const SecFilingHeaderText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.contentPrimary};
  line-height: 1.5;
`;

export const SecFilingTickerBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px ${({ theme }) => theme.spacing[2.5]};
  background: ${({ theme }) => theme.colors.chipPrimaryBg};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.badge};
`;

export const SecFilingSectionLabel = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.contentTertiary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.label};
  padding: ${({ theme }) => theme.spacing[1]} 0;
`;

export const SecFilingQAList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

export const SecFilingQACard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.chatPanelBorder};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.white};
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.xs};
  }
`;

export const SecFilingQAHeader = styled.button`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[2.5]};
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]};
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.lightCyanBg};
  }
`;

export const SecFilingQANumber = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.chipPrimaryBg};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
  margin-top: 1px;
  line-height: 1;
`;

export const SecFilingQuestion = styled.span`
  flex: 1;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.contentPrimary};
  line-height: 1.5;
`;

export const SecFilingChevron = styled.span<{ $open: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.contentTertiary};
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s ease;
  margin-top: 3px;
`;

export const SecFilingContextBody = styled.div`
  /* number(20px) + gap(10px) + card-padding(12px) = 42px left indent */
  padding: 0 ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[3]} 42px;
  border-top: 1px solid ${({ theme }) => theme.colors.chatPanelBorder};
  background: ${({ theme }) => theme.colors.lightCyanBg};
`;

export const SecFilingContextText = styled.p`
  margin: ${({ theme }) => theme.spacing[2.5]} 0 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.contentTertiary};
  line-height: ${({ theme }) => theme.typography.lineHeight.loose};
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;

  /* Subtle scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.coolGray} transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.coolGray};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.contentTertiary};
  }
`;
