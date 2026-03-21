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
  const projectPath = useSlideProjectStore((state) => state.projectPath);
  const syncStatus = useSlideProjectStore((state) => state.syncStatus);
  const currentPhase = useSlideProjectStore((state) => state.currentPhase);
  const lastSyncAt = useSlideProjectStore((state) => state.lastSyncAt);
  const isWatching = useSlideProjectStore((state) => state.isWatching);
  const executionProgress = useSlideProjectStore(
    (state) => state.executionProgress,
  );
  const error = useSlideProjectStore((state) => state.error);
  const setProject = useSlideProjectStore((state) => state.setProject);
  const setError = useSlideProjectStore((state) => state.setError);
  const setWatching = useSlideProjectStore((state) => state.setWatching);
  const setSyncStatus = useSlideProjectStore((state) => state.setSyncStatus);
  const setPhase = useSlideProjectStore((state) => state.setPhase);
  const setProgress = useSlideProjectStore((state) => state.setProgress);
  const reset = useSlideProjectStore((state) => state.reset);
  const isExecuting = useSlideProjectStore(selectIsExecuting);
  const hasProject = useSlideProjectStore(selectHasProject);

  /**
   * プロジェクトを開く
   */
  const openProject = useCallback(
    async (path: string): Promise<void> => {
      try {
        setProject(path);
        setError(null);

        // ファイル監視を開始
        const watchResult = await window.slideApi.startWatching(path);
        if (!watchResult.success) {
          throw new Error(
            watchResult.error?.message ?? "Failed to start watching",
          );
        }
        setWatching(true);

        // 初期同期状態を取得
        const statusResult = await window.slideApi.getSyncStatus(path);
        if (statusResult.success && statusResult.data) {
          setSyncStatus(statusResult.data);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to open project",
        );
      }
    },
    [setError, setProject, setSyncStatus, setWatching],
  );

  /**
   * プロジェクトを閉じる
   */
  const closeProject = useCallback(async (): Promise<void> => {
    try {
      await window.slideApi.stopWatching();
      reset();
    } catch (error) {
      console.error("Failed to close project:", error);
    }
  }, [reset]);

  /**
   * スキルフェーズを実行
   */
  const executePhase = useCallback(
    async (phase: SkillPhase): Promise<SkillExecutionResult | null> => {
      if (!projectPath) {
        setError("No project is open");
        return null;
      }

      if (isExecuting) {
        setError("Another skill is already executing");
        return null;
      }

      try {
        setPhase(phase);
        setError(null);

        const result = await window.slideApi.executePhase(phase, projectPath);

        setPhase("idle");

        if (result.success && result.data) {
          // 同期状態を更新
          const statusResult = await window.slideApi.getSyncStatus(projectPath);
          if (statusResult.success && statusResult.data) {
            setSyncStatus(statusResult.data);
          }
          return result.data;
        } else {
          setError(result.error?.message ?? "Execution failed");
          return null;
        }
      } catch (error) {
        setPhase("idle");
        setError(error instanceof Error ? error.message : "Execution failed");
        return null;
      }
    },
    [isExecuting, projectPath, setError, setPhase, setSyncStatus],
  );

  /**
   * 手動同期を実行
   */
  const manualSync = useCallback(async (): Promise<void> => {
    if (!projectPath) return;

    try {
      setSyncStatus("syncing");
      const result = await window.slideApi.manualSync(projectPath);

      if (result.success) {
        setSyncStatus("synced");
      } else {
        setError(result.error?.message ?? "Sync failed");
        setSyncStatus("error");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sync failed");
      setSyncStatus("error");
    }
  }, [projectPath, setError, setSyncStatus]);

  /**
   * 実行をキャンセル
   */
  const cancelExecution = useCallback(async (): Promise<void> => {
    try {
      await window.slideApi.cancelExecution();
      setPhase("idle");
    } catch (error) {
      console.error("Failed to cancel execution:", error);
    }
  }, [setPhase]);

  // イベントリスナー設定
  useEffect(() => {
    // structure.md変更イベント
    const unsubscribeStructure = window.slideApi.onStructureChange(async () => {
      if (projectPath) {
        const result = await window.slideApi.getSyncStatus(projectPath);
        if (result.success && result.data) {
          setSyncStatus(result.data);
        }
      }
    });

    // 同期状態変更イベント
    const unsubscribeSyncStatus = window.slideApi.onSyncStatusChange(
      (status) => {
        setSyncStatus(status);
      },
    );

    // 進捗イベント
    const unsubscribeProgress = window.slideApi.onExecutionProgress(
      (progress) => {
        setProgress(progress);
      },
    );

    // クリーンアップ
    return () => {
      unsubscribeStructure();
      unsubscribeSyncStatus();
      unsubscribeProgress();
    };
  }, [projectPath, setProgress, setSyncStatus]);

  return {
    // State
    project: projectPath ? { path: projectPath } : null,
    syncStatus,
    currentPhase,
    lastSyncedAt: lastSyncAt,
    isWatching,
    executionProgress,
    error,
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
