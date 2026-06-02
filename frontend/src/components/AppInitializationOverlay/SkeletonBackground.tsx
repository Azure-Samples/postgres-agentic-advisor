import React from 'react';
import { LineChartSkeleton, AlertTileSkeleton } from '@/components/Skeleton';
import {
  EarningsSkeletonRow,
  EarningsSkeletonAvatar,
  EarningsSkeletonRowRight,
  EarningsSkeletonMetrics,
  EarningsSkeletonPill,
} from '@/features/UpcomingEarnings/UpcomingEarnings.styles';
import {
  ClientSkeletonRow,
  ClientSkeletonAvatar,
  ClientSkeletonRowRight,
  ClientSkeletonMetrics,
  ClientSkeletonPill,
} from '@/features/DashboardClients/DashboardClients.styles';
import {
  MeetingSkeletonCard,
  MeetingSkeletonAvatar,
  MeetingSkeletonDetails,
  MeetingSkeletonPill,
} from '@/features/UpcomingMeetings/UpcomingMeetings.styles';
import {
  Wrapper,
  FrozenContent,
  NavSkeleton,
  NavLeft,
  NavCenter,
  NavRight,
  SkBox,
  ContentSkeleton,
  HeaderSkeleton,
  HeaderLeft,
  RowSkeleton,
  AlertsCardWrapper,
  WidgetCard,
  WidgetCardContent,
  DisclaimerSkeleton,
} from './SkeletonBackground.styles';

const EARNINGS_ROWS = 6;
const CLIENT_ROWS = 6;
const MEETING_CARDS = 4;

export const SkeletonBackground: React.FC = () => (
  <Wrapper>
    {/* Navbar — plain skeleton bar */}
    <NavSkeleton>
      <NavLeft>
        <SkBox $w={40} $h={40} $r={8} />
        <SkBox $w={110} $h={16} $r={4} />
      </NavLeft>
      <NavCenter>
        <SkBox $w={70} $h={14} $r={4} />
        <SkBox $w={70} $h={14} $r={4} />
      </NavCenter>
      <NavRight>
        <SkBox $w={32} $h={32} $r={6} />
        <SkBox $w={32} $h={32} $r={6} />
        <SkBox $w={40} $h={40} $circle />
      </NavRight>
    </NavSkeleton>

    <FrozenContent>
      <ContentSkeleton>
        {/* Header row */}
        <HeaderSkeleton>
          <HeaderLeft>
            <SkBox $w={180} $h={24} $r={4} />
            <SkBox $w={300} $h={14} $r={4} $mt={6} />
          </HeaderLeft>
          <SkBox $w={140} $h={36} $r={8} />
        </HeaderSkeleton>

        {/* Row 1: Line chart + Alerts */}
        <RowSkeleton>
          {/* LineChartSkeleton has height:512px built in */}
          <LineChartSkeleton />

          {/* Alert tiles card — same 512px height as CardBlockContainer */}
          <AlertsCardWrapper>
            <AlertTileSkeleton count={5} />
          </AlertsCardWrapper>
        </RowSkeleton>

        {/* Row 2: Earnings | Clients | Meetings */}
        <RowSkeleton>
          {/* Upcoming Earnings */}
          <WidgetCard>
            <SkBox $w={160} $h={16} $r={4} />
            <WidgetCardContent>
              {Array.from({ length: EARNINGS_ROWS }).map((_, i) => (
                <EarningsSkeletonRow key={i}>
                  <EarningsSkeletonAvatar />
                  <EarningsSkeletonRowRight>
                    <EarningsSkeletonPill $width="152px" $height="16px" />
                    <EarningsSkeletonMetrics>
                      <EarningsSkeletonPill $width="38px" $height="16px" />
                      <EarningsSkeletonPill $width="70px" $height="16px" />
                    </EarningsSkeletonMetrics>
                  </EarningsSkeletonRowRight>
                </EarningsSkeletonRow>
              ))}
            </WidgetCardContent>
          </WidgetCard>

          {/* Dashboard Clients */}
          <WidgetCard>
            <SkBox $w={160} $h={16} $r={4} />
            <WidgetCardContent>
              {Array.from({ length: CLIENT_ROWS }).map((_, i) => (
                <ClientSkeletonRow key={i}>
                  <ClientSkeletonAvatar />
                  <ClientSkeletonRowRight>
                    <ClientSkeletonPill $width="152px" $height="16px" />
                    <ClientSkeletonMetrics>
                      <ClientSkeletonPill $width="38px" $height="16px" />
                      <ClientSkeletonPill $width="70px" $height="16px" />
                    </ClientSkeletonMetrics>
                  </ClientSkeletonRowRight>
                </ClientSkeletonRow>
              ))}
            </WidgetCardContent>
          </WidgetCard>

          {/* Upcoming Meetings */}
          <WidgetCard>
            <SkBox $w={155} $h={16} $r={4} />
            <WidgetCardContent $gap={8}>
              {Array.from({ length: MEETING_CARDS }).map((_, i) => (
                <MeetingSkeletonCard key={i}>
                  <MeetingSkeletonAvatar />
                  <MeetingSkeletonDetails>
                    <MeetingSkeletonPill $width="143px" $height="16px" />
                    <MeetingSkeletonPill $height="8px" />
                  </MeetingSkeletonDetails>
                </MeetingSkeletonCard>
              ))}
            </WidgetCardContent>
          </WidgetCard>
        </RowSkeleton>
      </ContentSkeleton>
    </FrozenContent>

    <DisclaimerSkeleton />
  </Wrapper>
);

export default SkeletonBackground;
