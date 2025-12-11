import { format, parseISO, isValid } from "date-fns";

/**
 * ISO8601 形式の日時文字列を Date に変換
 */
export function parseISODate(dateString: string): Date | null {
  const date = parseISO(dateString);
  return isValid(date) ? date : null;
}

/**
 * Date を ISO8601 形式の文字列に変換
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * 日時を表示用フォーマットに変換
 */
export function formatDate(
  date: Date,
  formatStr: string = "yyyy-MM-dd HH:mm:ss",
): string {
  return format(date, formatStr);
}

/**
 * 相対時間を取得（例: "2時間前"）
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}秒前`;
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 7) return `${diffDay}日前`;
  return formatDate(date, "yyyy-MM-dd");
}
