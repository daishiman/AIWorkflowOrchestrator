import { useCallback, useEffect, useMemo, useState } from "react";
import type { FileNode } from "@/preload/types";
import {
  useAddFiles,
  useAddFolder,
  useAppStore,
  useFolderFileTrees,
  useLoadWorkspace,
  useSetWorkspaceSelectedFile,
  useWorkspace,
  useWorkspaceError,
  useWorkspaceLoading,
} from "@/renderer/store";
import { QuickFileSearch } from "./components/QuickFileSearch";
import { PreviewPanel } from "./components/PreviewPanel/PreviewPanel";
import { normalizeExtension } from "./components/PreviewPanel/preview-utils";
import { FileBrowserPanel } from "./FileBrowserPanel";
import { PanelToggleBar } from "./PanelToggleBar";
import { WorkspaceChatPanel } from "./WorkspaceChatPanel";
import { WorkspaceShell } from "./WorkspaceShell";
import { WorkspaceStatusBar } from "./WorkspaceStatusBar";
import { useFileContextMenu } from "./hooks/useFileContextMenu";
import { useFileWatcher } from "./hooks/useFileWatcher";
import { usePanelResize } from "./hooks/usePanelResize";
import { useQuickFileSearch } from "./hooks/useQuickFileSearch";
import { useWorkspaceChatController } from "./hooks/useWorkspaceChatController";
import {
  DEFAULT_FILE_PANEL_WIDTH,
  DEFAULT_RESET_WIDTH,
  MAX_FILE_PANEL_WIDTH,
  MAX_PREVIEW_PANEL_WIDTH,
  MIN_FILE_PANEL_WIDTH,
  MIN_PREVIEW_PANEL_WIDTH,
  useWorkspaceLayout,
} from "./hooks/useWorkspaceLayout";
import { createSelectedFile } from "./workspaceFileSelection";

const FILE_READ_TIMEOUT_MS = 5000;
const FILE_READ_RETRY_DELAY_MS = 1000;
const FILE_READ_MAX_RETRIES = 3;

