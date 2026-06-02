import styled from 'styled-components';
import { SkeletonBase } from '@/components/Skeleton/Skeleton.styles';

const SK = '#F2F4F9';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.secondary};
`;

/* ── Freeze all animations inside this container ──────────── */
export const FrozenContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  & * {
    animation: none !important;
    transition: none !important;
  }

  /* Replace shimmer gradient with flat uniform colour */
  ${SkeletonBase} {
    background: ${SK} !important;
  }

  /* Hide real text from skeleton component headers (e.g. LineChartSkeletonTitle) */
  & h3 {
    color: transparent !important;
  }
`;

/* ── Navbar ────────────────────────────────────────────────── */
export const NavSkeleton = styled.div`
  height: 72px;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: ${({ theme }) => theme.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing[8]};
  flex-shrink: 0;
`;

export const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const NavCenter = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[8]};
`;

export const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
`;

/* ── Generic skeleton box ──────────────────────────────────── */
export const SkBox = styled.div<{
  $w?: number | string;
  $h?: number | string;
  $r?: number;
  $mt?: number;
  $circle?: boolean;
}>`
  background: ${SK};
  width: ${({ $w }) => (typeof $w === 'number' ? `${$w}px` : ($w ?? '100%'))};
  height: ${({ $h }) => (typeof $h === 'number' ? `${$h}px` : ($h ?? '100%'))};
  border-radius: ${({ $r, $circle }) => ($circle ? '50%' : `${$r ?? 4}px`)};
  flex-shrink: 0;
  ${({ $mt }) => $mt && `margin-top: ${$mt}px;`}
`;

/* ── Content area ──────────────────────────────────────────── */
export const ContentSkeleton = styled.div`
  flex: 1;
  padding: 14px ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[8]};
  display: flex;
  flex-direction: column;
  gap: 14px;
  zoom: ${({ theme }) => theme.layout.dashboardZoom};
`;

export const HeaderSkeleton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[2]} 0;
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

/* ── Card rows ─────────────────────────────────────────────── */
export const RowSkeleton = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: stretch;
  & > * {
    flex: 1 1 0;
    min-width: 0;
  }
`;

/* Matches CardBlockContainer (512px, used for alerts wrapper in row 1) */
export const AlertsCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[4]};
  height: 512px;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing[3]};
`;

/* Row 2 widget card */
export const WidgetCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[4]};
  min-height: 320px;
  overflow: hidden;
`;

export const WidgetCardContent = styled.div<{ $gap?: number }>`
  margin-top: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap ?? 12}px;
  overflow: hidden;
`;

/* ── Disclaimer bar ────────────────────────────────────────── */
export const DisclaimerSkeleton = styled.div`
  height: 27px;
  background: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  flex-shrink: 0;
`;
