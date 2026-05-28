import { axiosClient } from '../client/axiosClient';
import type { UpcomingEarningsResponse } from '../types/upcomingEarnings.types';

export const UpcomingEarningsAPI = {
  getUpcomingEarnings: async (userId: number, simulatedDate?: string): Promise<UpcomingEarningsResponse> => {
    const headers: Record<string, string | number> = {
      'X-User-Id': userId,
    };
    if (simulatedDate) {
      headers['X-Simulated-Date'] = simulatedDate;
    }
    const { data } = await axiosClient.get<UpcomingEarningsResponse>('/dashboard/upcoming-earnings', { headers });
    return data;
  },
};
