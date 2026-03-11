import React, { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import {
  useAppStore,
  useExpandedHistoryItemId,
  useHistorySearchError,
  useHistorySearchHasMore,
  useHistorySearchQuery,
  useHistorySearchResults,
  useHistorySearchTotalCount,
  useIsHistorySearching,
  useResetHistorySearch,
  useSearchHistory,
  useSetHistorySearchQuery,
  useToggleHistoryItemExpanded,
} from "../../store";
import { SkeletonCard } from "../../components/atoms/SkeletonCard";
import { HistorySearchBar } from "./components/HistorySearchBar";
import { HistoryEmptyState } from "./components/HistoryEmptyState";
import { InfiniteScrollSentinel } from "./components/InfiniteScrollSentinel";
import { TimelineGroup } from "./components/TimelineGroup";
import {
  HISTORY_SEARCH_DEBOUNCE_MS,
  HISTORY_SEARCH_OBSERVER_ROOT_MARGIN,
  HISTORY_SEARCH_OBSERVER_THRESHOLD,
} from "./constants";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import { useTimelineGroups } from "./hooks/useTimelineGroups";

function HistoryLoadingState() {
  return (
    <div className="space-y-3" data-testid="history-search-loading">
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonCard key={index} variant="list-item" height="88px" />
      ))}
    </div>
  );
}

export const HistorySearchView: React.FC = () => {
  const query = useHistorySearchQuery();
  const results = useHistorySearchResults();
  const totalCount = useHistorySearchTotalCount();
  const hasMore = useHistorySearchHasMore();
  const isSearching = useIsHistorySearching();
  const error = useHistorySearchError();
  const expandedItemId = useExpandedHistoryItemId();

  const hasFetchedHistory = useAppStore((state) => state.hasFetchedHistory);
  const isHistoryLoadingMore = useAppStore(
    (state) => state.isHistoryLoadingMore,
  );
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const requestOpenFile = useAppStore((state) => state.requestOpenFile);
  const loadMoreHistory = useAppStore((state) => state.loadMoreHistory);

  const setQuery = useSetHistorySearchQuery();
  const searchHistory = useSearchHistory();
  const resetHistory = useResetHistorySearch();
  const toggleItemExpanded = useToggleHistoryItemExpanded();

  const debouncedQuery = useDebouncedValue(query, HISTORY_SEARCH_DEBOUNCE_MS);
  const lastExecutedQueryRef = useRef<string>("");

  useEffect(() => {
    void searchHistory("", 0, "all");
    return () => {
      resetHistory();
    };
  }, [resetHistory, searchHistory]);

  useEffect(() => {
    const normalizedQuery = debouncedQuery.trim();
    if (normalizedQuery === lastExecutedQueryRef.current) {
      return;
    }

    lastExecutedQueryRef.current = normalizedQuery;
    void searchHistory(normalizedQuery, 0, "all");
  }, [debouncedQuery, searchHistory]);

  const timelineGroups = useTimelineGroups(results);
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isSearching || isHistoryLoadingMore,
    onLoadMore: () => {
      void loadMoreHistory();
    },
    rootMargin: HISTORY_SEARCH_OBSERVER_ROOT_MARGIN,
    threshold: HISTORY_SEARCH_OBSERVER_THRESHOLD,
  });

  const hasResults = results.length > 0;
  const normalizedQuery = query.trim();
  const stateMode = useMemo(() => {
    if (error) return "error" as const;
    if (!hasFetchedHistory && isSearching) return "loading" as const;
    if (hasResults) return "results" as const;
    if (normalizedQuery !== "") return "search-empty" as const;
    return "empty" as const;
  }, [error, hasFetchedHistory, hasResults, isSearching, normalizedQuery]);

  const handleClearSearch = () => {
    lastExecutedQueryRef.current = "";
    setQuery("");
    void searchHistory("", 0, "all");
  };

  const handleRetry = () => {
    void searchHistory(query.trim(), 0, "all");
  };

  const handleOpenFile = (filePath: string) => {
    requestOpenFile(filePath);
    setCurrentView("editor");
  };

  return (
    <div
      className={clsx(
        "mx-auto flex h-full w-full max-w-5xl flex-col gap-5 px-3 pb-6 pt-4 md:px-6",
        "text-[var(--text-primary)]",
      )}
      data-testid="history-search-view"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
          History
        </p>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              あなたの記録
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              やりとり、ファイル、スキルの流れを時系列で振り返れます。
            </p>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            {hasResults
              ? `${totalCount}件の記録`
              : "検索は必要なときだけ使います"}
          </div>
        </div>
      </header>

      <HistorySearchBar
        value={query}
        onChange={setQuery}
        onClear={handleClearSearch}
      />

      <section
        className={clsx(
          "flex-1 overflow-auto rounded-[28px] border border-[var(--border-primary)]",
          "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg-secondary)_96%,white_4%),var(--bg-primary))]",
          "px-4 py-4 shadow-[0_24px_56px_rgba(15,23,42,0.08)] md:px-6",
        )}
        data-testid="history-search-timeline"
      >
        {stateMode === "loading" ? <HistoryLoadingState /> : null}

        {stateMode === "error" ? (
          <HistoryEmptyState mode="error" onPrimaryAction={handleRetry} />
        ) : null}

        {stateMode === "empty" ? (
          <HistoryEmptyState
            mode="empty"
            onPrimaryAction={() => setCurrentView("chat")}
          />
        ) : null}

        {stateMode === "search-empty" ? (
          <HistoryEmptyState
            mode="search"
            query={query}
            onPrimaryAction={handleClearSearch}
          />
        ) : null}

        {stateMode === "results" ? (
          <div className="space-y-6">
            {timelineGroups.map((group) => (
              <TimelineGroup
                key={group.id}
                group={group}
                expandedItemId={expandedItemId}
                onToggleItem={toggleItemExpanded}
                onOpenFile={handleOpenFile}
              />
            ))}
            <InfiniteScrollSentinel
              hasMore={hasMore}
              isLoading={isHistoryLoadingMore}
              sentinelRef={sentinelRef}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default HistorySearchView;
