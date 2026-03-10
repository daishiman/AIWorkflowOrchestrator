import { useMemo } from "react";
import type { FileNode } from "@/preload/types";
import type { FolderId, Workspace } from "@/renderer/store/types/workspace";
import { FileContextMenu } from "./FileContextMenu";
import { FileTreeNode } from "./FileTreeNode";
import type { FileContextMenuState } from "./hooks/useFileContextMenu";

export interface FileBrowserPanelProps {
  workspace: Workspace;
  folderFileTrees: Map<FolderId, FileNode[]>;
  selectedFilePath: string | null;
  workspaceError: string | null;
  workspaceIsLoading: boolean;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onAddFolder: () => Promise<void>;
  onSelectFile: (filePath: string) => void;
  contextMenu: FileContextMenuState | null;
  onCloseContextMenu: () => void;
  onAttachSelectedFile: (filePath: string) => void;
  onOpenPreviewFromContextMenu: (filePath: string) => void;
  onOpenContextMenu: (x: number, y: number, filePath: string) => void;
}

export function FileBrowserPanel({
  workspace,
  folderFileTrees,
  selectedFilePath,
  workspaceError,
  workspaceIsLoading,
  expandedFolders,
  onToggleFolder,
  onAddFolder,
  onSelectFile,
  contextMenu,
  onCloseContextMenu,
  onAttachSelectedFile,
  onOpenPreviewFromContextMenu,
  onOpenContextMenu,
}: FileBrowserPanelProps): JSX.Element {
  const roots = useMemo(() => {
    return workspace.folders.flatMap(
      (folder) => folderFileTrees.get(folder.id) ?? [],
    );
  }, [folderFileTrees, workspace.folders]);

  return (
    <aside
      data-testid="workspace-file-panel"
      className="flex h-full min-h-0 flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
    >
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          作業スペース
        </h2>
        <button
          type="button"
          className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs hover:bg-[var(--bg-tertiary)]"
          onClick={() => void onAddFolder()}
          data-testid="workspace-add-folder"
        >
          フォルダを追加
        </button>
      </div>

      {workspaceError ? (
        <div className="px-4 py-3 text-sm text-red-500" role="alert">
          {workspaceError}
        </div>
      ) : null}

      {workspaceIsLoading ? (
        <div className="px-4 py-3 text-sm text-[var(--text-primary)] opacity-70">
          読み込み中...
        </div>
      ) : null}

      {!workspaceIsLoading && workspace.folders.length === 0 ? (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"
          data-testid="workspace-zero-state"
        >
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            作業スペースへようこそ
          </p>
          <p className="text-sm text-[var(--text-primary)] opacity-70">
            まずフォルダを追加すると、背景情報として扱うファイルを選べます。
          </p>
          <button
            type="button"
            className="rounded-full bg-[var(--status-primary)] px-4 py-2 text-sm text-white"
            onClick={() => void onAddFolder()}
          >
            フォルダを追加
          </button>
        </div>
      ) : null}

      {workspace.folders.length > 0 ? (
        <div className="min-h-0 flex-1 overflow-auto px-3 py-3">
          <ul
            role="tree"
            aria-label="ワークスペースファイル一覧"
            className="space-y-1"
          >
            {roots.map((node) => (
              <FileTreeNode
                key={node.id}
                node={node}
                selectedFilePath={selectedFilePath}
                onSelectFile={onSelectFile}
                onOpenContextMenu={onOpenContextMenu}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {contextMenu ? (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={onCloseContextMenu}
          onAttach={() => {
            onAttachSelectedFile(contextMenu.filePath);
            onCloseContextMenu();
          }}
          onOpenPreview={() => {
            onOpenPreviewFromContextMenu(contextMenu.filePath);
            onCloseContextMenu();
          }}
        />
      ) : null}
    </aside>
  );
}
