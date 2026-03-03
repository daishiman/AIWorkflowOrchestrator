/**
 * FileTreeNode - 再帰ツリーノードコンポーネント（atom）
 *
 * ファイルツリーの各ノード（ファイル/ディレクトリ）を表示する。
 * ディレクトリノードは子要素を再帰的にレンダリングする。
 *
 * UT-UI-05A-001: aria-current, isFocused 対応
 * UT-UI-05A-007: motion-reduce:transition-none 対応
 *
 * @module SkillEditorView/components/FileTreePanel/FileTreeNode
 */

import { useCallback } from "react";
import { File, Folder, FolderOpen } from "lucide-react";
import type { SkillFileTreeNode } from "../../types";

export interface FileTreeNodeProps {
  node: SkillFileTreeNode;
  depth: number;
  isSelected: boolean;
  isFocused?: boolean;
  unsavedFiles?: Set<string>;
  expandedDirs?: Set<string>;
  onSelect: (path: string) => void;
  onToggleExpand?: (path: string) => void;
}

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  depth,
  isSelected,
  isFocused = false,
  unsavedFiles,
  expandedDirs,
  onSelect,
  onToggleExpand,
}) => {
  const isDirectory = node.type === "directory";
  const isExpanded = expandedDirs?.has(node.path) ?? false;
  const isUnsaved = unsavedFiles?.has(node.path) ?? false;

  const handleClick = useCallback(() => {
    if (isDirectory && onToggleExpand) {
      onToggleExpand(node.path);
    }
    onSelect(node.path);
  }, [isDirectory, node.path, onSelect, onToggleExpand]);

  return (
    <>
      <div
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={isDirectory ? isExpanded : undefined}
        aria-current={isFocused ? "true" : undefined}
        className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer text-sm select-none
          text-[var(--text-primary)]
          ${isSelected ? "bg-[var(--status-primary)] bg-opacity-10" : ""}
          ${isFocused && !isSelected ? "bg-[var(--bg-tertiary)]" : ""}
          ${!isSelected && !isFocused ? "hover:bg-[var(--bg-tertiary)]" : ""}
          transition-colors duration-150
          motion-reduce:transition-none`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={handleClick}
      >
        {/* アイコン */}
        {isDirectory ? (
          isExpanded ? (
            <FolderOpen
              size={16}
              className="shrink-0 text-[var(--text-secondary)]"
              data-testid="folder-icon"
            />
          ) : (
            <Folder
              size={16}
              className="shrink-0 text-[var(--text-secondary)]"
              data-testid="folder-icon"
            />
          )
        ) : (
          <File
            size={16}
            className="shrink-0 text-[var(--text-secondary)]"
            data-testid="file-icon"
          />
        )}

        {/* ファイル名 */}
        <span className="truncate">{node.name}</span>

        {/* 未保存マーカー */}
        {isUnsaved && (
          <span
            className="ml-auto w-2 h-2 rounded-full bg-[var(--status-primary)] shrink-0"
            aria-label="未保存"
          />
        )}
      </div>

      {/* ディレクトリの子要素を再帰レンダリング（UT-UI-05A-007: アニメーション付き） */}
      {isDirectory && isExpanded && node.children && (
        <div
          role="group"
          className="transition-[max-height] duration-200 overflow-hidden motion-reduce:transition-none"
        >
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              isSelected={false}
              unsavedFiles={unsavedFiles}
              expandedDirs={expandedDirs}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </>
  );
};

FileTreeNode.displayName = "FileTreeNode";
