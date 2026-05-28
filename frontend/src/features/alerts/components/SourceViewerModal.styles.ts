import styled, { keyframes } from 'styled-components';

// ─── Design tokens ──────────────────────────────────────────────────────────────
// #FFE9A8 is the source-highlight colour from the Figma spec — not yet in the
// shared theme palette, so it lives here until a token is added.
const SOURCE_HIGHLIGHT_BG = '#FFE9A8';

// ─── Animation ──────────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

const shimmer = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

// ─── Layout ─────────────────────────────────────────────────────────────────────

export const SourceViewerOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: ${({ theme }) => theme.colors.secondary};
  overflow-y: auto;
  animation: ${fadeIn} 0.2s ease-out;

  /* ── Custom scrollbar ── */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.coolGray};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.contentTertiary};
  }

  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.coolGray} transparent;
`;

export const SourceViewerContainer = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[8]};
  box-sizing: border-box;
  animation: ${slideUp} 0.2s ease-out;
`;

// ─── Header ─────────────────────────────────────────────────────────────────────

export const SourceViewerHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

export const SourceViewerTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const SourceViewerLabel = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.logoText};
`;

export const SourceViewerCloseButton = styled.button`
  /* Fixed so the button stays in the top-right corner while the article scrolls. */
  position: fixed;
  top: ${({ theme }) => theme.spacing[8]};
  right: ${({ theme }) => theme.spacing[8]};
  z-index: 10000;

  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing[10]};
  height: ${({ theme }) => theme.spacing[10]};
  padding: 0;
  border: none;
  /* Subtle background so the X stays legible over any article content */
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.contentPrimary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.lightBlueBg};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

// ─── Article card ───────────────────────────────────────────────────────────────

export const SourceViewerArticle = styled.article`
  background: ${({ theme }) => theme.colors.white};
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 857px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
`;

// Hero image area — renders a dark placeholder when no image URL is available
export const SourceHeroPlaceholder = styled.div`
  width: 100%;
  height: 190px;
  background: #323232;
  flex-shrink: 0;
`;

// Shimmer skeleton shown while the banner image is fetching
export const SourceBannerSkeleton = styled.div`
  width: 100%;
  height: 190px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;

// Using a div + background-image instead of <img> gives us background-position
// control so the banner text (which lives in the left-center of each asset)
// is always properly framed regardless of the image's natural dimensions.
export const SourceHeroBanner = styled.div<{ $src: string }>`
  width: 100%;
  height: 190px;
  flex-shrink: 0;
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: left center;
  background-repeat: no-repeat;
`;

export const SourceArticleBody = styled.div`
  width: 100%;
  max-width: 710px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[8]} 0;
