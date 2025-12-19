/**
 * WorkspaceFileSelector コンポーネント
 *
 * ワークスペースからファイルを選択するメインUIコンポーネント。
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import React, { useState, useCallback, useMemo } from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";
import { useAppStore } from "../../../store";
import { WorkspaceSearchInput } from "./WorkspaceSearchInput";
import { SelectableFileTreeItem } from "./SelectableFileTreeItem";
import { SelectedFilesPanel } from "./SelectedFilesPanel";
import { useWorkspaceFileSelection, useFileSearch } from "./hooks";
import type { WorkspaceFileSelectorProps } from "./types";
import type { FileNode } from "../../../store/types";
import type { FolderEntry } from "../../../store/types/workspace";

/**
 * ファイルパスが含まれるフォルダのIDを探す
 */
function findFolderIdForFile(
  filePath: string,
  folders: FolderEntry[],
  folderFileTrees: Map<string, FileNode[]>,
): string {
  const findInNodes = (nodes: FileNode[]): boolean => {
    for (const node of nodes) {
      if (node.path === filePath) return true;
      if (node.children && findInNodes(node.children)) return true;
    }
    return false;
  };

  for (const folder of folders) {
    const nodes = folderFileTrees.get(folder.id);
    if (nodes && findInNodes(nodes)) {
      return folder.id;
    }
  }
  return "";
}

/**
 * ワークスペースファイルセレクター
 *
 * @example
 * ```tsx
 * <WorkspaceFileSelector
 *   selectionMode="multiple"
 *   onSelectionChange={(files) => console.log(files)}
 * />
 * ```
 */
export const WorkspaceFileSelector: React.FC<WorkspaceFileSelectorProps> = ({
  selectionMode = "multiple",
  allowedExtensions,
  maxSelection = 0,
  onSelectionChange,
  className,
}) => {
  const workspace = useAppStore((state) => state.workspace);
  const folderFileTrees = useAppStore((state) => state.folderFileTrees);

  const folders = workspace?.folders ?? [];
  const isEmpty = folders.length === 0;

  // 展開状態をローカルで管理
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    folders.forEach((folder) => {
      folder.expandedPaths?.forEach((path) => initial.add(path));
    });
    return initial;
  });

  // ファイル選択フック
  const {
    selectedPaths,
    selectedFiles,
    toggleFile,
    clearSelection,
    removeFile,
    toggleFolder,
    getSelectionState,
  } = useWorkspaceFileSelection({
    selectionMode,
    maxSelection,
    allowedExtensions,
    onSelectionChange,
  });

  // 検索フック
  const { query, setQuery, clearQuery, filterNodes } = useFileSearch({
    debounceMs: 300,
  });

  // フィルタリングされたファイルツリー
  const filteredFileTrees = useMemo(() => {
    const result = new Map<string, FileNode[]>();
    folderFileTrees.forEach((nodes, folderId) => {
      const filtered = filterNodes(nodes);
      if (filtered.length > 0 || !query) {
        result.set(folderId, query ? filtered : nodes);
      }
    });
    return result;
  }, [folderFileTrees, filterNodes, query]);

  // 検索結果なし
  const hasNoResults = query && filteredFileTrees.size === 0;

  // フォルダ展開/折りたたみハンドラ
  const handleFolderToggle = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  // ファイル選択ハンドラ
  const handleFileToggle = useCallback(
    (filePath: string, file: FileNode) => {
      const folderId = findFolderIdForFile(filePath, folders, folderFileTrees);
      toggleFile(filePath, file, folderId);
    },
    [folders, folderFileTrees, toggleFile],
  );

  // フォルダ一括選択ハンドラ
  const handleFolderSelectionToggle = useCallback(
    (folderPath: string, folder: FileNode) => {
      const folderId = findFolderIdForFile(
        folderPath,
        folders,
        folderFileTrees,
      );
      toggleFolder(folderPath, folder, folderId);
    },
    [folders, folderFileTrees, toggleFolder],
  );

  // 空状態
  if (isEmpty) {
    return (
      <div
        data-testid="workspace-file-selector"
        className={clsx(
          "flex flex-col items-center justify-center h-full text-center p-8",
          className,
        )}
      >
        <Icon name="folder" size={48} className="text-zinc-500 mb-4" />
        <p className="text-zinc-400 mb-2">
          ワークスペースにフォルダがありません
        </p>
        <p className="text-zinc-500 text-sm">
          サイドバーの「フォルダを追加」からフォルダを追加してください
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="workspace-file-selector"
      className={clsx(
        "flex flex-col h-full min-h-0 overflow-hidden",
        className,
      )}
    >
      {/* 検索バー */}
      <div className="shrink-0 px-4 py-2 border-b border-zinc-700">
        <WorkspaceSearchInput
          value={query}
          onChange={setQuery}
          onClear={clearQuery}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ファイルツリー */}
        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-2">
          {hasNoResults ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Icon name="search" size={32} className="text-zinc-500 mb-2" />
              <p className="text-zinc-400 text-sm">
                「{query}」に一致するファイルが見つかりません
              </p>
            </div>
          ) : (
            <div
              role="tree"
              aria-label="ワークスペースファイルツリー"
              tabIndex={0}
              className="outline-none"
            >
              {folders.map((folder) => {
                const nodes = filteredFileTrees.get(folder.id) ?? [];
                if (nodes.length === 0 && query) return null;

                return (
                  <div key={folder.id} className="mb-2">
                    <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-zinc-400">
                      <Icon
                        name="folder"
                        size={16}
                        className="text-yellow-500"
                      />
                      <span>{folder.displayName}</span>
                    </div>
                    {nodes.map((node) => (
                      <SelectableFileTreeItem
                        key={node.id}
                        node={node}
                        folderId={folder.id}
                        expandedPaths={expandedPaths}
                        selectedPaths={selectedPaths}
                        selectionMode={selectionMode}
                        onFileToggle={handleFileToggle}
                        onFolderToggle={handleFolderToggle}
                        depth={1}
                        fileOnly={false}
                        getSelectionState={getSelectionState}
                        onFolderSelectionToggle={handleFolderSelectionToggle}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 選択パネル */}
        <div
          data-testid="selected-files-panel"
          className="w-64 shrink-0 border-l border-zinc-700 bg-zinc-900/50 overflow-hidden"
        >
          <SelectedFilesPanel
            selectedFiles={selectedFiles}
            onRemove={removeFile}
            onClearAll={clearSelection}
          />
        </div>
      </div>

      {/* ライブリージョン（スクリーンリーダー用） */}
      <div role="status" aria-live="polite" className="sr-only">
        {selectedFiles.length > 0
          ? `${selectedFiles.length}件のファイルが選択されています`
          : ""}
      </div>
    </div>
  );
};

WorkspaceFileSelector.displayName = "WorkspaceFileSelector";
