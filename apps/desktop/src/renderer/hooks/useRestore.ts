/**
 * useRestore Hook
 *
 * バージョン復元機能を提供するカスタムフック
 *
 * @module @repo/desktop/renderer/hooks/useRestore
 */

import { useState, useCallback } from "react";
import type { VersionHistoryItem } from "../components/history/types";

interface UseRestoreOptions {
  /** 成功時コールバック */
  onSuccess?: (restoredVersion: VersionHistoryItem) => void;
  /** エラー時コールバック */
  onError?: (error: Error) => void;
}

interface UseRestoreReturn {
  /** 復元中フラグ */
  isRestoring: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 復元実行（成功時は復元結果、失敗時はnull） */
  restore: (
    fileId: string,
    conversionId: string,
  ) => Promise<VersionHistoryItem | null>;
  /** エラークリア */
  clearError: () => void;
}

/**
 * バージョン復元フック
 *
 * @param options - オプション
 * @returns 復元状態と操作関数
 */
export function useRestore(options: UseRestoreOptions = {}): UseRestoreReturn {
  const { onSuccess, onError } = options;
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const restore = useCallback(
    async (
      fileId: string,
      conversionId: string,
    ): Promise<VersionHistoryItem | null> => {
      if (!window.historyAPI) {
        const err = new Error("History API not available");
        setError(err);
        onError?.(err);
        return null;
      }

      try {
        setIsRestoring(true);
        setError(null);

        const result = await window.historyAPI.restoreVersion(
          fileId,
          conversionId,
        );

        if (result.success) {
          onSuccess?.(result.data);
          return result.data;
        } else {
          setError(result.error);
          onError?.(result.error);
          return null;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsRestoring(false);
      }
    },
    [onSuccess, onError],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isRestoring,
    error,
    restore,
    clearError,
  };
}
