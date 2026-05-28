import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

export const SkeletonBlock = styled.div<{ $w?: string; $h?: string; $radius?: string }>`
  background: linear-gradient(90deg, #e8ecef 25%, #f0f3f4 50%, #e8ecef 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: ${({ $radius }) => $radius ?? '6px'};
  width: ${({ $w }) => $w ?? '100%'};
  height: ${({ $h }) => $h ?? '16px'};
  flex-shrink: 0;
`;

/** Width of the floating Edit with AI panel. Shared with AISummaryContent for portal positioning. */
export const EDIT_PANEL_WIDTH = 448;

export const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
  animation: summaryFadeIn 0.25s ease-out;

  @keyframes summaryFadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const SummaryHeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
`;

export const ClientCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2.5]};
  background-color: ${({ theme }) => theme.colors.white};
`;

export const ClientCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const ClientAvatar = styled.div`
  width: ${({ theme }) => theme.spacing[8]};
  height: ${({ theme }) => theme.spacing[8]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

export const ClientNameWithNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const ClientName = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

export const LastCrmNote = styled.span`
  color: ${({ theme }) => theme.colors.disabledText};
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.14;
  white-space: nowrap;
`;

export const ClientMetricsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[12]};
  flex-wrap: wrap;
`;

export const MetricItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.disabledText};
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

export const MetricValue = styled.span`
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

export const WorkflowMarkdown = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.contentSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};

  /* Reset default browser margins on block elements */
  p, ul, ol, pre, blockquote {
    margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    margin: ${({ theme }) => theme.spacing[3]} 0 ${({ theme }) => theme.spacing[1]} 0;
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.contentPrimary};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};

    &:first-child {
      margin-top: 0;
    }
  }

  h1 { font-size: ${({ theme }) => theme.typography.fontSize.lg}; }
  h2 { font-size: ${({ theme }) => theme.typography.fontSize.base}; }
  h3, h4, h5, h6 { font-size: ${({ theme }) => theme.typography.fontSize.sm}; }

  ul, ol {
    padding-left: ${({ theme }) => theme.spacing[5]};
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }

  strong {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.contentPrimary};
  }

  em {
    font-style: italic;
  }

  code {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    background-color: ${({ theme }) => theme.colors.neutralGray};
    color: ${({ theme }) => theme.colors.contentPrimary};
    padding: 1px ${({ theme }) => theme.spacing[1]};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  pre {
    background-color: ${({ theme }) => theme.colors.neutralGray};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: ${({ theme }) => theme.spacing[3]};
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
    }
  }

  blockquote {
    border-left: 3px solid ${({ theme }) => theme.colors.coolGray};
    padding-left: ${({ theme }) => theme.spacing[3]};
    color: ${({ theme }) => theme.colors.contentTertiary};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }

  hr {
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.coolGray};
    margin: ${({ theme }) => theme.spacing[2]} 0;
  }
`;

export const SummaryLoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[10]};
`;

export const EmptySummaryState = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.contentTertiary};
`;

export const SummaryErrorState = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const SummaryErrorMessage = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.contentSecondary};
`;

export const SummaryRetryButton = styled.button`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[5]};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
`;

export const AiSummarySection = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.lightBlueBg};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 0 2px 0 ${({ theme }) => theme.colors.shadowOverlay};
  display: flex;
  padding: ${({ theme }) => theme.spacing[5]};
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  align-self: stretch;
`;

export const AiSummaryLabel = styled.div`
  color: ${({ theme }) => theme.colors.contentPrimary};
  text-align: left;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1.5;
  letter-spacing: 0.135px;
`;

export const AiSummaryTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentPrimary};
  text-align: left;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1.5;
  letter-spacing: 0.135px;
`;

export const AiSummaryDescription = styled.p`
  margin: 0;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.contentTertiary};
  text-overflow: ellipsis;
  text-align: left;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.27;
  letter-spacing: 0.32px;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

export const SourcesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  align-self: flex-start;
`;

export const SourcesIcon = styled.div`
  width: ${({ theme }) => theme.spacing[5]};
  height: ${({ theme }) => theme.spacing[5]};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const SourcesLabel = styled.span`
  color: ${({ theme }) => theme.colors.contentPrimary};
  text-align: left;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1.27;
`;

