/**
 * @file cronHumanizer.ts
 * @description cron 式文字列 → 自然言語テキストへの変換
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import { cronToVisualConfig } from "./cronParser";

const WEEKDAY_LABELS_JA = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function zeroPad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatTime(hour: number, minute: number): string {
  return `${zeroPad(hour)}:${zeroPad(minute)}`;
}

function formatWeekdayList(weekdays: number[], locale: "ja" | "en"): string {
  const labels = locale === "ja" ? WEEKDAY_LABELS_JA : WEEKDAY_LABELS_EN;
  const groupSeparator = locale === "ja" ? "・" : ", ";
  const rangeSeparator = locale === "ja" ? "〜" : "-";

  if (weekdays.length === 0) return "";

  const normalized = [...new Set(weekdays)].sort((a, b) => a - b);
  const groups: Array<[number, number]> = [];
  let start = normalized[0];
  let end = normalized[0];

  for (const day of normalized.slice(1)) {
    if (day === end + 1) {
      end = day;
      continue;
    }
    groups.push([start, end]);
    start = day;
    end = day;
  }
  groups.push([start, end]);

  return groups
    .map(([rangeStart, rangeEnd]) =>
      rangeStart === rangeEnd
        ? labels[rangeStart]
        : `${labels[rangeStart]}${rangeSeparator}${labels[rangeEnd]}`,
    )
    .join(groupSeparator);
}

/**
 * cron 式文字列を人間が読みやすいテキストに変換する。
 * VisualCronConfig に変換できない場合はフォールバック文字列を返す。
 */
export function cronToHumanReadable(
  expression: string,
  locale: "ja" | "en",
): string {
  const config = cronToVisualConfig(expression);

  if (!config || config.frequency === "custom") {
    return locale === "ja" ? "カスタムスケジュール" : "Custom schedule";
  }

  const { frequency, hour, minute, weekdays, dayOfMonth } = config;

  switch (frequency) {
    case "every-minute":
      return locale === "ja" ? "毎分" : "Every minute";

    case "every-hour":
      return locale === "ja"
        ? `毎時 ${zeroPad(minute)}分`
        : `Every hour at :${zeroPad(minute)}`;

    case "daily":
      return locale === "ja"
        ? `毎日 ${formatTime(hour, minute)}`
        : `Every day at ${formatTime(hour, minute)}`;

    case "weekly": {
      const days = formatWeekdayList(weekdays, locale);
      if (!days) {
        return locale === "ja" ? "カスタムスケジュール" : "Custom schedule";
      }
      return locale === "ja"
        ? `毎週 ${days} ${formatTime(hour, minute)}`
        : `Every week on ${days} at ${formatTime(hour, minute)}`;
    }

    case "monthly":
      if (dayOfMonth < 1 || dayOfMonth > 31) {
        return locale === "ja" ? "カスタムスケジュール" : "Custom schedule";
      }
      return locale === "ja"
        ? `毎月${dayOfMonth}日 ${formatTime(hour, minute)}`
        : `Every month on day ${dayOfMonth} at ${formatTime(hour, minute)}`;

    default:
      return locale === "ja" ? "カスタムスケジュール" : "Custom schedule";
  }
}
