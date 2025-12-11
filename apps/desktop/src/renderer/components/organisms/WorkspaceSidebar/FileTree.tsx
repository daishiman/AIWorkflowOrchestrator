/**
 * FileTree - ファイルツリーコンポーネント群
 *
 * ファイルツリーの表示に必要なコンポーネントを提供します。
 * FileTreeViewとFileTreeItemは相互参照があるため、同一ファイルに配置しています。
 *
 * @module FileTree
 */

import React, { memo, useCallback } from "react";
import type { FileNode } from "../../../store/types";
import type { FolderId } from "../../../store/types/workspace";
import { MAX_TREE_DEPTH } from "../../../constants/workspace";

// Re-export for backwards compatibility
export { MAX_TREE_DEPTH };

// ============================================
// FileTreeItem
// ============================================

export interface FileTreeItemProps {
  node: FileNode;
  folderId: FolderId;
  expandedPaths: Set<string>;
  selectedFile: string | null;
  unsavedFiles: Set<string>;
  onToggleSubfolder: (subfolderPath: string) => void;
  onSelectFile: (filePath: string) => void;
  depth: number;
}

export const FileTreeItem = memo(function FileTreeItem({
  node,
  folderId,
  expandedPaths,
  selectedFile,
  unsavedFiles,
  onToggleSubfolder,
  onSelectFile,
  depth,
}: FileTreeItemProps) {
  const isFolder = node.type === "folder";
  const isExpanded = isFolder && expandedPaths.has(node.path);
  const isSelected = selectedFile === node.path;
  const isUnsaved = unsavedFiles.has(node.path);

  const handleClick = useCallback(() => {
    if (isFolder) {
      onToggleSubfolder(node.path);
    } else {
      onSelectFile(node.path);
    }
  }, [isFolder, node.path, onToggleSubfolder, onSelectFile]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <li
      className="file-tree-item"
      role="treeitem"
      aria-expanded={isFolder ? isExpanded : undefined}
      aria-selected={isSelected}
    >
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer rounded transition-colors ${
          isSelected
            ? "bg-blue-600/30 text-white"
            : "hover:bg-zinc-800 text-zinc-300"
        }`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        data-testid={`file-tree-item-${node.id}`}
      >
        {isFolder && (
          <span className="text-xs text-zinc-400" aria-hidden="true">
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
        <span aria-hidden="true">{isFolder ? "📁" : "📄"}</span>
        <span className="truncate text-sm">{node.name}</span>
        {isUnsaved && (
          <span
            className="unsaved-indicator ml-auto text-orange-400"
            aria-label="未保存"
          >
            ●
          </span>
        )}
      </div>
      {isFolder && isExpanded && node.children && (
        <FileTreeView
          nodes={node.children}
          folderId={folderId}
          expandedPaths={expandedPaths}
          selectedFile={selectedFile}
          unsavedFiles={unsavedFiles}
          onToggleSubfolder={onToggleSubfolder}
          onSelectFile={onSelectFile}
          depth={depth + 1}
        />
      )}
    </li>
  );
});

// ============================================
// FileTreeView
// ============================================

export interface FileTreeViewProps {
  nodes: FileNode[];
  folderId: FolderId;
  expandedPaths: Set<string>;
  selectedFile: string | null;
  unsavedFiles: Set<string>;
  onToggleSubfolder: (subfolderPath: string) => void;
  onSelectFile: (filePath: string) => void;
  depth: number;
}

export const FileTreeView = memo(function FileTreeView({
  nodes,
  folderId,
  expandedPaths,
  selectedFile,
  unsavedFiles,
  onToggleSubfolder,
  onSelectFile,
  depth,
}: FileTreeViewProps) {
  if (depth > MAX_TREE_DEPTH) {
    return null;
  }

  return (
    <ul className="file-tree pl-2" role="tree">
      {nodes.map((node) => (
        <FileTreeItem
          key={node.id}
          node={node}
          folderId={folderId}
          expandedPaths={expandedPaths}
          selectedFile={selectedFile}
          unsavedFiles={unsavedFiles}
          onToggleSubfolder={onToggleSubfolder}
          onSelectFile={onSelectFile}
          depth={depth}
        />
      ))}
    </ul>
  );
});
