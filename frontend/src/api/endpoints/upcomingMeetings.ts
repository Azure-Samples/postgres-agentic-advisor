import { axiosClient } from '../client/axiosClient';
import type { UpcomingMeetingsResponse } from '../types/upcomingMeetings.types';

export const UpcomingMeetingsAPI = {
  getUpcomingMeetings: async (userId: number, simulatedDate?: string): Promise<UpcomingMeetingsResponse> => {
    const headers: Record<string, string | number> = {
      'X-User-Id': userId,
    };
    if (simulatedDate) {
      headers['X-Simulated-Date'] = simulatedDate;
    }
    const { data } = await axiosClient.get<UpcomingMeetingsResponse>('/dashboard/upcoming-meetings', { headers });
    return data;
  },
};
