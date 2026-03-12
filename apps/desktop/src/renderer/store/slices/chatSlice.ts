import type { StateCreator } from "zustand";
import type {
  LLMChatRequest,
  LLMProviderId,
} from "@repo/shared/types/llm/schemas";
import type {
  ChatMessage,
  ChatMode,
  ChatSessionContext,
  ChatSessionRecord,
  RagConnectionStatus,
} from "../types";
import {
  buildChatModeSystemPrompt,
  buildChatSessionTitle,
  createChatEntityId,
  createChatSessionContext,
  createChatSessionRecord,
  mergeChatSessionContext,
} from "../../features/chat-platform/session";

// ============================================
// Types
// ============================================

export interface StreamingError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ChatSendOptions {
  providerId?: LLMProviderId | null;
  modelId?: string | null;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatSlice {
  // State
  chatMessages: ChatMessage[];
  chatInput: string;
  isSending: boolean;
  ragConnectionStatus: RagConnectionStatus;
  activeChatMode: ChatMode;
  activeChatSessionId: string | null;
  chatSessions: Record<string, ChatSessionRecord>;
  chatSessionOrder: string[];
  modeSessionIds: Partial<Record<ChatMode, string>>;

  // Streaming State
  isStreaming: boolean;
  streamingContent: string;
  currentStreamId: string | null;
  streamingMessageId: string | null;
  streamingError: StreamingError | null;

  // System Prompt State
  systemPrompt: string;
  systemPromptUpdatedAt: Date | null;
  selectedTemplateId: string | null;

  // Actions
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, content: string) => void;
  setChatInput: (input: string) => void;
  setIsSending: (sending: boolean) => void;
  setRagConnectionStatus: (status: RagConnectionStatus) => void;
  clearMessages: () => void;
  sendMessage: (message: string, options?: ChatSendOptions) => Promise<void>;
  retryLastMessage: (options?: ChatSendOptions) => Promise<void>;
  activateChatMode: (
    mode: ChatMode,
    context?: Partial<ChatSessionContext>,
  ) => string;
  resumeChatSession: (sessionId: string) => void;
  updateActiveChatContext: (context: Partial<ChatSessionContext>) => void;

  // Streaming Actions
  startStreaming: (requestId: string, messageId?: string) => void;
  appendStreamChunk: (content: string) => void;
  endStreaming: () => void;
  cancelStreaming: () => void;
  abortStreaming: () => Promise<void>;
  setStreamingError: (error: StreamingError) => void;

  // System Prompt Actions
  setSystemPrompt: (prompt: string) => void;
  clearSystemPrompt: () => void;
  applyTemplate: (templateId: string, content: string) => void;
  clearTemplateSelection: () => void;
}

type StreamAwareChatSlice = Pick<
  ChatSlice,
  | "appendStreamChunk"
  | "endStreaming"
  | "setStreamingError"
  | "currentStreamId"
  | "isStreaming"
>;

const DEFAULT_CHAT_MODE: ChatMode = "general";

let streamListenersRegistered = false;

function createLLMUnavailableError(): StreamingError {
  return {
    code: "LLM_NOT_AVAILABLE",
    message: "LLM streaming API が利用できません",
    retryable: false,
  };
}

function createStreamStartError(error: unknown): StreamingError {
  return {
    code: "STREAM_START_ERROR",
    message:
      error instanceof Error ? error.message : "ストリーム開始に失敗しました",
    retryable: true,
  };
}

function ensureStreamListeners(get: () => StreamAwareChatSlice): void {
  if (streamListenersRegistered) {
    return;
  }

  if (typeof window === "undefined" || !window.electronAPI?.llm) {
    return;
  }

  const llmApi = window.electronAPI.llm;

  llmApi.onStreamChunk((chunk) => {
    const state = get();
    if (!state.isStreaming || !state.currentStreamId) {
      return;
    }

    if (chunk.delta?.content) {
      state.appendStreamChunk(chunk.delta.content);
    }

    if (chunk.done) {
      state.endStreaming();
    }
  });

  llmApi.onStreamEnd(() => {
    const state = get();
    if (state.isStreaming) {
      state.endStreaming();
    }
  });

  llmApi.onStreamError((error) => {
    const state = get();
    state.setStreamingError({
      code: error.code,
      message: error.message,
      retryable: error.retryable,
    });
  });

  streamListenersRegistered = true;
}

function cloneMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    timestamp: new Date(message.timestamp),
  };
}

function syncActiveSession(
  state: ChatSlice,
  sessions: Record<string, ChatSessionRecord>,
  activeSessionId: string | null,
): Pick<ChatSlice, "chatMessages" | "chatSessions"> {
  const activeSession = activeSessionId ? sessions[activeSessionId] : null;

  return {
    chatSessions: sessions,
    chatMessages: activeSession
      ? activeSession.messages.map(cloneMessage)
      : state.chatMessages,
  };
}

function sortSessionOrder(
  sessions: Record<string, ChatSessionRecord>,
): string[] {
  return Object.values(sessions)
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
    .map((session) => session.id);
}

function getActiveSessionRecord(state: ChatSlice): ChatSessionRecord | null {
  if (!state.activeChatSessionId) {
    return null;
  }

  return state.chatSessions[state.activeChatSessionId] ?? null;
}

function updateSessionRecord(
  state: ChatSlice,
  sessionId: string,
  updater: (session: ChatSessionRecord) => ChatSessionRecord,
): Partial<ChatSlice> {
  const current = state.chatSessions[sessionId];

  if (!current) {
    return {};
  }

  const updated = updater(current);
  const sessions = {
    ...state.chatSessions,
    [sessionId]: updated,
  };

  return {
    ...syncActiveSession(state, sessions, state.activeChatSessionId),
    chatSessionOrder: sortSessionOrder(sessions),
  };
}

