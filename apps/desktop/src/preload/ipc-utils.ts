/**
 * IPC ユーティリティ - Preload 共通ヘルパー
 *
 * timeout-aware invoke を一元管理し、index.ts / skill-api.ts / skill-creator-api.ts から再利用する。
 *
 * @module @repo/desktop/preload/ipc-utils
 */

import { ipcRenderer } from "electron";

/** IPC呼び出しのデフォルトタイムアウト（ミリ秒） */
export const IPC_TIMEOUT_MS = 5000;

/**
 * タイムアウト付き IPC invoke ヘルパー
 *
 * @param allowedChannels - 許可されたチャンネルリスト
 * @param channel - IPC チャンネル名
 * @param args - IPC 引数
 * @returns IPC レスポンス
 * @throws Error - チャンネル不許可またはタイムアウト時
 */
export function invokeWithTimeout<T>(
  allowedChannels: readonly string[],
  channel: string,
  ...args: unknown[]
): Promise<T> {
  if (!allowedChannels.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }

  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `IPC timeout: ${channel} did not respond within ${IPC_TIMEOUT_MS}ms`,
        ),
      );
    }, IPC_TIMEOUT_MS);

    ipcRenderer
      .invoke(channel, ...args)
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result as T);
      })
      .catch((error: unknown) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}
