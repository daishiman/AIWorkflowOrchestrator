/**
 * IPC検証モジュール
 *
 * IPC通信の呼び出し元を検証する共通モジュール。
 * 不正なwebContentsからのAPI呼び出しを防止し、
 * 悪意のあるスクリプトやDevToolsからの不正アクセスを検出・拒否する。
 *
 * @see https://www.electronjs.org/docs/latest/tutorial/security#17-validate-the-sender-of-all-ipc-messages
 */

import { BrowserWindow, type IpcMainInvokeEvent } from "electron";

// ============================================================================
// 定数定義
// ============================================================================

/**
 * IPC検証エラーコード
 */
export const IPC_ERROR_CODES = {
  /** 認証されていない（BrowserWindowが見つからない） */
  UNAUTHORIZED: "IPC_UNAUTHORIZED",
  /** アクセス禁止（DevTools、未許可ウィンドウ） */
  FORBIDDEN: "IPC_FORBIDDEN",
} as const;

/**
 * IPC検証エラーメッセージ
 */
const IPC_ERROR_MESSAGES = {
  NO_BROWSER_WINDOW: "Unauthorized IPC call: no associated BrowserWindow",
  FROM_DEVTOOLS: "IPC call from DevTools is not allowed",
  UNAUTHORIZED_WINDOW: "IPC call from unauthorized window",
  DEFAULT: "Unauthorized IPC call",
} as const;

/**
 * セキュリティログの理由メッセージ
 */
const LOG_REASONS = {
  NO_BROWSER_WINDOW: "No associated BrowserWindow found",
  FROM_DEVTOOLS: "Call from DevTools",
  NOT_IN_ALLOWED_LIST: "Window not in allowed list",
} as const;

// ============================================================================
// 型定義
// ============================================================================

/**
 * IPC検証結果
 */
export interface IPCValidationResult {
  /** 検証成功かどうか */
  valid: boolean;
  /** 失敗時のエラーコード */
  errorCode?: (typeof IPC_ERROR_CODES)[keyof typeof IPC_ERROR_CODES];
  /** 失敗時のエラーメッセージ */
  errorMessage?: string;
  /** 呼び出し元のwebContents ID */
  webContentsId?: number;
  /** 呼び出し元のBrowserWindow ID */
  windowId?: number | null;
}

/**
 * IPC検証オプション
 */
export interface IPCValidationOptions {
  /** 許可されたBrowserWindowの取得関数 */
  getAllowedWindows: () => BrowserWindow[];
  /** ログ出力関数（オプション） */
  logger?: SecurityLogger;
}

/**
 * セキュリティログ出力インターフェース
 */
export interface SecurityLogger {
  warn: (message: string, details?: Record<string, unknown>) => void;
  error: (message: string, details?: Record<string, unknown>) => void;
}

/**
 * セキュリティログイベント
 */
export interface SecurityLogEvent {
  timestamp: string;
  level: "warn" | "error";
  category: "security";
  event: "ipc_validation_failed";
  details: {
    channel: string;
    webContentsId: number;
    windowId: number | null;
    reason: string;
  };
}

// ============================================================================
// 内部ヘルパー関数
// ============================================================================

/**
 * セキュリティイベントをログ出力
 */
function logSecurityEvent(
  logger: SecurityLogger | undefined,
  channel: string,
  result: IPCValidationResult,
  reason: string,
): void {
  if (!logger) return;

  const event: SecurityLogEvent = {
    timestamp: new Date().toISOString(),
    level: "warn",
    category: "security",
    event: "ipc_validation_failed",
    details: {
      channel,
      webContentsId: result.webContentsId ?? -1,
      windowId: result.windowId ?? null,
      reason,
    },
  };

  logger.warn(`[Security] IPC call rejected: ${channel}`, event.details);
}

/**
 * 失敗結果を作成するヘルパー
 */
function createFailureResult(
  errorCode: (typeof IPC_ERROR_CODES)[keyof typeof IPC_ERROR_CODES],
  errorMessage: string,
  webContentsId: number,
  windowId: number | null,
): IPCValidationResult {
  return {
    valid: false,
    errorCode,
    errorMessage,
    webContentsId,
    windowId,
  };
}

// ============================================================================
// 検証関数
// ============================================================================

