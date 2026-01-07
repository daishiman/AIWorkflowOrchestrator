/**
 * @file バリデーター エッジケーステスト
 * @description Phase 6 - テスト拡充：詳細エラー情報・複合バリデーション
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
// validateChatRequest 詳細エラーテスト
// =============================================================================

describe("validateChatRequest 詳細エラー", () => {
  describe("ZodError詳細情報", () => {
    it("modelIdが空の場合、適切なパスでエラーが発生する", () => {
      expect(() =>
        validateChatRequest({
          messages: [],
          modelId: "",
        }),
      ).toThrow(ZodError);

      try {
        validateChatRequest({ messages: [], modelId: "" });
      } catch (e) {
        if (e instanceof ZodError) {
          const issue = e.issues.find((i) => i.path.includes("modelId"));
          expect(issue).toBeDefined();
        }
      }
    });

    it("温度が範囲外の場合、適切なメッセージが含まれる", () => {
      try {
        validateChatRequest({
          messages: [],
          modelId: "test",
          temperature: 3.0,
        });
        expect.fail("Should have thrown");
      } catch (e) {
        if (e instanceof ZodError) {
          const tempIssue = e.issues.find((i) =>
            i.path.includes("temperature"),
          );
          expect(tempIssue).toBeDefined();
        }
      }
    });

    it("複数のフィールドが無効な場合、全てのエラーが含まれる", () => {
      try {
        validateChatRequest({
          messages: "not an array", // 無効
          modelId: "", // 無効
          temperature: -1, // 無効
        });
        expect.fail("Should have thrown");
      } catch (e) {
        if (e instanceof ZodError) {
          expect(e.issues.length).toBeGreaterThan(1);
        }
      }
    });

    it("ネストしたmessagesのバリデーションエラー", () => {
      try {
        validateChatRequest({
          messages: [
            { role: "user", content: "valid" },
            { role: "invalid_role", content: "test" }, // 無効なロール
          ],
          modelId: "test",
        });
        expect.fail("Should have thrown");
      } catch (e) {
        if (e instanceof ZodError) {
          const roleIssue = e.issues.find(
            (i) => i.path.includes("role") || i.path.includes(1),
          );
          expect(roleIssue).toBeDefined();
        }
      }
    });
  });

  describe("有効な入力のバリエーション", () => {
    it("全てのオプショナルフィールドを指定", () => {
      const result = validateChatRequest({
        messages: [
          { role: "system", content: "You are helpful" },
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi!" },
        ],
        modelId: "gpt-4o",
        systemPrompt: "Custom system prompt",
        temperature: 0.7,
        maxTokens: 1000,
        stream: true,
      });

      expect(result.modelId).toBe("gpt-4o");
      expect(result.systemPrompt).toBe("Custom system prompt");
      expect(result.temperature).toBe(0.7);
      expect(result.maxTokens).toBe(1000);
      expect(result.stream).toBe(true);
    });

    it("デフォルト値が正しく設定される", () => {
      const result = validateChatRequest({
        messages: [],
        modelId: "test",
      });

      expect(result.temperature).toBe(1.0);
      expect(result.stream).toBe(false);
    });
  });
});

// =============================================================================
// validateChatResponse 詳細エラーテスト
// =============================================================================

describe("validateChatResponse 詳細エラー", () => {
  describe("Discriminated Union エラー", () => {
    it("success=trueでdataがない場合のエラー", () => {
      try {
        validateChatResponse({
          success: true,
        });
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(ZodError);
      }
    });

    it("success=falseでerrorがない場合のエラー", () => {
      try {
        validateChatResponse({
          success: false,
        });
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(ZodError);
      }
    });

    it("data内のproviderIdが無効な場合のエラー", () => {
      try {
        validateChatResponse({
          success: true,
          data: {
            message: "Hello",
            modelId: "gpt-4o",
            providerId: "invalid_provider",
          },
        });
        expect.fail("Should have thrown");
      } catch (e) {
        if (e instanceof ZodError) {
          expect(
            e.issues.some(
              (i) => i.path.includes("providerId") || i.path.includes("data"),
            ),
          ).toBe(true);
        }
      }
    });

    it("error内のcodeが無効な場合のエラー", () => {
      try {
        validateChatResponse({
          success: false,
          error: {
            code: "INVALID_CODE",
            message: "Error",
            retryable: false,
          },
        });
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(ZodError);
      }
    });
  });

  describe("有効なレスポンスのバリエーション", () => {
    it("成功レスポンス - 最小構成", () => {
      const result = validateChatResponse({
        success: true,
        data: {
          message: "Hello",
          modelId: "gpt-4o",
          providerId: "openai",
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe("Hello");
      }
    });

    it("成功レスポンス - 全フィールド", () => {
      const result = validateChatResponse({
        success: true,
        data: {
          message: "Hello",
          modelId: "gpt-4o",
          providerId: "openai",
          usage: {
            promptTokens: 10,
            completionTokens: 5,
            totalTokens: 15,
          },
          finishReason: "stop",
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.usage?.totalTokens).toBe(15);
        expect(result.data.finishReason).toBe("stop");
      }
    });

    it("失敗レスポンス - retryAfter付き", () => {
      const result = validateChatResponse({
        success: false,
        error: {
          code: "RATE_LIMIT",
          message: "Too many requests",
          retryable: true,
          retryAfter: 60,
        },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.retryAfter).toBe(60);
      }
    });
  });
});

// =============================================================================
// validateIPCRequest 詳細エラーテスト
// =============================================================================

describe("validateIPCRequest 詳細エラー", () => {
  describe("UUID検証", () => {
    it("無効なUUID形式を拒否", () => {
      try {
        validateIPCRequest({
          conversationId: "not-a-uuid",
          message: "Hello",
          history: [],
          providerId: "openai",
          modelId: "gpt-4o",
        });
        expect.fail("Should have thrown");
      } catch (e) {
        if (e instanceof ZodError) {
          expect(e.issues.some((i) => i.path.includes("conversationId"))).toBe(
            true,
          );
        }
      }
    });

    it("有効なUUID v4を受け入れる", () => {
      const result = validateIPCRequest({
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      });

      expect(result.conversationId).toBe(
        "550e8400-e29b-41d4-a716-446655440000",
      );
    });
  });

  describe("message検証", () => {
    it("空のメッセージを拒否", () => {
      try {
        validateIPCRequest({
          conversationId: "550e8400-e29b-41d4-a716-446655440000",
          message: "",
          history: [],
          providerId: "openai",
          modelId: "gpt-4o",
        });
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(ZodError);
      }
    });

    it("長いメッセージを受け入れる", () => {
      const longMessage = "a".repeat(50000);
      const result = validateIPCRequest({
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: longMessage,
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      });

      expect(result.message.length).toBe(50000);
    });
  });

  describe("history検証", () => {
    it("履歴内の無効なメッセージを拒否", () => {
      try {
        validateIPCRequest({
          conversationId: "550e8400-e29b-41d4-a716-446655440000",
          message: "Hello",
          history: [{ role: "invalid", content: "test" }],
          providerId: "openai",
          modelId: "gpt-4o",
        });
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(ZodError);
      }
    });

    it("複数の履歴メッセージを受け入れる", () => {
      const result = validateIPCRequest({
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "How are you?",
        history: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi! How can I help?" },
          { role: "user", content: "Tell me a joke" },
          { role: "assistant", content: "Why did the chicken cross the road?" },
        ],
        providerId: "openai",
        modelId: "gpt-4o",
      });

      expect(result.history.length).toBe(4);
    });
  });

  describe("ragEnabled デフォルト値", () => {
    it("ragEnabledが指定されない場合はfalse", () => {
      const result = validateIPCRequest({
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
      });

      expect(result.ragEnabled).toBe(false);
    });

    it("ragEnabled=trueを受け入れる", () => {
      const result = validateIPCRequest({
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
        message: "Hello",
        history: [],
        providerId: "openai",
        modelId: "gpt-4o",
        ragEnabled: true,
      });

      expect(result.ragEnabled).toBe(true);
    });
  });
});

// =============================================================================
// validateError 詳細テスト
// =============================================================================

describe("validateError 詳細テスト", () => {
  describe("エラーコードバリエーション", () => {
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
        const result = validateError({
          code,
          message: "Test error",
          retryable: false,
        });

        expect(result.code).toBe(code);
      });
    });
  });

  describe("originalError フィールド", () => {
    it("文字列のoriginalErrorを受け入れる", () => {
      const result = validateError({
        code: "UNKNOWN",
        message: "Error",
        retryable: false,
        originalError: "Original error string",
      });

      expect(result.originalError).toBe("Original error string");
    });

    it("オブジェクトのoriginalErrorを受け入れる", () => {
      const originalError = {
        name: "TypeError",
        message: "Cannot read property",
        stack: "Error at...",
      };

      const result = validateError({
        code: "UNKNOWN",
        message: "Error",
        retryable: false,
        originalError,
      });

      expect(result.originalError).toEqual(originalError);
    });

    it("nullのoriginalErrorを受け入れる", () => {
      const result = validateError({
        code: "UNKNOWN",
        message: "Error",
        retryable: false,
        originalError: null,
      });

      expect(result.originalError).toBeNull();
    });
  });
});

// =============================================================================
// safeParseChatResponse 詳細テスト
// =============================================================================

describe("safeParseChatResponse 詳細テスト", () => {
  describe("成功ケース", () => {
    it("有効な成功レスポンスをパース", () => {
      const result = safeParseChatResponse({
        success: true,
        data: {
          message: "Hello",
          modelId: "gpt-4o",
          providerId: "openai",
        },
      });

      expect(result).toBeDefined();
      expect(result?.success).toBe(true);
    });

    it("有効な失敗レスポンスをパース", () => {
      const result = safeParseChatResponse({
        success: false,
        error: {
          code: "TIMEOUT",
          message: "Request timed out",
          retryable: true,
        },
      });

      expect(result).toBeDefined();
      expect(result?.success).toBe(false);
    });
  });

  describe("失敗ケース", () => {
    it("null入力でundefinedを返す", () => {
      const result = safeParseChatResponse(null);
      expect(result).toBeUndefined();
    });

    it("undefined入力でundefinedを返す", () => {
      const result = safeParseChatResponse(undefined);
      expect(result).toBeUndefined();
    });

    it("空オブジェクトでundefinedを返す", () => {
      const result = safeParseChatResponse({});
      expect(result).toBeUndefined();
    });

    it("無効な構造でundefinedを返す", () => {
      const result = safeParseChatResponse({
        success: true,
        // dataが欠落
      });
      expect(result).toBeUndefined();
    });

    it("無効なproviderIdでundefinedを返す", () => {
      const result = safeParseChatResponse({
        success: true,
        data: {
          message: "Hello",
          modelId: "gpt-4o",
          providerId: "invalid",
        },
      });
      expect(result).toBeUndefined();
    });

    it("文字列入力でundefinedを返す", () => {
      const result = safeParseChatResponse("not an object");
      expect(result).toBeUndefined();
    });

    it("配列入力でundefinedを返す", () => {
      const result = safeParseChatResponse([1, 2, 3]);
      expect(result).toBeUndefined();
    });
  });

  describe("エッジケース", () => {
    it("例外を投げずにundefinedを返す", () => {
      // JSON.parseできないような入力でも例外を投げない
      expect(() => safeParseChatResponse(Symbol("test"))).not.toThrow();
      expect(safeParseChatResponse(Symbol("test"))).toBeUndefined();
    });

    it("循環参照を含むオブジェクトでundefinedを返す", () => {
      const obj: any = { success: true };
      obj.data = obj; // 循環参照

      // Zodは循環参照を検証しないが、undefinedを返すべき
      const result = safeParseChatResponse(obj);
      expect(result).toBeUndefined();
    });
  });
});
