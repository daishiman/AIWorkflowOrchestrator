import type { FileNode } from "@/preload/types";

export interface FileTreeNodeProps {
  node: FileNode;
  selectedFilePath: string | null;
  onSelectFile: (filePath: string) => void;
  onOpenContextMenu: (x: number, y: number, filePath: string) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
}

function moveFocus(
  currentTarget: HTMLElement,
  direction: "next" | "previous",
): void {
  const tree = currentTarget.closest("[role='tree']");
  if (!tree) {
    return;
  }

  const items = Array.from(
    tree.querySelectorAll<HTMLElement>("[role='treeitem']"),
  );
  const currentIndex = items.indexOf(currentTarget);
  if (currentIndex === -1) {
    return;
  }

  const nextIndex =
    direction === "next" ? currentIndex + 1 : Math.max(currentIndex - 1, 0);
  items[nextIndex]?.focus();
}

export function FileTreeNode({
  node,
  selectedFilePath,
  onSelectFile,
  onOpenContextMenu,
  expandedFolders,
  onToggleFolder,
}: FileTreeNodeProps): JSX.Element {
  const isFolder = node.type === "folder";
  const isExpanded = isFolder && expandedFolders.has(node.path);
  const isSelected = !isFolder && selectedFilePath === node.path;

  const handleActivate = (): void => {
    if (isFolder) {
      onToggleFolder(node.path);
      return;
    }

    onSelectFile(node.path);
  };

  return (
    <li className="list-none">
      <div
        role="treeitem"
        aria-expanded={isFolder ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={0}
        data-testid={`workspace-treeitem-${node.id}`}
        className={[
          "flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm outline-none transition-colors",
          isSelected
            ? "bg-[var(--status-primary)]/15 text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
        ].join(" ")}
        onClick={handleActivate}
        onContextMenu={(event) => {
          event.preventDefault();
          if (!isFolder) {
            onOpenContextMenu(event.clientX, event.clientY, node.path);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleActivate();
          } else if (event.key === "ArrowRight" && isFolder && !isExpanded) {
            event.preventDefault();
            onToggleFolder(node.path);
          } else if (event.key === "ArrowLeft" && isFolder && isExpanded) {
            event.preventDefault();
            onToggleFolder(node.path);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            moveFocus(event.currentTarget, "next");
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            moveFocus(event.currentTarget, "previous");
          }
        }}
      >
        <span aria-hidden="true">
          {isFolder ? (isExpanded ? "▼" : "▶") : "•"}
        </span>
        <span className="truncate">{node.name}</span>
      </div>

      {isFolder && isExpanded && node.children?.length ? (
        <ul
          role="group"
          className="ml-4 space-y-1 border-l border-[var(--border-subtle)] pl-2"
        >
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              selectedFilePath={selectedFilePath}
              onSelectFile={onSelectFile}
              onOpenContextMenu={onOpenContextMenu}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
