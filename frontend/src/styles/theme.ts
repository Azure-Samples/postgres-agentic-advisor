import { DropdownText } from "@/components/Dropdown/Dropdown.styles";

const colors = {
  primary: '#067394',
  hoverPrimary: '#1194BC',
  SuggestionPillBg: 'rgba(142, 200, 232, 0.20)',
  logoText: '#292A31',
  navLinkSecondary:'#4A4B57',
  logoGradient: 'linear-gradient(180deg, rgba(107, 221, 255, 0.20) 0%, rgba(6, 115, 148, 0.20) 100%)',
  secondary: '#F8F9FA',
  contentPrimary: '#01171E',
  contentSecondary: '#272F3A',
  contentTertiary: '#617692',
  disabledBg: '#E1E1E3',
  disabledText: '#787885',
  grayText: '#7D8A8A',
  darkGray: '#757575',
  neutralGray: '#F5F5F5',
  lightGray: '#F9F9F9',
  coolGray: '#CFD6DE',
  drawerDivider: '#D2D2D6',
  chatPanelBorder: '#E2EBF7',
  white: '#ffffff',
  black: '#000000',
  lightBlueBg: '#EBF2FF',
  lightCyanBg: '#F2F8F9',
  shadowOverlay: 'rgba(0, 0, 0, 0.15)',
  green: {
    50: 'rgba(27, 176, 35, 1)',
    100: '#1BB023',
  },
  // Toast colors
  toast: {
    success: {
      background: '#D1FFD6',
      iconBg: '#CBE5CC',
      text: '#1BB023',
      icon: '#1BB023',
      closeIcon: '#3F8C42',
    },
    error: {
      background: '#FFE6E6',
      iconBg: '#FFCCCC',
      text: '#DC2626',
      icon: '#DC2626',
      closeIcon: '#B91C1C',
    },
    warning: {
      background: '#FEF3CD',
      iconBg: '#FDE68A',
      text: '#D97706',
      icon: '#D97706',
      closeIcon: '#B45309',
    },
    info: {
      background: '#E0F2FE',
      iconBg: '#BAE6FD',
      text: '#067394',
      icon: '#067394',
      closeIcon: '#067394',
    },
  },
  border: '#E5E5E5',
  subtleBorder: 'rgba(0, 0, 0, 0.10)',
  overlayHover: 'rgba(6, 115, 148, 0.02)',
  drawerOverlay: '#393F4B',
  drawerOverlayOpacity: '0.7',
  transparent: 'transparent',
  dropDownText:'#0A0A0A',
  dropDownItemText: '#171717',
  chipPrimaryBg: 'rgba(6, 115, 148, 0.10)',
  'light-sky-blue-20': 'rgba(142, 200, 232, 0.20)',
  'light-sky-blue-15': 'rgba(0, 212, 255, 0.15)',
  'light-sky-blue': '#0080FF',
  'charcoal-blue': '#272F3A',
  'lavender-gray-40': 'rgba(214, 219, 237, 0.40)',
  // Side drawer specific colors
  drawerBg: '#F8F9FA',
  drawerBorder: '#EEEEEE',
  drawerShadow: 'rgba(6, 115, 148, 0.15)',
  chatItemBg: '#F8F9FA',
  cardBorder: '#EFEFEF',
  skeletonBg: '#F2F4F9',
  // Semantic error colors
  error: '#d32f2f',
  errorBg: '#ffebee',
  tileTitle: '#1A1A1A',
  // Tooltip
  tooltipBg: '#202020',
  accentPurple: '#8979FF',
  // Preset date card
  presetCardBorder: '#ebedee',
  presetCardUnselectedBg: '#f4f4f4',
  presetCardSelectedBg: 'rgba(56, 143, 169, 0.1)',
  presetCardSelectedBorder: '#eff6f8',
  presetDateUnselected: '#3B3B3B',
  // Input field
  inputBorder: '#c9c9c9',
  inputPlaceholder: 'rgba(1, 23, 30, 0.5)',
  surfaceSubtle: '#f4f4f4',
  historyLabel: '#808B8E',
  dangerText: '#ef4444',
  buttonHoverOverlay: 'rgba(0, 0, 0, 0.08)',
  // Semantic status
  successGreen: '#06904e',
  trendDown: '#FF4D4F',
  trendUp: '#52C41A',
  warningOrange: '#FA8C16',
  // Company brand background colors
  companies: {
    adventureWorks: '#CA763A',
    northWind: '#537FF1',
    zavaTechnologies: '#FFAE4C',
    contosoCompute: '#0089D3',
    nanofabEquipments: '#BF3D52',
    eduCare: '#1C908C',
  },
  // Workflow canvas + node colour palette
  workflow: {
    titleColor: '#111827',
    eventBorder: '#8979FF',
    nodeBorder: '#DEDAFF',
    canvasBorder: '#D0D5DD',
    canvasBg: '#FFFFFF',
    badgeBorder: '#9E92FE',
    accentPurple: '#8B5CF6',
    insightGradient: 'linear-gradient(251deg, #7663FF 56.21%, #8979FF 87.81%, #DEDAFF 119.42%)',
    surfaceBorder: '#FBFBFB',
    entityCardBorder: '#EDEDED',
    entityRingBorder: '#9E92FE',
    tabBtnHoverBg: '#F5F5F5',
    tabBtnActiveBg: '#EBEBEB',
    relationshipCanvasBg: '#FBFBFB',
    pipelineEdge: '#A4AECF',
    pipelineEdgeInactive: '#E1E5EE',
    relationshipEdge: '#DFDFDF',
    refinementLabelBg: '#F7F6FF',
    refinementLabelBorder: '#E9D5FF',
    refinementLabelColor: '#617692',
  },
};

