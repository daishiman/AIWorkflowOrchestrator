/**
 * @file cronConverter.ts
 * @description VisualCronConfig → cron 式文字列への変換
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import type { VisualCronConfig } from "../types/visualCronConfig";

/**
 * VisualCronConfig の値が不正な場合にスローされるエラー。
 */
export class InvalidConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConfigError";
  }
}

/**
 * VisualCronConfig をクロン式文字列に変換する。
 * 外部ライブラリへの依存なし（純粋な文字列操作のみ）。
 * @param config - ビジュアル設定オブジェクト
 * @returns cron 式文字列
 * @throws {InvalidConfigError} frequency が "weekly" のとき weekdays が空配列の場合
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
      if (weekdays.length === 0) {
        throw new InvalidConfigError(
          "weekdays must not be empty when frequency is 'weekly'",
        );
      }
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
