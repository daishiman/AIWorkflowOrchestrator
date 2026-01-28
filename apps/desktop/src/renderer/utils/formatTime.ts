/**
 * 時刻フォーマットユーティリティ
 *
 * TASK-3-2-A: SkillStreamDisplay UX改善
 * R2: タイムスタンプ表示機能用
 *
 * TASK-3-2-B: SkillStreamDisplay i18n対応
 * ロケール引数によるi18n対応
 *
 * @module @repo/desktop/renderer/utils/formatTime
 */

/**
 * サポートされるロケール型
 */
type SupportedLocale = "ja" | "en";

/**
 * ロケール別翻訳テーブル
 * i18nに依存しない独立した翻訳を提供
 */
const translations: Record<
  SupportedLocale,
  {
    justNow: string;
    secondsAgo: (count: number) => string;
    minutesAgo: (count: number) => string;
    hoursAgo: (count: number) => string;
    daysAgo: (count: number) => string;
  }
> = {
  ja: {
    justNow: "たった今",
    secondsAgo: (count: number) => `${count}秒前`,
    minutesAgo: (count: number) => `${count}分前`,
    hoursAgo: (count: number) => `${count}時間前`,
    daysAgo: (count: number) => `${count}日前`,
  },
  en: {
    justNow: "Just now",
    secondsAgo: (count: number) =>
      `${count} second${count !== 1 ? "s" : ""} ago`,
    minutesAgo: (count: number) =>
      `${count} minute${count !== 1 ? "s" : ""} ago`,
    hoursAgo: (count: number) => `${count} hour${count !== 1 ? "s" : ""} ago`,
    daysAgo: (count: number) => `${count} day${count !== 1 ? "s" : ""} ago`,
  },
};

/**
 * ロケールが有効かチェックし、無効な場合はデフォルト（ja）にフォールバック
 */
function getValidLocale(locale: string): SupportedLocale {
  if (locale === "ja" || locale === "en") {
    return locale;
  }
  // 未対応ロケールは日本語にフォールバック
  return "ja";
}

/**
 * タイムスタンプを相対時刻文字列に変換
 *
 * @param timestamp - UNIXタイムスタンプ（ミリ秒）
 * @param locale - ロケール（"ja" | "en"）、デフォルト: "ja"
 * @param now - 現在時刻（テスト用、オプション）
 * @returns 相対時刻文字列（例: "30秒前", "30 seconds ago"）
 *
 * @example
 * // 日本語（デフォルト）
 * formatRelativeTime(Date.now() - 30000) // => "30秒前"
 *
 * // 英語
 * formatRelativeTime(Date.now() - 30000, "en") // => "30 seconds ago"
 *
 * // 単数形（英語）
 * formatRelativeTime(Date.now() - 1000, "en") // => "1 second ago"
 */
export function formatRelativeTime(
  timestamp: number,
  locale: string = "ja",
  now: number = Date.now(),
): string {
  const validLocale = getValidLocale(locale);
  const t = translations[validLocale];
  const diff = now - timestamp;

  // 未来のタイムスタンプの場合
  if (diff < 0) {
    return t.justNow;
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return t.daysAgo(days);
  }

  if (hours > 0) {
    return t.hoursAgo(hours);
  }

  if (minutes > 0) {
    return t.minutesAgo(minutes);
  }

  return t.secondsAgo(seconds);
}
