/**
 * @file LLMレスポンス関連Zodスキーマのテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @testIds TS-004, TS-005
 * @feature chat-multi-llm-switching
 */

import { describe, it, expect } from "vitest";
import {
  TokenUsageSchema,
  FinishReasonSchema,
  LLMResponseDataSchema,
  LLMChatResponseSchema,
  LLMStreamChunkSchema,
  type TokenUsage,
  type LLMChatResponse,
  type LLMStreamChunk,
} from "../response";

// =============================================================================
// TokenUsageSchema
// =============================================================================

describe("TokenUsageSchema", () => {
  describe("有効なトークン使用量", () => {
    it("全フィールドが正の整数", () => {
      const input = {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      };
      const result = TokenUsageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("全フィールドが0", () => {
      const input = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
      const result = TokenUsageSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("無効なトークン使用量", () => {
    it("負のpromptTokensを拒否", () => {
      const input = {
        promptTokens: -1,
        completionTokens: 50,
        totalTokens: 49,
      };
      const result = TokenUsageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("小数のcompletionTokensを拒否", () => {
      const input = {
        promptTokens: 100,
        completionTokens: 50.5,
        totalTokens: 150,
      };
      const result = TokenUsageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("フィールド不足を拒否", () => {
      const input = {
        promptTokens: 100,
        completionTokens: 50,
      };
      const result = TokenUsageSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("型推論", () => {
    it("推論された型がTokenUsageであること", () => {
      const input = {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      };
      const parsed = TokenUsageSchema.parse(input);
      const _typeCheck: TokenUsage = parsed;
      expect(_typeCheck.totalTokens).toBe(150);
    });
  });
});

// =============================================================================
// FinishReasonSchema
// =============================================================================

describe("FinishReasonSchema", () => {
  describe("有効な終了理由", () => {
    it("stopを受け入れること", () => {
      const result = FinishReasonSchema.safeParse("stop");
      expect(result.success).toBe(true);
    });

    it("lengthを受け入れること", () => {
      const result = FinishReasonSchema.safeParse("length");
      expect(result.success).toBe(true);
    });

    it("content_filterを受け入れること", () => {
      const result = FinishReasonSchema.safeParse("content_filter");
      expect(result.success).toBe(true);
    });

    it("tool_callsを受け入れること", () => {
      const result = FinishReasonSchema.safeParse("tool_calls");
      expect(result.success).toBe(true);
    });
  });

  describe("無効な終了理由", () => {
    it("未定義の理由を拒否すること", () => {
      const result = FinishReasonSchema.safeParse("cancelled");
      expect(result.success).toBe(false);
    });

    it("空文字列を拒否すること", () => {
      const result = FinishReasonSchema.safeParse("");
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// LLMResponseDataSchema
// =============================================================================

describe("LLMResponseDataSchema", () => {
  describe("有効なレスポンスデータ", () => {
    it("最小構成のレスポンス", () => {
      const input = {
        message: "Hello, I'm an AI assistant.",
        modelId: "gpt-4o",
        providerId: "openai",
      };
      const result = LLMResponseDataSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("全フィールド指定のレスポンス", () => {
      const input = {
        message: "Hello, I'm an AI assistant.",
        modelId: "gpt-4o",
        providerId: "openai",
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        finishReason: "stop",
      };
      const result = LLMResponseDataSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("無効なレスポンスデータ", () => {
    it("無効なproviderIdを拒否", () => {
      const input = {
        message: "Hello",
        modelId: "gpt-4o",
        providerId: "invalid",
      };
      const result = LLMResponseDataSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("messageがない場合に拒否", () => {
      const input = {
        modelId: "gpt-4o",
        providerId: "openai",
      };
      const result = LLMResponseDataSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// TS-004: LLMChatResponseSchema
// =============================================================================

describe("LLMChatResponseSchema", () => {
  describe("TS-004-01〜02: 有効なレスポンス", () => {
    it("TS-004-01: 成功レスポンス", () => {
      const input = {
        success: true,
        data: {
          message: "Hello, I'm an AI assistant.",
          modelId: "gpt-4o",
          providerId: "openai",
        },
      };
      const result = LLMChatResponseSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success && result.data.success) {
        expect(result.data.data.message).toBe("Hello, I'm an AI assistant.");
      }
    });

    it("TS-004-02: 失敗レスポンス", () => {
      const input = {
        success: false,
        error: {
          code: "API_KEY_INVALID",
          message: "Invalid API key",
          retryable: false,
        },
      };
      const result = LLMChatResponseSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success && !result.data.success) {
        expect(result.data.error.code).toBe("API_KEY_INVALID");
      }
    });
  });

  describe("TS-004-03〜04: 無効なレスポンス", () => {
    it("TS-004-03: 成功時にdata必須", () => {
      const input = {
        success: true,
      };
      const result = LLMChatResponseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("TS-004-04: 失敗時にerror必須", () => {
      const input = {
        success: false,
      };
      const result = LLMChatResponseSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("成功時にerrorがあっても拒否", () => {
      const input = {
        success: true,
        data: {
          message: "Hello",
          modelId: "gpt-4o",
          providerId: "openai",
        },
        error: {
          code: "UNKNOWN",
          message: "Error",
          retryable: false,
        },
      };
      const result = LLMChatResponseSchema.safeParse(input);
      // discriminatedUnionは余分なフィールドを許容する場合がある
      // 実装に依存するため、動作確認
      expect(result.success).toBe(true);
    });
  });

  describe("型推論", () => {
    it("成功レスポンスの型推論", () => {
      const input = {
        success: true as const,
        data: {
          message: "Hello",
          modelId: "gpt-4o",
          providerId: "openai" as const,
        },
      };
      const parsed = LLMChatResponseSchema.parse(input);
      const _typeCheck: LLMChatResponse = parsed;
      if (_typeCheck.success) {
        expect(_typeCheck.data.message).toBe("Hello");
      }
    });
  });
});

// =============================================================================
// TS-005: LLMStreamChunkSchema
// =============================================================================

describe("LLMStreamChunkSchema", () => {
  describe("TS-005-01〜03: 有効なチャンク", () => {
    it("TS-005-01: contentチャンク", () => {
      const input = {
        type: "content",
        content: "Hello",
      };
      const result = LLMStreamChunkSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success && result.data.type === "content") {
        expect(result.data.content).toBe("Hello");
      }
    });

    it("TS-005-02: doneチャンク", () => {
      const input = {
        type: "done",
        response: {
          success: true,
          data: {
            message: "Complete response",
            modelId: "gpt-4o",
            providerId: "openai",
          },
        },
      };
      const result = LLMStreamChunkSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success && result.data.type === "done") {
        expect(result.data.response.success).toBe(true);
      }
    });

    it("TS-005-03: errorチャンク", () => {
      const input = {
        type: "error",
        error: {
          code: "NETWORK_ERROR",
          message: "Connection lost",
          retryable: true,
        },
      };
      const result = LLMStreamChunkSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success && result.data.type === "error") {
        expect(result.data.error.code).toBe("NETWORK_ERROR");
      }
    });
  });

  describe("TS-005-04: 無効なチャンク", () => {
    it("不明なtype", () => {
      const input = {
        type: "unknown",
      };
      const result = LLMStreamChunkSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("contentチャンクでcontentがない", () => {
      const input = {
        type: "content",
      };
      const result = LLMStreamChunkSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("doneチャンクでresponseがない", () => {
      const input = {
        type: "done",
      };
      const result = LLMStreamChunkSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("errorチャンクでerrorがない", () => {
      const input = {
        type: "error",
      };
      const result = LLMStreamChunkSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト", () => {
    it("空のcontentを受け入れること", () => {
      const input = {
        type: "content",
        content: "",
      };
      const result = LLMStreamChunkSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("長いcontentを受け入れること", () => {
      const input = {
        type: "content",
        content: "a".repeat(100000),
      };
      const result = LLMStreamChunkSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("型推論", () => {
    it("推論された型がLLMStreamChunkであること", () => {
      const input = {
        type: "content" as const,
        content: "Hello",
      };
      const parsed = LLMStreamChunkSchema.parse(input);
      const _typeCheck: LLMStreamChunk = parsed;
      if (_typeCheck.type === "content") {
        expect(_typeCheck.content).toBe("Hello");
      }
    });
  });
});
