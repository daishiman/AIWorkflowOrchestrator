/**
 * チャンキングサービスのエラークラス
 *
 * @description チャンキング処理で発生する各種エラーを定義
 */

/**
 * チャンキングエラー基底クラス
 */
export class ChunkingError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ChunkingError";
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends ChunkingError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ValidationError";
  }
}

/**
 * トークナイゼーションエラー
 */
export class TokenizationError extends ChunkingError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TokenizationError";
  }
}

/**
 * 埋め込み生成エラー
 */
export class EmbeddingError extends ChunkingError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "EmbeddingError";
  }
}

/**
 * LLM APIエラー
 */
export class LLMError extends ChunkingError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "LLMError";
  }
}
