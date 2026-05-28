import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { findClientBySlug, clientToSlug } from '@/utils/clientSlug';
import { useChatStore } from '@/store/chatStore';
import type { Client } from '@/api/types/client.types';

interface UseChatClientInitOptions {
  clients: Client[] | undefined;
  clientName: string | undefined;
  sessionIdParam: string | undefined;
  backPath: string;
  basePathRef: React.MutableRefObject<string>;
}

/**
 * Handles URL-based client initialization and keeps the URL in sync with the
 * active client/session selection.
 */
export const useChatClientInit = ({
  clients,
  clientName,
  sessionIdParam,
  backPath,
  basePathRef,
}: UseChatClientInitOptions) => {
  const navigate = useNavigate();
  const { selectedClientId, selectedSessionId, setSelectedClient, setSelectedSession } = useChatStore();

  // Tracks whether the initial client selection (from URL slug or first-client fallback)
  // has already been applied. Prevents the URL-based lookup from overriding a subsequent
  // manual dropdown selection by the user.
  const hasInitializedClientRef = useRef(false);

  // Auto-select client from URL or first client when clients load.
  useEffect(() => {
    if (!clients || clients.length === 0) return;

    if (clientName) {
      const clientFromSlug = findClientBySlug(clients, clientName);

      if (clientFromSlug) {
        // Only apply the URL-based selection on the very first load.
        if (!hasInitializedClientRef.current) {
          setSelectedClient(clientFromSlug.id);
          if (sessionIdParam) {
            setSelectedSession(Number(sessionIdParam));
          }
          hasInitializedClientRef.current = true;
        }
        return;
      } else {
        console.warn(`Client not found for slug: ${clientName}. Redirecting to ${backPath}.`);
        navigate(backPath, { replace: true });
        return;
      }
    }

    if (!selectedClientId) {
      setSelectedClient(clients[0].id);
    }
    hasInitializedClientRef.current = true;
  }, [clients, clientName, navigate, backPath, setSelectedClient, setSelectedSession, selectedClientId, sessionIdParam]);

  // Sync the URL whenever the active session changes (new chat created, session selected, etc.).
  // Both session and no-session URLs now match the same wildcard route ("messages/*"), so
  // navigate() no longer triggers a ChatInterface remount — the component stays mounted.
  useEffect(() => {
    if (!hasInitializedClientRef.current || !clients || !selectedClientId) return;
    const activeClient = clients.find((c) => c.id === selectedClientId);
    if (!activeClient) return;
    const slug = clientToSlug(activeClient.full_name);
    const newPath = selectedSessionId
      ? `${basePathRef.current}/${slug}/messages/${selectedSessionId}`
      : `${basePathRef.current}/${slug}/messages`;
    if (window.location.pathname !== newPath) {
      navigate(newPath, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId, selectedClientId]);
};
