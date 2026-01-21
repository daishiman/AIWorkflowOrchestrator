/**
 * Use Case層のエラー
 *
 * アプリケーション層で発生するエラーを表現する。
 * リソース未発見、権限エラー、競合エラーなど。
 *
 * @module core/errors/UseCaseError
 */

import { AppError } from "./AppError.js";

/**
 * Use Caseエラーの基底クラス
 */
export class UseCaseError extends AppError {
  readonly statusCode: number;
  readonly data?: Record<string, unknown>;

  constructor(
    readonly code: string,
    message: string,
    statusCode = 400,
    data?: Record<string, unknown>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * リソース未発見エラー
 */
export class NotFoundError extends UseCaseError {
  constructor(resourceType: string, id: string) {
    super("NOT_FOUND", `${resourceType} not found: ${id}`, 404);
  }
}

/**
 * 権限エラー
 */
export class UnauthorizedError extends UseCaseError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
  }
}

/**
 * 競合エラー
 */
export class ConflictError extends UseCaseError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
  }
}