function buildRequestMessages(
  session: ChatSessionRecord,
): Array<{ role: "user" | "assistant" | "system"; content: string }> {
  return session.messages
    .filter((message) => !message.isStreaming)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

function buildPlaceholderMessage(
  sessionId: string,
  mode: ChatMode,
): ChatMessage {
  return {
    id: createChatEntityId("assistant"),
    role: "assistant",
    content: "",
    timestamp: new Date(),
    isStreaming: true,
    sessionId,
    mode,
  };
}

function initializeDefaultChatState(): Pick<
  ChatSlice,
  | "chatMessages"
  | "activeChatMode"
  | "activeChatSessionId"
  | "chatSessions"
  | "chatSessionOrder"
  | "modeSessionIds"
> {
  const generalSession = createChatSessionRecord(
    DEFAULT_CHAT_MODE,
    createChatSessionContext({ entryPoint: "chat" }),
  );

  return {
    chatMessages: generalSession.messages.map(cloneMessage),
    activeChatMode: DEFAULT_CHAT_MODE,
    activeChatSessionId: generalSession.id,
    chatSessions: {
      [generalSession.id]: generalSession,
    },
    chatSessionOrder: [generalSession.id],
    modeSessionIds: {
      general: generalSession.id,
    },
  };
}

async function startStreamRequest(
  request: LLMChatRequest,
): Promise<{ requestId: string }> {
  if (typeof window === "undefined" || !window.electronAPI?.llm) {
    throw createLLMUnavailableError();
  }

  return window.electronAPI.llm.streamChat(request);
}

export const createChatSlice: StateCreator<ChatSlice, [], [], ChatSlice> = (
  set,
  get,
) => {
  const defaultState = initializeDefaultChatState();

  return {
    // Initial state
    ...defaultState,
    chatInput: "",
    isSending: false,
    ragConnectionStatus: "disconnected",

    // Streaming Initial State
    isStreaming: false,
    streamingContent: "",
    currentStreamId: null,
    streamingMessageId: null,
    streamingError: null,

    // System Prompt Initial State
    systemPrompt: "",
    systemPromptUpdatedAt: null,
    selectedTemplateId: null,

    // Actions
    addMessage: (message) => {
      const state = get();
      const activeSession =
        getActiveSessionRecord(state) ??
        state.chatSessions[state.modeSessionIds[state.activeChatMode] ?? ""];

      if (!activeSession) {
        return;
      }

      const sessionMessage: ChatMessage = {
        ...message,
        sessionId: activeSession.id,
        mode: activeSession.mode,
      };

      set((current) =>
        updateSessionRecord(current, activeSession.id, (session) => ({
          ...session,
          messages: [...session.messages, sessionMessage],
          updatedAt: new Date(),
        })),
      );
    },

    updateMessage: (id, content) => {
      set((state) => {
        const sessionId = Object.values(state.chatSessions).find((session) =>
          session.messages.some((message) => message.id === id),
        )?.id;

        if (!sessionId) {
          return {};
        }

        return updateSessionRecord(state, sessionId, (session) => ({
          ...session,
          messages: session.messages.map((message) =>
            message.id === id
              ? { ...message, content, isStreaming: false }
              : message,
          ),
          updatedAt: new Date(),
        }));
      });
    },

    setChatInput: (input) => {
      set({ chatInput: input });
    },

    setIsSending: (sending) => {
      set({ isSending: sending });
    },

    setRagConnectionStatus: (status) => {
      set({ ragConnectionStatus: status });
    },

    clearMessages: () => {
      set((state) => {
        const activeSession = getActiveSessionRecord(state);

        if (!activeSession) {
          return {};
        }

        const resetSession: ChatSessionRecord = {
          ...activeSession,
          messages: [
            {
              ...createChatSessionRecord(
                activeSession.mode,
                activeSession.context,
              ).messages[0],
              sessionId: activeSession.id,
              mode: activeSession.mode,
            },
          ],
          updatedAt: new Date(),
          lastUserMessage: null,
          lastError: null,
        };

        const sessions = {
          ...state.chatSessions,
          [resetSession.id]: resetSession,
        };

        return {
          ...syncActiveSession(state, sessions, state.activeChatSessionId),
          chatSessionOrder: sortSessionOrder(sessions),
          chatInput: "",
          isSending: false,
          isStreaming: false,
          streamingContent: "",
          currentStreamId: null,
          streamingMessageId: null,
          streamingError: null,
        };
      });
    },

    sendMessage: async (message, options) => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) {
        return;
      }

      ensureStreamListeners(() => get() as unknown as StreamAwareChatSlice);

      const state = get();
      const activeSession = getActiveSessionRecord(state);

      if (!activeSession) {
        return;
      }

      if (!options?.modelId) {
        const error = {
          code: "MODEL_REQUIRED",
          message: "LLMモデルが未選択です",
          retryable: false,
        };
        get().setStreamingError(error);
        return;
      }

      const userMessage: ChatMessage = {
        id: createChatEntityId("user"),
        role: "user",
        content: trimmedMessage,
        timestamp: new Date(),
        sessionId: activeSession.id,
        mode: activeSession.mode,
      };

      const placeholderMessage = buildPlaceholderMessage(
        activeSession.id,
        activeSession.mode,
      );

      const nextSession: ChatSessionRecord = {
        ...activeSession,
        messages: [...activeSession.messages, userMessage, placeholderMessage],
        updatedAt: new Date(),
        lastUserMessage: trimmedMessage,
        lastError: null,
      };

      const sessions = {
        ...state.chatSessions,
        [activeSession.id]: nextSession,
      };

      set({
        ...syncActiveSession(state, sessions, state.activeChatSessionId),
        chatSessionOrder: sortSessionOrder(sessions),
        chatInput: "",
        isSending: true,
        isStreaming: true,
        streamingContent: "",
        currentStreamId: null,
        streamingMessageId: placeholderMessage.id,
        streamingError: null,
      });

      try {
        const request: LLMChatRequest = {
          providerId: options.providerId ?? undefined,
          modelId: options.modelId,
          temperature: options.temperature ?? 1,
          maxTokens: options.maxTokens,
          stream: true,
          messages: buildRequestMessages(nextSession),
          systemPrompt:
            buildChatModeSystemPrompt(get().systemPrompt, nextSession) ??
            undefined,
        };

        const { requestId } = await startStreamRequest(request);
        get().startStreaming(requestId, placeholderMessage.id);
      } catch (error) {
        get().setStreamingError(
          (error as StreamingError).code
            ? (error as StreamingError)
            : createStreamStartError(error),
        );
      }
    },

    retryLastMessage: async (options) => {
      const activeSession = getActiveSessionRecord(get());

      if (!activeSession?.lastUserMessage) {
        return;
      }

      await get().sendMessage(activeSession.lastUserMessage, options);
    },

    activateChatMode: (mode, context = {}) => {
      const state = get();
      const existingSessionId = state.modeSessionIds[mode];

      if (existingSessionId && state.chatSessions[existingSessionId]) {
        const existingSession = state.chatSessions[existingSessionId];
        const mergedContext = mergeChatSessionContext(
          existingSession.context,
          context,
        );
        const updatedSession: ChatSessionRecord = {
          ...existingSession,
          context: mergedContext,
          title: buildChatSessionTitle(mode, mergedContext),
          updatedAt: new Date(),
        };

        const sessions = {
          ...state.chatSessions,
          [existingSessionId]: updatedSession,
        };

        set({
          ...syncActiveSession(state, sessions, existingSessionId),
          activeChatMode: mode,
          activeChatSessionId: existingSessionId,
          chatSessionOrder: sortSessionOrder(sessions),
          streamingError: null,
        });

        return existingSessionId;
      }

      const session = createChatSessionRecord(
        mode,
        createChatSessionContext(context),
      );
      const sessions = {
        ...state.chatSessions,
        [session.id]: session,
      };

      set({
        ...syncActiveSession(state, sessions, session.id),
        activeChatMode: mode,
        activeChatSessionId: session.id,
        chatSessionOrder: sortSessionOrder(sessions),
        modeSessionIds: {
          ...state.modeSessionIds,
          [mode]: session.id,
        },
        streamingError: null,
      });

      return session.id;
    },

    resumeChatSession: (sessionId) => {
      const state = get();
      const session = state.chatSessions[sessionId];

      if (!session) {
        return;
      }

      set({
        ...syncActiveSession(state, state.chatSessions, sessionId),
        activeChatSessionId: sessionId,
        activeChatMode: session.mode,
        streamingError: session.lastError,
      });
    },

    updateActiveChatContext: (context) => {
      set((state) => {
        const activeSession = getActiveSessionRecord(state);
        if (!activeSession) {
          return {};
        }

        return updateSessionRecord(state, activeSession.id, (session) => {
          const nextContext = mergeChatSessionContext(session.context, context);
          return {
            ...session,
            context: nextContext,
            title: buildChatSessionTitle(session.mode, nextContext),
            updatedAt: new Date(),
          };
        });
      });
    },

    // Streaming Actions
    startStreaming: (requestId, messageId) => {
      set((state) => {
        const activeSession = getActiveSessionRecord(state);
        if (!activeSession) {
          return {};
        }

        if (messageId) {
          return {
            currentStreamId: requestId,
            streamingMessageId: messageId,
            isStreaming: true,
            isSending: true,
            streamingError: null,
          };
        }

        const placeholderMessage = buildPlaceholderMessage(
          activeSession.id,
          activeSession.mode,
        );

        return {
          ...updateSessionRecord(state, activeSession.id, (session) => ({
            ...session,
            messages: [...session.messages, placeholderMessage],
            updatedAt: new Date(),
          })),
          currentStreamId: requestId,
          streamingMessageId: placeholderMessage.id,
          isStreaming: true,
          isSending: true,
          streamingError: null,
        };
      });
    },

    appendStreamChunk: (content) => {
      set((state) => {
        if (!state.streamingMessageId || !state.activeChatSessionId) {
          return {};
        }

        const newContent = state.streamingContent + content;

        return {
          ...updateSessionRecord(
            state,
            state.activeChatSessionId,
            (session) => ({
              ...session,
              messages: session.messages.map((message) =>
                message.id === state.streamingMessageId
                  ? { ...message, content: newContent }
                  : message,
              ),
              updatedAt: new Date(),
            }),
          ),
          streamingContent: newContent,
        };
      });
    },

    endStreaming: () => {
      set((state) => {
        if (!state.streamingMessageId || !state.activeChatSessionId) {
          return {
            isSending: false,
            isStreaming: false,
            currentStreamId: null,
            streamingMessageId: null,
            streamingContent: "",
          };
        }

        return {
          ...updateSessionRecord(
            state,
            state.activeChatSessionId,
            (session) => ({
              ...session,
              messages: session.messages.map((message) =>
                message.id === state.streamingMessageId
                  ? { ...message, isStreaming: false }
                  : message,
              ),
              updatedAt: new Date(),
              lastError: null,
            }),
          ),
          isSending: false,
          isStreaming: false,
          currentStreamId: null,
          streamingMessageId: null,
          streamingContent: "",
          streamingError: null,
        };
      });
    },

    cancelStreaming: () => {
      set((state) => {
        if (!state.streamingMessageId || !state.activeChatSessionId) {
          return {
            isSending: false,
            isStreaming: false,
            currentStreamId: null,
            streamingMessageId: null,
            streamingContent: "",
          };
        }

        return {
          ...updateSessionRecord(
            state,
            state.activeChatSessionId,
            (session) => ({
              ...session,
              messages: session.messages.map((message) =>
                message.id === state.streamingMessageId
                  ? {
                      ...message,
                      isStreaming: false,
                      content:
                        message.content || "[ストリーミングを中断しました]",
                    }
                  : message,
              ),
              updatedAt: new Date(),
            }),
          ),
          isSending: false,
          isStreaming: false,
          currentStreamId: null,
          streamingMessageId: null,
          streamingContent: "",
        };
      });
    },

    abortStreaming: async () => {
      const requestId = get().currentStreamId;

      if (
        requestId &&
        typeof window !== "undefined" &&
        window.electronAPI?.llm?.cancelStream
      ) {
        try {
          await window.electronAPI.llm.cancelStream(requestId);
        } catch (error) {
          console.error("Failed to cancel stream:", error);
        }
      }

      get().cancelStreaming();
    },

    setStreamingError: (error) => {
      set((state) => {
        const activeSession = getActiveSessionRecord(state);
        if (!activeSession) {
          return {
            isSending: false,
            isStreaming: false,
            currentStreamId: null,
            streamingError: error,
          };
        }

        const placeholderMessageId = state.streamingMessageId;

        return {
          ...updateSessionRecord(state, activeSession.id, (session) => ({
            ...session,
            messages: session.messages.map((message) =>
              message.id === placeholderMessageId
                ? {
                    ...message,
                    isStreaming: false,
                    content:
                      message.content ||
                      `応答の生成に失敗しました: ${error.message}`,
                    errorCode: error.code,
                    retryable: error.retryable,
                  }
                : message,
            ),
            updatedAt: new Date(),
            lastError: error,
          })),
          isSending: false,
          isStreaming: false,
          currentStreamId: null,
          streamingMessageId: null,
          streamingContent: "",
          streamingError: error,
        };
      });
    },

    // System Prompt Actions
    setSystemPrompt: (prompt) => {
      set({
        systemPrompt: prompt,
        systemPromptUpdatedAt: new Date(),
      });
    },

    clearSystemPrompt: () => {
      set({
        systemPrompt: "",
        systemPromptUpdatedAt: null,
      });
    },

    applyTemplate: (templateId, content) => {
      set({
        systemPrompt: content,
        systemPromptUpdatedAt: new Date(),
        selectedTemplateId: templateId,
      });
    },

    clearTemplateSelection: () => {
      set({ selectedTemplateId: null });
    },
  };
};
