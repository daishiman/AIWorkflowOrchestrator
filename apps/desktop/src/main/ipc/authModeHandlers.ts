/**
 * authModeHandlers - 認証方式選択機能のIPCハンドラ
 *
 * 認証モード（subscription/api-key）の取得・設定・検証を行うIPCハンドラ。
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/ipc-specification.md
 */
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";
import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type { AuthModeService } from "../services/auth/AuthModeService";
import type {
  AuthMode,
  AuthStatus,
  AuthModeValidationResult,
} from "../services/auth/types";
import {
  VALID_AUTH_MODES,
  AUTH_MODE_ERROR_CODES,
} from "../services/auth/types";

// =================================================================
// 型定義
// =================================================================

/**
 * IPCレスポンスの基本型
 */
interface IPCResponse<T = void> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * auth-mode:set リクエスト
 */
interface AuthModeSetRequest {
  mode: AuthMode;
}

/**
 * auth-mode:validate リクエスト
 */
interface AuthModeValidateRequest {
  mode: AuthMode;
}

/**
 * auth-mode:changed イベントペイロード
 */
interface AuthModeChangedEvent {
  previousMode: AuthMode;
  currentMode: AuthMode;
  timestamp: number;
  isAuthenticated: boolean;
}

/**
 * ハンドラ依存関係（テスト用DI）
 */
export interface AuthModeHandlerDependencies {
  ipcMain: IpcMain;
}

// =================================================================
// ヘルパー関数
// =================================================================

/**
 * エラーメッセージをサニタイズする
 *
 * 機密情報（トークン、APIキー）をマスクする
 */
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    // 機密情報パターンを除去
    const sanitized = message
      .replace(/token=[\w.-]+/gi, "token=***")
      .replace(/key=[\w.-]+/gi, "key=***")
      .replace(/sk-ant-[\w-]+/gi, "sk-***");
    return sanitized;
  }
  return "An unknown error occurred";
}

/**
 * 認証モードのバリデーション
 */
function validateAuthMode(mode: unknown): mode is AuthMode {
  return (
    typeof mode === "string" && VALID_AUTH_MODES.includes(mode as AuthMode)
  );
}

/**
 * Senderの検証（セキュリティ対策）
 *
 * 不正な送信元からのリクエストを拒否する
 */
function validateSender(event: IpcMainInvokeEvent): boolean {
  // senderが存在し、有効なウィンドウであることを確認
  if (!event.sender || event.sender.isDestroyed()) {
    return false;
  }

  // senderFrameのURLを確認（file://またはhttp://localhost のみ許可）
  const url = event.senderFrame?.url ?? "";
  const isValidOrigin =
    url.startsWith("file://") ||
    url.startsWith("http://localhost") ||
    url.startsWith("https://localhost");

  return isValidOrigin;
}

// =================================================================
// IPCハンドラ登録
// =================================================================

/**
 * 認証モード関連のIPCハンドラを登録
 *
 * @param mainWindow - メインウィンドウ
 * @param authModeService - 認証モードサービス
 * @param deps - 依存関係（テスト用）
 */
