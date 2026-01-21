/**
 * チャットセッションのエラー型
 *
 * @module features/chat-history/domain/errors/ChatSessionErrors
 */

import {
  DomainError,
  BusinessRuleError,
} from "../../../../core/errors/DomainError.js";

/**
 * チャットセッション エラー
 */
export class ChatSessionError extends DomainError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

/**
 * 無効なセッションタイトル エラー
 */
export class InvalidSessionTitleError extends DomainError {
  constructor(title: string, reason: string) {
    super(
      "INVALID_SESSION_TITLE",
      `Invalid session title "${title}": ${reason}`,
    );
  }
}

/**
 * ピン留め上限エラー (BR-SESSION-002)
 */
export class MaxPinnedSessionsError extends BusinessRuleError {
  constructor(maxCount: number) {
    super(
      "MAX_PINNED_SESSIONS",
      `Maximum pinned sessions (${maxCount}) reached`,
    );
  }
}

/**
 * セッションアーカイブ済みエラー
 */
export class SessionArchivedError extends BusinessRuleError {
  constructor(sessionId: string) {
    super(
      "SESSION_ARCHIVED",
      `Session ${sessionId} is archived and cannot be modified`,
    );
  }
}
