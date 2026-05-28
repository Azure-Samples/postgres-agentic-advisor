import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCompletion } from '@/api/hooks/useCompletion';
import { CompletionsAPI } from '@/api/endpoints/completions';
import { useChatStore } from '@/store/chatStore';
import { APP_CONFIG } from '@/constants/config';
import { ChatMessage } from '@/api/types/chat.types';
import type { ChatSession } from '@/api/types/completion.types';
import { queryKeys } from '@/utils/queryKeys';
import { useCreateChatSession } from '@/api/hooks/useChatSessions';

/**
 * Module-level shared key — tracks the last session whose history was fetched.
 * Shared across ALL hook instances (ChatWidget on main page, ChatDrawer, ChatWidget
 * inside ChatDrawer) so only ONE fetch runs for a given session regardless of how many
 * hook instances are mounted simultaneously.
 * Reset to null when no session is active.
 */
let globalLastFetchedChatKey: string | null = null;

/**
 * Tracks which session key is currently being fetched from the API.
 * Prevents multiple concurrent fetchHistory calls for the same session when
 * several hook instances all see empty messages and pass force=true, which
 * bypasses the globalLastFetchedChatKey deduplication guard.
 */
let globalFetchingKey: string | null = null;

/**
 * In-memory message cache keyed by "clientId-sessionId".
 * When the user navigates away from a session and comes back, messages are
 * restored instantly from cache instead of making an API round-trip.
 * Updated after every successful history fetch and after every stream completes.
 */
const sessionMessageCache = new Map<string, ChatMessage[]>();

/**
 * Core chat handler hook.
 *
 * Session lifecycle:
 * - selectedSessionId === null  →  draft mode (no backend session yet)
 * - First sendMessage call passes chat_session_id: null to the stream endpoint.
 * - The backend creates the session, returns an `event: session` SSE frame with
 *   { chat_session_id, chat_title }, then streams the assistant response.
 * - onSessionCreated updates the store without interrupting the stream.
 * - queryClient.setQueryData immediately injects the new entry into the sidebar cache.
 * - queryClient.invalidateQueries reconciles with server truth after the stream ends.
 */
