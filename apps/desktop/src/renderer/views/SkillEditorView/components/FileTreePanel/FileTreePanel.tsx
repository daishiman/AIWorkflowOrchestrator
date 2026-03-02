/**
 * FileTreePanel - ファイルツリーパネル（molecule）
 *
 * 左ペインに表示するファイルツリー。ディレクトリの展開/折りたたみ、
 * ファイル選択、未保存マーカー表示を提供する。
 *
 * @module SkillEditorView/components/FileTreePanel/FileTreePanel
 */

import { useState, useCallback } from "react";
import type { SkillFileTreeNode } from "../../types";
import { FileTreeNode } from "./FileTreeNode";

export interface FileTreePanelProps {
  fileTree: SkillFileTreeNode[];
  selectedFile: string;
  unsavedFiles: Set<string>;
  onSelectFile: (path: string) => void;
}

export const FileTreePanel: React.FC<FileTreePanelProps> = ({
  fileTree,
  selectedFile,
  unsavedFiles,
  onSelectFile,
}) => {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

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

  const isEmpty = fileTree.length === 0;

  return (
    <div
      role="tree"
      className="w-[240px] h-full overflow-y-auto bg-[var(--bg-secondary)] border-r border-[var(--border-default)] shrink-0"
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
