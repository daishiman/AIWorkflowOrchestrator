import React from "react";

export interface SkillCodeEditorProps {
  /** エディターに表示するテキスト内容 */
  value: string;
  /** テキスト変更時のコールバック */
  onChange: (value: string) => void;
  /** ファイルの言語（将来のシンタックスハイライト用） */
  language: string;
  /** 読み取り専用モード */
  isReadOnly?: boolean;
}

export function SkillCodeEditor({
  value,
  onChange,
  language,
  isReadOnly = false,
}: SkillCodeEditorProps): JSX.Element {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();

    const textarea = event.currentTarget;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const nextValue =
      value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.selectionStart = selectionStart + 2;
      textarea.selectionEnd = selectionStart + 2;
    });
  };

  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
      readOnly={isReadOnly}
      aria-label="コードエディター"
      aria-multiline="true"
      aria-readonly={isReadOnly}
      role="textbox"
      spellCheck={false}
      data-language={language}
      className="h-full w-full resize-none bg-white p-4 font-mono text-sm text-gray-900 focus:outline-none"
      style={{
        fontFamily:
          "JetBrains Mono, Source Code Pro, Noto Sans Mono, monospace",
      }}
    />
  );
}
