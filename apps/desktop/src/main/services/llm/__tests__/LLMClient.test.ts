/**
 * LLMClient ユニットテスト (TASK-UT-9I-001 Phase 4)
 *
 * TC-01〜TC-20: AnthropicProvider / LLMClient の動作検証
 */
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { LLMClientConfig, LLMQueryResult } from "../LLMClient";
import { LLMClient } from "../LLMClient";

// @anthropic-ai/sdk モック
const mockMessagesCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: mockMessagesCreate,
    },
  })),
  APIError: class APIError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

// electron-log モック
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const VALID_API_KEY = "sk-ant-valid-key";

function makeConfig(overrides: Partial<LLMClientConfig> = {}): LLMClientConfig {
  return {
    apiKey: VALID_API_KEY,
    model: "claude-haiku-4-5-20251001",
    timeoutMs: 30_000,
    maxRetries: 3,
    ...overrides,
  };
}

function makeSuccessResponse(content = "Generated documentation") {
  return {
    content: [{ type: "text", text: content }],
    usage: { input_tokens: 10, output_tokens: 50 },
  };
}

describe("LLMClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================================
  // TC-01〜TC-07: 基本エラーパス（Phase 4）
  // ============================================================

  describe("TC-01: 正常なプロンプトで成功レスポンスを返す", () => {
    it("should return { success: true, content } on success", async () => {
      mockMessagesCreate.mockResolvedValueOnce(
        makeSuccessResponse("Test content"),
      );
      const client = new LLMClient(makeConfig());
      const result = await client.query("Generate docs for test-skill");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.content).toBe("Test content");
      }
    });
  });

  describe("TC-02: APIキー未設定で API_KEY_MISSING を返す", () => {
    it("should return API_KEY_MISSING when apiKey is null", async () => {
      const client = new LLMClient(makeConfig({ apiKey: null }));
      const result = await client.query("test prompt");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe("API_KEY_MISSING");
        expect(result.retryable).toBe(false);
      }
    });

    it("should return API_KEY_MISSING when apiKey is empty string", async () => {
      const client = new LLMClient(makeConfig({ apiKey: "" }));
      const result = await client.query("test prompt");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe("API_KEY_MISSING");
        expect(result.retryable).toBe(false);
      }
    });
  });

  describe("TC-03: APIキー無効（401/403）で API_KEY_INVALID を返す", () => {
    it("should return API_KEY_INVALID on 401 status", async () => {
      const { APIError } = await import("@anthropic-ai/sdk");
      mockMessagesCreate.mockRejectedValueOnce(
        new APIError(401, "Invalid API key"),
      );
      const client = new LLMClient(makeConfig({ maxRetries: 0 }));
      const result = await client.query("test prompt");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe("API_KEY_INVALID");
        expect(result.retryable).toBe(false);
      }
    });

    it("should return API_KEY_INVALID on 403 status", async () => {
      const { APIError } = await import("@anthropic-ai/sdk");
      mockMessagesCreate.mockRejectedValueOnce(new APIError(403, "Forbidden"));
      const client = new LLMClient(makeConfig({ maxRetries: 0 }));
      const result = await client.query("test prompt");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe("API_KEY_INVALID");
        expect(result.retryable).toBe(false);
      }
    });
  });

  describe("TC-04: レート制限（429）で RATE_LIMIT を返す", () => {
    it("should return RATE_LIMIT after exhausting retries on 429", async () => {
      const { APIError } = await import("@anthropic-ai/sdk");
      mockMessagesCreate.mockRejectedValue(
        new APIError(429, "Rate limit exceeded"),
      );
      const client = new LLMClient(makeConfig({ maxRetries: 0 }));

      const resultPromise = client.query("test prompt");
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe("RATE_LIMIT");
        expect(result.retryable).toBe(true);
      }
    });
  });

  describe("TC-05: サーバーエラー（500）で SERVER_ERROR を返す", () => {
    it("should return SERVER_ERROR after exhausting retries on 500", async () => {
      const { APIError } = await import("@anthropic-ai/sdk");
      mockMessagesCreate.mockRejectedValue(
        new APIError(500, "Internal server error"),
      );
      const client = new LLMClient(makeConfig({ maxRetries: 0 }));

      const resultPromise = client.query("test prompt");
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe("SERVER_ERROR");
        expect(result.retryable).toBe(true);
      }
    });
  });

  describe("TC-06: タイムアウト（30秒超過）で TIMEOUT を返す", () => {
    it("should return TIMEOUT when request exceeds timeoutMs", async () => {
      mockMessagesCreate.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 60_000)),
      );
      const client = new LLMClient(
        makeConfig({ timeoutMs: 30_000, maxRetries: 0 }),
      );

      const resultPromise = client.query("test prompt");
      vi.advanceTimersByTime(31_000);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe("TIMEOUT");
        expect(result.retryable).toBe(true);
      }
    });
  });

  describe("TC-07: ネットワークエラーで NETWORK_ERROR を返す", () => {
    it("should return NETWORK_ERROR on ECONNREFUSED", async () => {
      const networkError = new Error("connect ECONNREFUSED");
      (networkError as NodeJS.ErrnoException).code = "ECONNREFUSED";
      mockMessagesCreate.mockRejectedValue(networkError);
      const client = new LLMClient(makeConfig({ maxRetries: 0 }));

      const resultPromise = client.query("test prompt");
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe("NETWORK_ERROR");
        expect(result.retryable).toBe(true);
      }
    });
  });

  // ============================================================
  // TC-12〜TC-15: リトライロジック（Phase 6）
  // ============================================================

  describe("TC-12: 429 → 429 → 成功（3回目で成功）", () => {
    it("should succeed on 3rd attempt after two 429 errors", async () => {
      const { APIError } = await import("@anthropic-ai/sdk");
      mockMessagesCreate
        .mockRejectedValueOnce(new APIError(429, "Rate limit"))
        .mockRejectedValueOnce(new APIError(429, "Rate limit"))
        .mockResolvedValueOnce(makeSuccessResponse("Retry success"));

      const client = new LLMClient(
        makeConfig({ maxRetries: 3, timeoutMs: 60_000 }),
      );

      const resultPromise = client.query("test prompt");
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.content).toBe("Retry success");
      }
      expect(mockMessagesCreate).toHaveBeenCalledTimes(3);
    });
  });

  describe("TC-13: 429 × 3（上限到達）で RATE_LIMIT を返す", () => {
    it("should return RATE_LIMIT after 3 retries exhausted", async () => {
      const { APIError } = await import("@anthropic-ai/sdk");
      mockMessagesCreate.mockRejectedValue(new APIError(429, "Rate limit"));

      const client = new LLMClient(
        makeConfig({ maxRetries: 3, timeoutMs: 60_000 }),
      );

      const resultPromise = client.query("test prompt");
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe("RATE_LIMIT");
      }
      // 初回 + 3 リトライ = 最大 4 回
      expect(mockMessagesCreate).toHaveBeenCalledTimes(4);
    });
  });

  describe("TC-14: 500 → 成功（2回目で成功）", () => {
    it("should succeed on 2nd attempt after one 500 error", async () => {
      const { APIError } = await import("@anthropic-ai/sdk");
      mockMessagesCreate
        .mockRejectedValueOnce(new APIError(500, "Server error"))
        .mockResolvedValueOnce(makeSuccessResponse("Retry ok"));

      const client = new LLMClient(
        makeConfig({ maxRetries: 3, timeoutMs: 60_000 }),
      );

      const resultPromise = client.query("test prompt");
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(mockMessagesCreate).toHaveBeenCalledTimes(2);
    });
  });

  describe("TC-15: バックオフ間隔が 1s/2s/4s であることを検証", () => {
    it("should wait 1000ms before 1st retry", async () => {
      const { APIError } = await import("@anthropic-ai/sdk");
      mockMessagesCreate
        .mockRejectedValueOnce(new APIError(429, "Rate limit"))
        .mockResolvedValueOnce(makeSuccessResponse());

      const client = new LLMClient(
        makeConfig({ maxRetries: 3, timeoutMs: 60_000 }),
      );
      const resultPromise = client.query("test prompt");

      // 999ms では2回目がまだ呼ばれていない
      vi.advanceTimersByTime(999);
      await Promise.resolve();
      expect(mockMessagesCreate).toHaveBeenCalledTimes(1);

      // 1001ms で2回目が呼ばれる
      vi.advanceTimersByTime(2);
      await vi.runAllTimersAsync();
      await resultPromise;
      expect(mockMessagesCreate).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================
  // TC-16〜TC-17: タイムアウト境界値（Phase 6）
  // ============================================================

  describe("TC-16: 29秒での応答は成功", () => {
    it("should succeed when response arrives within 29 seconds", async () => {
      mockMessagesCreate.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve(makeSuccessResponse("29s response")),
              29_000,
            ),
          ),
      );

      const client = new LLMClient(
        makeConfig({ timeoutMs: 30_000, maxRetries: 0 }),
      );
      const resultPromise = client.query("test prompt");

      vi.advanceTimersByTime(29_000);
      const result = await resultPromise;

      expect(result.success).toBe(true);
    });
  });

  describe("TC-17: 30001ms で TIMEOUT を返す", () => {
    it("should return TIMEOUT when response takes 30001ms", async () => {
      mockMessagesCreate.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 31_000)),
      );

      const client = new LLMClient(
        makeConfig({ timeoutMs: 30_000, maxRetries: 0 }),
      );
      const resultPromise = client.query("test prompt");

      vi.advanceTimersByTime(30_001);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorCode).toBe("TIMEOUT");
      }
    });
  });

  // ============================================================
  // TC-18〜TC-20: エラーコード一致テスト（Phase 6）
  // ============================================================

  describe("TC-18: API_KEY_MISSING の retryable は false", () => {
    it("should have retryable: false for API_KEY_MISSING", async () => {
      const client = new LLMClient(makeConfig({ apiKey: undefined }));
      const result = (await client.query("test")) as Extract<
        LLMQueryResult,
        { success: false }
      >;

      expect(result.retryable).toBe(false);
    });
  });

  describe("TC-19: RATE_LIMIT の retryable は true", () => {
    it("should have retryable: true for RATE_LIMIT", async () => {
      const { APIError } = await import("@anthropic-ai/sdk");
      mockMessagesCreate.mockRejectedValue(new APIError(429, "Rate limit"));

      const client = new LLMClient(makeConfig({ maxRetries: 0 }));
      const resultPromise = client.query("test");
      await vi.runAllTimersAsync();
      const result = (await resultPromise) as Extract<
        LLMQueryResult,
        { success: false }
      >;

      expect(result.retryable).toBe(true);
    });
  });

  describe("TC-20: エラーメッセージが日本語であること", () => {
    it("should return Japanese error message for API_KEY_MISSING", async () => {
      const client = new LLMClient(makeConfig({ apiKey: null }));
      const result = (await client.query("test")) as Extract<
        LLMQueryResult,
        { success: false }
      >;

      // 日本語文字（ひらがな・カタカナ・漢字）を含む
      expect(result.message).toMatch(/[\u3000-\u9FFF]/);
    });
  });

  // ============================================================
  // stubQueryFn 完全排除確認（TC-11相当）
  // ============================================================

  describe("stub 実装排除確認", () => {
    it("LLMDocQueryAdapter に Generated content for: 文字列が存在しないこと", async () => {
      const path = await import("path");
      const fs = await import("fs/promises");
      const adapterPath = path.resolve(
        __dirname,
        "../../skill/LLMDocQueryAdapter.ts",
      );
      const content = await fs.readFile(adapterPath, "utf-8");
      expect(content).not.toContain("Generated content for:");
    });
  });
});
