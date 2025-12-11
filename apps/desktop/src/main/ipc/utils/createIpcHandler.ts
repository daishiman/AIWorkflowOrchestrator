/**
 * IPC Handler Utility
 *
 * 共通のエラーハンドリングとレスポンス形式を提供するIPC handlerユーティリティ。
 * DRY原則に従い、重複コードを削減します。
 *
 * @module createIpcHandler
 */

import { ipcMain, type IpcMainInvokeEvent } from "electron";

/**
 * エラーコードの標準定義
 */
export type IpcErrorCode =
  | "VALIDATION_ERROR"
  | "STORAGE_ERROR"
  | "PARSE_ERROR"
  | "NOT_FOUND"
  | "ACCESS_DENIED"
  | "NOT_DIRECTORY"
  | "CANCELED"
  | "UNKNOWN_ERROR";

/**
 * IPCレスポンスの基本型
 */
export interface IpcResponse<T = void> {
  success: boolean;
  data?: T;
  error?: {
    code: IpcErrorCode | string;
    message: string;
  };
}

/**
 * IPCエラークラス
 * ハンドラー内でthrowすることで、適切なエラーレスポンスに変換される
 */
export class IpcError extends Error {
  constructor(
    public readonly code: IpcErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "IpcError";
  }
}

/**
 * IPC handlerを作成するファクトリ関数
 *
 * @param channel IPCチャンネル名
 * @param handler 実際のハンドラー関数
 * @param errorLogPrefix エラーログのプレフィックス（オプション）
 *
 * @example
 * ```typescript
 * createIpcHandler<Request, Response>(
 *   "my:channel",
 *   async (request) => {
 *     if (!request.id) {
 *       throw new IpcError("VALIDATION_ERROR", "ID is required");
 *     }
 *     return { id: request.id, name: "example" };
 *   },
 *   "MyHandler"
 * );
 * ```
 */
export function createIpcHandler<TRequest = void, TResponse = void>(
  channel: string,
  handler: (request: TRequest, event: IpcMainInvokeEvent) => Promise<TResponse>,
  errorLogPrefix?: string,
): void {
  const logPrefix = errorLogPrefix ?? channel;

  ipcMain.handle(
    channel,
    async (
      event: IpcMainInvokeEvent,
      request: TRequest,
    ): Promise<IpcResponse<TResponse>> => {
      try {
        const data = await handler(request, event);
        return { success: true, data };
      } catch (error) {
        // IpcErrorの場合はコードとメッセージをそのまま使用
        if (error instanceof IpcError) {
          return {
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          };
        }

        // 通常のErrorの場合
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error(`${logPrefix} error:`, error);

        return {
          success: false,
          error: {
            code: "UNKNOWN_ERROR",
            message,
          },
        };
      }
    },
  );
}

/**
 * レスポンスなしのIPC handlerを作成
 * 操作の成功/失敗のみを返すケース用
 */
export function createVoidIpcHandler<TRequest = void>(
  channel: string,
  handler: (request: TRequest, event: IpcMainInvokeEvent) => Promise<void>,
  errorLogPrefix?: string,
): void {
  createIpcHandler<TRequest, void>(channel, handler, errorLogPrefix);
}

/**
 * リクエストなしのIPC handlerを作成
 * パラメータを受け取らないケース用
 */
export function createNoRequestIpcHandler<TResponse>(
  channel: string,
  handler: (event: IpcMainInvokeEvent) => Promise<TResponse>,
  errorLogPrefix?: string,
): void {
  createIpcHandler<void, TResponse>(
    channel,
    (_request, event) => handler(event),
    errorLogPrefix,
  );
}
