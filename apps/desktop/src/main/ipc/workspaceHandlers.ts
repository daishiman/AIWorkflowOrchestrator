/**
 * WorkspaceHandlers - ワークスペースIPC ハンドラー
 *
 * このファイルは、ワークスペースマネージャー機能のMainプロセスIPCハンドラーを提供します。
 * 設計書: docs/30-workflows/workspace-manager/task-step01-2-ipc-api.md (IPC-WS-001)
 *
 * @module workspaceHandlers
 */

import { dialog, BrowserWindow } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import Store from "electron-store";
import { IPC_CHANNELS } from "../../preload/channels";
import { createIpcHandler, IpcError } from "./utils";
import type {
  PersistedWorkspaceState,
  WorkspaceSaveRequest,
  WorkspaceRemoveFolderRequest,
  WorkspaceValidatePathsRequest,
} from "../../preload/types";

// ============================================
// Constants
// ============================================

const WORKSPACE_STORE_KEY = "workspace";

// Store instance for workspace persistence
const store = new Store<{ workspace: PersistedWorkspaceState }>();

// ============================================
// Validation Helpers
// ============================================

/**
 * パスの安全性を検証
 * @param pathStr 検証するパス
 * @returns 安全なパスかどうか
 */
function isPathSafe(pathStr: string): boolean {
  if (!pathStr || typeof pathStr !== "string") {
    return false;
  }

  // NULL文字のチェック
  if (pathStr.includes("\0")) {
    return false;
  }

  // 絶対パスであること
  if (!path.isAbsolute(pathStr)) {
    return false;
  }

  // パストラバーサルのチェック
  if (pathStr.includes("..")) {
    return false;
  }

  // 正規化後も念のためチェック
  const normalized = path.normalize(pathStr);
  if (normalized.includes("..")) {
    return false;
  }

  return true;
}

/**
 * PersistedWorkspaceStateの検証
 * @throws IpcError 検証エラー時
 */
function validatePersistedState(state: unknown): PersistedWorkspaceState {
  if (!state || typeof state !== "object") {
    throw new IpcError("PARSE_ERROR", "Invalid state format");
  }

  const s = state as PersistedWorkspaceState;

  if (s.version !== 1) {
    throw new IpcError("PARSE_ERROR", "Invalid version");
  }

  if (!Array.isArray(s.folders)) {
    throw new IpcError("PARSE_ERROR", "Folders must be an array");
  }

  // 各フォルダエントリーの検証
  for (const folder of s.folders) {
    if (!folder.id || typeof folder.id !== "string") {
      throw new IpcError("VALIDATION_ERROR", "Invalid folder id");
    }
    if (!folder.path || typeof folder.path !== "string") {
      throw new IpcError("VALIDATION_ERROR", "Invalid folder path");
    }
    if (folder.path.includes("\0")) {
      throw new IpcError(
        "VALIDATION_ERROR",
        "NULL character in path is not allowed",
      );
    }
    if (folder.path.includes("..")) {
      throw new IpcError("VALIDATION_ERROR", "Path traversal is not allowed");
    }
    if (!path.isAbsolute(folder.path)) {
      throw new IpcError("VALIDATION_ERROR", "Path must be absolute");
    }
  }

  return s;
}

// ============================================
// Handler Registration
// ============================================

/**
 * ワークスペースIPC ハンドラーを登録
 */
