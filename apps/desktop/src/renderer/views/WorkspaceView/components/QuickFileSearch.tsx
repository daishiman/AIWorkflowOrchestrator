import { useEffect, useMemo, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { QuickFileSearchResult } from "../hooks/useQuickFileSearch";

export interface QuickFileSearchProps {
  isOpen: boolean;
  query: string;
  results: QuickFileSearchResult[];
  selectedIndex: number;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onHighlight: (index: number) => void;
  onSubmit: (index: number) => void;
  onKeyDown: (event: KeyboardEvent | ReactKeyboardEvent) => void;
}

export function QuickFileSearch({
  isOpen,
  query,
  results,
  selectedIndex,
  onClose,
  onQueryChange,
  onHighlight,
  onSubmit,
  onKeyDown,
}: QuickFileSearchProps): JSX.Element | null {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();
  }, [isOpen]);

  const resultCountLabel = useMemo(() => {
    if (!query.trim()) {
      return "検索語を入力してください";
    }

    return `${results.length} 件ヒット`;
  }, [query, results.length]);

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Tab" && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled])",
      );

      if (focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    onKeyDown(event);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/35 px-4 pt-[10vh]"
      data-testid="quick-file-search-overlay"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-[480px] rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        role="dialog"
        aria-modal="true"
        aria-label="ファイルをすばやく探す"
        data-testid="quick-file-search-dialog"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="border-b border-[var(--border-subtle)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            ファイルをすばやく探す
          </p>
          <p
            className="sr-only"
            aria-live="polite"
            data-testid="quick-search-live-region"
          >
            {resultCountLabel}
          </p>
        </div>

        <div className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
            placeholder="ファイル名またはパスで検索"
            data-testid="quick-file-search-input"
          />

          <ul
            className="mt-3 max-h-72 overflow-auto rounded-xl border border-[var(--border-subtle)]"
            role="listbox"
            aria-label="検索結果"
            data-testid="quick-file-search-results"
          >
            {results.length === 0 ? (
              <li className="px-3 py-4 text-sm text-[var(--text-secondary)]">
                {query.trim()
                  ? "一致するファイルは見つかりませんでした。"
                  : "検索語を入力してください。"}
              </li>
            ) : (
              results.map((result, index) => (
                <li key={result.path}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === selectedIndex}
                    className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition-colors ${
                      index === selectedIndex
                        ? "bg-[var(--status-primary)] text-white"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                    }`}
                    data-testid={`quick-file-search-item-${index}`}
                    onMouseEnter={() => onHighlight(index)}
                    onClick={() => onSubmit(index)}
                  >
                    <span className="truncate font-medium">
                      {result.fileName}
                    </span>
                    <span className="truncate text-xs opacity-75">
                      {result.relativePath || "/"}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
