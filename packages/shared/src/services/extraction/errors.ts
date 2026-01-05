/**
 * エンティティ抽出サービスのエラー定義
 * @description 型安全なエラークラス
 */

/**
 * エンティティ抽出の基底エラークラス
 */
export class EntityExtractionError extends Error {
  public readonly code: string;
  public readonly cause?: Error;

  constructor(message: string, code: string, cause?: Error) {
    super(message);
    this.name = "EntityExtractionError";
    this.code = code;
    this.cause = cause;
    Object.setPrototypeOf(this, EntityExtractionError.prototype);
  }
}

/**
 * LLMプロバイダーエラー
 */
export class LLMProviderError extends EntityExtractionError {
  constructor(message: string, cause?: Error) {
    super(message, "LLM_PROVIDER_ERROR", cause);
    this.name = "LLMProviderError";
    Object.setPrototypeOf(this, LLMProviderError.prototype);
  }
}

/**
 * JSONパースエラー
 */
export class JsonParseError extends EntityExtractionError {
  public readonly rawText: string;

  constructor(message: string, rawText: string, cause?: Error) {
    super(message, "JSON_PARSE_ERROR", cause);
    this.name = "JsonParseError";
    this.rawText = rawText;
    Object.setPrototypeOf(this, JsonParseError.prototype);
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends EntityExtractionError {
  public readonly validationErrors: unknown;

  constructor(message: string, validationErrors: unknown) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * タイムアウトエラー
 */
export class TimeoutError extends EntityExtractionError {
  public readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number) {
    super(message, "TIMEOUT_ERROR");
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * 空入力エラー
 */
export class EmptyInputError extends EntityExtractionError {
  constructor(message: string = "Input text is empty") {
    super(message, "EMPTY_INPUT_ERROR");
    this.name = "EmptyInputError";
    Object.setPrototypeOf(this, EmptyInputError.prototype);
  }
}