function flattenFilePaths(nodes: FileNode[]): string[] {
  const paths: string[] = [];

  for (const node of nodes) {
    if (node.type === "file") {
      paths.push(node.path);
      continue;
    }

    if (node.children?.length) {
      paths.push(...flattenFilePaths(node.children));
    }
  }

  return paths;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function readFileWithTimeout(filePath: string) {
  let timeoutId: number | undefined;

  try {
    return await Promise.race([
      window.electronAPI.file.read({ filePath }),
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(
            new Error(
              `ファイル読み込みが ${FILE_READ_TIMEOUT_MS / 1000} 秒でタイムアウトしました`,
            ),
          );
        }, FILE_READ_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
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
  const setCurrentView = useAppStore((state) => state.setCurrentView);

  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);
  const [selectedFileExtension, setSelectedFileExtension] = useState<
    string | null
  >(null);
  const [selectedFileError, setSelectedFileError] = useState<string | null>(
    null,
  );
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  const { menu, openMenu, closeMenu } = useFileContextMenu();
  const layout = useWorkspaceLayout();

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const allRoots = useMemo(
    () =>
      workspace.folders.flatMap(
        (folder) => folderFileTrees.get(folder.id) ?? [],
      ),
    [folderFileTrees, workspace.folders],
  );

  const allFilePaths = useMemo(() => flattenFilePaths(allRoots), [allRoots]);

  const refreshSelectedFile = useCallback(async (filePath: string) => {
    if (!window.electronAPI?.file) {
      setIsFileLoading(false);
      setSelectedFileError("file API が利用できません");
      return;
    }

    setIsFileLoading(true);
    setSelectedFileError(null);

    let lastError = "";

    for (let attempt = 0; attempt < FILE_READ_MAX_RETRIES; attempt += 1) {
      try {
        const response = await readFileWithTimeout(filePath);

        if (!response.success || !response.data) {
          throw new Error(response.error ?? "file-read failed");
        }

        setSelectedFileContent(response.data.content);
        setSelectedFileSize(response.data.metadata.size);
        setSelectedFileExtension(normalizeExtension(filePath));
        setSelectedFileError(null);
        setIsFileLoading(false);
        return;
      } catch (error) {
        lastError =
          error instanceof Error
            ? error.message
            : "ファイル読み込みで不明なエラーが発生しました";

        if (attempt < FILE_READ_MAX_RETRIES - 1) {
          await wait(FILE_READ_RETRY_DELAY_MS);
        }
      }
    }

    setSelectedFileError(
      `${lastError}（${FILE_READ_TIMEOUT_MS / 1000}秒 timeout / ${FILE_READ_MAX_RETRIES}回再試行済み）`,
    );
    setIsFileLoading(false);
  }, []);

  const { watchState, watchError } = useFileWatcher({
    filePath: selectedFilePath,
    enabled: Boolean(selectedFilePath),
    onFileChanged: refreshSelectedFile,
  });

  const handleSelectFile = useCallback(
    async (filePath: string) => {
      setSelectedFilePath(filePath);
      setWorkspaceSelectedFile(filePath as never);
      await refreshSelectedFile(filePath);
    },
    [refreshSelectedFile, setWorkspaceSelectedFile],
  );

  const attachFileAsContext = useCallback(
    async (
      filePath: string,
    ): Promise<{ success: boolean; errorMessage?: string }> => {
      try {
        const response = await window.electronAPI.file.read({ filePath });
        if (!response.success || !response.data) {
          const errorMessage =
            response.error ?? "背景情報の読み込みに失敗しました";
          setSelectedFileError(errorMessage);
          return { success: false, errorMessage };
        }

        addFiles([
          createSelectedFile({
            filePath,
            size: response.data.metadata.size,
            lastModified: new Date(response.data.metadata.lastModified),
          }),
        ]);
        setSelectedFileError(null);
        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "背景情報の読み込みに失敗しました";
        setSelectedFileError(errorMessage);
        return { success: false, errorMessage };
      }
    },
    [addFiles],
  );

  const openPreviewForFile = useCallback(
    (filePath: string) => {
      void handleSelectFile(filePath);
      if (!layout.isPreviewOpen) {
        layout.togglePreviewPanel();
      }
    },
    [handleSelectFile, layout],
  );

  const chatController = useWorkspaceChatController({
    selectedFilePath,
    onAttachSelectedFile: attachFileAsContext,
    onOpenPreviewFromMention: openPreviewForFile,
  });

  const quickSearch = useQuickFileSearch({
    filePaths: allFilePaths,
    onSelectFile: openPreviewForFile,
  });

  const handleOpenEditorFromSource = useCallback(() => {
    if (!selectedFilePath) {
      return;
    }

    setWorkspaceSelectedFile(selectedFilePath as never);
    setCurrentView("editor");
  }, [selectedFilePath, setCurrentView, setWorkspaceSelectedFile]);

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

  const chatPanel = <WorkspaceChatPanel controller={chatController} />;

  const previewPanel = (
    <PreviewPanel
      filePath={selectedFilePath}
      extension={selectedFileExtension}
      content={selectedFileContent}
      size={selectedFileSize}
      isLoading={isFileLoading}
      error={selectedFileError}
      onRefresh={() => {
        if (!selectedFilePath) {
          return;
        }

        void refreshSelectedFile(selectedFilePath);
      }}
      onOpenEditor={handleOpenEditorFromSource}
    />
  );

  return (
    <>
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
            onAttachSelectedFile={(filePath) => {
              void attachFileAsContext(filePath);
            }}
            onOpenPreviewFromContextMenu={openPreviewForFile}
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

      <QuickFileSearch
        isOpen={quickSearch.isOpen}
        query={quickSearch.query}
        results={quickSearch.results}
        selectedIndex={quickSearch.selectedIndex}
        onClose={quickSearch.close}
        onQueryChange={quickSearch.setQuery}
        onHighlight={quickSearch.highlightResult}
        onSubmit={quickSearch.selectResult}
        onKeyDown={quickSearch.handleKeyDown}
      />
    </>
  );
}

export default WorkspaceView;
