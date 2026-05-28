import { create } from 'zustand';
import { ChatMessage } from '../api/types/chat.types';

interface ChatStore {
  // Core state
  messages: ChatMessage[];
  isStreaming: boolean;
  selectedClientId: number | null;
  selectedSessionId: number | null; // null = draft / new chat
  latestTurnId: number | null;

  // Loading states
  isLoadingHistory: boolean;
  /** True while the first message is in-flight and the session ID has not yet been returned. */
  isSessionPending: boolean;
  isDeletingSession: boolean;

  // UI state
  isTemplateMode: boolean;

  // Error state
  error: string | null;

  // Actions
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
  setStreaming: (val: boolean) => void;
  setSelectedClient: (clientId: number | null) => void;
  setSelectedSession: (sessionId: number | null) => void;
  setLatestTurnId: (turnId: number | null) => void;
  /** Called when the backend returns a session ID from the first-message stream.
   *  Non-destructive: only updates the ID so the stream can continue uninterrupted. */
  onSessionCreated: (sessionId: number) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoadingHistory: (loading: boolean) => void;
  setSessionPending: (pending: boolean) => void;
  setDeletingSession: (deleting: boolean) => void;
  setTemplateMode: (isTemplate: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
  clearSession: () => void;
  resetToNewChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  // Initial state
  messages: [],
  isStreaming: false,
  selectedClientId: null,
  selectedSessionId: null,
  latestTurnId: null,
  isLoadingHistory: false,
  isSessionPending: false,
  isDeletingSession: false,
  isTemplateMode: true,
  error: null,

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg], error: null })),

  updateMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),

  removeMessage: (id) =>
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),

  setStreaming: (val) => set({ isStreaming: val }),

  setSelectedClient: (clientId) =>
    set({
      selectedClientId: clientId,
      selectedSessionId: null,
      latestTurnId: null,
      messages: [],
      isTemplateMode: true,
      isSessionPending: false,
      error: null,
    }),

  setSelectedSession: (sessionId) =>
    set({
      selectedSessionId: sessionId,
      latestTurnId: null,
      messages: [],
      isTemplateMode: !sessionId,
      isSessionPending: false,
      error: null,
    }),

  setLatestTurnId: (turnId) => set({ latestTurnId: turnId }),

  // Update session ID without resetting messages — stream is still in progress.
  onSessionCreated: (sessionId) =>
    set({ selectedSessionId: sessionId, isSessionPending: false }),

  setMessages: (messages) =>
    set({ messages }),

  setLoadingHistory: (loading) => set({ isLoadingHistory: loading }),
  setSessionPending: (pending) => set({ isSessionPending: pending }),
  setDeletingSession: (deleting) => set({ isDeletingSession: deleting }),
  setTemplateMode: (isTemplate) => set({ isTemplateMode: isTemplate }),
  setError: (error) => set({ error }),

  clear: () =>
    set({
      messages: [],
      isTemplateMode: true,
      selectedClientId: null,
      selectedSessionId: null,
      latestTurnId: null,
      isSessionPending: false,
      error: null,
      isStreaming: false,
      isLoadingHistory: false,
      isDeletingSession: false,
    }),

  clearSession: () =>
    set({
      messages: [],
      isTemplateMode: true,
      selectedSessionId: null,
      latestTurnId: null,
      isSessionPending: false,
      error: null,
    }),

  resetToNewChat: () =>
    set({
      selectedSessionId: null,
      latestTurnId: null,
      messages: [],
      isTemplateMode: true,
      isSessionPending: false,
      error: null,
      isStreaming: false,
    }),
}));

export default useChatStore;
