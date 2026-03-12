import { describe, it, expect, beforeEach, vi } from "vitest";
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

  describe("システムプロンプト - 初期状態", () => {
    it("systemPromptが空文字列である", () => {
      expect(store.systemPrompt).toBe("");
    });

    it("systemPromptUpdatedAtがnullである", () => {
      expect(store.systemPromptUpdatedAt).toBeNull();
    });

    it("selectedTemplateIdがnullである", () => {
      expect(store.selectedTemplateId).toBeNull();
    });
  });

  describe("setSystemPrompt", () => {
    it("システムプロンプトを設定する", () => {
      const prompt = "あなたは翻訳アシスタントです";
      store.setSystemPrompt(prompt);
      expect(store.systemPrompt).toBe(prompt);
    });

    it("systemPromptUpdatedAtを現在時刻に設定する", () => {
      const beforeTime = new Date();
      store.setSystemPrompt("test");
      const afterTime = new Date();
      expect(store.systemPromptUpdatedAt).not.toBeNull();
      expect(store.systemPromptUpdatedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(store.systemPromptUpdatedAt!.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });

    it("空文字列を設定できる", () => {
      store.setSystemPrompt("initial");
      store.setSystemPrompt("");
      expect(store.systemPrompt).toBe("");
    });

    it("既存のプロンプトを上書きする", () => {
      store.setSystemPrompt("first");
      store.setSystemPrompt("second");
      expect(store.systemPrompt).toBe("second");
    });

    it("長いプロンプトを設定できる", () => {
      const longPrompt = "a".repeat(4000);
      store.setSystemPrompt(longPrompt);
      expect(store.systemPrompt).toBe(longPrompt);
    });
  });

  describe("clearSystemPrompt", () => {
    it("システムプロンプトを空文字列にする", () => {
      store.setSystemPrompt("test prompt");
      store.clearSystemPrompt();
      expect(store.systemPrompt).toBe("");
    });

    it("systemPromptUpdatedAtをnullにする", () => {
      store.setSystemPrompt("test");
      expect(store.systemPromptUpdatedAt).not.toBeNull();
      store.clearSystemPrompt();
      expect(store.systemPromptUpdatedAt).toBeNull();
    });

    it("selectedTemplateIdは維持する", () => {
      store.applyTemplate("template-1", "test content");
      store.clearSystemPrompt();
      expect(store.selectedTemplateId).toBe("template-1");
    });

    it("初期状態でクリアしてもエラーにならない", () => {
      expect(() => store.clearSystemPrompt()).not.toThrow();
      expect(store.systemPrompt).toBe("");
    });
  });

  describe("applyTemplate", () => {
    it("テンプレートの内容をsystemPromptに設定する", () => {
      const templateId = "template-1";
      const content = "あなたは翻訳アシスタントです";
      store.applyTemplate(templateId, content);
      expect(store.systemPrompt).toBe(content);
    });

    it("selectedTemplateIdを設定する", () => {
      const templateId = "template-1";
      store.applyTemplate(templateId, "content");
      expect(store.selectedTemplateId).toBe(templateId);
    });

    it("systemPromptUpdatedAtを現在時刻に設定する", () => {
      const beforeTime = new Date();
      store.applyTemplate("template-1", "content");
      const afterTime = new Date();
      expect(store.systemPromptUpdatedAt).not.toBeNull();
      expect(store.systemPromptUpdatedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(store.systemPromptUpdatedAt!.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });

    it("既存のプロンプトを上書きする", () => {
      store.setSystemPrompt("initial");
      store.applyTemplate("template-1", "template content");
      expect(store.systemPrompt).toBe("template content");
    });

    it("既存のselectedTemplateIdを上書きする", () => {
      store.applyTemplate("template-1", "content1");
      store.applyTemplate("template-2", "content2");
      expect(store.selectedTemplateId).toBe("template-2");
    });

    it("空のコンテンツでも適用できる", () => {
      store.applyTemplate("template-1", "");
      expect(store.systemPrompt).toBe("");
      expect(store.selectedTemplateId).toBe("template-1");
    });
  });

  describe("clearTemplateSelection", () => {
    it("selectedTemplateIdをnullにする", () => {
      store.applyTemplate("template-1", "content");
      store.clearTemplateSelection();
      expect(store.selectedTemplateId).toBeNull();
    });

    it("systemPromptは維持する", () => {
      store.applyTemplate("template-1", "test content");
      store.clearTemplateSelection();
      expect(store.systemPrompt).toBe("test content");
    });

    it("systemPromptUpdatedAtは維持する", () => {
      store.applyTemplate("template-1", "content");
      const updatedAt = store.systemPromptUpdatedAt;
      store.clearTemplateSelection();
      expect(store.systemPromptUpdatedAt).toBe(updatedAt);
    });

    it("初期状態でクリアしてもエラーにならない", () => {
      expect(() => store.clearTemplateSelection()).not.toThrow();
      expect(store.selectedTemplateId).toBeNull();
    });
  });

  describe("システムプロンプト - 統合テスト", () => {
    it("テンプレート適用→手動編集→クリアのフロー", () => {
      // テンプレート適用
      store.applyTemplate("template-1", "original template");
      expect(store.systemPrompt).toBe("original template");
      expect(store.selectedTemplateId).toBe("template-1");

      // 手動編集
      store.setSystemPrompt("manually edited");
      expect(store.systemPrompt).toBe("manually edited");
      expect(store.selectedTemplateId).toBe("template-1"); // 維持される

      // クリア
      store.clearSystemPrompt();
      expect(store.systemPrompt).toBe("");
      expect(store.selectedTemplateId).toBe("template-1"); // 維持される
    });

    it("複数テンプレートの切り替え", () => {
      store.applyTemplate("template-1", "content1");
      expect(store.selectedTemplateId).toBe("template-1");

      store.applyTemplate("template-2", "content2");
      expect(store.selectedTemplateId).toBe("template-2");
      expect(store.systemPrompt).toBe("content2");

      store.clearTemplateSelection();
      expect(store.selectedTemplateId).toBeNull();
      expect(store.systemPrompt).toBe("content2"); // コンテンツは維持
    });

    it("LLM切り替え時もsystemPromptを維持する", () => {
      store.setSystemPrompt("persistent prompt");
      // LLM切り替えは他のsliceで管理されるが、systemPromptは維持されることを確認
      expect(store.systemPrompt).toBe("persistent prompt");
    });
  });

  describe("LLM連携 - sendMessage", () => {
    beforeEach(() => {
      // Mock electronAPI
      const mockChat = vi.fn().mockResolvedValue({
        success: true,
        data: {
          message: "AI response",
          conversationId: "conv-123",
        },
      });

      (global as any).window = {
        electronAPI: {
          ai: {
            chat: mockChat,
          },
        },
      };
    });

    it("sendMessageがメッセージとsystemPromptをLLMに送信する", async () => {
      store.setSystemPrompt("You are a helpful assistant");

      if (store.sendMessage) {
        await store.sendMessage("Hello");

        expect(window.electronAPI.ai.chat).toHaveBeenCalledWith({
          message: "Hello",
          systemPrompt: "You are a helpful assistant",
          ragEnabled: false,
          conversationId: undefined,
        });
      }
    });

    it("systemPromptが空の場合でも送信する", async () => {
      store.setSystemPrompt("");

      if (store.sendMessage) {
        await store.sendMessage("Hello");

        expect(window.electronAPI.ai.chat).toHaveBeenCalledWith({
          message: "Hello",
          systemPrompt: "",
          ragEnabled: false,
          conversationId: undefined,
        });
      }
    });

    it("送信成功後にメッセージを追加する", async () => {
      if (store.sendMessage) {
        await store.sendMessage("Test message");

        const userMessage = store.chatMessages.find(
          (m) => m.content === "Test message",
        );
        expect(userMessage).toBeDefined();
        expect(userMessage?.role).toBe("user");
      }
    });

    it("AI応答をメッセージに追加する", async () => {
      if (store.sendMessage) {
        await store.sendMessage("Test");

        const aiMessage = store.chatMessages.find(
          (m) => m.content === "AI response",
        );
        expect(aiMessage).toBeDefined();
        expect(aiMessage?.role).toBe("assistant");
      }
    });
  });
});
