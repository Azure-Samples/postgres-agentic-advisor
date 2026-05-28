import styled from 'styled-components';

interface AlertTileContainerProps {
  $hasClientName?: boolean;
  $disableHover?: boolean;
}

export const HoverWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const AlertTileContainer = styled.div<AlertTileContainerProps>`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: ${({ theme }) => theme.border.light};
  box-shadow: ${({ theme }) => theme.shadows.alertTile};
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme, $hasClientName }) =>
    $hasClientName
      ? `14px ${theme.spacing[3]} ${theme.spacing[1.5]} ${theme.spacing[3]}`
      : `14px ${theme.spacing[3]}`};
  width: 100%;
  align-items: flex-start;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;

  ${({ $disableHover, theme }) =>
    !$disableHover &&
    `
    &:hover {
      border-color: ${theme.colors.primary};
      background-color: ${theme.colors.lightCyanBg};
    }
  `}
`;

export const TitleWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  width: 100%;
  min-width: 0;
`;

interface ClientTitleWrapperProps {
  $column?: boolean;
}

export const ClientTitleWrapper = styled.div<ClientTitleWrapperProps>`
  display: flex;
  flex-direction: ${({ $column }) => ($column ? 'column' : 'row')};
  gap: ${({ theme, $column }) => ($column ? theme.spacing[1] : theme.spacing[3])};
  align-items: ${({ $column }) => ($column ? 'flex-start' : 'center')};
  justify-content: flex-start;
  width: 100%;
  min-width: 0;
`;

export const Title = styled.span`
  color: ${({ theme }) => theme.colors.tileTitle};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tileTitle};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  min-width: 0;
`;

export const CompanyNameHoverAnchor = styled.span`
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  cursor: help;
`;

export const Subtitle = styled.span`
  display: block;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.contentTertiary};
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.typography.fontSize.smPlus};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: ${({ theme }) => theme.typography.lineHeight.snug};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tileSubtitle};
  width: 100%;
  min-width: 0;
`;

export const SummaryTimeWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
`;

export const SummaryTimeRightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  flex-shrink: 0;
`;

export const DeleteIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[1]};
  border: none;
  background: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.contentTertiary};
  transition: color 0.15s ease, background-color 0.15s ease;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
    background-color: ${({ theme }) => theme.colors.errorBg};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  &:active {
    color: ${({ theme }) => theme.colors.error};
  }
`;

export const RowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  min-width: 0;
`;

export const AlertTileContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  flex: 1;
  min-width: 0;
`;

export const TrendIconWrapper = styled.div<{ $trend: 'up' | 'down' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 46.4px;
  flex-shrink: 0;
  background: ${({ $trend }) =>
    $trend === 'up' ? 'rgba(6, 144, 78, 0.15)' : 'rgba(255, 17, 0, 0.20)'};
`;

export const DateBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.disabledText};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  white-space: nowrap;
  flex-shrink: 0;
`;
