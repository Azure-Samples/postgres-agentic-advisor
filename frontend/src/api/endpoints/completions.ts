import axios, { CancelTokenSource } from 'axios';
import { axiosClient } from '../client/axiosClient';
import {
  StreamCompletionRequest,
  CompletionResponse,
  CompletionHistoryResponse,
  ChatSession,
  ChatSessionCreateResponse,
  ChatTitlesResponse,
  SessionMetadata,
  AllClientChat,
  AllClientChatsResponse,
} from '../types/completion.types';
import type { AlertAgentsGraph, AlertAgentsOutput } from '../types/alert.types';
import { APP_CONFIG } from '@/constants/config';

const BASE = '/completions';

/**
 * Global cancel token source for managing streaming request cancellation.
 * Allows cancelling previous requests when new ones are initiated.
 */
let cancelTokenSource: CancelTokenSource | null = null;

/**
 * API client for handling AI completion requests and streaming responses.
 *
 * @remarks
 * This API client provides methods for interacting with the AI completion service,
 * supporting both streaming and non-streaming response modes. It handles:
 * - Request cancellation for streaming operations
 * - Custom headers for user identification and simulation
 * - Multiple streaming implementations (Axios and Fetch-based)
 * - Proper error handling and cleanup
 */
export const CompletionsAPI = {
  /**
   * Initiates a streaming chat completion request with automatic cancellation of previous requests.
   *
   * @param {StreamCompletionRequest} opts - The completion request configuration.
   * @returns {Promise<CompletionResponse>} A promise resolving to the completion response.
   *
   * @remarks
   * This method handles streaming AI chat completions with several key features:
   * - Automatic cancellation of previous streaming requests to prevent conflicts
   * - Support for client-specific requests via client_id parameter
   * - Custom header support for user identification and date simulation
   * - Text-based response handling for streaming content
   *
   * Request lifecycle:
   * 1. Cancels any existing streaming request
   * 2. Creates new cancel token for the current request
   * 3. Configures request with parameters and headers
   * 4. Sends POST request to streaming endpoint
   * 5. Returns formatted response with completion text and raw response
   *
   * The method uses Axios with cancel tokens to enable request interruption,
   * which is crucial for streaming scenarios where users might start new
   * conversations before previous ones complete.
   *
   * @example
   * ```typescript
   * const response = await CompletionsAPI.streamChat({
   *   client_id: '123',
   *   user_message: 'Hello, how can you help?',
   *   headers: { 'X-User-Id': 'user_456' }
   * });
   * console.log(response.completion);
   * ```
   */
  streamChat: async (opts: StreamCompletionRequest): Promise<CompletionResponse> => {
    const { client_id, chat_session_id, user_message, headers } = opts as any;

    // Cancel previous streaming request if any
    if (cancelTokenSource) {
      cancelTokenSource.cancel('New stream started');
    }
    cancelTokenSource = axios.CancelToken.source();

    const config: any = {
      params: { client_id, chat_session_id, user_message },
      headers: {},
      responseType: 'text',
      cancelToken: cancelTokenSource.token,
    };

    if (headers) {
      if (headers['X-User-Id']) config.headers['X-User-Id'] = headers['X-User-Id'];
      if (headers['X-Simulated-Date']) config.headers['X-Simulated-Date'] = headers['X-Simulated-Date'];
    }

    const resp = await axiosClient.post<string>(`${BASE}/chat/stream`, null, config);
    cancelTokenSource = null;
    return { completion: typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data), raw: resp };
  },

  /**
   * Stream chat using Fetch and the Streams API.
   * - onChunk: called for each content token.
   * - onSessionMetadata: called once when the backend returns an `event: session` SSE frame
   *   containing { chat_session_id, chat_title }. This happens on the first message of a new
   *   chat (chat_session_id was null) — the backend creates the session and reports it here.
   */
  streamChatChunks: async (
    opts: StreamCompletionRequest,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal,
    onSessionMetadata?: (meta: SessionMetadata) => void,
    onTypedChunk?: (parsed: { type: string; content: unknown }) => void,
  ): Promise<void> => {
    const { client_id, chat_session_id, user_message, headers } = opts as any;

    // build URL from axiosClient baseURL if present
    const base = (axiosClient.defaults.baseURL as string) || '';
    const url = new URL(`${BASE}/chat/stream`, base || window.location.origin);
    url.searchParams.set('client_id', String(client_id));
    url.searchParams.set('chat_session_id', String(chat_session_id));
    url.searchParams.set('user_message', String(user_message));

    const fetchHeaders: Record<string, string> = {
      Accept: 'text/event-stream, text/plain, */*',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    };
    if (headers) {
      if (headers['X-User-Id']) fetchHeaders['X-User-Id'] = String(headers['X-User-Id']);
      if (headers['X-Simulated-Date']) fetchHeaders['X-Simulated-Date'] = String(headers['X-Simulated-Date']);
    }

    // debug the constructed URL
    // eslint-disable-next-line no-console
    console.debug('[CompletionsAPI] fetch stream url:', url.toString());

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: fetchHeaders,
      signal,
    });

    // debug response headers
    // eslint-disable-next-line no-console
    console.debug('[CompletionsAPI] response status:', res.status, 'content-type:', res.headers.get('content-type'));

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Stream request failed with status ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const contentType = res.headers.get('content-type') || '';
    const isSSE = contentType.includes('text/event-stream');

    try {
      if (!isSSE) {
        // Line-delimited JSON stream — each line is a JSON object with a `type` field.
        // `type: "text"` → extract `content` string and forward to onChunk.
        // `type: "relationships"` → forward full parsed object to onTypedChunk.
        // `type: "done"` → end-of-stream sentinel; ignore.
        // Non-JSON lines → forward raw text to onChunk for backwards compatibility.
        let lineBuffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value) continue;
          const chunkText = decoder.decode(value, { stream: true });
          // eslint-disable-next-line no-console
          console.debug('[CompletionsAPI] raw chunk:', chunkText);
          lineBuffer += chunkText;

          // Dispatch all complete lines, keep trailing partial line in buffer.
          const lines = lineBuffer.split(/\r?\n/);
          lineBuffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const parsed = JSON.parse(trimmed);
              if (parsed && typeof parsed === 'object' && 'type' in parsed) {
                if (parsed.type === 'text') {
                  const text = typeof parsed.content === 'string' ? parsed.content : '';
                  if (text) onChunk(text);
                } else {
                  // Forward all non-text typed chunks (including 'done' with turn_id) to handler
                  onTypedChunk?.(parsed as { type: string; content: unknown });
                }
              } else {
                // Plain JSON without a type discriminator — forward raw text.
                onChunk(trimmed);
              }
            } catch {
              // Not valid JSON — forward as plain text.
              onChunk(trimmed);
            }
          }
        }
        // Flush remaining bytes from decoder then dispatch any leftover line.
        const tail = decoder.decode();
        if (tail) lineBuffer += tail;
        if (lineBuffer.trim()) {
          const trimmed = lineBuffer.trim();
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed === 'object' && 'type' in parsed) {
              if (parsed.type === 'text') {
                const text = typeof parsed.content === 'string' ? parsed.content : '';
                if (text) onChunk(text);
              } else {
                // Forward all non-text typed chunks (including 'done' with turn_id) to handler
                onTypedChunk?.(parsed as { type: string; content: unknown });
              }
            } else {
              onChunk(trimmed);
            }
          } catch {
            onChunk(trimmed);
          }
        }
        return;
      }

      // SSE line-delimited parsing
      // Tracks the current `event: <type>` so the following `data:` line is dispatched correctly.
      let buffer = '';
      let currentEventType: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;

        const chunkText = decoder.decode(value, { stream: true });
        // eslint-disable-next-line no-console
        console.debug('[CompletionsAPI] raw chunk:', chunkText);

        buffer += chunkText;

        // Process chunks - split into lines, keep the last partial line in buffer
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || ''; // Keep the last partial line in buffer

        for (const line of lines) {
          // Empty line = end of an SSE event block; reset tracked event type
          if (!line.trim()) {
            currentEventType = null;
            continue;
          }

          // SSE event type declaration: "event: session" or "event: content"
          if (line.startsWith('event: ')) {
            currentEventType = line.slice(7).trim();
            continue;
          }

          // Handle SSE format: "data: {...}" or "data: text"
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim(); // Remove "data: " prefix
            if (data === '[DONE]') {
              currentEventType = null;
              continue; // Stream finished
            }

            // Session metadata event — backend reports the newly created session
            if (currentEventType === 'session' && onSessionMetadata) {
              try {
                const meta = JSON.parse(data) as SessionMetadata;
                onSessionMetadata(meta);
              } catch {
                // ignore malformed metadata
              }
              currentEventType = null;
              continue;
            }

            // Regular content event
            try {
              const parsed = JSON.parse(data);
              // Dispatch typed chunks (e.g. `type: "relationships"`) to the dedicated handler.
              if (parsed && typeof parsed === 'object' && 'type' in parsed) {
                if (parsed.type === 'text') {
                  const text = typeof parsed.content === 'string' ? parsed.content : '';
                  if (text) onChunk(text);
                } else {
                  // Forward all non-text typed chunks (including 'done' with turn_id) to handler
                  onTypedChunk?.(parsed as { type: string; content: unknown });
                }
              } else {
                // Extract text from legacy/various formats
                const text = parsed.text || parsed.delta?.content || parsed.message?.content;
                if (typeof text === 'string' && text) {
                  onChunk(text);
                }
                // Objects with no extractable text are silently dropped — they are
                // likely structured payloads that arrived via the wrong branch.
              }
            } catch (e) {
              // If not JSON, send as plain text
              onChunk(data);
            }
          } else {
            // Plain text line, try to parse as JSON first
            const trimmed = line.trim();
            try {
              const parsed = JSON.parse(trimmed);
              if (parsed && typeof parsed === 'object' && 'type' in parsed) {
                // Typed chunk that arrived outside a `data:` line — route correctly.
                if (parsed.type === 'text') {
                  const text = typeof parsed.content === 'string' ? parsed.content : '';
                  if (text) onChunk(text);
                } else {
                  // Forward all non-text typed chunks (including 'done' with turn_id) to handler
                  onTypedChunk?.(parsed as { type: string; content: unknown });
                }
              } else {
                const text = parsed.text || parsed.delta?.content || parsed.message?.content;
                if (typeof text === 'string' && text) onChunk(text);
              }
            } catch (e) {
              // Not JSON, send as plain text
              onChunk(trimmed);
            }
          }
        }
      }
      // After the loop, flush any remaining buffer content as a final line
      const remaining = buffer.trim();
      if (remaining) {
        try {
          const parsed = JSON.parse(remaining);
          if (parsed && typeof parsed === 'object' && 'type' in parsed) {
            if (parsed.type === 'text') {
              const text = typeof parsed.content === 'string' ? parsed.content : '';
              if (text) onChunk(text);
            } else {
              // Forward all non-text typed chunks (including 'done' with turn_id) to handler
              onTypedChunk?.(parsed as { type: string; content: unknown });
            }
          } else {
            const text = (parsed as any).text || (parsed as any).delta?.content || (parsed as any).message?.content;
            if (typeof text === 'string' && text) onChunk(text);
          }
        } catch (e) {
          onChunk(remaining);
        }
      }
    } finally {
      try {
        reader.cancel();
      } catch (e) {
        // ignore
      }
      reader.releaseLock();
    }
  },

  /**
   * GET /completions/chat/titles?client_id=...
   * Returns list of chat sessions for a client
   */
  getChatTitles: async (client_id: number, headers?: Record<string, any>): Promise<ChatSession[]> => {
    const config: any = {
      params: { client_id },
      headers: {
        'X-User-Id': APP_CONFIG.userId,
      },
    };
    if (headers?.['X-User-Id']) config.headers['X-User-Id'] = headers['X-User-Id'];
    if (headers?.['X-Simulated-Date']) config.headers['X-Simulated-Date'] = headers['X-Simulated-Date'];

    const { data } = await axiosClient.get<ChatTitlesResponse | ChatSession[]>(`${BASE}/chat/titles`, config);

    // Handle both response formats: { chat_titles: [...] } or direct array [...]
    if (data && typeof data === 'object' && 'chat_titles' in data) {
      return (data as ChatTitlesResponse).chat_titles || [];
    }

    // Direct array format
    if (Array.isArray(data)) {
      return data;
    }

    return [];
  },

  /**
   * POST /completions/chat/session/create?client_id=...
   * Creates a new chat session for a client
   */
  createChatSession: async (client_id: number, headers?: Record<string, any>): Promise<ChatSessionCreateResponse> => {
    const config: any = {
      params: { client_id },
      headers: {
        'X-User-Id': APP_CONFIG.userId,
      },
    };
    if (headers?.['X-User-Id']) config.headers['X-User-Id'] = headers['X-User-Id'];
    if (headers?.['X-Simulated-Date']) config.headers['X-Simulated-Date'] = headers['X-Simulated-Date'];
    const { data } = await axiosClient.post<ChatSessionCreateResponse>(`${BASE}/chat/session/create`, null, config);
    return data;
  },

  /**
   * PATCH /completions/chat/{chat_session_id}/title
   * Updates the title of a specific chat session.
   */
  updateChatTitle: async (
    chatSessionId: number,
    clientId: number,
    newTitle: string,
  ): Promise<string> => {
    const { data } = await axiosClient.patch<string>(
      `${BASE}/chat/${chatSessionId}/title`,
      null,
      {
        params: { client_id: clientId, new_title: newTitle },
        headers: { 'X-User-Id': APP_CONFIG.userId },
      },
    );
    return data;
  },

  /**
   * GET /completions/history?client_id=...&chat_session_id=...
   * Returns conversation history for a client's chat session
   */
  getHistory: async (
    client_id: number,
    chat_session_id: number,
    headers?: Record<string, any>,
  ): Promise<CompletionHistoryResponse> => {
    const config: any = {
      params: { client_id, chat_session_id },
      headers: {
        'X-User-Id': APP_CONFIG.userId,
      },
    };
    if (headers?.['X-User-Id']) config.headers['X-User-Id'] = headers['X-User-Id'];
    if (headers?.['X-Simulated-Date']) config.headers['X-Simulated-Date'] = headers['X-Simulated-Date'];

    const { data } = await axiosClient.get<any>(`${BASE}/history`, config);

    // Debug log the raw response
    console.debug('[CompletionsAPI] getHistory raw response:', data);

    // Handle different response formats and normalize to CompletionHistoryResponse
    if (data && typeof data === 'object') {
      // If it's already in the expected format
      if (Array.isArray(data.messages)) {
        return data as CompletionHistoryResponse;
      }
      // If data itself is an array
      if (Array.isArray(data)) {
        return { messages: data };
      }
      // Check for other common wrapper keys
      const possibleKeys = ['history', 'data', 'chat_history', 'conversation'];
      for (const key of possibleKeys) {
        if (Array.isArray(data[key])) {
          return { messages: data[key] };
        }
      }
    }

    // Default empty response
    return { messages: [] };
  },

  /**
   * GET /completions/chat/{chat_session_id}/agents-graph?client_id=...&turn_id=...
   * Returns workflow graph for a specific chat turn.
   */
  getChatAgentsGraph: async (
    client_id: number,
    chat_session_id: number,
    turn_id: number,
    headers?: Record<string, any>,
  ): Promise<{ graph: AlertAgentsGraph; agentsOutput: AlertAgentsOutput } | null> => {
    const config: any = {
      params: { client_id, turn_id },
      headers: {
        'X-User-Id': APP_CONFIG.userId,
      },
    };

    if (headers?.['X-User-Id']) config.headers['X-User-Id'] = headers['X-User-Id'];
    if (headers?.['X-Simulated-Date']) config.headers['X-Simulated-Date'] = headers['X-Simulated-Date'];

    try {
      const { data } = await axiosClient.get<{ agents_graph: AlertAgentsGraph; agent_outputs: AlertAgentsOutput }>(
        `${BASE}/chat/${chat_session_id}/agents-graph`,
        config,
      );

      const graph = data?.agents_graph;
      if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
        return null;
      }

      return { graph, agentsOutput: data.agent_outputs ?? {} };
    } catch (err: any) {
      // Treat 404 as "graph not yet available" — return null so the UI can
      // fall back to the default workflow view without surfacing an error.
      if (err?.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * DELETE /completions/history?client_id=...&chat_session_id=...
   */
  deleteHistory: async (client_id: number, chat_session_id: number, headers?: Record<string, any>): Promise<string> => {
    const config: any = {
      params: { client_id, chat_session_id },
      headers: {},
    };
    if (headers?.['X-User-Id']) config.headers['X-User-Id'] = headers['X-User-Id'];
    if (headers?.['X-Simulated-Date']) config.headers['X-Simulated-Date'] = headers['X-Simulated-Date'];
    const { data } = await axiosClient.delete<string>(`${BASE}/history`, config);
    return data;
  },

  /**
   * GET /completions/all_client_chats
   * Returns all chat sessions across every client visible to the advisor.
   */
  getAllClientChats: async (headers?: Record<string, any>): Promise<AllClientChat[]> => {
    const config: any = {
      headers: { 'X-User-Id': APP_CONFIG.userId },
    };
    if (headers?.['X-User-Id']) config.headers['X-User-Id'] = headers['X-User-Id'];
    if (headers?.['X-Simulated-Date']) config.headers['X-Simulated-Date'] = headers['X-Simulated-Date'];
    const { data } = await axiosClient.get<AllClientChatsResponse>(`${BASE}/all_client_chats`, config);
    return data?.chats ?? [];
  },
};

export default CompletionsAPI;
