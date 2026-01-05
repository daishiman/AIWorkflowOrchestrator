import { StateCreator } from "zustand";
import type { ChatMessage, RagConnectionStatus } from "../types";

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

export interface ChatSlice {
  // State
  chatMessages: ChatMessage[];
  chatInput: string;
  isSending: boolean;
  ragConnectionStatus: RagConnectionStatus;

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

  sendMessage: async (message) => {
    const state = get();

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
