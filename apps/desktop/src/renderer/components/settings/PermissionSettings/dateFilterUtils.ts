/**
 * @file 日付フィルタリングユーティリティ
 * @description 権限履歴の期間別フィルタリングヘルパー関数
 * @feature task-imp-permission-date-filter
 */

import type {
  DatePreset,
  DateRangeFilter,
  PermissionHistoryEntry,
} from "../../skill/permissionHistory";

// ==========================================================================
// 定数
// ==========================================================================

/** 週の日数 */
export const DAYS_IN_WEEK = 7;

/** 月の日数（概算） */
export const DAYS_IN_MONTH = 30;

// ==========================================================================
// ユーティリティ関数
// ==========================================================================

/**
 * プリセットから比較用の開始日を算出する
 *
 * @param preset - 期間プリセット
 * @returns 開始日（allまたはcustomの場合はnull）
 */
export function getDateRangeStartDate(preset: DatePreset): Date | null {
  const now = new Date();

  switch (preset) {
    case "all":
      return null;
    case "today": {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      return today;
    }
    case "week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - DAYS_IN_WEEK);
      weekAgo.setHours(0, 0, 0, 0);
      return weekAgo;
    }
    case "month": {
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - DAYS_IN_MONTH);
      monthAgo.setHours(0, 0, 0, 0);
      return monthAgo;
    }
    case "custom":
      return null;
  }
}

/**
 * 日付範囲でエントリをフィルタリングする
 *
 * @param entries - フィルタ対象のエントリ配列
 * @param dateRange - 期間フィルタ条件
 * @returns フィルタ後のエントリ配列
 */
export function filterByDateRange(
  entries: PermissionHistoryEntry[],
  dateRange: DateRangeFilter,
): PermissionHistoryEntry[] {
  if (dateRange.preset === "all") {
    return entries;
  }

  if (dateRange.preset === "custom") {
    return entries.filter((entry) => {
      const entryTime = new Date(entry.timestamp).getTime();
      if (isNaN(entryTime)) return false;

      if (dateRange.start) {
        const startTime = new Date(dateRange.start + "T00:00:00").getTime();
        if (!isNaN(startTime) && entryTime < startTime) return false;
      }

      if (dateRange.end) {
        const endDate = new Date(dateRange.end + "T00:00:00");
        endDate.setDate(endDate.getDate() + 1);
        const endTime = endDate.getTime();
        if (!isNaN(endTime) && entryTime >= endTime) return false;
      }

      return true;
    });
  }

  // プリセット（today/week/month）
  const startDate = getDateRangeStartDate(dateRange.preset);
  if (!startDate) return entries;

  const startTime = startDate.getTime();
  return entries.filter((entry) => {
    const entryTime = new Date(entry.timestamp).getTime();
    return !isNaN(entryTime) && entryTime >= startTime;
  });
}
