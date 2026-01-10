/**
 * useVersionHistory Hook
 *
 * ファイルのバージョン履歴を取得・管理するカスタムフック
 *
 * @module @repo/desktop/renderer/hooks/useVersionHistory
 */

import { useState, useEffect, useCallback } from "react";
import type {
  VersionHistoryItem,
  PaginationOptions,
} from "../components/history/types";

const DEFAULT_LIMIT = 20;

interface UseVersionHistoryReturn {
  /** 履歴データ */
  history: VersionHistoryItem[];
  /** ローディング中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 追加データの有無 */
  hasMore: boolean;
  /** 追加データ読み込み */
  loadMore: () => Promise<void>;
  /** データ再取得 */
  refresh: () => Promise<void>;
}

/**
 * バージョン履歴取得フック
 *
 * @param fileId - ファイルID
 * @returns 履歴データと操作関数
 */
export function useVersionHistory(fileId: string): UseVersionHistoryReturn {
  const [history, setHistory] = useState<VersionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchHistory = useCallback(
    async (options: PaginationOptions, append = false) => {
      if (!window.historyAPI) {
        setError(new Error("History API not available"));
        setIsLoading(false);
        return;
      }

      try {
        if (!append) {
          setIsLoading(true);
        }

        const result = await window.historyAPI.getFileHistory(fileId, options);

        if (result.success) {
          if (append) {
            setHistory((prev) => [...prev, ...result.data.items]);
          } else {
            setHistory(result.data.items);
          }
          setHasMore(result.data.hasMore);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [fileId],
  );

  // 初期データ取得
  useEffect(() => {
    setOffset(0);
    fetchHistory({ limit: DEFAULT_LIMIT, offset: 0 });
  }, [fetchHistory]);

  // 追加データ読み込み
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    const newOffset = offset + DEFAULT_LIMIT;
    setOffset(newOffset);
    await fetchHistory({ limit: DEFAULT_LIMIT, offset: newOffset }, true);
  }, [hasMore, isLoading, offset, fetchHistory]);

  // リフレッシュ
  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchHistory({ limit: DEFAULT_LIMIT, offset: 0 });
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
