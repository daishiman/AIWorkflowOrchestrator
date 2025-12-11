/**
 * FolderEntryItem - フォルダエントリーアイテム
 *
 * ワークスペース内の個別フォルダを表示するコンポーネント。
 *
 * @module FolderEntryItem
 */

import React, { useCallback, useState, memo } from "react";
import type { FileNode } from "../../../store/types";
import type { FolderEntry } from "../../../store/types/workspace";
import { FileTreeView } from "./FileTree";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu";

export interface FolderEntryItemProps {
  folder: FolderEntry;
  fileTree: FileNode[] | undefined;
  selectedFile: string | null;
  unsavedFiles: Set<string>;
  onToggle: () => void;
  onRemove: () => void;
  onToggleSubfolder: (subfolderPath: string) => void;
  onSelectFile: (filePath: string) => void;
}

export const FolderEntryItem = memo(function FolderEntryItem({
  folder,
  fileTree,
  selectedFile,
  unsavedFiles,
  onToggle,
  onRemove,
  onToggleSubfolder,
  onSelectFile,
}: FolderEntryItemProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle],
  );

  const handleRemoveClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove();
    },
    [onRemove],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: "expand-collapse",
      label: folder.isExpanded ? "折りたたむ" : "展開する",
      icon: folder.isExpanded ? "▲" : "▼",
      onClick: () => {
        onToggle();
      },
    },
    {
      id: "remove",
      label: "削除",
      icon: "🗑",
      onClick: () => {
        onRemove();
      },
      danger: true,
    },
  ];

  return (
    <div
      className="folder-entry group"
      data-testid={`folder-entry-${folder.id}`}
    >
      <div
        className="folder-header flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-zinc-800 rounded transition-colors"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
        role="button"
        tabIndex={0}
        aria-expanded={folder.isExpanded}
        aria-label={`${folder.displayName}フォルダ ${folder.isExpanded ? "展開中" : "折りたたみ中"}`}
        data-testid={`folder-header-${folder.id}`}
      >
        <span
          className="expand-icon text-zinc-400"
          aria-hidden="true"
          data-testid={`folder-expand-${folder.id}`}
        >
          {folder.isExpanded ? "▼" : "▶"}
        </span>
        <span className="folder-icon" aria-hidden="true">
          📁
        </span>
        <span className="folder-name flex-1 truncate text-sm text-zinc-100">
          {folder.displayName}
        </span>
        <button
          className="remove-btn p-1 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          onClick={handleRemoveClick}
          aria-label={`${folder.displayName}を削除`}
          data-testid={`folder-remove-${folder.id}`}
        >
          ✕
        </button>
      </div>
      {folder.isExpanded && fileTree && (
        <div
          className="folder-content ml-4 border-l border-zinc-700"
          role="group"
          aria-label={`${folder.displayName}の内容`}
        >
          <FileTreeView
            nodes={fileTree}
            folderId={folder.id}
            expandedPaths={folder.expandedPaths}
            selectedFile={selectedFile}
            unsavedFiles={unsavedFiles}
            onToggleSubfolder={onToggleSubfolder}
            onSelectFile={onSelectFile}
            depth={0}
          />
        </div>
      )}
      {contextMenu && (
        <ContextMenu
          items={contextMenuItems}
          position={contextMenu}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
});

export default FolderEntryItem;
