/**
 * Normalizes AI-generated Markdown content before rendering.
 *
 * Problems addressed:
 * 1. Leading indentation on lines — Markdown treats 4-space indent as a fenced
 *    code block, causing body text to render grey in a monospace box.
 * 2. Inline headings — "sentence ## Heading rest of text" needs the heading
 *    moved onto its own line so the Markdown parser recognises it as an ATX heading.
 * 3. Missing blank lines around headings — required for correct block parsing.
 * 4. Consecutive blank lines — collapsed to a single blank line for clean output.
 */
export function normalizeMarkdown(content: unknown): string {
  if (!content) return '';
  // Runtime guard: the backend occasionally sends non-string values (arrays,
  // objects, numbers) even though TypeScript types them as string. Coerce them
  // early so the rest of the pipeline can safely call string methods.
  if (typeof content !== 'string') return String(content);

  // 1. Trim leading whitespace from every line to prevent the 4-space code-block rule.
  let cleaned = content
    .split('\n')
    .map((line) => line.trimStart())
    .join('\n');

  // 2. Promote headings that appear mid-line to their own line.
  //    "sentence ## Heading" → "sentence\n\n## Heading"
  //    The \s* before the heading marker consumes any whitespace so it doesn't
  //    become a trailing space on the preceding line.
  cleaned = cleaned.replace(/([^\n])\s*(#{1,6} )/g, '$1\n\n$2');

  // 3. Ensure a blank line BEFORE and AFTER every heading, even when body text
  //    follows the heading on the same line (common in AI-generated output).
  //    "## Heading body text" → "\n\n## Heading body text\n\n"
  cleaned = cleaned.replace(/(#{1,6} [^\n]+)/g, '\n\n$1\n\n');

  // 4. Collapse runs of 3+ blank lines to a single blank line.
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

/**
 * Normalizes agent input / output / reasoning text before markdown rendering.
 *
 * The backend generates these strings from Python templates that use single
 * newlines as visual line separators and heavy leading indentation.  Standard
 * Markdown collapses a single \n between lines into a space (soft-wrap), so
 * "Line A\nLine B" renders as "Line A Line B" — which looks terrible for
 * structured agent prompts.
 *
 * Extra problems handled on top of normalizeMarkdown:
 *
 * 5. Single newlines between non-empty lines → promoted to paragraph breaks
 *    (\n\n) so each logical line renders as its own block.
 *
 * 6. Unicode bullet characters (•, ‣, ▸, ◦) at the start of a line are
 *    replaced with the Markdown list marker "- " so they render as a proper
 *    <ul> instead of raw glyph text.
 */
export function normalizeAgentText(content: unknown): string {
  if (!content) return '';

  // Base cleanup: strip indentation, fix headings, collapse 3+ blank lines.
  let cleaned = normalizeMarkdown(content);

  // 5. Convert Unicode bullet characters at line-start to markdown list markers.
  //    Covers the most common Unicode bullets used by LLMs and template strings.
  cleaned = cleaned.replace(/^[•‣▸◦]\s*/gm, '- ');

  // 6. Promote single newlines to paragraph breaks.
  //    A single \n between two non-blank lines is a soft wrap in Markdown and
  //    renders as a space, merging visually distinct lines into one paragraph.
  //    Replacing every lone \n with \n\n makes each line its own block element.
  //    The subsequent collapse step removes any triple+ blank lines created here.
  cleaned = cleaned.replace(/\n(?!\n)/g, '\n\n');

  // 7. Re-collapse runs of 3+ blank lines (side-effect of step 6).
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}
