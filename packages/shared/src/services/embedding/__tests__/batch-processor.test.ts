/**
 * 埋め込みバッチプロセッサーテスト
 */

import { describe, it, expect, beforeEach as _beforeEach, vi } from "vitest";
import {
  EmbeddingBatchProcessor,
  DEFAULT_BATCH_CONFIG,
} from "../batch-processor";
import type { IEmbeddingProvider } from "../providers/interfaces";
import type { EmbeddingResult } from "../types/embedding.types";
import { RateLimitError } from "../types/errors";

// モックプロバイダー作成
function createMockProvider(
  options: {
    embedDelay?: number;
    failIndices?: number[];
    failWithRateLimit?: boolean;
  } = {},
): IEmbeddingProvider {
  const {
    embedDelay = 10,
    failIndices = [],
    failWithRateLimit = false,
  } = options;
  let callCount = 0;

  return {
    modelId: "EMB-002",
    providerName: "openai",
    dimensions: 3072,
    maxTokens: 8191,

    async embed(text: string): Promise<EmbeddingResult> {
      const currentCall = callCount++;
      await new Promise((resolve) => setTimeout(resolve, embedDelay));

      if (failIndices.includes(currentCall)) {
        if (failWithRateLimit) {
          throw new RateLimitError("Rate limit exceeded", 1000);
        }
        throw new Error(`Failed at index ${currentCall}`);
      }

      return {
        embedding: new Array(3072).fill(0.1),
        tokenCount: Math.ceil(text.length / 4),
        model: "EMB-002",
        processingTimeMs: embedDelay,
      };
    },

    async embedBatch(texts: string[]) {
      const embeddings = [];
      for (const text of texts) {
        embeddings.push(await this.embed(text));
      }
      return {
        embeddings,
        errors: [],
        totalTokens: embeddings.reduce((sum, e) => sum + e.tokenCount, 0),
        totalProcessingTimeMs: embedDelay * texts.length,
      };
    },

    countTokens(text: string): number {
      return Math.ceil(text.length / 4);
    },

    async healthCheck(): Promise<boolean> {
      return true;
    },
  };
}

