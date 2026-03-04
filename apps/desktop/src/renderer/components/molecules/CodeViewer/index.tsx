import React, { memo, useState } from "react";
import clsx from "clsx";
import { Check, Copy } from "lucide-react";

export interface CodeViewerProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  filePath?: string;
  showCopyButton?: boolean;
}

const resetDelayMs = 2000;

function extractFileName(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const segments = normalized.split("/");
  return segments[segments.length - 1] || path;
}

const CodeViewerComponent: React.FC<CodeViewerProps> = ({
  code,
  language = "text",
  showLineNumbers = false,
  maxHeight = "360px",
  filePath,
  showCopyButton = true,
}) => {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");
  const fileName = filePath ? extractFileName(filePath) : null;

  const handleCopy = async (): Promise<void> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelayMs);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
      aria-label="コード表示"
    >
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {fileName ? (
            <span
              className="truncate text-sm text-[var(--text-primary)]"
              title={filePath}
            >
              {fileName}
              {filePath !== fileName && (
                <span className="sr-only">{filePath}</span>
              )}
            </span>
          ) : (
            <span className="text-sm text-[var(--text-secondary)]">コード</span>
          )}
          <span className="text-xs uppercase text-[var(--text-muted)]">
            {language}
          </span>
        </div>
        {showCopyButton && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "コピー完了" : "コードをコピー"}
            className={clsx(
              "inline-flex items-center gap-1 rounded px-2 py-1 text-xs",
              "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
              "transition-colors duration-[var(--duration-fast)]",
            )}
          >
            {copied ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <Copy size={14} aria-hidden="true" />
            )}
            <span>{copied ? "コピー完了" : "コピー"}</span>
            {copied && <span className="sr-only">コピー済み</span>}
          </button>
        )}
      </header>

      <div
        style={{ maxHeight }}
        className="overflow-auto"
        data-testid="code-viewer-scroll"
      >
        <pre
          className="m-0 p-3 text-sm leading-6"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {lines.map((line, index) => (
            <div key={`${index}-${line}`} className="flex">
              {showLineNumbers && (
                <span
                  className="mr-3 w-8 select-none text-right text-[var(--text-muted)]"
                  data-testid={`line-number-${index + 1}`}
                >
                  {index + 1}
                </span>
              )}
              <code className="text-[var(--text-primary)]">{line || " "}</code>
            </div>
          ))}
        </pre>
      </div>
    </section>
  );
};

export const CodeViewer = memo(CodeViewerComponent);
CodeViewer.displayName = "CodeViewer";
