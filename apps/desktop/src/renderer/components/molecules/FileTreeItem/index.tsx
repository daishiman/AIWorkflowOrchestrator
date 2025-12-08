import React from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../../atoms/Icon";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path?: string;
  children?: FileNode[];
}

export interface FileTreeItemProps {
  node: FileNode;
  level: number;
  selected: boolean;
  expanded?: boolean;
  hasUnsavedChanges?: boolean;
  onClick: () => void;
  onToggle?: () => void;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  level,
  selected,
  expanded = false,
  hasUnsavedChanges = false,
  onClick,
  onToggle,
}) => {
  const isFolder = node.type === "folder";
  const indent = level * 16;

  const getIcon = (): IconName => {
    if (isFolder) {
      return expanded ? "folder-open" : "folder";
    }
    return "file-text";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder && onToggle) {
      onToggle();
    }
    onClick();
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded-md",
        "hover:bg-white/5",
        selected && "bg-white/10",
      )}
      style={{ paddingLeft: `${12 + indent}px` }}
      onClick={handleClick}
      role="treeitem"
      aria-selected={selected}
      aria-expanded={isFolder ? expanded : undefined}
    >
      <Icon
        name={getIcon()}
        size={16}
        className={clsx(
          "flex-shrink-0",
          isFolder ? "text-blue-400" : "text-gray-400",
        )}
      />

      <span
        className={clsx(
          "flex-1 text-sm truncate",
          isFolder ? "font-medium text-white" : "font-normal text-gray-300",
        )}
      >
        {node.name}
      </span>

      {hasUnsavedChanges && (
        <div
          className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-400"
          title="Unsaved changes"
          aria-label="Unsaved changes"
        />
      )}
    </div>
  );
};

FileTreeItem.displayName = "FileTreeItem";
