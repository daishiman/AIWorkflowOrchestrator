/**
 * useWorkspaceFileSelection フック
 *
 * ワークスペースファイルの選択状態を管理するカスタムフック。
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { FileNode } from "../../../../store/types";
import type { WorkspaceSelectedFile } from "../types";

export interface UseWorkspaceFileSelectionOptions {
  selectionMode?: "single" | "multiple";
  maxSelection?: number;
  allowedExtensions?: string[];
  onSelectionChange?: (files: WorkspaceSelectedFile[]) => void;
}

export interface UseWorkspaceFileSelectionReturn {
  /** 選択されたファイルパスのSet */
  selectedPaths: Set<string>;

  /** 選択されたファイル情報の配列 */
  selectedFiles: WorkspaceSelectedFile[];

  /** ファイル選択/選択解除 */
  toggleFile: (filePath: string, file: FileNode, folderId: string) => void;

  /** 選択をクリア */
  clearSelection: () => void;

  /** 特定ファイルを削除 */
  removeFile: (filePath: string) => void;

  /** 選択可能かどうか */
  canSelect: (filePath: string) => boolean;
}

/**
 * ファイルの拡張子を取得
 */
function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot);
}

/**
 * 拡張子が許可リストに含まれるかチェック
 */
function isExtensionAllowed(
  filename: string,
  allowedExtensions: string[] | undefined,
): boolean {
  if (!allowedExtensions || allowedExtensions.length === 0) {
    return true;
  }
  const ext = getExtension(filename);
  return allowedExtensions.includes(ext);
}

/**
 * ワークスペースファイル選択フック
 *
 * @example
 * ```tsx
 * const {
 *   selectedPaths,
 *   selectedFiles,
 *   toggleFile,
 *   clearSelection,
 * } = useWorkspaceFileSelection({
 *   selectionMode: 'multiple',
 *   maxSelection: 10,
 *   onSelectionChange: (files) => console.log(files),
 * });
 * ```
 */
export function useWorkspaceFileSelection(
  options: UseWorkspaceFileSelectionOptions = {},
): UseWorkspaceFileSelectionReturn {
  const {
    selectionMode = "multiple",
    maxSelection = 0,
    allowedExtensions,
    onSelectionChange,
  } = options;

  const [selectedFiles, setSelectedFiles] = useState<WorkspaceSelectedFile[]>(
    [],
  );

  // コールバック参照を保持（依存配列から除外するため）
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  // 初期化済みフラグ
  const isInitializedRef = useRef(false);

  // 選択変更時にコールバックを呼び出す（初期化時は除く）
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }
    if (onSelectionChangeRef.current) {
      onSelectionChangeRef.current(selectedFiles);
    }
  }, [selectedFiles]);

  const selectedPaths = useMemo(
    () => new Set(selectedFiles.map((f) => f.path)),
    [selectedFiles],
  );

  const canSelect = useCallback(
    (filePath: string) => {
      // 既に選択されている場合は選択解除可能なのでtrue
      if (selectedPaths.has(filePath)) {
        return true;
      }

      // 拡張子フィルタチェック
      if (!isExtensionAllowed(filePath, allowedExtensions)) {
        return false;
      }

      // 最大選択数チェック
      if (maxSelection > 0 && selectedFiles.length >= maxSelection) {
        return false;
      }

      return true;
    },
    [selectedPaths, allowedExtensions, maxSelection, selectedFiles.length],
  );

  const toggleFile = useCallback(
    (filePath: string, file: FileNode, folderId: string) => {
      setSelectedFiles((prev) => {
        const isSelected = prev.some((f) => f.path === filePath);

        if (isSelected) {
          // 選択解除
          return prev.filter((f) => f.path !== filePath);
        }

        // 拡張子フィルタチェック
        if (!isExtensionAllowed(file.name, allowedExtensions)) {
          return prev;
        }

        // 新規選択
        const newFile: WorkspaceSelectedFile = {
          id: file.id,
          name: file.name,
          path: filePath,
          folderId,
        };

        if (selectionMode === "single") {
          // 単一選択モード: 置換
          return [newFile];
        }

        // 複数選択モード: 最大選択数チェック
        if (maxSelection > 0 && prev.length >= maxSelection) {
          return prev;
        }

        return [...prev, newFile];
      });
    },
    [selectionMode, maxSelection, allowedExtensions],
  );

  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const removeFile = useCallback((filePath: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.path !== filePath));
  }, []);

  return {
    selectedPaths,
    selectedFiles,
    toggleFile,
    clearSelection,
    removeFile,
    canSelect,
  };
}
