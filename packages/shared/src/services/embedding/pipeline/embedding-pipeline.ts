/**
 * 埋め込み生成パイプライン
 *
 * @description ドキュメント→チャンク→埋め込みの統合フロー
 */

import type { Chunk } from "../../chunking/types";
import type { ChunkingService } from "../../chunking/chunking-service";
import type { EmbeddingResult } from "../types/embedding.types";
import type { EmbeddingService } from "../embedding-service";
import type { EmbeddingBatchProcessor } from "../batch-processor";
import type {
  PipelineInput,
  PipelineConfig,
  PipelineOutput,
  PipelineProgress,
  StageTimings,
  ChunkWithEmbedding as _ChunkWithEmbedding,
  PipelineMetric,
} from "./types";
import {
  PipelineError,
  PreprocessingError as _PreprocessingError,
  ChunkingError,
  EmbeddingStageError,
} from "./errors";
import { cosineSimilarity, hashContent } from "../utils/math-utils";

/**
 * パイプラインメトリクス収集
 */
export class PipelineMetricsCollector {
  private metrics: PipelineMetric[] = [];

  recordPipelineRun(metric: Omit<PipelineMetric, "timestamp">): void {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
    });
  }

  getMetrics(): PipelineMetric[] {
    return [...this.metrics];
  }

  getStatistics(): {
    totalRuns: number;
    successRate: number;
    avgProcessingTime: number;
    avgChunksPerDocument: number;
  } {
    if (this.metrics.length === 0) {
      return {
        totalRuns: 0,
        successRate: 0,
        avgProcessingTime: 0,
        avgChunksPerDocument: 0,
      };
    }

    const successfulRuns = this.metrics.filter((m) => m.success);

    return {
      totalRuns: this.metrics.length,
      successRate: successfulRuns.length / this.metrics.length,
      avgProcessingTime:
        this.metrics.reduce((sum, m) => sum + m.totalProcessingTimeMs, 0) /
        this.metrics.length,
      avgChunksPerDocument:
        this.metrics.reduce((sum, m) => sum + m.chunksProcessed, 0) /
        this.metrics.length,
    };
  }

  clear(): void {
    this.metrics = [];
  }
}

/**
 * 埋め込み生成パイプライン
 */
export class EmbeddingPipeline {
  private chunkingService: ChunkingService;
  private embeddingService: EmbeddingService;
  private batchProcessor?: EmbeddingBatchProcessor;
  private metricsCollector: PipelineMetricsCollector;

  constructor(
    chunkingService: ChunkingService,
    embeddingService: EmbeddingService,
    metricsCollector?: PipelineMetricsCollector,
    batchProcessor?: EmbeddingBatchProcessor,
  ) {
    this.chunkingService = chunkingService;
    this.embeddingService = embeddingService;
    this.metricsCollector = metricsCollector || new PipelineMetricsCollector();
    this.batchProcessor = batchProcessor;
  }