export function registerAuthModeHandlers(
  mainWindow: BrowserWindow,
  authModeService: AuthModeService,
  deps?: AuthModeHandlerDependencies,
): void {
  const main = deps?.ipcMain ?? ipcMain;

  // -----------------------------------------------------------------
  // auth-mode:get - 現在の認証方式を取得
  // -----------------------------------------------------------------
  main.handle(
    IPC_CHANNELS.AUTH_MODE_GET,
    async (event): Promise<IPCResponse<AuthMode>> => {
      // Sender検証
      if (!validateSender(event)) {
        return {
          success: false,
          error: {
            code: "auth-mode/invalid-sender",
            message: "Invalid request sender",
          },
        };
      }

      try {
        const mode = authModeService.getMode();
        return {
          success: true,
          data: mode,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: AUTH_MODE_ERROR_CODES.STORAGE_READ_FAILED,
            message: sanitizeErrorMessage(error),
          },
        };
      }
    },
  );

  // -----------------------------------------------------------------
  // auth-mode:set - 認証方式を設定
  // -----------------------------------------------------------------
  main.handle(
    IPC_CHANNELS.AUTH_MODE_SET,
    async (event, request: AuthModeSetRequest): Promise<IPCResponse<void>> => {
      // Sender検証
      if (!validateSender(event)) {
        return {
          success: false,
          error: {
            code: "auth-mode/invalid-sender",
            message: "Invalid request sender",
          },
        };
      }

      // 入力バリデーション
      if (!request || !validateAuthMode(request.mode)) {
        return {
          success: false,
          error: {
            code: AUTH_MODE_ERROR_CODES.INVALID_MODE,
            message: `Invalid auth mode: ${request?.mode}. Must be one of: ${VALID_AUTH_MODES.join(", ")}`,
          },
        };
      }

      try {
        const previousMode = authModeService.getMode();
        await authModeService.setMode(request.mode);

        // 成功時、Rendererに変更を通知
        const status = await authModeService.getStatus();
        const changedEvent: AuthModeChangedEvent = {
          previousMode,
          currentMode: request.mode,
          timestamp: Math.floor(Date.now() / 1000),
          isAuthenticated: status.isAuthenticated,
        };

        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send(
            IPC_CHANNELS.AUTH_MODE_CHANGED,
            changedEvent,
          );
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: {
            code: AUTH_MODE_ERROR_CODES.STORAGE_FAILED,
            message: sanitizeErrorMessage(error),
          },
        };
      }
    },
  );

  // -----------------------------------------------------------------
  // auth-mode:status - 認証状態を取得
  // -----------------------------------------------------------------
  main.handle(
    IPC_CHANNELS.AUTH_MODE_STATUS,
    async (event): Promise<IPCResponse<AuthStatus>> => {
      // Sender検証
      if (!validateSender(event)) {
        return {
          success: false,
          error: {
            code: "auth-mode/invalid-sender",
            message: "Invalid request sender",
          },
        };
      }

      try {
        const status = await authModeService.getStatus();
        return {
          success: true,
          data: status,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: AUTH_MODE_ERROR_CODES.UNKNOWN_ERROR,
            message: sanitizeErrorMessage(error),
          },
        };
      }
    },
  );

  // -----------------------------------------------------------------
  // auth-mode:validate - 認証方式を検証
  // -----------------------------------------------------------------
  main.handle(
    IPC_CHANNELS.AUTH_MODE_VALIDATE,
    async (
      event,
      request?: AuthModeValidateRequest,
    ): Promise<IPCResponse<AuthModeValidationResult>> => {
      // Sender検証
      if (!validateSender(event)) {
        return {
          success: false,
          error: {
            code: "auth-mode/invalid-sender",
            message: "Invalid request sender",
          },
        };
      }

      // modeが指定されていない場合は現在のモードを使用
      const modeToValidate = request?.mode ?? authModeService.getMode();

      // 入力バリデーション
      if (!validateAuthMode(modeToValidate)) {
        return {
          success: false,
          error: {
            code: AUTH_MODE_ERROR_CODES.INVALID_MODE,
            message: `Invalid auth mode: ${modeToValidate}. Must be one of: ${VALID_AUTH_MODES.join(", ")}`,
          },
        };
      }

      try {
        const isValid = await authModeService.validateMode(modeToValidate);
        const status = await authModeService.getStatus();

        const result: AuthModeValidationResult = {
          isValid,
          mode: modeToValidate,
          hasCredentials: status.hasCredentials,
          error: isValid ? undefined : status.error,
        };

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: AUTH_MODE_ERROR_CODES.UNKNOWN_ERROR,
            message: sanitizeErrorMessage(error),
          },
        };
      }
    },
  );
}

/**
 * 認証モード関連のIPCハンドラを解除
 *
 * @param deps - 依存関係（テスト用）
 */
export function unregisterAuthModeHandlers(
  deps?: AuthModeHandlerDependencies,
): void {
  const main = deps?.ipcMain ?? ipcMain;

  main.removeHandler(IPC_CHANNELS.AUTH_MODE_GET);
  main.removeHandler(IPC_CHANNELS.AUTH_MODE_SET);
  main.removeHandler(IPC_CHANNELS.AUTH_MODE_STATUS);
  main.removeHandler(IPC_CHANNELS.AUTH_MODE_VALIDATE);
}
