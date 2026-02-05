/**
 * OAuth Error Handler
 *
 * OAuth認証コールバックのエラーパラメータを検出し、
 * ユーザーフレンドリーなエラーメッセージにマッピングする
 *
 * @see TASK-FIX-GOOGLE-LOGIN-001 Problem 1
 * @see docs/30-workflows/TASK-FIX-GOOGLE-LOGIN-001/outputs/phase-2/architecture-design.md
 */

import { AUTH_ERROR_CODES } from "@repo/shared/types/auth";
import { IPC_CHANNELS } from "../../preload/channels";
import type { BrowserWindow } from "electron";

// =============================================================================
// Types
// =============================================================================

/**
 * OAuthエラー情報
 */
export interface OAuthError {
  error: string;
  errorDescription?: string;
}

/**
 * マッピングされたエラーメッセージ
 */
export interface MappedError {
  code: string;
  message: string;
}

// =============================================================================
// OAuth Error Code Mapping
// =============================================================================

/**
 * OAuthエラーコードから日本語メッセージへのマッピング
 * OAuth 2.0 仕様 (RFC 6749) に基づくエラーコード
 */
const OAUTH_ERROR_MESSAGES: Record<string, MappedError> = {
  access_denied: {
    code: AUTH_ERROR_CODES.OAUTH_ACCESS_DENIED,
    message: "認証がキャンセルされました",
  },
  server_error: {
    code: AUTH_ERROR_CODES.OAUTH_SERVER_ERROR,
    message: "認証サーバーでエラーが発生しました",
  },
  temporarily_unavailable: {
    code: AUTH_ERROR_CODES.OAUTH_TEMPORARILY_UNAVAILABLE,
    message: "認証サーバーが一時的に利用できません",
  },
  invalid_request: {
    code: AUTH_ERROR_CODES.OAUTH_INVALID_REQUEST,
    message: "認証リクエストが不正です",
  },
  unauthorized_client: {
    code: AUTH_ERROR_CODES.OAUTH_UNAUTHORIZED_CLIENT,
    message: "認証クライアントが許可されていません",
  },
  unsupported_response_type: {
    code: AUTH_ERROR_CODES.OAUTH_UNSUPPORTED_RESPONSE_TYPE,
    message: "サポートされていない認証タイプです",
  },
  invalid_scope: {
    code: AUTH_ERROR_CODES.OAUTH_INVALID_SCOPE,
    message: "無効な認証スコープです",
  },
};

/**
 * デフォルトのエラーメッセージ（未知のエラー用）
 */
const DEFAULT_ERROR: MappedError = {
  code: AUTH_ERROR_CODES.OAUTH_UNKNOWN_ERROR,
  message: "認証に失敗しました",
};

// =============================================================================
// Functions
// =============================================================================

/**
 * OAuth コールバック URL からエラーパラメータを抽出
 *
 * @param url - OAuth コールバック URL
 * @returns エラー情報（エラーがない場合は null）
 *
 * @example
 * parseOAuthError("aiworkflow://auth/callback#error=access_denied")
 * // => { error: "access_denied", errorDescription: undefined }
 *
 * parseOAuthError("aiworkflow://auth/callback#access_token=xxx")
 * // => null
 */
export function parseOAuthError(url: string): OAuthError | null {
  try {
    // URL からハッシュフラグメントを抽出
    const hashIndex = url.indexOf("#");
    if (hashIndex === -1) {
      return null;
    }

    // 追加の#を&に置換（複数の#がある場合のエッジケース対応）
    const hashFragment = url.substring(hashIndex + 1).replace(/#/g, "&");
    const hashParams = new URLSearchParams(hashFragment);
    const error = hashParams.get("error");

    // エラーパラメータがない場合は null
    if (!error) {
      return null;
    }

    const errorDescription = hashParams.get("error_description");

    return {
      error,
      errorDescription: errorDescription
        ? decodeURIComponent(errorDescription)
        : undefined,
    };
  } catch {
    // URL パース失敗時は null
    return null;
  }
}

/**
 * OAuth エラーコードをユーザーフレンドリーなメッセージにマッピング
 *
 * @param errorCode - OAuth エラーコード
 * @returns マッピングされたエラー情報
 *
 * @example
 * mapOAuthErrorToMessage("access_denied")
 * // => { code: "auth/oauth-access-denied", message: "認証がキャンセルされました" }
 */
export function mapOAuthErrorToMessage(errorCode: string): MappedError {
  return OAUTH_ERROR_MESSAGES[errorCode] ?? DEFAULT_ERROR;
}

/**
 * OAuth コールバックをエラーチェック付きで処理
 *
 * エラーパラメータが検出された場合は、Renderer プロセスにエラーを通知
 * エラーがない場合は true を返し、呼び出し元で通常のトークン処理を継続
 *
 * @param url - OAuth コールバック URL
 * @param mainWindow - BrowserWindow インスタンス
 * @returns エラーがない場合は true、エラー処理済みの場合は false
 */
export async function handleAuthCallbackWithErrorCheck(
  url: string,
  mainWindow: BrowserWindow,
): Promise<boolean> {
  const oauthError = parseOAuthError(url);

  if (oauthError) {
    const mappedError = mapOAuthErrorToMessage(oauthError.error);

    // エラーログ出力
    console.error(
      `[OAuth] Authentication error: ${oauthError.error}`,
      oauthError.errorDescription ?? "",
    );

    // Renderer プロセスにエラーを通知
    mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
      authenticated: false,
      error: mappedError.message,
      errorCode: mappedError.code,
    });

    return false;
  }

  // エラーがない場合は通常処理を継続
  return true;
}

/**
 * リフレッシュトークンの有効期限を計算
 *
 * @param sessionCreatedAt - セッション作成時刻（Unix timestamp in seconds）
 * @returns リフレッシュトークン有効期限（Unix timestamp in seconds）
 */
export function calculateRefreshTokenExpiry(sessionCreatedAt: number): number {
  // 7日間（604800秒）後
  const REFRESH_TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60; // 604800
  return sessionCreatedAt + REFRESH_TOKEN_LIFETIME_SECONDS;
}
