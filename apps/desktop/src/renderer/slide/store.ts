/**
 * スライドプロジェクト状態管理
 * @module renderer/slide/store
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { SyncStatus, SkillPhase } from "@repo/shared";

/**
 * スライドプロジェクトの状態
 */
interface SlideProjectState {
  /** プロジェクトパス */
  projectPath: string | null;
  /** 同期状態 */
  syncStatus: SyncStatus;
  /** 現在のフェーズ */
  currentPhase: SkillPhase | "idle";
  /** 最終同期日時 */
  lastSyncAt: Date | null;
  /** ファイル監視中かどうか */
  isWatching: boolean;
  /** 実行進捗（0-100） */
  executionProgress: number;
  /** エラーメッセージ */
  error: string | null;

  // Actions
  /** プロジェクトパスを設定 */
  setProject: (path: string | null) => void;
  /** 同期状態を設定 */
  setSyncStatus: (status: SyncStatus) => void;
  /** 現在のフェーズを設定 */
  setPhase: (phase: SkillPhase | "idle") => void;
  /** 監視状態を設定 */
  setWatching: (watching: boolean) => void;
  /** 進捗を設定 */
  setProgress: (progress: number) => void;
  /** エラーを設定 */
  setError: (error: string | null) => void;
  /** 状態をリセット */
  reset: () => void;
}

/** 初期状態 */
const initialState = {
  projectPath: null,
  syncStatus: "synced" as SyncStatus,
  currentPhase: "idle" as const,
  lastSyncAt: null,
  isWatching: false,
  executionProgress: 0,
  error: null,
};

/**
 * スライドプロジェクトストア
 * subscribeWithSelectorを使用して特定の状態変更のみを購読可能
 */
export const useSlideProjectStore = create<SlideProjectState>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    setProject: (path) =>
      set({
        projectPath: path,
        error: null,
      }),

    setSyncStatus: (status) =>
      set((state) => ({
        syncStatus: status,
        lastSyncAt: status === "synced" ? new Date() : state.lastSyncAt,
        error: status === "error" ? state.error : null,
      })),

    setPhase: (phase) =>
      set({
        currentPhase: phase,
        executionProgress: phase === "idle" ? 0 : undefined,
      }),

    setWatching: (watching) =>
      set({
        isWatching: watching,
      }),

    setProgress: (progress) =>
      set({
        executionProgress: progress,
      }),

    setError: (error) =>
      set({
        error,
        syncStatus: error ? "error" : "synced",
      }),

    reset: () => set(initialState),
  })),
);

/**
 * 実行中かどうかを判定するセレクター
 */
export const selectIsExecuting = (state: SlideProjectState): boolean =>
  state.currentPhase !== "idle";

/**
 * プロジェクトが開いているかどうかを判定するセレクター
 */
export const selectHasProject = (state: SlideProjectState): boolean =>
  state.projectPath !== null;
