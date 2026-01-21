/**
 * ドメイン層のエラー
 *
 * ビジネスルール違反、バリデーションエラーなど
 * ドメイン層で発生するエラーを表現する。
 *
 * @module core/errors/DomainError
 */

import { AppError } from "./AppError.js";

/**
 * ドメインエラーの基底クラス
 */
export abstract class DomainError extends AppError {
  readonly statusCode = 400; // Bad Request

  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * バリデーションエラー
 *
 * 値オブジェクトの不変条件違反など
 */
export class ValidationError extends DomainError {
  constructor(
    readonly field: string,
    message: string,
  ) {
    super("VALIDATION_ERROR", `${field}: ${message}`);
  }
}

/**
 * ビジネスルール違反エラー
 *
 * ドメインのビジネスルールに反する操作が試みられた場合
 */
export class BusinessRuleError extends DomainError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}
