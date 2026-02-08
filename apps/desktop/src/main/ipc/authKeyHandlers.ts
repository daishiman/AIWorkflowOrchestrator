/**
 * 認証キー IPC ハンドラー
 *
 * Renderer からの認証キー操作リクエストを処理する。
 * 全ハンドラーで sender 検証を実施。
 *
 * @see ipc-specification.md
 * @see architecture-design.md
 */

import { ipcMain, type IpcMainInvokeEvent, type BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { withValidation } from "../infrastructure/security/ipc-validator";
import type {
  IAuthKeyService,
  AuthKeySetRequest,
  AuthKeySetResponse,
  AuthKeyExistsResponse,
  AuthKeyValidateRequest,
  AuthKeyValidateResponse,
  AuthKeyDeleteResponse,
} from "../services/auth/types";
import {
  ANTHROPIC_API_KEY_SANITIZE_PATTERN,
  MAX_KEY_LENGTH,
} from "../services/auth/types";

// =================================================================
// ハンドラー登録状態
// =================================================================

/** ハンドラーが登録済みかどうか */
let handlersRegistered = false;

// =================================================================
// 共通バリデーション型
// =================================================================

/** バリデーション結果 */
interface ValidationResult {
  valid: boolean;
  key?: string;
  error?: string;
}

// =================================================================
// エラーサニタイズ
// =================================================================

/**
 * 文字列から API キーをサニタイズ
 *
 * @param text - サニタイズ対象の文字列
 * @returns サニタイズされた文字列
 */
function sanitizeApiKey(text: string): string {
  return text.replace(ANTHROPIC_API_KEY_SANITIZE_PATTERN, "[REDACTED]");
}

/**
 * エラーをサニタイズ（認証キーを除去）
 *
 * ログ出力時に機密情報を除去する。
 *
 * @param error - サニタイズ対象のエラー
 * @returns サニタイズされたエラー情報
 */
function sanitizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: sanitizeApiKey(error.message),
    };
  }
  return { error: String(error) };
}

/**
 * エラーメッセージを取得
 *
 * @param error - エラーオブジェクト
 * @returns エラーメッセージ
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return sanitizeApiKey(error.message);
  }
  return "Unknown error";
}

// =================================================================
// リクエストバリデーション
// =================================================================

/**
 * リクエストから API キーを抽出してバリデーション
 *
 * @param request - リクエストオブジェクト
 * @returns バリデーション結果（キーが必須）
 */
function extractAndValidateKey(request: unknown): ValidationResult {
  if (!request || typeof request !== "object") {
    return { valid: false, error: "Invalid request format" };
  }

  const { key } = request as AuthKeySetRequest | AuthKeyValidateRequest;

  if (!key || typeof key !== "string") {
    return { valid: false, error: "API Key is required" };
  }

  if (key.length === 0) {
    return { valid: false, error: "API Key cannot be empty" };
  }

  return { valid: true, key };
}

/**
 * AuthKeySetRequest のバリデーション（より厳密なチェック）
 *
 * @param request - リクエストオブジェクト
 * @returns バリデーション結果
 */
function validateSetRequest(request: unknown): ValidationResult {
  const baseResult = extractAndValidateKey(request);
  if (!baseResult.valid || !baseResult.key) {
    return baseResult;
  }

  const { key } = baseResult;

  // 追加の厳密なチェック（setKey 時のみ）
  if (key.length > MAX_KEY_LENGTH) {
    return { valid: false, error: "API Key is too long" };
  }

  if (!key.startsWith("sk-")) {
    return { valid: false, error: "Invalid API Key format" };
  }

  return { valid: true, key };
}

/**
 * AuthKeyValidateRequest のバリデーション
 *
 * @param request - リクエストオブジェクト
 * @returns バリデーション結果
 */
function validateValidateRequest(request: unknown): ValidationResult {
  // 検証リクエストは基本バリデーションのみ
  return extractAndValidateKey(request);
}

// =================================================================
// ハンドラー登録
// =================================================================

/**
 * 認証キー IPC ハンドラーを登録
 *
 * @param mainWindow - メインウィンドウ（sender 検証用）
 * @param authKeyService - 認証キー管理サービス
 */
