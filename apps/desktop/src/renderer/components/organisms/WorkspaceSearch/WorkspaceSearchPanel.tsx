"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import clsx from "clsx";
import { useIpc } from "../../../../hooks/useIpc";
import { Icon } from "../../atoms/Icon";
import type {
  ReplaceWorkspaceAllRequest,
  ReplaceWorkspaceAllResponse,
} from "../../../../preload/types";

/**
 * Workspace search match result
 */
export interface WorkspaceSearchMatch {
  /** File path of the match */
  filePath: string;
  /** Line number of the match (1-based) */
  lineNumber: number;
  /** Line content containing the match */
  lineContent: string;
  /** Column where match starts (1-based) */
  column: number;
  /** Length of the matched text */
  matchLength: number;
}

/**
 * Workspace search result
 */
export interface WorkspaceSearchResult {
  /** Array of matches */
  matches: WorkspaceSearchMatch[];
  /** Total number of matches */
  totalMatches: number;
  /** Time taken to search (ms) */
  searchTime: number;
}

/**
 * Props for individual search result item
 */
export interface SearchResultItemProps {
  /** File path of the match */
  filePath: string;
  /** Line number of the match */
  lineNumber: number;
  /** Line content containing the match */
  lineContent: string;
  /** Column where match starts */
  column: number;
  /** Length of the matched text */
  matchLength: number;
}

/**
 * Props for WorkspaceSearchPanel
 */