  /**
   * パイプライン実行
   *
   * @param input - パイプライン入力
   * @param config - パイプライン設定
   * @param onProgress - 進捗コールバック
   * @returns パイプライン出力
   */
  async process(
    input: PipelineInput,
    config: PipelineConfig,
    onProgress?: (progress: PipelineProgress) => void,
  ): Promise<PipelineOutput> {
    const startTime = Date.now();
    const stageTimings: StageTimings = {
      preprocessing: 0,
      chunking: 0,
      embedding: 0,
      deduplication: 0,
    };
    const errors: Array<{ stage: string; error: string; chunkIndex?: number }> =
      [];
    const warnings: string[] = [];

    try {
      // Stage 1: Preprocessing
      const preprocessingStart = Date.now();
      const preprocessedText = config.pipeline?.skipPreprocessing
        ? input.text
        : this.preprocess(input.text);
      stageTimings.preprocessing = Date.now() - preprocessingStart;

      onProgress?.({
        currentStage: "preprocessing",
        progressPercentage: 10,
        chunksProcessed: 0,
        totalChunks: 0,
        elapsedTimeMs: Date.now() - startTime,
      });

      // Stage 2: Chunking
      const chunkingStart = Date.now();
      let chunks: Chunk[];

      try {
        const chunkingResult = await this.chunkingService.chunk({
          text: preprocessedText,
          strategy: config.chunking.strategy,
          options: config.chunking.options,
          metadata: {
            documentId: input.documentId,
            documentType: input.documentType,
            sourceFile: input.metadata?.sourceFile,
          },
        });

        chunks = chunkingResult.chunks;

        if (chunkingResult.warnings) {
          warnings.push(...chunkingResult.warnings);
        }
      } catch (error) {
        throw new ChunkingError(
          `Chunking failed: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error },
        );
      }

      stageTimings.chunking = Date.now() - chunkingStart;

      onProgress?.({
        currentStage: "chunking",
        progressPercentage: 30,
        chunksProcessed: 0,
        totalChunks: chunks.length,
        elapsedTimeMs: Date.now() - startTime,
      });

      // Stage 3: Embedding
      const embeddingStart = Date.now();
      const embeddings: EmbeddingResult[] = [];
      const chunkTexts = chunks.map((c) => c.content);

      try {
        const embeddingResult = await this.embeddingService.embedBatch(
          chunkTexts,
          config.embedding.modelId,
          {
            ...config.embedding.batchOptions,
            onProgress: (processed, total) => {
              const embeddingProgress = 30 + (processed / total) * 40;
              onProgress?.({
                currentStage: "embedding",
                progressPercentage: embeddingProgress,
                chunksProcessed: processed,
                totalChunks: total,
                elapsedTimeMs: Date.now() - startTime,
              });
            },
          },
        );

        embeddings.push(...embeddingResult.embeddings);

        // エラー情報を収集
        if (embeddingResult.errors.length > 0) {
          for (const err of embeddingResult.errors) {
            errors.push({
              stage: "embedding",
              error: err.error,
              chunkIndex: err.index,
            });
          }
        }
      } catch (error) {
        throw new EmbeddingStageError(
          `Embedding failed: ${error instanceof Error ? error.message : String(error)}`,
          undefined,
          { cause: error },
        );
      }

      stageTimings.embedding = Date.now() - embeddingStart;

      onProgress?.({
        currentStage: "embedding",
        progressPercentage: 70,
        chunksProcessed: chunks.length,
        totalChunks: chunks.length,
        elapsedTimeMs: Date.now() - startTime,
      });

      // Stage 4: Deduplication (optional)
      const deduplicationStart = Date.now();
      let finalChunks = chunks;
      let finalEmbeddings = embeddings;

      if (config.persistence?.deduplication?.enabled) {
        const deduped = this.deduplicate(
          chunks,
          embeddings,
          config.persistence.deduplication,
        );
        finalChunks = deduped.chunks;
        finalEmbeddings = deduped.embeddings;

        if (finalChunks.length < chunks.length) {
          warnings.push(
            `Removed ${chunks.length - finalChunks.length} duplicate chunks`,
          );
        }
      }

      stageTimings.deduplication = Date.now() - deduplicationStart;

      onProgress?.({
        currentStage: "completed",
        progressPercentage: 100,
        chunksProcessed: finalChunks.length,
        totalChunks: finalChunks.length,
        elapsedTimeMs: Date.now() - startTime,
      });

      const totalProcessingTimeMs = Date.now() - startTime;

      // メトリクス記録
      this.metricsCollector.recordPipelineRun({
        documentId: input.documentId,
        chunksProcessed: finalChunks.length,
        embeddingsGenerated: finalEmbeddings.length,
        totalProcessingTimeMs,
        stageTimings,
        success: errors.length === 0,
      });

      return {
        documentId: input.documentId,
        chunks: finalChunks,
        embeddings: finalEmbeddings,
        chunksProcessed: finalChunks.length,
        embeddingsGenerated: finalEmbeddings.length,
        totalProcessingTimeMs,
        stageTimings,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      const totalProcessingTimeMs = Date.now() - startTime;

      // パイプライン全体のエラー
      this.metricsCollector.recordPipelineRun({
        documentId: input.documentId,
        chunksProcessed: 0,
        embeddingsGenerated: 0,
        totalProcessingTimeMs,
        stageTimings,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof PipelineError) {
        throw error;
      }

      throw new PipelineError(
        `Pipeline failed for document ${input.documentId}: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        { cause: error },
      );
    }
  }

  /**
   * バッチドキュメント処理
   *
   * @param inputs - パイプライン入力配列
   * @param config - パイプライン設定
   * @param options - バッチオプション
   * @returns パイプライン出力配列
   */
  async processBatch(
    inputs: PipelineInput[],
    config: PipelineConfig,
    options?: {
      concurrency?: number;
      onProgress?: (processed: number, total: number) => void;
    },
  ): Promise<PipelineOutput[]> {
    const concurrency = options?.concurrency || 4;
    const results: PipelineOutput[] = [];
    let processedCount = 0;

    // 並列度制御
    const executing: Promise<void>[] = [];

    for (const input of inputs) {
      const p = this.process(input, config)
        .then((result) => {
          results.push(result);
          processedCount++;
          options?.onProgress?.(processedCount, inputs.length);
        })
        .catch((error) => {
          console.error(
            `Failed to process document ${input.documentId}:`,
            error,
          );
          // エラーが発生しても続行
          processedCount++;
          options?.onProgress?.(processedCount, inputs.length);
        });

      executing.push(p);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        // 完了したPromiseを削除
        const completedIdx = await Promise.race(
          executing.map((p, idx) => p.then(() => idx).catch(() => idx)),
        );
        executing.splice(completedIdx, 1);
      }
    }

    await Promise.all(executing);

    return results;
  }

