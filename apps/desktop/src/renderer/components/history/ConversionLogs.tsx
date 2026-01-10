/**
 * ConversionLogs Component
 *
 * 変換ログ一覧表示コンポーネント
 *
 * @module @repo/desktop/renderer/components/history/ConversionLogs
 */

import { useState } from "react";
import { useConversionLogs } from "../../hooks/useConversionLogs";
import type { ConversionLog, LogLevel } from "./types";

export interface ConversionLogsProps {
  /** 変換ID */
  conversionId: string;
}

/**
 * ログレベルに応じたスタイルクラスを取得
 */
function getLogLevelStyle(level: LogLevel): string {
  const styles = {
    info: "text-blue-700 bg-blue-50 border-blue-200",
    warn: "text-amber-700 bg-amber-50 border-amber-200",
    error: "text-red-700 bg-red-50 border-red-200",
    debug: "text-gray-700 bg-gray-50 border-gray-200",
  };
  return styles[level];
}

/**
 * 日時をフォーマット
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  // Use 24-hour format with hours and minutes
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * ローディングスケルトン
 */
function LoadingSkeleton(): JSX.Element {
  return (
    <div role="status" aria-label="読み込み中" className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-md bg-gray-200"
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">読み込み中...</span>
    </div>
  );
}

/**
 * エラー表示
 */
function ErrorDisplay({ onRetry }: { onRetry: () => void }): JSX.Element {
  return (
    <div role="alert" className="rounded-lg bg-red-50 p-4 text-center">
      <p className="mb-3 text-red-700">ログの取得に失敗しました</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        再試行
      </button>
    </div>
  );
}

/**
 * 空状態表示
 */
function EmptyState(): JSX.Element {
  return <div className="py-8 text-center text-gray-500">ログがありません</div>;
}

/**
 * ログエントリコンポーネント
 */
function LogEntry({
  log,
  isExpanded,
  onToggle,
}: {
  log: ConversionLog;
  isExpanded: boolean;
  onToggle: () => void;
}): JSX.Element {
  const hasDetails = log.details && Object.keys(log.details).length > 0;

  return (
    <li
      data-level={log.level}
      className={`rounded-md border p-3 ${getLogLevelStyle(log.level)}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded px-1.5 py-0.5 font-mono text-xs font-medium uppercase">
          {log.level}
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words">{log.message}</p>
          {isExpanded && log.details && (
            <pre className="mt-2 overflow-auto rounded bg-black/10 p-2 text-xs">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-xs opacity-60">
            {formatTimestamp(log.timestamp)}
          </span>
          {hasDetails && (
            <button
              type="button"
              onClick={onToggle}
              className="rounded px-2 py-1 text-xs hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "詳細を閉じる" : "詳細を展開"}
            >
              {isExpanded ? "閉じる" : "詳細"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * フィルタセレクター
 */
function LevelFilter({
  value,
  onChange,
}: {
  value: LogLevel | undefined;
  onChange: (level: LogLevel | undefined) => void;
}): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="log-level-filter"
        className="text-sm font-medium text-gray-700"
      >
        レベルフィルタ
      </label>
      <select
        id="log-level-filter"
        value={value ?? "all"}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "all" ? undefined : (val as LogLevel));
        }}
        className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
        aria-label="レベルフィルタ"
      >
        <option value="all">すべて</option>
        <option value="info">info</option>
        <option value="warn">warn</option>
        <option value="error">error</option>
        <option value="debug">debug</option>
      </select>
    </div>
  );
}

/**
 * 変換ログ一覧コンポーネント
 */
export function ConversionLogs({
  conversionId,
}: ConversionLogsProps): JSX.Element {
  const [filterLevel, setFilterLevel] = useState<LogLevel | undefined>();
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(
    new Set(),
  );

  const { logs, isLoading, error, hasMore, loadMore, setFilter, refresh } =
    useConversionLogs(conversionId, { level: filterLevel });

  const handleFilterChange = (level: LogLevel | undefined) => {
    setFilterLevel(level);
    setFilter({ level });
    setExpandedIndices(new Set());
  };

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // ローディング中（初回）
  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-4">
        <LevelFilter value={filterLevel} onChange={handleFilterChange} />
        <LoadingSkeleton />
      </div>
    );
  }

  // エラー時
  if (error && logs.length === 0) {
    return (
      <div className="space-y-4">
        <LevelFilter value={filterLevel} onChange={handleFilterChange} />
        <ErrorDisplay onRetry={refresh} />
      </div>
    );
  }

  // 空状態
  if (logs.length === 0) {
    return (
      <div className="space-y-4">
        <LevelFilter value={filterLevel} onChange={handleFilterChange} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LevelFilter value={filterLevel} onChange={handleFilterChange} />

      <ul role="list" className="space-y-2">
        {logs.map((log, index) => (
          <LogEntry
            key={`${log.timestamp}-${index}`}
            log={log}
            isExpanded={expandedIndices.has(index)}
            onToggle={() => toggleExpand(index)}
          />
        ))}
      </ul>

      {hasMore && (
        <div className="text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "読み込み中..." : "さらに読み込む"}
          </button>
        </div>
      )}
    </div>
  );
}