const typography = {
  fontFamily: {
    primary: '"Roboto", sans-serif',
  },
  fontSize: {
    xxs: '0.5rem',     // 8px
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    smPlus: '0.9375rem', // 15px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '2.5xl': '1.75rem', // 28px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.14,
    normal: 1.5,
    description: 1.27,
    relaxed: 1.75,
    loose: 1.7,
  },
  letterSpacing: {
    tight: '-0.025em',
    tileSubtitle: '-0.02em',
    normal: '0',
    tileTitle: '0.02em',
    wide: '0.025em',
    dateLabel: '0.4px',
    bodyContent: '0.32px',
    allCaps: '0.04em',
    label: '0.6px',
    badge: '0.3px',
  },
};

const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.3: '0.325rem',  // 5px
  1.5: '0.375rem', // 6px
  2: '0.5rem',    // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
};

const border = {
  light: '1px solid #E5E5E5',
  dark: '1px solid #272F3A',
};

const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.20)',
  alertTile: '0 2px 4px 0 hsla(194, 92%, 30%, 0.15)',
  input: '0px 1px 1px rgba(0, 0, 0, 0.1)',
  chatContentBox: '0px 0px 1px rgba(0, 0, 0, 0.15)',
  sm: '0 12px 30px 0 rgba(6, 115, 148, 0.08)',
  md: ' 0 12px 24px 0 rgba(27, 78, 163, 0.08), 0 24px 48px 0 rgba(41, 121, 255, 0.08)',
  workflowNode: '0 1px 3px rgba(139, 92, 246, 0.08)',
  workflowNodeHover: '0 2px 8px rgba(139, 92, 246, 0.18)',
  workflowInsight: '0 2px 8px rgba(124, 58, 237, 0.35)',
  buttonSubtle: '0 3px 8px 0 rgba(217, 217, 217, 0.45)',
  workflowCanvas: '0 0 2px 0 rgba(0, 0, 0, 0.15)',
  dropdown: '0px 2px 2px rgba(113, 113, 113, 0.1), 0px 4px 16px rgba(0, 0, 0, 0.12)',
};

const borderRadius = {
  none: '0',
  xs: '0.125rem',   // 2px
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  nav: 100,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
  portalTooltip: 9999,
};

const component = {
  inputField: {
    minPlaceholderWidth: 20,
    maxPlaceholderWidth: 400,
    widthBuffer: 14,
    shrinkThreshold: 6,
    transition: 'width 90ms ease-out, background-color 120ms ease, box-shadow 120ms ease',
    placeholderLetterSpacing: '0.2px',
    placeholderPaddingY: '8px',
    placeholderPaddingX: '12px',
  }
} as const;

const layout = {
  dashboardZoom: 0.9,
  dashboardLayoutOffset: '136px',
  workflowHeaderLogoSize: '1.8125rem', // 29px
  searchInputHeight: '2.625rem',       // 42px
  renameBorderWidth: '1.5px',
  tileDropdownMinWidth: '7.5rem',      // 120px
};

export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
};


export const theme = {
  colors,
  typography,
  spacing,
  breakpoints,
  shadows,
  borderRadius,
  zIndex,
  media,
  border,
  component,
  layout,
} as const;

export type Theme = typeof theme;

export default theme;