  /**
   * 前処理
   *
   * @param text - 入力テキスト
   * @returns 前処理済みテキスト
   */
  private preprocess(text: string): string {
    // テキスト正規化
    let processed = text.trim();

    // 連続する空白を単一スペースに
    processed = processed.replace(/[ \t]+/g, " ");

    // 連続する改行を2つまでに
    processed = processed.replace(/\n{3,}/g, "\n\n");

    // 制御文字を削除（改行・タブは除く）
    // eslint-disable-next-line no-control-regex
    processed = processed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    return processed;
  }

  /**
   * 重複排除
   *
   * @param chunks - チャンク配列
   * @param embeddings - 埋め込み配列
   * @param config - 重複排除設定
   * @returns 重複排除後のチャンクと埋め込み
   */
  private deduplicate(
    chunks: Chunk[],
    embeddings: EmbeddingResult[],
    config: {
      method: "content-hash" | "embedding-similarity";
      similarityThreshold?: number;
    },
  ): { chunks: Chunk[]; embeddings: EmbeddingResult[] } {
    if (config.method === "content-hash") {
      return this.deduplicateByContentHash(chunks, embeddings);
    } else if (config.method === "embedding-similarity") {
      return this.deduplicateByEmbeddingSimilarity(
        chunks,
        embeddings,
        config.similarityThreshold || 0.95,
      );
    }

    return { chunks, embeddings };
  }

  /**
   * コンテンツハッシュによる重複排除
   */
  private deduplicateByContentHash(
    chunks: Chunk[],
    embeddings: EmbeddingResult[],
  ): { chunks: Chunk[]; embeddings: EmbeddingResult[] } {
    const seen = new Set<string>();
    const deduplicatedChunks: Chunk[] = [];
    const deduplicatedEmbeddings: EmbeddingResult[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const hash = hashContent(chunks[i].content);

      if (!seen.has(hash)) {
        seen.add(hash);
        deduplicatedChunks.push(chunks[i]);
        if (embeddings[i]) {
          deduplicatedEmbeddings.push(embeddings[i]);
        }
      }
    }

    return { chunks: deduplicatedChunks, embeddings: deduplicatedEmbeddings };
  }

  /**
   * 埋め込み類似度による重複排除
   */
  private deduplicateByEmbeddingSimilarity(
    chunks: Chunk[],
    embeddings: EmbeddingResult[],
    threshold: number,
  ): { chunks: Chunk[]; embeddings: EmbeddingResult[] } {
    const deduplicatedChunks: Chunk[] = [];
    const deduplicatedEmbeddings: EmbeddingResult[] = [];

    for (let i = 0; i < chunks.length; i++) {
      if (!embeddings[i]) continue;

      let isDuplicate = false;

      for (let j = 0; j < deduplicatedEmbeddings.length; j++) {
        const similarity = cosineSimilarity(
          embeddings[i].embedding,
          deduplicatedEmbeddings[j].embedding,
        );

        if (similarity >= threshold) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        deduplicatedChunks.push(chunks[i]);
        deduplicatedEmbeddings.push(embeddings[i]);
      }
    }

    return { chunks: deduplicatedChunks, embeddings: deduplicatedEmbeddings };
  }

  /**
   * メトリクス収集を取得
   */
  getMetricsCollector(): PipelineMetricsCollector {
    return this.metricsCollector;
  }
}
