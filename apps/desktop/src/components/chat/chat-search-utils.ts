/**
 * チャット履歴検索ユーティリティ
 *
 * 検索フィルター関連のヘルパー関数群。
 */

import type { SearchFilters, DatePreset } from "./types";

/**
 * フィルターがアクティブかどうかを判定
 *
 * @param filters 検索フィルター
 * @returns フィルターがアクティブな場合true
 */
export function hasActiveFilters(filters: SearchFilters): boolean {
  return (
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.models.length > 0 ||
    filters.preset !== null
  );
}

/**
 * 日付プリセットから日付範囲を計算
 *
 * @param preset 日付プリセット
 * @returns 日付範囲（fromとto）、またはnull
 */
export function getDateRangeFromPreset(
  preset: DatePreset,
): { from: Date; to: Date } | null {
  if (!preset || preset === "custom") return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);

  switch (preset) {
    case "today":
      return { from: today, to: endOfToday };
    case "7days":
      return {
        from: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        to: endOfToday,
      };
    case "30days":
      return {
        from: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
        to: endOfToday,
      };
    default:
      return null;
  }
}

/**
 * 日付をinput[type="date"]用にフォーマット
 *
 * @param date フォーマット対象の日付
 * @returns YYYY-MM-DD形式の文字列、またはnullの場合は空文字列
 */
export function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}
