/**
 * IPC ハンドラー
 * Main/Renderer間のIPC通信を管理する
 * @module main/slide/ipc-handlers
 */

import { ipcMain, BrowserWindow } from "electron";
import type {
  SkillPhase,
  SkillExecutionResult,
  SlideResponse,
} from "@repo/shared";
import { createSlideWatcher, SlideWatcher } from "./file-watcher";
import { createSkillExecutor, SkillExecutor } from "./skill-executor";
import { createSyncManager, SyncManager } from "./sync-manager";

/** IPCチャネル定義 */
export const SLIDE_IPC_CHANNELS = {
  // invoke channels
  EXECUTE_PHASE: "slide:executePhase",
  START_WATCHING: "slide:startWatching",
  STOP_WATCHING: "slide:stopWatching",
  GET_SYNC_STATUS: "slide:getSyncStatus",
  MANUAL_SYNC: "slide:manualSync",
  CANCEL_EXECUTION: "slide:cancelExecution",
  // event channels
  STRUCTURE_CHANGED: "slide:structureChanged",
  SYNC_STATUS_CHANGED: "slide:syncStatusChanged",
  EXECUTION_PROGRESS: "slide:executionProgress",
} as const;

/** 現在のウォッチャー */
let watcher: SlideWatcher | null = null;
/** スキル実行器 */
let executor: SkillExecutor | null = null;
/** 同期マネージャー */
let syncManager: SyncManager | null = null;

/**
 * スライドIPCハンドラーを登録する
 * @param mainWindow メインウィンドウ
 */
export const registerSlideIpcHandlers = (mainWindow: BrowserWindow): void => {
  // スキル実行
  ipcMain.handle(
    SLIDE_IPC_CHANNELS.EXECUTE_PHASE,
    async (
      _,
      phase: SkillPhase,
      projectPath: string,
    ): Promise<SlideResponse<SkillExecutionResult>> => {
      try {
        if (!executor) {
          executor = createSkillExecutor();
          // 進捗イベントを転送
          executor.onProgress((progress) => {
            mainWindow.webContents.send(
              SLIDE_IPC_CHANNELS.EXECUTION_PROGRESS,
              progress,
            );
          });
        }

        // スキル起因の変更としてマーク（無限ループ防止）
        if (watcher) {
          const structurePath = `${projectPath}/structure.md`;
          watcher.markAsSkillChange(structurePath, phase);
        }

        const result = await executor.execute(phase, projectPath);

        // 同期状態を更新して通知
        if (result.success && syncManager) {
          const status = await syncManager.getStatus(projectPath);
          mainWindow.webContents.send(
            SLIDE_IPC_CHANNELS.SYNC_STATUS_CHANGED,
            status,
          );
        }

        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "SLIDE_E006",
            message:
              error instanceof Error ? error.message : "Skill execution failed",
          },
        };
      }
    },
  );

  // ウォッチャー起動
  ipcMain.handle(
    SLIDE_IPC_CHANNELS.START_WATCHING,
    async (_, projectPath: string): Promise<SlideResponse> => {
      try {
        // 既存のウォッチャーを停止
        if (watcher) {
          watcher.stop();
        }

        // 新しいウォッチャーを作成
        watcher = createSlideWatcher(projectPath);
        watcher.onStructureChange(async (path) => {
          // Rendererに通知
          mainWindow.webContents.send(
            SLIDE_IPC_CHANNELS.STRUCTURE_CHANGED,
            path,
          );

          // 同期状態を更新して通知
          if (syncManager) {
            const status = await syncManager.getStatus(projectPath);
            mainWindow.webContents.send(
              SLIDE_IPC_CHANNELS.SYNC_STATUS_CHANGED,
              status,
            );
          }
        });
        watcher.start();

        // 同期マネージャーを初期化
        if (!syncManager) {
          syncManager = createSyncManager();
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "SLIDE_E001",
            message:
              error instanceof Error
                ? error.message
                : "Failed to start watching",
          },
        };
      }
    },
  );

  // ウォッチャー停止
  ipcMain.handle(
    SLIDE_IPC_CHANNELS.STOP_WATCHING,
    async (): Promise<SlideResponse> => {
      try {
        if (watcher) {
          watcher.stop();
          watcher = null;
        }
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "SLIDE_E001",
            message:
              error instanceof Error
                ? error.message
                : "Failed to stop watching",
          },
        };
      }
    },
  );

  // 同期状態取得
  ipcMain.handle(
    SLIDE_IPC_CHANNELS.GET_SYNC_STATUS,
    async (_, projectPath: string): Promise<SlideResponse<string>> => {
      try {
        if (!syncManager) {
          syncManager = createSyncManager();
        }
        const status = await syncManager.getStatus(projectPath);
        return { success: true, data: status };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "SLIDE_E007",
            message:
              error instanceof Error
                ? error.message
                : "Failed to get sync status",
          },
        };
      }
    },
  );

  // 手動同期
  ipcMain.handle(
    SLIDE_IPC_CHANNELS.MANUAL_SYNC,
    async (_, projectPath: string): Promise<SlideResponse> => {
      try {
        if (!syncManager) {
          syncManager = createSyncManager();
        }

        // 同期中状態を通知
        mainWindow.webContents.send(
          SLIDE_IPC_CHANNELS.SYNC_STATUS_CHANGED,
          "syncing",
        );

        await syncManager.sync(projectPath);

        // 同期完了状態を通知
        mainWindow.webContents.send(
          SLIDE_IPC_CHANNELS.SYNC_STATUS_CHANGED,
          "synced",
        );

        return { success: true };
      } catch (error) {
        // エラー状態を通知
        mainWindow.webContents.send(
          SLIDE_IPC_CHANNELS.SYNC_STATUS_CHANGED,
          "error",
        );

        return {
          success: false,
          error: {
            code: "SLIDE_E007",
            message:
              error instanceof Error ? error.message : "Manual sync failed",
          },
        };
      }
    },
  );

  // 実行キャンセル
  ipcMain.handle(
    SLIDE_IPC_CHANNELS.CANCEL_EXECUTION,
    async (): Promise<SlideResponse> => {
      try {
        if (executor) {
          executor.cancel();
        }
        if (syncManager) {
          syncManager.cancel();
        }
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "SLIDE_E008",
            message:
              error instanceof Error
                ? error.message
                : "Failed to cancel execution",
          },
        };
      }
    },
  );
};

/**
 * スライドIPCハンドラーの登録を解除する
 */
export const unregisterSlideIpcHandlers = (): void => {
  ipcMain.removeHandler(SLIDE_IPC_CHANNELS.EXECUTE_PHASE);
  ipcMain.removeHandler(SLIDE_IPC_CHANNELS.START_WATCHING);
  ipcMain.removeHandler(SLIDE_IPC_CHANNELS.STOP_WATCHING);
  ipcMain.removeHandler(SLIDE_IPC_CHANNELS.GET_SYNC_STATUS);
  ipcMain.removeHandler(SLIDE_IPC_CHANNELS.MANUAL_SYNC);
  ipcMain.removeHandler(SLIDE_IPC_CHANNELS.CANCEL_EXECUTION);

  // クリーンアップ
  if (watcher) {
    watcher.stop();
    watcher = null;
  }
  executor = null;
  syncManager = null;
};
