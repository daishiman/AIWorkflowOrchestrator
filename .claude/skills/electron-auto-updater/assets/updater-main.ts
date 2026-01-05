// Electron Auto-Updater メインプロセステンプレート
// electron-updaterを使用した自動更新の基本実装

import { autoUpdater } from "electron-updater";
import { app, BrowserWindow, ipcMain } from "electron";
import log from "electron-log";

// ログ設定
autoUpdater.logger = log;
log.transports.file.level = "info";

// 設定
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

/**
 * 自動更新機能のセットアップ
 */
export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  // 開発環境ではスキップ
  if (process.env.NODE_ENV === "development") {
    log.info("Development mode - skipping auto-updater setup");
    return;
  }

  // イベントハンドラー登録
  registerUpdateEvents(mainWindow);
  registerIPCHandlers();

  // 初回チェック（アプリ起動後30秒待機）
  setTimeout(() => {
    checkForUpdates();
  }, 30000);

  // 定期チェック（4時間ごと）
  setInterval(
    () => {
      checkForUpdates();
    },
    4 * 60 * 60 * 1000,
  );
}

/**
 * 更新チェック実行
 */
async function checkForUpdates(): Promise<void> {
  try {
    log.info("Checking for updates...");
    await autoUpdater.checkForUpdates();
  } catch (error) {
    log.error("Error checking for updates:", error);
  }
}

/**
 * 更新イベントをRendererに通知
 */
function registerUpdateEvents(mainWindow: BrowserWindow): void {
  const sendStatus = (channel: string, data?: unknown): void => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data);
    }
  };

  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for update...");
    sendStatus("update:checking");
  });

  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info.version);
    sendStatus("update:available", {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info("Update not available:", info.version);
    sendStatus("update:not-available", info);
  });

  autoUpdater.on("error", (err) => {
    log.error("Update error:", err);
    sendStatus("update:error", {
      message: err.message,
      stack: err.stack,
    });
  });

  autoUpdater.on("download-progress", (progressObj) => {
    log.info(`Download progress: ${progressObj.percent.toFixed(2)}%`);
    sendStatus("update:progress", {
      percent: progressObj.percent,
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded:", info.version);
    sendStatus("update:downloaded", {
      version: info.version,
      releaseNotes: info.releaseNotes,
    });
  });
}

/**
 * IPCハンドラー登録
 */
function registerIPCHandlers(): void {
  ipcMain.handle("updater:check", async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, data: result?.updateInfo };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  ipcMain.handle("updater:download", async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  ipcMain.handle("updater:install", () => {
    log.info("Installing update and restarting...");
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle("updater:get-version", () => {
    return app.getVersion();
  });
}
