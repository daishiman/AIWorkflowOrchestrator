/**
 * FileSearchPanel - ファイル内検索パネル
 *
 * 単一ファイル内のテキスト検索機能を提供するコンポーネント。
 * キーボードショートカット、検索オプション、ナビゲーション機能を含む。
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import clsx from "clsx";
import { useIpc } from "../../../../hooks/useIpc";
import { Icon } from "../../atoms/Icon";

export interface SearchMatch {
  text: string;
  line: number;
  column: number;
  length: number;
}

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export interface FileSearchPanelProps {
  /** 検索対象ファイルパス */
  filePath: string;
  /** マッチ位置へのナビゲーションコールバック */
  onNavigate?: (match: SearchMatch) => void;
  /** パネルを閉じるコールバック */
  onClose?: () => void;
  /** 置換後にファイル内容を更新するコールバック */
  onContentUpdated?: (newContent: string) => void;
  /** 置換モードの初期状態 */
  initialShowReplace?: boolean;
  /** 置換モード状態変更時のコールバック */
  onReplaceModeChange?: (showReplace: boolean) => void;
  /** カスタムクラス名 */
  className?: string;
}

interface SearchResponse {
  success: boolean;
  data?: {
    matches: SearchMatch[];
    totalCount: number;
  };
  error?: string;
}

interface ReplaceResponse {
  success: boolean;
  data?: {
    newContent?: string;
    replacedCount?: number;
    undoGroupId?: string;
  };
  error?: string;
}

/** Ref type for FileSearchPanel - exposes navigation methods */
export interface FileSearchPanelRef {
  goToNext: () => void;
  goToPrev: () => void;
  focusInput: () => void;
}

const DEBOUNCE_MS = 300;

export const FileSearchPanel = forwardRef<
  FileSearchPanelRef,
  FileSearchPanelProps
