/**
 * チャット履歴機能のエラークラス
 *
 * OWASP A01: Broken Access Control 対策として、
 * 認可失敗時の専用エラークラスと型ガード関数を提供する。
 *
 * @see outputs/phase-2/design-authorization.md
 */

// ========================================
// 認可関連定数
// ========================================

/**
 * 認可失敗時の汎用エラーメッセージ
 *
 * セキュリティ原則:
 * - 情報漏洩防止のため、セッションの存在有無に関わらず同一メッセージを使用
 */
export const UNAUTHORIZED_ERROR_MESSAGE =
  "Access denied: You do not have permission to access this resource" as const;

/**
 * リソースタイプ定数
 */
export const RESOURCE_TYPE = {
  SESSION: "session",
} as const;

// ========================================
// エラークラス
// ========================================

/**
 * 認可失敗時にスローされるエラー
 *
 * セキュリティ原則:
 * - 情報漏洩防止: セッションの存在有無を推測させないエラーメッセージ
 * - Fail-Secure: 検証失敗時は必ずこのエラーをスロー
 *
 * @example
 * ```typescript
 * if (session.userId !== requestUserId) {
 *   throw new UnauthorizedError(
 *     "Access denied: You do not have permission to access this resource",
 *     "session",
 *     sessionId
 *   );
 * }
 * ```
 */
export class UnauthorizedError extends Error {
  /** エラー名（固定値） */
  public readonly name = "UnauthorizedError" as const;

  /** エラーコード（固定値） */
  public readonly code = "UNAUTHORIZED" as const;

  /** HTTPステータスコード（固定値） */
  public readonly statusCode = 403 as const;

  /**
   * UnauthorizedErrorを生成する
   *
   * @param message - エラーメッセージ（デフォルト: 汎用的なアクセス拒否メッセージ）
   * @param resourceType - リソースタイプ（ログ用、オプション）
   * @param resourceId - リソースID（ログ用、オプション）
   */
  constructor(
    message: string = UNAUTHORIZED_ERROR_MESSAGE,
    public readonly resourceType?: string,
    public readonly resourceId?: string,
  ) {
    super(message);
    // ES5環境でのprototype chain維持
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * UnauthorizedError型ガード
 *
 * @param error - 判定対象のエラー
 * @returns UnauthorizedErrorの場合true
 *
 * @example
 * ```typescript
 * try {
 *   await service.getSession(id, userId);
 * } catch (error) {
 *   if (isUnauthorizedError(error)) {
 *     // 認可エラー処理
 *     console.warn("Unauthorized access attempt");
 *   }
 * }
 * ```
 */
export function isUnauthorizedError(
  error: unknown,
): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}
