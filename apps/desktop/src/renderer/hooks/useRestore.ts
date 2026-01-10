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
  /** 復元実行 */
  restore: (fileId: string, conversionId: string) => Promise<void>;
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
    async (fileId: string, conversionId: string) => {
      if (!window.historyAPI) {
        const err = new Error("History API not available");
        setError(err);
        onError?.(err);
        return;
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
        } else {
          setError(result.error);
          onError?.(result.error);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
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
