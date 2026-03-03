/**
 * FileTreePanel - ファイルツリーパネル（molecule）
 *
 * 左ペインに表示するファイルツリー。ディレクトリの展開/折りたたみ、
 * ファイル選択、未保存マーカー表示を提供する。
 *
 * UT-UI-05A-001: WAI-ARIA Tree Pattern 1.2 準拠キーボードナビゲーション対応
 *
 * @module SkillEditorView/components/FileTreePanel/FileTreePanel
 */

import { useState, useCallback, useRef, useMemo } from "react";
import type { SkillFileTreeNode } from "../../types";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import type { FlatNode } from "../../hooks/useKeyboardNavigation";
import { FileTreeNode } from "./FileTreeNode";

export interface FileTreePanelProps {
  fileTree: SkillFileTreeNode[];
  selectedFile: string;
  unsavedFiles: Set<string>;
  onSelectFile: (path: string) => void;
}

/**
 * ツリーを平坦化して可視ノード一覧を生成する（M-005: useMemo キャッシュ）
 */
const flattenTreeNodes = (
  nodes: SkillFileTreeNode[],
  expandedDirs: Set<string>,
  depth: number = 0,
  parentPath?: string,
): FlatNode[] => {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    const isExpanded = expandedDirs.has(node.path);
    result.push({
      path: node.path,
      name: node.name,
      type: node.type,
      depth,
      isExpanded: node.type === "directory" ? isExpanded : undefined,
      parentPath,
    });
    if (node.type === "directory" && isExpanded && node.children) {
      result.push(
        ...flattenTreeNodes(node.children, expandedDirs, depth + 1, node.path),
      );
    }
  }
  return result;
};

export const FileTreePanel: React.FC<FileTreePanelProps> = ({
  fileTree,
  selectedFile,
  unsavedFiles,
  onSelectFile,
}) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggleExpand = useCallback((path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  // M-005: useMemo で flatNodes をキャッシュ
  const flatNodes = useMemo(
    () => flattenTreeNodes(fileTree, expandedDirs),
    [fileTree, expandedDirs],
  );

  const { focusedIndex, handleKeyDown } = useKeyboardNavigation({
    flatNodes,
    onSelect: onSelectFile,
    onToggleExpand: handleToggleExpand,
  });

  const focusedPath = focusedIndex >= 0 ? flatNodes[focusedIndex]?.path : null;

  const handleTreeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        containerRef.current?.blur();
        return;
      }
      handleKeyDown(e.nativeEvent);
    },
    [handleKeyDown],
  );

  const isEmpty = fileTree.length === 0;

  return (
    <div
      ref={containerRef}
      role="tree"
      tabIndex={0}
      aria-label="ファイルツリー"
      onKeyDown={handleTreeKeyDown}
      className="w-[240px] h-full overflow-y-auto bg-[var(--bg-secondary)] border-r border-[var(--border-default)] shrink-0 outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-inset"
    >
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-sm text-[var(--text-secondary)] px-4">
          ファイルがありません
        </div>
      ) : (
        fileTree.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            depth={1}
            isSelected={selectedFile === node.path}
            isFocused={focusedPath === node.path}
            unsavedFiles={unsavedFiles}
            expandedDirs={expandedDirs}
            onSelect={onSelectFile}
            onToggleExpand={handleToggleExpand}
          />
        ))
      )}
    </div>
  );
};

FileTreePanel.displayName = "FileTreePanel";
