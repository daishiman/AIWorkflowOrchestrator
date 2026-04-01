/**
 * IPC ユーティリティ - Preload 共通ヘルパー
 *
 * timeout-aware invoke を一元管理し、index.ts / skill-api.ts / skill-creator-api.ts から再利用する。
 * チャンネル別タイムアウトをサポート: getChannelTimeout() が各チャンネルの値を返す。
 *
 * @module @repo/desktop/preload/ipc-utils
 */

import { ipcRenderer } from "electron";

/** IPC呼び出しのデフォルトタイムアウト（ミリ秒）。CHANNEL_TIMEOUTS 未定義チャンネルのフォールバック値 */
export const IPC_TIMEOUT_MS = 5000;

/**
 * チャンネル別タイムアウト（ミリ秒）。
 * 未定義チャンネルは invokeWithTimeout 内で IPC_TIMEOUT_MS にフォールバックする。
 * 新しいチャンネルを追加する場合はここにエントリを追加すること。
 */
const CHANNEL_TIMEOUTS: Partial<Record<string, number>> = {
  "auth:login": 500, // fire-and-forgetなので短くてよい（OAuth起動確認のみ）
  "auth:get-session": 10000, // セッション取得: ネットワーク通信を伴う
  "auth:refresh": 10000, // トークンリフレッシュ: ネットワーク通信を伴う
  "skill-creator:plan": 30000, // スキル生成計画: AI生成処理を含む
  "skill:execute": 60000, // スキル実行: 長時間処理を含む
};

/**
 * チャンネル別タイムアウト値を返す
 *
 * @param channel - IPC チャンネル名
 * @returns タイムアウト値（ミリ秒）。CHANNEL_TIMEOUTS に未定義の場合は IPC_TIMEOUT_MS にフォールバック
 * @remarks CHANNEL_TIMEOUTS に定義されていないチャンネルは IPC_TIMEOUT_MS (5000ms) が返る
 */
export function getChannelTimeout(channel: string): number {
  return CHANNEL_TIMEOUTS[channel] ?? IPC_TIMEOUT_MS;
}

/**
 * タイムアウト付き IPC invoke ヘルパー
 *
 * チャンネルごとに getChannelTimeout() で取得したタイムアウト値を使用する。
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

  const timeout = getChannelTimeout(channel);

  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `IPC timeout: ${channel} did not respond within ${timeout}ms`,
        ),
      );
    }, timeout);

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
