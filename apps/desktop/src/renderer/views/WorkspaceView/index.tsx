import { useCallback, useEffect, useMemo, useState } from "react";
import type { SelectedFile } from "@repo/shared/schemas";
import type { FileNode } from "@/preload/types";
import {
  useAddFiles,
  useAddFolder,
  useFolderFileTrees,
  useLoadWorkspace,
  useSetWorkspaceSelectedFile,
  useWorkspace,
  useWorkspaceError,
  useWorkspaceLoading,
} from "@/renderer/store";
import { FileBrowserPanel } from "./FileBrowserPanel";
import { PanelToggleBar } from "./PanelToggleBar";
import { WorkspaceShell } from "./WorkspaceShell";
import { WorkspaceStatusBar } from "./WorkspaceStatusBar";
import { useFileContextMenu } from "./hooks/useFileContextMenu";
import { useFileWatcher } from "./hooks/useFileWatcher";
import { usePanelResize } from "./hooks/usePanelResize";
import {
  DEFAULT_FILE_PANEL_WIDTH,
  DEFAULT_RESET_WIDTH,
  MAX_FILE_PANEL_WIDTH,
  MAX_PREVIEW_PANEL_WIDTH,
  MIN_FILE_PANEL_WIDTH,
  MIN_PREVIEW_PANEL_WIDTH,
  useWorkspaceLayout,
} from "./hooks/useWorkspaceLayout";

