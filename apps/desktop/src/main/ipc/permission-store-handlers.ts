/**
 * Permission Store Handlers - 権限設定用IPCハンドラー
 *
 * TASK-3-1-E: rememberChoice機能永続化
 *
 * 設定画面用の権限管理IPCハンドラーを提供する。
 * PermissionStoreを使用した永続化権限の管理機能。
 */

import { ipcMain } from "electron";
import type {
  IPermissionStore,
  AllowedToolEntry,
  ClearSessionResponse,
} from "@repo/shared";
import { IPC_CHANNELS } from "../../preload/channels";

/**
 * permission:getAllowedTools のレスポンス型
 */
export interface GetAllowedToolsResponse {
  tools: AllowedToolEntry[];
}

/**
 * permission:revokeTool のレスポンス型
 */
export interface RevokeToolResponse {
  success: boolean;
}

/**
 * permission:clearAll のレスポンス型
 */
export interface ClearAllResponse {
  success: boolean;
  clearedCount: number;
}

/**
 * 権限管理IPCハンドラーを登録する
 *
 * @param permissionStore - PermissionStoreインスタンス
 */
export function registerPermissionStoreHandlers(
  permissionStore: IPermissionStore,
): void {
  /**
   * permission:getAllowedTools - 許可済みツール一覧を取得
   */
  ipcMain.handle(
    IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS,
    async (): Promise<GetAllowedToolsResponse> => {
      try {
        const tools = permissionStore.getAllowedToolEntries();
        return { tools };
      } catch (error) {
        console.error(
          "[PermissionHandlers] Failed to get allowed tools:",
          error,
        );
        return { tools: [] };
      }
    },
  );

  /**
   * permission:revokeTool - ツールの許可を取り消し
   */
  ipcMain.handle(
    IPC_CHANNELS.PERMISSION_REVOKE_TOOL,
    async (
      _event,
      args: { toolName?: string },
    ): Promise<RevokeToolResponse> => {
      try {
        const toolName = String(args?.toolName ?? "");
        permissionStore.revokeTool(toolName);
        return { success: true };
      } catch (error) {
        console.error("[PermissionHandlers] Failed to revoke tool:", error);
        return { success: false };
      }
    },
  );

  /**
   * permission:clearAll - 全ての許可設定をクリア
   */
  ipcMain.handle(
    IPC_CHANNELS.PERMISSION_CLEAR_ALL,
    async (): Promise<ClearAllResponse> => {
      try {
        const clearedCount = permissionStore.getAllowedTools().length;
        permissionStore.clearAll();
        return { success: true, clearedCount };
      } catch (error) {
        console.error(
          "[PermissionHandlers] Failed to clear all permissions:",
          error,
        );
        return { success: false, clearedCount: 0 };
      }
    },
  );

  /**
   * permission:clear-session - セッションエントリのクリア (UT-06-002)
   *
   * P42準拠 3段バリデーション適用
   */
  ipcMain.handle(
    IPC_CHANNELS.PERMISSION_CLEAR_SESSION,
    async (
      _event,
      args: { sessionId?: string },
    ): Promise<ClearSessionResponse> => {
      try {
        // P42準拠 3段バリデーション
        const sessionId = args?.sessionId;
        if (typeof sessionId !== "string" || sessionId.trim() === "") {
          return {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "sessionId must be a non-empty string",
            },
          };
        }

        const removedCount = permissionStore.revokeSessionEntries
          ? permissionStore.revokeSessionEntries(sessionId.trim())
          : 0;
        return { success: true, removedCount };
      } catch (error) {
        console.error("[PermissionHandlers] Failed to clear session:", error);
        return {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to clear session entries",
          },
        };
      }
    },
  );

  console.info("[PermissionHandlers] Registered 4 permission IPC handlers");
}

/**
 * 権限管理IPCハンドラーを解除する
 */
export function unregisterPermissionStoreHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.PERMISSION_GET_ALLOWED_TOOLS);
  ipcMain.removeHandler(IPC_CHANNELS.PERMISSION_REVOKE_TOOL);
  ipcMain.removeHandler(IPC_CHANNELS.PERMISSION_CLEAR_ALL);
  ipcMain.removeHandler(IPC_CHANNELS.PERMISSION_CLEAR_SESSION);

  console.info("[PermissionHandlers] Unregistered permission IPC handlers");
}