/**
 * IPC sender検証を実行
 *
 * 以下の検証を行う:
 * 1. webContentsからBrowserWindowを取得できるか
 * 2. DevToolsからの呼び出しでないか
 * 3. 許可されたウィンドウリストに含まれているか
 *
 * @param event - IpcMainInvokeEvent
 * @param channel - IPC channel名（ログ用）
 * @param options - 検証オプション
 * @returns 検証結果
 *
 * @example
 * ```typescript
 * const result = validateIpcSender(event, "auth:login", {
 *   getAllowedWindows: () => [mainWindow],
 *   logger: console,
 * });
 *
 * if (!result.valid) {
 *   return toIPCValidationError(result);
 * }
 * ```
 */
export function validateIpcSender(
  event: IpcMainInvokeEvent,
  channel: string,
  options: IPCValidationOptions,
): IPCValidationResult {
  const sender = event.sender;
  const webContentsId = sender.id;

  // Step 1: webContentsからBrowserWindowを取得
  const sourceWindow = BrowserWindow.fromWebContents(sender);

  if (!sourceWindow) {
    const result = createFailureResult(
      IPC_ERROR_CODES.UNAUTHORIZED,
      IPC_ERROR_MESSAGES.NO_BROWSER_WINDOW,
      webContentsId,
      null,
    );
    logSecurityEvent(
      options.logger,
      channel,
      result,
      LOG_REASONS.NO_BROWSER_WINDOW,
    );
    return result;
  }

  const windowId = sourceWindow.id;

  // Step 2: DevToolsからの呼び出しチェック
  if (sender.getType() === "webview" || sender.isDevToolsOpened()) {
    const isFromDevTools = sourceWindow.webContents.id !== webContentsId;

    if (isFromDevTools) {
      const result = createFailureResult(
        IPC_ERROR_CODES.FORBIDDEN,
        IPC_ERROR_MESSAGES.FROM_DEVTOOLS,
        webContentsId,
        windowId,
      );
      logSecurityEvent(
        options.logger,
        channel,
        result,
        LOG_REASONS.FROM_DEVTOOLS,
      );
      return result;
    }
  }

  // Step 3: 許可されたウィンドウリストとの照合
  const allowedWindows = options.getAllowedWindows();
  const isAllowed = allowedWindows.some((w) => w.id === windowId);

  if (!isAllowed) {
    const result = createFailureResult(
      IPC_ERROR_CODES.FORBIDDEN,
      IPC_ERROR_MESSAGES.UNAUTHORIZED_WINDOW,
      webContentsId,
      windowId,
    );
    logSecurityEvent(
      options.logger,
      channel,
      result,
      LOG_REASONS.NOT_IN_ALLOWED_LIST,
    );
    return result;
  }

  // 検証成功
  return {
    valid: true,
    webContentsId,
    windowId,
  };
}

// ============================================================================
// エラー変換ユーティリティ
// ============================================================================

/**
 * 検証結果をIPCResponseエラー形式に変換
 *
 * @param result - 検証結果
 * @returns IPCResponse形式のエラー
 *
 * @example
 * ```typescript
 * const validation = validateIpcSender(event, channel, options);
 * if (!validation.valid) {
 *   return toIPCValidationError(validation);
 * }
 * ```
 */
export function toIPCValidationError(result: IPCValidationResult): {
  success: false;
  error: {
    code: string;
    message: string;
  };
} {
  return {
    success: false,
    error: {
      code: result.errorCode ?? IPC_ERROR_CODES.UNAUTHORIZED,
      message: result.errorMessage ?? IPC_ERROR_MESSAGES.DEFAULT,
    },
  };
}

// ============================================================================
// ハンドラーラッパー
// ============================================================================

/**
 * IPC handler wrapper (検証付き)
 *
 * 既存のhandlerをラップして検証を追加する。
 * 検証失敗時はIPCResponse形式でエラーを返却。
 *
 * @param channel - IPC channel名
 * @param handler - 元のhandler関数
 * @param options - 検証オプション
 * @returns ラップされたhandler
 *
 * @example
 * ```typescript
 * ipcMain.handle(
 *   IPC_CHANNELS.AUTH_LOGIN,
 *   withValidation(
 *     IPC_CHANNELS.AUTH_LOGIN,
 *     async (event, { provider }) => {
 *       // 認証処理
 *     },
 *     { getAllowedWindows: () => [mainWindow] },
 *   ),
 * );
 * ```
 */
export function withValidation<T extends unknown[], R>(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: T) => Promise<R>,
  options: IPCValidationOptions,
): (
  event: IpcMainInvokeEvent,
  ...args: T
) => Promise<R | ReturnType<typeof toIPCValidationError>> {
  return async (event, ...args) => {
    const validation = validateIpcSender(event, channel, options);

    if (!validation.valid) {
      return toIPCValidationError(validation);
    }

    return handler(event, ...args);
  };
}
