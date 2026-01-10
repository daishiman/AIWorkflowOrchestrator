/**
 * useConversionLogs Hook
 *
 * 変換ログを取得・管理するカスタムフック
 *
 * @module @repo/desktop/renderer/hooks/useConversionLogs
 */

import { useState, useEffect, useCallback } from "react";
import type {
  ConversionLog,
  LogLevel,
  LogFilterOptions,
} from "../components/history/types";

const DEFAULT_LIMIT = 20;

interface FilterState {
  level?: LogLevel;
}

interface UseConversionLogsOptions {
  level?: LogLevel;
}

interface UseConversionLogsReturn {
  /** ログデータ */
  logs: ConversionLog[];
  /** ローディング中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 追加データの有無 */
  hasMore: boolean;
  /** 追加データ読み込み */
  loadMore: () => Promise<void>;
  /** フィルタ設定 */
  setFilter: (filter: FilterState) => void;
  /** リフレッシュ */
  refresh: () => Promise<void>;
}

/**
 * 変換ログ取得フック
 *
 * @param conversionId - 変換ID
 * @param initialOptions - 初期オプション
 * @returns ログデータと操作関数
 */
export function useConversionLogs(
  conversionId: string,
  initialOptions?: UseConversionLogsOptions,
): UseConversionLogsReturn {
  const [logs, setLogs] = useState<ConversionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [filter, setFilterState] = useState<FilterState>({
    level: initialOptions?.level,
  });

  const fetchLogs = useCallback(
    async (options: LogFilterOptions, append = false) => {
      if (!window.historyAPI) {
        setError(new Error("History API not available"));
        setIsLoading(false);
        return;
      }

      try {
        if (!append) {
          setIsLoading(true);
        }

        const result = await window.historyAPI.getConversionLogs(
          conversionId,
          options,
        );

        if (result.success) {
          if (append) {
            setLogs((prev) => [...prev, ...result.data.items]);
          } else {
            setLogs(result.data.items);
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
    [conversionId],
  );

  // 初期データ取得
  useEffect(() => {
    setOffset(0);
    fetchLogs({ limit: DEFAULT_LIMIT, offset: 0, ...filter });
  }, [fetchLogs, filter]);

  // 追加データ読み込み
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    const newOffset = offset + DEFAULT_LIMIT;
    setOffset(newOffset);
    await fetchLogs(
      { limit: DEFAULT_LIMIT, offset: newOffset, ...filter },
      true,
    );
  }, [hasMore, isLoading, offset, filter, fetchLogs]);

  // フィルタ設定
  const setFilter = useCallback((newFilter: FilterState) => {
    setOffset(0);
    setFilterState(newFilter);
  }, []);

  // リフレッシュ
  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchLogs({ limit: DEFAULT_LIMIT, offset: 0, ...filter });
  }, [fetchLogs, filter]);

  return {
    logs,
    isLoading,
    error,
    hasMore,
    loadMore,
    setFilter,
    refresh,
  };
}
