/**
 * useSkillStats - スキル別統計管理フック
 *
 * 全スキルの統計データをサマリーから取得・管理する。
 * ソートやフィルタリングの状態管理を提供する。
 *
 * @module useSkillStats
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import type { SkillStatistics } from "@repo/shared/types/skill-analytics";

/** ソートキー */
export type SortKey =
  | "skillName"
  | "totalExecutions"
  | "successRate"
  | "averageDuration"
  | "totalTokens";

/** ソート方向 */
export type SortDirection = "asc" | "desc";

export interface UseSkillStatsResult {
  /** スキル統計データ一覧 */
  stats: SkillStatistics[];
  /** ソート済みスキル統計データ */
  sortedStats: SkillStatistics[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** ソートキー */
  sortKey: SortKey;
  /** ソート方向 */
  sortDirection: SortDirection;
  /** フィルタキーワード */
  filterKeyword: string;
  /** ソートキー変更 */
  setSortKey: (key: SortKey) => void;
  /** フィルタキーワード変更 */
  setFilterKeyword: (keyword: string) => void;
  /** データ再取得 */
  refetch: () => Promise<void>;
}

/**
 * スキル別統計管理フック
 *
 * スキル名リストを受け取り、各スキルの統計情報を取得する。
 * ソートとフィルタリング機能を提供する。
 */
export function useSkillStats(skillNames: string[]): UseSkillStatsResult {
  const [stats, setStats] = useState<SkillStatistics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKeyState] = useState<SortKey>("totalExecutions");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterKeyword, setFilterKeyword] = useState("");

  const fetchStats = useCallback(async () => {
    if (skillNames.length === 0) {
      setStats([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        skillNames.map((name) =>
          window.electronAPI.skill.analyticsStatistics(name),
        ),
      );
      setStats(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "統計データの取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, [skillNames]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /** ソートキー変更（同じキーなら方向切替） */
  const setSortKey = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKeyState(key);
        setSortDirection("desc");
      }
    },
    [sortKey],
  );

  /** フィルタ・ソート済みデータ */
  const sortedStats = useMemo(() => {
    let filtered = stats;

    // フィルタリング
    if (filterKeyword.trim()) {
      const keyword = filterKeyword.trim().toLowerCase();
      filtered = stats.filter((s) =>
        s.skillName.toLowerCase().includes(keyword),
      );
    }

    // ソート
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case "skillName":
          comparison = a.skillName.localeCompare(b.skillName);
          break;
        case "totalExecutions":
          comparison = a.totalExecutions - b.totalExecutions;
          break;
        case "successRate":
          comparison = a.successRate - b.successRate;
          break;
        case "averageDuration":
          comparison = a.averageDuration - b.averageDuration;
          break;
        case "totalTokens":
          comparison = a.totalTokens - b.totalTokens;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [stats, sortKey, sortDirection, filterKeyword]);

  return {
    stats,
    sortedStats,
    isLoading,
    error,
    sortKey,
    sortDirection,
    filterKeyword,
    setSortKey,
    setFilterKeyword,
    refetch: fetchStats,
  };
}
