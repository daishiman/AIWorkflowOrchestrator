import React, { useEffect } from "react";
import clsx from "clsx";
import {
  useHistorySearchError,
  useHistorySearchFilter,
  useHistorySearchHasMore,
  useHistorySearchQuery,
  useHistorySearchResults,
  useHistorySearchStats,
  useHistorySearchStatsError,
  useHistorySearchTotalCount,
  useIsHistorySearching,
  useLoadHistorySearchStats,
  useLoadMoreHistory,
  useResetHistorySearch,
  useSearchHistory,
  useSetHistorySearchFilter,
  useSetHistorySearchQuery,
} from "../../store";
import type { HistoryItem, HistoryItemType } from "@repo/shared/types";

type SearchFilter = HistoryItemType | "all";

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "不明な時刻";
  }

  return date.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function filterLabel(filter: SearchFilter): string {
  switch (filter) {
    case "chat":
      return "チャット";
    case "file":
      return "ファイル";
    case "skill":
      return "スキル";
    default:
      return "すべて";
  }
}

function metadataSummary(item: HistoryItem): string {
  if (item.metadata.type === "chat") {
    return `セッション: ${item.metadata.sessionId} / ${item.metadata.messageCount}件`;
  }

  if (item.metadata.type === "file") {
    return `ファイル: ${item.metadata.filePath} / +${item.metadata.additions} -${item.metadata.deletions}`;
  }

  return `スキル: ${item.metadata.skillName} / 結果: ${item.metadata.status}`;
}

export const HistorySearchView: React.FC = () => {
  const query = useHistorySearchQuery();
  const filter = useHistorySearchFilter();
  const results = useHistorySearchResults();
  const totalCount = useHistorySearchTotalCount();
  const hasMore = useHistorySearchHasMore();
  const isSearching = useIsHistorySearching();
  const error = useHistorySearchError();
  const stats = useHistorySearchStats();
  const statsError = useHistorySearchStatsError();

  const setQuery = useSetHistorySearchQuery();
  const setFilter = useSetHistorySearchFilter();
  const searchHistory = useSearchHistory();
  const loadMoreHistory = useLoadMoreHistory();
  const loadStats = useLoadHistorySearchStats();
  const resetHistory = useResetHistorySearch();

  useEffect(() => {
    void loadStats();
    void searchHistory("", 0, "all");
    return () => {
      resetHistory();
    };
  }, [loadStats, resetHistory, searchHistory]);

  const handleSearch = async () => {
    await searchHistory(query, 0, filter);
  };

  const handleFilterChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextFilter = event.target.value as SearchFilter;
    setFilter(nextFilter);
    await searchHistory(query, 0, nextFilter);
    await loadStats();
  };

  return (
    <div
      className="flex h-full w-full flex-col gap-4 p-6"
      data-testid="history-search-view"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          履歴検索
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          通知・チャット・ファイル・スキルの履歴を横断検索します。
        </p>
      </header>

      <section
        className={clsx(
          "rounded-xl border border-[var(--border-primary)]",
          "bg-[var(--bg-secondary)] p-4",
        )}
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="履歴を検索"
            className={clsx(
              "rounded-lg border border-[var(--border-primary)] px-3 py-2",
              "bg-[var(--bg-primary)] text-sm text-[var(--text-primary)]",
            )}
            data-testid="history-search-input"
            aria-label="履歴検索クエリ"
          />

          <select
            value={filter}
            onChange={(event) => {
              void handleFilterChange(event);
            }}
            className={clsx(
              "rounded-lg border border-[var(--border-primary)] px-3 py-2",
              "bg-[var(--bg-primary)] text-sm text-[var(--text-primary)]",
            )}
            data-testid="history-search-filter"
            aria-label="履歴検索フィルタ"
          >
            <option value="all">すべて</option>
            <option value="chat">チャット</option>
            <option value="file">ファイル</option>
            <option value="skill">スキル</option>
          </select>

          <button
            type="button"
            onClick={() => {
              void handleSearch();
            }}
            className={clsx(
              "rounded-lg bg-[var(--status-primary)] px-4 py-2 text-sm font-medium text-white",
              "hover:opacity-90",
            )}
            data-testid="history-search-submit"
          >
            検索
          </button>
        </div>

        <p className="mt-3 text-xs text-[var(--text-secondary)]">
          フィルタ: {filterLabel(filter)} / 合計 {totalCount} 件
        </p>
      </section>

      <section
        className={clsx(
          "rounded-xl border border-[var(--border-primary)]",
          "bg-[var(--bg-secondary)] p-4",
        )}
        data-testid="history-stats-panel"
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            履歴統計
          </h2>
          <button
            type="button"
            className="text-xs text-[var(--text-secondary)] underline"
            onClick={() => {
              void loadStats();
            }}
          >
            再取得
          </button>
        </div>
        {statsError ? (
          <p className="text-xs text-[var(--status-error)]">{statsError}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg bg-[var(--bg-primary)] p-3">
              <p className="text-[11px] text-[var(--text-secondary)]">
                チャット
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {stats.chat}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--bg-primary)] p-3">
              <p className="text-[11px] text-[var(--text-secondary)]">
                ファイル
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {stats.file}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--bg-primary)] p-3">
              <p className="text-[11px] text-[var(--text-secondary)]">スキル</p>
              <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {stats.skill}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--bg-primary)] p-3">
              <p className="text-[11px] text-[var(--text-secondary)]">合計</p>
              <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                {stats.total}
              </p>
            </div>
          </div>
        )}
      </section>

      <section
        className={clsx(
          "flex-1 overflow-auto rounded-xl border border-[var(--border-primary)]",
          "bg-[var(--bg-secondary)] p-4",
        )}
        data-testid="history-search-result-list"
      >
        {isSearching ? (
          <p className="text-sm text-[var(--text-secondary)]">検索中...</p>
        ) : error ? (
          <p className="text-sm text-[var(--status-error)]">{error}</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            条件に一致する履歴はありません。
          </p>
        ) : (
          <div className="space-y-2">
            {results.map((item) => (
              <article
                key={item.id}
                className={clsx(
                  "rounded-lg border border-[var(--border-primary)]",
                  "bg-[var(--bg-primary)] p-3",
                )}
                data-testid={`history-item-${item.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {metadataSummary(item)}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {item.preview}
                </p>
              </article>
            ))}

            {hasMore ? (
              <button
                type="button"
                className={clsx(
                  "mt-2 rounded-lg border border-[var(--border-primary)] px-3 py-2",
                  "text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]",
                )}
                onClick={() => {
                  void loadMoreHistory();
                }}
                data-testid="history-search-load-more"
              >
                さらに読み込む
              </button>
            ) : (
              <p className="pt-2 text-xs text-[var(--text-secondary)]">
                すべて表示しました
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default HistorySearchView;
