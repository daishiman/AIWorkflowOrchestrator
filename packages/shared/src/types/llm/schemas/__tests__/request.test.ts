/**
 * @file LLMリクエスト関連Zodスキーマのテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @testIds TS-003
 * @feature chat-multi-llm-switching
 */

import { describe, it, expect } from "vitest";
import {
  MessageRoleSchema,
  LLMMessageSchema,
  LLMChatRequestSchema,
  type LLMMessage,
  type LLMChatRequest,
} from "../request";

// =============================================================================
// MessageRoleSchema
// =============================================================================

describe("MessageRoleSchema", () => {
  describe("有効なロール", () => {
    it("userを受け入れること", () => {
      const result = MessageRoleSchema.safeParse("user");
      expect(result.success).toBe(true);
    });

    it("assistantを受け入れること", () => {
      const result = MessageRoleSchema.safeParse("assistant");
      expect(result.success).toBe(true);
    });

    it("systemを受け入れること", () => {
      const result = MessageRoleSchema.safeParse("system");
      expect(result.success).toBe(true);
    });
  });

  describe("無効なロール", () => {
    it("未定義のロールを拒否すること", () => {
      const result = MessageRoleSchema.safeParse("admin");
      expect(result.success).toBe(false);
    });

    it("空文字列を拒否すること", () => {
      const result = MessageRoleSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("大文字のロールを拒否すること", () => {
      const result = MessageRoleSchema.safeParse("USER");
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// LLMMessageSchema
// =============================================================================

describe("LLMMessageSchema", () => {
  describe("有効なメッセージ", () => {
    it("userメッセージを受け入れること", () => {
      const input = { role: "user", content: "Hello, how are you?" };
      const result = LLMMessageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("assistantメッセージを受け入れること", () => {
      const input = { role: "assistant", content: "I'm fine, thank you!" };
      const result = LLMMessageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("systemメッセージを受け入れること", () => {
      const input = { role: "system", content: "You are a helpful assistant." };
      const result = LLMMessageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("空のcontentを受け入れること", () => {
      const input = { role: "user", content: "" };
      const result = LLMMessageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("長いcontentを受け入れること", () => {
      const input = { role: "user", content: "a".repeat(100000) };
      const result = LLMMessageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("無効なメッセージ", () => {
    it("roleがない場合に拒否すること", () => {
      const input = { content: "Hello" };
      const result = LLMMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("contentがない場合に拒否すること", () => {
      const input = { role: "user" };
      const result = LLMMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("無効なroleを拒否すること", () => {
      const input = { role: "invalid", content: "Hello" };
      const result = LLMMessageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("型推論", () => {
    it("推論された型がLLMMessageであること", () => {
      const input = { role: "user" as const, content: "Hello" };
      const parsed = LLMMessageSchema.parse(input);
      const _typeCheck: LLMMessage = parsed;
      expect(_typeCheck.role).toBe("user");
    });
  });
});

// =============================================================================
// TS-003: LLMChatRequestSchema
// =============================================================================

describe("LLMChatRequestSchema", () => {
  describe("TS-003-01〜02: 有効なリクエスト", () => {
    it("TS-003-01: 有効な最小リクエスト", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("TS-003-02: 全オプション指定", () => {
      const input = {
        messages: [
          { role: "system", content: "You are helpful." },
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there!" },
          { role: "user", content: "How are you?" },
        ],
        modelId: "gpt-4o",
        systemPrompt: "You are a helpful assistant.",
        temperature: 0.7,
        maxTokens: 2048,
        stream: true,
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("TS-003-03: 空のmessages配列", () => {
    it("空のmessages配列を受け入れること", () => {
      const input = {
        messages: [],
        modelId: "gpt-4o",
      };
      const result = LLMChatRequestSchema.safeParse(input);
      // Note: 仕様では空配列を許容（システムプロンプトのみの場合など）
      expect(result.success).toBe(true);
    });
  });

  describe("TS-003-04〜07: 無効なリクエスト", () => {
    it("TS-003-04: modelIdが空文字", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "",
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("TS-003-05: temperatureが範囲外（負）", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
        temperature: -0.1,
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("TS-003-06: temperatureが範囲外（超過）", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
        temperature: 2.1,
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("TS-003-07: maxTokensが負数", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
        maxTokens: -1,
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("maxTokensが0", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
        maxTokens: 0,
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("maxTokensが小数", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
        maxTokens: 100.5,
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("TS-003-08: デフォルト値", () => {
    it("streamのデフォルト値", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stream).toBe(false);
      }
    });

    it("temperatureのデフォルト値", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.temperature).toBe(1.0);
      }
    });
  });

  describe("境界値テスト", () => {
    it("temperature=0を受け入れること", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
        temperature: 0,
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("temperature=2を受け入れること", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
        temperature: 2,
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("maxTokens=1を受け入れること", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
        maxTokens: 1,
      };
      const result = LLMChatRequestSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("型推論", () => {
    it("推論された型がLLMChatRequestであること", () => {
      const input = {
        messages: [{ role: "user" as const, content: "Hello" }],
        modelId: "gpt-4o",
      };
      const parsed = LLMChatRequestSchema.parse(input);
      const _typeCheck: LLMChatRequest = parsed;
      expect(_typeCheck.modelId).toBe("gpt-4o");
    });
  });
});
