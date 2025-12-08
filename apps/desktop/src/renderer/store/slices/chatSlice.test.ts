import { describe, it, expect, beforeEach } from "vitest";
import { createChatSlice, type ChatSlice } from "./chatSlice";
import type { ChatMessage } from "../types";

describe("chatSlice", () => {
  let store: ChatSlice;
  let mockSet: (
    fn: ((state: ChatSlice) => Partial<ChatSlice>) | Partial<ChatSlice>,
  ) => void;

  beforeEach(() => {
    const state: Partial<ChatSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<ChatSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createChatSlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );
  });

  const mockMessage: ChatMessage = {
    id: "msg-1",
    role: "user",
    content: "Hello",
    timestamp: new Date("2024-01-15T10:00:00"),
  };

  describe("初期状態", () => {
    it("chatMessagesにウェルカムメッセージが含まれる", () => {
      expect(store.chatMessages).toHaveLength(1);
      expect(store.chatMessages[0].role).toBe("assistant");
      expect(store.chatMessages[0].id).toBe("welcome");
    });

    it("chatInputが空文字列である", () => {
      expect(store.chatInput).toBe("");
    });

    it("isSendingがfalseである", () => {
      expect(store.isSending).toBe(false);
    });

    it("ragConnectionStatusがdisconnectedである", () => {
      expect(store.ragConnectionStatus).toBe("disconnected");
    });
  });

  describe("addMessage", () => {
    it("メッセージを追加する", () => {
      store.addMessage(mockMessage);
      expect(store.chatMessages).toHaveLength(2);
      expect(store.chatMessages[1]).toEqual(mockMessage);
    });

    it("複数のメッセージを追加できる", () => {
      const message2: ChatMessage = {
        ...mockMessage,
        id: "msg-2",
        content: "World",
      };
      store.addMessage(mockMessage);
      store.addMessage(message2);
      expect(store.chatMessages).toHaveLength(3);
    });
  });

  describe("updateMessage", () => {
    it("既存メッセージの内容を更新する", () => {
      store.addMessage(mockMessage);
      store.updateMessage("msg-1", "Updated content");
      const updated = store.chatMessages.find((m) => m.id === "msg-1");
      expect(updated?.content).toBe("Updated content");
    });

    it("isStreamingをfalseに設定する", () => {
      const streamingMessage: ChatMessage = {
        ...mockMessage,
        isStreaming: true,
      };
      store.addMessage(streamingMessage);
      store.updateMessage("msg-1", "Complete content");
      const updated = store.chatMessages.find((m) => m.id === "msg-1");
      expect(updated?.isStreaming).toBe(false);
    });

    it("存在しないIDでは何も変更しない", () => {
      store.updateMessage("nonexistent", "Content");
      expect(store.chatMessages).toHaveLength(1);
    });
  });

  describe("setChatInput", () => {
    it("入力値を設定する", () => {
      store.setChatInput("test input");
      expect(store.chatInput).toBe("test input");
    });

    it("空文字列を設定できる", () => {
      store.setChatInput("test");
      store.setChatInput("");
      expect(store.chatInput).toBe("");
    });
  });

  describe("setIsSending", () => {
    it("送信状態をtrueに設定する", () => {
      store.setIsSending(true);
      expect(store.isSending).toBe(true);
    });

    it("送信状態をfalseに設定する", () => {
      store.setIsSending(true);
      store.setIsSending(false);
      expect(store.isSending).toBe(false);
    });
  });

  describe("setRagConnectionStatus", () => {
    it("接続状態をconnectedに設定する", () => {
      store.setRagConnectionStatus("connected");
      expect(store.ragConnectionStatus).toBe("connected");
    });

    it("接続状態をerrorに設定する", () => {
      store.setRagConnectionStatus("error");
      expect(store.ragConnectionStatus).toBe("error");
    });

    it("接続状態をdisconnectedに設定する", () => {
      store.setRagConnectionStatus("connected");
      store.setRagConnectionStatus("disconnected");
      expect(store.ragConnectionStatus).toBe("disconnected");
    });
  });

  describe("clearMessages", () => {
    it("メッセージをクリアしてウェルカムメッセージのみにする", () => {
      store.addMessage(mockMessage);
      store.addMessage({ ...mockMessage, id: "msg-2" });
      store.clearMessages();
      expect(store.chatMessages).toHaveLength(1);
      expect(store.chatMessages[0].id).toBe("welcome");
    });
  });
});
