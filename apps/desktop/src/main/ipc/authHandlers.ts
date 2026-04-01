/**
 * 認証 IPC ハンドラー
 *
 * Main Process で認証関連のIPC通信を処理する
 */

import { ipcMain, net, BrowserWindow, type IpcMainInvokeEvent } from "electron";
import type { SupabaseClient } from "@supabase/supabase-js";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  toAuthUser,
  parseAuthCallback,
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
import { TokenRefreshScheduler } from "../services/tokenRefreshScheduler";
import { AuthFlowOrchestrator } from "../auth/authFlowOrchestrator";

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

// === スケジューラーインスタンス ===

let tokenRefreshScheduler: TokenRefreshScheduler | null = null;

/**
 * TokenRefreshScheduler インスタンスを取得（テスト用）
 */
export function getTokenRefreshScheduler(): TokenRefreshScheduler | null {
  return tokenRefreshScheduler;
}

/**
 * TokenRefreshScheduler を開始する
 * ログイン成功・セッション復元時に呼び出す
 */
function startTokenRefreshScheduler(
  expiresAtSeconds: number,
  supabase: SupabaseClient,
  secureStorage: SecureStorage,
  mainWindow: BrowserWindow,
): void {
  if (!tokenRefreshScheduler) {
    tokenRefreshScheduler = new TokenRefreshScheduler();
  }

  const expiresAtMs = expiresAtSeconds * 1000;

  tokenRefreshScheduler.start(expiresAtMs, {
    onRefresh: async () => {
      const refreshToken = await secureStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw new Error(error?.message ?? "Token refresh failed");
      }

      // 新しいリフレッシュトークンを保存
      await secureStorage.storeRefreshToken(data.session.refresh_token);

      const newExpiresAt = data.session.expires_at ?? Date.now() / 1000 + 3600;

      // Renderer に認証状態更新を通知
      const user = toAuthUser(data.session.user);
      if (user) {
        mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
          authenticated: true,
          user,
          expiresAt: newExpiresAt,
        });
      }

      return newExpiresAt * 1000; // ミリ秒で返す
    },
    onFailure: (error: Error) => {
      console.error(
        `[TokenRefreshScheduler] All retries failed: ${error.message}`,
      );

      // 全リトライ失敗 → ログアウト処理
      secureStorage.clearTokens().catch(() => {});
      mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
        authenticated: false,
      } as AuthState);
    },
    onSuccess: (newExpiresAtMs: number) => {
      console.info(
        `[TokenRefreshScheduler] Token refreshed automatically. Next expiry: ${new Date(newExpiresAtMs).toISOString()}`,
      );
    },
  });
}

/**
 * TokenRefreshScheduler を停止する
 */
function stopTokenRefreshScheduler(): void {
  tokenRefreshScheduler?.stop();
}

/**
 * TokenRefreshScheduler を破棄する（アプリ終了時）
 */
export function disposeTokenRefreshScheduler(): void {
  tokenRefreshScheduler?.dispose();
  tokenRefreshScheduler = null;
}

// === ハンドラー登録 ===

/**
 * 認証関連IPCハンドラーを登録
 */
// === オーケストレーターインスタンス ===

let authFlowOrchestrator: AuthFlowOrchestrator | null = null;

type AuthInvokeChannel =
  | (typeof IPC_CHANNELS)["AUTH_LOGIN"]
  | (typeof IPC_CHANNELS)["AUTH_LOGOUT"]
  | (typeof IPC_CHANNELS)["AUTH_GET_SESSION"]
  | (typeof IPC_CHANNELS)["AUTH_REFRESH"]
  | (typeof IPC_CHANNELS)["AUTH_CHECK_ONLINE"];

/**
 * AuthFlowOrchestrator インスタンスを取得（テスト用）
 */
export function getAuthFlowOrchestrator(): AuthFlowOrchestrator | null {
  return authFlowOrchestrator;
}

/**
 * 認証関連IPCハンドラーを登録
 */
export function registerAuthHandlers(
  mainWindow: BrowserWindow,
  supabase: SupabaseClient,
  secureStorage: SecureStorage,
): void {
  const registerValidatedAuthHandler = <TArgs extends unknown[]>(
    channel: AuthInvokeChannel,
    handler: (event: IpcMainInvokeEvent, ...args: TArgs) => Promise<unknown>,
  ): void => {
    ipcMain.handle(
      channel,
      withValidation(channel, handler, {
        getAllowedWindows: () => [mainWindow],
      }),
    );
  };

  // AuthFlowOrchestrator初期化
  authFlowOrchestrator = new AuthFlowOrchestrator(
    supabase,
    mainWindow,
    secureStorage,
  );

  // auth:login - OAuthログイン開始（fire-and-forget方式）
  // IPC タイムアウト（500ms）を回避するため、フロー開始後に即座に { success: true } を返す。
  // OAuth の成功・失敗は AuthFlowOrchestrator が AUTH_STATE_CHANGED イベントで通知する。
  registerValidatedAuthHandler(
    IPC_CHANNELS.AUTH_LOGIN,
    async (
      _event,
      { provider }: { provider: string },
    ): Promise<IPCResponse<void>> => {
      // プロバイダーバリデーション（invalid provider のみ即時エラー返却）
      if (!isValidProvider(provider)) {
        return {
          success: false,
          error: {
            code: AUTH_ERROR_CODES.INVALID_PROVIDER,
            message: `Invalid provider: ${provider}. Must be one of: google, github, discord`,
          },
        };
      }

      // fire-and-forget: OAuthフロー開始後に即座に success: true を返す。
      // エラー発生時は AuthFlowOrchestrator が AUTH_STATE_CHANGED で通知済みのため、
      // ここでは unhandled rejection を防ぐためのみ catch する。
      void authFlowOrchestrator!
        .startOAuthFlow(provider as OAuthProvider)
        .catch((err: unknown) => {
          console.error(
            "[authHandlers] OAuth flow error (notified via AUTH_STATE_CHANGED):",
            err instanceof Error ? err.message : err,
          );
        });

      return { success: true };
    },
  );

  // auth:logout - ログアウト
  registerValidatedAuthHandler(
    IPC_CHANNELS.AUTH_LOGOUT,
    async (_event): Promise<IPCResponse<void>> => {
      try {
        // スケジューラー停止
        stopTokenRefreshScheduler();

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
  );

  // auth:get-session - セッション取得
  registerValidatedAuthHandler(
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
  );

  // auth:refresh - トークン更新
  registerValidatedAuthHandler(
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
  );

  // auth:check-online - オンライン状態確認
  registerValidatedAuthHandler(
    IPC_CHANNELS.AUTH_CHECK_ONLINE,
    async (_event): Promise<IPCResponse<{ online: boolean }>> => {
      return {
        success: true,
        data: { online: net.isOnline() },
      };
    },
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

  // トークンリフレッシュスケジューラーを開始
  const expiresAt = data.session.expires_at ?? Date.now() / 1000 + 3600;
  startTokenRefreshScheduler(expiresAt, supabase, secureStorage, mainWindow);

  // Rendererに認証状態変更を通知
  const user = toAuthUser(data.session.user);
  mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
    authenticated: true,
    user,
    expiresAt,
  });
}
