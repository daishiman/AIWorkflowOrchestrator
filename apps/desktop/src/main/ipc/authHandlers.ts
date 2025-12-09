/**
 * 認証 IPC ハンドラー
 *
 * Main Process で認証関連のIPC通信を処理する
 */

import { ipcMain, shell, net, BrowserWindow } from "electron";
import type { SupabaseClient } from "@supabase/supabase-js";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  toAuthUser,
  parseAuthCallback,
  AUTH_REDIRECT_URL,
} from "@repo/shared/infrastructure/auth";
import {
  type AuthState,
  type AuthSession,
  type OAuthProvider,
  type IPCResponse,
  isValidProvider,
  AUTH_ERROR_CODES,
} from "@repo/shared/types/auth";
import { withValidation } from "../infrastructure/security/ipc-validator.js";

// === 型定義 ===

/**
 * セキュアストレージ操作インターフェース
 */
export interface SecureStorage {
  storeRefreshToken: (token: string) => Promise<void>;
  getRefreshToken: () => Promise<string | null>;
  clearTokens: () => Promise<void>;
}

// === 内部エラーメッセージのサニタイズ ===

/**
 * 内部エラーメッセージをサニタイズ（機密情報を除去）
 */
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    // 機密情報パターンを除去
    const sanitized = message
      .replace(/host=[\w.-]+/gi, "host=***")
      .replace(/password=[\w.-]+/gi, "password=***")
      .replace(/token=[\w.-]+/gi, "token=***")
      .replace(/key=[\w.-]+/gi, "key=***")
      .replace(/secret=[\w.-]+/gi, "secret=***");

    // 内部接続エラーは汎用メッセージに置換
    if (
      sanitized.includes("database connection") ||
      sanitized.includes("internal")
    ) {
      return "An internal error occurred";
    }
    return sanitized;
  }
  return "An unknown error occurred";
}

// === ハンドラー登録 ===

/**
 * 認証関連IPCハンドラーを登録
 */
