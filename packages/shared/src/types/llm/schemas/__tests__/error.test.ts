/**
 * @file LLMエラー関連Zodスキーマのテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @testIds TS-006
 * @feature chat-multi-llm-switching
 */

import { describe, it, expect } from "vitest";
import {
  LLMErrorCodeSchema,
  LLMErrorSchema,
  type LLMErrorCode,
  type LLMError,
} from "../error";

// =============================================================================
// LLMErrorCodeSchema
// =============================================================================

describe("LLMErrorCodeSchema", () => {
  describe("有効なエラーコード", () => {
    const validCodes = [
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

    validCodes.forEach((code) => {
      it(`${code}を受け入れること`, () => {
        const result = LLMErrorCodeSchema.safeParse(code);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("無効なエラーコード", () => {
    it("未定義のエラーコードを拒否すること", () => {
      const result = LLMErrorCodeSchema.safeParse("INVALID_CODE");
      expect(result.success).toBe(false);
    });

    it("空文字列を拒否すること", () => {
      const result = LLMErrorCodeSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("小文字のエラーコードを拒否すること", () => {
      const result = LLMErrorCodeSchema.safeParse("api_key_invalid");
      expect(result.success).toBe(false);
    });

    it("nullを拒否すること", () => {
      const result = LLMErrorCodeSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("undefinedを拒否すること", () => {
      const result = LLMErrorCodeSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it("数値を拒否すること", () => {
      const result = LLMErrorCodeSchema.safeParse(404);
      expect(result.success).toBe(false);
    });
  });

  describe("型推論", () => {
    it("推論された型がLLMErrorCodeであること", () => {
      const parsed = LLMErrorCodeSchema.parse("API_KEY_INVALID");
      const _typeCheck: LLMErrorCode = parsed;
      expect(_typeCheck).toBe("API_KEY_INVALID");
    });
  });
});

// =============================================================================
// TS-006: LLMErrorSchema
// =============================================================================

describe("LLMErrorSchema", () => {
  describe("TS-006-01: 有効なエラー", () => {
    it("最小構成のエラー", () => {
      const input = {
        code: "API_KEY_INVALID",
        message: "Invalid API key provided",
        retryable: false,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("全フィールド指定のエラー", () => {
      const input = {
        code: "RATE_LIMIT",
        message: "Rate limit exceeded",
        originalError: new Error("429 Too Many Requests"),
        retryable: true,
        retryAfter: 30,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("originalErrorにオブジェクトを指定", () => {
      const input = {
        code: "NETWORK_ERROR",
        message: "Connection failed",
        originalError: { status: 500, statusText: "Internal Server Error" },
        retryable: true,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("TS-006-02: 無効なエラーコード", () => {
    it("無効なエラーコードを拒否", () => {
      const input = {
        code: "INVALID_CODE",
        message: "Some error",
        retryable: false,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("TS-006-03〜04: retryAfterの検証", () => {
    it("TS-006-03: retryAfterが正数", () => {
      const input = {
        code: "RATE_LIMIT",
        message: "Rate limit exceeded",
        retryable: true,
        retryAfter: 30,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.retryAfter).toBe(30);
      }
    });

    it("TS-006-04: retryAfterが負数", () => {
      const input = {
        code: "RATE_LIMIT",
        message: "Rate limit exceeded",
        retryable: true,
        retryAfter: -1,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("retryAfterが0", () => {
      const input = {
        code: "RATE_LIMIT",
        message: "Rate limit exceeded",
        retryable: true,
        retryAfter: 0,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("retryAfterが小数", () => {
      const input = {
        code: "RATE_LIMIT",
        message: "Rate limit exceeded",
        retryable: true,
        retryAfter: 30.5,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("必須フィールドの検証", () => {
    it("codeがない場合に拒否", () => {
      const input = {
        message: "Some error",
        retryable: false,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("messageがない場合に拒否", () => {
      const input = {
        code: "UNKNOWN",
        retryable: false,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("retryableがない場合に拒否", () => {
      const input = {
        code: "UNKNOWN",
        message: "Some error",
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("エラーコード別の典型的なパターン", () => {
    it("API_KEY_MISSINGエラー", () => {
      const input = {
        code: "API_KEY_MISSING",
        message: "API key is not configured",
        retryable: false,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("NETWORK_ERRORエラー（リトライ可能）", () => {
      const input = {
        code: "NETWORK_ERROR",
        message: "Failed to connect to API server",
        retryable: true,
        retryAfter: 5,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("TIMEOUTエラー", () => {
      const input = {
        code: "TIMEOUT",
        message: "Request timed out after 30000ms",
        retryable: true,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("CONTEXT_LENGTH_EXCEEDEDエラー", () => {
      const input = {
        code: "CONTEXT_LENGTH_EXCEEDED",
        message: "Input exceeds maximum context length of 128000 tokens",
        retryable: false,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("CONTENT_FILTERエラー", () => {
      const input = {
        code: "CONTENT_FILTER",
        message: "Content was filtered due to policy violations",
        retryable: false,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("MODEL_NOT_FOUNDエラー", () => {
      const input = {
        code: "MODEL_NOT_FOUND",
        message: "Model 'gpt-5' does not exist",
        retryable: false,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("SERVICE_UNAVAILABLEエラー", () => {
      const input = {
        code: "SERVICE_UNAVAILABLE",
        message: "Service is temporarily unavailable",
        retryable: true,
        retryAfter: 60,
      };
      const result = LLMErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("型推論", () => {
    it("推論された型がLLMErrorであること", () => {
      const input = {
        code: "API_KEY_INVALID" as const,
        message: "Invalid API key",
        retryable: false,
      };
      const parsed = LLMErrorSchema.parse(input);
      const _typeCheck: LLMError = parsed;
      expect(_typeCheck.code).toBe("API_KEY_INVALID");
    });
  });
});
