import { useQuery } from '@tanstack/react-query';
import { CompletionsAPI } from '../endpoints/completions';
import type { AlertAgentsGraph, AlertAgentsOutput } from '../types/alert.types';
import { queryKeys } from '@/utils/queryKeys';
import { APP_CONFIG } from '@/constants/config';

interface UseChatAgentsGraphParams {
  clientId: number | null;
  sessionId: number | null;
  turnId: number | null;
  enabled?: boolean;
  simulatedDate?: string;
}

interface ChatAgentsGraphResult {
  graph: AlertAgentsGraph;
  agentsOutput: AlertAgentsOutput;
}

export const useChatAgentsGraphQuery = ({
  clientId,
  sessionId,
  turnId,
  enabled = true,
  simulatedDate,
}: UseChatAgentsGraphParams) => {
  return useQuery<ChatAgentsGraphResult | null, Error>({
    queryKey: [queryKeys.chatAgentsGraph, clientId, sessionId, turnId, simulatedDate ?? null],
    queryFn: async () => {
      if (!clientId || !sessionId || turnId === null) {
        return null;
      }

      return CompletionsAPI.getChatAgentsGraph(clientId, sessionId, turnId, {
        'X-User-Id': APP_CONFIG.userId,
        ...(simulatedDate ? { 'X-Simulated-Date': simulatedDate } : {}),
      });
    },
    enabled: enabled && !!clientId && !!sessionId && turnId !== null,
    staleTime: 30_000,
    // Never retry — 404 means the graph isn't ready yet and will be refetched
    // when the query key changes (new turn). Retrying just floods the console.
    retry: false,
  });
};

export default useChatAgentsGraphQuery;
