/**
 * useAnalyticsSummary - サマリーデータ管理フック
 *
 * 分析ダッシュボードのサマリー情報を取得・管理する。
 * IPC経由で window.electronAPI.skill.analyticsSummary() を呼び出す。
 *
 * @module useAnalyticsSummary
 */

import { useState, useCallback, useEffect } from "react";
import type { AnalyticsSummary } from "@repo/shared/types/skill-analytics";

export interface UseAnalyticsSummaryResult {
  /** サマリーデータ */
  summary: AnalyticsSummary | null;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** データ再取得 */
  refetch: () => Promise<void>;
}

/**
 * サマリーデータ管理フック
 *
 * マウント時に自動取得し、refetch で再取得可能。
 */
export function useAnalyticsSummary(): UseAnalyticsSummaryResult {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await window.electronAPI.skill.analyticsSummary();
      setSummary(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "サマリーの取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, error, refetch: fetchSummary };
}
