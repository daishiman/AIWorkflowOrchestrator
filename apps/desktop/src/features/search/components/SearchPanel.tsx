/**
 * SearchPanel - ファイル内検索パネル
 *
 * 位置: エディタ上部にオーバーレイ表示
 * WCAG 2.1 AA準拠
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SearchPanelProps, SearchMatch } from "../types";
import { createHighlights, executeSearch } from "../utils";
import { SearchOptionButtons } from "./SearchOptionButtons";

export function SearchPanel({
  isOpen,
  onClose,
  editorRef,
  initialSearchText = "",
  showReplace: initialShowReplace = false,
}: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchText);
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regex, setRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [showReplaceMode, setShowReplaceMode] = useState(initialShowReplace);
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const options = useMemo(
    () => ({ caseSensitive, regex, wholeWord }),
    [caseSensitive, regex, wholeWord],
  );

  // 検索実行
  const performSearch = useCallback(() => {
    if (!editorRef.current) return;

    setError(null);

    if (!searchQuery) {
      setResults([]);
      editorRef.current.setHighlights([]);
      return;
    }

    try {
      const content = editorRef.current.getContent();
      const { matches, error: searchError } = executeSearch(
        content,
        searchQuery,
        options,
      );

      // エラーがあればエラー状態を設定
      if (searchError) {
        setError(searchError);
        setResults([]);
        editorRef.current.setHighlights([]);
        return;
      }

      setResults(matches);
      setCurrentIndex(matches.length > 0 ? 0 : -1);

      // ハイライト設定
      editorRef.current.setHighlights(
        matches.map((m, i) => ({
          line: m.line,
          column: m.column,
          length: m.length,
          isCurrent: i === 0,
        })),
      );

      // 最初の結果にスクロール
      if (matches.length > 0) {
        editorRef.current.scrollToLine(matches[0].line, matches[0].column);
      }
    } catch {
      // エディタエラー時は空の結果
      setResults([]);
      editorRef.current?.setHighlights([]);
    }
  }, [searchQuery, options, editorRef]);

  // 初期検索テキスト設定時（手動検索のみ、自動検索は行わない）
  useEffect(() => {
    if (initialSearchText) {
      setSearchQuery(initialSearchText);
    }
  }, [initialSearchText]);

  // パネルが開いたらフォーカス
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // 次の結果へ
  const goToNext = useCallback(() => {
    if (results.length === 0) return;

    const nextIndex = (currentIndex + 1) % results.length;
    setCurrentIndex(nextIndex);

    if (editorRef.current) {
      editorRef.current.setHighlights(createHighlights(results, nextIndex));
      editorRef.current.scrollToLine(
        results[nextIndex].line,
        results[nextIndex].column,
      );
    }
  }, [results, currentIndex, editorRef]);

  // 前の結果へ
  const goToPrevious = useCallback(() => {
    if (results.length === 0) return;

    const prevIndex = (currentIndex - 1 + results.length) % results.length;
    setCurrentIndex(prevIndex);

    if (editorRef.current) {
      editorRef.current.setHighlights(createHighlights(results, prevIndex));
      editorRef.current.scrollToLine(
        results[prevIndex].line,
        results[prevIndex].column,
      );
    }
  }, [results, currentIndex, editorRef]);

  // 置換
  const handleReplace = useCallback(() => {
    if (results.length === 0 || currentIndex < 0) return;
    if (!editorRef.current) return;

    const match = results[currentIndex];
    editorRef.current.replaceText(
      match.line,
      match.column,
      match.length,
      replaceText,
    );

    // 検索を再実行
    performSearch();
  }, [results, currentIndex, replaceText, editorRef, performSearch]);

  // 全置換
  const handleReplaceAll = useCallback(() => {
    if (results.length === 0) return;
    if (!editorRef.current) return;

    editorRef.current.replaceAllText(
      results.map((m) => ({
        line: m.line,
        column: m.column,
        length: m.length,
      })),
      replaceText,
    );

    // 検索を再実行
    performSearch();
  }, [results, replaceText, editorRef, performSearch]);

  // キーボードイベント
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (e.altKey && showReplaceMode) {
          handleReplaceAll();
        } else if (!searchQuery) {
          // 空クエリの場合は検索を実行（ハイライトクリア）
          performSearch();
        } else if (results.length > 0) {
          // 結果がある場合は次/前の結果へ
          if (e.shiftKey) {
            goToPrevious();
          } else {
            goToNext();
          }
        } else {
          // 結果がない場合は検索を実行
          performSearch();
        }
        return;
      }
    },
    [
      onClose,
      goToNext,
      goToPrevious,
      handleReplaceAll,
      showReplaceMode,
      results.length,
      performSearch,
      searchQuery,
    ],
  );

  // グローバルキーボードイベント
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F3") {
        if (e.shiftKey) {
          goToPrevious();
        } else {
          goToNext();
        }
        e.preventDefault();
      }

      // 注意: Cmd+H はMacの「アプリを隠す」と競合するため使用しない
      // 置換モードの切り替えは EditorView で Cmd+T を使用
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen, goToNext, goToPrevious]);

  if (!isOpen) return null;

  const hasResults = results.length > 0;
  const displayIndex = hasResults ? currentIndex + 1 : 0;

  return (
    <div
      role="dialog"
      aria-label="検索"
      aria-modal={false}
      className="search-panel bg-zinc-800 shadow-lg rounded-lg p-3 border border-zinc-600"
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col gap-2">
        {/* 検索行 */}
        <div className="flex items-center gap-2">
          {/* 展開/折りたたみボタン */}
          <button
            type="button"
            onClick={() => setShowReplaceMode(!showReplaceMode)}
            aria-label={showReplaceMode ? "置換を隠す" : "置換を表示"}
            aria-expanded={showReplaceMode}
            className="p-1 text-zinc-300 hover:bg-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showReplaceMode ? "rotate-90" : ""}`}
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
          </button>

          {/* 検索入力 */}
          <input
            ref={searchInputRef}
            type="search"
            role="searchbox"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="検索... (Enterで実行)"
            aria-label="検索"
            aria-describedby="search-status"
            className={`flex-1 px-3 py-1.5 bg-zinc-900 text-zinc-100 placeholder-zinc-500 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? "border-red-500" : "border-zinc-600"
            }`}
          />

          {/* 検索ボタン */}
          <button
            type="button"
            onClick={performSearch}
            aria-label="検索実行"
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            検索
          </button>

          {/* 検索オプション */}
          <SearchOptionButtons
            caseSensitive={caseSensitive}
            onCaseSensitiveChange={setCaseSensitive}
            wholeWord={wholeWord}
            onWholeWordChange={setWholeWord}
            regex={regex}
            onRegexChange={setRegex}
          />

          {/* ステータス */}
          <div
            id="search-status"
            role="status"
            aria-live="polite"
            className="text-sm text-zinc-400 min-w-[60px] text-center"
          >
            {error ? (
              <span className="text-red-400">{error}</span>
            ) : hasResults ? (
              `${displayIndex}/${results.length}`
            ) : searchQuery && results.length === 0 ? (
              <span className="text-zinc-500">結果なし</span>
            ) : null}
          </div>

          {/* ナビゲーション */}
          <button
            type="button"
            onClick={goToPrevious}
            disabled={!hasResults}
            aria-label="前の結果"
            className="p-1.5 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={goToNext}
            disabled={!hasResults}
            aria-label="次の結果"
            className="p-1.5 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="p-1.5 text-zinc-300 rounded hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 置換行 */}
        {showReplaceMode && (
          <div className="flex items-center gap-2 pl-7">
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="置換..."
              className="flex-1 px-3 py-1.5 bg-zinc-900 text-zinc-100 placeholder-zinc-500 border border-zinc-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={handleReplace}
              disabled={!hasResults}
              aria-label="置換"
              className="px-3 py-1.5 text-sm bg-zinc-700 text-zinc-100 rounded hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              置換
            </button>

            <button
              type="button"
              onClick={handleReplaceAll}
              disabled={!hasResults}
              aria-label="すべて置換"
              className="px-3 py-1.5 text-sm bg-zinc-700 text-zinc-100 rounded hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              全置換
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
