import React, { useState, useCallback, useMemo } from 'react';
import { ReasoningChevronIcon } from '@/icons';
import {
  CollapsibleContainer,
  CollapsibleHeader,
  CollapsibleLabel,
  ChevronWrapper,
  CollapsibleContent,
  JsonWrapper,
  JsonLine,
} from './ReasoningContextCollapsible.styles';

// ── JSON syntax highlighter ───────────────────────────────────────────────────

/**
 * Matches (in order of priority):
 *  1. Quoted string — optionally followed by whitespace + ":" (= object key)
 *  2. Keywords: true | false | null
 *  3. Numbers (integer, float, scientific notation)
 */
const JSON_TOKEN_RE =
  /("(?:\\u[0-9A-Fa-f]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;

/**
 * Converts a JSON string into an HTML string with syntax-highlighting spans.
 * The input is HTML-escaped first so injected data cannot break the markup.
 */
function syntaxHighlightJson(json: string): string {
  const safe = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return safe.replace(JSON_TOKEN_RE, (match) => {
    let cls: string;
    if (match.startsWith('"')) {
      // A quoted string that ends with ':' (possibly with leading whitespace) is a key.
      cls = /:$/.test(match.trimEnd()) ? 'jk' : 'js';
    } else if (match === 'true' || match === 'false') {
      cls = 'jb';
    } else if (match === 'null') {
      cls = 'jn';
    } else {
      cls = 'jnum';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface ReasoningContextCollapsibleProps {
  /** Parsed output JSON object from the Risk Insight Agent */
  data: Record<string, unknown>;
}

/**
 * Collapsible "Reasoning Context" panel rendered inside the Risk Insight
 * Agent's Output section whenever the agent's output contains an `alert_data`
 * key.  Closed by default; expands to show the full output JSON with
 * syntax-highlighted tokens.
 */
const ReasoningContextCollapsible: React.FC<ReasoningContextCollapsibleProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Pre-compute per-line highlighted HTML — only re-runs when `data` changes.
  const lines = useMemo(() => {
    const raw = JSON.stringify(data, null, 2);
    const rawLines = raw.split('\n');
    const htmlLines = syntaxHighlightJson(raw).split('\n');

    return rawLines.map((rawLine, i) => {
      // Hanging indent = leading spaces + length of `"key": ` prefix (if any).
      const leadingSpaces = rawLine.length - rawLine.trimStart().length;
      const keyMatch = rawLine.trimStart().match(/^"(?:[^"\\]|\\.)*":\s*/);
      const hangingIndent = leadingSpaces + (keyMatch ? keyMatch[0].length : 0);

      return { html: htmlLines[i] ?? '', hangingIndent };
    });
  }, [data]);

  return (
    <CollapsibleContainer>
      <CollapsibleHeader
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="reasoning-context-content"
      >
        <CollapsibleLabel>Reasoning Context</CollapsibleLabel>
        <ChevronWrapper $isOpen={isOpen}>
          <ReasoningChevronIcon />
        </ChevronWrapper>
      </CollapsibleHeader>

      {isOpen && (
        <CollapsibleContent id="reasoning-context-content">
          <JsonWrapper>
            {lines.map(({ html, hangingIndent }, i) => (
              <JsonLine
                key={i}
                $hangingIndent={hangingIndent}
                // Safe: syntaxHighlightJson HTML-escapes the JSON string before
                // injecting span wrappers — no raw user input is rendered as HTML.
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ))}
          </JsonWrapper>
        </CollapsibleContent>
      )}
    </CollapsibleContainer>
  );
};

export default ReasoningContextCollapsible;
