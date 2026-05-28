import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

const skeletonBase = `
  background: linear-gradient(90deg, #e8ecef 25%, #f0f3f4 50%, #e8ecef 75%);
  background-size: 200% 100%;
  animation-name: shimmer;
  animation-duration: 1.5s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  border-radius: 6px;
`;

export const SkeletonRiskBadge = styled.div`
  ${skeletonBase}
  animation-name: ${shimmer};
  width: 90px;
  height: 24px;
  border-radius: 4px;
  flex-shrink: 0;
`;

export const SkeletonMetricValue = styled.div`
  ${skeletonBase}
  animation-name: ${shimmer};
  width: 64px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
`;

// ── Layout constants (component-specific, not part of the global spacing scale) ──
const METRICS_GAP = '45px';
const HISTORY_PANEL_WIDTH = '410px';
// Suggestions list max-width (456px) + send button (48px) + gap (16px) = 520px
const EMPTY_INPUT_WIDTH = '660px';

/* ── Client header ─────────────────────────────────────────────────────────── */

export const MeetingClientSection = styled.div`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[8]};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const MeetingClientRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const MeetingClientLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

/* ── Risk profile badge ─────────────────────────────────────────────────────── */
export const RiskProfileBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: #fdf3d7;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 2px 8px 2px 6px;
  flex-shrink: 0;
`;

export const RiskProfileLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: #f06a2f;
  white-space: nowrap;
  line-height: 20px;
`;

export const MeetingClientAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid ${({ theme }) => theme.colors.cardBorder};
  filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.05));
  background: ${({ theme }) => theme.colors.lightBlueBg};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  flex-shrink: 0;
`;

export const MeetingClientName = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

export const ChatHistoryButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0;
  line-height: 1.14;

  &:hover {
    opacity: 0.8;
  }
`;

export const NewChatButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0;

  &:hover {
    opacity: 0.8;
  }
`;

export const MeetingMetricsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${METRICS_GAP};
`;

export const MeetingMetricPair = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

export const MeetingMetricLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.disabledText};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
`;

export const MeetingMetricValue = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

/* ── Content box ───────────────────────────────────────────────────────────── */

export const ChatContentBox = styled.div`
  flex: 1;
  margin: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[8]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.workflow.surfaceBorder};
  box-shadow: ${({ theme }) => theme.shadows.chatContentBox};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
`;

/* ── Workflow graph skeleton ──────────────────────────────────────────────── */

export const WorkflowSkeletonOuter = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  width: 100%;
  animation: wfSkeletonFadeIn 0.2s ease-out both;
  @keyframes wfSkeletonFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export const WorkflowSkeletonCanvas = styled.div`
  position: relative;
  width: 100%;
  height: 580px;
  border-radius: 8px;
  border: 1px solid #EBF2FF;
  background-color: #FBFBFB;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const WorkflowSkeletonCard = styled.div`
  ${skeletonBase}
  animation-name: ${shimmer};
  flex-shrink: 0;
  margin: 12px 12px 0;
  height: 116px;
  border-radius: 8px;
  border: 1px solid #E0E8F6;
`;

export const WorkflowSkeletonFlow = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const WorkflowSkeletonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const WorkflowSkeletonNode = styled.div<{ $w?: string }>`
  ${skeletonBase}
  animation-name: ${shimmer};
  width: ${({ $w }) => $w ?? '130px'};
  height: 48px;
  border-radius: 8px;
  flex-shrink: 0;
`;

export const WorkflowSkeletonEdge = styled.div`
  width: 24px;
  height: 2px;
  background: #D0D5DD;
  flex-shrink: 0;
`;

export const WorkflowSkeletonBranch = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const HistorySlidePanel = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.colors.workflow.surfaceBorder};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[8]} 0 ${theme.spacing[5]}`};
  overflow: hidden;
  transform: ${({ $visible }) => ($visible ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: ${({ theme }) => theme.zIndex.docked};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
`;

export const HistoryInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: ${HISTORY_PANEL_WIDTH};
  max-width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

/* ── Empty / welcome state ────────────────────────────────────────── */

export const EmptyStateWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[8]};
  padding: ${({ theme }) => theme.spacing[5]};
  overflow-y: auto;
`;

export const EmptyStateIconCircle = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.lightBlueBg};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const EmptyStateTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize['2.5xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.black};
  margin: 0;
  white-space: nowrap;
`;

export const EmptyStateInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  width: 100%;
  min-width: ${EMPTY_INPUT_WIDTH};
  max-width: ${EMPTY_INPUT_WIDTH};
`;

/* ── Workflow message text (rendered inside the graph canvas card) ────────── */

export const WorkflowMessageRole = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.label};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

export const WorkflowMessageText = styled.div`
  .markdown-container {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    color: ${({ theme }) => theme.colors.contentPrimary};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    word-break: break-word;

    p {
      margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
      &:last-child {
        margin-bottom: 0;
      }
    }

    ul,
    ol {
      margin: ${({ theme }) => theme.spacing[1]} 0;
      padding-left: ${({ theme }) => theme.spacing[5]};
    }

    li {
      margin-bottom: ${({ theme }) => theme.spacing[1]};
    }

    strong {
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    }

    h1, h2, h3, h4, h5, h6 {
      margin: ${({ theme }) => theme.spacing[2]} 0 ${({ theme }) => theme.spacing[1]} 0;
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
      &:first-child {
        margin-top: 0;
      }
    }
  }
`;

/* ── Messages ──────────────────────────────────────────────────────────────── */

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.coolGray || '#ccc'};
    border-radius: 3px;
  }
`;

/* ── Input row ─────────────────────────────────────────────────────────────── */

export const ChatInputRow = styled.div`
  padding: ${({ theme }) => `${theme.spacing[5]} ${theme.spacing[5]} ${theme.spacing[8]}`};
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: center;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.workflow.surfaceBorder};
`;

export const ChatInputField = styled.input`
  flex: 1;
  height: ${({ theme }) => theme.spacing[12]};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[4]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.contentPrimary};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.input};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.inputPlaceholder};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SendButton = styled.button<{ $hasText?: boolean }>`
  width: ${({ theme }) => theme.spacing[12]};
  height: ${({ theme }) => theme.spacing[12]};
  flex-shrink: 0;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: background 0.2s;
  background: ${({ $hasText, theme }) =>
    $hasText ? theme.colors.primary : 'rgba(6, 115, 148, 0.5)'};

  &:disabled {
    cursor: not-allowed;
  }
`;

export const ChatForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  align-items: center;
  width: 100%;
`;

/* ── Workflow unavailable state ────────────────────────────────────────────── */

export const WorkflowErrorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[8]};
  text-align: center;
`;

export const WorkflowErrorTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.contentPrimary};
  margin: 0;
`;

export const WorkflowErrorBody = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.disabledText};
  margin: 0;
  max-width: 340px;
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;
