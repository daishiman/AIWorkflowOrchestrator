/**
 * VersionDetail Component
 *
 * バージョン詳細表示コンポーネント
 *
 * @module @repo/desktop/renderer/components/history/VersionDetail
 */

import { useVersionDetail } from "../../hooks/useVersionDetail";
import type { ConversionLog } from "./types";

export interface VersionDetailProps {
  /** 変換ID */
  conversionId: string;
  /** 復元ボタンクリック時コールバック */
  onRestore: () => void;
  /** 閉じるボタンクリック時コールバック */
  onClose: () => void;
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
    second: "2-digit",
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
 * ログレベルに応じたスタイルクラスを取得
 */
function getLogLevelStyle(level: ConversionLog["level"]): string {
  const styles = {
    info: "text-blue-700 bg-blue-50",
    warn: "text-amber-700 bg-amber-50",
    error: "text-red-700 bg-red-50",
    debug: "text-gray-700 bg-gray-50",
  };
  return styles[level];
}

/**
 * ローディングスケルトン
 */
function LoadingSkeleton(): JSX.Element {
  return (
    <div role="status" aria-label="読み込み中" className="space-y-4">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-6 animate-pulse rounded bg-gray-200"
            aria-hidden="true"
          />
        ))}
      </div>
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
      <p className="mb-3 text-red-700">データの取得に失敗しました</p>
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
 * ログエントリコンポーネント
 */
function LogEntry({ log }: { log: ConversionLog }): JSX.Element {
  return (
    <li
      data-level={log.level}
      className={`rounded-md p-2 text-sm ${getLogLevelStyle(log.level)}`}
    >
      <div className="flex items-start gap-2">
        <span className="font-mono text-xs uppercase opacity-75">
          [{log.level}]
        </span>
        <span className="flex-1">{log.message}</span>
        <span className="text-xs opacity-60">
          {new Date(log.timestamp).toLocaleTimeString("ja-JP")}
        </span>
      </div>
    </li>
  );
}

/**
 * バージョン詳細コンポーネント
 */
export function VersionDetail({
  conversionId,
  onRestore,
  onClose,
}: VersionDetailProps): JSX.Element {
  const { version, logs, isLoading, error } = useVersionDetail(conversionId);

  // ローディング中
  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            閉じる
          </button>
          <button
            type="button"
            disabled
            aria-label="このバージョンに復元"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            このバージョンに復元
          </button>
        </div>
      </div>
    );
  }

  // エラー時
  if (error || !version) {
    return (
      <ErrorDisplay
        onRetry={() => {
          // Re-mount to trigger refetch
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          バージョン v{version.version}
          {version.isLatest && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              最新
            </span>
          )}
        </h2>
      </header>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500">詳細情報</h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-gray-500">作成日時</dt>
          <dd className="text-gray-900">{formatDate(version.createdAt)}</dd>

          <dt className="text-gray-500">サイズ</dt>
          <dd className="text-gray-900">{formatSize(version.size)}</dd>

          <dt className="text-gray-500">MIMEタイプ</dt>
          <dd className="text-gray-900">{version.mimeType}</dd>

          <dt className="text-gray-500">ハッシュ</dt>
          <dd className="font-mono text-xs text-gray-900">{version.hash}</dd>
        </dl>
      </section>

      {version.metadata && Object.keys(version.metadata).length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500">メタデータ</h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(version.metadata).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="text-gray-500">{key}</dt>
                <dd className="text-gray-900">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {logs.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500">変換ログ</h3>
          <ul role="list" className="space-y-1">
            {logs.map((log, index) => (
              <LogEntry key={`${log.timestamp}-${index}`} log={log} />
            ))}
          </ul>
        </section>
      )}

      <footer className="flex justify-end gap-2 border-t pt-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          閉じる
        </button>
        <button
          type="button"
          onClick={onRestore}
          disabled={version.isLatest}
          aria-label="このバージョンに復元"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          このバージョンに復元
        </button>
      </footer>
    </div>
  );
}