function findFileNode(nodes: FileNode[], filePath: string): FileNode | null {
  for (const node of nodes) {
    if (node.type === "file" && node.path === filePath) {
      return node;
    }
    if (node.children?.length) {
      const found = findFileNode(node.children, filePath);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function guessMimeType(extension: string): string {
  if (extension === ".ts" || extension === ".tsx") {
    return "text/typescript";
  }
  if (extension === ".js" || extension === ".jsx") {
    return "text/javascript";
  }
  if (extension === ".json") {
    return "application/json";
  }
  if (extension === ".md") {
    return "text/markdown";
  }
  return "text/plain";
}

function createSelectedFile(
  filePath: string,
  size: number,
  lastModified: Date,
): SelectedFile {
  const fileName = filePath.split("/").pop() ?? filePath;
  const extension = fileName.includes(".")
    ? `.${fileName.split(".").pop()?.toLowerCase()}`
    : ".txt";
  return {
    id: crypto.randomUUID(),
    path: filePath,
    name: fileName,
    extension,
    size,
    mimeType: guessMimeType(extension),
    lastModified: lastModified.toISOString(),
    createdAt: new Date().toISOString(),
  };
}

export function WorkspaceView(): JSX.Element {
  const workspace = useWorkspace();
  const folderFileTrees = useFolderFileTrees();
  const workspaceLoading = useWorkspaceLoading();
  const workspaceError = useWorkspaceError();
  const loadWorkspace = useLoadWorkspace();
  const addFolder = useAddFolder();
  const setWorkspaceSelectedFile = useSetWorkspaceSelectedFile();
  const addFiles = useAddFiles();

  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string>("");
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);
  const [selectedFileExtension, setSelectedFileExtension] = useState<
    string | null
  >(null);
  const [selectedFileError, setSelectedFileError] = useState<string | null>(
    null,
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  const { menu, openMenu, closeMenu } = useFileContextMenu();

  const layout = useWorkspaceLayout();

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const refreshSelectedFile = useCallback(async (filePath: string) => {
    const response = await window.electronAPI.file.read({ filePath });
    if (!response.success || !response.data) {
      setSelectedFileError(response.error ?? "file-read failed");
      return;
    }

    setSelectedFileContent(response.data.content);
    setSelectedFileSize(response.data.metadata.size);
    setSelectedFileExtension(
      filePath.includes(".")
        ? `.${filePath.split(".").pop()?.toLowerCase()}`
        : null,
    );
    setSelectedFileError(null);
  }, []);

  const { watchState, watchError } = useFileWatcher({
    filePath: selectedFilePath,
    enabled: Boolean(selectedFilePath),
    onFileChanged: refreshSelectedFile,
  });

  const allRoots = useMemo(
    () =>
      workspace.folders.flatMap(
        (folder) => folderFileTrees.get(folder.id) ?? [],
      ),
    [folderFileTrees, workspace.folders],
  );

  const handleSelectFile = useCallback(
    async (filePath: string) => {
      setSelectedFilePath(filePath);
      setWorkspaceSelectedFile(filePath as never);
      await refreshSelectedFile(filePath);
    },
    [refreshSelectedFile, setWorkspaceSelectedFile],
  );

  const handleAttachSelectedFile = useCallback(
    (filePath: string) => {
      const matchedNode = findFileNode(allRoots, filePath);
      addFiles([
        createSelectedFile(filePath, selectedFileSize ?? 0, new Date()),
      ]);
      if (matchedNode) {
        setSelectedFileExtension(
          filePath.includes(".")
            ? `.${filePath.split(".").pop()?.toLowerCase()}`
            : null,
        );
      }
    },
    [addFiles, allRoots, selectedFileSize],
  );

  const fileResize = usePanelResize({
    width: layout.filePanelWidth,
    minWidth: MIN_FILE_PANEL_WIDTH,
    maxWidth: MAX_FILE_PANEL_WIDTH,
    defaultWidth: DEFAULT_FILE_PANEL_WIDTH,
    onWidthChange: layout.setFilePanelWidth,
  });

  const previewResize = usePanelResize({
    width: layout.previewPanelWidth,
    minWidth: MIN_PREVIEW_PANEL_WIDTH,
    maxWidth: MAX_PREVIEW_PANEL_WIDTH,
    defaultWidth: DEFAULT_RESET_WIDTH,
    direction: "reverse",
    onWidthChange: layout.setPreviewPanelWidth,
  });

  const chatPanel = (
    <section className="flex h-full min-h-0 flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="border-b border-[var(--border-subtle)] px-5 py-4">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          作業スペース
        </h1>
        <p className="mt-1 text-sm text-[var(--text-primary)] opacity-70">
          チャットを主役にしつつ、必要なときだけファイルとプレビューを開く基盤です。
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-4 px-5 py-5">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1 text-sm text-[var(--text-primary)] opacity-80 shadow-sm">
            ファイルを開いて背景情報に追加できます
          </div>
          <div className="inline-flex rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1 text-sm text-[var(--text-primary)] opacity-80 shadow-sm">
            3-pane では同時にプレビューできます
          </div>
          <div className="inline-flex rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1 text-sm text-[var(--text-primary)] opacity-80 shadow-sm">
            後続タスクで chat 本体に差し替わります
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
          {selectedFilePath ? (
            <>
              <div className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                選択中: {selectedFilePath.split("/").pop()}
              </div>
              <div className="mb-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-[var(--text-primary)] opacity-75">
                {selectedFileContent || "ファイル内容を読み込み中..."}
              </div>
              <button
                type="button"
                className="rounded-full bg-[var(--status-primary)] px-3 py-2 text-sm text-white"
                data-testid="workspace-attach-selected-file"
                onClick={() => handleAttachSelectedFile(selectedFilePath)}
              >
                背景情報に追加
              </button>
            </>
          ) : (
            <div className="text-sm text-[var(--text-primary)] opacity-70">
              左のファイル一覧からファイルを選択してください。
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const previewPanel = (
    <section
      data-testid="workspace-preview-panel"
      className="flex h-full min-h-0 flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
    >
      <div className="border-b border-[var(--border-subtle)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          プレビュー
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 py-4 text-sm text-[var(--text-primary)] opacity-75">
        {selectedFilePath ? (
          <>
            <p className="mb-2 font-medium text-[var(--text-primary)]">
              {selectedFilePath.split("/").pop()}
            </p>
            <pre className="whitespace-pre-wrap text-xs">
              {selectedFileContent}
            </pre>
          </>
        ) : (
          <p>選択したファイルの内容をここで確認できます。</p>
        )}
      </div>
    </section>
  );

  return (
    <WorkspaceShell
      topBar={
        <PanelToggleBar
          isFilePanelOpen={layout.isFilePanelOpen}
          isPreviewOpen={layout.isPreviewOpen}
          onToggleFilePanel={layout.toggleFilePanel}
          onTogglePreview={layout.togglePreviewPanel}
        />
      }
      filePanel={
        <FileBrowserPanel
          workspace={workspace}
          folderFileTrees={folderFileTrees}
          selectedFilePath={selectedFilePath}
          workspaceError={workspaceError}
          workspaceIsLoading={workspaceLoading}
          expandedFolders={expandedFolders}
          onToggleFolder={(path) =>
            setExpandedFolders((prev) => {
              const next = new Set(prev);
              if (next.has(path)) {
                next.delete(path);
              } else {
                next.add(path);
              }
              return next;
            })
          }
          onAddFolder={addFolder}
          onSelectFile={(filePath) => void handleSelectFile(filePath)}
          contextMenu={menu}
          onCloseContextMenu={closeMenu}
          onAttachSelectedFile={handleAttachSelectedFile}
          onOpenPreviewFromContextMenu={(filePath) => {
            void handleSelectFile(filePath);
            if (!layout.isPreviewOpen) {
              layout.togglePreviewPanel();
            }
          }}
          onOpenContextMenu={openMenu}
        />
      }
      chatPanel={chatPanel}
      previewPanel={previewPanel}
      statusBar={
        <WorkspaceStatusBar
          selectedFilePath={selectedFilePath}
          fileSize={selectedFileSize}
          extension={selectedFileExtension}
          layoutMode={layout.layoutMode}
          watchState={watchState}
          error={selectedFileError ?? watchError}
        />
      }
      showFilePanelInline={layout.showFilePanelInline}
      showPreviewPanelInline={layout.showPreviewPanelInline}
      showFilePanelOverlay={layout.showFilePanelOverlay}
      showPreviewPanelOverlay={layout.showPreviewPanelOverlay}
      closeOverlayPanel={layout.closeOverlayPanel}
      fileResize={fileResize}
      previewResize={previewResize}
      filePanelWidth={layout.filePanelWidth}
      previewPanelWidth={layout.previewPanelWidth}
    />
  );
}

export default WorkspaceView;