export const SourcesContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
  align-self: stretch;
`;

export const SourceChip = styled.div`
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.neutralGray};
  color: ${({ theme }) => theme.colors.contentTertiary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.27;
  white-space: nowrap;
`;

export const SuggestedResponseSection = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.lightBlueBg};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 0 2px 0 ${({ theme }) => theme.colors.shadowOverlay};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  overflow-y: auto;
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

export const SuggestedHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({ theme }) => theme.colors.lightCyanBg};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.lg};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.lg};
`;

export const SuggestedHeaderInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[2]};
  box-sizing: border-box;
`;

export const SuggestedTagButton = styled.button`
  display: flex;
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[3]};
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors['light-sky-blue-15']};
  border: none;
`;

export const SuggestedTagText = styled.span`
  color: ${({ theme }) => theme.colors['light-sky-blue']};
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-style: normal;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

export const SuggestedControls = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: nowrap;
  white-space: nowrap;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const PagerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: 0 ${({ theme }) => theme.spacing[2]};
`;

export const PagerText = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

export const IconActionButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  width: ${({ theme }) => theme.spacing[5]};
  height: ${({ theme }) => theme.spacing[5]};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

export const EditWithAiButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
`;

export const EditWithAiText = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

export const SuggestedContent = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing[5]};
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  align-self: stretch;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.white};
  width: 100%;
  max-height: 320px;
  overflow-y: auto;
  box-sizing: border-box;
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

export const SuggestedContentTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentPrimary};
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1.5;
  letter-spacing: 0.135px;
`;

export const SuggestedContentDescription = styled.p`
  margin: 0;
  overflow: auto;
  color: ${({ theme }) => theme.colors.contentTertiary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.27;
  letter-spacing: 0.32px;
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
// Icon wrappers
export const SparkleIconStyled = styled.div`
  color: ${({ theme }) => theme.colors['light-sky-blue']};
`;

export const EditWithAiIconStyled = styled.div`
  color: ${({ theme }) => theme.colors.primary};
`;

export const ArrowIconStyled = styled.div`
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

export const EditWithAiWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

export const EditPanel = styled.div`
  position: fixed;
  /* Must exceed modal/overlay z-index to render above all stacking contexts */
  z-index: 99999;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.coolGray};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 16px 20px 0 rgba(0, 0, 0, 0.07);
  display: flex;
  padding: ${({ theme }) => theme.spacing[4]};
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  width: ${EDIT_PANEL_WIDTH}px;
  box-sizing: border-box;
