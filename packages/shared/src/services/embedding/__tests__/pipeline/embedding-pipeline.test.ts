/**
 * 埋め込みパイプラインテスト
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
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

// モックChunkingService
function createMockChunkingService(): ChunkingService {
  return {
    chunk: vi.fn().mockResolvedValue({
      chunks: [
        {
          id: "chunk-1",
          content: "これはテスト文章1です。",
          tokenCount: 10,
          position: { start: 0, end: 20 },
          metadata: {},
        },
        {
          id: "chunk-2",
          content: "これはテスト文章2です。",
          tokenCount: 10,
          position: { start: 21, end: 40 },
          metadata: {},
        },
      ] as Chunk[],
      statistics: {
        totalChunks: 2,
        totalTokens: 20,
        avgChunkSize: 10,
        minChunkSize: 10,
        maxChunkSize: 10,
      },
    } as ChunkingOutput),
    registerStrategy: vi.fn(),
    getAvailableStrategies: vi.fn().mockReturnValue(["fixed"]),
  } as unknown as ChunkingService;
}

// モックEmbeddingService
function createMockEmbeddingService(): EmbeddingService {
  return {
    embed: vi.fn().mockResolvedValue({
      embedding: new Array(3072).fill(0.1),
      tokenCount: 10,
      model: "EMB-002",
      processingTimeMs: 50,
    } as EmbeddingResult),
    embedBatch: vi.fn().mockResolvedValue({
      embeddings: [
        {
          embedding: new Array(3072).fill(0.1),
          tokenCount: 10,
          model: "EMB-002",
          processingTimeMs: 50,
        },
        {
          embedding: new Array(3072).fill(0.2),
          tokenCount: 10,
          model: "EMB-002",
          processingTimeMs: 50,
        },
      ] as EmbeddingResult[],
      errors: [],
      totalTokens: 20,
      totalProcessingTimeMs: 100,
    } as BatchEmbeddingResult),
    healthCheckAll: vi.fn().mockResolvedValue(new Map([["EMB-002", true]])),
    getAvailableProviders: vi.fn().mockReturnValue(["EMB-002"]),
    getFallbackChain: vi.fn().mockReturnValue(["EMB-002"]),
    setFallbackChain: vi.fn(),
    getMetricsCollector: vi.fn(),
  } as unknown as EmbeddingService;
}

describe("EmbeddingPipeline", () => {
  let pipeline: EmbeddingPipeline;
  let chunkingService: ChunkingService;
  let embeddingService: EmbeddingService;
  let metricsCollector: PipelineMetricsCollector;

  beforeEach(() => {
    chunkingService = createMockChunkingService();
    embeddingService = createMockEmbeddingService();
    metricsCollector = new PipelineMetricsCollector();

    pipeline = new EmbeddingPipeline(
      chunkingService,
      embeddingService,
      metricsCollector,
    );
  });

  describe("process", () => {
    it("正常にドキュメントを処理できる", async () => {
      const input: PipelineInput = {
        documentId: "doc-001",
        documentType: "markdown",
        text: "# テスト\n\nこれはテスト文章です。",
      };

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: {
            chunkSize: 512,
          },
        },
        embedding: {
          modelId: "EMB-002",
        },
      };

      const result = await pipeline.process(input, config);

      expect(result.documentId).toBe("doc-001");
      expect(result.chunksProcessed).toBe(2);
      expect(result.embeddingsGenerated).toBe(2);
      expect(result.chunks).toHaveLength(2);
      expect(result.embeddings).toHaveLength(2);
      expect(result.totalProcessingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("進捗コールバックが呼ばれる", async () => {
      const input: PipelineInput = {
        documentId: "doc-002",
        documentType: "text",
        text: "テスト文章です。",
      };

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 512 },
        },
        embedding: {
          modelId: "EMB-002",
        },
      };

      const onProgress = vi.fn();
      await pipeline.process(input, config, onProgress);

      expect(onProgress).toHaveBeenCalled();
      // 最後の呼び出しはcompleted状態
      const lastCall =
        onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
      expect(lastCall.currentStage).toBe("completed");
      expect(lastCall.progressPercentage).toBe(100);
    });

    it("ステージ別処理時間が記録される", async () => {
      const input: PipelineInput = {
        documentId: "doc-003",
        documentType: "markdown",
        text: "テスト",
      };

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 512 },
        },
        embedding: {
          modelId: "EMB-002",
        },
      };

      const result = await pipeline.process(input, config);

      expect(result.stageTimings.preprocessing).toBeGreaterThanOrEqual(0);
      expect(result.stageTimings.chunking).toBeGreaterThanOrEqual(0);
      expect(result.stageTimings.embedding).toBeGreaterThanOrEqual(0);
      expect(result.stageTimings.deduplication).toBeGreaterThanOrEqual(0);
    });

    it("前処理をスキップできる", async () => {
      const input: PipelineInput = {
        documentId: "doc-004",
        documentType: "text",
        text: "  \n\n テスト \n\n  ",
      };

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 512 },
        },
        embedding: {
          modelId: "EMB-002",
        },
        pipeline: {
          skipPreprocessing: true,
        },
      };

      await pipeline.process(input, config);

      // chunkingServiceに渡されたテキストが元のままであることを確認
      expect(chunkingService.chunk).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "  \n\n テスト \n\n  ",
        }),
      );
    });
  });

  describe("重複排除", () => {
    it("コンテンツハッシュによる重複排除が動作する", async () => {
      // 同じ内容のチャンクを返すようにモック
      (chunkingService.chunk as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        {
          chunks: [
            {
              id: "chunk-1",
              content: "同じ内容",
              tokenCount: 5,
              position: { start: 0, end: 10 },
              metadata: {},
            },
            {
              id: "chunk-2",
              content: "同じ内容", // 重複
              tokenCount: 5,
              position: { start: 11, end: 20 },
              metadata: {},
            },
          ] as Chunk[],
          statistics: {
            totalChunks: 2,
            totalTokens: 10,
            avgChunkSize: 5,
            minChunkSize: 5,
            maxChunkSize: 5,
          },
        },
      );

      const input: PipelineInput = {
        documentId: "doc-005",
        documentType: "text",
        text: "テスト",
      };

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 512 },
        },
        embedding: {
          modelId: "EMB-002",
        },
        persistence: {
          deduplication: {
            enabled: true,
            method: "content-hash",
          },
        },
      };

      const result = await pipeline.process(input, config);

      // 重複が排除されて1つになる
      expect(result.chunks).toHaveLength(1);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.[0]).toContain("duplicate");
    });

    it("埋め込み類似度による重複排除が動作する", async () => {
      // 同じ埋め込みを返すようにモック
      (
        embeddingService.embedBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        embeddings: [
          {
            embedding: new Array(3072).fill(0.1),
            tokenCount: 10,
            model: "EMB-002",
            processingTimeMs: 50,
          },
          {
            embedding: new Array(3072).fill(0.1), // 同じ埋め込み（類似度1.0）
            tokenCount: 10,
            model: "EMB-002",
            processingTimeMs: 50,
          },
        ],
        errors: [],
        totalTokens: 20,
        totalProcessingTimeMs: 100,
      });

      const input: PipelineInput = {
        documentId: "doc-006",
        documentType: "text",
        text: "テスト",
      };

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 512 },
        },
        embedding: {
          modelId: "EMB-002",
        },
        persistence: {
          deduplication: {
            enabled: true,
            method: "embedding-similarity",
            similarityThreshold: 0.95,
          },
        },
      };

      const result = await pipeline.process(input, config);

      // 類似度が高いため1つに削減
      expect(result.chunks).toHaveLength(1);
    });
  });

  describe("processBatch", () => {
    it("複数ドキュメントをバッチ処理できる", async () => {
      const inputs: PipelineInput[] = [
        { documentId: "doc-1", documentType: "text", text: "テスト1" },
        { documentId: "doc-2", documentType: "text", text: "テスト2" },
        { documentId: "doc-3", documentType: "text", text: "テスト3" },
      ];

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 512 },
        },
        embedding: {
          modelId: "EMB-002",
        },
      };

      const results = await pipeline.processBatch(inputs, config, {
        concurrency: 2,
      });

      expect(results).toHaveLength(3);
    });

    it("バッチ処理の進捗コールバックが呼ばれる", async () => {
      const inputs: PipelineInput[] = [
        { documentId: "doc-1", documentType: "text", text: "テスト1" },
        { documentId: "doc-2", documentType: "text", text: "テスト2" },
      ];

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 512 },
        },
        embedding: {
          modelId: "EMB-002",
        },
      };

      const onProgress = vi.fn();
      await pipeline.processBatch(inputs, config, { onProgress });

      expect(onProgress).toHaveBeenCalled();
      const lastCall = onProgress.mock.calls[onProgress.mock.calls.length - 1];
      expect(lastCall[0]).toBe(2); // processed
      expect(lastCall[1]).toBe(2); // total
    });
  });

  describe("エラーハンドリング", () => {
    it("チャンキングエラー時にChunkingErrorをスローする", async () => {
      (chunkingService.chunk as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Chunking failed"),
      );

      const input: PipelineInput = {
        documentId: "doc-error",
        documentType: "text",
        text: "テスト",
      };

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 512 },
        },
        embedding: {
          modelId: "EMB-002",
        },
      };

      await expect(pipeline.process(input, config)).rejects.toThrow(
        "Chunking failed",
      );
    });

    it("埋め込みエラー時にEmbeddingStageErrorをスローする", async () => {
      (
        embeddingService.embedBatch as ReturnType<typeof vi.fn>
      ).mockRejectedValueOnce(new Error("Embedding failed"));

      const input: PipelineInput = {
        documentId: "doc-error",
        documentType: "text",
        text: "テスト",
      };

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 512 },
        },
        embedding: {
          modelId: "EMB-002",
        },
      };

      await expect(pipeline.process(input, config)).rejects.toThrow(
        "Embedding failed",
      );
    });

    it("部分的な埋め込みエラーはerrorsに記録される", async () => {
      (
        embeddingService.embedBatch as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        embeddings: [
          {
            embedding: new Array(3072).fill(0.1),
            tokenCount: 10,
            model: "EMB-002",
            processingTimeMs: 50,
          },
        ],
        errors: [{ index: 1, error: "Token limit exceeded" }],
        totalTokens: 10,
        totalProcessingTimeMs: 100,
      });

      const input: PipelineInput = {
        documentId: "doc-partial-error",
        documentType: "text",
        text: "テスト",
      };

      const config: PipelineConfig = {
        chunking: {
          strategy: "fixed",
          options: { chunkSize: 512 },
        },
        embedding: {
          modelId: "EMB-002",
        },
      };

      const result = await pipeline.process(input, config);

      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].stage).toBe("embedding");
    });
  });
});

describe("PipelineMetricsCollector", () => {
  let collector: PipelineMetricsCollector;

  beforeEach(() => {
    collector = new PipelineMetricsCollector();
  });

  it("メトリクスを記録できる", () => {
    collector.recordPipelineRun({
      documentId: "doc-1",
      chunksProcessed: 10,
      embeddingsGenerated: 10,
      totalProcessingTimeMs: 1000,
      stageTimings: {
        preprocessing: 100,
        chunking: 300,
        embedding: 500,
        deduplication: 100,
      },
      success: true,
    });

    const metrics = collector.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].documentId).toBe("doc-1");
  });

  it("統計を正しく計算する", () => {
    collector.recordPipelineRun({
      documentId: "doc-1",
      chunksProcessed: 10,
      embeddingsGenerated: 10,
      totalProcessingTimeMs: 1000,
      stageTimings: {
        preprocessing: 100,
        chunking: 300,
        embedding: 500,
        deduplication: 100,
      },
      success: true,
    });

    collector.recordPipelineRun({
      documentId: "doc-2",
      chunksProcessed: 20,
      embeddingsGenerated: 20,
      totalProcessingTimeMs: 2000,
      stageTimings: {
        preprocessing: 200,
        chunking: 600,
        embedding: 1000,
        deduplication: 200,
      },
      success: true,
    });

    const stats = collector.getStatistics();

    expect(stats.totalRuns).toBe(2);
    expect(stats.successRate).toBe(1);
    expect(stats.avgProcessingTime).toBe(1500);
    expect(stats.avgChunksPerDocument).toBe(15);
  });

  it("空の場合のstatisticsが正しい", () => {
    const stats = collector.getStatistics();

    expect(stats.totalRuns).toBe(0);
    expect(stats.successRate).toBe(0);
    expect(stats.avgProcessingTime).toBe(0);
    expect(stats.avgChunksPerDocument).toBe(0);
  });

  it("clearでメトリクスがクリアされる", () => {
    collector.recordPipelineRun({
      documentId: "doc-1",
      chunksProcessed: 10,
      embeddingsGenerated: 10,
      totalProcessingTimeMs: 1000,
      stageTimings: {
        preprocessing: 100,
        chunking: 300,
        embedding: 500,
        deduplication: 100,
      },
      success: true,
    });

    collector.clear();

    expect(collector.getMetrics()).toHaveLength(0);
  });
});
