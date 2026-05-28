import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { normalizeMarkdown } from '@/utils/normalizeMarkdown';
import type { AlertSourceObject } from '@/api/types/alert.types';
import { useAlertSourceHighlightQuery } from '@/api/hooks/useAlertsQuery';
import { CloseIcon, SourceClipIcon } from '@/icons';
import {
  SourceViewerOverlay,
  SourceViewerContainer,
  SourceViewerHeader,
  SourceViewerTitleGroup,
  SourceViewerLabel,
  SourceViewerCloseButton,
  SourceViewerArticle,
  SourceHeroPlaceholder,
  SourceHeroBanner,
  SourceBannerSkeleton,
  SourceArticleBody,
  SourceArticleTitle,
  SourceMarkdownBody,
  SourceSkeletonWrapper,
  SourceSkeletonParagraph,
  SkeletonBlock,
  SourceErrorText,
} from './SourceViewerModal.styles';

// ─── Banner mapping ──────────────────────────────────────────────────────────────
// Maps the `reporting_company` code on a source object to its hero banner image.
// Add new entries here as new publication banners are added to /public.
const REPORTING_COMPANY_BANNER: Record<string, string> = {
  FBA: '/fba.webp',       // Financial Broadcasting Authority
  GWN: '/gwn.webp',       // Global Wire Network
  CDG: '/cdg.webp',       // Commerce Daily Gazette
  FTI: '/fti.webp',       // Fiscal Times International
  ITD: '/itd.webp',       // Innovation and Tech Digest
  SEC_10K: '/report.webp', // 10-K Annual Report
};

// ─── Mock data ───────────────────────────────────────────────────────────────────
// TODO: remove once the backend integration is wired up — the query result will
// replace both title and content automatically.

const MOCK_ARTICLE = {
  title: "How NorthWind's Fortunes Shifted Amid Global Challenges",
  content: `From Industry Dominance to Heavy Losses: How NorthWind's Fortunes Shifted Amid Global challenges.

Just a few years ago, NorthWind stood as a shining example of the semiconductor industry's profitability, raking in $11.28 billion in net income during fiscal 2022. Memory chip demand was surging, driven by smartphones, data centers, and the burgeoning interest in artificial intelligence (AI). Fast forward to fiscal 2023, and the picture is starkly different: revenue halved to $20.2 billion, turning a once highly profitable enterprise into one with a staggering $7.58 billion net loss.

This sharp downturn is tied to both cyclical market dips and geopolitics. NorthWind became a casualty in the intensifying Western Republic-The Primary Eastern Market tech rivalry, with The Eastern Capital barring its chips from certain sectors after a nebulous security review. This decision, announced in May, is estimated by NorthWind to have cost the company $5.2 billion in annual revenue, while the exact reasoning remains shrouded in mystery. CEO James Harrington recently stated that the impact of this ban on The Primary Eastern Market's domestic data center and networking markets had yet to fully stabilize, though it is now visible on the company's balance sheet.

<mark>For fiscal Q4 2023, the numbers tell a tale of partial recovery amidst a challenging environment. NorthWind reported $5.21 billion in revenue, a sequential improvement over $4.88 billion in the prior quarter but still a steep drop from $8.63 billion in the same period last year.</mark> Losses narrowed slightly to $1.39 per share on a non-Accounting Standards basis, better than Financial District Center's estimate of $1.55, but still far off profitability.

Breaking down the details, Volatile Memory Module, NorthWind's core product that constitutes 70% of revenue, saw an annual decline of 43.2% but managed a modest 3.8% sequential growth. Integrated Storage Module revenues, representing 29% of sales, slipped 27.4% compared to the prior year but jumped 19.7% quarter over quarter, suggesting some recovery in customer demand. Yet, gross margins remain deep in the red—negative 9% for the quarter—highlighting ongoing cost pressures and weak pricing across the industry.

NorthWind's management is banking on improving conditions in fiscal 2024, with revenue guidance for Q1 set at $5.72 billion, plus or minus $260 million. Gross margins are projected to inch closer to breakeven at negative 4.5%, indicating cautious optimism around stabilizing prices, inventory clearing, and increased Volatile Memory Module demand tied to AI applications. James Harrington also pointed to "disciplined supply" management and the benefits of leaning into leading-edge manufacturing.

However, even as NorthWind positions itself for an anticipated industry recovery, the shadow of the past year looms large. Its once-unstoppable momentum has been tempered by a tumultuous global environment, forcing the company to contend with both cyclical downturns and geopolitical fallout. The question investors now face is whether NorthWind can reclaim its former status as a growth leader—or whether the scars of 2023 will continue to weigh on its trajectory.`,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────────

/**
 * Ensures article text is properly formatted for Markdown rendering.
 * Delegates indentation stripping and inline-heading extraction to normalizeMarkdown,
 * then adds article-specific transforms:
 *  - Fixes missing space after # (##Heading → ## Heading)
 *  - Converts lone newlines to paragraph breaks for prose-style text
 */
const sanitizeMarkdown = (text: string): string =>
  normalizeMarkdown(text)
    .replace(/^(#{1,6})([^# \n])/gm, '$1 $2')  // ##Heading → ## Heading (missing space)
    .replace(/\n(?!\n)/g, '\n\n');              // single newline → paragraph break

/**
 * rehype-sanitize schema that permits:
 *  - <mark>  — backend text highlighting
 *  - <span>  with className — used by injectDropCap for the drop-cap letter
 */
const sourceMarkdownSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'mark'],
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    span: [...((defaultSchema.attributes as any)?.span ?? []), 'className'],
  },
};