`;

export const EditQueryInput = styled.textarea`
  flex: 1 0 0;
  min-width: 0;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.secondary};
  padding: 11px ${({ theme }) => theme.spacing[4]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 18px;
  color: ${({ theme }) => theme.colors.contentPrimary};
  outline: none;
  resize: vertical;
  overflow: hidden;

  &::placeholder {
    color: ${({ theme }) => theme.colors.contentPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    line-height: 18px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const EditUpdateButton = styled.button`
  display: flex;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-end;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.hoverPrimary};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabledBg};
    color: ${({ theme }) => theme.colors.disabledText};
    cursor: not-allowed;
  }
`;

export const CopyResponseButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1.5]};
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid rgba(0, 0, 0, 0.10);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  opacity: 0.8;
  color: ${({ theme }) => theme.colors.dropDownText};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1.25;
  letter-spacing: -0.15px;
  align-self: flex-start;
  margin-top: ${({ theme }) => theme.spacing[4]};
  transition: opacity 0.12s ease;

  &:hover {
    opacity: 1;
  }
`;

/* ─────────────────────────────────────────────────────
   CLIENT INFO SECTION – redesigned
───────────────────────────────────────────────────── */

export const ClientInfoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2.5]};
`;

export const ClientInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const ClientInfoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const ClientAvatarCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid ${({ theme }) => theme.colors.disabledBg};
  background-color: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1;
  overflow: hidden;
`;

export const ClientNameText = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 20px;
  white-space: nowrap;
`;

export const RiskProfileBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background-color: #fdf3d7;
  border-radius: 4px;
  padding: 2px 8px 2px 6px;
  flex-shrink: 0;
`;

export const RiskProfileText = styled.span`
  color: #f06a2f;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 20px;
  white-space: nowrap;
`;

export const AddNoteButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1.14;
  white-space: nowrap;

  &:hover {
    opacity: 0.8;
  }
`;

export const CrmNoteText = styled.span`
  color: ${({ theme }) => theme.colors.disabledText};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.14;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
`;

export const ClientMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: 44px;
  flex-wrap: wrap;
`;

export const MetricPair = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const MetricPairLabel = styled.span`
  color: ${({ theme }) => theme.colors.disabledText};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 18px;
`;

export const MetricPairValue = styled.span`
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: normal;
`;

/* ─────────────────────────────────────────────────────
   INSIGHT CONTENT – new first-screen design
───────────────────────────────────────────────────── */

export const AnalyzeResultCard = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.lightBlueBg};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 0 2px 0 ${({ theme }) => theme.colors.shadowOverlay};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[5]};
  align-self: stretch;
  height: calc(100vh - 309px);
  overflow: auto;
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

export const KeyInsightLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 20px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1.14;
  text-overflow: ellipsis;
`;

interface TrendProps {
  $trend?: 'up' | 'down';
}

export const TriggerRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const TriggerLabel = styled.span<TrendProps>`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ $trend }) => ($trend === 'up' ? '#1A7A4A' : '#B82020')};
  line-height: 1.4;
`;

export const TriggerValue = styled.span<TrendProps>`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ $trend }) => ($trend === 'up' ? '#1A7A4A' : '#B82020')};
  line-height: 1.4;
`;

export const InsightBox = styled.div<TrendProps>`
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ $trend }) => ($trend === 'up' ? '#c5e1d9' : '#ffcac6')};
  background-color: ${({ $trend }) => ($trend === 'up' ? '#e6f4f0' : '#ffeae9')};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2.5]};
  padding: ${({ theme }) => theme.spacing[4]};
  position: relative;
`;

export const InsightBoxHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
`;

/** Stacks the trigger row and key-insight text so the icon centres against both */
export const InsightTextColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  flex: 1;
`;

export const InsightIconCircle = styled.div<TrendProps>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ $trend }) => ($trend === 'up' ? '#cae0da' : '#f9cfcc')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const InsightText = styled.p`
  margin: 0;
  flex: 1;
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1.5;
  letter-spacing: 0.12px;
`;

export const AdviceCard = styled.div<TrendProps>`
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ $trend }) => ($trend === 'up' ? '#c5e1d9' : '#ffcac6')};
  background: ${({ $trend }) =>
    $trend === 'up'
      ? 'linear-gradient(174.6deg, #ffffff 18.33%, #e5f0ed 189.44%)'
      : 'linear-gradient(174.6deg, #ffffff 18.33%, #ffeae9 189.44%)'};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
  padding: ${({ theme }) => theme.spacing[4]};
  position: relative;
  overflow: hidden;
`;

export const PrimaryAdviceBadge = styled.span<TrendProps>`
  display: inline-block;
  background-color: ${({ $trend }) => ($trend === 'up' ? '#daeae6' : '#f9cfcc')};
  color: ${({ $trend }) => ($trend === 'up' ? '#06904e' : '#b82020')};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  line-height: 1.14;
  letter-spacing: 0.28px;
  padding: 4px 8px;
  border-radius: 3px;
  align-self: flex-start;
`;

export const AdviceHeadline = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1.32;
`;

export const AdviceDetail = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentSecondary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.32;
`;

