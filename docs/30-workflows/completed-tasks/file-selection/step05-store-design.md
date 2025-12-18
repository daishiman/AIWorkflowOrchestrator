# ファイル選択機能 - 状態管理設計書

> **ドキュメントID**: CONV-01-STORE
> **作成日**: 2025-12-16
> **作成者**: @state-manager
> **ステータス**: 承認待ち
> **関連ドキュメント**: [step03-type-design.md](./step03-type-design.md), [step04-ipc-design.md](./step04-ipc-design.md)

---

## 1. 概要

本ドキュメントは、Zustandを使用したファイル選択機能の状態管理を設計する。
既存のスライスパターンに従い、`AppStore`に統合可能な形式で設計する。

### 1.1 設計方針

| 方針             | 説明                                                           |
| ---------------- | -------------------------------------------------------------- |
| 既存パターン準拠 | `apps/desktop/src/renderer/store/slices/` の既存パターンに従う |
| スライス分離     | `fileSelectionSlice.ts` として独立したスライスで実装           |
| 型安全           | step03-type-design.md で定義した型を使用                       |
| セレクタ最適化   | 個別のセレクタフックでレンダリング最適化                       |
| 非永続化         | ファイル選択状態はセッション内のみ有効（永続化しない）         |

### 1.2 ファイル配置

```
apps/desktop/src/renderer/store/
├── slices/
│   └── fileSelectionSlice.ts   # 新規作成（スライスパターン）
├── index.ts                     # 更新（スライス統合・セレクタエクスポート）
├── types/
│   └── fileSelection.ts         # 新規作成（ストア専用型）
└── utils/
    └── fileSelection.ts         # 新規作成（ユーティリティ関数）
```

### 1.3 命名規則ポリシー（ARCH-M1対応）

| パターン                     | 採用理由                                     | 例                      |
| ---------------------------- | -------------------------------------------- | ----------------------- |
| `slices/xxxSlice.ts`         | 既存の`AppStore`統合パターンに準拠           | `fileSelectionSlice.ts` |
| `useXxxStore.ts` (store直下) | 独立した小規模ストア向け（今回は採用しない） | -                       |

**選定理由**:

- 既存の `apps/desktop/src/renderer/store/slices/` に `navigationSlice.ts`, `editorSlice.ts` 等が存在
- `AppStore`への統合が要件であり、スライスパターンが適切
- 将来の機能追加時も同パターンで一貫性を維持

**マイグレーション方針**:

- 新規スライスは必ず `slices/` ディレクトリに配置
- 独立ストアが必要な場合は `store/standalone/useXxxStore.ts` を検討
- 既存コードとの整合性を優先し、破壊的変更を避ける

---

## 2. 状態設計

### 2.1 状態構造

```typescript
// apps/desktop/src/renderer/store/types/fileSelection.ts
import type { SelectedFile, FileFilterCategory } from "@repo/shared/types";

/**
 * ファイル選択の状態
 */
export interface FileSelectionState {
  /** 選択されたファイルリスト（順序を保持） */
  selectedFiles: SelectedFile[];

  /** 現在のフィルターカテゴリ */
  filterCategory: FileFilterCategory;

  /** ドラッグオーバー状態（ドロップゾーン表示用） */
  isDragging: boolean;

  /** ローディング状態（ダイアログ表示中/メタデータ取得中） */
  isLoading: boolean;

  /** エラー情報（null = エラーなし） */
  error: string | null;

  /** 最後に選択されたファイルのID（フォーカス管理用） */
  lastSelectedId: string | null;
}
```

### 2.2 初期状態

```typescript
export const initialFileSelectionState: FileSelectionState = {
  selectedFiles: [],
  filterCategory: "all",
  isDragging: false,
  isLoading: false,
  error: null,
  lastSelectedId: null,
};
```

### 2.3 状態遷移図

```
                        ┌─────────────────┐
                        │     初期状態      │
                        │ files: []        │
                        │ isLoading: false │
                        │ error: null      │
                        └────────┬────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   ダイアログ表示  │   │   ドラッグ開始   │   │  ファイル追加    │
│ isLoading: true │   │ isDragging: true │   │ files: [...new] │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         ▼                     ▼                     │
┌─────────────────┐   ┌─────────────────┐           │
│   選択完了/中止  │   │    ドロップ      │           │
│ isLoading: false│   │ isDragging: false│◀──────────┘
│ files: updated  │   │ files: updated  │
└────────┬────────┘   └────────┬────────┘
         │                     │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────┐
         │   エラー発生     │
         │ error: "message"│
         │ isLoading: false│
         └─────────────────┘
```

