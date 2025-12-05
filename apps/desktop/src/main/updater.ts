/**
 * Electron Auto-Updater Module
 *
 * GitHub Releasesを使用した自動更新機能を提供
 * electron-updaterを使用してクロスプラットフォーム対応
 */

import { autoUpdater, UpdateInfo } from "electron-updater";
import { BrowserWindow, ipcMain } from "electron";
import log from "electron-log";

// ログ設定
autoUpdater.logger = log;
log.transports.file.level = "info";

// 自動ダウンロードを無効化（ユーザー確認のため）
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// 更新状態
let mainWindow: BrowserWindow | null = null;

/**
 * 自動更新機能を初期化
 */
export function initAutoUpdater(window: BrowserWindow): void {
  mainWindow = window;

  // 更新確認中
  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for update...");
    sendStatusToWindow("checking-for-update");
  });

  // 更新あり
  autoUpdater.on("update-available", (info: UpdateInfo) => {
    log.info("Update available:", info.version);
    sendStatusToWindow("update-available", {
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseDate: info.releaseDate,
    });
  });

  // 更新なし
  autoUpdater.on("update-not-available", (info: UpdateInfo) => {
    log.info("Update not available. Current version is up to date.");
    sendStatusToWindow("update-not-available", {
      version: info.version,
    });
  });

  // ダウンロード進捗
  autoUpdater.on("download-progress", (progress) => {
    const message = `Download speed: ${formatBytes(progress.bytesPerSecond)}/s - ${Math.round(progress.percent)}%`;
    log.info(message);
    sendStatusToWindow("download-progress", {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  // ダウンロード完了
  autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
    log.info("Update downloaded:", info.version);
    sendStatusToWindow("update-downloaded", {
      version: info.version,
      releaseNotes: info.releaseNotes,
    });
  });

  // エラー
  autoUpdater.on("error", (err) => {
    log.error("Update error:", err);
    sendStatusToWindow("update-error", {
      message: err.message,
    });
  });

  // IPC handlers
  setupIpcHandlers();
}

/**
 * IPCハンドラーを設定
 */
function setupIpcHandlers(): void {
  // 更新確認をリクエスト
  ipcMain.handle("updater:check", async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, updateInfo: result?.updateInfo };
    } catch (error) {
      log.error("Check for updates failed:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  // 更新をダウンロード
  ipcMain.handle("updater:download", async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      log.error("Download update failed:", error);
      return { success: false, error: (error as Error).message };
    }
  });

  // 更新をインストールして再起動
  ipcMain.handle("updater:install", () => {
    autoUpdater.quitAndInstall(false, true);
  });

  // 現在のバージョンを取得
  ipcMain.handle("updater:get-version", () => {
    return autoUpdater.currentVersion.version;
  });
}

/**
 * レンダラープロセスにステータスを送信
 */
function sendStatusToWindow(
  status: string,
  data?: Record<string, unknown>,
): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updater:status", { status, ...data });
  }
}

/**
 * バイト数をフォーマット
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 手動で更新を確認
 */
export async function checkForUpdates(): Promise<void> {
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    log.error("Manual check for updates failed:", error);
  }
}

/**
 * 更新をダウンロード
 */
export async function downloadUpdate(): Promise<void> {
  try {
    await autoUpdater.downloadUpdate();
  } catch (error) {
    log.error("Download update failed:", error);
  }
}

/**
 * 更新をインストールして再起動
 */
export function installUpdate(): void {
  autoUpdater.quitAndInstall(false, true);
}
