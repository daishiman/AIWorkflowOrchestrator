/**
 * mapLLMErrorToStreamingError 単体テスト (T-01 〜 T-08)
 *
 * Phase 4: TDD テストファースト
 * P63 準拠: 同ディレクトリ既存テストのインポートパスを参照
 */

import { describe, it, expect } from "vitest";
import { mapLLMErrorToStreamingError } from "../mapLLMErrorToStreamingError";

describe("mapLLMErrorToStreamingError", () => {
  describe("T-01: API_KEY_MISSING", () => {
    it("action=SETTINGS, retryable=false を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "API_KEY_MISSING",
        message: "API key not found",
      });
      expect(result.action).toBe("SETTINGS");
      expect(result.retryable).toBe(false);
      expect(result.hint).toBeUndefined();
      expect(result.code).toBe("API_KEY_MISSING");
    });
  });

  describe("T-02: MODEL_NOT_FOUND", () => {
    it("action=SETTINGS, retryable=false を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "MODEL_NOT_FOUND",
        message: "Model not found",
      });
      expect(result.action).toBe("SETTINGS");
      expect(result.retryable).toBe(false);
    });
  });

  describe("T-03: NETWORK_ERROR", () => {
    it("action=RETRY, retryable=true を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "NETWORK_ERROR",
        message: "Connection failed",
      });
      expect(result.action).toBe("RETRY");
      expect(result.retryable).toBe(true);
      expect(result.hint).toBeUndefined();
    });
  });

  describe("T-04: TIMEOUT", () => {
    it("action=RETRY, retryable=true を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "TIMEOUT",
        message: "Request timed out",
      });
      expect(result.action).toBe("RETRY");
      expect(result.retryable).toBe(true);
    });
  });

  describe("T-05: RATE_LIMIT", () => {
    it("action=RETRY, retryable=true, hint文字列あり を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "RATE_LIMIT",
        message: "Too many requests",
      });
      expect(result.action).toBe("RETRY");
      expect(result.retryable).toBe(true);
      expect(typeof result.hint).toBe("string");
      expect(result.hint!.length).toBeGreaterThan(0);
    });
  });

  describe("T-06: VALIDATION_ERROR", () => {
    it("action=null, retryable=false を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "VALIDATION_ERROR",
        message: "Invalid input",
      });
      expect(result.action).toBeNull();
      expect(result.retryable).toBe(false);
    });
  });

  describe("T-07: 未知のエラーコード", () => {
    it("action=null, retryable=false を返す", () => {
      const result = mapLLMErrorToStreamingError({
        code: "UNKNOWN_CODE",
        message: "Something went wrong",
      });
      expect(result.action).toBeNull();
      expect(result.retryable).toBe(false);
    });
  });

  describe("T-08: codeフィールドなし", () => {
    it("action=null, retryable=false を返す", () => {
      const result = mapLLMErrorToStreamingError({
        message: "No code field",
      } as { code?: string; message: string });
      expect(result.action).toBeNull();
      expect(result.retryable).toBe(false);
      expect(result.code).toBe("UNKNOWN");
    });
  });

  describe("共通: codeフィールドが常に返る", () => {
    it("すべてのケースでcode文字列が返る", () => {
      const codes = [
        "API_KEY_MISSING",
        "NETWORK_ERROR",
        "RATE_LIMIT",
        "VALIDATION_ERROR",
        "UNKNOWN",
      ];
      for (const code of codes) {
        const result = mapLLMErrorToStreamingError({ code, message: "test" });
        expect(typeof result.code).toBe("string");
        expect(typeof result.message).toBe("string");
      }
    });
  });
});
