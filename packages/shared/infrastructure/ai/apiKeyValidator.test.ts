/**
 * APIキー検証サービス テスト
 *
 * TDD Phase: Red（失敗するテストを先に作成）
 *
 * @see docs/30-workflows/api-key-management/architecture.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// === Mock Setup ===

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocks
import {
  validateApiKey,
  createApiKeyValidator,
  API_KEY_VALIDATION_TIMEOUT_MS,
} from "./apiKeyValidator";
import type { AIProvider } from "../../types/api-keys";

// === Test Helpers ===

function createMockResponse(
  status: number,
  body: unknown = {},
  ok: boolean = status >= 200 && status < 300,
) {
  return {
    ok,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  };
}

function createTimeoutError(): Error {
  const error = new Error("The operation was aborted");
  error.name = "AbortError";
  return error;
}

function createNetworkError(): Error {
  const error = new Error("Network request failed");
  error.name = "TypeError";
  return error;
}

// === Tests ===

describe("apiKeyValidator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // === Constants ===

  describe("API_KEY_VALIDATION_TIMEOUT_MS", () => {
    it("should be 10000ms (10 seconds)", () => {
      expect(API_KEY_VALIDATION_TIMEOUT_MS).toBe(10000);
    });
  });

  // === OpenAI Validation ===

  describe("OpenAI validation", () => {
    const provider: AIProvider = "openai";
    const validKey = "sk-test1234567890abcdef";

    it("should return valid status for correct API key", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(200, { data: [{ id: "gpt-4" }] }),
      );

      const result = await validateApiKey(provider, validKey);

      expect(result.provider).toBe("openai");
      expect(result.status).toBe("valid");
      expect(result.validatedAt).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/models",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${validKey}`,
          }),
        }),
      );
    });

    it("should return invalid status for incorrect API key (401)", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(
          401,
          { error: { message: "Invalid API key" } },
          false,
        ),
      );

      const result = await validateApiKey(provider, "sk-invalid-key");

      expect(result.status).toBe("invalid");
      expect(result.httpStatusCode).toBe(401);
      expect(result.errorMessage).toBeDefined();
    });

    it("should return invalid status for expired API key (403)", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(
          403,
          { error: { message: "API key expired" } },
          false,
        ),
      );

      const result = await validateApiKey(provider, validKey);

      expect(result.status).toBe("invalid");
      expect(result.httpStatusCode).toBe(403);
    });

    it("should return network_error status on network failure", async () => {
      mockFetch.mockRejectedValue(createNetworkError());

      const result = await validateApiKey(provider, validKey);

      expect(result.status).toBe("network_error");
      expect(result.errorMessage).toBeDefined();
    });

    it("should return timeout status when request times out", async () => {
      mockFetch.mockRejectedValue(createTimeoutError());

      const result = await validateApiKey(provider, validKey);

      expect(result.status).toBe("timeout");
      expect(result.errorMessage).toContain("タイムアウト");
    });

    it("should not include API key in error messages", async () => {
      mockFetch.mockRejectedValue(new Error(`Failed with key: ${validKey}`));

      const result = await validateApiKey(provider, validKey);

      expect(result.errorMessage).not.toContain(validKey);
      expect(result.errorMessage).not.toContain("sk-");
    });
  });

  // === Anthropic Validation ===

  describe("Anthropic validation", () => {
    const provider: AIProvider = "anthropic";
    const validKey = "sk-ant-api03-test1234567890";

    it("should return valid status for correct API key", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(200, { id: "msg_01", type: "message" }),
      );

      const result = await validateApiKey(provider, validKey);

      expect(result.provider).toBe("anthropic");
      expect(result.status).toBe("valid");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.anthropic.com/v1/messages",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "x-api-key": validKey,
            "anthropic-version": expect.any(String),
          }),
        }),
      );
    });

    it("should send minimal request body for validation", async () => {
      mockFetch.mockResolvedValue(createMockResponse(200, {}));

      await validateApiKey(provider, validKey);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.model).toBeDefined();
      expect(requestBody.max_tokens).toBeLessThanOrEqual(1);
      expect(requestBody.messages).toBeDefined();
    });

    it("should return invalid status for incorrect API key (401)", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(
          401,
          { error: { type: "authentication_error" } },
          false,
        ),
      );

      const result = await validateApiKey(provider, "sk-ant-invalid");

      expect(result.status).toBe("invalid");
      expect(result.httpStatusCode).toBe(401);
    });

    it("should handle rate limit (429) as valid key but rate limited", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(429, { error: { type: "rate_limit_error" } }, false),
      );

      const result = await validateApiKey(provider, validKey);

      // Rate limit means the key is valid, just rate limited
      expect(result.status).toBe("valid");
    });

    it("should return network_error status on network failure", async () => {
      mockFetch.mockRejectedValue(createNetworkError());

      const result = await validateApiKey(provider, validKey);

      expect(result.status).toBe("network_error");
    });
  });

  // === Google AI Validation ===

  describe("Google AI validation", () => {
    const provider: AIProvider = "google";
    const validKey = "AIzaSyTest1234567890abcdef";

    it("should return valid status for correct API key", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(200, { models: [{ name: "models/gemini-pro" }] }),
      );

      const result = await validateApiKey(provider, validKey);

      expect(result.provider).toBe("google");
      expect(result.status).toBe("valid");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "https://generativelanguage.googleapis.com/v1/models",
        ),
        expect.objectContaining({
          method: "GET",
        }),
      );
    });

    it("should include API key as query parameter", async () => {
      mockFetch.mockResolvedValue(createMockResponse(200, { models: [] }));

      await validateApiKey(provider, validKey);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain(`key=${validKey}`);
    });

    it("should return invalid status for incorrect API key (400)", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(
          400,
          { error: { message: "API key not valid" } },
          false,
        ),
      );

      const result = await validateApiKey(provider, "invalid-key");

      expect(result.status).toBe("invalid");
      expect(result.httpStatusCode).toBe(400);
    });

    it("should return invalid status for incorrect API key (403)", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(
          403,
          { error: { message: "Permission denied" } },
          false,
        ),
      );

      const result = await validateApiKey(provider, validKey);

      expect(result.status).toBe("invalid");
      expect(result.httpStatusCode).toBe(403);
    });

    it("should return network_error status on network failure", async () => {
      mockFetch.mockRejectedValue(createNetworkError());

      const result = await validateApiKey(provider, validKey);

      expect(result.status).toBe("network_error");
    });
  });

  // === xAI Validation ===

  describe("xAI validation", () => {
    const provider: AIProvider = "xai";
    const validKey = "xai-test1234567890abcdef";

    it("should return valid status for correct API key", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(200, { data: [{ id: "grok-1" }] }),
      );

      const result = await validateApiKey(provider, validKey);

      expect(result.provider).toBe("xai");
      expect(result.status).toBe("valid");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.x.ai/v1/models",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${validKey}`,
          }),
        }),
      );
    });

    it("should return invalid status for incorrect API key (401)", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(401, { error: { message: "Unauthorized" } }, false),
      );

      const result = await validateApiKey(provider, "xai-invalid");

      expect(result.status).toBe("invalid");
      expect(result.httpStatusCode).toBe(401);
    });

    it("should return network_error status on network failure", async () => {
      mockFetch.mockRejectedValue(createNetworkError());

      const result = await validateApiKey(provider, validKey);

      expect(result.status).toBe("network_error");
    });
  });

  // === Error Handling ===

  describe("Error handling", () => {
    it("should handle server errors (500) as unknown_error", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(500, { error: "Internal server error" }, false),
      );

      const result = await validateApiKey("openai", "sk-test123");

      expect(result.status).toBe("unknown_error");
      expect(result.httpStatusCode).toBe(500);
    });

    it("should handle service unavailable (503) as network_error", async () => {
      mockFetch.mockResolvedValue(
        createMockResponse(503, { error: "Service unavailable" }, false),
      );

      const result = await validateApiKey("openai", "sk-test123");

      expect(result.status).toBe("network_error");
      expect(result.httpStatusCode).toBe(503);
    });

    it("should sanitize error messages containing API key", async () => {
      const secretKey = "sk-secret-key-12345";
      mockFetch.mockRejectedValue(
        new Error(`Request failed for key ${secretKey}`),
      );

      const result = await validateApiKey("openai", secretKey);

      expect(result.errorMessage).not.toContain(secretKey);
      expect(result.errorMessage).not.toContain("sk-");
    });

    it("should return unknown_error for unexpected exceptions", async () => {
      mockFetch.mockRejectedValue(new Error("Unexpected error"));

      const result = await validateApiKey("openai", "sk-test123");

      expect(result.status).toBe("unknown_error");
      expect(result.errorMessage).toBeDefined();
    });
  });

  // === createApiKeyValidator Factory ===

  describe("createApiKeyValidator", () => {
    it("should return a validator with validate method", () => {
      const validator = createApiKeyValidator();

      expect(validator).toHaveProperty("validate");
      expect(typeof validator.validate).toBe("function");
    });

    it("should validate API key using the validate method", async () => {
      mockFetch.mockResolvedValue(createMockResponse(200, {}));

      const validator = createApiKeyValidator();
      const result = await validator.validate("openai", "sk-test123");

      expect(result.provider).toBe("openai");
      expect(result.status).toBeDefined();
    });
  });

  // === Security Tests ===

  describe("Security", () => {
    it("should not log API key in any case", async () => {
      const consoleSpy = vi.spyOn(console, "log");
      const consoleErrorSpy = vi.spyOn(console, "error");
      const consoleWarnSpy = vi.spyOn(console, "warn");

      const secretKey = "sk-super-secret-key-12345";
      mockFetch.mockResolvedValue(createMockResponse(200, {}));

      await validateApiKey("openai", secretKey);

      const allLogCalls = [
        ...consoleSpy.mock.calls.flat(),
        ...consoleErrorSpy.mock.calls.flat(),
        ...consoleWarnSpy.mock.calls.flat(),
      ].join(" ");

      expect(allLogCalls).not.toContain(secretKey);

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it("should use AbortController for timeout control", async () => {
      // Verify that AbortController is used by checking the signal is passed to fetch
      mockFetch.mockImplementation((_url: string, options: RequestInit) => {
        // Check that signal is passed
        expect(options.signal).toBeDefined();
        expect(options.signal).toBeInstanceOf(AbortSignal);

        // Simulate immediate abort
        return Promise.reject(createTimeoutError());
      });

      const result = await validateApiKey("openai", "sk-test123");
      expect(result.status).toBe("timeout");
    });
  });

  // === Boundary Value Tests ===

  describe("Boundary values", () => {
    it("should handle empty API key", async () => {
      const result = await validateApiKey("openai", "");

      expect(result.status).toBe("invalid");
      expect(result.errorMessage).toContain("入力されていません");
    });

    it("should handle very long API key", async () => {
      const longKey = "sk-" + "a".repeat(1000);
      mockFetch.mockResolvedValue(
        createMockResponse(401, { error: "Invalid" }, false),
      );

      const result = await validateApiKey("openai", longKey);

      // Should not crash, should return invalid
      expect(result.status).toBe("invalid");
    });

    it("should handle API key with special characters", async () => {
      const specialKey = "sk-test<script>alert('xss')</script>";

      const result = await validateApiKey("openai", specialKey);

      // Should reject or handle safely
      expect(result.status).toBe("invalid");
    });
  });
});
