/**
 * Qwen3埋め込みプロバイダーテスト
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { Qwen3EmbeddingProvider } from "../../providers/qwen3-provider";
import { RateLimiter } from "../../utils/rate-limiter";
import { CircuitBreaker } from "../../utils/circuit-breaker";
import { RetryHandler, DEFAULT_RETRY_OPTIONS } from "../../utils/retry-handler";
import { MetricsCollector } from "../../utils/metrics-collector";
import {
  ProviderError,
  TimeoutError as _TimeoutError,
} from "../../types/errors";

// fetch をモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Qwen3EmbeddingProvider", () => {
  let provider: Qwen3EmbeddingProvider;
  let rateLimiter: RateLimiter;
  let circuitBreaker: CircuitBreaker;
  let retryHandler: RetryHandler;
  let metricsCollector: MetricsCollector;

  beforeEach(() => {
    vi.clearAllMocks();

    rateLimiter = new RateLimiter({
      requestsPerMinute: 500,
      tokensPerMinute: 500000,
    });

    circuitBreaker = new CircuitBreaker({
      errorThreshold: 5,
      timeout: 30000,
      resetTimeout: 60000,
    });

    retryHandler = new RetryHandler(DEFAULT_RETRY_OPTIONS);
    metricsCollector = new MetricsCollector();

    provider = new Qwen3EmbeddingProvider(
      { apiKey: "test-api-key" },
      rateLimiter,
      circuitBreaker,
      retryHandler,
      metricsCollector,
    );
  });

  describe("プロパティ", () => {
    it("modelId が EMB-001 である", () => {
      expect(provider.modelId).toBe("EMB-001");
    });

    it("providerName が dashscope である", () => {
      expect(provider.providerName).toBe("dashscope");
    });

    it("dimensions が 4096 である", () => {
      expect(provider.dimensions).toBe(4096);
    });

    it("maxTokens が 8192 である", () => {
      expect(provider.maxTokens).toBe(8192);
    });
  });

  describe("コンストラクタ", () => {
    it("APIキーがない場合、ProviderErrorをスローする", () => {
      // 環境変数をクリア
      const originalEnv = process.env.DASHSCOPE_API_KEY;
      delete process.env.DASHSCOPE_API_KEY;

      expect(() => {
        new Qwen3EmbeddingProvider(
          {},
          rateLimiter,
          circuitBreaker,
          retryHandler,
          metricsCollector,
        );
      }).toThrow(ProviderError);

      // 環境変数を復元
      if (originalEnv) {
        process.env.DASHSCOPE_API_KEY = originalEnv;
      }
    });

    it("カスタムエンドポイントを設定できる", () => {
      const customProvider = new Qwen3EmbeddingProvider(
        {
          apiKey: "test-key",
          apiEndpoint: "https://custom.endpoint.com/api",
        },
        rateLimiter,
        circuitBreaker,
        retryHandler,
        metricsCollector,
      );

      expect(customProvider).toBeDefined();
    });
  });

  describe("countTokens", () => {
    it("英語テキストのトークン数を計算する", () => {
      const text = "Hello, world!";
      const tokens = provider.countTokens(text);
      // 13文字 / 4 = 4トークン（切り上げ）
      expect(tokens).toBeGreaterThan(0);
    });

    it("日本語テキストのトークン数を計算する", () => {
      const text = "こんにちは世界";
      const tokens = provider.countTokens(text);
      // 7文字 / 1.5 = 5トークン（切り上げ）
      expect(tokens).toBeGreaterThan(0);
    });

    it("混合テキストのトークン数を計算する", () => {
      const text = "Hello こんにちは world 世界";
      const tokens = provider.countTokens(text);
      expect(tokens).toBeGreaterThan(0);
    });

    it("空文字列の場合、最低1トークンを返す", () => {
      const tokens = provider.countTokens("");
      expect(tokens).toBe(1);
    });
  });

  describe("embed", () => {
    it("正常に埋め込みベクトルを生成する", async () => {
      const mockEmbedding = new Array(4096).fill(0.1);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          output: {
            embeddings: [{ embedding: mockEmbedding, text_index: 0 }],
          },
          usage: { total_tokens: 10 },
          request_id: "test-request-id",
        }),
      });

      const _result = await provider.embed("テスト文章");

      expect(result.embedding).toEqual(mockEmbedding);
      expect(result.model).toBe("EMB-001");
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("カスタム次元数を指定できる", async () => {
      const mockEmbedding = new Array(1024).fill(0.1);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          output: {
            embeddings: [{ embedding: mockEmbedding, text_index: 0 }],
          },
          usage: { total_tokens: 10 },
          request_id: "test-request-id",
        }),
      });

      const _result = await provider.embed("テスト", { dimensions: 1024 });

      // リクエストボディの確認
      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.parameters.dimension).toBe(1024);
    });

    it("APIエラー時にProviderErrorをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({
          code: "InvalidApiKey",
          message: "Invalid API key",
          request_id: "test-request-id",
        }),
      });

      await expect(provider.embed("テスト")).rejects.toThrow(
        "Embedding failed",
      );
    });

    it("空のレスポンス時にエラーをスローする", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          output: { embeddings: [] },
          usage: { total_tokens: 0 },
          request_id: "test-request-id",
        }),
      });

      await expect(provider.embed("テスト")).rejects.toThrow(
        "Embedding failed",
      );
    });

    it("トークン数超過時にTokenLimitErrorをスローする", async () => {
      // 8192トークンを超える長いテキストを生成
      const longText = "あ".repeat(20000);

      await expect(provider.embed(longText)).rejects.toThrow(
        "Text exceeds max tokens",
      );
    });
  });

  describe("embedBatch", () => {
    it("複数テキストをバッチ処理できる", async () => {
      const mockEmbedding = new Array(4096).fill(0.1);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          output: {
            embeddings: [{ embedding: mockEmbedding, text_index: 0 }],
          },
          usage: { total_tokens: 10 },
          request_id: "test-request-id",
        }),
      });

      const texts = ["テスト1", "テスト2", "テスト3"];
      const _result = await provider.embedBatch(texts);

      expect(result.embeddings).toHaveLength(3);
      expect(result.totalProcessingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("進捗コールバックが呼ばれる", async () => {
      const mockEmbedding = new Array(4096).fill(0.1);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          output: {
            embeddings: [{ embedding: mockEmbedding, text_index: 0 }],
          },
          usage: { total_tokens: 10 },
          request_id: "test-request-id",
        }),
      });

      const onProgress = vi.fn();
      const texts = ["テスト1", "テスト2"];
      await provider.embedBatch(texts, { onProgress });

      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe("healthCheck", () => {
    it("正常時にtrueを返す", async () => {
      const mockEmbedding = new Array(4096).fill(0.1);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          output: {
            embeddings: [{ embedding: mockEmbedding, text_index: 0 }],
          },
          usage: { total_tokens: 2 },
          request_id: "test-request-id",
        }),
      });

      const _result = await provider.healthCheck();
      expect(result).toBe(true);
    });

    it("エラー時にfalseを返す", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Connection failed"));

      const _result = await provider.healthCheck();
      expect(result).toBe(false);
    });
  });
});