export interface WorkspaceSearchPanelProps {
  /** Current workspace path to search in */
  workspacePath: string;
  /** Callback when a search result is clicked */
  onResultClick?: (result: SearchResultItemProps) => void;
  /** Callback when replace operation completes */
  onReplaceComplete?: (replacedCount: number, fileCount: number) => void;
  /** Initial state for showing replace row */
  initialShowReplace?: boolean;
  /** Callback when replace mode changes */
  onReplaceModeChange?: (showReplace: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Helper to group search results by file
 */
interface GroupedResult {
  filePath: string;
  matches: WorkspaceSearchMatch[];
}

/**
 * Search options
 */
interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

/**
 * WorkspaceSearchPanel - A component for searching and replacing across all files in a workspace
 *
 * Features:
 * - Full-text search across workspace files
 * - Replace all functionality
 * - Case sensitive, whole word, and regex search options
 * - File exclusion patterns support (glob patterns)
 * - Results grouped by file with match counts
 * - Keyboard navigation and accessibility support
 */
export const WorkspaceSearchPanel: React.FC<WorkspaceSearchPanelProps> = ({
  workspacePath,
  onResultClick,
  onReplaceComplete,
  initialShowReplace = false,
  onReplaceModeChange,
  className = "",
}) => {
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [excludePatterns, setExcludePatterns] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showReplace, setShowReplace] = useState(initialShowReplace);
  const [isSearching, setIsSearching] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [searchResults, setSearchResults] =
    useState<WorkspaceSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replaceSuccess, setReplaceSuccess] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Search options
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  });

  // IME composition state
  const [isComposing, setIsComposing] = useState(false);

  // IPC hook for workspace search
  const { invoke } = useIpc();

  // Sync showReplace with initialShowReplace prop changes
  useEffect(() => {
    setShowReplace(initialShowReplace);
  }, [initialShowReplace]);

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Group results by file path
   */
  const groupedResults = useMemo((): GroupedResult[] => {
    if (!searchResults?.matches) return [];

    const groups = new Map<string, WorkspaceSearchMatch[]>();

    for (const match of searchResults.matches) {
      const existing = groups.get(match.filePath);
      if (existing) {
        existing.push(match);
      } else {
        groups.set(match.filePath, [match]);
      }
    }

    return Array.from(groups.entries()).map(([filePath, matches]) => ({
      filePath,
      matches,
    }));
  }, [searchResults]);

  /**
   * Execute workspace search
   */
  const executeSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setReplaceSuccess(null);
    setHasSearched(true);

    try {
      // Parse exclude patterns (comma or newline separated)
      const patterns = excludePatterns
        .split(/[,\n]/)
        .map((p) => p.trim())
        .filter(Boolean);

      // IPC request format must match SearchWorkspaceRequest
      const response = await invoke<{
        success: boolean;
        data?: {
          matches: Array<{
            text: string;
            line: number;
            column: number;
            length: number;
            filePath: string;
          }>;
          totalCount: number;
          fileCount: number;
        };
        error?: string;
      }>("search:workspace:execute", {
        rootPath: workspacePath,
        query: searchQuery,
        excludePatterns: patterns.length > 0 ? patterns : undefined,
        options: {
          caseSensitive: options.caseSensitive,
          wholeWord: options.wholeWord,
          useRegex: options.useRegex,
        },
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Search failed");
      }

      // Transform response to WorkspaceSearchResult format
      const result: WorkspaceSearchResult = {
        matches: response.data.matches.map((m) => ({
          filePath: m.filePath,
          lineNumber: m.line,
          lineContent: m.text,
          column: m.column,
          matchLength: m.length,
        })),
        totalMatches: response.data.totalCount,
        searchTime: 0,
      };

      setSearchResults(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      setError(errorMessage);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, excludePatterns, workspacePath, options, invoke]);

  /**
   * Execute workspace replace all
   */
  const executeReplaceAll = useCallback(async () => {
    if (!searchQuery.trim() || !searchResults?.matches.length) return;

    setIsReplacing(true);
    setError(null);
    setReplaceSuccess(null);

    try {
      // Parse exclude patterns (comma or newline separated)
      const patterns = excludePatterns
        .split(/[,\n]/)
        .map((p) => p.trim())
        .filter(Boolean);

      const request: ReplaceWorkspaceAllRequest = {
        rootPath: workspacePath,
        query: searchQuery,
        replaceString: replaceQuery,
        searchOptions: {
          caseSensitive: options.caseSensitive,
          wholeWord: options.wholeWord,
          useRegex: options.useRegex,
        },
        replaceOptions: {
          preserveCase: false,
        },
        excludePatterns: patterns.length > 0 ? patterns : undefined,
      };

      const response = await invoke<ReplaceWorkspaceAllResponse>(
        "replace:workspace:all",
        request,
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Replace failed");
      }

      const { replacedCount, fileCount } = response.data;
      setReplaceSuccess(
        `${replacedCount} matches replaced in ${fileCount} files`,
      );
      setSearchResults(null);

      onReplaceComplete?.(replacedCount, fileCount);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Replace failed";
      setError(errorMessage);
    } finally {
      setIsReplacing(false);
    }
  }, [
    searchQuery,
    replaceQuery,
    excludePatterns,
    workspacePath,
    options,
    searchResults,
    invoke,
    onReplaceComplete,
  ]);

  /**
   * Handle option toggle
   */
  const handleOptionToggle = useCallback((option: keyof SearchOptions) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  }, []);

  /**
   * Handle key press in search input
   */
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !isComposing) {
        executeSearch();
      }
    },
    [executeSearch, isComposing],
  );

  /**
   * Handle key press in replace input
   */
  const handleReplaceKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !isComposing) {
        executeReplaceAll();
      }
    },
    [executeReplaceAll, isComposing],
  );

  /**
   * Handle result item click
   */
  const handleResultClick = useCallback(
    (match: WorkspaceSearchMatch) => {
      if (onResultClick) {
        onResultClick({
          filePath: match.filePath,
          lineNumber: match.lineNumber,
          lineContent: match.lineContent,
          column: match.column,
          matchLength: match.matchLength,
        });
      }
    },
    [onResultClick],
  );

  /**
   * Toggle advanced options visibility
   */
  const toggleAdvancedOptions = useCallback(() => {
    setShowAdvancedOptions((prev) => !prev);
  }, []);

  /**
   * Toggle replace mode visibility
   */
  const toggleReplace = useCallback(() => {
    setShowReplace((prev) => {
      const newValue = !prev;
      onReplaceModeChange?.(newValue);
      return newValue;
    });
  }, [onReplaceModeChange]);

  /**
   * Extract filename from path
   */
  const getFileName = (filePath: string): string => {
    return filePath.split("/").pop() || filePath;
  };

  // Status
  const hasResults = (searchResults?.matches.length ?? 0) > 0;
  const totalCount = searchResults?.totalMatches ?? 0;

  return (
    <div
      className={clsx(
        "workspace-search-panel flex flex-col h-full bg-slate-800",
        className,
      )}
      data-testid="workspace-search-panel"
    >
      {/* Search Row */}
      <div className="flex items-center gap-2 px-4 h-12 border-b border-slate-700">
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
          name="folder-search"
          size={18}
          className="text-slate-400 flex-shrink-0"
        />

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="全体検索 / Search All"
          aria-label="Search query"
          className={clsx(
            "flex-1 min-w-0 px-3 py-1.5 h-8",
            "bg-slate-900 rounded-md",
            "text-sm text-white placeholder-slate-400",
            "border transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            error ? "border-red-500" : "border-slate-600",
          )}
          data-testid="search-input"
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
          {isSearching ? (
            <Icon name="loader-2" size={16} spin className="text-blue-400" />
          ) : hasSearched ? (
            <span
              className={clsx(
                "text-xs tabular-nums",
                hasResults ? "text-slate-400" : "text-slate-500",
              )}
            >
              {hasResults ? `${totalCount} 件` : "結果なし / 0件"}
            </span>
          ) : null}
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={toggleAdvancedOptions}
          aria-expanded={showAdvancedOptions}
          aria-label="詳細オプション"
          className={clsx(
            "w-7 h-7 flex items-center justify-center rounded",
            "text-slate-400 hover:bg-slate-700",
            "transition-colors duration-100",
          )}
        >
          <Icon name="settings" size={16} />
        </button>
      </div>

      {/* Replace Row - Conditionally visible */}
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
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            onKeyDown={handleReplaceKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="置換 / Replace"
            aria-label="Replace string"
            className={clsx(
              "flex-1 min-w-0 px-3 py-1.5 h-8",
              "bg-slate-900 rounded-md",
              "text-sm text-white placeholder-slate-400",
              "border border-slate-600 transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
            )}
            data-testid="replace-input"
          />

          {/* Replace Button */}
          <button
            type="button"
            onClick={executeReplaceAll}
            disabled={!hasResults || isReplacing}
            aria-label="すべて置換 / Replace All"
            title="すべてのマッチを置換"
            className={clsx(
              "px-3 h-7 flex items-center justify-center rounded text-xs",
              "transition-colors duration-100",
              hasResults && !isReplacing
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-slate-800 text-slate-600 cursor-not-allowed",
            )}
            data-testid="replace-all-button"
          >
            すべて置換
          </button>

          {/* Replace Loading */}
          {isReplacing && (
            <Icon name="loader-2" size={16} spin className="text-blue-400" />
          )}
        </div>
      )}

      {/* Advanced Options */}
      {showAdvancedOptions && (
        <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/50">
          <label className="block text-xs text-slate-400 mb-1">
            除外パターン / Exclude patterns (comma separated)
          </label>
          <input
            type="text"
            value={excludePatterns}
            onChange={(e) => setExcludePatterns(e.target.value)}
            placeholder="node_modules, .git, *.log"
            className={clsx(
              "w-full px-3 py-1.5 h-8",
              "bg-slate-900 rounded-md",
              "text-sm text-white placeholder-slate-400",
              "border border-slate-600 transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
            )}
            aria-label="File exclude patterns"
            data-testid="exclude-patterns-input"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="mx-4 my-2 px-3 py-1.5 bg-red-900/50 border border-red-700 rounded text-xs text-red-400"
          data-testid="error-message"
        >
          {error}
        </div>
      )}

      {/* Success Message */}
      {replaceSuccess && (
        <div
          role="status"
          className="mx-4 my-2 px-3 py-1.5 bg-green-900/50 border border-green-700 rounded text-xs text-green-400"
          data-testid="success-message"
        >
          {replaceSuccess}
        </div>
      )}

      {/* Search Results */}
      <div
        className="search-results flex-1 overflow-y-auto"
        data-testid="search-results"
      >
        {/* Empty State - No search yet */}
        {!isSearching && !hasSearched && (
          <div className="p-4 text-center text-slate-500 text-sm">
            検索語を入力してEnterを押してください
          </div>
        )}

        {/* Empty State - No results */}
        {!isSearching && hasSearched && !hasResults && !error && (
          <div
            className="p-4 text-center text-slate-500 text-sm"
            data-testid="empty-results"
          >
            結果なし / No results for "{searchQuery}"
          </div>
        )}

        {/* Results List */}
        {!isSearching && !error && groupedResults.length > 0 && (
          <div className="results-list">
            {/* Results Summary */}
            <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-700 bg-slate-800/50">
              {totalCount} 件 / {groupedResults.length} ファイル
            </div>

            {/* Grouped Results */}
            {groupedResults.map((group) => (
              <div
                key={group.filePath}
                className="file-group"
                data-testid={`file-group-${group.filePath}`}
              >
                {/* File Header */}
                <div className="file-header px-4 py-2 bg-slate-700/30 border-b border-slate-700 flex items-center gap-2">
                  <Icon name="file-text" size={14} className="text-slate-400" />
                  <span
                    className="flex-1 text-sm font-medium text-slate-300 truncate"
                    title={group.filePath}
                  >
                    {getFileName(group.filePath)}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
                    {group.matches.length}
                  </span>
                </div>

                {/* File Matches */}
                <div className="file-matches">
                  {group.matches.map((match, index) => (
                    <button
                      key={`${match.filePath}-${match.lineNumber}-${index}`}
                      onClick={() => handleResultClick(match)}
                      className={clsx(
                        "result-item w-full text-left px-4 py-1.5",
                        "hover:bg-slate-700/50 transition-colors",
                        "border-b border-slate-700/50 last:border-b-0",
                        "focus:outline-none focus:bg-slate-700/50",
                      )}
                      data-testid="result-item"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-slate-500 min-w-[3rem] text-right tabular-nums">
                          {match.lineNumber}
                        </span>
                        <span className="text-sm font-mono text-slate-300 truncate">
                          {highlightMatch(
                            match.lineContent,
                            match.column,
                            match.matchLength,
                          )}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Highlight the matched portion of text
 */
function highlightMatch(
  text: string,
  column: number,
  matchLength: number,
): React.ReactNode {
  // Column is 1-based, convert to 0-based index
  const startIndex = column - 1;
  const endIndex = startIndex + matchLength;

  if (startIndex < 0 || startIndex >= text.length) {
    return text;
  }

  const before = text.slice(0, startIndex);
  const match = text.slice(startIndex, endIndex);
  const after = text.slice(endIndex);

  return (
    <>
      {before}
      <mark className="bg-yellow-500/40 text-yellow-200 rounded px-0.5">
        {match}
      </mark>
      {after}
    </>
  );
}

export default WorkspaceSearchPanel;
