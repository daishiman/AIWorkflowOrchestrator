/**
 * Permission IPC Handlers - 権限確認関連の IPC ハンドラ
 *
 * TASK-4-2: PermissionResolver IPC Handlers
 *
 * @module @repo/desktop/main/ipc/permission-handlers
 */

import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from "electron";
import type { PermissionResolver } from "../services/skill/PermissionResolver";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";
import { IPC_CHANNELS } from "../../preload/channels";

/**
 * 権限確認関連の IPC ハンドラを登録
 *
 * @param mainWindow - メインウィンドウ
 * @param permissionResolver - PermissionResolver インスタンス
 */
export function registerPermissionHandlers(
  mainWindow: BrowserWindow,
  permissionResolver: PermissionResolver,
): void {
  // Renderer 側からのレスポンスを受信
  ipcMain.handle(
    IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
    async (
      event: IpcMainInvokeEvent,
      response: SkillPermissionResponse,
    ): Promise<{ success: boolean }> => {
      // sender の検証
      if (event.sender !== mainWindow.webContents) {
        console.warn(
          "[Permission] IPC request from unknown sender, ignoring...",
        );
        return { success: false };
      }

      // PermissionResolver に応答を転送
      permissionResolver.resolveRequest(response);
      return { success: true };
    },
  );
}

/**
 * 権限確認リクエストを Renderer に転送する関数を作成
 *
 * @param mainWindow - メインウィンドウ
 * @returns 権限リクエスト転送関数
 */
export function createPermissionRequestForwarder(
  mainWindow: BrowserWindow,
): (request: SkillPermissionRequest) => void {
  return (request: SkillPermissionRequest): void => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        request,
      );
    }
  };
}

/**
 * 権限確認 IPC ハンドラの登録解除
 */
export function unregisterPermissionHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_PERMISSION_RESPONSE);
}
