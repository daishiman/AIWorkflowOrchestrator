/**
 * authModeHandlers - 認証方式選択機能のIPCハンドラ
 *
 * 認証モード（subscription/api-key）の取得・設定・検証を行うIPCハンドラ。
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/ipc-specification.md
 */
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";
import type { IpcMain } from "electron";
import type {
  AuthModeErrorCode,
  AuthModeChangedEvent,
  AuthModeResponse,
  AuthModeSetRequest,
  AuthModeStatus as AuthModeTransportStatus,
  AuthModeValidateRequest,
  IPCResponse,
} from "@repo/shared/types/auth-mode";
import { IPC_CHANNELS } from "../../preload/channels";
import type { AuthModeService } from "../services/auth/AuthModeService";
import type { AuthMode, AuthStatus } from "../services/auth/types";
import {
  VALID_AUTH_MODES,
  AUTH_MODE_ERROR_CODES,
} from "../services/auth/types";

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

function buildErrorResponse<T = void>(
  code: AuthModeErrorCode,
  message: string,
  guidance?: string,
): IPCResponse<T> {
  return {
    success: false,
    error: {
      code,
      message,
      guidance,
    },
  };
}

function getSuccessMessage(mode: AuthMode): string {
  return mode === "subscription"
    ? "Claude Code CLI の認証情報を使用できます"
    : "Anthropic APIキーを使用できます";
}

function getFailureStatus(mode: AuthMode): AuthModeTransportStatus {
  const lastCheckedAt = Date.now();

  if (mode === "subscription") {
    return {
      mode,
      isValid: false,
      hasCredentials: false,
      message: "サブスクリプションが見つかりません",
      errorCode: AUTH_MODE_ERROR_CODES.NO_SUBSCRIPTION_TOKEN,
      guidance: "Claude Code CLIでログインしてください",
      lastCheckedAt,
    };
  }

  return {
    mode,
    isValid: false,
    hasCredentials: false,
    message: "APIキーが設定されていません",
    errorCode: AUTH_MODE_ERROR_CODES.NO_API_KEY,
    guidance: "設定画面でAPIキーを入力してください",
    lastCheckedAt,
  };
}

function mapAuthStatusToTransport(status: AuthStatus): AuthModeTransportStatus {
  return {
    mode: status.mode,
    isValid: status.isAuthenticated,
    hasCredentials: status.hasCredentials,
    message: status.error?.message ?? getSuccessMessage(status.mode),
    errorCode: status.error?.code as AuthModeTransportStatus["errorCode"],
    guidance: status.error?.guidance,
    lastCheckedAt: Date.now(),
  };
}

async function buildTransportStatus(
  authModeService: AuthModeService,
  mode?: AuthMode,
): Promise<AuthModeTransportStatus> {
  const currentMode = authModeService.getMode();
  if (!mode || mode === currentMode) {
    const status = await authModeService.getStatus();
    return mapAuthStatusToTransport(status);
  }

  const hasCredentials = await authModeService.validateMode(mode);
  if (hasCredentials) {
    return {
      mode,
      isValid: true,
      hasCredentials: true,
      message: getSuccessMessage(mode),
      lastCheckedAt: Date.now(),
    };
  }

  return getFailureStatus(mode);
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
    async (event): Promise<IPCResponse<AuthModeResponse>> => {
      // Sender検証
      if (!validateSender(event)) {
        return buildErrorResponse(
          AUTH_MODE_ERROR_CODES.INVALID_SENDER,
          "Invalid request sender",
        );
      }

      try {
        const mode = authModeService.getMode();
        return {
          success: true,
          data: { mode },
        };
      } catch (error) {
        return buildErrorResponse(
          AUTH_MODE_ERROR_CODES.STORAGE_READ_FAILED,
          sanitizeErrorMessage(error),
        );
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
        return buildErrorResponse(
          AUTH_MODE_ERROR_CODES.INVALID_SENDER,
          "Invalid request sender",
        );
      }

      // 入力バリデーション
      if (!request || !validateAuthMode(request.mode)) {
        return buildErrorResponse(
          AUTH_MODE_ERROR_CODES.INVALID_MODE,
          `Invalid auth mode: ${request?.mode}. Must be one of: ${VALID_AUTH_MODES.join(", ")}`,
        );
      }

      try {
        const previousMode = authModeService.getMode();
        await authModeService.setMode(request.mode);

        // 成功時、Rendererに変更を通知
        const status = await buildTransportStatus(
          authModeService,
          request.mode,
        );
        const changedEvent: AuthModeChangedEvent = {
          previousMode,
          mode: request.mode,
          status,
          changedAt: Date.now(),
        };

        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send(
            IPC_CHANNELS.AUTH_MODE_CHANGED,
            changedEvent,
          );
        }

        return { success: true };
      } catch (error) {
        return buildErrorResponse(
          AUTH_MODE_ERROR_CODES.STORAGE_FAILED,
          sanitizeErrorMessage(error),
        );
      }
    },
  );

  // -----------------------------------------------------------------
  // auth-mode:status - 認証状態を取得
  // -----------------------------------------------------------------
  main.handle(
    IPC_CHANNELS.AUTH_MODE_STATUS,
    async (event): Promise<IPCResponse<AuthModeTransportStatus>> => {
      // Sender検証
      if (!validateSender(event)) {
        return buildErrorResponse(
          AUTH_MODE_ERROR_CODES.INVALID_SENDER,
          "Invalid request sender",
        );
      }

      try {
        const status = await buildTransportStatus(authModeService);
        return {
          success: true,
          data: status,
        };
      } catch (error) {
        return buildErrorResponse(
          AUTH_MODE_ERROR_CODES.UNKNOWN_ERROR,
          sanitizeErrorMessage(error),
        );
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
    ): Promise<IPCResponse<AuthModeTransportStatus>> => {
      // Sender検証
      if (!validateSender(event)) {
        return buildErrorResponse(
          AUTH_MODE_ERROR_CODES.INVALID_SENDER,
          "Invalid request sender",
        );
      }

      // modeが指定されていない場合は現在のモードを使用
      const modeToValidate = request?.mode ?? authModeService.getMode();

      // 入力バリデーション
      if (!validateAuthMode(modeToValidate)) {
        return buildErrorResponse(
          AUTH_MODE_ERROR_CODES.INVALID_MODE,
          `Invalid auth mode: ${modeToValidate}. Must be one of: ${VALID_AUTH_MODES.join(", ")}`,
        );
      }

      try {
        return {
          success: true,
          data: await buildTransportStatus(authModeService, modeToValidate),
        };
      } catch (error) {
        return buildErrorResponse(
          AUTH_MODE_ERROR_CODES.UNKNOWN_ERROR,
          sanitizeErrorMessage(error),
        );
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
