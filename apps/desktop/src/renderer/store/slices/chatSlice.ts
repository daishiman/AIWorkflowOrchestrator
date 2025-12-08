import { StateCreator } from "zustand";
import type { ChatMessage, RagConnectionStatus } from "../types";

export interface ChatSlice {
  // State
  chatMessages: ChatMessage[];
  chatInput: string;
  isSending: boolean;
  ragConnectionStatus: RagConnectionStatus;

  // Actions
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, content: string) => void;
  setChatInput: (input: string) => void;
  setIsSending: (sending: boolean) => void;
  setRagConnectionStatus: (status: RagConnectionStatus) => void;
  clearMessages: () => void;
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
) => ({
  // Initial state
  chatMessages: [initialMessage],
  chatInput: "",
  isSending: false,
  ragConnectionStatus: "disconnected",

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
});
