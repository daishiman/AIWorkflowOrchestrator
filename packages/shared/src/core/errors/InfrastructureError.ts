/**
 * インフラストラクチャ層のエラー
 *
 * データベース、外部サービスなど
 * インフラ層で発生するエラーを表現する。
 *
 * @module core/errors/InfrastructureError
 */

import { AppError } from "./AppError.js";

/**
 * インフラエラーの基底クラス
 */
export class InfrastructureError extends AppError {
  readonly statusCode = 500; // Internal Server Error

  constructor(
    readonly code: string,
    message: string,
    readonly cause?: Error,
  ) {
    super(message);
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * データベースエラー
 */
export class DatabaseError extends InfrastructureError {
  constructor(message: string, cause?: Error) {
    super("DATABASE_ERROR", message, cause);
  }
}

/**
 * 外部サービスエラー
 */
export class ExternalServiceError extends InfrastructureError {
  constructor(serviceName: string, message: string, cause?: Error) {
    super("EXTERNAL_SERVICE_ERROR", `${serviceName}: ${message}`, cause);
  }
}
