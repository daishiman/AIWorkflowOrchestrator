/**
 * SelectableFileTreeItem コンポーネント
 *
 * 選択可能なファイルツリーアイテム。
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import React, { useCallback } from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";
import type { SelectableFileTreeItemProps } from "./types";

const INDENT_SIZE = 16;

/**
 * 選択可能なファイルツリーアイテム
 */
export const SelectableFileTreeItem: React.FC<SelectableFileTreeItemProps> = ({
  node,
  folderId,
  expandedPaths,
  selectedPaths,
  selectionMode,
  onFileToggle,
  onFolderToggle,
  depth,
  fileOnly = true,
}) => {
  const isFolder = node.type === "folder";
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPaths.has(node.path);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFolder) {
        onFolderToggle(node.path);
      } else {
        onFileToggle(node.path, node);
      }
    },
    [isFolder, node, onFileToggle, onFolderToggle],
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onFileToggle(node.path, node);
    },
    [node, onFileToggle],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          if (!isFolder || !fileOnly) {
            onFileToggle(node.path, node);
          }
          break;
        case "Enter":
          e.preventDefault();
          if (isFolder) {
            onFolderToggle(node.path);
          } else {
            onFileToggle(node.path, node);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (isFolder && !isExpanded) {
            onFolderToggle(node.path);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (isFolder && isExpanded) {
            onFolderToggle(node.path);
          }
          break;
      }
    },
    [isFolder, isExpanded, fileOnly, node, onFileToggle, onFolderToggle],
  );

  return (
    <>
      <div
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={isFolder ? isExpanded : undefined}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{ paddingLeft: `${depth * INDENT_SIZE}px` }}
        className={clsx(
          "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer",
          "transition-colors duration-150",
          "hover:bg-zinc-800",
          isSelected && "bg-blue-600/30 text-white selected",
          !isSelected && "text-zinc-300",
        )}
      >
        {isFolder ? (
          <span aria-label={isExpanded ? "折りたたみ" : "展開"}>
            <Icon
              name={isExpanded ? "chevron-down" : "chevron-right"}
              size={14}
              className="text-zinc-400"
            />
          </span>
        ) : (
          selectionMode === "multiple" && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              aria-label={`${node.name} を選択`}
              className="w-4 h-4 rounded border border-zinc-500 bg-transparent checked:bg-blue-600 checked:border-blue-600"
              onClick={(e) => e.stopPropagation()}
            />
          )
        )}

        <span aria-label={isFolder ? "フォルダ" : "ファイル"}>
          <Icon
            name={isFolder ? "folder" : "file"}
            size={16}
            className={isFolder ? "text-yellow-500" : "text-zinc-400"}
          />
        </span>

        <span className="truncate">{node.name}</span>
      </div>

      {isFolder && isExpanded && node.children && (
        <div role="group">
          {node.children.map((child) => (
            <SelectableFileTreeItem
              key={child.id}
              node={child}
              folderId={folderId}
              expandedPaths={expandedPaths}
              selectedPaths={selectedPaths}
              selectionMode={selectionMode}
              onFileToggle={onFileToggle}
              onFolderToggle={onFolderToggle}
              depth={depth + 1}
              fileOnly={fileOnly}
            />
          ))}
        </div>
      )}
    </>
  );
};

SelectableFileTreeItem.displayName = "SelectableFileTreeItem";
