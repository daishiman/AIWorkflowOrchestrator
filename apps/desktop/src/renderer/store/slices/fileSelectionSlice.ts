/**
 * ファイル選択スライス
 *
 * ファイル選択機能のZustand状態管理スライス。
 * ドラッグ&ドロップ、ファイルダイアログ選択、フィルタリング等をサポート。
 *
 * @see docs/30-workflows/file-selection/step05-store-design.md
 */

import type { StateCreator } from "zustand";
import type { SelectedFile, FileFilterCategory } from "@repo/shared/types";

// =============================================================================
// Types
// =============================================================================

/**
 * ファイル選択スライスの状態と操作
 */
export interface FileSelectionSlice {
  // === 状態 ===
  /** 選択されたファイルリスト */
  selectedFiles: SelectedFile[];
  /** 現在のフィルターカテゴリ */
  filterCategory: FileFilterCategory;
  /** ドラッグ中フラグ */
  isDragging: boolean;
  /** ローディング中フラグ */
  isLoading: boolean;
  /** エラーメッセージ（null = エラーなし） */
  error: string | null;
  /** 最後に選択されたファイルのID */
  lastSelectedId: string | null;

  // === アクション ===
  /** ファイルを追加（重複パスは無視） */
  addFiles: (files: SelectedFile[]) => void;
  /** ファイルを削除 */
  removeFile: (id: string) => void;
  /** 複数ファイルを削除 */
  removeFiles: (ids: string[]) => void;
  /** すべてのファイルをクリア */
  clearFiles: () => void;
  /** ファイルの並び順を変更 */
  reorderFile: (fromIndex: number, toIndex: number) => void;
  /** フィルターカテゴリを設定 */
  setFilterCategory: (category: FileFilterCategory) => void;
  /** ドラッグ中フラグを設定 */
  setIsDragging: (isDragging: boolean) => void;
  /** ローディング中フラグを設定 */
  setIsLoading: (isLoading: boolean) => void;
  /** エラーを設定 */
  setError: (error: string | null) => void;
  /** エラーをクリア */
  clearError: () => void;
  /** 全状態をリセット */
  resetFileSelection: () => void;
}

// =============================================================================
// Initial State
// =============================================================================

const initialState = {
  selectedFiles: [] as SelectedFile[],
  filterCategory: "all" as FileFilterCategory,
  isDragging: false,
  isLoading: false,
  error: null as string | null,
  lastSelectedId: null as string | null,
};

// =============================================================================
// Slice Creator
// =============================================================================

/**
 * ファイル選択スライスを作成
 */
export const createFileSelectionSlice: StateCreator<
  FileSelectionSlice,
  [],
  [],
  FileSelectionSlice
> = (set, get) => ({
  // === 初期状態 ===
  ...initialState,

  // === アクション ===

  addFiles: (files) => {
    if (files.length === 0) return;

    const currentFiles = get().selectedFiles;
    const existingPaths = new Set(currentFiles.map((f) => f.path));

    // 重複を除外して新規ファイルのみ追加
    const newFiles = files.filter((f) => !existingPaths.has(f.path));

    if (newFiles.length === 0) return;

    set({
      selectedFiles: [...currentFiles, ...newFiles],
      lastSelectedId: newFiles[newFiles.length - 1].id,
      error: null, // ファイル追加時にエラーをクリア
    });
  },

  removeFile: (id) => {
    const currentFiles = get().selectedFiles;
    const filteredFiles = currentFiles.filter((f) => f.id !== id);

    if (filteredFiles.length === currentFiles.length) return;

    // lastSelectedIdが削除されたファイルの場合、残りの最後のファイルのIDに更新
    const currentLastSelectedId = get().lastSelectedId;
    let newLastSelectedId = currentLastSelectedId;

    if (currentLastSelectedId === id) {
      newLastSelectedId =
        filteredFiles.length > 0
          ? filteredFiles[filteredFiles.length - 1].id
          : null;
    }

    set({
      selectedFiles: filteredFiles,
      lastSelectedId: newLastSelectedId,
    });
  },

  removeFiles: (ids) => {
    if (ids.length === 0) return;

    const idsSet = new Set(ids);
    const currentFiles = get().selectedFiles;
    const filteredFiles = currentFiles.filter((f) => !idsSet.has(f.id));

    if (filteredFiles.length === currentFiles.length) return;

    // lastSelectedIdが削除対象に含まれる場合、残りの最後のファイルのIDに更新
    const currentLastSelectedId = get().lastSelectedId;
    let newLastSelectedId = currentLastSelectedId;

    if (currentLastSelectedId && idsSet.has(currentLastSelectedId)) {
      newLastSelectedId =
        filteredFiles.length > 0
          ? filteredFiles[filteredFiles.length - 1].id
          : null;
    }

    set({
      selectedFiles: filteredFiles,
      lastSelectedId: newLastSelectedId,
    });
  },

  clearFiles: () => {
    set({
      selectedFiles: [],
      lastSelectedId: null,
      error: null,
    });
  },

  reorderFile: (fromIndex, toIndex) => {
    const currentFiles = get().selectedFiles;

    // 範囲チェック
    if (
      fromIndex < 0 ||
      fromIndex >= currentFiles.length ||
      toIndex < 0 ||
      toIndex >= currentFiles.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const newFiles = [...currentFiles];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);

    set({ selectedFiles: newFiles });
  },

  setFilterCategory: (category) => {
    set({ filterCategory: category });
  },

  setIsDragging: (isDragging) => {
    set({ isDragging });
  },

  setIsLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({
      error,
      isLoading: false, // エラー設定時にローディングを終了
    });
  },

  clearError: () => {
    set({ error: null });
  },

  resetFileSelection: () => {
    set(initialState);
  },
});
