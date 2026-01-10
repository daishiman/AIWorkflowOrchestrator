/**
 * Preloadスクリプトテンプレート
 *
 * このファイルをプロジェクトのpreload.tsとしてコピーして使用してください。
 * 実際のAPIに合わせてチャネル名と型を修正してください。
 */

import { contextBridge, ipcRenderer } from "electron";

// ============================================================
// 1. チャネル定数（ipc-types-template.tsからインポート推奨）
// ============================================================

const IPC_CHANNELS = {
  FILE_READ: "app:file:read",
  FILE_WRITE: "app:file:write",
  SETTINGS_GET: "app:settings:get",
  SETTINGS_SET: "app:settings:set",
  WINDOW_MINIMIZE: "app:window:minimize",
  WINDOW_MAXIMIZE: "app:window:maximize",
  WINDOW_CLOSE: "app:window:close",
} as const;

// ============================================================
// 2. API定義
// ============================================================

/**
 * RendererプロセスへexposeするAPI
 */
const electronApi = {
  /**
   * ファイル操作API
   */
  file: {
    read: (path: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, { path }),

    write: (path: string, content: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_WRITE, { path, content }),
  },

  /**
   * 設定API
   */
  settings: {
    get: <T>(key: string): Promise<T | null> =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET, { key }),

    set: <T>(key: string, value: T): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, { key, value }),
  },

  /**
   * ウィンドウ操作API
   */
  window: {
    minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
  },

  /**
   * イベントリスナー登録（Main → Renderer通信用）
   */
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    // 許可されたチャネルのみリスナー登録可能
    const allowedChannels = ["app:notification:show", "app:update:available"];

    if (allowedChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },

  /**
   * イベントリスナー解除
   */
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
};

// ============================================================
// 3. contextBridgeでexposeMain
// ============================================================

contextBridge.exposeInMainWorld("electronApi", electronApi);

// ============================================================
// 4. 型定義（別ファイルへ分離推奨）
// ============================================================

export type ElectronApi = typeof electronApi;
