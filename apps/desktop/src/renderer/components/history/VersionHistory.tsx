/**
 * VersionHistory Component
 *
 * バージョン履歴一覧表示コンポーネント
 *
 * @module @repo/desktop/renderer/components/history/VersionHistory
 */

import { useVersionHistory } from "../../hooks/useVersionHistory";
import type { VersionHistoryItem as VersionHistoryItemType } from "./types";

export interface VersionHistoryProps {
  /** ファイルID */
  fileId: string;
  /** アイテム選択時コールバック */
  onVersionSelect?: (item: VersionHistoryItemType) => void;
  /** 復元ボタン押下時コールバック */
  onRestore?: (item: VersionHistoryItemType) => void;
}

/**
 * 日時をフォーマット
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * ファイルサイズをフォーマット
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * ローディングスケルトン
 */
function LoadingSkeleton(): JSX.Element {
  return (
    <div role="status" aria-label="読み込み中" className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-lg bg-gray-200"
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
function ErrorDisplay({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}): JSX.Element {
  return (
    <div role="alert" className="rounded-lg bg-red-50 p-4 text-center">
      <p className="mb-3 text-red-700">エラーが発生しました: {message}</p>
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
  return <div className="py-8 text-center text-gray-500">履歴がありません</div>;
}

/**
 * 履歴アイテムコンポーネント
 */
function VersionHistoryItem({
  item,
  onSelect,
  onRestore,
}: {
  item: VersionHistoryItemType;
  onSelect?: (item: VersionHistoryItemType) => void;
  onRestore?: (item: VersionHistoryItemType) => void;
}): JSX.Element {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect?.(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.(item);
          }
        }}
        className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`バージョン ${item.version}${item.isLatest ? " (最新)" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">v{item.version}</span>
            {item.isLatest && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                現在
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formatSize(item.size)}
            </span>
            {!item.isLatest && onRestore && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(item);
                }}
                className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`バージョン ${item.version} に復元`}
              >
                復元
              </button>
            )}
          </div>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          {formatDate(item.createdAt)}
        </div>
      </button>
    </li>
  );
}

/**
 * バージョン履歴一覧コンポーネント
 */
export function VersionHistory({
  fileId,
  onVersionSelect,
  onRestore,
}: VersionHistoryProps): JSX.Element {
  const { history, isLoading, error, hasMore, loadMore, refresh } =
    useVersionHistory(fileId);

  // ローディング中
  if (isLoading && history.length === 0) {
    return <LoadingSkeleton />;
  }

  // エラー時
  if (error && history.length === 0) {
    return <ErrorDisplay message={error.message} onRetry={refresh} />;
  }

  // 空状態
  if (history.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <ul role="list" aria-label="バージョン履歴" className="space-y-2">
        {history.map((item) => (
          <VersionHistoryItem
            key={item.conversionId}
            item={item}
            onSelect={onVersionSelect}
            onRestore={onRestore}
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
