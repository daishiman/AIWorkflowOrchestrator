/**
 * @file LLMプロバイダー関連Zodスキーマのテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @testIds TS-001, TS-002
 * @feature chat-multi-llm-switching
 */

import { describe, it, expect } from "vitest";
import {
  LLMProviderIdSchema,
  LLMModelSchema,
  LLMProviderSchema,
  LLMConfigSchema,
  type LLMProviderId,
  type LLMModel,
  type LLMProvider,
  type LLMConfig,
} from "../provider";

// =============================================================================
// TS-001: LLMProviderIdSchema
// =============================================================================

describe("LLMProviderIdSchema", () => {
  describe("TS-001-01〜04: 有効なプロバイダーID", () => {
    it("TS-001-01: 有効なプロバイダーID (openai)", () => {
      const result = LLMProviderIdSchema.safeParse("openai");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("openai");
      }
    });

    it("TS-001-02: 有効なプロバイダーID (anthropic)", () => {
      const result = LLMProviderIdSchema.safeParse("anthropic");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("anthropic");
      }
    });

    it("TS-001-03: 有効なプロバイダーID (google)", () => {
      const result = LLMProviderIdSchema.safeParse("google");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("google");
      }
    });

    it("TS-001-04: 有効なプロバイダーID (xai)", () => {
      const result = LLMProviderIdSchema.safeParse("xai");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("xai");
      }
    });
  });

  describe("TS-001-05〜07: 無効なプロバイダーID", () => {
    it("TS-001-05: 無効なプロバイダーID", () => {
      const result = LLMProviderIdSchema.safeParse("invalid");
      expect(result.success).toBe(false);
    });

    it("TS-001-06: 空文字列", () => {
      const result = LLMProviderIdSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("TS-001-07: null", () => {
      const result = LLMProviderIdSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("undefinedを拒否すること", () => {
      const result = LLMProviderIdSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it("数値を拒否すること", () => {
      const result = LLMProviderIdSchema.safeParse(123);
      expect(result.success).toBe(false);
    });

    it("大文字のプロバイダーIDを拒否すること", () => {
      const result = LLMProviderIdSchema.safeParse("OPENAI");
      expect(result.success).toBe(false);
    });
  });

  describe("型推論", () => {
    it("推論された型がLLMProviderIdであること", () => {
      const parsed = LLMProviderIdSchema.parse("openai");
      const _typeCheck: LLMProviderId = parsed;
      expect(_typeCheck).toBe("openai");
    });
  });
});

// =============================================================================
// TS-002: LLMModelSchema
// =============================================================================

describe("LLMModelSchema", () => {
  describe("TS-002-01〜02: 有効なモデル", () => {
    it("TS-002-01: 有効な最小モデル", () => {
      const input = { id: "gpt-4o", name: "GPT-4o" };
      const result = LLMModelSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("gpt-4o");
        expect(result.data.name).toBe("GPT-4o");
      }
    });

    it("TS-002-02: 全フィールド指定", () => {
      const input = {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Most capable model",
        contextWindow: 128000,
        isDefault: true,
      };
      const result = LLMModelSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("gpt-4o");
        expect(result.data.name).toBe("GPT-4o");
        expect(result.data.description).toBe("Most capable model");
        expect(result.data.contextWindow).toBe(128000);
        expect(result.data.isDefault).toBe(true);
      }
    });
  });

  describe("TS-002-03〜05: 無効なモデル", () => {
    it("TS-002-03: idが空文字", () => {
      const input = { id: "", name: "Test" };
      const result = LLMModelSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("TS-002-04: nameが空文字", () => {
      const input = { id: "test", name: "" };
      const result = LLMModelSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("TS-002-05: contextWindowが負数", () => {
      const input = { id: "test", name: "Test", contextWindow: -1 };
      const result = LLMModelSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("contextWindowが0", () => {
      const input = { id: "test", name: "Test", contextWindow: 0 };
      const result = LLMModelSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("contextWindowが小数", () => {
      const input = { id: "test", name: "Test", contextWindow: 128.5 };
      const result = LLMModelSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("TS-002-06: デフォルト値", () => {
    it("isDefaultのデフォルト値", () => {
      const input = { id: "test", name: "Test" };
      const result = LLMModelSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDefault).toBe(false);
      }
    });
  });

  describe("型推論", () => {
    it("推論された型がLLMModelであること", () => {
      const input = { id: "gpt-4o", name: "GPT-4o" };
      const parsed = LLMModelSchema.parse(input);
      const _typeCheck: LLMModel = parsed;
      expect(_typeCheck.id).toBe("gpt-4o");
    });
  });
});

// =============================================================================
// LLMProviderSchema
// =============================================================================

describe("LLMProviderSchema", () => {
  describe("有効なプロバイダー", () => {
    it("最小構成のプロバイダー", () => {
      const input = {
        id: "openai" as const,
        name: "OpenAI",
        isAvailable: true,
        models: [{ id: "gpt-4o", name: "GPT-4o" }],
      };
      const result = LLMProviderSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("全フィールド指定のプロバイダー", () => {
      const input = {
        id: "anthropic" as const,
        name: "Anthropic",
        icon: "https://example.com/icon.svg",
        isAvailable: true,
        models: [
          { id: "claude-3-opus", name: "Claude 3 Opus", isDefault: true },
          { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
        ],
      };
      const result = LLMProviderSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("無効なプロバイダー", () => {
    it("無効なプロバイダーID", () => {
      const input = {
        id: "invalid",
        name: "Invalid",
        isAvailable: true,
        models: [{ id: "test", name: "Test" }],
      };
      const result = LLMProviderSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("空のmodels配列", () => {
      const input = {
        id: "openai" as const,
        name: "OpenAI",
        isAvailable: true,
        models: [],
      };
      const result = LLMProviderSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("空のname", () => {
      const input = {
        id: "openai" as const,
        name: "",
        isAvailable: true,
        models: [{ id: "gpt-4o", name: "GPT-4o" }],
      };
      const result = LLMProviderSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("無効なicon URL", () => {
      const input = {
        id: "openai" as const,
        name: "OpenAI",
        icon: "not-a-url",
        isAvailable: true,
        models: [{ id: "gpt-4o", name: "GPT-4o" }],
      };
      const result = LLMProviderSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("型推論", () => {
    it("推論された型がLLMProviderであること", () => {
      const input = {
        id: "openai" as const,
        name: "OpenAI",
        isAvailable: true,
        models: [{ id: "gpt-4o", name: "GPT-4o" }],
      };
      const parsed = LLMProviderSchema.parse(input);
      const _typeCheck: LLMProvider = parsed;
      expect(_typeCheck.id).toBe("openai");
    });
  });
});

// =============================================================================
// LLMConfigSchema
// =============================================================================

describe("LLMConfigSchema", () => {
  describe("有効な設定", () => {
    it("最小構成の設定", () => {
      const input = { apiKey: "sk-test-key-123" };
      const result = LLMConfigSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("全フィールド指定の設定", () => {
      const input = {
        apiKey: "sk-test-key-123",
        baseUrl: "https://api.example.com",
        timeout: 60000,
        maxRetries: 5,
      };
      const result = LLMConfigSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("無効な設定", () => {
    it("空のapiKey", () => {
      const input = { apiKey: "" };
      const result = LLMConfigSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("無効なbaseUrl", () => {
      const input = { apiKey: "sk-test", baseUrl: "not-a-url" };
      const result = LLMConfigSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("負のtimeout", () => {
      const input = { apiKey: "sk-test", timeout: -1000 };
      const result = LLMConfigSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("範囲外のmaxRetries (負)", () => {
      const input = { apiKey: "sk-test", maxRetries: -1 };
      const result = LLMConfigSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("範囲外のmaxRetries (超過)", () => {
      const input = { apiKey: "sk-test", maxRetries: 11 };
      const result = LLMConfigSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("デフォルト値", () => {
    it("timeoutのデフォルト値", () => {
      const input = { apiKey: "sk-test" };
      const result = LLMConfigSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeout).toBe(30000);
      }
    });

    it("maxRetriesのデフォルト値", () => {
      const input = { apiKey: "sk-test" };
      const result = LLMConfigSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxRetries).toBe(3);
      }
    });
  });

  describe("型推論", () => {
    it("推論された型がLLMConfigであること", () => {
      const input = { apiKey: "sk-test" };
      const parsed = LLMConfigSchema.parse(input);
      const _typeCheck: LLMConfig = parsed;
      expect(_typeCheck.apiKey).toBe("sk-test");
    });
  });
});
