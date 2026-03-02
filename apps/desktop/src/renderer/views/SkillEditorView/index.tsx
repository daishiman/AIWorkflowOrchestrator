import React, { useCallback, useMemo, useState } from "react";
import { FileTreePanel } from "./components/FileTreePanel/FileTreePanel";
import { EditorPanel } from "./components/EditorPanel/EditorPanel";
import { EditorToolBar } from "./components/EditorToolBar";
import { UnsavedChangesDialog } from "./components/UnsavedChangesDialog";
import { useSkillEditor } from "./hooks/useSkillEditor";
import { useFileTree } from "./hooks/useFileTree";
import { useUnsavedWarning } from "./hooks/useUnsavedWarning";

export interface SkillEditorViewProps {
  skillName: string;
  isReadOnly?: boolean;
  onClose: () => void;
}

export const SkillEditorView: React.FC<SkillEditorViewProps> = ({
  skillName,
  isReadOnly = false,
  onClose,
}) => {
  const {
    content,
    isLoading: isEditorLoading,
    hasChanges,
    error: editorError,
    currentPath,
    language,
    loadFile,
    saveFile,
    updateContent,
  } = useSkillEditor(skillName, isReadOnly);

  const {
    fileTree,
    selectedFile,
    error: treeError,
    selectFile: treeSelectFile,
  } = useFileTree(skillName);

  const {
    isDialogOpen,
    pendingPath,
    requestNavigation,
    confirmSave,
    confirmDiscard,
    cancelNavigation,
  } = useUnsavedWarning(hasChanges, saveFile);

  const [isSaving, setIsSaving] = useState(false);

  const unsavedFiles = useMemo(
    () =>
      hasChanges && currentPath ? new Set([currentPath]) : new Set<string>(),
    [hasChanges, currentPath],
  );

  const handleSelectFile = useCallback(
    (path: string) => {
      if (hasChanges) {
        const canNavigate = requestNavigation(path);
        if (!canNavigate) return;
      }
      treeSelectFile(path);
      void loadFile(path);
    },
    [hasChanges, requestNavigation, treeSelectFile, loadFile],
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveFile();
    } finally {
      setIsSaving(false);
    }
  }, [saveFile]);

  const handleDialogSave = useCallback(async () => {
    confirmSave();
    if (pendingPath) {
      treeSelectFile(pendingPath);
      await loadFile(pendingPath);
    }
  }, [confirmSave, pendingPath, treeSelectFile, loadFile]);

  const handleDialogDiscard = useCallback(() => {
    confirmDiscard();
    if (pendingPath) {
      treeSelectFile(pendingPath);
      void loadFile(pendingPath);
    }
  }, [confirmDiscard, pendingPath, treeSelectFile, loadFile]);

  const error = editorError || treeError;

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Left pane - File Tree */}
      <FileTreePanel
        fileTree={fileTree}
        selectedFile={selectedFile}
        unsavedFiles={unsavedFiles}
        onSelectFile={handleSelectFile}
      />

      {/* Right pane - Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <EditorToolBar
          selectedFile={currentPath}
          hasChanges={hasChanges}
          isSaving={isSaving}
          isReadOnly={isReadOnly}
          onSave={handleSave}
          onClose={onClose}
          onOpenBackups={() => {}}
        />

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="px-3 py-2 text-sm bg-[var(--status-error)] bg-opacity-10 text-[var(--status-error)] border-b border-[var(--border-default)]"
          >
            {error}
          </div>
        )}

        {/* Editor */}
        <EditorPanel
          content={content}
          language={language}
          isLoading={isEditorLoading}
          isReadOnly={isReadOnly}
          onChange={updateContent}
        />
      </div>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={isDialogOpen}
        fileName={currentPath}
        onSaveAndContinue={handleDialogSave}
        onDiscardAndContinue={handleDialogDiscard}
        onCancel={cancelNavigation}
      />
    </div>
  );
};

SkillEditorView.displayName = "SkillEditorView";

export default SkillEditorView;
