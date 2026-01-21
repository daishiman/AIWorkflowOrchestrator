import { UseCaseError } from "../../../../core/errors/UseCaseError.js";

/**
 * セッションが見つからないエラー
 */
export class SessionNotFoundError extends UseCaseError {
  constructor(sessionId: string) {
    super(
      "SESSION_NOT_FOUND",
      `セッションが見つかりません: ${sessionId}`,
      404,
      { sessionId },
    );
  }
}

/**
 * メッセージが見つからないエラー
 */
export class MessageNotFoundError extends UseCaseError {
  constructor(messageId: string) {
    super(
      "MESSAGE_NOT_FOUND",
      `メッセージが見つかりません: ${messageId}`,
      404,
      { messageId },
    );
  }
}

/**
 * ピン留め上限エラー
 */
export class MaxPinnedSessionsError extends UseCaseError {
  constructor(currentCount: number, maxCount: number) {
    super(
      "MAX_PINNED_SESSIONS",
      `ピン留めセッションの上限（${maxCount}件）に達しています`,
      400,
      { currentCount, maxCount },
    );
  }
}

/**
 * リポジトリエラー
 */
export class RepositoryError extends UseCaseError {
  constructor(message: string, cause?: Error) {
    super("REPOSITORY_ERROR", message, 500, { cause: cause?.message });
  }
}

/**
 * 無効なセッションIDエラー
 */
export class InvalidSessionIdError extends UseCaseError {
  constructor(sessionId: string) {
    super("INVALID_SESSION_ID", `無効なセッションID: ${sessionId}`, 400, {
      sessionId,
    });
  }
}

/**
 * 無効なユーザーIDエラー
 */
export class InvalidUserIdError extends UseCaseError {
  constructor(userId: string) {
    super("INVALID_USER_ID", `無効なユーザーID: ${userId}`, 400, { userId });
  }
}

/**
 * 無効なタイトルエラー
 */
export class InvalidTitleError extends UseCaseError {
  constructor(message: string) {
    super("INVALID_TITLE", message, 400);
  }
}

/**
 * 無効なコンテンツエラー
 */
export class InvalidContentError extends UseCaseError {
  constructor(message: string) {
    super("INVALID_CONTENT", message, 400);
  }
}

/**
 * Use Caseエラー型のユニオン
 */
export type ChatHistoryUseCaseError =
  | SessionNotFoundError
  | MessageNotFoundError
  | MaxPinnedSessionsError
  | RepositoryError
  | InvalidSessionIdError
  | InvalidUserIdError
  | InvalidTitleError
  | InvalidContentError;