/** Stable plugin tuple so ReactMarkdown does not re-mount on every render. */
const sourceRehypePlugins: any[] = [rehypeRaw, [rehypeSanitize, sourceMarkdownSchema]];

/**
 * Injects a <span class="source-drop-cap"> for the first letter of the first
 * non-heading paragraph. The span passes through rehype-raw so ReactMarkdown
 * renders it as a real DOM element — ::first-letter pseudo-elements ignore
 * explicit width/height, a real element does not.
 */
const injectDropCap = (text: string): string => {
  const paras = text.split('\n\n');
  const idx = paras.findIndex((p) => {
    const t = p.trim();
    // Skip headings and paragraphs that open with an HTML tag (e.g. <mark>…</mark>).
    // Taking para[0] from "<mark>…" would produce "<" as the drop-cap letter and
    // leave "mark>…" as visible text — so we only inject into plain-text paragraphs.
    return t.length > 0 && !t.startsWith('#') && !t.startsWith('<');
  });
  if (idx === -1) return text;
  const para = paras[idx].trim();
  paras[idx] = `<span class="source-drop-cap">${para[0]}</span>${para.slice(1)}`;
  return paras.join('\n\n');
};

// ─── Types ────────────────────────────────────────────────────────────────────────

export interface SourceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: AlertSourceObject | null;
  alertId?: number | null;
}

// ─── Component ───────────────────────────────────────────────────────────────────

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({
  isOpen,
  onClose,
  source,
  alertId,
}) => {
  const { data: sourceMarkdown, isLoading, error } = useAlertSourceHighlightQuery(
    alertId ?? null,
    isOpen && source?.id != null ? Number(source.id) : null,
  );

  const [isBannerLoaded, setIsBannerLoaded] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // All derived values and hooks must run before any conditional return.
  // Prefer a banner determined by reporting_company; fall back to an explicit image_url
  // (legacy / future field), and finally show the plain dark placeholder.
  const reportingCompany = source?.reporting_company?.toUpperCase();
  const imageUrl: string | undefined =
    (reportingCompany ? REPORTING_COMPANY_BANNER[reportingCompany] : undefined) ??
    ((source as Record<string, unknown> | null)?.image_url as string | undefined);

  // Reset and preload whenever the banner URL changes so the skeleton is shown
  // for every new source, not just the first one opened.
  useEffect(() => {
    if (!imageUrl) return;
    setIsBannerLoaded(false);
    const img = new Image();
    img.onload = () => setIsBannerLoaded(true);
    img.onerror = () => setIsBannerLoaded(true); // reveal slot even when image 404s
    img.src = imageUrl;
  }, [imageUrl]);

  const displayTitle = sourceMarkdown && source?.title ? source.title : MOCK_ARTICLE.title;

  const renderedContent = useMemo(() => {
    const raw = sourceMarkdown ?? MOCK_ARTICLE.content;
    return injectDropCap(sanitizeMarkdown(raw));
  }, [sourceMarkdown]);

  if (!isOpen || !source) return null;

  return createPortal(
    <SourceViewerOverlay role="dialog" aria-modal="true" aria-label="Source article viewer">
      <SourceViewerContainer>
        {/* ── Header ── */}
        <SourceViewerHeader>
          <SourceViewerTitleGroup>
            <SourceClipIcon width={17} height={17} />
            <SourceViewerLabel>Source</SourceViewerLabel>
          </SourceViewerTitleGroup>
          <SourceViewerCloseButton type="button" onClick={onClose} aria-label="Close source viewer">
            <CloseIcon width={20} height={20} />
          </SourceViewerCloseButton>
        </SourceViewerHeader>

        {/* ── Article card ── */}
        <SourceViewerArticle>
          {imageUrl ? (
            isBannerLoaded ? (
              <SourceHeroBanner $src={imageUrl} role="img" aria-hidden="true" />
            ) : (
              <SourceBannerSkeleton aria-hidden="true" />
            )
          ) : (
            <SourceHeroPlaceholder aria-hidden="true" />
          )}

          <SourceArticleBody>
            <SourceArticleTitle>{displayTitle}</SourceArticleTitle>

            {isLoading && (
              <SourceSkeletonWrapper>
                <SourceSkeletonParagraph>
                  <SkeletonBlock $w="100%" $h="14px" />
                  <SkeletonBlock $w="97%" $h="14px" />
                  <SkeletonBlock $w="100%" $h="14px" />
                  <SkeletonBlock $w="88%" $h="14px" />
                </SourceSkeletonParagraph>
                <SourceSkeletonParagraph>
                  <SkeletonBlock $w="100%" $h="14px" />
                  <SkeletonBlock $w="95%" $h="14px" />
                  <SkeletonBlock $w="100%" $h="14px" />
                  <SkeletonBlock $w="72%" $h="14px" />
                </SourceSkeletonParagraph>
                <SourceSkeletonParagraph>
                  <SkeletonBlock $w="100%" $h="14px" />
                  <SkeletonBlock $w="92%" $h="14px" />
                  <SkeletonBlock $w="55%" $h="14px" />
                </SourceSkeletonParagraph>
              </SourceSkeletonWrapper>
            )}

            {!isLoading && error && (
              <SourceErrorText>Failed to load source. Please try again.</SourceErrorText>
            )}

            {!isLoading && (
              <SourceMarkdownBody>
                <ReactMarkdown rehypePlugins={sourceRehypePlugins}>{renderedContent}</ReactMarkdown>
              </SourceMarkdownBody>
            )}
          </SourceArticleBody>
        </SourceViewerArticle>
      </SourceViewerContainer>
    </SourceViewerOverlay>,
    document.body,
  );
};
