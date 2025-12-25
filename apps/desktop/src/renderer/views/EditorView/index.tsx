import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import clsx from "clsx";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { WorkspaceSidebar } from "../../components/organisms/WorkspaceSidebar";
import type { SearchMatch } from "../../components/organisms/SearchPanel/FileSearchPanel";
import {
  UnifiedSearchPanel,
  type SearchMode,
  type UnifiedSearchPanelRef,
} from "../../components/organisms/SearchPanel/UnifiedSearchPanel";
import type { SearchResultItemProps } from "../../components/organisms/WorkspaceSearch/WorkspaceSearchPanel";
import { FileSelectorTrigger } from "../../components/organisms/FileSelectorTrigger";
import {
  FileSelectorModal,
  useFileSelectorModal,
} from "../../components/organisms/FileSelectorModal";
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
import type { SelectedFile } from "@repo/shared/types";
import type { FolderId } from "../../store/types/workspace";
import type { FileNode } from "../../store/types";

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

  // Search panel state
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("file");
  const [showReplace, setShowReplace] = useState(false);
  const [_currentMatch, setCurrentMatch] = useState<SearchMatch | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const searchPanelRef = useRef<UnifiedSearchPanelRef>(null);

  // File selector modal state
  const {
    isOpen: isFileSelectorOpen,
    openModal: openFileSelector,
    closeModal: closeFileSelector,
    confirmSelection,
  } = useFileSelectorModal();

  // Collect all file paths from file trees
  const allFilePaths = useMemo(() => {
    const paths: string[] = [];

    const collectPaths = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (node.type === "file") {
          paths.push(node.path);
        } else if (node.children) {
          collectPaths(node.children);
        }
      }
    };

    for (const fileTree of folderFileTrees.values()) {
      collectPaths(fileTree);
    }

    return paths;
  }, [folderFileTrees]);

  // Get first workspace folder path
  const workspacePath = useMemo(() => {
    if (workspace.folders.length > 0) {
      return workspace.folders[0].path;
    }
    return null;
  }, [workspace.folders]);

  // Load workspace on mount
  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  // Keyboard shortcut handler for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+F (Mac) or Ctrl+F (Windows/Linux) to open file search
      if ((e.metaKey || e.ctrlKey) && e.key === "f" && !e.shiftKey) {
        e.preventDefault();
        // ファイルが選択されている場合はfileモード、なければworkspaceモード
        setSearchMode(selectedFilePath ? "file" : "workspace");
        setShowReplace(false);
        setIsSearchPanelOpen(true);
      }
      // Cmd+T (Mac) or Ctrl+T (Windows/Linux) to open file replace
      if ((e.metaKey || e.ctrlKey) && e.key === "t" && !e.shiftKey) {
        e.preventDefault();
        // ファイルが選択されている場合はfileモード、なければworkspaceモード
        setSearchMode(selectedFilePath ? "file" : "workspace");
        setShowReplace(true);
        setIsSearchPanelOpen(true);
      }
      // Cmd+Shift+F (Mac) or Ctrl+Shift+F (Windows/Linux) to open workspace search
      if ((e.metaKey || e.ctrlKey) && e.key === "f" && e.shiftKey) {
        e.preventDefault();
        setSearchMode("workspace");
        setShowReplace(false);
        setIsSearchPanelOpen(true);
      }
      // Cmd+Shift+T (Mac) or Ctrl+Shift+T (Windows/Linux) to open workspace replace
      if ((e.metaKey || e.ctrlKey) && e.key === "t" && e.shiftKey) {
        e.preventDefault();
        setSearchMode("workspace");
        setShowReplace(true);
        setIsSearchPanelOpen(true);
      }
      // Cmd+P (Mac) or Ctrl+P (Windows/Linux) to open file name search
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setSearchMode("filename");
        setShowReplace(false);
        setIsSearchPanelOpen(true);
      }
      // F3 to go to next match, Shift+F3 to go to previous
      if (e.key === "F3" && isSearchPanelOpen && searchMode === "file") {
        e.preventDefault();
        if (e.shiftKey) {
          searchPanelRef.current?.goToPrev();
        } else {
          searchPanelRef.current?.goToNext();
        }
      }
      // Cmd+N / Ctrl+N to go to next match (Vim-style)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "n" &&
        isSearchPanelOpen &&
        searchMode === "file"
      ) {
        e.preventDefault();
        if (e.shiftKey) {
          searchPanelRef.current?.goToPrev();
        } else {
          searchPanelRef.current?.goToNext();
        }
      }
      // Escape to close search
      if (e.key === "Escape" && isSearchPanelOpen) {
        setIsSearchPanelOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchPanelOpen, searchMode, selectedFilePath]);

  // Handle search navigation (scroll to match position and highlight)
  const handleSearchNavigate = useCallback(
    (match: SearchMatch) => {
      setCurrentMatch(match);

      if (!textAreaRef.current) return;

      const textarea = textAreaRef.current;
      const lines = editorContent.split("\n");

      // Calculate character position from line/column (1-indexed)
      let charPosition = 0;
      for (let i = 0; i < match.line - 1 && i < lines.length; i++) {
        charPosition += lines[i].length + 1; // +1 for newline
      }
      charPosition += match.column - 1;

      // Select the matched text
      const startPos = charPosition;
      const endPos = charPosition + match.length;

      // Focus and select to show highlight
      textarea.focus();
      textarea.setSelectionRange(startPos, endPos);

      // Scroll to make the selection visible
      const lineHeight = 20; // Approximate line height in pixels
      const scrollTop = (match.line - 3) * lineHeight; // Scroll to 3 lines above the match
      textarea.scrollTop = Math.max(0, scrollTop);
    },
    [editorContent],
  );

  // Handle search panel close
  const handleSearchClose = useCallback(() => {
    setIsSearchPanelOpen(false);
  }, []);

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

  // Handle workspace search result click
  const handleWorkspaceResultClick = useCallback(
    async (result: SearchResultItemProps) => {
      // Close search panel first
      setIsSearchPanelOpen(false);

      // Open the file
      await handleFileSelect(result.filePath);

      // After file loads, navigate to the match position
      setTimeout(() => {
        if (textAreaRef.current) {
          const textarea = textAreaRef.current;

          // We need to wait for content to be loaded
          // Use the result's line/column to calculate position
          const lines = textarea.value.split("\n");
          let charPosition = 0;
          for (let i = 0; i < result.lineNumber - 1 && i < lines.length; i++) {
            charPosition += lines[i].length + 1;
          }
          charPosition += result.column - 1;

          textarea.focus();
          textarea.setSelectionRange(
            charPosition,
            charPosition + result.matchLength,
          );

          const lineHeight = 20;
          const scrollTop = (result.lineNumber - 3) * lineHeight;
          textarea.scrollTop = Math.max(0, scrollTop);
        }
      }, 100);
    },
    [handleFileSelect],
  );

  // Handle file name selection
  const handleFileNameSelect = useCallback(
    async (filePath: string) => {
      await handleFileSelect(filePath);
      setIsSearchPanelOpen(false);
    },
    [handleFileSelect],
  );

  // Handle file selector confirmation
  const handleFileSelectorConfirm = useCallback(
    (files: SelectedFile[]) => {
      // Open the first selected file in the editor
      if (files.length > 0) {
        handleFileSelect(files[0].path);
      }
    },
    [handleFileSelect],
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
            {/* File Selector Button */}
            <FileSelectorTrigger
              onClick={openFileSelector}
              variant="compact"
              size="sm"
              label="ファイルを追加"
              data-testid="file-selector-trigger"
            />
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchMode("file");
                setShowReplace(false);
                setIsSearchPanelOpen(!isSearchPanelOpen);
              }}
              aria-label="検索 (⌘F)"
              title="検索 (⌘F / ⌘⇧F / ⌘P)"
            >
              🔍
            </Button>
            {/* Save Button */}
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

        {/* Search Panel */}
        {isSearchPanelOpen && (
          <div className="border-b border-white/10">
            <UnifiedSearchPanel
              ref={searchPanelRef}
              currentFilePath={selectedFilePath}
              workspacePath={workspacePath}
              allFilePaths={allFilePaths}
              onFileSearchNavigate={handleSearchNavigate}
              onWorkspaceResultClick={handleWorkspaceResultClick}
              onFileNameSelect={handleFileNameSelect}
              onClose={handleSearchClose}
              onContentUpdated={setEditorContent}
              initialMode={searchMode}
              showReplace={showReplace}
              className="bg-[var(--bg-secondary)]"
            />
          </div>
        )}

        {/* Editor Content */}
        <div className="flex-1 p-4 overflow-hidden">
          {selectedFilePath ? (
            <GlassPanel className="h-full">
              <TextArea
                ref={textAreaRef}
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

      {/* File Selector Modal */}
      <FileSelectorModal
        open={isFileSelectorOpen}
        onClose={closeFileSelector}
        onConfirm={(files) => {
          confirmSelection();
          handleFileSelectorConfirm(files);
        }}
        title="ファイルを選択"
        data-testid="file-selector-modal"
      />
    </div>
  );
};

EditorView.displayName = "EditorView";
