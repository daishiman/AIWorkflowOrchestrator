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
 *
 * @param config - スケジュール設定
 * @returns cron 式文字列。
 *   - `frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
 *   - `frequency="monthly"` かつ `dayOfMonth` が非整数、または範囲外（< 1 または > 31）の場合は空文字 `""` を返す。
 *
 * @remarks
 * 空曜日・不正な日付は有効な cron 式に変換できないため、ガード処理では例外を投げず空文字を返す。
 * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
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

    case "monthly": {
      if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
        return "";
      }
      return `${minute} ${hour} ${dayOfMonth} * *`;
    }

    case "custom":
      return rawCronExpression ?? "";

    default:
      return "";
  }
}
