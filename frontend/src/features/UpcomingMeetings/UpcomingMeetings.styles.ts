import styled from 'styled-components';
import { SkeletonBase } from '@/components/Skeleton/Skeleton.styles';

export const UpcomingMeetingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing[4]};
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
`;

export const UpcomingMeetingsHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
`;

export const UpcomingMeetingsTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.contentPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 24px;
`;

export const MeetingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[4]};
  flex: 1;
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing[2]};

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.25);
  }
`;

export const MeetingCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: ${({ theme }) => theme.spacing[2.5]} ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  border: 1px solid #eeeeee;
  box-shadow: 0px 0px 3px 0px rgba(6, 115, 148, 0.1);
  flex: 1;
`;

export const MeetingIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const MeetingDetails = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  min-width: 0;
`;

export const MeetingClientName = styled.span`
  color: #272f3a;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 20px;
`;

export const MeetingDateRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const MeetingDateTime = styled.span`
  color: ${({ theme }) => theme.colors.contentTertiary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  line-height: 18px;
  opacity: 0.7;
  white-space: pre;
`;

export const MeetingPlatformIcon = styled.img`
  width: 15px;
  height: 11px;
  image-rendering: auto;
  flex-shrink: 0;
`;

// ─── Skeleton ────────────────────────────────────────────────────────────────

export const MeetingSkeletonCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: ${({ theme }) => theme.spacing[2.5]} ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  border: 1px solid #eeeeee;
  box-shadow: 0px 0px 3px 0px rgba(6, 115, 148, 0.1);
  width: 100%;
  flex: 1;
`;

export const MeetingSkeletonAvatar = styled(SkeletonBase)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const MeetingSkeletonDetails = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  min-width: 0;
`;

export const MeetingSkeletonPill = styled(SkeletonBase)<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width ?? '100%'};
  height: ${({ $height }) => $height ?? '16px'};
  border-radius: 200px;
`;

// ─── Ask AI Button ────────────────────────────────────────────────────────────

export const MeetingAskAiButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}10;
  }

  svg {
    width: 14px;
    height: 14px;
    display: block;
    flex-shrink: 0;
  }
`;

export const MeetingAskAiLabel = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 18px;
  white-space: nowrap;
`;

// ── No-meetings empty state ───────────────────────────────────────────────────

export const NoMeetingsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: ${({ theme }) => theme.spacing[6]} 0;
`;

export const NoMeetingsSkeletonCard = styled.div<{ $faded?: boolean }>`
  display: flex;
  gap: 9px;
  align-items: flex-start;
  background: ${({ $faded }) =>
    $faded
      ? 'linear-gradient(to bottom, #f2f4f9 4.167%, transparent 100%)'
      : '#f2f4f9'};
  border-radius: 8px;
  padding: 16px;
  width: 262px;
`;

export const NoMeetingsSkeletonAvatar = styled.div<{ $faded?: boolean }>`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ $faded }) => ($faded ? '#eff1f9' : '#e3e7f1')};
`;

export const NoMeetingsSkeletonLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

export const NoMeetingsSkeletonPill = styled.div<{ $width: string; $faded?: boolean }>`
  height: 6px;
  border-radius: 200px;
  background: ${({ $faded }) => ($faded ? '#eff1f9' : '#e3e7f1')};
  width: ${({ $width }) => $width};
`;

export const NoMeetingsTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.contentSecondary};
  text-align: center;
  margin: 0;
`;

export const NoMeetingsSubtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.contentTertiary};
  text-align: center;
  margin: 0;
`;
