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

/**
 * TASK-3-2-C: タイムスタンプ自動更新用定数
 */

/**
 * 更新間隔定数（ミリ秒）
 */
export const UPDATE_INTERVALS = {
  /** 1秒 */
  SECOND: 1000,
  /** 1分 */
  MINUTE: 60 * 1000,
  /** 1時間 */
  HOUR: 60 * 60 * 1000,
} as const;

/**
 * タイムスタンプに基づいて適切な更新間隔を計算
 *
 * - 1分未満: 1秒ごとに更新
 * - 1分〜1時間: 1分ごとに更新
 * - 1時間以上: 1時間ごとに更新
 *
 * @param timestamp - メッセージのタイムスタンプ（ミリ秒）
 * @param now - 現在時刻（ミリ秒）
 * @returns 更新間隔（ミリ秒）
 *
 * @example
 * const interval = calculateUpdateInterval(Date.now() - 30000, Date.now());
 * // => 1000 (1秒)
 */
export function calculateUpdateInterval(
  timestamp: number,
  now: number,
): number {
  const diff = now - timestamp;
  const minutes = diff / UPDATE_INTERVALS.MINUTE;
  const hours = minutes / 60;

  if (hours >= 1) {
    return UPDATE_INTERVALS.HOUR;
  }
  if (minutes >= 1) {
    return UPDATE_INTERVALS.MINUTE;
  }
  return UPDATE_INTERVALS.SECOND;
}

/**
 * メッセージリストから最短の更新間隔を計算
 *
 * @param timestamps - メッセージのタイムスタンプ配列
 * @param now - 現在時刻
 * @returns 最短の更新間隔（ミリ秒）
 *
 * @example
 * const interval = calculateMinUpdateInterval([ts1, ts2, ts3], Date.now());
 */
export function calculateMinUpdateInterval(
  timestamps: number[],
  now: number,
): number {
  if (timestamps.length === 0) {
    return UPDATE_INTERVALS.MINUTE; // デフォルト1分
  }

  return Math.min(...timestamps.map((ts) => calculateUpdateInterval(ts, now)));
}
