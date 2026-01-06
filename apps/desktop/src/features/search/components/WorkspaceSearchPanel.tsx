/**
 * WorkspaceSearchPanel - ワークスペース検索パネル
 *
 * 位置: サイドバーまたはパネルエリア
 * WCAG 2.1 AA準拠
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  WorkspaceSearchPanelProps,
  FileSearchResult,
  SearchMatch,
  SearchProviderOptions,
} from "../types";
import { highlightMatch } from "../utils";
import { SearchOptionButtons } from "./SearchOptionButtons";

interface WorkspaceSearchState {
  searchQuery: string;
  replaceText: string;
  includePattern: string;
  excludePattern: string;
  caseSensitive: boolean;
  regex: boolean;
  wholeWord: boolean;
  showReplaceMode: boolean;
  results: FileSearchResult[];
  expandedFiles: Set<string>;
  selectedIndex: number;
  isSearching: boolean;
  error: string | null;
  showConfirmDialog: boolean;
}

// デフォルト検索関数 - 実際にはIPC経由で呼び出す
async function* defaultSearchProvider(
  _workspacePath: string,
  _query: string,
  _options: SearchProviderOptions,
): AsyncGenerator<FileSearchResult> {
  // This will be replaced with actual IPC call
  yield* [];
}

export function WorkspaceSearchPanel({
  isOpen,
  onClose,
  workspacePath,
  onFileOpen,
  initialSearchText = "",
  showReplace: initialShowReplace = false,
  searchProvider = defaultSearchProvider,
}: WorkspaceSearchPanelProps) {
  const [state, setState] = useState<WorkspaceSearchState>({
    searchQuery: initialSearchText,
    replaceText: "",
    includePattern: "",
    excludePattern: "",
    caseSensitive: false,
    regex: false,
    wholeWord: false,
    showReplaceMode: initialShowReplace,
    results: [],
    expandedFiles: new Set<string>(),
    selectedIndex: -1,
    isSearching: false,
    error: null,
    showConfirmDialog: false,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // パネルが開いたらフォーカス
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // 初期検索テキスト設定
  useEffect(() => {
    if (initialSearchText) {
      setState((prev) => ({ ...prev, searchQuery: initialSearchText }));
    }
  }, [initialSearchText]);

  // 検索オプション
  const searchOptions = useMemo(
    () => ({
      caseSensitive: state.caseSensitive,
      regex: state.regex,
      wholeWord: state.wholeWord,
      includePattern: state.includePattern || undefined,
      excludePattern: state.excludePattern || undefined,
    }),
    [
      state.caseSensitive,
      state.regex,
      state.wholeWord,
      state.includePattern,
      state.excludePattern,
    ],
  );

  // 検索実行
  const executeSearch = useCallback(async () => {
    const query = state.searchQuery.trim();
    if (!query) {
      setState((prev) => ({ ...prev, results: [], isSearching: false }));
      return;
    }

    // 前の検索をキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState((prev) => ({
      ...prev,
      isSearching: true,
      error: null,
      results: [],
    }));

    try {
      // 正規表現の妥当性チェック
      if (state.regex) {
        try {
          new RegExp(query);
        } catch {
          setState((prev) => ({
            ...prev,
            error: "無効な正規表現です",
            isSearching: false,
          }));
          return;
        }
      }

      // ファイルパターンの妥当性チェック
      if (state.includePattern) {
        try {
          // 簡易的なglobパターン検証
          if (
            state.includePattern.includes("[") &&
            !state.includePattern.includes("]")
          ) {
            throw new Error("Invalid glob pattern");
          }
        } catch {
          setState((prev) => ({
            ...prev,
            error: "無効なファイルパターンです",
            isSearching: false,
          }));
          return;
        }
      }

      const newResults: FileSearchResult[] = [];
      const expandedFiles = new Set<string>();

      // ストリーミング検索
      for await (const result of searchProvider(
        workspacePath,
        query,
        searchOptions,
      )) {
        newResults.push(result);
        expandedFiles.add(result.filePath);

        setState((prev) => ({
          ...prev,
          results: [...newResults],
          expandedFiles: new Set(expandedFiles),
        }));
      }

      setState((prev) => ({
        ...prev,
        isSearching: false,
        selectedIndex: newResults.length > 0 ? 0 : -1,
      }));
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setState((prev) => ({
          ...prev,
          error: "検索中にエラーが発生しました",
          isSearching: false,
        }));
      }
    }
  }, [
    state.searchQuery,
    state.regex,
    state.includePattern,
    workspacePath,
    searchOptions,
    searchProvider,
  ]);

  // 検索は手動実行のみ（Enterキーまたは検索ボタン）

  // 検索キャンセル
  const cancelSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState((prev) => ({ ...prev, isSearching: false }));
    }
  }, []);

  // ファイル展開トグル
  const toggleFileExpanded = useCallback((filePath: string) => {
    setState((prev) => {
      const newExpanded = new Set(prev.expandedFiles);
      if (newExpanded.has(filePath)) {
        newExpanded.delete(filePath);
      } else {
        newExpanded.add(filePath);
      }
      return { ...prev, expandedFiles: newExpanded };
    });
  }, []);

  // マッチをクリック
  const handleMatchClick = useCallback(
    (filePath: string, line: number, column: number) => {
      onFileOpen(filePath, line, column);
    },
    [onFileOpen],
  );

  // 全置換
  const handleReplaceAll = useCallback(() => {
    setState((prev) => ({ ...prev, showConfirmDialog: true }));
  }, []);

  // 置換確認
  const confirmReplaceAll = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      showConfirmDialog: false,
      isSearching: true,
    }));

    // 実際の置換処理（IPC経由）
    // await replaceInWorkspace(...)

    const totalMatches = state.results.reduce(
      (acc, file) => acc + file.matches.length,
      0,
    );

    setState((prev) => ({
      ...prev,
      isSearching: false,
      // 置換完了メッセージ用
      error: null,
    }));

    // 結果をリセットまたは再検索
    executeSearch();

    // 仮の成功メッセージ
    console.log(`${totalMatches}件を置換しました`);
  }, [state.results, executeSearch]);

  // キャンセル
  const cancelReplaceAll = useCallback(() => {
    setState((prev) => ({ ...prev, showConfirmDialog: false }));
  }, []);

  // 選択アイテム情報を取得
  const getSelectedItemInfo = useCallback((): {
    type: "file" | "match";
    filePath: string;
    line?: number;
    column?: number;
  } | null => {
    let currentIndex = 0;
    for (const file of state.results) {
      // ファイルヘッダー
      if (currentIndex === state.selectedIndex) {
        return { type: "file", filePath: file.filePath };
      }
      currentIndex++;

      // 展開されている場合はマッチ行も
      if (state.expandedFiles.has(file.filePath)) {
        for (const match of file.matches) {
          if (currentIndex === state.selectedIndex) {
            return {
              type: "match",
              filePath: file.filePath,
              line: match.line,
              column: match.column,
            };
          }
          currentIndex++;
        }
      }
    }
    return null;
  }, [state.results, state.selectedIndex, state.expandedFiles]);

  // キーボードイベント
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (state.showConfirmDialog) {
          cancelReplaceAll();
        } else {
          onClose();
        }
        return;
      }

      if (e.key === "Enter" && e.target === searchInputRef.current) {
        executeSearch();
        e.preventDefault();
        return;
      }

      // Enterキーで選択したアイテムを開く
      if (e.key === "Enter" && state.selectedIndex >= 0) {
        const selectedItem = getSelectedItemInfo();
        if (selectedItem) {
          if (selectedItem.type === "match" && selectedItem.line) {
            onFileOpen(
              selectedItem.filePath,
              selectedItem.line,
              selectedItem.column,
            );
          } else {
            // ファイルヘッダーの場合は展開/折りたたみをトグル
            toggleFileExpanded(selectedItem.filePath);
          }
        }
        e.preventDefault();
        return;
      }

      if (e.key === "ArrowDown") {
        const totalItems = state.results.reduce(
          (acc, file) =>
            acc +
            (state.expandedFiles.has(file.filePath)
              ? file.matches.length + 1
              : 1),
          0,
        );
        setState((prev) => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, totalItems - 1),
        }));
        e.preventDefault();
        return;
      }

      if (e.key === "ArrowUp") {
        setState((prev) => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0),
        }));
        e.preventDefault();
        return;
      }
    },
    [
      state.showConfirmDialog,
      state.results,
      state.expandedFiles,
      state.selectedIndex,
      onClose,
      executeSearch,
      cancelReplaceAll,
      getSelectedItemInfo,
      onFileOpen,
      toggleFileExpanded,
    ],
  );

  // グローバルキーボードイベント
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen, onClose]);

  // 総マッチ数計算
  const totalMatches = useMemo(
    () => state.results.reduce((acc, file) => acc + file.matches.length, 0),
    [state.results],
  );

  // ファイル名取得
  const getFileName = (filePath: string) => {
    const parts = filePath.split("/");
    return parts[parts.length - 1];
  };

  // 相対パス取得
  const getRelativePath = (filePath: string) => {
    if (filePath.startsWith(workspacePath)) {
      return filePath.slice(workspacePath.length + 1);
    }
    return filePath;
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="ワークスペース検索"
      className="workspace-search-panel h-full flex flex-col bg-zinc-800 border-r border-zinc-600"
      onKeyDown={handleKeyDown}
    >
      {/* 検索入力エリア */}
      <div className="p-3 border-b border-zinc-600">
        <div className="flex flex-col gap-2">
          {/* 検索入力行 */}
          <div className="flex gap-2">
            <input
              ref={searchInputRef}
              type="search"
              role="searchbox"
              aria-label="検索"
              value={state.searchQuery}
              onChange={(e) =>
                setState((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              placeholder="検索... (Enterで実行)"
              className={`flex-1 px-3 py-1.5 bg-zinc-900 text-zinc-100 placeholder-zinc-500 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                state.error ? "border-red-500" : "border-zinc-600"
              }`}
            />
            <button
              type="button"
              onClick={executeSearch}
              aria-label="検索実行"
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              検索
            </button>
          </div>

          {/* 置換入力 */}
          {state.showReplaceMode && (
            <input
              type="text"
              value={state.replaceText}
              onChange={(e) =>
                setState((prev) => ({ ...prev, replaceText: e.target.value }))
              }
              placeholder="置換..."
              className="w-full px-3 py-1.5 bg-zinc-900 text-zinc-100 placeholder-zinc-500 border border-zinc-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* 検索オプション */}
          <div className="flex items-center gap-2">
            <SearchOptionButtons
              caseSensitive={state.caseSensitive}
              onCaseSensitiveChange={(value) =>
                setState((prev) => ({ ...prev, caseSensitive: value }))
              }
              wholeWord={state.wholeWord}
              onWholeWordChange={(value) =>
                setState((prev) => ({ ...prev, wholeWord: value }))
              }
              regex={state.regex}
              onRegexChange={(value) =>
                setState((prev) => ({ ...prev, regex: value }))
              }
            />
          </div>

          {/* ファイルパターン */}
          <input
            type="text"
            value={state.includePattern}
            onChange={(e) =>
              setState((prev) => ({ ...prev, includePattern: e.target.value }))
            }
            placeholder="ファイルパターン (例: *.ts)"
            className="w-full px-3 py-1.5 bg-zinc-900 text-zinc-100 placeholder-zinc-500 border border-zinc-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />

          {/* 除外パターン */}
          <input
            type="text"
            value={state.excludePattern}
            onChange={(e) =>
              setState((prev) => ({ ...prev, excludePattern: e.target.value }))
            }
            placeholder="除外パターン (例: node_modules)"
            className="w-full px-3 py-1.5 bg-zinc-900 text-zinc-100 placeholder-zinc-500 border border-zinc-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />

          {/* 置換ボタン */}
          {state.showReplaceMode && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  // プレビュー機能
                }}
                aria-label="プレビュー"
                className="px-3 py-1.5 text-sm bg-zinc-700 text-zinc-100 rounded hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                プレビュー
              </button>

              <button
                type="button"
                onClick={handleReplaceAll}
                disabled={totalMatches === 0}
                aria-label="すべて置換"
                className="px-3 py-1.5 text-sm bg-zinc-700 text-zinc-100 rounded hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                全置換
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ステータス */}
      <div
        role="status"
        aria-live="polite"
        className="px-3 py-2 text-sm text-zinc-400 border-b border-zinc-600"
      >
        {state.isSearching ? (
          <div className="flex items-center gap-2">
            <div
              role="progressbar"
              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            />
            <span>検索中...</span>
            <button
              type="button"
              onClick={cancelSearch}
              aria-label="キャンセル"
              className="ml-auto text-xs text-blue-400 hover:underline"
            >
              キャンセル
            </button>
          </div>
        ) : state.error ? (
          <div role="alert" className="text-red-400">
            {state.error}
          </div>
        ) : state.results.length > 0 ? (
          <span>
            {totalMatches}件の結果 ({state.results.length}ファイル)
          </span>
        ) : state.searchQuery ? (
          <span className="text-zinc-500">結果なし</span>
        ) : null}
      </div>

      {/* 検索結果ツリー */}
      {state.results.length > 0 && (
        <div role="tree" aria-label="検索結果" className="flex-1 overflow-auto">
          {(() => {
            let currentIndex = 0;
            return state.results.map((file) => {
              const fileIndex = currentIndex;
              currentIndex++;
              const isExpanded = state.expandedFiles.has(file.filePath);
              const fileName = getFileName(file.filePath);
              const relativePath = getRelativePath(file.filePath);
              const isFileSelected = fileIndex === state.selectedIndex;

              const matchElements = isExpanded
                ? file.matches.map((match: SearchMatch, matchIdx: number) => {
                    const matchIndex = currentIndex;
                    currentIndex++;
                    const isMatchSelected = matchIndex === state.selectedIndex;
                    return (
                      <button
                        key={`${match.line}-${match.column}-${matchIdx}`}
                        type="button"
                        role="treeitem"
                        onClick={() =>
                          handleMatchClick(
                            file.filePath,
                            match.line,
                            match.column,
                          )
                        }
                        className={`w-full flex items-start gap-2 px-3 py-1 hover:bg-zinc-700 text-left text-sm text-zinc-300 ${
                          isMatchSelected ? "selected bg-blue-900" : ""
                        }`}
                      >
                        <span className="text-zinc-500 w-8 text-right flex-shrink-0">
                          {match.line}
                        </span>
                        <span className="flex-1 truncate">
                          {highlightMatch(
                            match.lineText,
                            match.column - 1,
                            match.length,
                          )}
                        </span>
                      </button>
                    );
                  })
                : null;

              return (
                <div key={file.filePath} data-file-result>
                  {/* ファイルヘッダー */}
                  <button
                    type="button"
                    role="treeitem"
                    aria-expanded={isExpanded}
                    onClick={() => toggleFileExpanded(file.filePath)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-700 text-left text-zinc-200 ${
                      isFileSelected ? "selected bg-blue-900" : ""
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="font-medium">{fileName}</span>
                    <span className="text-xs text-zinc-500">
                      {relativePath}
                    </span>
                    <span className="ml-auto text-xs bg-zinc-600 px-1.5 py-0.5 rounded">
                      {file.matches.length}
                    </span>
                  </button>

                  {/* マッチ行 */}
                  {isExpanded && (
                    <div className="ml-6">
                      {matchElements}

                      {/* コンテキスト行（前後の行） */}
                      {file.matches[0]?.context?.before?.map(
                        (line: string, i: number) => (
                          <div
                            key={`context-before-${i}`}
                            className="px-3 py-1 text-sm text-zinc-500 ml-10"
                          >
                            {line}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* 確認ダイアログ */}
      {state.showConfirmDialog && (
        <div
          role="dialog"
          aria-label="確認"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md shadow-xl border border-zinc-600">
            <h2 className="text-lg font-semibold mb-4 text-zinc-100">
              全置換の確認
            </h2>
            <p className="mb-4 text-zinc-300">
              {totalMatches}件のマッチを「{state.replaceText}」に置換しますか？
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelReplaceAll}
                aria-label="キャンセル"
                className="px-4 py-2 rounded bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmReplaceAll}
                aria-label="置換実行"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                置換実行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