export function registerAuthKeyHandlers(
  mainWindow: BrowserWindow,
  authKeyService: IAuthKeyService,
): void {
  // 二重登録を防止
  if (handlersRegistered) {
    console.warn("[AuthKeyHandlers] Handlers already registered, skipping");
    return;
  }

  // auth-key:set - 認証キーを設定
  ipcMain.handle(
    IPC_CHANNELS.AUTH_KEY_SET,
    withValidation(
      IPC_CHANNELS.AUTH_KEY_SET,
      async (
        _event: IpcMainInvokeEvent,
        request: unknown,
      ): Promise<AuthKeySetResponse> => {
        try {
          // リクエストバリデーション
          const validation = validateSetRequest(request);
          if (!validation.valid || !validation.key) {
            return { success: false, error: validation.error };
          }

          // キー設定
          await authKeyService.setKey(validation.key);

          return { success: true };
        } catch (error) {
          console.error(
            "[AuthKeyHandlers] setKey error:",
            sanitizeError(error),
          );
          return {
            success: false,
            error: getErrorMessage(error),
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // auth-key:exists - 認証キーの存在確認
  ipcMain.handle(
    IPC_CHANNELS.AUTH_KEY_EXISTS,
    withValidation(
      IPC_CHANNELS.AUTH_KEY_EXISTS,
      async (_event: IpcMainInvokeEvent): Promise<AuthKeyExistsResponse> => {
        try {
          const exists = await authKeyService.hasKey();
          return { exists };
        } catch (error) {
          console.error(
            "[AuthKeyHandlers] hasKey error:",
            sanitizeError(error),
          );
          // エラー時は false を返す（セキュリティ上の理由）
          return { exists: false };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // auth-key:validate - 認証キーを検証
  ipcMain.handle(
    IPC_CHANNELS.AUTH_KEY_VALIDATE,
    withValidation(
      IPC_CHANNELS.AUTH_KEY_VALIDATE,
      async (
        _event: IpcMainInvokeEvent,
        request: unknown,
      ): Promise<AuthKeyValidateResponse> => {
        try {
          // リクエストバリデーション
          const validation = validateValidateRequest(request);
          if (!validation.valid || !validation.key) {
            return { valid: false, error: validation.error };
          }

          // キー検証
          const valid = await authKeyService.validateKey(validation.key);
          return { valid };
        } catch (error) {
          console.error(
            "[AuthKeyHandlers] validateKey error:",
            sanitizeError(error),
          );
          return {
            valid: false,
            error: getErrorMessage(error),
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // auth-key:delete - 認証キーを削除
  ipcMain.handle(
    IPC_CHANNELS.AUTH_KEY_DELETE,
    withValidation(
      IPC_CHANNELS.AUTH_KEY_DELETE,
      async (_event: IpcMainInvokeEvent): Promise<AuthKeyDeleteResponse> => {
        try {
          await authKeyService.deleteKey();
          return { success: true };
        } catch (error) {
          console.error(
            "[AuthKeyHandlers] deleteKey error:",
            sanitizeError(error),
          );
          return {
            success: false,
            error: getErrorMessage(error),
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  handlersRegistered = true;
  console.info("[AuthKeyHandlers] Handlers registered successfully");
}

/**
 * 認証キー IPC ハンドラーを解除
 */
export function unregisterAuthKeyHandlers(): void {
  if (!handlersRegistered) {
    return;
  }

  ipcMain.removeHandler(IPC_CHANNELS.AUTH_KEY_SET);
  ipcMain.removeHandler(IPC_CHANNELS.AUTH_KEY_EXISTS);
  ipcMain.removeHandler(IPC_CHANNELS.AUTH_KEY_VALIDATE);
  ipcMain.removeHandler(IPC_CHANNELS.AUTH_KEY_DELETE);

  handlersRegistered = false;
  console.info("[AuthKeyHandlers] Handlers unregistered");
}

/**
 * ハンドラー登録状態をリセット（テスト用）
 */
export function resetAuthKeyHandlersState(): void {
  handlersRegistered = false;
}
