import { StateCreator } from "zustand";
import type { ChatMessage, RagConnectionStatus } from "../types";
import type { LLMProviderId } from "@repo/shared/types/llm/schemas";
import type { AccessCapability } from "@repo/shared/types";

// ============================================
// ChatPanel Status & Capability Types
// ============================================

/**
 * ChatPanel の 8 状態
 * idle → ready → streaming → completed/cancelled/error
 * blocked: provider/model 未選択 or API key 未設定
 * handoff: terminal surface のみ利用可能
 */
export type ChatPanelStatus =
  | "idle"
  | "ready"
  | "streaming"
  | "cancelled"
  | "completed"
  | "error"
  | "blocked"
  | "handoff";

// AccessCapability は @repo/shared/types/execution-capability から re-export
export type { AccessCapability } from "@repo/shared/types";

// ============================================
// Helper Functions
// ============================================

/**
 * ユーザーメッセージを作成
 */
function createUserMessage(content: string): ChatMessage {
  return {
    id: `user-${Date.now()}`,
    role: "user",
    content,
    timestamp: new Date(),
  };
}

/**
 * AIメッセージを作成
 */
function createAIMessage(content: string): ChatMessage {
  return {
    id: `ai-${Date.now()}`,
    role: "assistant",
    content,
    timestamp: new Date(),
  };
}

/**
 * LLM APIを呼び出す
 */
async function callLLMAPI(
  message: string,
  systemPrompt: string,
  ragEnabled: boolean,
  selectedProviderId?: LLMProviderId | null,
  selectedModelId?: string | null,
): Promise<{ success: boolean; message?: string }> {
  if (typeof window === "undefined" || !window.electronAPI?.ai?.chat) {
    return { success: false };
  }

  try {
    const response = await window.electronAPI.ai.chat({
      message,
      systemPrompt,
      ragEnabled,
      conversationId: undefined,
      ...(selectedProviderId && selectedModelId
        ? {
            providerId: selectedProviderId,
            modelId: selectedModelId,
          }
        : {}),
    });

    if (response.success && response.data) {
      return { success: true, message: response.data.message };
    }

    return { success: false };
  } catch (error) {
    console.error("Failed to call LLM API:", error);
    return { success: false };
  }
}

// ============================================
// Types
// ============================================

/**
 * ストリーミングエラー情報
 */
export interface StreamingError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ChatSlice {
  // State
  chatMessages: ChatMessage[];
  chatInput: string;
  isSending: boolean;
  ragConnectionStatus: RagConnectionStatus;

  // ChatPanel Status State
  chatPanelStatus: ChatPanelStatus;
  resolvedCapability: AccessCapability;
  currentConversationId: string | null;

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
  sendMessage: (message: string) => Promise<void>;

  // ChatPanel Status Actions
  setChatPanelStatus: (status: ChatPanelStatus) => void;
  setResolvedCapability: (capability: AccessCapability) => void;
  setCurrentConversationId: (id: string | null) => void;
  resetChat: () => void;

  // Streaming Actions
  startStreaming: (requestId: string) => void;
  appendStreamChunk: (content: string) => void;
  endStreaming: () => void;
  cancelStreaming: () => void;
  setStreamingError: (error: StreamingError) => void;

  // System Prompt Actions
  setSystemPrompt: (prompt: string) => void;
  clearSystemPrompt: () => void;
  applyTemplate: (templateId: string, content: string) => void;
  clearTemplateSelection: () => void;
}

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "こんにちは！Knowledge Studioへようこそ。ナレッジベースについて何でもお聞きください。",
  timestamp: new Date(),
};

