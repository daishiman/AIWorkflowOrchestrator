import { useMemo } from "react";

export interface SourceViewProps {
  filePath: string;
  content: string;
  language: string;
  isWrap: boolean;
  onOpenEditor: () => void;
}

export function SourceView({
  filePath,
  content,
  language,
  isWrap,
  onOpenEditor,
}: SourceViewProps): JSX.Element {
  const lines = useMemo(() => content.split("\n"), [content]);

  return (
    <section
      className="h-full min-h-0 overflow-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]"
      aria-label="コード表示"
      data-testid="source-view"
      onDoubleClick={onOpenEditor}
    >
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-2">
        <p
          className="truncate text-sm font-medium text-[var(--text-primary)]"
          title={filePath}
        >
          {filePath.split("/").pop()}
        </p>
        <span className="rounded-full border border-[var(--border-subtle)] px-2 py-1 text-xs text-[var(--text-secondary)]">
          {language}
        </span>
      </header>

      <div
        className="min-h-0 overflow-auto px-3 py-3"
        role="textbox"
        aria-readonly="true"
        data-testid="source-readonly"
      >
        <pre
          className={`m-0 text-xs leading-6 text-[var(--text-primary)] ${
            isWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
          }`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {lines.map((line, index) => (
            <div key={`${index}-${line}`} className="flex">
              <span
                className="mr-3 shrink-0 select-none text-right text-[var(--text-muted)]"
                style={{ width: "40px" }}
                data-testid="source-line-number"
              >
                {index + 1}
              </span>
              <code>{line || " "}</code>
            </div>
          ))}
        </pre>
      </div>
    </section>
  );
}