export function registerAuthHandlers(
  mainWindow: BrowserWindow,
  supabase: SupabaseClient,
  secureStorage: SecureStorage,
): void {
  // auth:login - OAuthログイン開始
  ipcMain.handle(
    IPC_CHANNELS.AUTH_LOGIN,
    withValidation(
      IPC_CHANNELS.AUTH_LOGIN,
      async (
        _event,
        { provider }: { provider: string },
      ): Promise<IPCResponse<void>> => {
        try {
          // プロバイダーバリデーション
          if (!isValidProvider(provider)) {
            return {
              success: false,
              error: {
                code: AUTH_ERROR_CODES.INVALID_PROVIDER,
                message: `Invalid provider: ${provider}. Must be one of: google, github, discord`,
              },
            };
          }

          // OAuth URL取得
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider as OAuthProvider,
            options: {
              redirectTo: AUTH_REDIRECT_URL,
              skipBrowserRedirect: true,
            },
          });

          if (error) {
            return {
              success: false,
              error: {
                code: AUTH_ERROR_CODES.LOGIN_FAILED,
                message: error.message,
              },
            };
          }

          if (!data.url) {
            return {
              success: false,
              error: {
                code: AUTH_ERROR_CODES.LOGIN_FAILED,
                message: "Failed to generate OAuth URL",
              },
            };
          }

          // 外部ブラウザで認証URLを開く
          await shell.openExternal(data.url);

          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: {
              code: AUTH_ERROR_CODES.LOGIN_FAILED,
              message: sanitizeErrorMessage(error),
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // auth:logout - ログアウト
  ipcMain.handle(
    IPC_CHANNELS.AUTH_LOGOUT,
    withValidation(
      IPC_CHANNELS.AUTH_LOGOUT,
      async (_event): Promise<IPCResponse<void>> => {
        try {
          const { error } = await supabase.auth.signOut();

          if (error) {
            return {
              success: false,
              error: {
                code: AUTH_ERROR_CODES.LOGOUT_FAILED,
                message: error.message,
              },
            };
          }

          // ストレージからトークン削除
          await secureStorage.clearTokens();

          // Rendererに認証状態変更を通知
          mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
            authenticated: false,
          } as AuthState);

          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: {
              code: AUTH_ERROR_CODES.LOGOUT_FAILED,
              message: sanitizeErrorMessage(error),
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // auth:get-session - セッション取得
  ipcMain.handle(
    IPC_CHANNELS.AUTH_GET_SESSION,
    withValidation(
      IPC_CHANNELS.AUTH_GET_SESSION,
      async (_event): Promise<IPCResponse<AuthSession | null>> => {
        try {
          const isOnline = net.isOnline();

          // オンラインの場合はSupabaseからセッション取得
          const { data, error } = await supabase.auth.getSession();

          if (error && !isOnline) {
            // オフライン時はリフレッシュトークンからセッション復元を試みる
            const refreshToken = await secureStorage.getRefreshToken();
            if (refreshToken) {
              const { data: refreshData, error: refreshError } =
                await supabase.auth.setSession({
                  access_token: "",
                  refresh_token: refreshToken,
                });

              if (!refreshError && refreshData.session) {
                const user = toAuthUser(refreshData.session.user);
                if (user) {
                  return {
                    success: true,
                    data: {
                      user,
                      accessToken: refreshData.session.access_token,
                      refreshToken: refreshData.session.refresh_token,
                      expiresAt:
                        refreshData.session.expires_at ??
                        Date.now() / 1000 + 3600,
                      isOffline: true,
                    },
                  };
                }
              }
            }
          }

          if (!data.session) {
            return { success: true, data: null };
          }

          // リフレッシュトークンを保存
          if (data.session.refresh_token) {
            await secureStorage.storeRefreshToken(data.session.refresh_token);
          }

          const user = toAuthUser(data.session.user);
          if (!user) {
            return { success: true, data: null };
          }

          return {
            success: true,
            data: {
              user,
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
              expiresAt: data.session.expires_at ?? Date.now() / 1000 + 3600,
              isOffline: !isOnline,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: {
              code: AUTH_ERROR_CODES.SESSION_FAILED,
              message: sanitizeErrorMessage(error),
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // auth:refresh - トークン更新
  ipcMain.handle(
    IPC_CHANNELS.AUTH_REFRESH,
    withValidation(
      IPC_CHANNELS.AUTH_REFRESH,
      async (_event): Promise<IPCResponse<AuthSession>> => {
        try {
          const refreshToken = await secureStorage.getRefreshToken();

          if (!refreshToken) {
            return {
              success: false,
              error: {
                code: AUTH_ERROR_CODES.REFRESH_FAILED,
                message: "No refresh token available",
              },
            };
          }

          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
          });

          if (error || !data.session) {
            // リフレッシュ失敗時はトークンをクリア
            await secureStorage.clearTokens();

            return {
              success: false,
              error: {
                code: AUTH_ERROR_CODES.REFRESH_FAILED,
                message: error?.message ?? "Token refresh failed",
              },
            };
          }

          // 新しいリフレッシュトークンを保存
          await secureStorage.storeRefreshToken(data.session.refresh_token);

          const user = toAuthUser(data.session.user);
          if (!user) {
            return {
              success: false,
              error: {
                code: AUTH_ERROR_CODES.REFRESH_FAILED,
                message: "Failed to parse user data",
              },
            };
          }

          return {
            success: true,
            data: {
              user,
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
              expiresAt: data.session.expires_at ?? Date.now() / 1000 + 3600,
              isOffline: false,
            },
          };
        } catch (error) {
          // リフレッシュ失敗時はトークンをクリア
          await secureStorage.clearTokens();

          return {
            success: false,
            error: {
              code: AUTH_ERROR_CODES.REFRESH_FAILED,
              message: sanitizeErrorMessage(error),
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // auth:check-online - オンライン状態確認
  ipcMain.handle(
    IPC_CHANNELS.AUTH_CHECK_ONLINE,
    withValidation(
      IPC_CHANNELS.AUTH_CHECK_ONLINE,
      async (_event): Promise<IPCResponse<{ online: boolean }>> => {
        return {
          success: true,
          data: { online: net.isOnline() },
        };
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );
}

// === コールバック処理 ===

/**
 * OAuthコールバックURLからトークンを抽出
 * @deprecated parseAuthCallback を使用してください
 */
export { parseAuthCallback as handleAuthCallback };

/**
 * OAuthコールバックを処理してセッションを設定
 */
export async function processAuthCallback(
  callbackUrl: string,
  mainWindow: BrowserWindow,
  supabase: SupabaseClient,
  secureStorage: SecureStorage,
): Promise<void> {
  const tokens = parseAuthCallback(callbackUrl);

  // Supabaseセッションを設定
  const { data, error } = await supabase.auth.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });

  if (error) {
    throw new Error(`Failed to set session: ${error.message}`);
  }

  if (!data.session) {
    throw new Error("Failed to set session: no session returned");
  }

  // リフレッシュトークンを保存
  await secureStorage.storeRefreshToken(data.session.refresh_token);

  // Rendererに認証状態変更を通知
  const user = toAuthUser(data.session.user);
  mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
    authenticated: true,
    user,
  } as AuthState);
}