export const createChatSlice: StateCreator<ChatSlice, [], [], ChatSlice> = (
  set,
  get,
) => ({
  // Initial state
  chatMessages: [initialMessage],
  chatInput: "",
  isSending: false,
  ragConnectionStatus: "disconnected",

  // ChatPanel Status Initial State
  chatPanelStatus: "idle",
  resolvedCapability: "none",
  currentConversationId: null,

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
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    }));
  },

  updateMessage: (id, content) => {
    set((state) => ({
      chatMessages: state.chatMessages.map((msg) =>
        msg.id === id ? { ...msg, content, isStreaming: false } : msg,
      ),
    }));
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
    set({ chatMessages: [initialMessage] });
  },

  // ChatPanel Status Actions
  setChatPanelStatus: (status: ChatPanelStatus) => {
    set({ chatPanelStatus: status });
  },

  setResolvedCapability: (capability: AccessCapability) => {
    set({ resolvedCapability: capability });
  },

  setCurrentConversationId: (id: string | null) => {
    set({ currentConversationId: id });
  },

  resetChat: () => {
    set({
      chatMessages: [initialMessage],
      chatInput: "",
      isSending: false,
      isStreaming: false,
      streamingContent: "",
      currentStreamId: null,
      streamingMessageId: null,
      streamingError: null,
      chatPanelStatus: "idle",
      currentConversationId: null,
    });
  },

  sendMessage: async (message) => {
    const state = get();
    const selectedProviderId = (
      state as ChatSlice & { selectedProviderId?: LLMProviderId | null }
    ).selectedProviderId;
    const selectedModelId = (
      state as ChatSlice & { selectedModelId?: string | null }
    ).selectedModelId;

    // Add user message immediately
    const userMessage = createUserMessage(message);
    set((state) => ({
      chatMessages: [...state.chatMessages, userMessage],
      isSending: true,
    }));

    // Call LLM API
    const response = await callLLMAPI(
      message,
      state.systemPrompt,
      state.ragConnectionStatus === "connected",
      selectedProviderId,
      selectedModelId,
    );

    // Handle response
    if (response.success && response.message) {
      const aiMessage = createAIMessage(response.message);
      set((state) => ({
        chatMessages: [...state.chatMessages, aiMessage],
        isSending: false,
      }));
    } else {
      set({ isSending: false });
    }
  },

  // Streaming Actions
  startStreaming: (requestId: string) => {
    // Create a placeholder streaming message
    const streamingMessageId = `streaming-${Date.now()}`;
    const streamingMessage: ChatMessage = {
      id: streamingMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    set((state) => ({
      isStreaming: true,
      streamingContent: "",
      currentStreamId: requestId,
      streamingMessageId,
      streamingError: null,
      chatMessages: [...state.chatMessages, streamingMessage],
    }));
  },

  appendStreamChunk: (content: string) => {
    const state = get();
    const newContent = state.streamingContent + content;

    set((state) => ({
      streamingContent: newContent,
      chatMessages: state.chatMessages.map((msg) =>
        msg.id === state.streamingMessageId
          ? { ...msg, content: newContent }
          : msg,
      ),
    }));
  },

  endStreaming: () => {
    set((state) => ({
      isStreaming: false,
      currentStreamId: null,
      chatMessages: state.chatMessages.map((msg) =>
        msg.id === state.streamingMessageId
          ? { ...msg, isStreaming: false }
          : msg,
      ),
    }));
  },

  cancelStreaming: () => {
    // Optionally remove incomplete message or keep it
    set((state) => ({
      isStreaming: false,
      currentStreamId: null,
      streamingContent: "",
      chatMessages: state.chatMessages.map((msg) =>
        msg.id === state.streamingMessageId
          ? {
              ...msg,
              isStreaming: false,
              content: msg.content + " [キャンセル]",
            }
          : msg,
      ),
    }));
  },

  setStreamingError: (error) => {
    set((state) => ({
      isStreaming: false,
      currentStreamId: null,
      streamingError: error,
      chatMessages: state.chatMessages.map((msg) =>
        msg.id === state.streamingMessageId
          ? { ...msg, isStreaming: false }
          : msg,
      ),
    }));
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
});