>(
  (
    {
      filePath,
      onNavigate,
      onClose,
      onContentUpdated,
      initialShowReplace = false,
      onReplaceModeChange,
      className,
    },
    ref,
  ) => {
    const { invoke } = useIpc();
    const inputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // State
    const [query, setQuery] = useState("");
    const [replaceText, setReplaceText] = useState("");
    const [showReplace, setShowReplace] = useState(initialShowReplace);
    const [options, setOptions] = useState<SearchOptions>({
      caseSensitive: false,
      wholeWord: false,
      useRegex: false,
    });
    const [matches, setMatches] = useState<SearchMatch[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isReplacing, setIsReplacing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Sync showReplace with initialShowReplace prop changes
    useEffect(() => {
      setShowReplace(initialShowReplace);
    }, [initialShowReplace]);

    // Derived state
    const totalCount = matches.length;
    const hasResults = totalCount > 0;
    const currentMatch = hasResults ? matches[currentIndex] : null;

    // Search function
    const executeSearch = useCallback(
      async (searchQuery: string, searchOptions: SearchOptions) => {
        if (!searchQuery) {
          setMatches([]);
          setCurrentIndex(0);
          setError(null);
          setHasSearched(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
          const response = await invoke<SearchResponse>("search:file:execute", {
            filePath,
            query: searchQuery,
            options: searchOptions,
          });

          if (!response.success || !response.data) {
            throw new Error(response.error || "Search failed");
          }

          const resultMatches = response.data.matches;
          setMatches(resultMatches);
          setCurrentIndex(0);

          // Notify about first match
          if (resultMatches.length > 0 && onNavigate) {
            onNavigate(resultMatches[0]);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          if (
            message.includes("regex") ||
            message.includes("regular expression")
          ) {
            setError("無効な正規表現です / Invalid regex");
          } else {
            setError(message);
          }
          setMatches([]);
          setCurrentIndex(0);
        } finally {
          setIsLoading(false);
        }
      },
      [filePath, invoke, onNavigate],
    );

    // Debounced search on query change
    const handleQueryChange = useCallback(
      (newQuery: string) => {
        setQuery(newQuery);

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        if (newQuery) {
          debounceTimerRef.current = setTimeout(() => {
            executeSearch(newQuery, options);
          }, DEBOUNCE_MS);
        } else {
          setMatches([]);
          setCurrentIndex(0);
          setError(null);
          setHasSearched(false);
        }
      },
      [executeSearch, options],
    );

    // Immediate search on Enter or options change
    const handleImmediateSearch = useCallback(() => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (query) {
        executeSearch(query, options);
      }
    }, [executeSearch, options, query]);

    // Option toggle handler
    const handleOptionToggle = useCallback(
      (option: keyof SearchOptions) => {
        setOptions((prev) => {
          const newOptions = { ...prev, [option]: !prev[option] };

          // Re-search with new options if we have a query
          if (query) {
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
              executeSearch(query, newOptions);
            }, 100);
          }

          return newOptions;
        });
      },
      [executeSearch, query],
    );

    // Navigation handlers
    const goToNext = useCallback(() => {
      if (!hasResults) return;

      const nextIndex = (currentIndex + 1) % totalCount;
      setCurrentIndex(nextIndex);

      if (onNavigate) {
        onNavigate(matches[nextIndex]);
      }
    }, [currentIndex, hasResults, matches, onNavigate, totalCount]);

    const goToPrev = useCallback(() => {
      if (!hasResults) return;

      const prevIndex = (currentIndex - 1 + totalCount) % totalCount;
      setCurrentIndex(prevIndex);

      if (onNavigate) {
        onNavigate(matches[prevIndex]);
      }
    }, [currentIndex, hasResults, matches, onNavigate, totalCount]);

    // Replace single match
    const replaceSingle = useCallback(async () => {
      if (!hasResults || !currentMatch) return;

      setIsReplacing(true);
      setError(null);

      try {
        const response = await invoke<ReplaceResponse>("replace:file:single", {
          filePath,
          query,
          replaceString: replaceText,
          match: currentMatch,
          searchOptions: options,
          replaceOptions: { preserveCase: false },
        });

        if (!response.success) {
          throw new Error(response.error || "Replace failed");
        }

        // Update content in editor
        if (response.data?.newContent && onContentUpdated) {
          onContentUpdated(response.data.newContent);
        }

        // Re-search to update matches
        await executeSearch(query, options);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Replace failed");
      } finally {
        setIsReplacing(false);
      }
    }, [
      currentMatch,
      executeSearch,
      filePath,
      hasResults,
      invoke,
      onContentUpdated,
      options,
      query,
      replaceText,
    ]);

    // Replace all matches
    const replaceAll = useCallback(async () => {
      if (!hasResults) return;

      setIsReplacing(true);
      setError(null);

      try {
        const response = await invoke<ReplaceResponse>("replace:file:all", {
          filePath,
          query,
          replaceString: replaceText,
          searchOptions: options,
          replaceOptions: { preserveCase: false },
        });

        if (!response.success) {
          throw new Error(response.error || "Replace all failed");
        }

        // Re-read file content and update editor
        const fileResponse = await invoke<{
          success: boolean;
          data?: { content: string };
        }>("file:read", { filePath });

        if (fileResponse.success && fileResponse.data && onContentUpdated) {
          onContentUpdated(fileResponse.data.content);
        }

        // Re-search to update matches (should be empty after replace all)
        await executeSearch(query, options);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Replace all failed");
      } finally {
        setIsReplacing(false);
      }
    }, [
      executeSearch,
      filePath,
      hasResults,
      invoke,
      onContentUpdated,
      options,
      query,
      replaceText,
    ]);

    // Toggle replace mode
    const toggleReplace = useCallback(() => {
      setShowReplace((prev) => {
        const newValue = !prev;
        onReplaceModeChange?.(newValue);
        return newValue;
      });
    }, [onReplaceModeChange]);

    // Expose navigation methods via ref
    useImperativeHandle(
      ref,
      () => ({
        goToNext,
        goToPrev,
        focusInput: () => inputRef.current?.focus(),
      }),
      [goToNext, goToPrev],
    );

    // Keyboard event handler
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (e.shiftKey) {
            goToPrev();
          } else {
            // First Enter triggers search, subsequent ones navigate
            if (hasSearched && hasResults) {
              goToNext();
            } else {
              handleImmediateSearch();
            }
          }
        }
      },
      [goToNext, goToPrev, handleImmediateSearch, hasResults, hasSearched],
    );

    // Global keyboard shortcuts
    useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        // Cmd+F / Ctrl+F to focus search
        if ((e.metaKey || e.ctrlKey) && e.key === "f") {
          e.preventDefault();
          inputRef.current?.focus();
        }
        // Escape to close panel
        if (e.key === "Escape") {
          e.preventDefault();
          onClose?.();
        }
      };

      window.addEventListener("keydown", handleGlobalKeyDown);
      return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [onClose]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    // Auto-focus input on mount
    useEffect(() => {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }, []);

    // Status message for screen readers (reserved for future accessibility improvements)
    const _statusMessage = useMemo(() => {
      if (isLoading) return "検索中...";
      if (error) return error;
      if (!hasSearched) return "";
      if (!hasResults) return "結果なし / No results";
      return `${currentIndex + 1} / ${totalCount}`;
    }, [currentIndex, error, hasResults, hasSearched, isLoading, totalCount]);

    return (
      <div
        role="search"
        aria-label="ファイル内検索"
        className={clsx("flex flex-col bg-slate-800", className)}
      >
        {/* Search Row */}
        <div
          className="flex items-center gap-2 px-4 h-12 border-b border-slate-700"
          onKeyDown={handleKeyDown}
        >
          {/* Toggle Replace Button */}
          <button
            type="button"
            onClick={toggleReplace}
            aria-expanded={showReplace}
            aria-label={showReplace ? "置換を閉じる" : "置換を開く"}
            className={clsx(
              "w-5 h-5 flex items-center justify-center rounded",
              "text-slate-400 hover:bg-slate-700",
              "transition-transform duration-150",
              showReplace && "rotate-90",
            )}
          >
            <Icon name="chevron-right" size={14} />
          </button>

          {/* Search Icon */}
          <Icon
            name="search"
            size={18}
            className="text-slate-400 flex-shrink-0"
          />

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="検索 / Search"
            aria-label="検索文字列"
            aria-describedby="search-status"
            aria-invalid={!!error}
            className={clsx(
              "flex-1 min-w-0 px-3 py-1.5 h-8",
              "bg-slate-900 rounded-md",
              "text-sm text-white placeholder-slate-400",
              "border transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              error ? "border-red-500" : "border-slate-600",
            )}
          />

          {/* Search Options */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              role="checkbox"
              aria-checked={options.caseSensitive}
              aria-label="大文字/小文字を区別 / Case sensitive"
              onClick={() => handleOptionToggle("caseSensitive")}
              className={clsx(
                "w-7 h-7 flex items-center justify-center rounded",
                "transition-colors duration-150",
                options.caseSensitive
                  ? "bg-blue-500 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600",
              )}
            >
              <span className="text-xs font-medium">Aa</span>
            </button>

            <button
              type="button"
              role="checkbox"
              aria-checked={options.wholeWord}
              aria-label="単語単位で検索 / Whole word"
              onClick={() => handleOptionToggle("wholeWord")}
              className={clsx(
                "w-7 h-7 flex items-center justify-center rounded",
                "transition-colors duration-150",
                options.wholeWord
                  ? "bg-blue-500 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600",
              )}
            >
              <span className="text-xs font-medium">Ab</span>
            </button>

            <button
              type="button"
              role="checkbox"
              aria-checked={options.useRegex}
              aria-label="正規表現を使用 / Regex"
              onClick={() => handleOptionToggle("useRegex")}
              className={clsx(
                "w-7 h-7 flex items-center justify-center rounded",
                "transition-colors duration-150",
                options.useRegex
                  ? "bg-blue-500 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600",
              )}
            >
              <span className="text-xs font-medium">.*</span>
            </button>
          </div>

          {/* Counter & Status */}
          <div className="flex items-center gap-2 min-w-[80px] justify-center">
            {isLoading ? (
              <div role="progressbar" aria-label="検索中">
                <Icon
                  name="loader-2"
                  size={16}
                  spin
                  className="text-blue-400"
                />
              </div>
            ) : hasSearched ? (
              <span
                role="status"
                id="search-status"
                aria-live="polite"
                className={clsx(
                  "text-xs tabular-nums",
                  hasResults ? "text-slate-400" : "text-slate-500",
                )}
              >
                {hasResults
                  ? `${currentIndex + 1} / ${totalCount}`
                  : "結果なし / 0件"}
              </span>
            ) : (
              <span
                role="status"
                id="search-status"
                aria-live="polite"
                className="text-xs text-slate-500"
              >
                {/* Empty state */}
              </span>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPrev}
              disabled={!hasResults}
              aria-label="前の検索結果 / Previous"
              className={clsx(
                "w-7 h-7 flex items-center justify-center rounded",
                "transition-colors duration-100",
                hasResults
                  ? "text-slate-400 hover:bg-slate-700"
                  : "text-slate-600 cursor-not-allowed",
              )}
            >
              <Icon name="arrow-up" size={16} />
            </button>

            <button
              type="button"
              onClick={goToNext}
              disabled={!hasResults}
              aria-label="次の検索結果 / Next"
              className={clsx(
                "w-7 h-7 flex items-center justify-center rounded",
                "transition-colors duration-100",
                hasResults
                  ? "text-slate-400 hover:bg-slate-700"
                  : "text-slate-600 cursor-not-allowed",
              )}
            >
              <Icon name="arrow-down" size={16} />
            </button>
          </div>

          {/* Close Button */}
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

        {/* Replace Row */}
        {showReplace && (
          <div className="flex items-center gap-2 px-4 h-10 border-b border-slate-700">
            {/* Spacer for alignment with search row */}
            <div className="w-5" />

            {/* Replace Icon */}
            <Icon
              name="replace"
              size={18}
              className="text-slate-400 flex-shrink-0"
            />

            {/* Replace Input */}
            <input
              ref={replaceInputRef}
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="置換 / Replace"
              aria-label="置換文字列"
              className={clsx(
                "flex-1 min-w-0 px-3 py-1.5 h-8",
                "bg-slate-900 rounded-md",
                "text-sm text-white placeholder-slate-400",
                "border border-slate-600 transition-colors duration-150",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
              )}
            />

            {/* Replace Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={replaceSingle}
                disabled={!hasResults || isReplacing}
                aria-label="置換 / Replace"
                title="現在のマッチを置換"
                className={clsx(
                  "px-2 h-7 flex items-center justify-center rounded text-xs",
                  "transition-colors duration-100",
                  hasResults && !isReplacing
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-slate-800 text-slate-600 cursor-not-allowed",
                )}
              >
                置換
              </button>

              <button
                type="button"
                onClick={replaceAll}
                disabled={!hasResults || isReplacing}
                aria-label="すべて置換 / Replace All"
                title="すべてのマッチを置換"
                className={clsx(
                  "px-2 h-7 flex items-center justify-center rounded text-xs",
                  "transition-colors duration-100",
                  hasResults && !isReplacing
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-slate-800 text-slate-600 cursor-not-allowed",
                )}
              >
                すべて
              </button>
            </div>

            {/* Replace Loading */}
            {isReplacing && (
              <Icon name="loader-2" size={16} spin className="text-blue-400" />
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mx-4 my-1 px-3 py-1.5 bg-red-900/50 border border-red-700 rounded text-xs text-red-400"
          >
            {error}
          </div>
        )}
      </div>
    );
  },
);

FileSearchPanel.displayName = "FileSearchPanel";
