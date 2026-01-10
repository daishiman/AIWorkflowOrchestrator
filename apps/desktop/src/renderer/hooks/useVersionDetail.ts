/**
 * useVersionDetail Hook
 *
 * 特定バージョンの詳細情報を取得するカスタムフック
 *
 * @module @repo/desktop/renderer/hooks/useVersionDetail
 */

import { useState, useEffect, useCallback } from "react";
import type {
  VersionHistoryItem,
  ConversionLog,
} from "../components/history/types";

interface UseVersionDetailReturn {
  /** バージョン情報 */
  version: VersionHistoryItem | null;
  /** ログ一覧 */
  logs: ConversionLog[];
  /** ローディング中フラグ */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
}

/**
 * バージョン詳細取得フック
 *
 * @param conversionId - 変換ID
 * @returns バージョン詳細とログ
 */
export function useVersionDetail(conversionId: string): UseVersionDetailReturn {
  const [version, setVersion] = useState<VersionHistoryItem | null>(null);
  const [logs, setLogs] = useState<ConversionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!window.historyAPI) {
      setError(new Error("History API not available"));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const result = await window.historyAPI.getVersionDetail(conversionId);

      if (result.success) {
        setVersion(result.data.version);
        setLogs(result.data.logs);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [conversionId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    version,
    logs,
    isLoading,
    error,
  };
}
