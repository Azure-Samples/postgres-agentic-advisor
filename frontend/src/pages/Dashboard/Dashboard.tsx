import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, CardBlock } from '@/components';
import { AlertsList } from '@/features/alerts';
import { MarketSectorTrends } from '@/features/MarketSectorTrends';
import { UpcomingEarnings } from '@/features/UpcomingEarnings';
import { DashboardClients } from '@/features/DashboardClients';
import { UpcomingMeetings } from '@/features/UpcomingMeetings';
import {
  DashboardWrapper,
  HeaderBar,
  HeaderDescription,
  HeaderRowOne,
  HeaderTitle,
  TypographyWrapper,
  ContentArea,
  CardRow,
} from './dashboard.styles';

const getDefaultDate = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** Parse a 'MM-DD' URL param into a local Date (base year 2023), falling back to today. */
const parseDateParam = (value: string | null): Date => {
  if (!value) return getDefaultDate();
  const parsed = new Date(`2023-${value}T00:00:00`);
  return isNaN(parsed.getTime()) ? getDefaultDate() : parsed;
};

/** Serialize a Date to 'MM-DD' for use as a URL search param (no year shown in URL). */
const serializeDateParam = (date: Date): string => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}-${d}`;
};

/** Always map the selected date to a 2023 simulated date for the backend. */
const toSimulatedDateParam = (date: Date): string => {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `2023-${m}-${d}`;
};

const Dashboard: React.FC = () => {
  // Persist the selected date in the URL so it survives React Router
  // unmount/remount when the user switches navigation tabs and returns.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDate = parseDateParam(searchParams.get('date'));

  const [widgetsLoading, setWidgetsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setWidgetsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDateChange = useCallback(
    (date: Date | null) => {
      if (date) {
        setSearchParams({ date: serializeDateParam(date) }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [setSearchParams],
  );

  return (
    <DashboardWrapper>
      <HeaderBar>
        <HeaderRowOne>
          <TypographyWrapper>
            <HeaderTitle>Hello, Jamie</HeaderTitle>
            <HeaderDescription>Review client movements and be ready with timely recommendations</HeaderDescription>
          </TypographyWrapper>
          <Calendar value={selectedDate} onChange={handleDateChange} />
        </HeaderRowOne>
      </HeaderBar>

      <ContentArea>
        <CardRow>
          <MarketSectorTrends simulatedDate={toSimulatedDateParam(selectedDate)} />
          <CardBlock title="Stock Market Updates" description="AI-powered insights for your client portfolios">
            <AlertsList selectedDate={toSimulatedDateParam(selectedDate)} />
          </CardBlock>
        </CardRow>
        <CardRow>
          <UpcomingEarnings simulatedDate={toSimulatedDateParam(selectedDate)} />
          <DashboardClients simulatedDate={toSimulatedDateParam(selectedDate)} />
          <UpcomingMeetings simulatedDate={toSimulatedDateParam(selectedDate)} />
        </CardRow>
      </ContentArea>
    </DashboardWrapper>
  );
};

export default Dashboard;
