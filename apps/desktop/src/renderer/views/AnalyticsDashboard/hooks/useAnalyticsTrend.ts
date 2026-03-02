/**
 * useAnalyticsTrend - トレンドデータ管理フック
 *
 * 指定期間のトレンドデータを取得・管理する。
 * IPC経由で window.electronAPI.skill.analyticsTrend() を呼び出す。
 *
 * @module useAnalyticsTrend
 */

import { useState, useCallback, useEffect } from "react";
import type {
  AnalyticsPeriod,
  UsageTrend,
} from "@repo/shared/types/skill-analytics";

/** トレンド表示用のプリセット期間 */
export type PeriodPreset = "7d" | "30d" | "90d" | "1y" | "all";

/** プリセット期間 → AnalyticsPeriod 変換 */
function toPeriod(preset: PeriodPreset): AnalyticsPeriod {
  const now = new Date();
  const end = now.toISOString();
  let start: Date;
  let granularity: AnalyticsPeriod["granularity"];

  switch (preset) {
    case "7d":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      granularity = "day";
      break;
    case "30d":
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      granularity = "day";
      break;
    case "90d":
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      granularity = "week";
      break;
    case "1y":
      start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      granularity = "month";
      break;
    case "all":
      start = new Date("2020-01-01");
      granularity = "month";
      break;
  }

  return { start: start.toISOString(), end, granularity };
}

export interface UseAnalyticsTrendResult {
  /** トレンドデータ */
  trend: UsageTrend | null;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 現在の期間プリセット */
  periodPreset: PeriodPreset;
  /** 期間プリセット変更 */
  setPeriodPreset: (preset: PeriodPreset) => void;
  /** データ再取得 */
  refetch: () => Promise<void>;
}

/**
 * トレンドデータ管理フック
 *
 * 期間プリセットに基づいてトレンドデータを取得する。
 * 期間変更時に自動再取得する。
 */
export function useAnalyticsTrend(skillName?: string): UseAnalyticsTrendResult {
  const [trend, setTrend] = useState<UsageTrend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("30d");

  const fetchTrend = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const period = toPeriod(periodPreset);
      const data = await window.electronAPI.skill.analyticsTrend(
        period,
        skillName,
      );
      setTrend(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "トレンドデータの取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, [periodPreset, skillName]);

  useEffect(() => {
    fetchTrend();
  }, [fetchTrend]);

  return {
    trend,
    isLoading,
    error,
    periodPreset,
    setPeriodPreset,
    refetch: fetchTrend,
  };
}
