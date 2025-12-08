import React, { useState, useCallback } from "react";
import clsx from "clsx";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { FileTreeItem } from "../../components/molecules/FileTreeItem";
import { TextArea } from "../../components/atoms/TextArea";
import { Button } from "../../components/atoms/Button";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";
import { EmptyState } from "../../components/atoms/EmptyState";
import { useAppStore } from "../../store";

export interface EditorViewProps {
  className?: string;
}

export const EditorView: React.FC<EditorViewProps> = ({ className }) => {
  // Use flat store structure
  const fileTree = useAppStore((state) => state.fileTree);
  const selectedFile = useAppStore((state) => state.selectedFile);
  const editorContent = useAppStore((state) => state.editorContent);
  const hasUnsavedChanges = useAppStore((state) => state.hasUnsavedChanges);
  const setSelectedFile = useAppStore((state) => state.setSelectedFile);
  const setEditorContent = useAppStore((state) => state.setEditorContent);
  const markAsSaved = useAppStore((state) => state.markAsSaved);

  // Local state for loading and error
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Map to expected structure
  const files = fileTree.map((node) => ({
    path: node.path,
    name: node.name,
    type: node.type,
  }));

  const currentFile = selectedFile
    ? {
        path: selectedFile.path,
        name: selectedFile.name,
        content: editorContent,
      }
    : null;

  const content = editorContent;
  const isDirty = hasUnsavedChanges;

  const handleContentChange = useCallback(
    (value: string) => {
      setEditorContent(value);
    },
    [setEditorContent],
  );

  const handleSave = useCallback(async () => {
    if (currentFile) {
      // Save logic would go here
      markAsSaved();
    }
  }, [currentFile, markAsSaved]);

  const handleFileSelect = useCallback(
    (path: string) => {
      const file = fileTree.find((f) => f.path === path);
      if (file) {
        setSelectedFile(file);
      }
    },
    [fileTree, setSelectedFile],
  );

  if (error) {
    return <ErrorDisplay message={error} className={className} />;
  }

  return (
    <div className={clsx("flex h-full", className)} data-testid="editor-view">
      {/* File Tree Sidebar */}
      <aside className="w-64 border-r border-white/10 flex-shrink-0">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            ファイル
          </h2>
          {isLoading ? (
            <p className="text-gray-400 text-sm">読み込み中...</p>
          ) : files.length === 0 ? (
            <p className="text-gray-400 text-sm">ファイルがありません</p>
          ) : (
            <nav aria-label="ファイルツリー">
              <ul className="space-y-1" role="tree">
                {files.map(
                  (file: {
                    path: string;
                    name: string;
                    type: "file" | "folder";
                  }) => (
                    <li key={file.path} role="none">
                      <FileTreeItem
                        node={{
                          id: file.path,
                          name: file.name,
                          type: file.type,
                          path: file.path,
                        }}
                        level={0}
                        selected={currentFile?.path === file.path}
                        onClick={() => handleFileSelect(file.path)}
                      />
                    </li>
                  ),
                )}
              </ul>
            </nav>
          )}
        </div>
      </aside>

      {/* Editor Main Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-white truncate">
              {currentFile ? currentFile.name : "ファイルを選択してください"}
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
              disabled={!currentFile || !isDirty || isLoading}
              aria-label="保存"
            >
              保存
            </Button>
          </div>
        </header>

        {/* Editor Content */}
        <div className="flex-1 p-4 overflow-hidden">
          {currentFile ? (
            <GlassPanel className="h-full">
              <TextArea
                value={content}
                onChange={handleContentChange}
                placeholder="ここに内容を入力..."
                disabled={isLoading}
                className="h-full font-mono text-sm resize-none"
                aria-label={`${currentFile.name}の編集`}
              />
            </GlassPanel>
          ) : (
            <EmptyState title="左側のファイルツリーからファイルを選択してください" />
          )}
        </div>
      </main>
    </div>
  );
};

EditorView.displayName = "EditorView";
