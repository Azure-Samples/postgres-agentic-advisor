// ─── React Flow handle styles ─────────────────────────────────────────────────
// Typed constants used as the `style` prop on React Flow <Handle> elements.
// React Flow requires the style prop for handle positioning; these named
// constants replace any anonymous inline-style literals.
// Edge / connector colours live in theme.colors.workflow.pipelineEdge;
// use useTheme() in components that render SVG attributes.

import type { CSSProperties } from 'react';
import theme from '../styles/theme';

// ─── Pipeline node dimensions ─────────────────────────────────────────────────

/** Height of an agent node in the pipeline canvas (px) */
export const PIPELINE_NODE_HEIGHT = 38;

/** Height of a compact (event / insight) node in the pipeline canvas (px) */
export const COMPACT_NODE_HEIGHT = 34;

/** Width of an agent node in the pipeline canvas (px) */
export const PIPELINE_NODE_WIDTH = 220;

/** Width of a compact node in the pipeline canvas (px) */
export const COMPACT_NODE_WIDTH = 120;

/** Vertical step between consecutive pipeline rows:
 *  node height (~54px with 16px padding) + ~86px visible arrow gap = 140px */
export const PIPELINE_V_STEP = 155;

/** Tighter vertical step for the first two rows (Event → root → planning).
 *  These nodes are simpler so a shorter gap looks more balanced visually. */
export const PIPELINE_V_STEP_UPPER = 115;


/** Horizontal gap between sibling node centres in a fan-out level.
 *  node width (220px) + 52px gutter = 272px */
export const PIPELINE_H_GAP = 272;

/** Renders a React Flow handle as fully invisible (no pointer-events) */
export const HIDDEN_HANDLE_STYLE: CSSProperties = {
  opacity: 0,
  pointerEvents: 'none',
};

/** Renders the bottom handle as the hollow junction circle that sits on the
 *  node's bottom border, matching the Figma connector design. */
export const CIRCLE_HANDLE_STYLE: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: '#FFFFFF',
  border: `1.5px solid ${theme.colors.workflow.pipelineEdge}`,
  pointerEvents: 'none',
};
