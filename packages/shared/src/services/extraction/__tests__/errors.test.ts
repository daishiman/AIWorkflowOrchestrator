/**
 * エラークラスのテスト
 * @description エラークラスの振る舞いをテスト
 */

import { describe, it, expect } from "vitest";
import {
  EntityExtractionError,
  LLMProviderError,
  JsonParseError,
  ValidationError,
  TimeoutError,
  EmptyInputError,
} from "../errors";

describe("エラークラス", () => {
  describe("EntityExtractionError", () => {
    it("基本的なエラー情報を保持する", () => {
      const error = new EntityExtractionError("Test error", "TEST_CODE");

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.name).toBe("EntityExtractionError");
      expect(error.cause).toBeUndefined();
    });

    it("原因エラーを保持できる", () => {
      const cause = new Error("Original error");
      const error = new EntityExtractionError(
        "Wrapped error",
        "WRAP_CODE",
        cause,
      );

      expect(error.cause).toBe(cause);
    });

    it("instanceofで判定できる", () => {
      const error = new EntityExtractionError("Test", "CODE");

      expect(error instanceof EntityExtractionError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe("LLMProviderError", () => {
    it("適切なコードで生成される", () => {
      const error = new LLMProviderError("LLM failed");

      expect(error.code).toBe("LLM_PROVIDER_ERROR");
      expect(error.name).toBe("LLMProviderError");
    });

    it("原因エラーを保持できる", () => {
      const cause = new Error("API timeout");
      const error = new LLMProviderError("LLM failed", cause);

      expect(error.cause).toBe(cause);
    });

    it("instanceofで判定できる", () => {
      const error = new LLMProviderError("Test");

      expect(error instanceof LLMProviderError).toBe(true);
      expect(error instanceof EntityExtractionError).toBe(true);
    });
  });

  describe("JsonParseError", () => {
    it("生テキストを保持する", () => {
      const rawText = "invalid json {{{";
      const error = new JsonParseError("Parse failed", rawText);

      expect(error.rawText).toBe(rawText);
      expect(error.code).toBe("JSON_PARSE_ERROR");
      expect(error.name).toBe("JsonParseError");
    });

    it("原因エラーを保持できる", () => {
      const cause = new SyntaxError("Unexpected token");
      const error = new JsonParseError("Parse failed", "bad json", cause);

      expect(error.cause).toBe(cause);
    });

    it("instanceofで判定できる", () => {
      const error = new JsonParseError("Test", "raw");

      expect(error instanceof JsonParseError).toBe(true);
      expect(error instanceof EntityExtractionError).toBe(true);
    });
  });

  describe("ValidationError", () => {
    it("バリデーションエラー詳細を保持する", () => {
      const validationErrors = [
        { field: "name", message: "Required" },
        { field: "type", message: "Invalid type" },
      ];
      const error = new ValidationError("Validation failed", validationErrors);

      expect(error.validationErrors).toEqual(validationErrors);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.name).toBe("ValidationError");
    });

    it("instanceofで判定できる", () => {
      const error = new ValidationError("Test", {});

      expect(error instanceof ValidationError).toBe(true);
      expect(error instanceof EntityExtractionError).toBe(true);
    });
  });

  describe("TimeoutError", () => {
    it("タイムアウト時間を保持する", () => {
      const error = new TimeoutError("Request timeout", 5000);

      expect(error.timeoutMs).toBe(5000);
      expect(error.code).toBe("TIMEOUT_ERROR");
      expect(error.name).toBe("TimeoutError");
    });

    it("instanceofで判定できる", () => {
      const error = new TimeoutError("Test", 1000);

      expect(error instanceof TimeoutError).toBe(true);
      expect(error instanceof EntityExtractionError).toBe(true);
    });
  });

  describe("EmptyInputError", () => {
    it("デフォルトメッセージで生成される", () => {
      const error = new EmptyInputError();

      expect(error.message).toBe("Input text is empty");
      expect(error.code).toBe("EMPTY_INPUT_ERROR");
      expect(error.name).toBe("EmptyInputError");
    });

    it("カスタムメッセージで生成できる", () => {
      const error = new EmptyInputError("Custom empty message");

      expect(error.message).toBe("Custom empty message");
    });

    it("instanceofで判定できる", () => {
      const error = new EmptyInputError();

      expect(error instanceof EmptyInputError).toBe(true);
      expect(error instanceof EntityExtractionError).toBe(true);
    });
  });
});
