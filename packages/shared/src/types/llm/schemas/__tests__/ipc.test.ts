/**
 * @file IPC関連Zodスキーマのテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @feature chat-multi-llm-switching
 */

import { describe, it, expect } from "vitest";
import { IPCChatRequestSchema, type IPCChatRequest } from "../ipc";

// =============================================================================
// IPCChatRequestSchema
// =============================================================================

describe("IPCChatRequestSchema", () => {
  describe("有効なIPCリクエスト", () => {
    it("最小構成のリクエスト", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello, how are you?",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("履歴付きのリクエスト", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "How are you?",
        history: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there!" },
        ],
        providerId: "anthropic",
        modelId: "claude-3-opus",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("全オプション指定のリクエスト", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Summarize this document",
        history: [],
        providerId: "google",
        modelId: "gemini-pro",
        systemPrompt: "You are a document summarizer.",
        ragEnabled: true,
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("各プロバイダーIDでリクエスト可能", () => {
      const providers = ["openai", "anthropic", "google", "xai"] as const;
      providers.forEach((providerId) => {
        const input = {
          conversationId: "550e8400-e29b-41d4-a716-446655440000",
          message: "Test",
          history: [],
          providerId,
          modelId: "test-model",
        };
        const result = IPCChatRequestSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("無効なIPCリクエスト", () => {
    it("無効なUUID", () => {
      const input = {
        conversationId: "not-a-valid-uuid",
        message: "Hello",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("空のmessage", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("無効なproviderId", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [],
        providerId: "invalid-provider",
        modelId: "gpt-4o",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("空のmodelId", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [],
        providerId: "openai",
        modelId: "",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("無効な履歴メッセージ", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [{ role: "invalid-role", content: "Test" }],
        providerId: "openai",
        modelId: "gpt-4o",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("必須フィールドの欠落（conversationId）", () => {
      const input = {
        message: "Hello",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("必須フィールドの欠落（message）", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("デフォルト値", () => {
    it("ragEnabledのデフォルト値", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ragEnabled).toBe(false);
      }
    });
  });

  describe("境界値テスト", () => {
    it("長いmessageを受け入れること", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "a".repeat(100000),
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("長い履歴を受け入れること", () => {
      const history = Array.from({ length: 100 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `Message ${i}`,
      }));
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Continue",
        history,
        providerId: "openai",
        modelId: "gpt-4o",
      };
      const result = IPCChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("型推論", () => {
    it("推論された型がIPCChatRequestであること", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [] as Array<{
          role: "user" | "assistant" | "system";
          content: string;
        }>,
        providerId: "openai" as const,
        modelId: "gpt-4o",
      };
      const parsed = IPCChatRequestSchema.parse(input);
      const _typeCheck: IPCChatRequest = parsed;
      expect(_typeCheck.providerId).toBe("openai");
    });
  });
});