`;

export const SourceArticleTitle = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

// ─── Markdown body ───────────────────────────────────────────────────────────────

export const SourceMarkdownBody = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  /* 1.75 line-height — comfortable for long-form article reading */
  line-height: 1.75;
  color: ${({ theme }) => theme.colors.contentPrimary};

  /* ── Paragraphs ── */
  p {
    margin: 0 0 ${({ theme }) => theme.spacing[4]};

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* ── Heading hierarchy ── */
  h1, h2, h3, h4, h5, h6 {
    margin: ${({ theme }) => theme.spacing[6]} 0 ${({ theme }) => theme.spacing[2]};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: 1.25;
    color: ${({ theme }) => theme.colors.contentPrimary};

    &:first-child {
      margin-top: 0;
    }
  }

  h1 { font-size: ${({ theme }) => theme.typography.fontSize['2xl']}; }
  h2 { font-size: ${({ theme }) => theme.typography.fontSize.xl}; }
  h3 { font-size: ${({ theme }) => theme.typography.fontSize.lg}; }
  h4 { font-size: ${({ theme }) => theme.typography.fontSize.base}; }
  h5, h6 {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ── Inline emphasis ── */
  strong, b {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }

  em, i {
    font-style: italic;
  }

  /* ── Links ── */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.75;
    }
  }

  /* ── Highlighted passages sent by the backend (or used in mock data) ── */
  mark {
    background: ${SOURCE_HIGHLIGHT_BG};
    color: inherit;
    padding: 2px 4px;
    border-radius: 3px;
  }

  /* ── Lists ── */
  ul, ol {
    margin: ${({ theme }) => theme.spacing[2]} 0 ${({ theme }) => theme.spacing[4]};
    padding-left: ${({ theme }) => theme.spacing[6]};

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing[1]};
    padding-left: ${({ theme }) => theme.spacing[1]};

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* Nested lists */
  li > ul,
  li > ol {
    margin: ${({ theme }) => theme.spacing[1]} 0 0;
  }

  /* ── Blockquotes ── */
  blockquote {
    margin: ${({ theme }) => theme.spacing[4]} 0;
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
    border-left: 3px solid ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.lightBlueBg};
    border-radius: 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0;
    color: ${({ theme }) => theme.colors.contentSecondary};
    font-style: italic;

    p {
      margin: 0;
    }
  }

  /* ── Inline code ── */
  code {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 0.875em;
    background: ${({ theme }) => theme.colors.neutralGray};
    border: 1px solid ${({ theme }) => theme.colors.coolGray};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    padding: 1px 5px;
    color: ${({ theme }) => theme.colors.contentPrimary};
  }

  /* ── Code blocks ── */
  pre {
    margin: ${({ theme }) => theme.spacing[4]} 0;
    background: ${({ theme }) => theme.colors.neutralGray};
    border: 1px solid ${({ theme }) => theme.colors.coolGray};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: ${({ theme }) => theme.spacing[4]};
    overflow-x: auto;
    line-height: 1.5;

    code {
      font-family: Consolas, 'Courier New', monospace;
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      background: transparent;
      border: none;
      padding: 0;
    }
  }

  /* ── Horizontal rule ── */
  hr {
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.coolGray};
    margin: ${({ theme }) => theme.spacing[6]} 0;
  }

  /* ── Tables ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: ${({ theme }) => theme.spacing[4]} 0;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    line-height: 1.5;
  }

  th {
    background: ${({ theme }) => theme.colors.lightBlueBg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.contentPrimary};
    text-align: left;
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    border: 1px solid ${({ theme }) => theme.colors.coolGray};
  }

  td {
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    border: 1px solid ${({ theme }) => theme.colors.coolGray};
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background: ${({ theme }) => theme.colors.lightGray ?? theme.colors.neutralGray};
  }

  /* ── Drop cap ──────────────────────────────────────────────────────────────
   * Injected as <span class="source-drop-cap"> via rehype-raw.
   * float: left lets the paragraph text wrap alongside and below — this is
   * the only layout model that works correctly for multi-line paragraphs. */
  .source-drop-cap {
    float: left;
    width: 40px;
    height: 1.5rem; /* one body line-height = 24px; limits float clearance to exactly one row */
    margin-right: ${({ theme }) => theme.spacing[1]};
    background: #000000;
    color: ${({ theme }) => theme.colors.white};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: 1.5rem;
    text-align: center;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  /* Clearfix: ensure the paragraph containing the float stretches to contain it */
  p:has(.source-drop-cap) {
    overflow: hidden;
  }
`;

// ─── Loading skeleton ────────────────────────────────────────────────────────────

export const SourceSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const SourceSkeletonParagraph = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const SkeletonBlock = styled.div<{ $w?: string; $h?: string; $radius?: string }>`
  width: ${({ $w }) => $w ?? '100%'};
  height: ${({ $h }) => $h ?? '14px'};
  border-radius: ${({ $radius, theme }) => $radius ?? theme.borderRadius.sm};
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;

// ─── Error state ──────────────────────────────────────────────────────────────────

export const SourceErrorText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.error};
`;