---

## 3. アクション設計

### 3.1 アクション一覧

```typescript
// apps/desktop/src/renderer/store/slices/fileSelectionSlice.ts
import type { SelectedFile, FileFilterCategory } from "@repo/shared/types";

export interface FileSelectionActions {
  // ===== ファイル操作 =====

  /**
   * ファイルを追加
   * 重複チェックはpath基準で行う
   */
  addFiles: (files: SelectedFile[]) => void;

  /**
   * ファイルを削除
   * @param fileId 削除するファイルのID
   */
  removeFile: (fileId: string) => void;

  /**
   * 複数ファイルを削除
   * @param fileIds 削除するファイルIDの配列
   */
  removeFiles: (fileIds: string[]) => void;

  /**
   * すべてのファイルをクリア
   */
  clearFiles: () => void;

  /**
   * ファイルの順序を変更（並び替え）
   * @param fromIndex 移動元インデックス
   * @param toIndex 移動先インデックス
   */
  reorderFile: (fromIndex: number, toIndex: number) => void;

  // ===== フィルター操作 =====

  /**
   * フィルターカテゴリを設定
   */
  setFilterCategory: (category: FileFilterCategory) => void;

  // ===== UI状態操作 =====

  /**
   * ドラッグ状態を設定
   */
  setIsDragging: (isDragging: boolean) => void;

  /**
   * ローディング状態を設定
   */
  setIsLoading: (isLoading: boolean) => void;

  /**
   * エラーを設定
   */
  setError: (error: string | null) => void;

  /**
   * エラーをクリア
   */
  clearError: () => void;

  // ===== リセット =====

  /**
   * 状態を完全にリセット
   */
  resetFileSelection: () => void;
}
```

### 3.2 アクション実装

```typescript
// apps/desktop/src/renderer/store/slices/fileSelectionSlice.ts
import { StateCreator } from "zustand";
import type { SelectedFile, FileFilterCategory } from "@repo/shared/types";

export interface FileSelectionSlice
  extends FileSelectionState, FileSelectionActions {}

export const createFileSelectionSlice: StateCreator<
  FileSelectionSlice,
  [],
  [],
  FileSelectionSlice
> = (set, _get) => ({
  // ===== Initial State =====
  selectedFiles: [],
  filterCategory: "all",
  isDragging: false,
  isLoading: false,
  error: null,
  lastSelectedId: null,

  // ===== ファイル操作アクション =====

  addFiles: (files) => {
    set((state) => {
      // 重複チェック（path基準）
      const existingPaths = new Set(state.selectedFiles.map((f) => f.path));
      const newFiles = files.filter((f) => !existingPaths.has(f.path));

      if (newFiles.length === 0) {
        return state; // 変更なし
      }

      return {
        selectedFiles: [...state.selectedFiles, ...newFiles],
        lastSelectedId:
          newFiles[newFiles.length - 1]?.id ?? state.lastSelectedId,
        error: null, // エラーをクリア
      };
    });
  },

  removeFile: (fileId) => {
    set((state) => {
      const newFiles = state.selectedFiles.filter((f) => f.id !== fileId);
      return {
        selectedFiles: newFiles,
        lastSelectedId:
          state.lastSelectedId === fileId
            ? (newFiles[newFiles.length - 1]?.id ?? null)
            : state.lastSelectedId,
      };
    });
  },

  removeFiles: (fileIds) => {
    set((state) => {
      const idsToRemove = new Set(fileIds);
      const newFiles = state.selectedFiles.filter(
        (f) => !idsToRemove.has(f.id),
      );
      return {
        selectedFiles: newFiles,
        lastSelectedId: idsToRemove.has(state.lastSelectedId ?? "")
          ? (newFiles[newFiles.length - 1]?.id ?? null)
          : state.lastSelectedId,
      };
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
    set((state) => {
      if (
        fromIndex < 0 ||
        fromIndex >= state.selectedFiles.length ||
        toIndex < 0 ||
        toIndex >= state.selectedFiles.length
      ) {
        return state; // 無効なインデックス
      }

      const newFiles = [...state.selectedFiles];
      const [removed] = newFiles.splice(fromIndex, 1);
      if (removed) {
        newFiles.splice(toIndex, 0, removed);
      }
      return { selectedFiles: newFiles };
    });
  },

  // ===== フィルター操作アクション =====

  setFilterCategory: (category) => {
    set({ filterCategory: category });
  },

  // ===== UI状態操作アクション =====

  setIsDragging: (isDragging) => {
    set({ isDragging });
  },

  setIsLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },

  clearError: () => {
    set({ error: null });
  },

  // ===== リセットアクション =====

  resetFileSelection: () => {
    set({
      selectedFiles: [],
      filterCategory: "all",
      isDragging: false,
      isLoading: false,
      error: null,
      lastSelectedId: null,
    });
  },
});
```

