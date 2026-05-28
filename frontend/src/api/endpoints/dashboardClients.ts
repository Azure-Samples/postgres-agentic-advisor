import { axiosClient } from '../client/axiosClient';
import type { DashboardClientsResponse } from '../types/dashboardClients.types';

export const DashboardClientsAPI = {
  getDashboardClients: async (userId: number, simulatedDate?: string): Promise<DashboardClientsResponse> => {
    const headers: Record<string, string | number> = {
      'X-User-Id': userId,
    };
    if (simulatedDate) {
      headers['X-Simulated-Date'] = simulatedDate;
    }
    const { data } = await axiosClient.get<DashboardClientsResponse>('/dashboard/clients', { headers });
    return data;
  },
};
