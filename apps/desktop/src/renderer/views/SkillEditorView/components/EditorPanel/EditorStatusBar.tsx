/**
 * EditorStatusBar - エディターステータスバー（atom）
 *
 * 行数・文字数・言語を表示するステータスバー。
 *
 * @module SkillEditorView/components/EditorPanel/EditorStatusBar
 */

export interface EditorStatusBarProps {
  lineCount: number;
  charCount: number;
  language: string;
}

/**
 * 言語名を先頭大文字に変換する
 */
const capitalizeLanguage = (lang: string): string => {
  if (!lang) return "";
  return lang.charAt(0).toUpperCase() + lang.slice(1);
};

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  lineCount,
  charCount,
  language,
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1 text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border-t border-[var(--border-default)]">
      <span>{lineCount} 行</span>
      <span>|</span>
      <span>{charCount} 文字</span>
      <span>|</span>
      <span>{capitalizeLanguage(language)}</span>
    </div>
  );
};

EditorStatusBar.displayName = "EditorStatusBar";
