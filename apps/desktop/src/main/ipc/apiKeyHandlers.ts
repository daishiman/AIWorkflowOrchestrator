/**
 * APIキーIPCハンドラー
 *
 * Renderer側からのAPIキー管理リクエストを処理
 *
 * TDD Phase: Green（完全実装）
 *
 * @see docs/30-workflows/api-key-management/architecture.md
 */

import { ipcMain } from "electron";
import type { BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type { ApiKeyStorage } from "../infrastructure/apiKeyStorage";
import { withValidation } from "../infrastructure/security/ipc-validator.js";
import {
  type AIProvider,
  type ApiKeyValidationResult,
  type ProviderListResult,
  isValidAIProvider,
  API_KEY_ERROR_CODES,
  API_KEY_CONSTRAINTS,
} from "@repo/shared/types/api-keys";
import { validateApiKey } from "@repo/shared/infrastructure/ai/apiKeyValidator";
import type { IPCResponse } from "@repo/shared/types/auth";

// === 内部ヘルパー関数 ===

/**
 * APIキー関連エラーメッセージをサニタイズ（機密情報を除去）
 *
 * @see security-requirements.md NFR-SEC-006
 */
function sanitizeApiKeyError(error: unknown, apiKey?: string): string {
  if (error instanceof Error) {
    let message = error.message;

    // APIキーパターンを除去
    message = message
      .replace(/sk-[A-Za-z0-9_-]+/g, "[REDACTED]")
      .replace(/sk-ant-[A-Za-z0-9_-]+/g, "[REDACTED]")
      .replace(/xai-[A-Za-z0-9_-]+/g, "[REDACTED]");

    // 渡されたAPIキーを直接除去
    if (apiKey && apiKey.length > 0) {
      message = message.split(apiKey).join("[REDACTED]");
    }

    // 内部接続エラーは汎用メッセージに置換
    if (
      message.includes("database connection") ||
      message.includes("internal") ||
      message.includes("db.internal")
    ) {
      return "An internal error occurred";
    }

    return message;
  }
  return "An unknown error occurred";
}

/**
 * APIキーフォーマットを検証
 *
 * @returns null if valid, error code if invalid
 */
function validateApiKeyInput(
  apiKey: string,
): { code: string; message: string } | null {
  if (!apiKey || apiKey.length === 0) {
    return {
      code: API_KEY_ERROR_CODES.EMPTY_API_KEY,
      message: "API key cannot be empty",
    };
  }

  if (apiKey.length > API_KEY_CONSTRAINTS.maxLength) {
    return {
      code: API_KEY_ERROR_CODES.API_KEY_TOO_LONG,
      message: `API key exceeds maximum length of ${API_KEY_CONSTRAINTS.maxLength}`,
    };
  }

  // インジェクション対策：禁止文字チェック
  if (API_KEY_CONSTRAINTS.forbiddenPattern.test(apiKey)) {
    return {
      code: API_KEY_ERROR_CODES.INVALID_API_KEY_FORMAT,
      message: "API key contains invalid characters",
    };
  }

  return null;
}

/**
 * 現在のタイムスタンプを取得（ISO 8601形式）
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// === ハンドラー登録 ===

/**
 * APIキーIPCハンドラーを登録
 *
 * @param mainWindow - メインウィンドウ参照
 * @param apiKeyStorage - APIキーストレージ
 */
export function registerApiKeyHandlers(
  mainWindow: BrowserWindow,
  apiKeyStorage: ApiKeyStorage,
): void {
  // apiKey:save - APIキー保存
  ipcMain.handle(
    IPC_CHANNELS.API_KEY_SAVE,
    withValidation(
      IPC_CHANNELS.API_KEY_SAVE,
      async (
        _event,
        { provider, apiKey }: { provider: string; apiKey: string },
      ): Promise<IPCResponse<{ provider: AIProvider; savedAt: string }>> => {
        try {
          // プロバイダーバリデーション
          if (!isValidAIProvider(provider)) {
            return {
              success: false,
              error: {
                code: API_KEY_ERROR_CODES.INVALID_PROVIDER,
                message: `Invalid provider: ${provider}. Must be one of: openai, anthropic, google, xai`,
              },
            };
          }

          // APIキーフォーマットバリデーション
          const keyError = validateApiKeyInput(apiKey);
          if (keyError) {
            return {
              success: false,
              error: keyError,
            };
          }

          // ストレージに保存
          const result = await apiKeyStorage.saveApiKey(
            provider as AIProvider,
            apiKey,
          );

          if (!result.success) {
            return {
              success: false,
              error: {
                code: result.errorCode ?? API_KEY_ERROR_CODES.SAVE_FAILED,
                message: sanitizeApiKeyError(
                  new Error(result.errorMessage ?? "Failed to save API key"),
                  apiKey,
                ),
              },
            };
          }

          return {
            success: true,
            data: {
              provider: provider as AIProvider,
              savedAt: getCurrentTimestamp(),
            },
          };
        } catch (error) {
          return {
            success: false,
            error: {
              code: API_KEY_ERROR_CODES.SAVE_FAILED,
              message: sanitizeApiKeyError(error, apiKey),
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // apiKey:delete - APIキー削除
  ipcMain.handle(
    IPC_CHANNELS.API_KEY_DELETE,
    withValidation(
      IPC_CHANNELS.API_KEY_DELETE,
      async (
        _event,
        { provider }: { provider: string },
      ): Promise<IPCResponse<{ provider: AIProvider; deletedAt: string }>> => {
        try {
          // プロバイダーバリデーション
          if (!isValidAIProvider(provider)) {
            return {
              success: false,
              error: {
                code: API_KEY_ERROR_CODES.INVALID_PROVIDER,
                message: `Invalid provider: ${provider}. Must be one of: openai, anthropic, google, xai`,
              },
            };
          }

          // ストレージから削除
          const result = await apiKeyStorage.deleteApiKey(
            provider as AIProvider,
          );

          if (!result.success) {
            return {
              success: false,
              error: {
                code: result.errorCode ?? API_KEY_ERROR_CODES.DELETE_FAILED,
                message: result.errorMessage ?? "Failed to delete API key",
              },
            };
          }

          return {
            success: true,
            data: {
              provider: provider as AIProvider,
              deletedAt: getCurrentTimestamp(),
            },
          };
        } catch (error) {
          return {
            success: false,
            error: {
              code: API_KEY_ERROR_CODES.DELETE_FAILED,
              message: sanitizeApiKeyError(error),
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // apiKey:validate - APIキー検証
  ipcMain.handle(
    IPC_CHANNELS.API_KEY_VALIDATE,
    withValidation(
      IPC_CHANNELS.API_KEY_VALIDATE,
      async (
        _event,
        { provider, apiKey }: { provider: string; apiKey: string },
      ): Promise<IPCResponse<ApiKeyValidationResult>> => {
        try {
          // プロバイダーバリデーション
          if (!isValidAIProvider(provider)) {
            return {
              success: false,
              error: {
                code: API_KEY_ERROR_CODES.INVALID_PROVIDER,
                message: `Invalid provider: ${provider}. Must be one of: openai, anthropic, google, xai`,
              },
            };
          }

          // 実際のAPI検証を実行（外部APIコール）
          const validationResult = await validateApiKey(
            provider as AIProvider,
            apiKey,
          );

          return {
            success: true,
            data: validationResult,
          };
        } catch (error) {
          // 検証自体が成功しても失敗しても、レスポンスは成功（結果はdataに含む）
          return {
            success: true,
            data: {
              provider: provider as AIProvider,
              status: "unknown_error",
              validatedAt: getCurrentTimestamp(),
              errorMessage: sanitizeApiKeyError(error, apiKey),
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // apiKey:list - プロバイダー一覧取得
  ipcMain.handle(
    IPC_CHANNELS.API_KEY_LIST,
    withValidation(
      IPC_CHANNELS.API_KEY_LIST,
      async (_event): Promise<IPCResponse<ProviderListResult>> => {
        try {
          const result = await apiKeyStorage.listProviders();

          return {
            success: true,
            data: result,
          };
        } catch (error) {
          return {
            success: false,
            error: {
              code: API_KEY_ERROR_CODES.GET_FAILED,
              message: sanitizeApiKeyError(error),
            },
          };
        }
      },
      { getAllowedWindows: () => [mainWindow] },
    ),
  );

  // Note: apiKey:get は登録しない（セキュリティ要件: NFR-SEC-008）
  // Main Process内部でのみ使用
}
