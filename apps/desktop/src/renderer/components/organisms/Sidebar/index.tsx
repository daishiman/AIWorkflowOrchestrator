import React from "react";
import clsx from "clsx";
import { FileTreeItem, type FileNode } from "../../molecules/FileTreeItem";

export interface SidebarProps {
  fileTree: FileNode[];
  selectedFile: FileNode | null;
  expandedFolders: Set<string>;
  onFileSelect: (file: FileNode) => void;
  onFolderToggle: (folderId: string) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  fileTree,
  selectedFile,
  expandedFolders,
  onFileSelect,
  onFolderToggle,
  className,
}) => {
  const renderFileTree = (
    nodes: FileNode[],
    depth: number = 0,
  ): React.ReactNode => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.id);
      const isSelected = selectedFile?.id === node.id;

      return (
        <React.Fragment key={node.id}>
          <FileTreeItem
            node={node}
            level={depth}
            selected={isSelected}
            expanded={isExpanded}
            onClick={() => {
              if (node.type === "file") {
                onFileSelect(node);
              } else {
                onFolderToggle(node.id);
              }
            }}
            onToggle={() => onFolderToggle(node.id)}
          />

          {node.type === "folder" && isExpanded && node.children && (
            <div role="group" aria-label={`${node.name} contents`}>
              {renderFileTree(node.children, depth + 1)}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <aside
      className={clsx("w-[280px] bg-transparent p-4", className)}
      role="complementary"
      aria-label="File explorer"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Files</h2>
      </div>

      <div className="space-y-1" role="tree" aria-label="File tree">
        {fileTree.length > 0 ? (
          renderFileTree(fileTree)
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">
            No files found
          </p>
        )}
      </div>
    </aside>
  );
};

Sidebar.displayName = "Sidebar";
