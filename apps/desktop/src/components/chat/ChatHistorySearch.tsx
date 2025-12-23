/**
 * ChatHistorySearch - チャット履歴検索コンポーネント
 *
 * 検索入力とフィルターパネルを提供するmoleculeコンポーネント。
 * WCAG 2.1 AA準拠、Apple HIG準拠のデザイン。
 *
 * @see docs/30-workflows/chat-history-persistence/ui-ux-design.md
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import type {
  ChatHistorySearchProps,
  SearchFilters,
  DatePreset,
} from "./types";
import {
  hasActiveFilters,
  getDateRangeFromPreset,
  formatDateForInput,
} from "./chat-search-utils";

/**
 * ChatHistorySearch コンポーネント
 */
export function ChatHistorySearch({
  filters,
  onFiltersChange,
  onClearFilters,
  onSearch,
  availableModels,
  debounceMs = 300,
}: ChatHistorySearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localQuery, setLocalQuery] = useState(filters.query);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // キーボードショートカット (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // デバウンス検索
  const debouncedSearch = useCallback(
    (newFilters: SearchFilters) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onSearch(newFilters);
      }, debounceMs);
    },
    [onSearch, debounceMs],
  );

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 検索入力ハンドラー
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setLocalQuery(newQuery);

    const newFilters: SearchFilters = {
      ...filters,
      query: newQuery,
    };
    debouncedSearch(newFilters);
  };

  // 日付プリセット選択ハンドラー
  const handlePresetSelect = (preset: DatePreset) => {
    const dateRange = getDateRangeFromPreset(preset);
    const newFilters: SearchFilters = {
      ...filters,
      preset,
      dateFrom: dateRange?.from ?? null,
      dateTo: dateRange?.to ?? null,
    };
    onFiltersChange(newFilters);
  };

  // カスタム日付変更ハンドラー
  const handleDateChange = (field: "dateFrom" | "dateTo", value: string) => {
    const date = value ? new Date(value) : null;
    const newFilters: SearchFilters = {
      ...filters,
      [field]: date,
      preset: "custom",
    };
    onFiltersChange(newFilters);
  };

  // モデル選択ハンドラー
  const handleModelToggle = (modelKey: string) => {
    const newModels = filters.models.includes(modelKey)
      ? filters.models.filter((m) => m !== modelKey)
      : [...filters.models, modelKey];

    const newFilters: SearchFilters = {
      ...filters,
      models: newModels,
    };
    onFiltersChange(newFilters);
  };

  // フィルターアクティブ状態
  const filtersActive = hasActiveFilters(filters);

  return (
    <div role="search" className="relative">
      {/* 検索入力 */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hig-text-secondary"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          placeholder="チャット履歴を検索..."
          aria-label="チャット履歴を検索"
          aria-describedby="search-hint"
          value={localQuery}
          onChange={handleQueryChange}
          className="w-full rounded-hig-md border border-hig-border bg-hig-bg-primary py-2 pl-10 pr-12 text-hig-text-primary placeholder:text-hig-text-secondary focus:border-hig-accent focus:outline-none focus:ring-2 focus:ring-hig-accent/30 transition-colors duration-hig-micro"
        />
        <span id="search-hint" className="sr-only">
          キーワードを入力して履歴を検索
        </span>

        {/* フィルターボタン */}
        <button
          type="button"
          aria-label="フィルターを展開"
          aria-expanded={isExpanded}
          aria-controls="filter-panel"
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-hig-sm p-1 hover:bg-hig-bg-secondary focus:outline-none focus:ring-2 focus:ring-hig-accent/50 transition-colors duration-hig-micro"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-hig-text-secondary" />
          ) : (
            <ChevronDown className="h-4 w-4 text-hig-text-secondary" />
          )}
        </button>
      </div>

      {/* フィルターアクティブバッジ */}
      {filtersActive && !isExpanded && (
        <div className="mt-1 text-xs text-hig-accent">フィルター適用中</div>
      )}

      {/* フィルターパネル */}
      {isExpanded && (
        <div
          id="filter-panel"
          role="region"
          aria-label="検索フィルター"
          className="mt-2 rounded-hig-md border border-hig-border bg-hig-bg-primary p-4 shadow-hig-md transition-all duration-hig-fast"
        >
          {/* 日付プリセット */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-hig-text-primary">
              日付範囲
            </h3>
            <div className="flex flex-wrap gap-2">
              {(["today", "7days", "30days"] as const).map((preset) => {
                const labels: Record<typeof preset, string> = {
                  today: "今日",
                  "7days": "過去7日",
                  "30days": "過去30日",
                };
                const isActive = filters.preset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`rounded-hig-sm px-3 py-1 text-sm transition-colors duration-hig-micro ${
                      isActive
                        ? "bg-hig-accent text-white active selected"
                        : "bg-hig-bg-secondary text-hig-text-primary hover:bg-hig-bg-tertiary"
                    }`}
                  >
                    {labels[preset]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* カスタム日付範囲 */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="date-from"
                className="mb-1 block text-sm text-hig-text-secondary"
              >
                開始日
              </label>
              <input
                type="date"
                id="date-from"
                aria-label="開始日"
                value={formatDateForInput(filters.dateFrom)}
                onChange={(e) => handleDateChange("dateFrom", e.target.value)}
                className="w-full rounded-hig-sm border border-hig-border bg-hig-bg-primary px-3 py-1.5 text-sm text-hig-text-primary focus:border-hig-accent focus:outline-none focus:ring-2 focus:ring-hig-accent/30"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="date-to"
                className="mb-1 block text-sm text-hig-text-secondary"
              >
                終了日
              </label>
              <input
                type="date"
                id="date-to"
                aria-label="終了日"
                value={formatDateForInput(filters.dateTo)}
                onChange={(e) => handleDateChange("dateTo", e.target.value)}
                className="w-full rounded-hig-sm border border-hig-border bg-hig-bg-primary px-3 py-1.5 text-sm text-hig-text-primary focus:border-hig-accent focus:outline-none focus:ring-2 focus:ring-hig-accent/30"
              />
            </div>
          </div>

          {/* モデルフィルター */}
          {availableModels.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-hig-text-primary">
                モデル
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableModels.map((modelInfo) => {
                  const modelKey = `${modelInfo.provider}/${modelInfo.model}`;
                  const isChecked = filters.models.includes(modelKey);
                  return (
                    <label
                      key={modelKey}
                      className="flex cursor-pointer items-center gap-2 rounded-hig-sm bg-hig-bg-secondary px-3 py-1.5 text-sm transition-colors duration-hig-micro hover:bg-hig-bg-tertiary"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleModelToggle(modelKey)}
                        aria-label={modelInfo.model}
                        className="h-4 w-4 rounded border-hig-border text-hig-accent focus:ring-hig-accent/50"
                      />
                      <span className="text-hig-text-primary">
                        {modelInfo.model}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClearFilters}
              disabled={!filtersActive}
              className="rounded-hig-sm px-3 py-1.5 text-sm text-hig-text-secondary transition-colors duration-hig-micro hover:bg-hig-bg-secondary focus:outline-none focus:ring-2 focus:ring-hig-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              クリア
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatHistorySearch;
