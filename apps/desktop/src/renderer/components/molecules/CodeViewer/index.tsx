import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Check, Copy } from "lucide-react";

export interface CodeViewerProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  filePath?: string;
  showCopyButton?: boolean;
  className?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language,
  showLineNumbers = true,
  maxHeight = "400px",
  filePath,
  showCopyButton = true,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const copiedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const lines = useMemo(() => code.split("\n"), [code]);
  const fileName = useMemo(() => {
    if (!filePath) {
      return "";
    }
    return filePath.split(/[\\/]/).pop() ?? filePath;
  }, [filePath]);

  useEffect(() => {
    return () => {
      if (copiedResetTimerRef.current) {
        clearTimeout(copiedResetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is not available");
      }

      await navigator.clipboard.writeText(code);
      setCopied(true);

      if (copiedResetTimerRef.current) {
        clearTimeout(copiedResetTimerRef.current);
      }

      copiedResetTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code", error);
    }
  };

  const copyButton = showCopyButton ? (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "コピー完了" : "コードをコピー"}
      className={clsx(
        "inline-flex h-8 w-8 items-center justify-center rounded-md",
        "text-[var(--text-secondary)] transition-colors",
        "hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]",
        "focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--status-primary)]",
      )}
    >
      {copied ? (
        <Check
          size={16}
          aria-hidden="true"
          className="text-[var(--status-success)]"
        />
      ) : (
        <Copy size={16} aria-hidden="true" />
      )}
    </button>
  ) : null;

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-tertiary)]",
        className,
      )}
    >
      {filePath && (
        <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {fileName}
            </p>
            {language && (
              <p className="text-xs text-[var(--text-secondary)]">{language}</p>
            )}
          </div>
          {copyButton}
        </div>
      )}

      {!filePath && showCopyButton && (
        <div className="absolute right-2 top-2 z-10">{copyButton}</div>
      )}

      <div
        data-testid="code-viewer-scroll"
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <pre
          aria-label="コード表示"
          className="m-0 p-4 text-sm leading-6 text-[var(--text-primary)]"
        >
          {showLineNumbers ? (
            lines.map((line, index) => (
              <div key={`line-${index + 1}`} className="flex">
                <span
                  data-testid={`line-number-${index + 1}`}
                  aria-hidden="true"
                  className="mr-4 w-8 select-none text-right text-[var(--text-muted)]"
                >
                  {index + 1}
                </span>
                <code className="flex-1 whitespace-pre font-mono">
                  {line.length > 0 ? line : " "}
                </code>
              </div>
            ))
          ) : (
            <code className="whitespace-pre font-mono">{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
};

CodeViewer.displayName = "CodeViewer";
