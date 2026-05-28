import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ResetAPI } from '../endpoints/reset';

export const useResetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ResetAPI.resetApplication(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
