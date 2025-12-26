/**
 * 埋め込みサービスの型定義
 *
 * @description 埋め込みプロバイダーで使用する型を定義
 */

/**
 * 埋め込みモデルID
 */
export type EmbeddingModelId =
  | "EMB-001" // Qwen3-Embedding-8B
  | "EMB-002" // text-embedding-3-large
  | "EMB-003" // voyage-3-large
  | "EMB-004" // bge-m3
  | "EMB-005"; // embedding-gemma

/**
 * プロバイダー名
 */
export type ProviderName =
  | "openai"
  | "dashscope"
  | "voyage"
  | "huggingface"
  | "local";

/**
 * リトライオプション
 */
export interface RetryOptions {
  /** 最大リトライ回数 */
  maxRetries: number;
  /** 初期遅延（ミリ秒） */
  initialDelayMs: number;
  /** 最大遅延（ミリ秒） */
  maxDelayMs: number;
  /** バックオフ乗数 */
  backoffMultiplier: number;
  /** ジッター有効化 */
  jitter: boolean;
}

/**
 * 埋め込みオプション
 */
export interface EmbedOptions {
  /** 次元数（可変モデル用） */
  dimensions?: number;
  /** リトライ設定 */
  retry?: RetryOptions;
  /** タイムアウト（ミリ秒） */
  timeout?: number;
  /** メタデータ */
  metadata?: Record<string, unknown>;
}

/**
 * バッチ埋め込みオプション
 */
export interface BatchEmbedOptions extends EmbedOptions {
  /** バッチサイズ */
  batchSize?: number;
  /** 並列度 */
  concurrency?: number;
  /** バッチ間の遅延（ミリ秒） */
  delayBetweenBatches?: number;
  /** 進捗コールバック */
  onProgress?: (processed: number, total: number) => void;
}

/**
 * 埋め込み結果
 */
export interface EmbeddingResult {
  /** 埋め込みベクトル */
  embedding: number[];
  /** トークン数 */
  tokenCount: number;
  /** 使用モデル */
  model: string;
  /** 処理時間（ミリ秒） */
  processingTimeMs: number;
}

/**
 * バッチ埋め込み結果
 */
export interface BatchEmbeddingResult {
  /** 埋め込み配列 */
  embeddings: EmbeddingResult[];
  /** エラー情報 */
  errors: Array<{ index: number; error: string }>;
  /** 総トークン数 */
  totalTokens: number;
  /** 総処理時間（ミリ秒） */
  totalProcessingTimeMs: number;
}

/**
 * レート制限設定
 */
export interface RateLimitConfig {
  /** リクエスト/分 */
  requestsPerMinute: number;
  /** トークン/分 */
  tokensPerMinute: number;
}

/**
 * Circuit Breaker設定
 */
export interface CircuitBreakerConfig {
  /** エラー閾値 */
  errorThreshold: number;
  /** タイムアウト（ミリ秒） */
  timeout: number;
  /** リセット時間（ミリ秒） */
  resetTimeout: number;
}

/**
 * プロバイダー設定
 */
export interface ProviderConfig {
  apiKey?: string;
  apiEndpoint?: string;
  timeout?: number;
  modelPath?: string; // ローカルモデル用
  device?: "cuda" | "cpu" | "mps"; // ローカルモデル用
}

/**
 * 埋め込みメトリクス
 */
export interface EmbeddingMetric {
  modelId: EmbeddingModelId;
  tokenCount: number;
  processingTimeMs: number;
  success: boolean;
  error?: string;
  timestamp?: number;
}
