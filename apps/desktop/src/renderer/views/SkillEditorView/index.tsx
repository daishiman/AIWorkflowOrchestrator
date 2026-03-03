/**
 * SkillEditorView - スキルエディタービュー（organism）
 *
 * UT-UI-05A-IMPLEMENTATION-CLOSURE-001: 7機能統合
 * - UT-UI-05A-001: FileTree キーボードナビゲーション
 * - UT-UI-05A-002: モバイルドロワー
 * - UT-UI-05A-003: Cmd/Ctrl+S 保存ショートカット
 * - UT-UI-05A-004: 保存成功 Toast
 * - UT-UI-05A-005: 読み取り専用表示強化
 * - UT-UI-05A-006: ナビゲーション導線配線
 * - UT-UI-05A-007: マイクロアニメーション
 *
 * @module SkillEditorView
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { FileTreePanel } from "./components/FileTreePanel/FileTreePanel";
import { EditorPanel } from "./components/EditorPanel/EditorPanel";
import { EditorToolBar } from "./components/EditorToolBar";
import { UnsavedChangesDialog } from "./components/UnsavedChangesDialog";
import { ReadOnlyBanner } from "./components/ReadOnlyBanner";
import { MobileDrawer } from "./components/MobileDrawer";
import { Toast } from "./components/Toast";
import { useSkillEditor } from "./hooks/useSkillEditor";
import { useFileTree } from "./hooks/useFileTree";
import { useUnsavedWarning } from "./hooks/useUnsavedWarning";
import { useToast } from "./hooks/useToast";
import { isPlatformSaveKey } from "./utils/keyboardUtils";

/** レスポンシブブレークポイント: 768px 未満でモバイルモード */
const MOBILE_BREAKPOINT = "(max-width: 767px)";

/**
 * useMediaQuery - メディアクエリ監視フック
 * UT-UI-05A-002
 */
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
};

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

  // UT-UI-05A-004: Toast 通知
  const { toasts, showToast, dismissToast } = useToast();

  const [isSaving, setIsSaving] = useState(false);

  // UT-UI-05A-006: 閉じる操作の未保存変更インターセプト
  const [isPendingClose, setIsPendingClose] = useState(false);

  // UT-UI-05A-002: モバイルドロワー状態
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // M-006: モバイル→デスクトップ切り替え時にドロワー状態をリセット
  useEffect(() => {
    if (!isMobile) {
      setIsDrawerOpen(false);
    }
  }, [isMobile]);

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
      // UT-UI-05A-002: ファイル選択後にドロワーを閉じる
      setIsDrawerOpen(false);
    },
    [hasChanges, requestNavigation, treeSelectFile, loadFile],
  );

  const handleSave = useCallback(async () => {
    if (isSaving) return; // 重複実行防止（UT-UI-05A-003）
    setIsSaving(true);
    try {
      await saveFile();
      // UT-UI-05A-004: 保存成功 Toast
      showToast({ type: "success", message: "保存しました" });
    } catch {
      showToast({ type: "error", message: "保存に失敗しました" });
    } finally {
      setIsSaving(false);
    }
  }, [saveFile, isSaving, showToast]);

  // UT-UI-05A-003: Cmd/Ctrl+S ショートカット（P5 対策: cleanup でリスナー解除）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlatformSaveKey(e)) return;
      e.preventDefault();
      if (isReadOnly || isSaving || !currentPath) return;
      void handleSave();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isReadOnly, isSaving, currentPath, handleSave]);

  // UT-UI-05A-006: 閉じるボタンの未保存変更インターセプト
  const handleClose = useCallback(() => {
    if (hasChanges) {
      setIsPendingClose(true);
      requestNavigation("__close__");
      return;
    }
    onClose();
  }, [hasChanges, onClose, requestNavigation]);

  const handleDialogSave = useCallback(async () => {
    if (isPendingClose) {
      await saveFile();
      setIsPendingClose(false);
      cancelNavigation();
      onClose();
    } else {
      confirmSave();
      if (pendingPath) {
        treeSelectFile(pendingPath);
        await loadFile(pendingPath);
      }
    }
  }, [
    isPendingClose,
    confirmSave,
    saveFile,
    pendingPath,
    onClose,
    treeSelectFile,
    loadFile,
    cancelNavigation,
  ]);

  const handleDialogDiscard = useCallback(() => {
    if (isPendingClose) {
      setIsPendingClose(false);
      cancelNavigation();
      onClose();
    } else {
      confirmDiscard();
      if (pendingPath) {
        treeSelectFile(pendingPath);
        void loadFile(pendingPath);
      }
    }
  }, [
    isPendingClose,
    confirmDiscard,
    pendingPath,
    onClose,
    treeSelectFile,
    loadFile,
    cancelNavigation,
  ]);

  const handleDialogCancel = useCallback(() => {
    setIsPendingClose(false);
    cancelNavigation();
  }, [cancelNavigation]);

  const error = editorError || treeError;

  // ファイルツリーパネル（デスクトップ/モバイル共用）
  const fileTreeContent = (
    <FileTreePanel
      fileTree={fileTree}
      selectedFile={selectedFile}
      unsavedFiles={unsavedFiles}
      onSelectFile={handleSelectFile}
    />
  );

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Left pane - File Tree */}
      {isMobile ? (
        <>
          {/* UT-UI-05A-002: モバイルドロワー */}
          <MobileDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          >
            {fileTreeContent}
          </MobileDrawer>
        </>
      ) : (
        fileTreeContent
      )}

      {/* Right pane - Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center">
          {/* UT-UI-05A-002: ハンバーガーメニュー（モバイルのみ） */}
          {isMobile && (
            <button
              type="button"
              aria-label="ナビゲーション開く"
              aria-expanded={isDrawerOpen}
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 ml-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors duration-150 motion-reduce:transition-none"
            >
              <Menu size={20} className="text-[var(--text-secondary)]" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <EditorToolBar
              selectedFile={currentPath}
              hasChanges={hasChanges}
              isSaving={isSaving}
              isReadOnly={isReadOnly}
              onSave={handleSave}
              onClose={handleClose}
              onOpenBackups={() => {}}
            />
          </div>
        </div>

        {/* UT-UI-05A-005: 読み取り専用バナー */}
        <ReadOnlyBanner isReadOnly={isReadOnly} />

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
        onCancel={handleDialogCancel}
      />

      {/* UT-UI-05A-004: Toast コンテナ */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              message={toast.message}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

SkillEditorView.displayName = "SkillEditorView";

export default SkillEditorView;
