/**
 * @file cronParser.ts
 * @description cron 式文字列 → VisualCronConfig への逆変換
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import type { VisualCronConfig, Weekday } from "../types/visualCronConfig";

// 単純な数値かどうか（ステップ値 *\/n や範囲 - を含まない）
function isSimpleNumber(field: string): boolean {
  return /^\d+$/.test(field);
}

function normalizeWeekday(value: number): Weekday | null {
  if (value === 7) return 0;
  if (value >= 0 && value <= 6) return value as Weekday;
  return null;
}

function expandWeekdayToken(token: string): Weekday[] | null {
  if (/^\d+$/.test(token)) {
    const normalized = normalizeWeekday(Number(token));
    return normalized === null ? null : [normalized];
  }

  const rangeMatch = token.match(/^(\d+)-(\d+)$/);
  if (!rangeMatch) return null;

  const start = Number(rangeMatch[1]);
  const end = Number(rangeMatch[2]);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
    return null;
  }
  if (start < 0 || end > 7) return null;

  const weekdays: Weekday[] = [];
  for (let current = start; current <= end; current += 1) {
    const normalized = normalizeWeekday(current);
    if (normalized === null) return null;
    weekdays.push(normalized);
  }
  return weekdays;
}

function parseWeekdayField(field: string): Weekday[] | null {
  const tokens = field.split(",").map((token) => token.trim());
  if (tokens.length === 0 || tokens.some((token) => token.length === 0)) {
    return null;
  }

  const weekdays = new Set<Weekday>();
  for (const token of tokens) {
    const expanded = expandWeekdayToken(token);
    if (expanded === null) return null;
    for (const day of expanded) weekdays.add(day);
  }

  return [...weekdays].sort((a, b) => a - b) as Weekday[];
}

/**
 * cron 式文字列を VisualCronConfig に逆変換する。
 * パースできない場合は null を返し、呼び出し元は直接編集モードにフォールバックする。
 * monthly の dayOfMonth は範囲チェックを行わず、UI 側でバリデーションエラーを表示する。
 * 外部ライブラリへの依存なし。
 */
export function cronToVisualConfig(
  expression: string,
): VisualCronConfig | null {
  if (!expression.trim()) return null;

  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) return null;

  const [minField, hourField, domField, monthField, dowField] = fields;

  // every-minute: * * * * *
  if (
    minField === "*" &&
    hourField === "*" &&
    domField === "*" &&
    monthField === "*" &&
    dowField === "*"
  ) {
    return {
      frequency: "every-minute",
      hour: 0,
      minute: 0,
      weekdays: [],
      dayOfMonth: 1,
    };
  }

  // every-hour: X * * * * （分のみ固定数値）
  if (
    isSimpleNumber(minField) &&
    hourField === "*" &&
    domField === "*" &&
    monthField === "*" &&
    dowField === "*"
  ) {
    return {
      frequency: "every-hour",
      hour: 0,
      minute: Number(minField),
      weekdays: [],
      dayOfMonth: 1,
    };
  }

  // daily: X Y * * * （分・時のみ固定数値）
  if (
    isSimpleNumber(minField) &&
    isSimpleNumber(hourField) &&
    domField === "*" &&
    monthField === "*" &&
    dowField === "*"
  ) {
    return {
      frequency: "daily",
      hour: Number(hourField),
      minute: Number(minField),
      weekdays: [],
      dayOfMonth: 1,
    };
  }

  // weekly: X Y * * D[,D...] （曜日指定、カンマ区切り数値または範囲）
  const weekdays = parseWeekdayField(dowField);
  if (
    isSimpleNumber(minField) &&
    isSimpleNumber(hourField) &&
    domField === "*" &&
    monthField === "*" &&
    weekdays !== null
  ) {
    return {
      frequency: "weekly",
      hour: Number(hourField),
      minute: Number(minField),
      weekdays,
      dayOfMonth: 1,
    };
  }

  // monthly: X Y D * * （日付指定、範囲外は UI 側でバリデーション）
  const dom = Number(domField);
  if (
    isSimpleNumber(minField) &&
    isSimpleNumber(hourField) &&
    isSimpleNumber(domField) &&
    Number.isInteger(dom) &&
    monthField === "*" &&
    dowField === "*"
  ) {
    return {
      frequency: "monthly",
      hour: Number(hourField),
      minute: Number(minField),
      weekdays: [],
      dayOfMonth: dom,
    };
  }

  // 上記以外: custom フォールバック
  return {
    frequency: "custom",
    hour: 0,
    minute: 0,
    weekdays: [],
    dayOfMonth: 1,
    rawCronExpression: expression.trim(),
  };
}
