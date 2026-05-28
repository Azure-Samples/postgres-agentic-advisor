import { axiosClient } from '../client/axiosClient';
import { ADVISOR_USER_ID } from '@/constants/config';

export const ResetAPI = {
  resetApplication: async (): Promise<string> => {
    const response = await axiosClient.post<string>(
      '/reset',
      {},
      { headers: { 'X-User-Id': ADVISOR_USER_ID } },
    );
    return response.data;
  },
};