---

## 4. セレクタ設計

### 4.1 基本セレクタ

```typescript
// apps/desktop/src/renderer/store/index.ts に追加

// ===== File Selection Selectors =====

/** 選択されたファイル一覧 */
export const useSelectedFiles = () =>
  useAppStore((state) => state.selectedFiles);

/** 選択されたファイル数 */
export const useSelectedFileCount = () =>
  useAppStore((state) => state.selectedFiles.length);

/** ファイルが選択されているか */
export const useHasSelectedFiles = () =>
  useAppStore((state) => state.selectedFiles.length > 0);

/** 現在のフィルターカテゴリ */
export const useFileFilterCategory = () =>
  useAppStore((state) => state.filterCategory);

/** ドラッグ中かどうか */
export const useFileSelectionIsDragging = () =>
  useAppStore((state) => state.isDragging);

/** ローディング中かどうか */
export const useFileSelectionIsLoading = () =>
  useAppStore((state) => state.isLoading);

/** エラー情報 */
export const useFileSelectionError = () => useAppStore((state) => state.error);

/** 最後に選択されたファイルID */
export const useLastSelectedFileId = () =>
  useAppStore((state) => state.lastSelectedId);
```

### 4.2 派生セレクタ

```typescript
// apps/desktop/src/renderer/store/index.ts に追加

/** 選択されたファイルの合計サイズ（バイト） */
export const useTotalSelectedSize = () =>
  useAppStore((state) =>
    state.selectedFiles.reduce((total, file) => total + file.size, 0),
  );

/** 選択されたファイルの合計サイズ（フォーマット済み） */
export const useFormattedTotalSize = () =>
  useAppStore((state) => {
    const totalBytes = state.selectedFiles.reduce(
      (total, file) => total + file.size,
      0,
    );
    return formatFileSize(totalBytes);
  });

/** 特定のファイルが選択されているか */
export const useIsFileSelected = (fileId: string) =>
  useAppStore((state) => state.selectedFiles.some((f) => f.id === fileId));

/** 特定のパスのファイルが選択されているか */
export const useIsPathSelected = (path: string) =>
  useAppStore((state) => state.selectedFiles.some((f) => f.path === path));

/** 拡張子別のファイル数 */
export const useFileCountByExtension = () =>
  useAppStore((state) => {
    const counts: Record<string, number> = {};
    for (const file of state.selectedFiles) {
      counts[file.extension] = (counts[file.extension] ?? 0) + 1;
    }
    return counts;
  });
```

### 4.3 アクションセレクタ

```typescript
// apps/desktop/src/renderer/store/index.ts に追加

/** ファイル追加アクション */
export const useAddFiles = () => useAppStore((state) => state.addFiles);

/** ファイル削除アクション */
export const useRemoveFile = () => useAppStore((state) => state.removeFile);

/** 複数ファイル削除アクション */
export const useRemoveFiles = () => useAppStore((state) => state.removeFiles);

/** 全ファイルクリアアクション */
export const useClearFiles = () => useAppStore((state) => state.clearFiles);

/** ファイル並び替えアクション */
export const useReorderFile = () => useAppStore((state) => state.reorderFile);

/** フィルター設定アクション */
export const useSetFileFilterCategory = () =>
  useAppStore((state) => state.setFilterCategory);

/** ドラッグ状態設定アクション */
export const useSetFileSelectionIsDragging = () =>
  useAppStore((state) => state.setIsDragging);

/** ローディング設定アクション */
export const useSetFileSelectionIsLoading = () =>
  useAppStore((state) => state.setIsLoading);

/** エラー設定アクション */
export const useSetFileSelectionError = () =>
  useAppStore((state) => state.setError);

/** リセットアクション */
export const useResetFileSelection = () =>
  useAppStore((state) => state.resetFileSelection);
```

---

## 5. ユーティリティ関数

### 5.1 ファイルサイズフォーマット

```typescript
// apps/desktop/src/renderer/store/utils/fileSelection.ts

/**
 * ファイルサイズを人間が読める形式にフォーマット
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * ファイル配列から統計情報を計算
 */
export function calculateFileStats(files: SelectedFile[]): {
  totalCount: number;
  totalSize: number;
  extensionCounts: Record<string, number>;
} {
  const extensionCounts: Record<string, number> = {};
  let totalSize = 0;

  for (const file of files) {
    totalSize += file.size;
    extensionCounts[file.extension] =
      (extensionCounts[file.extension] ?? 0) + 1;
  }

  return {
    totalCount: files.length,
    totalSize,
    extensionCounts,
  };
}
```

