// Electron Auto-Updater Preloadテンプレート
// Rendererに安全な更新APIを公開

import { contextBridge, ipcRenderer } from "electron";

/**
 * 更新API型定義
 */
export interface UpdaterAPI {
  checkForUpdates: () => Promise<UpdateResult>;
  downloadUpdate: () => Promise<UpdateResult>;
  installUpdate: () => void;
  getVersion: () => Promise<string>;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
  onDownloadProgress: (
    callback: (progress: ProgressInfo) => void,
  ) => () => void;
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void;
  onUpdateError: (callback: (error: ErrorInfo) => void) => () => void;
  onCheckingForUpdate: (callback: () => void) => () => void;
}

interface UpdateResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string | null;
}

interface ProgressInfo {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

interface ErrorInfo {
  message: string;
  stack?: string;
}

/**
 * 更新APIの実装
 */
const updaterAPI: UpdaterAPI = {
  checkForUpdates: () => ipcRenderer.invoke("updater:check"),
  downloadUpdate: () => ipcRenderer.invoke("updater:download"),
  installUpdate: () => ipcRenderer.invoke("updater:install"),
  getVersion: () => ipcRenderer.invoke("updater:get-version"),

  onUpdateAvailable: (callback) => {
    const handler = (_: unknown, info: UpdateInfo) => callback(info);
    ipcRenderer.on("update:available", handler);
    return () => ipcRenderer.removeListener("update:available", handler);
  },

  onDownloadProgress: (callback) => {
    const handler = (_: unknown, progress: ProgressInfo) => callback(progress);
    ipcRenderer.on("update:progress", handler);
    return () => ipcRenderer.removeListener("update:progress", handler);
  },

  onUpdateDownloaded: (callback) => {
    const handler = (_: unknown, info: UpdateInfo) => callback(info);
    ipcRenderer.on("update:downloaded", handler);
    return () => ipcRenderer.removeListener("update:downloaded", handler);
  },

  onUpdateError: (callback) => {
    const handler = (_: unknown, error: ErrorInfo) => callback(error);
    ipcRenderer.on("update:error", handler);
    return () => ipcRenderer.removeListener("update:error", handler);
  },

  onCheckingForUpdate: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("update:checking", handler);
    return () => ipcRenderer.removeListener("update:checking", handler);
  },
};

// Rendererにupdater APIを公開
contextBridge.exposeInMainWorld("updater", updaterAPI);

// 型定義をwindowに追加
declare global {
  interface Window {
    updater: UpdaterAPI;
  }
}
