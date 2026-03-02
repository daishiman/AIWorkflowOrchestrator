/**
 * EditorPanel - コードエディターパネル（molecule）
 *
 * テキストエリアベースのコードエディター。ローディング状態、
 * 読み取り専用モード、ステータスバーを統合する。
 *
 * @module SkillEditorView/components/EditorPanel/EditorPanel
 */

import { useCallback, useMemo } from "react";
import { Loader } from "lucide-react";
import { EditorStatusBar } from "./EditorStatusBar";

export interface EditorPanelProps {
  content: string;
  language: string;
  isLoading: boolean;
  isReadOnly: boolean;
  onChange: (value: string) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  content,
  language,
  isLoading,
  isReadOnly,
  onChange,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const lineCount = useMemo(() => {
    if (!content) return 0;
    return content.split("\n").length;
  }, [content]);

  const charCount = useMemo(() => content.length, [content]);

  const isEmptyAndNoContent = content === "" && !isLoading;

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <div
          className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]"
          data-testid="editor-loading"
        >
          <Loader
            size={24}
            className="animate-spin text-[var(--text-secondary)]"
          />
        </div>
        <EditorStatusBar lineCount={0} charCount={0} language={language} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 relative min-h-0">
        {/* プレースホルダー */}
        {isEmptyAndNoContent && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--text-secondary)] pointer-events-none">
            ファイルを選択してください
          </div>
        )}

        {/* テキストエリア */}
        <textarea
          className="w-full h-full resize-none p-4 font-mono text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] outline-none"
          value={content}
          onChange={handleChange}
          readOnly={isReadOnly}
          spellCheck={false}
        />
      </div>

      {/* ステータスバー */}
      <EditorStatusBar
        lineCount={lineCount}
        charCount={charCount}
        language={language}
      />
    </div>
  );
};

EditorPanel.displayName = "EditorPanel";
