import { useQuery } from '@tanstack/react-query';
import { UpcomingEarningsAPI } from '../endpoints/upcomingEarnings';
import type { UpcomingEarningsResponse } from '../types/upcomingEarnings.types';
import { queryKeys } from '@/utils/queryKeys';
import { ADVISOR_USER_ID } from '@/constants/config';

export const useUpcomingEarningsQuery = (simulatedDate?: string) => {
  return useQuery<UpcomingEarningsResponse, Error>({
    queryKey: [queryKeys.upcomingEarnings, ADVISOR_USER_ID, simulatedDate],
    queryFn: () => UpcomingEarningsAPI.getUpcomingEarnings(ADVISOR_USER_ID, simulatedDate),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