export function registerWorkspaceHandlers(): void {
  // workspace:load - ワークスペース状態を読み込む
  createIpcHandler<void, PersistedWorkspaceState | undefined>(
    IPC_CHANNELS.WORKSPACE_LOAD,
    async () => {
      const persisted = store.get(WORKSPACE_STORE_KEY);

      // 初回起動時（データなし）
      if (!persisted) {
        return undefined;
      }

      // 型検証（エラー時はIpcErrorがthrowされる）
      return validatePersistedState(persisted);
    },
    "Workspace load",
  );

  // workspace:save - ワークスペース状態を保存
  createIpcHandler<WorkspaceSaveRequest, void>(
    IPC_CHANNELS.WORKSPACE_SAVE,
    async (request) => {
      if (!request || !request.state) {
        throw new IpcError("VALIDATION_ERROR", "Request state is required");
      }

      // 検証（エラー時はIpcErrorがthrowされる）
      const validated = validatePersistedState(request.state);

      // 保存
      store.set(WORKSPACE_STORE_KEY, validated);
    },
    "Workspace save",
  );

  // workspace:add-folder - フォルダ選択ダイアログを表示
  createIpcHandler<
    void,
    { path: string; displayName: string; exists: boolean; isDirectory: boolean }
  >(
    IPC_CHANNELS.WORKSPACE_ADD_FOLDER,
    async () => {
      const window = BrowserWindow.getFocusedWindow();

      const result = await dialog.showOpenDialog(
        window ?? ({ parent: undefined } as unknown as BrowserWindow),
        {
          properties: ["openDirectory"],
          title: "フォルダを追加",
        },
      );

      // キャンセル
      if (result.canceled || result.filePaths.length === 0) {
        throw new IpcError("CANCELED", "User canceled");
      }

      const folderPath = result.filePaths[0];

      // パスの安全性検証
      if (!isPathSafe(folderPath)) {
        throw new IpcError("ACCESS_DENIED", "Invalid path");
      }

      // パスの存在・ディレクトリ確認
      try {
        const stats = await fs.stat(folderPath);
        if (!stats.isDirectory()) {
          throw new IpcError(
            "NOT_DIRECTORY",
            "Selected path is not a directory",
          );
        }
      } catch (err) {
        if (err instanceof IpcError) {
          throw err;
        }
        throw new IpcError("ACCESS_DENIED", "Cannot access the selected path");
      }

      // 表示名を取得（フォルダ名）
      const displayName = path.basename(folderPath);

      return {
        path: folderPath,
        displayName,
        exists: true,
        isDirectory: true,
      };
    },
    "Workspace add folder",
  );

  // workspace:remove-folder - フォルダを削除（参照のみ、実ファイルは削除しない）
  createIpcHandler<WorkspaceRemoveFolderRequest, void>(
    IPC_CHANNELS.WORKSPACE_REMOVE_FOLDER,
    async (request) => {
      if (
        !request ||
        !request.folderId ||
        typeof request.folderId !== "string"
      ) {
        throw new IpcError("VALIDATION_ERROR", "Folder ID is required");
      }

      // 現在のワークスペース状態を取得
      const persisted = store.get(WORKSPACE_STORE_KEY);
      if (!persisted) {
        throw new IpcError("NOT_FOUND", "Workspace not found");
      }

      // フォルダを探す
      const folderIndex = persisted.folders.findIndex(
        (f) => f.id === request.folderId,
      );
      if (folderIndex === -1) {
        throw new IpcError("NOT_FOUND", "Folder not found in workspace");
      }

      // フォルダを削除
      persisted.folders.splice(folderIndex, 1);
      persisted.updatedAt = new Date().toISOString();

      // 保存
      store.set(WORKSPACE_STORE_KEY, persisted);
    },
    "Workspace remove folder",
  );

  // workspace:validate-paths - パスの存在確認
  createIpcHandler<
    WorkspaceValidatePathsRequest,
    {
      validPaths: string[];
      invalidPaths: Array<{
        path: string;
        reason: "NOT_FOUND" | "NOT_DIRECTORY" | "ACCESS_DENIED";
      }>;
    }
  >(
    IPC_CHANNELS.WORKSPACE_VALIDATE_PATHS,
    async (request) => {
      if (!request || !Array.isArray(request.paths)) {
        throw new IpcError("VALIDATION_ERROR", "Paths array is required");
      }

      const validPaths: string[] = [];
      const invalidPaths: Array<{
        path: string;
        reason: "NOT_FOUND" | "NOT_DIRECTORY" | "ACCESS_DENIED";
      }> = [];

      for (const pathStr of request.paths) {
        // パスの安全性検証
        if (!isPathSafe(pathStr)) {
          invalidPaths.push({ path: pathStr, reason: "ACCESS_DENIED" });
          continue;
        }

        try {
          const stats = await fs.stat(pathStr);
          if (stats.isDirectory()) {
            validPaths.push(pathStr);
          } else {
            invalidPaths.push({ path: pathStr, reason: "NOT_DIRECTORY" });
          }
        } catch (err) {
          // エラーコードに基づいて分類
          const error = err as NodeJS.ErrnoException;
          if (error.code === "EACCES" || error.code === "EPERM") {
            invalidPaths.push({ path: pathStr, reason: "ACCESS_DENIED" });
          } else {
            invalidPaths.push({ path: pathStr, reason: "NOT_FOUND" });
          }
        }
      }

      return { validPaths, invalidPaths };
    },
    "Workspace validate paths",
  );
}
