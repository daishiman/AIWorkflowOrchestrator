/**
 * 値オブジェクトのエラー型
 *
 * @module features/chat-history/domain/errors/ValueObjectErrors
 */

import { DomainError } from "../../../../core/errors/DomainError.js";

/**
 * 無効なID エラー
 */
export class InvalidIdError extends DomainError {
  constructor(type: string, value: string) {
    super("INVALID_ID", `Invalid ${type}: ${value}`);
  }
}

/**
 * 無効なタイトル エラー
 */
export class InvalidTitleError extends DomainError {
  constructor(message: string) {
    super("INVALID_TITLE", message);
  }
}

/**
 * 無効なコンテンツ エラー
 */
export class InvalidContentError extends DomainError {
  constructor(message: string) {
    super("INVALID_CONTENT", message);
  }
}

/**
 * 無効なLLMメタデータ エラー
 */
export class InvalidLLMMetadataError extends DomainError {
  constructor(message: string) {
    super("INVALID_LLM_METADATA", message);
  }
}
