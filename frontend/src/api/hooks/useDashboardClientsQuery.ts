import { useQuery } from '@tanstack/react-query';
import { DashboardClientsAPI } from '../endpoints/dashboardClients';
import type { DashboardClientsResponse } from '../types/dashboardClients.types';
import { queryKeys } from '@/utils/queryKeys';
import { ADVISOR_USER_ID } from '@/constants/config';

export const useDashboardClientsQuery = (simulatedDate?: string) => {
  return useQuery<DashboardClientsResponse, Error>({
    queryKey: [queryKeys.dashboardClients, ADVISOR_USER_ID, simulatedDate],
    queryFn: () => DashboardClientsAPI.getDashboardClients(ADVISOR_USER_ID, simulatedDate),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
