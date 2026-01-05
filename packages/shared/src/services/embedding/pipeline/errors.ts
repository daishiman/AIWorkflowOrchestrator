/**
 * パイプラインエラークラス
 *
 * @description パイプライン処理で発生する各種エラーを定義
 */

import type { PipelineStage } from "./types";

/**
 * パイプラインエラー基底クラス
 */
export class PipelineError extends Error {
  readonly stage?: PipelineStage;

  constructor(message: string, stage?: PipelineStage, options?: ErrorOptions) {
    super(message, options);
    this.name = "PipelineError";
    this.stage = stage;
  }
}

/**
 * 前処理エラー
 */
export class PreprocessingError extends PipelineError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, "preprocessing", options);
    this.name = "PreprocessingError";
  }
}

/**
 * チャンキングエラー
 */
export class ChunkingError extends PipelineError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, "chunking", options);
    this.name = "ChunkingError";
  }
}

/**
 * 埋め込みステージエラー
 */
export class EmbeddingStageError extends PipelineError {
  readonly failedChunks?: number[];

  constructor(
    message: string,
    failedChunks?: number[],
    options?: ErrorOptions,
  ) {
    super(message, "embedding", options);
    this.name = "EmbeddingStageError";
    this.failedChunks = failedChunks;
  }
}

/**
 * 重複排除エラー
 */
export class DeduplicationError extends PipelineError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, "deduplication", options);
    this.name = "DeduplicationError";
  }
}
