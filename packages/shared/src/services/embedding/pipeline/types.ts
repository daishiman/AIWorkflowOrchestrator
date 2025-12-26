/**
 * パイプライン型定義
 *
 * @description 埋め込み生成パイプラインの型定義
 */

import type {
  ChunkingStrategy,
  ChunkingOptions,
  Chunk,
  DocumentType,
} from "../../chunking/types";
import type {
  EmbeddingModelId,
  EmbedOptions,
  BatchEmbedOptions,
  EmbeddingResult,
} from "../types/embedding.types";

// Re-export DocumentType from chunking
export type { DocumentType } from "../../chunking/types";

/**
 * パイプライン入力
 */
export interface PipelineInput {
  /** ドキュメントID */
  documentId: string;
  /** ドキュメントタイプ */
  documentType: DocumentType;
  /** テキストコンテンツ */
  text: string;
  /** メタデータ */
  metadata?: {
    sourceFile?: string;
    author?: string;
    createdAt?: Date;
    tags?: string[];
    [key: string]: unknown;
  };
}

/**
 * パイプライン設定
 */
export interface PipelineConfig {
  /** チャンキング設定 */
  chunking: {
    strategy: ChunkingStrategy;
    options: ChunkingOptions;
  };

  /** 埋め込み設定 */
  embedding: {
    modelId: EmbeddingModelId;
    fallbackChain?: EmbeddingModelId[];
    options?: EmbedOptions;
    batchOptions?: BatchEmbedOptions;
  };

  /** パイプライン制御設定 */
  pipeline?: {
    /** バッチサイズ */
    batchSize?: number;
    /** 並列度 */
    concurrency?: number;
    /** 前処理スキップ */
    skipPreprocessing?: boolean;
  };

  /** 永続化設定（オプション） */
  persistence?: {
    /** 重複排除設定 */
    deduplication?: DeduplicationConfig;
  };
}

/**
 * 重複排除設定
 */
export interface DeduplicationConfig {
  /** 有効化フラグ */
  enabled: boolean;
  /** 重複判定方法 */
  method: "content-hash" | "embedding-similarity";
  /** 類似度閾値（embedding-similarity用） */
  similarityThreshold?: number;
}

/**
 * パイプライン出力
 */
export interface PipelineOutput {
  /** ドキュメントID */
  documentId: string;
  /** 処理されたチャンク */
  chunks: Chunk[];
  /** 生成された埋め込み */
  embeddings: EmbeddingResult[];
  /** 処理されたチャンク数 */
  chunksProcessed: number;
  /** 生成された埋め込み数 */
  embeddingsGenerated: number;
  /** 処理時間（ミリ秒） */
  totalProcessingTimeMs: number;
  /** ステージ別処理時間 */
  stageTimings: StageTimings;
  /** エラー情報 */
  errors?: Array<{
    stage: string;
    error: string;
    chunkIndex?: number;
  }>;
  /** 警告情報 */
  warnings?: string[];
}

/**
 * ステージ別処理時間
 */
export interface StageTimings {
  preprocessing: number;
  chunking: number;
  embedding: number;
  deduplication: number;
}

/**
 * パイプライン進捗情報
 */
export interface PipelineProgress {
  /** 現在のステージ */
  currentStage: PipelineStage;
  /** 進捗率（0-100） */
  progressPercentage: number;
  /** 処理済みチャンク数 */
  chunksProcessed: number;
  /** 総チャンク数 */
  totalChunks: number;
  /** 経過時間（ミリ秒） */
  elapsedTimeMs: number;
  /** 推定残り時間（ミリ秒） */
  estimatedRemainingMs?: number;
}

/**
 * パイプラインステージ
 */
export type PipelineStage =
  | "preprocessing"
  | "chunking"
  | "embedding"
  | "deduplication"
  | "completed";

/**
 * チャンク+埋め込み
 */
export interface ChunkWithEmbedding {
  chunk: Chunk;
  embedding: EmbeddingResult;
}

/**
 * パイプラインメトリクス
 */
export interface PipelineMetric {
  documentId: string;
  chunksProcessed: number;
  embeddingsGenerated: number;
  totalProcessingTimeMs: number;
  stageTimings: StageTimings;
  success: boolean;
  error?: string;
  timestamp: number;
}
