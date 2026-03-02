/**
 * useIPCQuery - IPC経由のデータ取得共通Hook
 *
 * 4ビュー（SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard）で
 * 繰り返されるIPCデータ取得パターン（isLoading / error / data / refetch）を共通化する。
 *
 * パターン:
 * 1. マウント時（immediate: true）に自動取得
 * 2. ローディング・エラー・データ状態を管理
 * 3. refetch で再取得可能
 *
 * @module useIPCQuery
 */

import { useState, useCallback, useEffect } from "react";

export interface UseIPCQueryOptions {
  /**
   * マウント時に自動取得するかどうか。
   * @default true
   */
  immediate?: boolean;
}

export interface UseIPCQueryReturn<T> {
  /** 取得したデータ（未取得時はnull） */
  data: T | null;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ（正常時はnull） */
  error: string | null;
  /** データを再取得する */
  refetch: () => Promise<void>;
}

/**
 * IPC経由のデータ取得共通Hook
 *
 * @param fetcher - データ取得関数（IPC呼び出し）
 * @param options - オプション
 * @returns データ取得結果とrefetch関数
 *
 * @example
 * ```tsx
 * const { data: chains, isLoading, error, refetch } = useIPCQuery(
 *   () => window.electronAPI.skill.chainList()
 * );
 * ```
 */
export function useIPCQuery<T>(
  fetcher: () => Promise<T>,
  options?: UseIPCQueryOptions,
): UseIPCQueryReturn<T> {
  const { immediate = true } = options ?? {};

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "データの取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (immediate) {
      refetch();
    }
  }, [immediate, refetch]);

  return { data, isLoading, error, refetch };
}
