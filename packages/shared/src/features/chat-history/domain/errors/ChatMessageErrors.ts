/**
 * チャットメッセージのエラー型
 *
 * @module features/chat-history/domain/errors/ChatMessageErrors
 */

import { DomainError } from "../../../../core/errors/DomainError.js";

/**
 * チャットメッセージ エラー
 */
export class ChatMessageError extends DomainError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

/**
 * 無効なメッセージコンテンツ エラー
 */
export class InvalidMessageContentError extends DomainError {
  constructor(reason: string) {
    super("INVALID_MESSAGE_CONTENT", `Invalid message content: ${reason}`);
  }
}

/**
 * LLMメタデータ欠落エラー
 */
export class MissingLLMMetadataError extends DomainError {
  constructor() {
    super("MISSING_LLM_METADATA", "Assistant messages require LLM metadata");
  }
}
