/**
 * useIpc - Electron IPC通信のカスタムフック
 *
 * レンダラープロセスからメインプロセスへの通信を抽象化します。
 */

import { useCallback } from "react";

export interface IpcHook {
  /**
   * IPCチャンネルを呼び出す
   * @param channel - IPCチャンネル名
   * @param data - 送信するデータ
   * @returns レスポンス
   */
  invoke: <T>(channel: string, data?: unknown) => Promise<T>;
}

/**
 * Electron IPC通信フック
 *
 * @example
 * ```tsx
 * const { invoke } = useIpc();
 * const result = await invoke<SearchResult>("search:file:execute", { query: "test" });
 * ```
 */
export function useIpc(): IpcHook {
  const invoke = useCallback(
    async <T>(channel: string, data?: unknown): Promise<T> => {
      if (typeof window === "undefined" || !window.electronAPI) {
        throw new Error("Electron API is not available");
      }

      return window.electronAPI.invoke<T>(channel, data);
    },
    [],
  );

  return { invoke };
}
