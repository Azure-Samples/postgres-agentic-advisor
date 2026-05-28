import { useQuery } from '@tanstack/react-query';
import { SectorTrendsAPI } from '../endpoints/sectorTrends';
import type { SectorTrendsResponse } from '../types/sectorTrends.types';
import { queryKeys } from '@/utils/queryKeys';
import { ADVISOR_USER_ID } from '@/constants/config';

export const useSectorTrendsQuery = (simulatedDate?: string, days?: number) => {
  return useQuery<SectorTrendsResponse, Error>({
    queryKey: [queryKeys.sectorTrends, ADVISOR_USER_ID, simulatedDate, days],
    queryFn: () => SectorTrendsAPI.getSectorTrends(ADVISOR_USER_ID, simulatedDate, days),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
