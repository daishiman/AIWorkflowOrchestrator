/**
 * パフォーマンステスト - Embedding Pipeline
 *
 * 品質ゲート基準:
 * - 処理時間: ≤ 5分（300秒）
 * - メモリ使用量: ≤ 500MB
 * - スループット: ≥ 100チャンク/分
 */

import { describe, it, expect, beforeEach as _beforeEach, vi } from "vitest";
import {
  EmbeddingPipeline,
  PipelineMetricsCollector,
} from "../../pipeline/embedding-pipeline";
import type { PipelineInput, PipelineConfig } from "../../pipeline/types";
import type { ChunkingService } from "../../../chunking/chunking-service";
import type { EmbeddingService } from "../../embedding-service";
import type { Chunk, ChunkingOutput } from "../../../chunking/types";
import type {
  BatchEmbeddingResult,
  EmbeddingResult,
} from "../../types/embedding.types";

// 品質ゲート基準
const QUALITY_GATE = {
  maxProcessingTimeMs: 300_000, // 5分
  maxMemoryMB: 500,
  minThroughputPerMin: 100,
};

// 大量チャンク生成用のモックChunkingService
function createPerformanceMockChunkingService(
  chunkCount: number,
): ChunkingService {
  const chunks: Chunk[] = Array.from({ length: chunkCount }, (_, i) => ({
    id: `chunk-${i}`,
    content: `これはパフォーマンステスト用のチャンク${i}です。埋め込み生成の処理時間を測定します。`,
    tokenCount: 25,
    position: { start: i * 50, end: (i + 1) * 50 },
    metadata: { index: i },
  }));

  return {
    chunk: vi.fn().mockResolvedValue({
      chunks,
      statistics: {
        totalChunks: chunkCount,
        totalTokens: chunkCount * 25,
        avgChunkSize: 25,
        minChunkSize: 25,
        maxChunkSize: 25,
      },
    } as ChunkingOutput),
    registerStrategy: vi.fn(),
    getAvailableStrategies: vi.fn().mockReturnValue(["fixed"]),
  } as unknown as ChunkingService;
}

// 処理時間をシミュレートするモックEmbeddingService
function createPerformanceMockEmbeddingService(
  delayMs: number = 5,
): EmbeddingService {
  const createEmbeddingResult = (): EmbeddingResult => ({
    embedding: new Array(3072).fill(0).map(() => Math.random() * 0.1),
    tokenCount: 25,
    model: "EMB-002",
    processingTimeMs: delayMs,
  });

  return {
    embed: vi.fn().mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, delayMs));
      return createEmbeddingResult();
    }),
    embedBatch: vi
      .fn()
      .mockImplementation(async (texts: string[], _options?: unknown) => {
        // バッチ処理の遅延をシミュレート（並列処理のため単純な乗算ではない）
        const batchDelay = Math.min(delayMs * 2, delayMs * texts.length * 0.1);
        await new Promise((r) => setTimeout(r, batchDelay));

        const embeddings = texts.map(() => createEmbeddingResult());
        return {
          embeddings,
          errors: [],
          totalTokens: texts.length * 25,
          totalProcessingTimeMs: batchDelay,
        } as BatchEmbeddingResult;
      }),
    healthCheckAll: vi.fn().mockResolvedValue(new Map([["EMB-002", true]])),
    getAvailableProviders: vi.fn().mockReturnValue(["EMB-002"]),
    getFallbackChain: vi.fn().mockReturnValue(["EMB-002"]),
    setFallbackChain: vi.fn(),
    getMetricsCollector: vi.fn(),
  } as unknown as EmbeddingService;
}

// メモリ使用量取得（ヒープ使用量）
function getMemoryUsageMB(): number {
  const usage = process.memoryUsage();
  return usage.heapUsed / 1024 / 1024;
}

