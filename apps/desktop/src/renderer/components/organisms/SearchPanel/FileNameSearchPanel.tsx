/**
 * FileNameSearchPanel - ファイル名検索パネル
 *
 * ワークスペース内のファイル名を検索するコンポーネント。
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";

export interface FileNameMatch {
  filePath: string;
  fileName: string;
}

export interface FileNameSearchPanelProps {
  /** 検索対象のファイルパス一覧 */
  files: string[];
  /** ファイル選択時のコールバック */
  onSelectFile?: (filePath: string) => void;
  /** パネルを閉じるコールバック */
  onClose?: () => void;
  /** カスタムクラス名 */
  className?: string;
}

const DEBOUNCE_MS = 150;

export const FileNameSearchPanel: React.FC<FileNameSearchPanelProps> = ({
  files,
  onSelectFile,
  onClose,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<FileNameMatch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Execute search
  const executeSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery) {
        setMatches([]);
        setSelectedIndex(0);
        setHasSearched(false);
        return;
      }

      setHasSearched(true);
      const lowerQuery = searchQuery.toLowerCase();

      const results: FileNameMatch[] = files
        .filter((filePath) => {
          const fileName = filePath.split("/").pop() || filePath;
          return fileName.toLowerCase().includes(lowerQuery);
        })
        .map((filePath) => ({
          filePath,
          fileName: filePath.split("/").pop() || filePath,
        }))
        .slice(0, 50); // Limit results

      setMatches(results);
      setSelectedIndex(0);
    },
    [files],
  );

  // Handle query change with debounce
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        executeSearch(newQuery);
      }, DEBOUNCE_MS);
    },
    [executeSearch],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, matches.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (matches.length > 0 && onSelectFile) {
          onSelectFile(matches[selectedIndex].filePath);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    },
    [matches, onClose, onSelectFile, selectedIndex],
  );

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Scroll selected item into view (only scroll the list, not the whole panel)
  useEffect(() => {
    if (listRef.current && matches.length > 0) {
      const list = listRef.current;
      const selectedElement = list.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        const listRect = list.getBoundingClientRect();
        const itemRect = selectedElement.getBoundingClientRect();

        // If item is below visible area
        if (itemRect.bottom > listRect.bottom) {
          list.scrollTop += itemRect.bottom - listRect.bottom;
        }
        // If item is above visible area
        else if (itemRect.top < listRect.top) {
          list.scrollTop -= listRect.top - itemRect.top;
        }
      }
    }
  }, [selectedIndex, matches.length]);

  const hasResults = matches.length > 0;

  return (
    <div
      className={clsx("flex flex-col bg-slate-800", className)}
      data-testid="file-name-search-panel"
    >
      {/* Search Input */}
      <div
        className={clsx(
          "flex items-center gap-2 px-4 h-12",
          "border-b border-slate-700",
        )}
        onKeyDown={handleKeyDown}
      >
        <Icon name="file" size={18} className="text-slate-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="ファイル名を検索 / Search file name"
          aria-label="ファイル名検索"
          className={clsx(
            "flex-1 min-w-0 px-3 py-1.5 h-8",
            "bg-slate-900 rounded-md",
            "text-sm text-white placeholder-slate-400",
            "border border-slate-600 transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
          )}
        />
        <span className="text-xs text-slate-400 tabular-nums min-w-[60px] text-center">
          {hasSearched ? `${matches.length} 件` : ""}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる / Close"
          className={clsx(
            "w-7 h-7 flex items-center justify-center rounded",
            "text-slate-400 hover:bg-slate-700",
            "transition-colors duration-100",
          )}
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      {/* Results List */}
      {hasSearched && (
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="検索結果"
        >
          {hasResults ? (
            matches.map((match, index) => (
              <button
                key={match.filePath}
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => onSelectFile?.(match.filePath)}
                className={clsx(
                  "w-full text-left px-4 py-2",
                  "flex flex-col gap-0.5",
                  "transition-colors duration-100",
                  index === selectedIndex
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-700 text-slate-300",
                )}
              >
                <span className="text-sm font-medium truncate">
                  {match.fileName}
                </span>
                <span
                  className={clsx(
                    "text-xs truncate",
                    index === selectedIndex
                      ? "text-blue-200"
                      : "text-slate-500",
                  )}
                >
                  {match.filePath}
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              結果なし / No results
            </div>
          )}
        </div>
      )}
    </div>
  );
};

FileNameSearchPanel.displayName = "FileNameSearchPanel";