export const useChatHandler = () => {
  const queryClient = useQueryClient();
  const createSessionMutation = useCreateChatSession();
  const {
    addMessage,
    updateMessage,
    removeMessage,
    setStreaming,
    selectedClientId,
    selectedSessionId,
    setMessages,
    setLoadingHistory,
    setSessionPending,
    setTemplateMode,
    setError,
    setLatestTurnId,
    isTemplateMode,
    isStreaming,
    isSessionPending,
  } = useChatStore();

  const completionMutation = useCompletion();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch conversation history when client or session changes
  const fetchHistory = useCallback(
    async (clientId: number, sessionId: number, force: boolean = false) => {
      if (!clientId || !sessionId) return;

      // Primary guard: read fresh store state rather than relying on the caller's
      // closure-captured React values, which can be stale due to Zustand batching.
      // History must NEVER be fetched while a stream is in progress — doing so can
      // break the stream connection and overwrite in-flight messages.
      const { isStreaming: activeStream, isSessionPending: activeSession } = useChatStore.getState();
      if (activeStream || activeSession) return;

      const fetchKey = `${clientId}-${sessionId}`;
      if (!force && globalLastFetchedChatKey === fetchKey) return;

      // Prevent multiple concurrent API fetches for the same session.
      // The globalLastFetchedChatKey guard above is bypassed when force=true (e.g. when
      // messages are empty and multiple hook instances all call fetchHistory simultaneously).
      // This secondary lock closes that gap.
      if (globalFetchingKey === fetchKey) return;

      // Restore from in-memory cache instantly — no API call needed.
      const cached = sessionMessageCache.get(fetchKey);
      if (cached && cached.length > 0) {
        setMessages(cached);
        setTemplateMode(false);
        globalLastFetchedChatKey = fetchKey;
        // Restore latestTurnId from the last assistant message that carries one.
        // setSelectedSession() resets it to null, so we must re-derive it here
        // or the workflow graph falls back to the static placeholder.
        const lastWithTurnId = [...cached].reverse().find(
          (m) => m.role === 'assistant' && m.turnId != null,
        );
        setLatestTurnId(lastWithTurnId?.turnId ?? null);
        return;
      }

      setLoadingHistory(true);
      globalLastFetchedChatKey = fetchKey;
      globalFetchingKey = fetchKey;

      try {
        const historyResponse = await CompletionsAPI.getHistory(clientId, sessionId, {
          'X-User-Id': APP_CONFIG.userId,
        });

        let messagesArray: any[] = [];
        if (historyResponse?.messages && Array.isArray(historyResponse.messages)) {
          messagesArray = historyResponse.messages;
        } else if (Array.isArray(historyResponse)) {
          messagesArray = historyResponse;
        } else if (historyResponse && typeof historyResponse === 'object') {
          const possibleKeys = ['messages', 'history', 'data', 'chat_history'];
          for (const key of possibleKeys) {
            if (Array.isArray((historyResponse as any)[key])) {
              messagesArray = (historyResponse as any)[key];
              break;
            }
          }
        }

        if (messagesArray.length > 0) {
          const chatMessages: ChatMessage[] = messagesArray.map((msg, index) => {
            let role: 'user' | 'assistant' | 'system' = 'user';
            const rawRole = msg.role || msg.sender || msg.type || msg.from;
            if (rawRole) {
              const normalized = String(rawRole).toLowerCase().trim();
              if (['assistant', 'ai', 'bot', 'agent'].includes(normalized)) role = 'assistant';
              else if (normalized === 'system') role = 'system';
            }
            return {
              id: `history-${clientId}-${sessionId}-${index}-${Date.now()}`,
              role,
              content: msg.content || msg.message || msg.text || msg.body || '',
              createdAt: msg.created_at || msg.createdAt || msg.timestamp || new Date().toISOString(),
              ...(msg.turn_id !== undefined ? { turnId: msg.turn_id } : {}),
              ...(msg.relationships ? { relationships: msg.relationships } : {}),
              ...(msg.alert?.id ? { alertId: msg.alert.id } : {}),
            };
          });
          setMessages(chatMessages);
          sessionMessageCache.set(fetchKey, chatMessages);

          // Extract turn_id from the last assistant message that carries one.
          // turn_id is only meaningful on assistant messages (each AI response = one turn).
          // Scanning in reverse handles the case where the history ends with a user message.
          // Use ?? (not ||) so a hypothetical turn_id of 0 is not discarded.
          const lastAssistantMsg = [...chatMessages]
            .reverse()
            .find((m) => m.role === 'assistant' && m.turnId != null);
          setLatestTurnId(lastAssistantMsg?.turnId ?? null);

          setTemplateMode(false);
        } else {
          setMessages([]);
          setLatestTurnId(null);
          setTemplateMode(true);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        globalLastFetchedChatKey = null; // allow retry on next selection
        setMessages([
          {
            id: `error-history-${Date.now()}`,
            role: 'system',
            content: '',
            isError: true,
            errorKind: 'history',
            createdAt: new Date().toISOString(),
          },
        ]);
        setLatestTurnId(null);
        setTemplateMode(false);
      } finally {
        setLoadingHistory(false);
        // Release the fetch lock so a future retry can proceed.
        if (globalFetchingKey === fetchKey) globalFetchingKey = null;
      }
    },
    [setMessages, setLatestTurnId, setLoadingHistory, setTemplateMode],
  );

  // Re-fetch history when the active client/session changes.
  // Two guards prevent multiple hook instances (main ChatWidget, ChatDrawer, drawer ChatWidget)
  // from stomping on each other:
  //   1. isStreaming / isSessionPending — never touch messages mid-stream.
  //   2. globalLastFetchedChatKey — shared across all instances; first one to run sets the
  //      key synchronously inside fetchHistory, later instances see it and skip.
  useEffect(() => {
    if (selectedClientId && selectedSessionId) {
      // Never touch messages while a stream is in progress.
      // Double-check with fresh store state: the closure values (isStreaming,
      // isSessionPending) can lag behind by one render batch when selectedSessionId
      // changes at the same time (e.g. onSessionCreated during a draft send).
      if (isStreaming || isSessionPending) return;
      const { isStreaming: freshStream, isSessionPending: freshPending } = useChatStore.getState();
      if (freshStream || freshPending) return;
      const fetchKey = `${selectedClientId}-${selectedSessionId}`;
      // Fetch if: (a) different session than last loaded, OR
      //           (b) messages are empty — e.g. setSelectedSession just wiped them.
      // The inner check inside fetchHistory deduplicates concurrent calls from
      // the multiple hook instances that are mounted simultaneously.
      const currentMessages = useChatStore.getState().messages;
      if (globalLastFetchedChatKey !== fetchKey || currentMessages.length === 0) {
        // Pass force=true when messages are empty so fetchHistory bypasses its
        // deduplication guard — this handles re-selecting the same session after
        // navigating away (setSelectedSession clears messages but the key stays).
        fetchHistory(selectedClientId, selectedSessionId, currentMessages.length === 0);
      }
    } else {
      // No session selected — only wipe when truly idle, never during a stream.
      // Without this guard, setStreaming(true) re-triggers this effect while
      // selectedSessionId is still null and unconditionally clears in-flight messages.
      if (!isStreaming && !isSessionPending) {
        // Don't wipe messages that already exist — e.g. when a draft session creation
        // fails (network loss), the user message + error bubble must stay visible
        // instead of snapping back to the welcome screen.
        const existingMessages = useChatStore.getState().messages;
        if (existingMessages.length === 0) {
          setMessages([]);
          setLatestTurnId(null);
          setTemplateMode(true);
          globalLastFetchedChatKey = null;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId, selectedSessionId, isStreaming, isSessionPending]);

  /** Abort any in-progress stream. */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreaming(false);
    setSessionPending(false);
  }, [setStreaming, setSessionPending]);

  /**
   * Send a message.
   *
   * When selectedSessionId is null (draft), passes chat_session_id: null to the endpoint.
   * The backend creates the session and emits an `event: session` SSE frame before content.
   * Race conditions are prevented by the isStreaming / isSessionPending guards.
   */
  const sendMessage = async (text: string, isTemplate: boolean = false, simulatedDate?: string) => {
    // Always read fresh state to avoid stale closure bugs
    const store = useChatStore.getState();
    const clientId = store.selectedClientId;
    const currentSessionId = store.selectedSessionId;

    if (!clientId) throw new Error('No client selected');
    // Prevent concurrent sends
    if (store.isStreaming || store.isSessionPending) return;

    setError(null);
    const isDraftSession = currentSessionId === null;

    // 1. Optimistically render the user message immediately
    const userMsgId = `user-${Date.now()}-${Math.random()}`;
    addMessage({
      id: userMsgId,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    });

    if (isTemplate) setTemplateMode(false);

    // 2. Placeholder for the streaming assistant response
    const assistantMsgId = `assistant-${Date.now()}-${Math.random()}`;
    addMessage({
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    });

    setStreaming(true);
    if (isDraftSession) setSessionPending(true);

    abortControllerRef.current = new AbortController();

    try {
      // For draft sessions, create the backend session first so we have a real ID to stream with
      let sessionId = currentSessionId;
      if (isDraftSession) {
        const created = await createSessionMutation.mutateAsync(clientId);
        sessionId = created.chat_session_id;
        // Optimistically inject the new session into the sidebar with a placeholder title.
        // The real AI-generated title will replace it when invalidateQueries runs after stream.
        queryClient.setQueryData(
          [queryKeys.chatSessions, clientId],
          (old: ChatSession[] = []) => [
            { chat_session_id: sessionId!, chat_title: 'New Chat' },
            ...old.filter((s) => s.chat_session_id !== sessionId),
          ],
        );
        // Update the store — this changes selectedSessionId from null → new id.
        // The effect will re-run but isStreaming=true blocks any fetchHistory call.
        useChatStore.getState().onSessionCreated(sessionId);

        // ── Critical: claim the dedup key NOW, before the stream starts. ──────
        // globalLastFetchedChatKey is only set in the happy-path (after stream
        // succeeds, line ~408). If the stream throws or is aborted the key is
        // never set, so when setStreaming(false) fires the useEffect it sees
        // a new selectedSessionId with no matching key and calls fetchHistory —
        // which GETs /completions/history for the brand-new session, gets []
        // back, calls setMessages([]), and wipes the in-flight messages.
        // Setting the key here prevents fetchHistory from firing in ALL exit
        // paths (success, error, abort). The success path sets it again (no-op).
        // Navigating away and back still loads history because messages will be
        // empty then, triggering force=true which bypasses this dedup key.
        globalLastFetchedChatKey = `${clientId}-${sessionId}`;
      }

      let committed = '';
      let pendingBuffer = '';
      let flushTimer: number | null = null;
      const FLUSH_INTERVAL = 80;
      const FLUSH_THRESHOLD = 48;

      const clearFlushTimer = () => {
        if (flushTimer !== null) {
          clearTimeout(flushTimer);
          flushTimer = null;
        }
      };

      const flushPending = () => {
        if (!pendingBuffer.length) return;
        committed += pendingBuffer;
        pendingBuffer = '';
        useChatStore.getState().updateMessage(assistantMsgId, { content: committed });
      };

      const scheduleFlush = () => {
        if (flushTimer !== null) return;
        flushTimer = window.setTimeout(() => {
          flushTimer = null;
          flushPending();
        }, FLUSH_INTERVAL) as unknown as number;
      };

      // Guard: cancelStream() nulls abortControllerRef during session creation.
      // Without this, abortControllerRef.current.signal throws a TypeError that
      // falls through to the non-AbortError catch path and shows a spurious error.
      if (!abortControllerRef.current) {
        // Treat this like an abort — the user cancelled before the stream began.
        throw new DOMException('Stream cancelled before it started', 'AbortError');
      }

      await CompletionsAPI.streamChatChunks(
        {
          client_id: clientId,
          chat_session_id: sessionId!,
          user_message: text,
          headers: {
            'X-User-Id': APP_CONFIG.userId as number,
            ...(simulatedDate ? { 'X-Simulated-Date': simulatedDate } : {}),
          },
        },
        (chunk: string) => {
          if (chunk) {
            pendingBuffer += chunk;
            if (pendingBuffer.length >= FLUSH_THRESHOLD) {
              clearFlushTimer();
              flushPending();
            } else {
              scheduleFlush();
            }
          }
        },
        abortControllerRef.current.signal,
        undefined,
        (typed) => {
          // Handle structured (non-text) chunks from the stream.
          if (typed.type === 'relationships') {
            const payload = (typed.content as any)?.relationships;
            if (payload) {
              useChatStore.getState().updateMessage(assistantMsgId, { relationships: payload });
            }
          } else if (typed.type === 'agents_graph') {
            const c = typed.content as any;
            if (c?.agents_graph) {
              useChatStore.getState().updateMessage(assistantMsgId, {
                agentsGraph: c.agents_graph,
                agentsOutput: c.agents_output ?? null,
              });
            }
          } else if (typed.type === 'alert') {
            const alertData = typed.content as any;
            const id = alertData?.id ?? alertData?.alert_id;
            if (id) {
              useChatStore.getState().updateMessage(assistantMsgId, { alertId: id });
            }
          } else if (typed.type === 'analyzing') {
            const raw = typed as any;
            const agent: string | undefined = raw.agent || (typed.content as any)?.agent;
            if (agent) {
              const existing = useChatStore.getState().messages.find((m) => m.id === assistantMsgId)?.analyzingAgents ?? [];
              if (!existing.includes(agent)) {
                useChatStore.getState().updateMessage(assistantMsgId, { analyzingAgents: [...existing, agent] });
              }
            }
          } else if (typed.type === 'memory_saved') {
            useChatStore.getState().updateMessage(assistantMsgId, { memorySaved: true });
            const currentClientId = useChatStore.getState().selectedClientId;
            if (currentClientId != null) {
              // Refresh the risk profile badge next to the client name.
              queryClient.invalidateQueries({ queryKey: [queryKeys.clientRiskProfile, currentClientId] });
            }
            // Invalidate all date-based alert queries so the dashboard alerts widget
            // refetches and reflects the updated mem0 state.
            queryClient.invalidateQueries({ queryKey: [queryKeys.alertsByDate] });
            // Refresh all cached alert summaries so risk_insight_mem0_used reflects the
            // updated mem0 state when the user reopens an alert's advisory modal.
            queryClient.invalidateQueries({ queryKey: [queryKeys.alertSummary] });
          } else if (typed.type === 'done') {
            // Extract turn_id from the "done" event: {"type": "done", "turn_id": 6}
            // turn_id is at the top level of the event object, not inside content
            const raw = typed as any;
            const parsedTurnId =
              typeof raw.turn_id === 'number'
                ? raw.turn_id
                : typeof raw.turn_id === 'string' && raw.turn_id.trim() !== '' && !Number.isNaN(Number(raw.turn_id))
                  ? Number(raw.turn_id)
                  : null;

            useChatStore.getState().setLatestTurnId(parsedTurnId);
            useChatStore.getState().updateMessage(assistantMsgId, { turnId: parsedTurnId });
          }
        },
      );

      clearFlushTimer();
      flushPending();

      // Mark this session's messages as fresh BEFORE setStreaming(false) fires the effect.
      // Without this, the effect would see empty messages (key doesn't match yet) and
      // call fetchHistory, overwriting the streamed content with server history.
      const cacheKey = `${clientId}-${sessionId}`;
      if (isDraftSession && sessionId) {
        globalLastFetchedChatKey = cacheKey;
      }
      // Cache the fully-streamed conversation so navigating away and back doesn't re-fetch.
      const streamedMessages = useChatStore.getState().messages.filter((m) => !m.isError);
      if (streamedMessages.length > 0 && sessionId) {
        sessionMessageCache.set(cacheKey, streamedMessages);
      }

      // Reconcile sidebar with server truth after stream completes
      if (isDraftSession) {
        await queryClient.invalidateQueries({
          queryKey: [queryKeys.chatSessions, clientId],
        });
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      console.error('Error sending message:', error);
      useChatStore.getState().updateMessage(assistantMsgId, {
        content: '',
        isError: true,
        errorKind: 'stream',
      });
    } finally {
      setStreaming(false);
      setSessionPending(false);
      abortControllerRef.current = null;
    }
  };

  const completePrompt = async (prompt: string) => {
    return sendMessage(prompt, isTemplateMode);
  };

  return {
    sendMessage,
    completePrompt,
    fetchHistory,
    cancelStream,
    isLoading: ((completionMutation as any).isPending ?? false) || !!isStreaming || !!isSessionPending,
    isSessionPending,
    error: completionMutation.error,
  };
};

export default useChatHandler;