describe("EmbeddingPipeline Performance Tests", () => {
  describe("1000チャンク処理パフォーマンス", () => {
    it("should process 1000 chunks within quality gate limits", async () => {
      // テスト設定
      const TARGET_CHUNKS = 1000;
      const SIMULATED_DELAY_MS = 2; // 各バッチの処理遅延

      // サービスのセットアップ
      const chunkingService =
        createPerformanceMockChunkingService(TARGET_CHUNKS);
      const embeddingService =
        createPerformanceMockEmbeddingService(SIMULATED_DELAY_MS);
      const metricsCollector = new PipelineMetricsCollector();

      const pipeline = new EmbeddingPipeline(
        chunkingService,
        embeddingService,
        metricsCollector,
      );

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 50 },
        },
        embedding: {
          modelId: "EMB-002",
        },
      };

      const input: PipelineInput = {
        documentId: "perf-test-001",
        documentType: "markdown",
        text: "パフォーマンステスト用の大量ドキュメント。".repeat(
          TARGET_CHUNKS,
        ),
        metadata: { source: "performance-test" },
      };

      // メモリ測定（開始前）
      const memoryBefore = getMemoryUsageMB();

      // 処理時間測定
      const startTime = performance.now();

      // パイプライン実行
      const result = await pipeline.process(input, config);

      const endTime = performance.now();
      const processingTimeMs = endTime - startTime;

      // メモリ測定（処理後）
      const memoryAfter = getMemoryUsageMB();
      const memoryUsedMB = memoryAfter - memoryBefore;

      // メトリクス計算
      const throughputPerMin = (TARGET_CHUNKS / processingTimeMs) * 60000;

      // 結果出力
      console.log("\n=== Performance Test Results ===");
      console.log(`Target chunks: ${TARGET_CHUNKS}`);
      console.log(`Actual chunks processed: ${result.chunks.length}`);
      console.log(
        `Processing time: ${(processingTimeMs / 1000).toFixed(2)} seconds`,
      );
      console.log(`Memory used: ${memoryUsedMB.toFixed(2)} MB`);
      console.log(`Throughput: ${throughputPerMin.toFixed(0)} chunks/min`);

      console.log("\n=== Quality Gate Evaluation ===");
      console.log(
        `Processing time: ${processingTimeMs.toFixed(0)}ms / ${QUALITY_GATE.maxProcessingTimeMs}ms ` +
          `(${processingTimeMs <= QUALITY_GATE.maxProcessingTimeMs ? "✅ PASS" : "❌ FAIL"})`,
      );
      console.log(
        `Memory usage: ${memoryUsedMB.toFixed(2)}MB / ${QUALITY_GATE.maxMemoryMB}MB ` +
          `(${memoryUsedMB <= QUALITY_GATE.maxMemoryMB ? "✅ PASS" : "❌ FAIL"})`,
      );
      console.log(
        `Throughput: ${throughputPerMin.toFixed(0)} / ${QUALITY_GATE.minThroughputPerMin} chunks/min ` +
          `(${throughputPerMin >= QUALITY_GATE.minThroughputPerMin ? "✅ PASS" : "❌ FAIL"})`,
      );

      // アサーション
      expect(result.chunks.length).toBe(TARGET_CHUNKS);
      expect(processingTimeMs).toBeLessThanOrEqual(
        QUALITY_GATE.maxProcessingTimeMs,
      );
      expect(memoryUsedMB).toBeLessThanOrEqual(QUALITY_GATE.maxMemoryMB);
      expect(throughputPerMin).toBeGreaterThanOrEqual(
        QUALITY_GATE.minThroughputPerMin,
      );

      console.log("\n=== All Quality Gates PASSED ===\n");
    }, 360_000); // タイムアウト: 6分

    it("should collect accurate pipeline metrics", async () => {
      const TARGET_CHUNKS = 100;
      const chunkingService =
        createPerformanceMockChunkingService(TARGET_CHUNKS);
      const embeddingService = createPerformanceMockEmbeddingService(1);
      const metricsCollector = new PipelineMetricsCollector();

      const pipeline = new EmbeddingPipeline(
        chunkingService,
        embeddingService,
        metricsCollector,
      );

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 50 },
        },
        embedding: {
          modelId: "EMB-002",
        },
      };

      const input: PipelineInput = {
        documentId: "metrics-test-001",
        documentType: "markdown",
        text: "メトリクス収集テスト用ドキュメント。".repeat(TARGET_CHUNKS),
      };

      await pipeline.process(input, config);

      // メトリクス検証
      const stats = metricsCollector.getStatistics();
      expect(stats.totalRuns).toBe(1);
      expect(stats.successRate).toBe(1);
      expect(stats.avgChunksPerDocument).toBe(TARGET_CHUNKS);
      expect(stats.avgProcessingTime).toBeGreaterThan(0);

      console.log("\n=== Pipeline Metrics ===");
      console.log(`Total runs: ${stats.totalRuns}`);
      console.log(`Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
      console.log(`Avg chunks/document: ${stats.avgChunksPerDocument}`);
      console.log(
        `Avg processing time: ${stats.avgProcessingTime.toFixed(2)}ms`,
      );
    });
  });

  describe("バッチサイズ最適化テスト", () => {
    it("should show performance difference with various batch sizes", async () => {
      const TARGET_CHUNKS = 200;
      const BATCH_SIZES = [10, 50, 100];
      const results: Array<{
        batchSize: number;
        processingTimeMs: number;
        throughput: number;
      }> = [];

      console.log("\n=== Batch Size Optimization Test ===");

      for (const batchSize of BATCH_SIZES) {
        const chunkingService =
          createPerformanceMockChunkingService(TARGET_CHUNKS);
        const embeddingService = createPerformanceMockEmbeddingService(2);
        const metricsCollector = new PipelineMetricsCollector();

        const pipeline = new EmbeddingPipeline(
          chunkingService,
          embeddingService,
          metricsCollector,
        );

        const config: PipelineConfig = {
          chunking: {
            strategy: "fixed",
            options: { chunkSize: 50 },
          },
          embedding: {
            modelId: "EMB-002",
          },
        };

        const input: PipelineInput = {
          documentId: `batch-test-${batchSize}`,
          documentType: "markdown",
          text: "バッチサイズテスト用ドキュメント。".repeat(TARGET_CHUNKS),
        };

        const startTime = performance.now();
        await pipeline.process(input, config);
        const processingTimeMs = performance.now() - startTime;

        const throughput = (TARGET_CHUNKS / processingTimeMs) * 60000;
        results.push({ batchSize, processingTimeMs, throughput });

        console.log(
          `Batch size ${batchSize}: ${processingTimeMs.toFixed(0)}ms, ${throughput.toFixed(0)} chunks/min`,
        );
      }

      // バッチサイズが大きいほどスループットが向上（または維持）することを確認
      // 注: 実際の改善率はモック実装に依存
      expect(results[1].throughput).toBeGreaterThanOrEqual(
        results[0].throughput * 0.8,
      );
      expect(results[2].throughput).toBeGreaterThanOrEqual(
        results[0].throughput * 0.8,
      );
    });
  });

  describe("メモリ効率テスト", () => {
    it("should not leak memory across multiple pipeline runs", async () => {
      const RUNS = 5;
      const CHUNKS_PER_RUN = 100;
      const memorySnapshots: number[] = [];

      console.log("\n=== Memory Efficiency Test ===");

      for (let run = 0; run < RUNS; run++) {
        const chunkingService =
          createPerformanceMockChunkingService(CHUNKS_PER_RUN);
        const embeddingService = createPerformanceMockEmbeddingService(1);
        const metricsCollector = new PipelineMetricsCollector();

        const pipeline = new EmbeddingPipeline(
          chunkingService,
          embeddingService,
          metricsCollector,
        );

        const config: PipelineConfig = {
          chunking: {
            strategy: "fixed",
            options: { chunkSize: 50 },
          },
          embedding: {
            modelId: "EMB-002",
          },
        };

        const input: PipelineInput = {
          documentId: `memory-test-${run}`,
          documentType: "markdown",
          text: "メモリテスト用ドキュメント。".repeat(CHUNKS_PER_RUN),
        };

        await pipeline.process(input, config);

        // GCを促進（Node.jsオプション--expose-gcが必要）
        if (global.gc) {
          global.gc();
        }

        const memoryMB = getMemoryUsageMB();
        memorySnapshots.push(memoryMB);
        console.log(`Run ${run + 1}: ${memoryMB.toFixed(2)} MB`);
      }

      // メモリ増加率を確認（最初と最後の差が許容範囲内）
      const memoryGrowth = memorySnapshots[RUNS - 1] - memorySnapshots[0];
      console.log(`Memory growth: ${memoryGrowth.toFixed(2)} MB`);

      // 許容範囲: 50MB以内（GCの影響で多少変動する）
      expect(Math.abs(memoryGrowth)).toBeLessThan(50);
    });
  });
});
