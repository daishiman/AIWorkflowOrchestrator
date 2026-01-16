/**
 * Slide Settings IPC Handlers
 *
 * スライド設定のIPC通信ハンドラー。
 * セキュリティ対策としてsender検証、ホワイトリストチャンネルを実装。
 *
 * @module @repo/desktop/main/ipc/slideSettingsHandlers
 */

import { ipcMain, dialog, BrowserWindow } from "electron";
import type { IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import {
  SlideSettingsStore,
  getSlideSettingsStore,
  expandHomePath,
  validateDirectoryForSettings,
} from "../settings/slideSettingsStore";
import {
  validateIpcSender,
  toIPCValidationError,
  type IPCValidationOptions,
} from "../infrastructure/security/ipc-validator";
import type {
  SlideSettingsGetResponse,
  SlideSettingsGetDirectoryResponse,
  SlideSettingsSetDirectoryResponse,
  SlideSettingsSelectDirectoryResponse,
  SlideSettingsValidateDirectoryResponse,
} from "@repo/shared/types";
import * as fs from "fs";

// ============================================================
// レスポンスヘルパー
// ============================================================

/**
 * 成功レスポンスを生成
 */
function success<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

/**
 * エラーレスポンスを生成
 */
function error(message: string): { success: false; error: string } {
  return { success: false, error: message };
}

/**
 * エラーをメッセージに変換
 */
function normalizeError(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return String(err) || "Unknown error";
}

// ============================================================
// IPC ハンドラー実装
// ============================================================

/**
 * スライド設定IPCハンドラーを登録
 *
 * @param mainWindow - メインBrowserWindow
 * @param store - SlideSettingsStoreインスタンス（オプション）
 */
export function registerSlideSettingsHandlers(
  mainWindow: BrowserWindow,
  store?: SlideSettingsStore,
): void {
  const settingsStore = store || getSlideSettingsStore();

  const validationOptions: IPCValidationOptions = {
    getAllowedWindows: () => [mainWindow],
  };

  // slideSettings:getDirectory
  ipcMain.handle(
    IPC_CHANNELS.SLIDE_SETTINGS_GET_DIRECTORY,
    async (
      event: IpcMainInvokeEvent,
    ): Promise<SlideSettingsGetDirectoryResponse> => {
      // sender検証
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SLIDE_SETTINGS_GET_DIRECTORY,
        validationOptions,
      );

      if (!validation.valid) {
        const validationErr = toIPCValidationError(validation);
        return { success: false, error: validationErr.error.message };
      }

      try {
        const directory = settingsStore.getDirectory();
        return success(directory);
      } catch (err) {
        return error(normalizeError(err));
      }
    },
  );

  // slideSettings:setDirectory
  ipcMain.handle(
    IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
    async (
      event: IpcMainInvokeEvent,
      dirPath: string,
    ): Promise<SlideSettingsSetDirectoryResponse> => {
      // sender検証
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
        validationOptions,
      );

      if (!validation.valid) {
        const validationErr = toIPCValidationError(validation);
        return { success: false, error: validationErr.error.message };
      }

      try {
        // バリデーション
        const validationResult = settingsStore.validateDirectory(dirPath);

        if (!validationResult.valid) {
          return error(validationResult.error || "Invalid directory path");
        }

        // 設定を保存
        settingsStore.setDirectory(dirPath);

        // 自動作成が有効でディレクトリが存在しない場合は作成
        if (!validationResult.exists) {
          const autoCreate = settingsStore.getAutoCreateDirectory();
          if (autoCreate) {
            const expandedPath = expandHomePath(dirPath);
            fs.mkdirSync(expandedPath, { recursive: true });
          }
        }

        return { success: true };
      } catch (err) {
        return error(normalizeError(err));
      }
    },
  );

  // slideSettings:selectDirectory
  ipcMain.handle(
    IPC_CHANNELS.SLIDE_SETTINGS_SELECT_DIRECTORY,
    async (
      event: IpcMainInvokeEvent,
    ): Promise<SlideSettingsSelectDirectoryResponse> => {
      // sender検証
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SLIDE_SETTINGS_SELECT_DIRECTORY,
        validationOptions,
      );

      if (!validation.valid) {
        const validationErr = toIPCValidationError(validation);
        return { success: false, error: validationErr.error.message };
      }

      try {
        const result = await dialog.showOpenDialog(mainWindow, {
          properties: ["openDirectory", "createDirectory"],
          title: "スライド出力先を選択",
          buttonLabel: "選択",
        });

        if (result.canceled || result.filePaths.length === 0) {
          return success(null);
        }

        return success(result.filePaths[0]);
      } catch (err) {
        return error(normalizeError(err));
      }
    },
  );

  // slideSettings:validateDirectory
  ipcMain.handle(
    IPC_CHANNELS.SLIDE_SETTINGS_VALIDATE_DIRECTORY,
    async (
      event: IpcMainInvokeEvent,
      dirPath: string,
    ): Promise<SlideSettingsValidateDirectoryResponse> => {
      // sender検証
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SLIDE_SETTINGS_VALIDATE_DIRECTORY,
        validationOptions,
      );

      if (!validation.valid) {
        const validationErr = toIPCValidationError(validation);
        return { success: false, error: validationErr.error.message };
      }

      try {
        // Use validateDirectoryForSettings which returns ValidationResult
        const result = await validateDirectoryForSettings(dirPath);
        return success(result);
      } catch (err) {
        return error(normalizeError(err));
      }
    },
  );

  // slideSettings:getAllSettings
  ipcMain.handle(
    IPC_CHANNELS.SLIDE_SETTINGS_GET_ALL,
    async (event: IpcMainInvokeEvent): Promise<SlideSettingsGetResponse> => {
      // sender検証
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SLIDE_SETTINGS_GET_ALL,
        validationOptions,
      );

      if (!validation.valid) {
        const validationErr = toIPCValidationError(validation);
        return { success: false, error: validationErr.error.message };
      }

      try {
        const settings = settingsStore.getSettings();
        return success(settings);
      } catch (err) {
        return error(normalizeError(err));
      }
    },
  );
}

/**
 * スライド設定IPCハンドラーの登録を解除
 */
export function unregisterSlideSettingsHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SLIDE_SETTINGS_GET_DIRECTORY);
  ipcMain.removeHandler(IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY);
  ipcMain.removeHandler(IPC_CHANNELS.SLIDE_SETTINGS_SELECT_DIRECTORY);
  ipcMain.removeHandler(IPC_CHANNELS.SLIDE_SETTINGS_VALIDATE_DIRECTORY);
  ipcMain.removeHandler(IPC_CHANNELS.SLIDE_SETTINGS_GET_ALL);
}
