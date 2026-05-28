import styled, { css, keyframes } from 'styled-components';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeSlideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ─── Wrapper ──────────────────────────────────────────────────────────────────

/** Wraps sources + action buttons below an assistant message bubble */
export const ActionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: 0 ${({ theme }) => theme.spacing[5]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

// ─── Sources ──────────────────────────────────────────────────────────────────

export const SourcesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const SourcesHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const SourcesIconWrapper = styled.span`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.contentPrimary};
`;

export const SourcesLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.contentPrimary};
  line-height: 1.14;
`;

export const SourcesChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[2]};
`;

export const SourceChip = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[1.5]} ${({ theme }) => theme.spacing[2.5]};
  border-radius: 100px;
  background: rgba(142, 200, 232, 0.2);
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.contentSecondary};
  white-space: nowrap;
`;

// ─── Action buttons row ───────────────────────────────────────────────────────

export const ActionButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const ActionIconButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  ${({ $active, theme }) =>
    $active
      ? css`
          border: 1px solid ${theme.colors.primary};
          background: rgba(6, 115, 148, 0.10);
          color: ${theme.colors.primary};
        `
      : css`
          border: 1px solid transparent;
          background: transparent;
          color: ${theme.colors.contentSecondary};
          &:hover {
            background: ${theme.colors.neutralGray};
            color: ${theme.colors.contentPrimary};
          }
        `}
`;

export const ButtonIconWrapper = styled.span<{ $rotate?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${({ $rotate }) => ($rotate ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

// ─── Workflow panel ───────────────────────────────────────────────────────────

/** Outer grid wrapper — animates height via grid-template-rows */
export const WorkflowPanelOuter = styled.div<{ $isOpen: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isOpen }) => ($isOpen ? '1fr' : '0fr')};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition:
    grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

/** Inner overflow clip — required for grid-template-rows trick */
export const WorkflowPanelInner = styled.div<{ $isOpen: boolean }>`
  overflow: hidden;

  /* Slide-down entrance animation on the content itself */
  & > * {
    animation: ${({ $isOpen }) =>
      $isOpen
        ? css`${fadeSlideDown} 0.35s cubic-bezier(0.4, 0, 0.2, 1) both`
        : 'none'};
  }
`;