export const CopyAdviceButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  right: ${({ theme }) => theme.spacing[3]};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[2]};
  border: 1px solid rgba(0, 0, 0, 0.10);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: background 0.12s ease;
  width: 32px;
  height: 32px;

  &:hover {
    background: ${({ theme }) => theme.colors.white};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const SectionLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1.14;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DriversSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

export const DriverText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentSecondary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.27;
  letter-spacing: 0.32px;
`;

export const DriversList = styled.ul`
  margin: 0;
  padding-left: ${({ theme }) => theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DriverListItem = styled.li`
  color: ${({ theme }) => theme.colors.contentSecondary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.27;
  letter-spacing: 0.32px;
`;

export const ReasoningSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

export const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

/* Row stretches both columns to the same height */
export const TimelineStepRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 16px;
`;

/* Left column fills the full row height via flex stretch */
export const TimelineStepLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
  flex-shrink: 0;
`;

/* Connector: fills all height below the dot */
export const TimelineArrowConnector = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3px;
  margin-bottom: 3px;
`;

/* Vertical line: fills all space above the arrowhead */
export const TimelineArrowLine = styled.div<{ $trend?: 'up' | 'down' }>`
  flex: 1;
  width: 1.5px;
  background: ${({ $trend }) => ($trend === 'up' ? '#1A7A4A' : '#B82020')};
`;

/* Arrowhead — height matches SVG exactly so bottom edge = row bottom edge */
/* Right content column — padding-bottom creates the space connector stretches into */
export const TimelineItem = styled.div<{ $isLast?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: ${({ $isLast }) => ($isLast ? '0' : '20px')};
`;

export const TimelineItemTitle = styled.p`
  margin: 0;
  color: #2e3540;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1.4;
`;

export const TimelineItemReason = styled.p`
  margin: 0;
  color: #2e3540;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.4;
`;

export const ImpactSummaryRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[2.5]};
`;

export const TrendNoteCircle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  min-width: 1em;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.trendUp};
  flex-shrink: 0;
  margin-top: 3px;
`;

export const ImpactSummaryText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentSecondary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1.32;
`;

export const InsightSourcesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const InsightSourcesLabel = styled.span`
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1.14;
`;

export const InsightSourcesContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`;

export const InsightSourceChip = styled.button`
  padding: 5px ${({ theme }) => theme.spacing[2.5]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.lightGray};
  color: ${({ theme }) => theme.colors.contentSecondary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 18px;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightCyanBg};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`;

export const SourceModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const SourceModalMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const SourceTypeBadge = styled.span<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: 3px ${({ theme }) => theme.spacing[2.5]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: 0.3px;
  text-transform: uppercase;
  background: ${({ $type, theme }) =>
    $type === 'sec_filing'
      ? 'rgba(139, 92, 246, 0.12)'
      : theme.colors.lightCyanBg};
  color: ${({ $type, theme }) =>
    $type === 'sec_filing' ? '#6D28D9' : theme.colors.primary};
`;

export const SourceDocumentBody = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 1.75;
  color: ${({ theme }) => theme.colors.contentSecondary};

  p {
    margin: 0 0 ${({ theme }) => theme.spacing[3]};
    &:last-child { margin-bottom: 0; }
  }

  strong, b {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.contentPrimary};
  }

  em, i {
    font-style: italic;
  }

  u {
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.colors.primary};
    text-underline-offset: 3px;
    color: ${({ theme }) => theme.colors.contentPrimary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }

  mark {
    background: rgba(253, 214, 0, 0.35);
    color: ${({ theme }) => theme.colors.contentPrimary};
    padding: 1px 4px;
    border-radius: 3px;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.contentPrimary};
    margin: ${({ theme }) => theme.spacing[5]} 0 ${({ theme }) => theme.spacing[2]};
    line-height: 1.3;
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.contentPrimary};
    margin: ${({ theme }) => theme.spacing[4]} 0 ${({ theme }) => theme.spacing[2]};
    line-height: 1.3;
  }

  h3, h4, h5, h6 {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.contentPrimary};
    margin: ${({ theme }) => theme.spacing[3]} 0 ${({ theme }) => theme.spacing[1]};
    line-height: 1.3;
  }

  ul, ol {
    margin: ${({ theme }) => theme.spacing[2]} 0;
    padding-left: ${({ theme }) => theme.spacing[5]};
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing[1.5]};
    line-height: 1.6;
  }

  blockquote {
    margin: ${({ theme }) => theme.spacing[3]} 0;
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    border-left: 3px solid ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.lightCyanBg};
    border-radius: 0 4px 4px 0;
    color: ${({ theme }) => theme.colors.contentSecondary};
    font-style: italic;
  }

  hr {
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    margin: ${({ theme }) => theme.spacing[4]} 0;
  }

  code {
    background: ${({ theme }) => theme.colors.lightGray};
    padding: 2px 5px;
    border-radius: 3px;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-family: 'Courier New', monospace;
  }
`;

export const SourceSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const SourceSkeletonParagraph = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

export const SourceErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const InsightSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
`;
