/**
 * FileTree - ファイルツリーコンポーネント群
 *
 * ファイルツリーの表示に必要なコンポーネントを提供します。
 * FileTreeViewとFileTreeItemは相互参照があるため、同一ファイルに配置しています。
 *
 * @module FileTree
 */

import React, { memo, useCallback, useState, useRef, useEffect } from "react";
import type { FileNode } from "../../../store/types";
import type { FolderId } from "../../../store/types/workspace";
import { MAX_TREE_DEPTH } from "../../../constants/workspace";
import { useIpc } from "../../../../hooks/useIpc";
import type { RenameFileResponse } from "../../../../preload/types";

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
  onRename?: (oldPath: string, newPath: string) => void;
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
  onRename,
  depth,
}: FileTreeItemProps) {
  const isFolder = node.type === "folder";
  const isExpanded = isFolder && expandedPaths.has(node.path);
  const isSelected = selectedFile === node.path;
  const isUnsaved = unsavedFiles.has(node.path);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [editError, setEditError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false); // IME composition state
  const inputRef = useRef<HTMLInputElement>(null);
  const { invoke } = useIpc();

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select filename without extension
      const dotIndex = node.name.lastIndexOf(".");
      if (dotIndex > 0 && !isFolder) {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }
  }, [isEditing, node.name, isFolder]);

  const handleClick = useCallback(() => {
    if (isEditing) return;
    if (isFolder) {
      onToggleSubfolder(node.path);
    } else {
      onSelectFile(node.path);
    }
  }, [isFolder, node.path, onToggleSubfolder, onSelectFile, isEditing]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setEditName(node.name);
      setEditError(null);
      setIsEditing(true);
    },
    [node.name],
  );

  const handleRenameSubmit = useCallback(async () => {
    const trimmedName = editName.trim();
    if (!trimmedName || trimmedName === node.name) {
      setIsEditing(false);
      setEditError(null);
      return;
    }

    // Validate filename
    if (trimmedName.includes("/") || trimmedName.includes("\\")) {
      setEditError("Invalid filename");
      return;
    }

    // Build new path
    const parentPath = node.path.substring(0, node.path.lastIndexOf("/"));
    const newPath = `${parentPath}/${trimmedName}`;

    try {
      const response = await invoke<RenameFileResponse>("file:rename", {
        oldPath: node.path,
        newPath,
      });

      if (!response.success) {
        setEditError(response.error || "Rename failed");
        return;
      }

      setIsEditing(false);
      setEditError(null);
      onRename?.(node.path, newPath);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Rename failed");
    }
  }, [editName, node.name, node.path, invoke, onRename]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isEditing) {
        if (e.key === "Enter") {
          // Skip if IME is composing (e.g., Japanese input)
          if (isComposing) {
            return;
          }
          e.preventDefault();
          handleRenameSubmit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setIsEditing(false);
          setEditError(null);
        }
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      } else if (e.key === "F2") {
        e.preventDefault();
        setEditName(node.name);
        setEditError(null);
        setIsEditing(true);
      }
    },
    [handleClick, isEditing, isComposing, handleRenameSubmit, node.name],
  );

  const handleBlur = useCallback(() => {
    if (isEditing) {
      handleRenameSubmit();
    }
  }, [isEditing, handleRenameSubmit]);

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
        onDoubleClick={handleDoubleClick}
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
        {isEditing ? (
          <div className="flex-1 flex flex-col">
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                setEditError(null);
              }}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              className={`flex-1 px-1 py-0 text-sm bg-zinc-900 border rounded
                         focus:outline-none focus:ring-1
                         ${editError ? "border-red-500 focus:ring-red-500" : "border-zinc-600 focus:ring-blue-500"}`}
              onClick={(e) => e.stopPropagation()}
              data-testid="file-tree-rename-input"
            />
            {editError && (
              <span className="text-xs text-red-500 mt-0.5">{editError}</span>
            )}
          </div>
        ) : (
          <span className="truncate text-sm">{node.name}</span>
        )}
        {isUnsaved && !isEditing && (
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
          onRename={onRename}
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
  onRename?: (oldPath: string, newPath: string) => void;
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
  onRename,
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
          onRename={onRename}
          depth={depth}
        />
      ))}
    </ul>
  );
});
