import { useQuery } from '@tanstack/react-query';
import { UpcomingMeetingsAPI } from '../endpoints/upcomingMeetings';
import type { UpcomingMeetingsResponse } from '../types/upcomingMeetings.types';
import { queryKeys } from '@/utils/queryKeys';
import { ADVISOR_USER_ID } from '@/constants/config';

export const useUpcomingMeetingsQuery = (simulatedDate?: string) => {
  return useQuery<UpcomingMeetingsResponse, Error>({
    queryKey: [queryKeys.upcomingMeetings, ADVISOR_USER_ID, simulatedDate],
    queryFn: () => UpcomingMeetingsAPI.getUpcomingMeetings(ADVISOR_USER_ID, simulatedDate),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
