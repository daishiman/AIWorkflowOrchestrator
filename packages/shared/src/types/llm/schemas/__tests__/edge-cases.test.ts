/**
 * @file LLMスキーマ エッジケーステスト
 * @description Phase 6 - テスト拡充：境界値・異常系・特殊ケース
 * @feature chat-multi-llm-switching
 */

import { describe, it, expect } from "vitest";
import {
  LLMProviderIdSchema,
  LLMModelSchema,
  LLMConfigSchema,
} from "../provider";
import { LLMMessageSchema, MessageRoleSchema } from "../message";
import { LLMChatRequestSchema } from "../request";
import {
  LLMChatResponseSchema,
  LLMStreamChunkSchema,
  TokenUsageSchema,
} from "../response";
import { LLMErrorSchema, LLMErrorCodeSchema } from "../error";
import { HealthCheckResultSchema } from "../health";
import { IPCChatRequestSchema } from "../ipc";

// =============================================================================
// 境界値テスト - 数値フィールド
// =============================================================================

describe("境界値テスト - 数値フィールド", () => {
  describe("LLMChatRequestSchema - temperature", () => {
    it("温度0.0を受け入れる（下限）", () => {
      const result = LLMChatRequestSchema.safeParse({
        messages: [],
        modelId: "test",
        temperature: 0,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.temperature).toBe(0);
      }
    });

    it("温度2.0を受け入れる（上限）", () => {
      const result = LLMChatRequestSchema.safeParse({
        messages: [],
        modelId: "test",
        temperature: 2.0,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.temperature).toBe(2.0);
      }
    });

    it("温度0.001を受け入れる（小数点以下3桁）", () => {
      const result = LLMChatRequestSchema.safeParse({
        messages: [],
        modelId: "test",
        temperature: 0.001,
      });
      expect(result.success).toBe(true);
    });

    it("温度-0.001を拒否する（下限未満）", () => {
      const result = LLMChatRequestSchema.safeParse({
        messages: [],
        modelId: "test",
        temperature: -0.001,
      });
      expect(result.success).toBe(false);
    });

    it("温度2.001を拒否する（上限超過）", () => {
      const result = LLMChatRequestSchema.safeParse({
        messages: [],
        modelId: "test",
        temperature: 2.001,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("LLMChatRequestSchema - maxTokens", () => {
    it("maxTokens=1を受け入れる（最小正数）", () => {
      const result = LLMChatRequestSchema.safeParse({
        messages: [],
        modelId: "test",
        maxTokens: 1,
      });
      expect(result.success).toBe(true);
    });

    it("maxTokens=0を拒否する", () => {
      const result = LLMChatRequestSchema.safeParse({
        messages: [],
        modelId: "test",
        maxTokens: 0,
      });
      expect(result.success).toBe(false);
    });

    it("maxTokens=1000000を受け入れる（大きな値）", () => {
      const result = LLMChatRequestSchema.safeParse({
        messages: [],
        modelId: "test",
        maxTokens: 1000000,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("LLMConfigSchema - timeout/maxRetries", () => {
    it("timeout=1を受け入れる（最小正数）", () => {
      const result = LLMConfigSchema.safeParse({
        apiKey: "test",
        timeout: 1,
      });
      expect(result.success).toBe(true);
    });

    it("maxRetries=0を受け入れる（リトライなし）", () => {
      const result = LLMConfigSchema.safeParse({
        apiKey: "test",
        maxRetries: 0,
      });
      expect(result.success).toBe(true);
    });

    it("maxRetries=10を受け入れる（上限）", () => {
      const result = LLMConfigSchema.safeParse({
        apiKey: "test",
        maxRetries: 10,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("TokenUsageSchema - 大きな数値", () => {
    it("非常に大きなトークン数を受け入れる", () => {
      const result = TokenUsageSchema.safeParse({
        promptTokens: 10000000,
        completionTokens: 10000000,
        totalTokens: 20000000,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("LLMErrorSchema - retryAfter", () => {
    it("retryAfter=1を受け入れる（最小値）", () => {
      const result = LLMErrorSchema.safeParse({
        code: "RATE_LIMIT",
        message: "Too many requests",
        retryable: true,
        retryAfter: 1,
      });
      expect(result.success).toBe(true);
    });

    it("retryAfter=86400を受け入れる（24時間）", () => {
      const result = LLMErrorSchema.safeParse({
        code: "RATE_LIMIT",
        message: "Daily limit",
        retryable: true,
        retryAfter: 86400,
      });
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// 特殊文字列テスト
// =============================================================================

describe("特殊文字列テスト", () => {
  describe("メッセージコンテンツ", () => {
    it("Unicode絵文字を含むメッセージを受け入れる", () => {
      const result = LLMMessageSchema.safeParse({
        role: "user",
        content: "Hello! 👋🌍🎉",
      });
      expect(result.success).toBe(true);
    });

    it("日本語文字を含むメッセージを受け入れる", () => {
      const result = LLMMessageSchema.safeParse({
        role: "user",
        content: "こんにちは、AIアシスタントです。",
      });
      expect(result.success).toBe(true);
    });

    it("改行を含むメッセージを受け入れる", () => {
      const result = LLMMessageSchema.safeParse({
        role: "assistant",
        content: "Line 1\nLine 2\nLine 3",
      });
      expect(result.success).toBe(true);
    });

    it("タブを含むメッセージを受け入れる", () => {
      const result = LLMMessageSchema.safeParse({
        role: "user",
        content: "Column1\tColumn2\tColumn3",
      });
      expect(result.success).toBe(true);
    });

    it("非常に長いメッセージを受け入れる（10万文字）", () => {
      const result = LLMMessageSchema.safeParse({
        role: "user",
        content: "a".repeat(100000),
      });
      expect(result.success).toBe(true);
    });

    it("コードブロックを含むメッセージを受け入れる", () => {
      const result = LLMMessageSchema.safeParse({
        role: "assistant",
        content: "```typescript\nconst x: number = 1;\n```",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("モデル/プロバイダー名", () => {
    it("ハイフン付きモデルIDを受け入れる", () => {
      const result = LLMModelSchema.safeParse({
        id: "gpt-4o-mini-2024-07-18",
        name: "GPT-4o Mini",
      });
      expect(result.success).toBe(true);
    });

    it("数字のみのモデルIDを受け入れる", () => {
      const result = LLMModelSchema.safeParse({
        id: "12345",
        name: "Model 12345",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("APIキー形式", () => {
    it("ベアラートークン形式のAPIキーを受け入れる", () => {
      const result = LLMConfigSchema.safeParse({
        apiKey: "Bearer sk-test-1234567890abcdef",
      });
      expect(result.success).toBe(true);
    });

    it("Base64エンコードされたAPIキーを受け入れる", () => {
      const result = LLMConfigSchema.safeParse({
        apiKey: "SGVsbG8gV29ybGQh",
      });
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// 空・null・undefined テスト
// =============================================================================

describe("空・null・undefined テスト", () => {
  describe("空配列の扱い", () => {
    it("空のmessages配列を受け入れる", () => {
      const result = LLMChatRequestSchema.safeParse({
        messages: [],
        modelId: "test",
      });
      expect(result.success).toBe(true);
    });

    it("空のhistory配列を受け入れる（IPC）", () => {
      const result = IPCChatRequestSchema.safeParse({
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("オプショナルフィールド", () => {
    it("systemPromptがundefinedでも受け入れる", () => {
      const result = LLMChatRequestSchema.safeParse({
        messages: [],
        modelId: "test",
        systemPrompt: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("descriptionが空文字列でも受け入れる", () => {
      const result = LLMModelSchema.safeParse({
        id: "test",
        name: "Test",
        description: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("null値の拒否", () => {
    it("messagesがnullの場合は拒否する", () => {
      const result = LLMChatRequestSchema.safeParse({
        messages: null,
        modelId: "test",
      });
      expect(result.success).toBe(false);
    });

    it("contentがnullの場合は拒否する", () => {
      const result = LLMMessageSchema.safeParse({
        role: "user",
        content: null,
      });
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// 型強制（Coercion）テスト
// =============================================================================

describe("型強制テスト", () => {
  describe("HealthCheckResult - 日付強制", () => {
    it("ISO文字列をDateに変換する", () => {
      const result = HealthCheckResultSchema.safeParse({
        status: "connected",
        providerId: "openai",
        checkedAt: "2026-01-08T10:00:00.000Z",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checkedAt).toBeInstanceOf(Date);
      }
    });

    it("タイムスタンプをDateに変換する", () => {
      const result = HealthCheckResultSchema.safeParse({
        status: "connected",
        providerId: "openai",
        checkedAt: 1704700800000,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checkedAt).toBeInstanceOf(Date);
      }
    });

    it("Dateオブジェクトをそのまま受け入れる", () => {
      const date = new Date();
      const result = HealthCheckResultSchema.safeParse({
        status: "connected",
        providerId: "openai",
        checkedAt: date,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checkedAt).toEqual(date);
      }
    });
  });
});

// =============================================================================
// Discriminated Union の網羅テスト
// =============================================================================

describe("Discriminated Union 網羅テスト", () => {
  describe("LLMChatResponse - 全パターン", () => {
    it("success=true + data の組み合わせ", () => {
      const result = LLMChatResponseSchema.safeParse({
        success: true,
        data: {
          message: "Hello",
          modelId: "gpt-4o",
          providerId: "openai",
        },
      });
      expect(result.success).toBe(true);
    });

    it("success=false + error の組み合わせ", () => {
      const result = LLMChatResponseSchema.safeParse({
        success: false,
        error: {
          code: "UNKNOWN",
          message: "Error",
          retryable: false,
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("LLMStreamChunk - 全パターン", () => {
    const chunkTypes = [
      {
        type: "content",
        content: "Hello",
      },
      {
        type: "done",
        response: {
          success: true,
          data: {
            message: "Complete",
            modelId: "gpt-4o",
            providerId: "openai",
          },
        },
      },
      {
        type: "error",
        error: {
          code: "NETWORK_ERROR",
          message: "Lost connection",
          retryable: true,
        },
      },
    ];

    chunkTypes.forEach((chunk) => {
      it(`type="${chunk.type}" を受け入れる`, () => {
        const result = LLMStreamChunkSchema.safeParse(chunk);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("HealthCheckResult - 全ステータス", () => {
    const statuses = ["connected", "disconnected", "error"];

    statuses.forEach((status) => {
      it(`status="${status}" を受け入れる`, () => {
        const input: Record<string, unknown> = {
          status,
          providerId: "openai",
          checkedAt: new Date(),
        };

        // errorステータスの場合はerrorMessageが必要
        if (status === "error") {
          input.errorMessage = "Test error";
        }

        const result = HealthCheckResultSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });
  });
});

// =============================================================================
// エラーコード網羅テスト
// =============================================================================

describe("LLMErrorCode 網羅テスト", () => {
  const errorCodes = [
    "API_KEY_MISSING",
    "API_KEY_INVALID",
    "NETWORK_ERROR",
    "TIMEOUT",
    "RATE_LIMIT",
    "CONTEXT_LENGTH_EXCEEDED",
    "CONTENT_FILTER",
    "MODEL_NOT_FOUND",
    "SERVICE_UNAVAILABLE",
    "UNKNOWN",
  ];

  errorCodes.forEach((code) => {
    it(`エラーコード "${code}" を受け入れる`, () => {
      const result = LLMErrorCodeSchema.safeParse(code);
      expect(result.success).toBe(true);
    });
  });

  it("未定義のエラーコードを拒否する", () => {
    const result = LLMErrorCodeSchema.safeParse("INVALID_ERROR_CODE");
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// プロバイダーID網羅テスト
// =============================================================================

describe("LLMProviderId 網羅テスト", () => {
  const providerIds = ["openai", "anthropic", "google", "xai"];

  providerIds.forEach((id) => {
    it(`プロバイダーID "${id}" を受け入れる`, () => {
      const result = LLMProviderIdSchema.safeParse(id);
      expect(result.success).toBe(true);
    });
  });

  it("大文字小文字が異なる場合は拒否する", () => {
    const result = LLMProviderIdSchema.safeParse("OpenAI");
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// メッセージロール網羅テスト
// =============================================================================

describe("MessageRole 網羅テスト", () => {
  const roles = ["user", "assistant", "system"];

  roles.forEach((role) => {
    it(`ロール "${role}" を受け入れる`, () => {
      const result = MessageRoleSchema.safeParse(role);
      expect(result.success).toBe(true);
    });
  });

  it("未定義のロールを拒否する", () => {
    const result = MessageRoleSchema.safeParse("function");
    expect(result.success).toBe(false);
  });
});
