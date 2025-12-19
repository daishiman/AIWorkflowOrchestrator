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

/**
 * フォルダの選択状態
 */
export type SelectionState = "unselected" | "indeterminate" | "selected";

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

  /**
   * フォルダ一括選択/解除
   *
   * @param folderPath - フォルダのパス
   * @param folder - フォルダノード
   * @param folderId - 所属フォルダID
   */
  toggleFolder: (
    folderPath: string,
    folder: FileNode,
    folderId: string,
  ) => void;

  /**
   * フォルダの選択状態を取得
   *
   * @param folder - フォルダノード
   * @returns 選択状態（unselected | indeterminate | selected）
   */
  getSelectionState: (folder: FileNode) => SelectionState;
}

/**
 * フォルダ配下の全ファイルを再帰的に取得
 *
 * @param node - 走査開始ノード
 * @returns 配下の全ファイル（フォルダは含まない）
 *
 * @example
 * const folder: FileNode = {
 *   type: "folder",
 *   children: [
 *     { type: "file", path: "/a.txt" },
 *     { type: "folder", children: [{ type: "file", path: "/b.txt" }] }
 *   ]
 * };
 * getAllFilesInFolder(folder); // => [{ type: "file", path: "/a.txt" }, { type: "file", path: "/b.txt" }]
 */
function getAllFilesInFolder(node: FileNode): FileNode[] {
  // 型ガード: nodeがundefinedの場合
  if (!node) {
    return [];
  }

  // ベースケース: ファイルノードの場合、自身を返す
  if (node.type === "file") {
    return [node];
  }

  // 再帰ケース: フォルダノードの場合、子ノードを再帰的に処理
  // flatMapで結果を平坦化
  return node.children?.flatMap(getAllFilesInFolder) ?? [];
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

  /**
   * フォルダの選択状態を計算
   *
   * @param folder - 選択状態を計算するフォルダノード
   * @returns 選択状態（unselected | indeterminate | selected）
   *
   * @complexity O(n) where n = フォルダ配下のファイル数
   */
  const getSelectionState = useCallback(
    (folder: FileNode): SelectionState => {
      // Step 1: 配下の全ファイルを取得
      const files = getAllFilesInFolder(folder);

      // Step 2: 空フォルダの場合は未選択扱い
      if (files.length === 0) {
        return "unselected";
      }

      // Step 3: 選択されているファイル数をカウント
      const selectedCount = files.filter((file) =>
        selectedPaths.has(file.path),
      ).length;

      // Step 4: 選択状態を判定
      if (selectedCount === 0) {
        return "unselected";
      }
      if (selectedCount === files.length) {
        return "selected";
      }
      return "indeterminate";
    },
    [selectedPaths],
  );

  /**
   * フォルダの一括選択/解除を切り替え
   *
   * @param folderPath - フォルダのパス（将来拡張用）
   * @param folder - フォルダノード
   * @param folderId - 所属フォルダID
   *
   * @behavior
   * - 全選択状態: 全ファイルを解除
   * - 未選択/部分選択状態: 全ファイルを選択
   */
  const toggleFolder = useCallback(
    (folderPath: string, folder: FileNode, folderId: string) => {
      // Step 1: 配下の全ファイルを取得
      const files = getAllFilesInFolder(folder);

      // Step 2: 空フォルダの場合は何もしない
      if (files.length === 0) {
        return;
      }

      // Step 3: 現在の選択状態を取得
      const currentState = getSelectionState(folder);

      // Step 4: 状態に応じた処理
      if (currentState === "selected") {
        // 全選択 → 全解除: 配下ファイルをすべて削除
        setSelectedFiles((prev) => {
          const filePaths = new Set(files.map((f) => f.path));
          return prev.filter((f) => !filePaths.has(f.path));
        });
      } else {
        // 未選択/部分選択 → 全選択: 未選択ファイルを追加
        setSelectedFiles((prev) => {
          const existingPaths = new Set(prev.map((f) => f.path));

          // 未選択かつ拡張子フィルターを通過するファイルのみ追加
          const newFiles = files
            .filter(
              (file) =>
                !existingPaths.has(file.path) &&
                isExtensionAllowed(file.name, allowedExtensions),
            )
            .map((file) => ({
              id: file.id,
              name: file.name,
              path: file.path,
              folderId,
            }));

          // maxSelection制限の適用
          if (maxSelection > 0) {
            const remainingSlots = maxSelection - prev.length;
            return [...prev, ...newFiles.slice(0, remainingSlots)];
          }

          return [...prev, ...newFiles];
        });
      }
    },
    [getSelectionState, allowedExtensions, maxSelection],
  );

  return {
    selectedPaths,
    selectedFiles,
    toggleFile,
    clearSelection,
    removeFile,
    canSelect,
    toggleFolder,
    getSelectionState,
  };
}
