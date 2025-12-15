/**
 * WorkspaceSidebar - ワークスペースサイドバー
 *
 * 複数フォルダを管理するワークスペースのサイドバーコンポーネント。
 * 設計書: docs/30-workflows/workspace-manager/task-step01-3-ui-design.md (UI-WS-001)
 *
 * @module WorkspaceSidebar
 */

import React, { useState, useCallback, memo } from "react";
import type { FileNode } from "../../../store/types";
import type { Workspace, FolderId } from "../../../store/types/workspace";
import { FolderEntryItem } from "./FolderEntryItem";

// ============================================
// Props定義
// ============================================

export interface WorkspaceSidebarProps {
  workspace: Workspace;
  folderFileTrees: Map<FolderId, FileNode[]>;
  selectedFile: string | null;
  unsavedFiles: Set<string>;
  onAddFolder: () => Promise<void>;
  onRemoveFolder: (folderId: FolderId) => void;
  onToggleFolderExpansion: (folderId: FolderId) => void;
  onToggleSubfolder: (folderId: FolderId, subfolderPath: string) => void;
  onSelectFile: (filePath: string) => void;
  /** ファイル/フォルダ名変更時のコールバック（オプション） */
  onRename?: (oldPath: string, newPath: string) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

// ============================================
// メインコンポーネント
// ============================================

export const WorkspaceSidebar = memo(function WorkspaceSidebar({
  workspace,
  folderFileTrees,
  selectedFile,
  unsavedFiles,
  onAddFolder,
  onRemoveFolder,
  onToggleFolderExpansion,
  onToggleSubfolder,
  onSelectFile,
  isLoading = false,
  error = null,
  className = "",
}: WorkspaceSidebarProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddFolder = useCallback(async () => {
    setIsAdding(true);
    try {
      await onAddFolder();
    } finally {
      setIsAdding(false);
    }
  }, [onAddFolder]);

  const hasFolders = workspace.folders.length > 0;

  return (
    <aside
      className={`workspace-sidebar flex flex-col h-full bg-zinc-900 ${className}`}
      aria-label="ワークスペースサイドバー"
      data-testid="workspace-sidebar"
    >
      {/* Header */}
      <div className="workspace-header flex items-center justify-between px-3 py-2 border-b border-zinc-700">
        <h2 className="text-sm font-semibold text-zinc-100">Workspace</h2>
        <button
          className="add-folder-btn px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddFolder}
          disabled={isAdding || isLoading}
          aria-label="フォルダを追加"
          data-testid="add-folder-btn"
        >
          {isAdding ? "追加中..." : "+ Add"}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="error-message px-3 py-2 bg-red-900/30 text-red-400 text-sm"
          role="alert"
          data-testid="workspace-error"
        >
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div
          className="loading-indicator px-3 py-2 text-zinc-400 text-sm"
          role="status"
          aria-live="polite"
          data-testid="workspace-loading"
        >
          読み込み中...
        </div>
      )}

      {/* Content */}
      <div className="workspace-content flex-1 overflow-y-auto px-1 py-2">
        {!isLoading && !hasFolders && (
          <div
            className="empty-state flex flex-col items-center justify-center h-full gap-3 text-zinc-400"
            data-testid="workspace-empty"
          >
            <span className="text-4xl">📁</span>
            <p className="text-sm">フォルダがありません</p>
            <button
              className="add-folder-empty-btn px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
              onClick={handleAddFolder}
              disabled={isAdding}
              data-testid="add-folder-empty-btn"
            >
              フォルダを追加
            </button>
          </div>
        )}

        {hasFolders && (
          <div
            className="folder-list space-y-1"
            role="tree"
            aria-label="フォルダ一覧"
            data-testid="folder-list"
          >
            {workspace.folders.map((folder) => (
              <FolderEntryItem
                key={folder.id}
                folder={folder}
                fileTree={folderFileTrees.get(folder.id)}
                selectedFile={selectedFile}
                unsavedFiles={unsavedFiles}
                onToggle={() => onToggleFolderExpansion(folder.id)}
                onRemove={() => onRemoveFolder(folder.id)}
                onToggleSubfolder={(subfolderPath) =>
                  onToggleSubfolder(folder.id, subfolderPath)
                }
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
});

export default WorkspaceSidebar;
