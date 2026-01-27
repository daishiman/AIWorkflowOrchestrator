/**
 * 時刻フォーマットユーティリティ
 *
 * TASK-3-2-A: SkillStreamDisplay UX改善
 * R2: タイムスタンプ表示機能用
 *
 * @module @repo/desktop/renderer/utils/formatTime
 */

/**
 * タイムスタンプを相対時刻文字列に変換
 *
 * @param timestamp - UNIXタイムスタンプ（ミリ秒）
 * @param now - 現在時刻（テスト用、オプション）
 * @returns 相対時刻文字列（例: "30秒前", "5分前", "2時間前", "3日前"）
 *
 * @example
 * // 30秒前の場合
 * formatRelativeTime(Date.now() - 30000) // => "30秒前"
 *
 * // 5分前の場合
 * formatRelativeTime(Date.now() - 300000) // => "5分前"
 */
export function formatRelativeTime(
  timestamp: number,
  now: number = Date.now(),
): string {
  const diff = now - timestamp;

  // 未来のタイムスタンプの場合
  if (diff < 0) {
    return "たった今";
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}日前`;
  }

  if (hours > 0) {
    return `${hours}時間前`;
  }

  if (minutes > 0) {
    return `${minutes}分前`;
  }

  return `${seconds}秒前`;
}
