// Stream/chat completion request per Swagger
export interface StreamCompletionRequest {
  client_id: number;
  chat_session_id: number;
  user_message: string;
  // optional simulated headers
  headers?: {
    'X-User-Id'?: number | string;
    'X-Simulated-Date'?: string; // YYYY-MM-DD
    [key: string]: any;
  };
}

export interface CompletionResponse {
  // The backend returns a plain string body representing the completion
  completion: string;
  raw?: any;
}

// Chat session types
export interface ChatSession {
  description?: string;
  date: string;
  chat_session_id: number;
  chat_title: string;
}

// Response wrapper for chat titles endpoint
export interface ChatTitlesResponse {
  chat_titles: ChatSession[];
}

export interface ChatSessionCreateResponse {
  chat_session_id: number;
}

/** Returned by the backend in an `event: session` SSE frame when a new session is created. */
export interface SessionMetadata {
  chat_session_id: number;
  chat_title: string;
}

// History response format
export interface HistoryMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  /** Backend turn identifier — present on assistant messages, null on user messages. */
  turn_id?: number | null;
  created_at?: string;
  relationships?: any;
  alert?: { id?: number } | null;
}

export interface CompletionHistoryResponse {
  messages: HistoryMessage[];
}

// History request params (updated for session-based chat)
export interface ChatHistoryParams {
  client_id: number;
  chat_session_id: number;
}

// All-clients chat history
export interface AllClientChat {
  client_id: number;
  chat_session_id: number;
  client_name: string;
  chat_title: string;
}

export interface AllClientChatsResponse {
  chats: AllClientChat[];
}

export default CompletionResponse;
