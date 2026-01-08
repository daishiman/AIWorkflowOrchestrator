/**
 * @file LLMバリデーションユーティリティのテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @testIds TS-030
 * @feature chat-multi-llm-switching
 */

import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import {
  validateChatRequest,
  validateChatResponse,
  validateIPCRequest,
  validateError,
  safeParseChatResponse,
} from "../validators";

// =============================================================================
// TS-030: Validation Utilities
// =============================================================================

describe("validateChatRequest", () => {
  describe("TS-030-01: 成功ケース", () => {
    it("有効なリクエストをパースすること", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
      };
      const result = validateChatRequest(input);
      expect(result.modelId).toBe("gpt-4o");
      expect(result.messages).toHaveLength(1);
    });

    it("全オプション指定のリクエストをパースすること", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
        systemPrompt: "You are helpful.",
        temperature: 0.7,
        maxTokens: 2048,
        stream: true,
      };
      const result = validateChatRequest(input);
      expect(result.systemPrompt).toBe("You are helpful.");
      expect(result.temperature).toBe(0.7);
      expect(result.maxTokens).toBe(2048);
      expect(result.stream).toBe(true);
    });
  });

  describe("TS-030-02: 失敗ケース", () => {
    it("無効なリクエストでZodErrorをthrowすること", () => {
      const input = {
        messages: [{ role: "invalid", content: "Hello" }],
        modelId: "gpt-4o",
      };
      expect(() => validateChatRequest(input)).toThrow(ZodError);
    });

    it("modelIdが空でZodErrorをthrowすること", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "",
      };
      expect(() => validateChatRequest(input)).toThrow(ZodError);
    });

    it("temperatureが範囲外でZodErrorをthrowすること", () => {
      const input = {
        messages: [{ role: "user", content: "Hello" }],
        modelId: "gpt-4o",
        temperature: 3.0,
      };
      expect(() => validateChatRequest(input)).toThrow(ZodError);
    });
  });
});

describe("validateChatResponse", () => {
  describe("TS-030-03: 成功ケース", () => {
    it("成功レスポンスをパースすること", () => {
      const input = {
        success: true,
        data: {
          message: "Hello!",
          modelId: "gpt-4o",
          providerId: "openai",
        },
      };
      const result = validateChatResponse(input);
      expect(result.success).toBe(true);
    });

    it("失敗レスポンスをパースすること", () => {
      const input = {
        success: false,
        error: {
          code: "API_KEY_INVALID",
          message: "Invalid API key",
          retryable: false,
        },
      };
      const result = validateChatResponse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("失敗ケース", () => {
    it("不正なレスポンスでZodErrorをthrowすること", () => {
      const input = {
        success: true,
        // dataがない
      };
      expect(() => validateChatResponse(input)).toThrow(ZodError);
    });
  });
});

describe("validateIPCRequest", () => {
  describe("TS-030-04: 成功ケース", () => {
    it("有効なIPCリクエストをパースすること", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [{ role: "user", content: "Hi" }],
        providerId: "openai",
        modelId: "gpt-4o",
      };
      const result = validateIPCRequest(input);
      expect(result.providerId).toBe("openai");
      expect(result.modelId).toBe("gpt-4o");
    });

    it("オプションフィールド付きのIPCリクエストをパースすること", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [],
        providerId: "anthropic",
        modelId: "claude-3-opus",
        systemPrompt: "You are helpful.",
        ragEnabled: true,
      };
      const result = validateIPCRequest(input);
      expect(result.systemPrompt).toBe("You are helpful.");
      expect(result.ragEnabled).toBe(true);
    });
  });

  describe("失敗ケース", () => {
    it("無効なUUIDでZodErrorをthrowすること", () => {
      const input = {
        conversationId: "not-a-uuid",
        message: "Hello",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      };
      expect(() => validateIPCRequest(input)).toThrow(ZodError);
    });

    it("空のmessageでZodErrorをthrowすること", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      };
      expect(() => validateIPCRequest(input)).toThrow(ZodError);
    });

    it("無効なproviderIdでZodErrorをthrowすること", () => {
      const input = {
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [],
        providerId: "invalid",
        modelId: "gpt-4o",
      };
      expect(() => validateIPCRequest(input)).toThrow(ZodError);
    });
  });
});

describe("validateError", () => {
  describe("成功ケース", () => {
    it("有効なエラーをパースすること", () => {
      const input = {
        code: "NETWORK_ERROR",
        message: "Connection failed",
        retryable: true,
      };
      const result = validateError(input);
      expect(result.code).toBe("NETWORK_ERROR");
      expect(result.retryable).toBe(true);
    });

    it("retryAfter付きのエラーをパースすること", () => {
      const input = {
        code: "RATE_LIMIT",
        message: "Rate limit exceeded",
        retryable: true,
        retryAfter: 30,
      };
      const result = validateError(input);
      expect(result.retryAfter).toBe(30);
    });
  });

  describe("失敗ケース", () => {
    it("無効なエラーコードでZodErrorをthrowすること", () => {
      const input = {
        code: "INVALID_CODE",
        message: "Some error",
        retryable: false,
      };
      expect(() => validateError(input)).toThrow(ZodError);
    });
  });
});

describe("safeParseChatResponse", () => {
  describe("TS-030-05: 成功ケース", () => {
    it("有効なレスポンスをパースすること", () => {
      const input = {
        success: true,
        data: {
          message: "Hello!",
          modelId: "gpt-4o",
          providerId: "openai",
        },
      };
      const result = safeParseChatResponse(input);
      expect(result).not.toBeUndefined();
      expect(result?.success).toBe(true);
    });
  });

  describe("TS-030-06: 失敗ケース", () => {
    it("無効なレスポンスでundefinedを返すこと", () => {
      const input = {
        success: true,
        // dataがない
      };
      const result = safeParseChatResponse(input);
      expect(result).toBeUndefined();
    });

    it("nullでundefinedを返すこと", () => {
      const result = safeParseChatResponse(null);
      expect(result).toBeUndefined();
    });

    it("undefinedでundefinedを返すこと", () => {
      const result = safeParseChatResponse(undefined);
      expect(result).toBeUndefined();
    });

    it("不正な型でundefinedを返すこと", () => {
      const result = safeParseChatResponse("not an object");
      expect(result).toBeUndefined();
    });
  });
});

// =============================================================================
// エラーメッセージの検証
// =============================================================================

describe("バリデーションエラーメッセージ", () => {
  it("ZodErrorにissuesが含まれること", () => {
    const input = {
      messages: [{ role: "invalid", content: "Hello" }],
      modelId: "gpt-4o",
    };
    try {
      validateChatRequest(input);
      // ここに到達しないはず
      expect.fail("Should have thrown ZodError");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.issues.length).toBeGreaterThan(0);
        expect(error.issues[0].path).toContain("messages");
      }
    }
  });

  it("複数のエラーがある場合に全て報告されること", () => {
    const input = {
      messages: [{ role: "invalid", content: "Hello" }],
      modelId: "",
      temperature: 3.0,
    };
    try {
      validateChatRequest(input);
      expect.fail("Should have thrown ZodError");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        // 少なくとも2つのエラー（role, modelId, temperature）
        expect(error.issues.length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
