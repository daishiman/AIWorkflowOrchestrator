/**
 * ダイアログ IPC ハンドラー
 *
 * Main Process でダイアログ関連のIPC通信を処理する
 */

import { ipcMain, BrowserWindow, dialog } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";

interface ShowOpenDialogOptions {
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<
    | "openFile"
    | "openDirectory"
    | "multiSelections"
    | "showHiddenFiles"
    | "createDirectory"
    | "promptToCreate"
    | "noResolveAliases"
    | "treatPackageAsDirectory"
  >;
}

interface ShowSaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

/**
 * ダイアログ関連IPCハンドラーを登録
 */
export function registerDialogHandlers(mainWindow: BrowserWindow): void {
  // dialog:showOpenDialog - ファイル選択ダイアログ
  ipcMain.handle(
    IPC_CHANNELS.DIALOG_SHOW_OPEN,
    async (_event, options: ShowOpenDialogOptions) => {
      try {
        const result = await dialog.showOpenDialog(mainWindow, {
          title: options.title,
          filters: options.filters,
          properties: options.properties,
        });

        return {
          canceled: result.canceled,
          filePaths: result.filePaths,
        };
      } catch (error) {
        console.error("[DialogHandlers] showOpenDialog エラー:", error);
        return {
          canceled: true,
          filePaths: [],
        };
      }
    },
  );

  // dialog:showSaveDialog - ファイル保存ダイアログ
  ipcMain.handle(
    IPC_CHANNELS.DIALOG_SHOW_SAVE,
    async (_event, options: ShowSaveDialogOptions) => {
      try {
        const result = await dialog.showSaveDialog(mainWindow, {
          title: options.title,
          defaultPath: options.defaultPath,
          filters: options.filters,
        });

        return {
          canceled: result.canceled,
          filePath: result.filePath,
        };
      } catch (error) {
        console.error("[DialogHandlers] showSaveDialog エラー:", error);
        return {
          canceled: true,
          filePath: undefined,
        };
      }
    },
  );
}