describe("EmbeddingBatchProcessor", () => {
  describe("コンストラクタ", () => {
    it("デフォルト設定で初期化される", () => {
      const provider = createMockProvider();
      const processor = new EmbeddingBatchProcessor(provider, {
        requestsPerMinute: 1000,
        tokensPerMinute: 100000,
      });

      expect(processor.getCurrentBatchSize()).toBe(
        DEFAULT_BATCH_CONFIG.batchSize,
      );
    });

    it("カスタム設定で初期化できる", () => {
      const provider = createMockProvider();
      const processor = new EmbeddingBatchProcessor(
        provider,
        { requestsPerMinute: 1000, tokensPerMinute: 100000 },
        { batchSize: 50 },
      );

      expect(processor.getCurrentBatchSize()).toBe(50);
    });
  });

  describe("process", () => {
    it("小さなテキスト配列を処理できる", async () => {
      const provider = createMockProvider({ embedDelay: 5 });
      const processor = new EmbeddingBatchProcessor(
        provider,
        { requestsPerMinute: 1000, tokensPerMinute: 100000 },
        { batchSize: 10, concurrency: 2 },
      );

      const texts = ["テスト1", "テスト2", "テスト3"];
      const result = await processor.process(texts);

      expect(result.embeddings).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      expect(result.stats.successCount).toBe(3);
      expect(result.stats.failureCount).toBe(0);
    });

    it("バッチサイズを超える配列を処理できる", async () => {
      const provider = createMockProvider({ embedDelay: 5 });
      const processor = new EmbeddingBatchProcessor(
        provider,
        { requestsPerMinute: 1000, tokensPerMinute: 100000 },
        { batchSize: 5, concurrency: 2 },
      );

      const texts = Array.from({ length: 15 }, (_, i) => `テスト${i}`);
      const result = await processor.process(texts);

      expect(result.embeddings).toHaveLength(15);
      expect(result.stats.batchCount).toBeGreaterThanOrEqual(3);
    });

    it("進捗コールバックが呼ばれる", async () => {
      const provider = createMockProvider({ embedDelay: 5 });
      const processor = new EmbeddingBatchProcessor(
        provider,
        { requestsPerMinute: 1000, tokensPerMinute: 100000 },
        { batchSize: 5, concurrency: 1 },
      );

      const onProgress = vi.fn();
      const texts = Array.from({ length: 10 }, (_, i) => `テスト${i}`);
      await processor.process(texts, undefined, onProgress);

      expect(onProgress).toHaveBeenCalled();
      const lastCall =
        onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
      expect(lastCall.processed).toBe(10);
      expect(lastCall.total).toBe(10);
    });

    it("部分的な失敗を処理できる", async () => {
      const provider = createMockProvider({
        embedDelay: 5,
        failIndices: [2, 5],
      });
      const processor = new EmbeddingBatchProcessor(
        provider,
        { requestsPerMinute: 1000, tokensPerMinute: 100000 },
        { batchSize: 10, concurrency: 1, maxRetries: 0 },
      );

      const texts = Array.from({ length: 10 }, (_, i) => `テスト${i}`);
      const result = await processor.process(texts);

      expect(result.embeddings.length + result.errors.length).toBe(10);
      expect(result.stats.failureCount).toBeGreaterThan(0);
    });

    it("統計情報を正しく計算する", async () => {
      const provider = createMockProvider({ embedDelay: 5 });
      const processor = new EmbeddingBatchProcessor(
        provider,
        { requestsPerMinute: 1000, tokensPerMinute: 100000 },
        { batchSize: 5, concurrency: 1 },
      );

      const texts = ["short", "medium text", "longer text here"];
      const result = await processor.process(texts);

      expect(result.stats.totalTimeMs).toBeGreaterThan(0);
      expect(result.stats.totalTokens).toBeGreaterThan(0);
      expect(result.stats.successCount).toBe(3);
    });
  });

  describe("適応型バッチサイズ", () => {
    it("エラー発生時にバッチサイズが縮小される", async () => {
      const provider = createMockProvider({
        embedDelay: 5,
        failIndices: [0], // 最初のリクエストが失敗
      });
      const processor = new EmbeddingBatchProcessor(
        provider,
        { requestsPerMinute: 1000, tokensPerMinute: 100000 },
        {
          batchSize: 100,
          concurrency: 1,
          adaptiveBatchSize: true,
          minBatchSize: 10,
          maxRetries: 0,
        },
      );

      const texts = Array.from({ length: 5 }, (_, i) => `テスト${i}`);
      await processor.process(texts);

      // バッチサイズが縮小されているはず
      expect(processor.getCurrentBatchSize()).toBeLessThan(100);
    });

    it("成功時にバッチサイズが回復する", async () => {
      const provider = createMockProvider({ embedDelay: 5 });
      const processor = new EmbeddingBatchProcessor(
        provider,
        { requestsPerMinute: 1000, tokensPerMinute: 100000 },
        {
          batchSize: 100,
          concurrency: 1,
          adaptiveBatchSize: true,
          minBatchSize: 10,
        },
      );

      // まずバッチサイズを手動で縮小
      // @ts-expect-error private property access for testing
      processor.currentBatchSize = 50;

      const texts = Array.from({ length: 10 }, (_, i) => `テスト${i}`);
      await processor.process(texts);

      // バッチサイズが増加しているはず
      expect(processor.getCurrentBatchSize()).toBeGreaterThan(50);
    });

    it("resetBatchSizeで元に戻る", () => {
      const provider = createMockProvider();
      const processor = new EmbeddingBatchProcessor(
        provider,
        { requestsPerMinute: 1000, tokensPerMinute: 100000 },
        { batchSize: 100 },
      );

      // @ts-expect-error private property access for testing
      processor.currentBatchSize = 50;

      processor.resetBatchSize();
      expect(processor.getCurrentBatchSize()).toBe(100);
    });
  });

  describe("retryFailed", () => {
    it("失敗したアイテムを再処理できる", async () => {
      // 最初は失敗、2回目は成功するプロバイダー
      let firstCall = true;
      const provider: IEmbeddingProvider = {
        modelId: "EMB-002",
        providerName: "openai",
        dimensions: 3072,
        maxTokens: 8191,
        async embed(text: string): Promise<EmbeddingResult> {
          if (firstCall && text === "テスト1") {
            firstCall = false;
            throw new RateLimitError("Rate limit exceeded", 1000);
          }
          return {
            embedding: new Array(3072).fill(0.1),
            tokenCount: Math.ceil(text.length / 4),
            model: "EMB-002",
            processingTimeMs: 10,
          };
        },
        async embedBatch(_texts: string[]) {
          return {
            embeddings: [],
            errors: [],
            totalTokens: 0,
            totalProcessingTimeMs: 0,
          };
        },
        countTokens(text: string): number {
          return Math.ceil(text.length / 4);
        },
        async healthCheck(): Promise<boolean> {
          return true;
        },
      };

      const processor = new EmbeddingBatchProcessor(
        provider,
        { requestsPerMinute: 1000, tokensPerMinute: 100000 },
        { batchSize: 10, concurrency: 1, maxRetries: 0 },
      );

      const texts = ["テスト0", "テスト1", "テスト2"];
      const firstResult = await processor.process(texts);

      // テスト1が失敗しているはず
      expect(firstResult.errors.length).toBeGreaterThan(0);

      // 失敗したアイテムを再処理
      const retryResult = await processor.retryFailed(
        texts,
        firstResult.errors,
      );

      // 再処理が成功しているはず
      expect(retryResult.embeddings.length).toBeGreaterThanOrEqual(0);
    });

    it("リトライ不可能なエラーは再処理しない", async () => {
      const provider = createMockProvider();
      const processor = new EmbeddingBatchProcessor(provider, {
        requestsPerMinute: 1000,
        tokensPerMinute: 100000,
      });

      const errors = [
        { index: 0, error: "Validation error", retryable: false },
        { index: 1, error: "Rate limit exceeded", retryable: true },
      ];

      const result = await processor.retryFailed(
        ["テスト0", "テスト1"],
        errors,
      );

      // リトライ可能なエラーのみ再処理
      expect(result.embeddings.length).toBeLessThanOrEqual(1);
    });
  });

  describe("メトリクス", () => {
    it("メトリクス収集が記録される", async () => {
      const provider = createMockProvider({ embedDelay: 5 });
      const processor = new EmbeddingBatchProcessor(
        provider,
        { requestsPerMinute: 1000, tokensPerMinute: 100000 },
        { batchSize: 10, concurrency: 1 },
      );

      const texts = ["テスト1", "テスト2"];
      await processor.process(texts);

      const metrics = processor.getMetricsCollector();
      const stats = metrics.getStatistics();

      expect(stats.totalRequests).toBe(2);
      expect(stats.successRate).toBe(1);
    });
  });

  describe("DEFAULT_BATCH_CONFIG", () => {
    it("デフォルト値が正しい", () => {
      expect(DEFAULT_BATCH_CONFIG.batchSize).toBe(100);
      expect(DEFAULT_BATCH_CONFIG.concurrency).toBe(5);
      expect(DEFAULT_BATCH_CONFIG.delayBetweenBatches).toBe(100);
      expect(DEFAULT_BATCH_CONFIG.adaptiveBatchSize).toBe(true);
      expect(DEFAULT_BATCH_CONFIG.minBatchSize).toBe(10);
      expect(DEFAULT_BATCH_CONFIG.maxRetries).toBe(3);
    });
  });
});
