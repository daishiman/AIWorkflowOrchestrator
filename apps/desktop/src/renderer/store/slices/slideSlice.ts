/**
 * slideSlice - スライド機能の Renderer 側状態管理
 *
 * @description 同期状態、ウォッチ状態、ハンドオフガイダンスなどを管理する独立 Zustand store
 * P31対策: 個別セレクタで必要なフィールドだけ取得（再レンダー最適化）
 * P48対策: オブジェクトを返すセレクタには useShallow を適用
 */

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { SyncStatus, SyncDirection, HandoffGuidance } from "@repo/shared";

// ============================================================================
// State Interface
// ============================================================================

export interface SlideSliceState {
  // 既存 fields
  syncStatus: SyncStatus;
  isWatching: boolean;
  // 新規 5 fields
  syncDirection: SyncDirection;
  syncProgress: { percent: number; message: string } | null;
  syncError: { code: string; message: string } | null;
  isHandoff: boolean;
  handoffGuidance: HandoffGuidance | null;

  // actions
  setSyncStatus: (status: SyncStatus) => void;
  setIsWatching: (watching: boolean) => void;
  setSyncDirection: (direction: SyncDirection) => void;
  setSyncProgress: (
    progress: { percent: number; message: string } | null,
  ) => void;
  setSyncError: (error: { code: string; message: string } | null) => void;
  setHandoffGuidance: (guidance: HandoffGuidance | null) => void;
  clearHandoff: () => void;
}

// ============================================================================
// Store
// ============================================================================

export const useSlideStore = create<SlideSliceState>((set) => ({
  // 初期値
  syncStatus: "synced",
  isWatching: false,
  syncDirection: "forward",
  syncProgress: null,
  syncError: null,
  isHandoff: false,
  handoffGuidance: null,

  // actions
  setSyncStatus: (status) => set({ syncStatus: status }),
  setIsWatching: (watching) => set({ isWatching: watching }),
  setSyncDirection: (direction) => set({ syncDirection: direction }),
  setSyncProgress: (progress) => set({ syncProgress: progress }),
  setSyncError: (error) => set({ syncError: error }),
  setHandoffGuidance: (guidance) =>
    set({ isHandoff: guidance !== null, handoffGuidance: guidance }),
  clearHandoff: () => set({ isHandoff: false, handoffGuidance: null }),
}));

// ============================================================================
// Scalar Selectors (P31対策: useShallow不要)
// ============================================================================

/** 同期ステータスを取得 */
export const useSlideSyncStatus = () => useSlideStore((s) => s.syncStatus);

/** ファイルウォッチ中かどうか */
export const useSlideIsWatching = () => useSlideStore((s) => s.isWatching);

/** 同期方向を取得 */
export const useSlideSyncDirection = () =>
  useSlideStore((s) => s.syncDirection);

/** ハンドオフモードかどうか */
export const useSlideIsHandoff = () => useSlideStore((s) => s.isHandoff);

// ============================================================================
// Object Selectors (P48対策: useShallow必須)
// ============================================================================

/** 同期進捗を取得 */
export const useSlideSyncProgress = () =>
  useSlideStore(useShallow((s) => s.syncProgress));

/** 同期エラーを取得 */
export const useSlideSyncError = () =>
  useSlideStore(useShallow((s) => s.syncError));

/** ハンドオフガイダンスを取得 */
export const useSlideHandoffGuidance = () =>
  useSlideStore(useShallow((s) => s.handoffGuidance));

// ============================================================================
// Action Selectors (P31対策: 個別セレクタで関数参照を安定化)
// ============================================================================

/** 同期ステータスを設定 */
export const useSetSlideSyncStatus = () =>
  useSlideStore((s) => s.setSyncStatus);

/** ウォッチ状態を設定 */
export const useSetSlideIsWatching = () =>
  useSlideStore((s) => s.setIsWatching);

/** 同期方向を設定 */
export const useSetSlideSyncDirection = () =>
  useSlideStore((s) => s.setSyncDirection);

/** 同期進捗を設定 */
export const useSetSlideSyncProgress = () =>
  useSlideStore((s) => s.setSyncProgress);

/** 同期エラーを設定 */
export const useSetSlideSyncError = () => useSlideStore((s) => s.setSyncError);

/** ハンドオフガイダンスを設定 */
export const useSetSlideHandoffGuidance = () =>
  useSlideStore((s) => s.setHandoffGuidance);

/** ハンドオフをクリア */
export const useClearSlideHandoff = () => useSlideStore((s) => s.clearHandoff);