---

## 6. ストア統合

### 6.1 AppStoreへの統合

```typescript
// apps/desktop/src/renderer/store/index.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
// ... 既存のimport ...
import {
  createFileSelectionSlice,
  type FileSelectionSlice,
} from "./slices/fileSelectionSlice";

// Combined store type - 更新
export type AppStore = NavigationSlice &
  EditorSlice &
  ChatSlice &
  GraphSlice &
  SettingsSlice &
  UISlice &
  DashboardSlice &
  AuthSlice &
  WorkspaceSlice &
  FileSelectionSlice; // 追加

// Create the combined store - 更新
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createNavigationSlice(...args),
        ...createEditorSlice(...args),
        ...createChatSlice(...args),
        ...createGraphSlice(...args),
        ...createSettingsSlice(...args),
        ...createUISlice(...args),
        ...createDashboardSlice(...args),
        ...createAuthSlice(...args),
        ...createWorkspaceSlice(...args),
        ...createFileSelectionSlice(...args), // 追加
      }),
      {
        name: "knowledge-studio-store",
        storage: customStorage,
        partialize: (state) => ({
          // Only persist these fields
          currentView: state.currentView,
          selectedFile: state.selectedFile,
          expandedFolders: state.expandedFolders,
          userProfile: state.userProfile,
          autoSyncEnabled: state.autoSyncEnabled,
          windowSize: state.windowSize,
          // FileSelectionは永続化しない（セッション内のみ）
        }),
      },
    ),
    { name: "KnowledgeStudio" },
  ),
);
```

### 6.2 永続化について

**決定事項**: ファイル選択状態は**永続化しない**

| 理由           | 説明                                                   |
| -------------- | ------------------------------------------------------ |
| セッション依存 | 選択されたファイルはセッション終了後は無効になる可能性 |
| パス変更リスク | ファイルパスが変更/削除されている可能性がある          |
| セキュリティ   | ファイルパス情報をlocalStorageに保存するのはリスク     |
| UX             | アプリ再起動時は新規選択から始める方が自然             |

---

## 7. カスタムフック設計

### 7.1 ファイル選択フック

```typescript
// apps/desktop/src/renderer/hooks/useFileSelection.ts
import { useCallback } from "react";
import {
  useSelectedFiles,
  useAddFiles,
  useRemoveFile,
  useClearFiles,
  useSetFileSelectionIsLoading,
  useSetFileSelectionError,
  useFileSelectionIsLoading,
  useFileSelectionError,
} from "../store";
import type { SelectedFile, OpenFileDialogRequest } from "@repo/shared/types";

export interface UseFileSelectionReturn {
  /** 選択されたファイル一覧 */
  files: SelectedFile[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー情報 */
  error: string | null;
  /** ファイル選択ダイアログを開く */
  openFileDialog: (options?: Partial<OpenFileDialogRequest>) => Promise<void>;
  /** ファイルを削除 */
  removeFile: (fileId: string) => void;
  /** すべてクリア */
  clearFiles: () => void;
}

export function useFileSelection(): UseFileSelectionReturn {
  const files = useSelectedFiles();
  const isLoading = useFileSelectionIsLoading();
  const error = useFileSelectionError();
  const addFiles = useAddFiles();
  const removeFile = useRemoveFile();
  const clearFiles = useClearFiles();
  const setIsLoading = useSetFileSelectionIsLoading();
  const setError = useSetFileSelectionError();

  const openFileDialog = useCallback(
    async (options?: Partial<OpenFileDialogRequest>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await window.electronAPI.fileSelection.openDialog({
          multiSelections: true,
          ...options,
        });

        if (!response.success) {
          setError(response.error ?? "ファイル選択に失敗しました");
          return;
        }

        if (response.data?.canceled || !response.data?.filePaths.length) {
          setIsLoading(false);
          return;
        }

        // メタデータを取得
        const metadataResponse =
          await window.electronAPI.fileSelection.getMultipleMetadata({
            filePaths: response.data.filePaths,
          });

        if (!metadataResponse.success) {
          setError(metadataResponse.error ?? "メタデータ取得に失敗しました");
          return;
        }

        if (metadataResponse.data?.files.length) {
          addFiles(metadataResponse.data.files);
        }

        // 部分的なエラーがあれば警告
        if (metadataResponse.data?.errors.length) {
          console.warn("一部のファイルでエラー:", metadataResponse.data.errors);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "予期せぬエラーが発生しました",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [addFiles, setIsLoading, setError],
  );

  return {
    files,
    isLoading,
    error,
    openFileDialog,
    removeFile,
    clearFiles,
  };
}
```

