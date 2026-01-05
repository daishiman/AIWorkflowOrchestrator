/**
 * 埋め込みサービスのエラークラス
 *
 * @description 埋め込み処理で発生する各種エラーを定義
 */

/**
 * 埋め込みエラー基底クラス
 */
export class EmbeddingError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "EmbeddingError";
  }
}

/**
 * プロバイダーエラー
 */
export class ProviderError extends EmbeddingError {
  readonly providerName: string;

  constructor(message: string, providerName: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ProviderError";
    this.providerName = providerName;
  }
}

/**
 * レート制限エラー
 */
export class RateLimitError extends EmbeddingError {
  readonly retryAfterMs?: number;

  constructor(message: string, retryAfterMs?: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * タイムアウトエラー
 */
export class TimeoutError extends EmbeddingError {
  readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

/**
 * トークン制限エラー
 */
export class TokenLimitError extends EmbeddingError {
  readonly tokenCount: number;
  readonly maxTokens: number;

  constructor(
    message: string,
    tokenCount: number,
    maxTokens: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "TokenLimitError";
    this.tokenCount = tokenCount;
    this.maxTokens = maxTokens;
  }
}

/**
 * Circuit Breakerエラー
 */
export class CircuitBreakerError extends EmbeddingError {
  readonly state: "OPEN" | "HALF_OPEN";

  constructor(
    message: string,
    state: "OPEN" | "HALF_OPEN",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "CircuitBreakerError";
    this.state = state;
  }
}
