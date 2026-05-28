import styled from 'styled-components';

// ── Container ──────────────────────────────────────────────────────────────────

export const CollapsibleContainer = styled.div`
  width: 100%;
  margin-top: 10px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid #efefef;
  border-radius: 6px;
  overflow: hidden;
`;

// ── Header row ─────────────────────────────────────────────────────────────────

export const CollapsibleHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: 12px 16px 12px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  user-select: none;
  text-align: left;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.neutralGray};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: -2px;
  }
`;

export const CollapsibleLabel = styled.span`
  flex: 1;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: #556983;
  line-height: 1.14;
`;

export const ChevronWrapper = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #556983;
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(0deg)' : 'rotate(180deg)')};
`;

// ── Expanded content ───────────────────────────────────────────────────────────

export const CollapsibleContent = styled.div`
  padding: 0 12px 12px;
`;

/**
 * Wrapper for the per-line JSON renderer.
 * Carries shared typography and token colours so each JsonLine inherits them.
 *
 * Token classes injected by syntaxHighlightJson:
 *   .jk   — object key
 *   .js   — string value
 *   .jb   — boolean (true / false)
 *   .jn   — null
 *   .jnum — number
 */
export const JsonWrapper = styled.div`
  margin: 0;
  padding: ${({ theme }) => theme.spacing[3]} 0 0;
  font-family: 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace;
  font-size: 12.5px;
  font-weight: 400;
  line-height: 1.75;
  color: #4a5568;

  /* ── Syntax token colours ── */
  .jk   { color: #617692; font-weight: 600; }
  .js   { color: #067394; }
  .jb   { color: #8677ff; }
  .jn   { color: #999;    font-style: italic; }
  .jnum { color: #c0532a; }
`;

/**
 * One logical JSON line.
 *
 * $hangingIndent (chars) = leading spaces + length of '"key": ' prefix.
 * padding-left pushes ALL wrapped continuation lines to that column;
 * text-indent pulls the FIRST line back to the container edge — so the first
 * line starts at position 0 (preserving its own leading whitespace naturally)
 * while every wrapped continuation starts exactly below the value.
 */
export const JsonLine = styled.div<{ $hangingIndent: number }>`
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
  padding-left: ${({ $hangingIndent }) => $hangingIndent}ch;
  text-indent: ${({ $hangingIndent }) => -$hangingIndent}ch;
`;
