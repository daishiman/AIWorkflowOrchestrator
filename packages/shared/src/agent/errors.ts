/**
 * Agent SDK Error Classes
 * @module @repo/shared/agent/errors
 */

/**
 * エラーコード定義
 */
export const AgentErrorCode = {
  INITIALIZATION_FAILED: "AGENT_INIT_FAILED",
  NOT_INITIALIZED: "AGENT_NOT_INITIALIZED",
  QUERY_FAILED: "AGENT_QUERY_FAILED",
  TIMEOUT: "AGENT_TIMEOUT",
  ABORTED: "AGENT_ABORTED",
  SESSION_NOT_FOUND: "AGENT_SESSION_NOT_FOUND",
  SESSION_ERROR: "AGENT_SESSION_ERROR",
  VALIDATION_ERROR: "AGENT_VALIDATION_ERROR",
} as const;

export type AgentErrorCodeType =
  (typeof AgentErrorCode)[keyof typeof AgentErrorCode];

/**
 * シリアライズされたエラー形式（IPC転送用）
 */
export interface SerializedAgentError {
  name: string;
  code: AgentErrorCodeType;
  message: string;
  stack?: string;
  details?: unknown;
}

/**
 * 基底エラークラス
 */
export class AgentError extends Error {
  readonly code: AgentErrorCodeType;
  readonly cause?: Error;

  constructor(code: AgentErrorCodeType, message: string, cause?: Error) {
    super(message);
    this.name = "AgentError";
    this.code = code;
    this.cause = cause;
    Object.setPrototypeOf(this, AgentError.prototype);
  }

  toJSON(): SerializedAgentError {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      stack: this.stack,
    };
  }
}

/**
 * 初期化エラー
 */
export class AgentInitializationError extends AgentError {
  constructor(message: string, cause?: Error) {
    super(AgentErrorCode.INITIALIZATION_FAILED, message, cause);
    this.name = "AgentInitializationError";
    Object.setPrototypeOf(this, AgentInitializationError.prototype);
  }
}

/**
 * クエリ実行エラー
 */
export class AgentQueryError extends AgentError {
  constructor(message: string, cause?: Error) {
    super(AgentErrorCode.QUERY_FAILED, message, cause);
    this.name = "AgentQueryError";
    Object.setPrototypeOf(this, AgentQueryError.prototype);
  }
}

/**
 * タイムアウトエラー
 */
export class AgentTimeoutError extends AgentError {
  constructor(message: string = "Query timed out") {
    super(AgentErrorCode.TIMEOUT, message);
    this.name = "AgentTimeoutError";
    Object.setPrototypeOf(this, AgentTimeoutError.prototype);
  }
}

/**
 * 中断エラー
 */
export class AgentAbortedError extends AgentError {
  constructor(message: string = "Query was aborted") {
    super(AgentErrorCode.ABORTED, message);
    this.name = "AgentAbortedError";
    Object.setPrototypeOf(this, AgentAbortedError.prototype);
  }
}

/**
 * セッションエラー
 */
export class AgentSessionError extends AgentError {
  constructor(
    message: string,
    code:
      | typeof AgentErrorCode.SESSION_NOT_FOUND
      | typeof AgentErrorCode.SESSION_ERROR = AgentErrorCode.SESSION_ERROR,
  ) {
    super(code, message);
    this.name = "AgentSessionError";
    Object.setPrototypeOf(this, AgentSessionError.prototype);
  }
}

/**
 * バリデーションエラー
 */
export class AgentValidationError extends AgentError {
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(AgentErrorCode.VALIDATION_ERROR, message);
    this.name = "AgentValidationError";
    this.details = details;
    Object.setPrototypeOf(this, AgentValidationError.prototype);
  }
}

/**
 * シリアライズされたエラーをデシリアライズする
 */
export function deserializeAgentError(
  serialized: SerializedAgentError,
): AgentError {
  switch (serialized.name) {
    case "AgentInitializationError":
      return new AgentInitializationError(serialized.message);
    case "AgentQueryError":
      return new AgentQueryError(serialized.message);
    case "AgentTimeoutError":
      return new AgentTimeoutError(serialized.message);
    case "AgentAbortedError":
      return new AgentAbortedError(serialized.message);
    case "AgentSessionError":
      return new AgentSessionError(
        serialized.message,
        serialized.code as
          | typeof AgentErrorCode.SESSION_NOT_FOUND
          | typeof AgentErrorCode.SESSION_ERROR,
      );
    case "AgentValidationError":
      return new AgentValidationError(serialized.message, serialized.details);
    default:
      return new AgentError(serialized.code, serialized.message);
  }
}
