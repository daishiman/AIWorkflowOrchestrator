import React, { useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { WorkspaceSidebar } from "../../components/organisms/WorkspaceSidebar";
import { TextArea } from "../../components/atoms/TextArea";
import { Button } from "../../components/atoms/Button";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";
import { EmptyState } from "../../components/atoms/EmptyState";
import {
  useAppStore,
  useWorkspace,
  useWorkspaceLoading,
  useWorkspaceError,
} from "../../store";
import type { FolderId } from "../../store/types/workspace";

export interface EditorViewProps {
  className?: string;
}

export const EditorView: React.FC<EditorViewProps> = ({ className }) => {
  // Workspace state
  const workspace = useWorkspace();
  const workspaceIsLoading = useWorkspaceLoading();
  const workspaceError = useWorkspaceError();
  const folderFileTrees = useAppStore((state) => state.folderFileTrees);
  const loadWorkspace = useAppStore((state) => state.loadWorkspace);
  const addFolder = useAppStore((state) => state.addFolder);
  const removeFolder = useAppStore((state) => state.removeFolder);
  const toggleFolderExpansion = useAppStore(
    (state) => state.toggleFolderExpansion,
  );
  const toggleSubfolder = useAppStore((state) => state.toggleSubfolder);

  // Editor state
  const editorContent = useAppStore((state) => state.editorContent);
  const hasUnsavedChanges = useAppStore((state) => state.hasUnsavedChanges);
  const setEditorContent = useAppStore((state) => state.setEditorContent);
  const markAsSaved = useAppStore((state) => state.markAsSaved);

  // Selected file state
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [unsavedFiles] = useState<Set<string>>(new Set());

  // Local state for saving
  const [isSaving, setIsSaving] = useState(false);

  // Load workspace on mount
  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const handleContentChange = useCallback(
    (value: string) => {
      setEditorContent(value);
    },
    [setEditorContent],
  );

  const handleSave = useCallback(async () => {
    if (!selectedFilePath) return;

    setIsSaving(true);
    try {
      await window.electronAPI.file.write({
        filePath: selectedFilePath,
        content: editorContent,
      });
      markAsSaved();
    } catch (err) {
      console.error("Failed to save file:", err);
    } finally {
      setIsSaving(false);
    }
  }, [selectedFilePath, editorContent, markAsSaved]);

  const handleFileSelect = useCallback(
    async (filePath: string) => {
      setSelectedFilePath(filePath);

      // Extract filename from path
      const fileName = filePath.split("/").pop() || filePath;
      setSelectedFileName(fileName);

      // Load file content via IPC
      try {
        const response = await window.electronAPI.file.read({
          filePath: filePath,
        });
        if (response.success && response.data) {
          setEditorContent(response.data.content);
          markAsSaved(); // Reset unsaved state when loading new file
        }
      } catch (err) {
        console.error("Failed to load file:", err);
      }
    },
    [setEditorContent, markAsSaved],
  );

  const handleAddFolder = useCallback(async () => {
    await addFolder();
  }, [addFolder]);

  const handleRemoveFolder = useCallback(
    (folderId: FolderId) => {
      removeFolder(folderId);
    },
    [removeFolder],
  );

  const handleToggleFolderExpansion = useCallback(
    (folderId: FolderId) => {
      toggleFolderExpansion(folderId);
    },
    [toggleFolderExpansion],
  );

  const handleToggleSubfolder = useCallback(
    (folderId: FolderId, subfolderPath: string) => {
      toggleSubfolder(folderId, subfolderPath);
    },
    [toggleSubfolder],
  );

  if (workspaceError) {
    return <ErrorDisplay message={workspaceError} className={className} />;
  }

  const isDirty = hasUnsavedChanges;
  const isLoading = workspaceIsLoading || isSaving;

  return (
    <div className={clsx("flex h-full", className)} data-testid="editor-view">
      {/* Workspace Sidebar */}
      <WorkspaceSidebar
        workspace={workspace}
        folderFileTrees={folderFileTrees}
        selectedFile={selectedFilePath}
        unsavedFiles={unsavedFiles}
        onAddFolder={handleAddFolder}
        onRemoveFolder={handleRemoveFolder}
        onToggleFolderExpansion={handleToggleFolderExpansion}
        onToggleSubfolder={handleToggleSubfolder}
        onSelectFile={handleFileSelect}
        isLoading={workspaceIsLoading}
        error={workspaceError}
        className="w-64 border-r border-white/10 flex-shrink-0"
      />

      {/* Editor Main Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-white truncate">
              {selectedFileName || "ファイルを選択してください"}
            </h1>
            {isDirty && (
              <span
                className="text-xs text-amber-400"
                aria-label="未保存の変更あり"
              >
                •
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!selectedFilePath || !isDirty || isLoading}
              aria-label="保存"
            >
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </header>

        {/* Editor Content */}
        <div className="flex-1 p-4 overflow-hidden">
          {selectedFilePath ? (
            <GlassPanel className="h-full">
              <TextArea
                value={editorContent}
                onChange={handleContentChange}
                placeholder="ここに内容を入力..."
                disabled={isLoading}
                className="h-full font-mono text-sm resize-none"
                aria-label={`${selectedFileName}の編集`}
              />
            </GlassPanel>
          ) : (
            <EmptyState title="左側のワークスペースからファイルを選択してください" />
          )}
        </div>
      </main>
    </div>
  );
};

EditorView.displayName = "EditorView";
