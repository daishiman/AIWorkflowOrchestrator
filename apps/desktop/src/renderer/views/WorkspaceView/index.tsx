import { useCallback, useEffect, useState } from "react";
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
import { WorkspaceChatPanel } from "./WorkspaceChatPanel";
import { WorkspaceShell } from "./WorkspaceShell";
import { WorkspaceStatusBar } from "./WorkspaceStatusBar";
import { useFileContextMenu } from "./hooks/useFileContextMenu";
import { useFileWatcher } from "./hooks/useFileWatcher";
import { usePanelResize } from "./hooks/usePanelResize";
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
  );
}

export default WorkspaceView;
