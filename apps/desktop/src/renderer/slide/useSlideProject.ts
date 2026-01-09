/**
 * スライドプロジェクト用カスタムフック
 * @module renderer/slide/useSlideProject
 */

import { useCallback, useEffect } from "react";
import type { SkillPhase, SkillExecutionResult } from "@repo/shared";
import {
  useSlideProjectStore,
  selectIsExecuting,
  selectHasProject,
} from "./store";

/**
 * スライドプロジェクト管理フック
 * プロジェクトの開閉、スキル実行、同期管理を提供
 */
export const useSlideProject = () => {
  const store = useSlideProjectStore();
  const isExecuting = useSlideProjectStore(selectIsExecuting);
  const hasProject = useSlideProjectStore(selectHasProject);

  /**
   * プロジェクトを開く
   */
  const openProject = useCallback(
    async (path: string): Promise<void> => {
      try {
        store.setProject(path);
        store.setError(null);

        // ファイル監視を開始
        const watchResult = await window.slideApi.startWatching(path);
        if (!watchResult.success) {
          throw new Error(
            watchResult.error?.message ?? "Failed to start watching",
          );
        }
        store.setWatching(true);

        // 初期同期状態を取得
        const statusResult = await window.slideApi.getSyncStatus(path);
        if (statusResult.success && statusResult.data) {
          store.setSyncStatus(statusResult.data);
        }
      } catch (error) {
        store.setError(
          error instanceof Error ? error.message : "Failed to open project",
        );
      }
    },
    [store],
  );

  /**
   * プロジェクトを閉じる
   */
  const closeProject = useCallback(async (): Promise<void> => {
    try {
      await window.slideApi.stopWatching();
      store.reset();
    } catch (error) {
      console.error("Failed to close project:", error);
    }
  }, [store]);

  /**
   * スキルフェーズを実行
   */
  const executePhase = useCallback(
    async (phase: SkillPhase): Promise<SkillExecutionResult | null> => {
      if (!store.projectPath) {
        store.setError("No project is open");
        return null;
      }

      if (isExecuting) {
        store.setError("Another skill is already executing");
        return null;
      }

      try {
        store.setPhase(phase);
        store.setError(null);

        const result = await window.slideApi.executePhase(
          phase,
          store.projectPath,
        );

        store.setPhase("idle");

        if (result.success && result.data) {
          // 同期状態を更新
          const statusResult = await window.slideApi.getSyncStatus(
            store.projectPath,
          );
          if (statusResult.success && statusResult.data) {
            store.setSyncStatus(statusResult.data);
          }
          return result.data;
        } else {
          store.setError(result.error?.message ?? "Execution failed");
          return null;
        }
      } catch (error) {
        store.setPhase("idle");
        store.setError(
          error instanceof Error ? error.message : "Execution failed",
        );
        return null;
      }
    },
    [store, isExecuting],
  );

  /**
   * 手動同期を実行
   */
  const manualSync = useCallback(async (): Promise<void> => {
    if (!store.projectPath) return;

    try {
      store.setSyncStatus("syncing");
      const result = await window.slideApi.manualSync(store.projectPath);

      if (result.success) {
        store.setSyncStatus("synced");
      } else {
        store.setError(result.error?.message ?? "Sync failed");
        store.setSyncStatus("error");
      }
    } catch (error) {
      store.setError(error instanceof Error ? error.message : "Sync failed");
      store.setSyncStatus("error");
    }
  }, [store]);

  /**
   * 実行をキャンセル
   */
  const cancelExecution = useCallback(async (): Promise<void> => {
    try {
      await window.slideApi.cancelExecution();
      store.setPhase("idle");
    } catch (error) {
      console.error("Failed to cancel execution:", error);
    }
  }, [store]);

  // イベントリスナー設定
  useEffect(() => {
    // structure.md変更イベント
    const unsubscribeStructure = window.slideApi.onStructureChange(async () => {
      if (store.projectPath) {
        const result = await window.slideApi.getSyncStatus(store.projectPath);
        if (result.success && result.data) {
          store.setSyncStatus(result.data);
        }
      }
    });

    // 同期状態変更イベント
    const unsubscribeSyncStatus = window.slideApi.onSyncStatusChange(
      (status) => {
        store.setSyncStatus(status);
      },
    );

    // 進捗イベント
    const unsubscribeProgress = window.slideApi.onExecutionProgress(
      (progress) => {
        store.setProgress(progress);
      },
    );

    // クリーンアップ
    return () => {
      unsubscribeStructure();
      unsubscribeSyncStatus();
      unsubscribeProgress();
    };
  }, [store, store.projectPath]);

  return {
    // State
    project: store.projectPath ? { path: store.projectPath } : null,
    syncStatus: store.syncStatus,
    currentPhase: store.currentPhase,
    isWatching: store.isWatching,
    executionProgress: store.executionProgress,
    error: store.error,
    isExecuting,
    hasProject,

    // Actions
    openProject,
    closeProject,
    executePhase,
    manualSync,
    cancelExecution,
  };
};