### 7.2 ドラッグ&ドロップフック

```typescript
// apps/desktop/src/renderer/hooks/useFileDrop.ts
import { useCallback, type DragEvent } from "react";
import {
  useAddFiles,
  useSetFileSelectionIsDragging,
  useSetFileSelectionIsLoading,
  useSetFileSelectionError,
  useFileSelectionIsDragging,
} from "../store";
import type { SelectedFile } from "@repo/shared/types";

export interface UseFileDropReturn {
  /** ドラッグ中かどうか */
  isDragging: boolean;
  /** ドラッグエンターハンドラ */
  handleDragEnter: (e: DragEvent) => void;
  /** ドラッグリーブハンドラ */
  handleDragLeave: (e: DragEvent) => void;
  /** ドラッグオーバーハンドラ */
  handleDragOver: (e: DragEvent) => void;
  /** ドロップハンドラ */
  handleDrop: (e: DragEvent) => void;
}

export function useFileDrop(): UseFileDropReturn {
  const isDragging = useFileSelectionIsDragging();
  const setIsDragging = useSetFileSelectionIsDragging();
  const setIsLoading = useSetFileSelectionIsLoading();
  const setError = useSetFileSelectionError();
  const addFiles = useAddFiles();

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    [setIsDragging],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // ドロップゾーンの外に出た場合のみ解除
      if (e.currentTarget === e.target) {
        setIsDragging(false);
      }
    },
    [setIsDragging],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        const filePaths = files.map((f) => f.path).filter(Boolean);
        if (filePaths.length === 0) {
          setError("有効なファイルパスがありません");
          return;
        }

        const response =
          await window.electronAPI.fileSelection.getMultipleMetadata({
            filePaths,
          });

        if (!response.success) {
          setError(response.error ?? "メタデータ取得に失敗しました");
          return;
        }

        if (response.data?.files.length) {
          addFiles(response.data.files);
        }

        if (response.data?.errors.length) {
          console.warn("一部のファイルでエラー:", response.data.errors);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "予期せぬエラーが発生しました",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setIsDragging, setIsLoading, setError, addFiles],
  );

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
```

---

## 8. テスト設計

### 8.1 スライステスト

```typescript
// apps/desktop/src/renderer/store/slices/__tests__/fileSelectionSlice.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createFileSelectionSlice } from "../fileSelectionSlice";
import type { SelectedFile } from "@repo/shared/types";

const mockFile: SelectedFile = {
  id: "test-uuid-1",
  path: "/path/to/file.pdf",
  name: "file.pdf",
  extension: ".pdf",
  size: 1024,
  mimeType: "application/pdf",
  lastModified: "2025-01-01T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
};

describe("fileSelectionSlice", () => {
  describe("addFiles", () => {
    it("should add files to empty state", () => {
      // テスト実装
    });

    it("should not add duplicate files (same path)", () => {
      // テスト実装
    });

    it("should update lastSelectedId", () => {
      // テスト実装
    });
  });

  describe("removeFile", () => {
    it("should remove file by id", () => {
      // テスト実装
    });

    it("should update lastSelectedId when removed", () => {
      // テスト実装
    });
  });

  describe("clearFiles", () => {
    it("should clear all files", () => {
      // テスト実装
    });
  });

  describe("reorderFile", () => {
    it("should reorder files correctly", () => {
      // テスト実装
    });

    it("should handle invalid indices", () => {
      // テスト実装
    });
  });

  describe("resetFileSelection", () => {
    it("should reset to initial state", () => {
      // テスト実装
    });
  });
});
```

---

## 9. 完了条件チェックリスト

- [x] ストアの状態構造が設計されている
- [x] アクション（addFiles, removeFile, clearFiles等）が設計されている
- [x] セレクタが設計されている
- [x] 永続化の要否が決定されている（非永続化）
- [x] カスタムフックが設計されている
- [x] テスト方針が定義されている

---

## 10. 承認

| 役割           | 名前           | 日付       | 承認状況 |
| -------------- | -------------- | ---------- | -------- |
| 状態管理設計者 | @state-manager | 2025-12-16 | 作成済み |
| アーキテクト   |                |            | 未承認   |
| 最終承認者     |                |            | 未承認   |

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 変更者         |
| ---------- | ---------- | -------- | -------------- |
| 1.0        | 2025-12-16 | 初版作成 | @state-manager |
