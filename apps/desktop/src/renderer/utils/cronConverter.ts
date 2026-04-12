/**
 * @file cronConverter.ts
 * @description VisualCronConfig → cron 式文字列への変換
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import type { VisualCronConfig } from "../types/visualCronConfig";

/**
 * VisualCronConfig をクロン式文字列に変換する。
 * 外部ライブラリへの依存なし（純粋な文字列操作のみ）。
 */
export function visualConfigToCron(config: VisualCronConfig): string {
  const { frequency, hour, minute, weekdays, dayOfMonth, rawCronExpression } =
    config;

  switch (frequency) {
    case "every-minute":
      return "* * * * *";

    case "every-hour":
      return `${minute} * * * *`;

    case "daily":
      return `${minute} ${hour} * * *`;

    case "weekly": {
      const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
      return `${minute} ${hour} * * ${sorted.join(",")}`;
    }

    case "monthly":
      return `${minute} ${hour} ${dayOfMonth} * *`;

    case "custom":
      return rawCronExpression ?? "";

    default:
      return "";
  }
}
