import React, { useState } from 'react';
import { GenAiIcon } from '@/icons';
import { useUpcomingMeetingsQuery } from '@/api/hooks/useUpcomingMeetingsQuery';
import { WidgetErrorState } from '@/components/WidgetErrorState';
import { AskAiMeetingModal } from './components/AskAiMeetingModal/AskAiMeetingModal';
import {
  UpcomingMeetingsContainer,
  UpcomingMeetingsHeader,
  UpcomingMeetingsTitle,
  MeetingsList,
  MeetingCard,
  MeetingIconWrapper,
  MeetingPlatformIcon,
  MeetingDetails,
  MeetingClientName,
  MeetingDateRow,
  MeetingDateTime,
  MeetingAskAiButton,
  MeetingAskAiLabel,
  MeetingSkeletonCard,
  MeetingSkeletonAvatar,
  MeetingSkeletonDetails,
  MeetingSkeletonPill,
  NoMeetingsWrapper,
  NoMeetingsSkeletonCard,
  NoMeetingsSkeletonAvatar,
  NoMeetingsSkeletonLines,
  NoMeetingsSkeletonPill,
  NoMeetingsTitle,
  NoMeetingsSubtitle,
} from './UpcomingMeetings.styles';

interface UpcomingMeetingsProps {
  simulatedDate?: string;
}

const SKELETON_CARDS = 3;

const NoMeetingsEmptyState: React.FC = () => (
  <NoMeetingsWrapper>
    <NoMeetingsSkeletonCard>
      <NoMeetingsSkeletonAvatar />
      <NoMeetingsSkeletonLines>
        <NoMeetingsSkeletonPill $width="79px" />
        <NoMeetingsSkeletonPill $width="100%" />
        <NoMeetingsSkeletonPill $width="100%" />
      </NoMeetingsSkeletonLines>
    </NoMeetingsSkeletonCard>
    <NoMeetingsSkeletonCard>
      <NoMeetingsSkeletonAvatar />
      <NoMeetingsSkeletonLines>
        <NoMeetingsSkeletonPill $width="79px" />
        <NoMeetingsSkeletonPill $width="100%" />
        <NoMeetingsSkeletonPill $width="100%" />
      </NoMeetingsSkeletonLines>
    </NoMeetingsSkeletonCard>
    <div>
      <NoMeetingsTitle>Nothing on the Calendar</NoMeetingsTitle>
      <NoMeetingsSubtitle>No meetings are scheduled for this period.</NoMeetingsSubtitle>
    </div>
  </NoMeetingsWrapper>
);

/** Format ISO datetime → "02 Nov  |  2:00 PM" (always in UTC, no year) */
function formatScheduledAt(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
  return `${day} ${month}  |  ${time}`;
}

const MeetingSkeletonItem: React.FC = () => (
  <MeetingSkeletonCard>
    <MeetingSkeletonAvatar />
    <MeetingSkeletonDetails>
      <MeetingSkeletonPill $width="143px" />
      <MeetingSkeletonPill $height="8px" />
    </MeetingSkeletonDetails>
  </MeetingSkeletonCard>
);

export const UpcomingMeetings: React.FC<UpcomingMeetingsProps> = ({ simulatedDate }) => {
  const { data, isLoading, isError, refetch } = useUpcomingMeetingsQuery(simulatedDate);
  const [activeMeeting, setActiveMeeting] = useState<{ client_name: string; scheduled_at: string } | null>(null);

  return (
    <>
      <UpcomingMeetingsContainer>
        <UpcomingMeetingsHeader>
          <UpcomingMeetingsTitle>Upcoming Meetings</UpcomingMeetingsTitle>
        </UpcomingMeetingsHeader>

        {isError ? (
          <WidgetErrorState onRetry={refetch} />
        ) : !isLoading && (data?.meetings ?? []).length === 0 ? (
          <NoMeetingsEmptyState />
        ) : (
          <MeetingsList>
            {isLoading
              ? Array.from({ length: SKELETON_CARDS }).map((_, i) => <MeetingSkeletonItem key={i} />)
              : (data?.meetings ?? []).map((meeting, idx) => (
                  <MeetingCard key={`${meeting.client_name}-${idx}`}>
                    <MeetingIconWrapper>
                      <MeetingPlatformIcon src="/zoom.svg" alt="Zoom" />
                    </MeetingIconWrapper>
                    <MeetingDetails>
                      <MeetingClientName>{meeting.client_name}</MeetingClientName>
                      <MeetingDateRow>
                        <MeetingDateTime>{formatScheduledAt(meeting.scheduled_at)}</MeetingDateTime>
                      </MeetingDateRow>
                    </MeetingDetails>
                    <MeetingAskAiButton type="button" onClick={() => setActiveMeeting(meeting)}>
                      <GenAiIcon width={14} height={14} />
                      <MeetingAskAiLabel>Ask AI</MeetingAskAiLabel>
                    </MeetingAskAiButton>
                  </MeetingCard>
                ))}
          </MeetingsList>
        )}
      </UpcomingMeetingsContainer>
      <AskAiMeetingModal
        isOpen={activeMeeting !== null}
        onClose={() => setActiveMeeting(null)}
        meeting={activeMeeting}
        simulatedDate={simulatedDate}
      />
    </>
  );
};

export default UpcomingMeetings;
