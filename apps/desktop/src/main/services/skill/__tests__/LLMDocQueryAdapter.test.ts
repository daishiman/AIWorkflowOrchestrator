/**
 * LLMDocQueryAdapter テスト (TASK-UT-9I-001)
 *
 * LLMClient への委譲、API key 可用性判定、DocOperationResult への変換を検証する。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LLMDocQueryAdapter } from "../LLMDocQueryAdapter";
import type { LLMQueryResult } from "../../llm/LLMClient";

const { mockLLMClientCtor, mockLLMClientQuery, mockLogWarn, mockLogError } =
  vi.hoisted(() => {
    const query = vi.fn();
    const ctor = vi.fn().mockImplementation(() => ({
      query,
    }));

    return {
      mockLLMClientCtor: ctor,
      mockLLMClientQuery: query,
      mockLogWarn: vi.fn(),
      mockLogError: vi.fn(),
    };
  });

vi.mock("../../llm/LLMClient", () => ({
  LLMClient: mockLLMClientCtor,
}));

vi.mock("electron-log", () => ({
  default: {
    warn: mockLogWarn,
    error: mockLogError,
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("LLMDocQueryAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLLMClientQuery.mockReset();
  });

  it("defaults provider name to anthropic", () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key");
    expect(adapter.getProviderName()).toBe("anthropic");
  });

  it("returns custom provider name when provided", () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-key", "openai");
    expect(adapter.getProviderName()).toBe("openai");
  });

  it("isAvailable returns true when api key exists", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-valid-key");
    await expect(adapter.isAvailable()).resolves.toBe(true);
  });

  it("isAvailable returns false when api key missing", async () => {
    const adapter = new LLMDocQueryAdapter(() => null);
    await expect(adapter.isAvailable()).resolves.toBe(false);
  });

  it("isAvailable returns false when api key resolver throws", async () => {
    const adapter = new LLMDocQueryAdapter(() => {
      throw new Error("resolver failed");
    });

    await expect(adapter.isAvailable()).resolves.toBe(false);
    expect(mockLogWarn).toHaveBeenCalled();
  });

  it("query returns validation error for empty prompt", async () => {
    const adapter = new LLMDocQueryAdapter(() => "sk-valid-key");
    const result = await adapter.query("   ");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(1001);
      expect(result.error.category).toBe("VALIDATION");
      expect(result.error.retryable).toBe(false);
    }
  });

  it("query returns business error when api key is missing", async () => {
    const adapter = new LLMDocQueryAdapter(() => null);
    const result = await adapter.query("Generate docs");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(2001);
      expect(result.error.category).toBe("BUSINESS");
      expect(result.error.retryable).toBe(false);
      expect(result.error.guidance?.handoffAvailable).toBe(true);
    }
  });

  it("query delegates to LLMClient and returns generated content", async () => {
    const llmResult: LLMQueryResult = {
      success: true,
      content: "Generated documentation",
    };
    mockLLMClientQuery.mockResolvedValueOnce(llmResult);

    const adapter = new LLMDocQueryAdapter(() => "sk-valid-key");
    const result = await adapter.query("Generate docs for test-skill");

    expect(result).toEqual({
      success: true,
      data: "Generated documentation",
    });
    expect(mockLLMClientCtor).toHaveBeenCalledWith({
      apiKey: "sk-valid-key",
      model: "claude-haiku-4-5-20251001",
      timeoutMs: 30_000,
      maxRetries: 3,
    });
    expect(mockLLMClientQuery).toHaveBeenCalledWith(
      "Generate docs for test-skill",
    );
  });

  it.each([
    ["API_KEY_INVALID", 2002, "BUSINESS", false, true],
    ["RATE_LIMIT", 3002, "EXTERNAL_SERVICE", true, true],
    ["SERVER_ERROR", 3003, "EXTERNAL_SERVICE", true, true],
    ["TIMEOUT", 3001, "EXTERNAL_SERVICE", true, true],
    ["NETWORK_ERROR", 3004, "EXTERNAL_SERVICE", true, true],
    ["INTERNAL_ERROR", 5001, "INTERNAL", false, false],
  ] as const)(
    "maps %s to DocError code %i",
    async (errorCode, expectedCode, category, retryable, handoffAvailable) => {
      mockLLMClientQuery.mockResolvedValueOnce({
        success: false,
        errorCode,
        message: `${errorCode} message`,
        retryable,
      } satisfies LLMQueryResult);

      const adapter = new LLMDocQueryAdapter(() => "sk-valid-key");
      const result = await adapter.query("Generate docs");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(expectedCode);
        expect(result.error.category).toBe(category);
        expect(result.error.retryable).toBe(retryable);
        expect(result.error.guidance?.handoffAvailable ?? false).toBe(
          handoffAvailable,
        );
      }
    },
  );

  it("query returns internal error when LLMClient throws", async () => {
    mockLLMClientQuery.mockRejectedValueOnce(new Error("boom"));

    const adapter = new LLMDocQueryAdapter(() => "sk-valid-key");
    const result = await adapter.query("Generate docs");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(5001);
      expect(result.error.category).toBe("INTERNAL");
      expect(result.error.retryable).toBe(false);
      expect(result.error.message).toBe("Internal error");
    }
    expect(mockLogError).toHaveBeenCalled();
  });
});
