import { axiosClient } from '../client/axiosClient';
import type { SectorTrendsResponse } from '../types/sectorTrends.types';

export const SectorTrendsAPI = {
  getSectorTrends: async (userId: number, simulatedDate?: string, days?: number): Promise<SectorTrendsResponse> => {
    const headers: Record<string, string | number> = {
      'X-User-Id': userId,
    };
    if (simulatedDate) {
      headers['X-Simulated-Date'] = simulatedDate;
    }
    const params: Record<string, number> = {};
    if (days !== undefined) params.days = days;
    const { data } = await axiosClient.get<SectorTrendsResponse>('/dashboard/sector-trends', { headers, params });
    return data;
  },
};
