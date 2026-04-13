/**
 * @file scheduleConfigValidator.ts
 * @description SkillWizardScheduleConfig の cronExpression / timezone 共通バリデーション
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001 / TASK-CRON-SEMANTIC-VALIDATION-001
 *
 * ConversationRoundStep と ScheduleDialog の両方から再利用される。
 * Stage 1: 構文チェック → Stage 2: 値域チェック → Stage 3: 意味論的チェック の順で検証する。
 */

import type { SkillWizardScheduleConfig } from "@repo/shared/types/skillCreator";

export interface ScheduleConfigValidationResult {
  cronExpression?: string;
  timezone?: string;
}

// 各フィールドの有効範囲: [分, 時, 日, 月, 曜日]
const FIELD_RANGES: Array<[number, number]> = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 7],
];

/** バリデーションエラーメッセージ定数 */
const CRON_VALIDATION_ERRORS = {
  EMPTY: "cron式を入力してください",
  INVALID_FORMAT: "cron式の形式が正しくありません",
  INVALID_DATE: "指定した日付は存在しません（例: 2月31日）",
} as const;

/** 月ごとの最大日数（2月は閏年を許容して29日とする） */
const MAX_DAYS_PER_MONTH: Record<number, number> = {
  1: 31,
  2: 29,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
};

function isValidCronField(field: string, min: number, max: number): boolean {
  const parts = field.split(",");
  if (parts.length === 0) return false;

  return parts.every((part) => {
    const trimmed = part.trim();
    if (!trimmed) return false;

    const [base, stepPart] = trimmed.split("/");
    if (stepPart !== undefined && !/^\d+$/.test(stepPart)) return false;
    const step = stepPart ? Number(stepPart) : null;
    if (step !== null && (step < 1 || !Number.isInteger(step))) return false;

    if (base === "*") return true;

    if (/^\d+$/.test(base)) {
      const val = Number(base);
      return val >= min && val <= max;
    }

    const rangeMatch = base.match(/^(\d+)-(\d+)$/);
    if (!rangeMatch) return false;
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    return start >= min && end <= max && start <= end;
  });
}

/**
 * cron 式の意味論的バリデーションを実行する（Stage 3）。
 *
 * 日・月フィールドが単純な数値で、weekday が "*" の場合のみ判定する。
 * 複合指定（カンマ区切り・範囲・ステップ）は Stage 2 の値域チェックに委ねる。
 * 2月29日は cron が年を指定しないため有効扱い（閏年に実行される）。
 *
 * @param fields - 5フィールドに分割済みの cron 式
 * @returns エラーメッセージ文字列、または有効なら null
 * @example
 * validateCronSemantics(["0", "9", "31", "2", "*"]) // → "指定した日付は存在しません（例: 2月31日）"
 * validateCronSemantics(["0", "9", "29", "2", "*"]) // → null
 */
function validateCronSemantics(fields: string[]): string | null {
  const dayField = fields[2];
  const monthField = fields[3];
  const weekdayField = fields[4];

  // 単純な数値 かつ weekday が "*" の場合のみ意味論チェックを実行
  if (
    !/^\d+$/.test(dayField) ||
    !/^\d+$/.test(monthField) ||
    weekdayField !== "*"
  ) {
    return null;
  }

  const day = Number(dayField);
  const month = Number(monthField);
  const maxDays = MAX_DAYS_PER_MONTH[month];
  if (!maxDays || day > maxDays) {
    return CRON_VALIDATION_ERRORS.INVALID_DATE;
  }

  return null;
}

/**
 * cron 式の 5 フィールド構文、値域、意味論を順に検証する。
 *
 * Stage 1: 構文チェック（空文字・フィールド数）
 * Stage 2: 値域チェック（各フィールドの数値範囲）
 * Stage 3: 意味論的チェック（存在しない日付の検出）
 *
 * @returns エラーメッセージ文字列、または有効なら null
 */
export function validateCronExpression(value: string): string | null {
  const trimmed = value.trim();

  // Stage 1: 構文チェック
  if (!trimmed) {
    return CRON_VALIDATION_ERRORS.EMPTY;
  }

  const fields = trimmed.split(/\s+/);
  if (fields.length !== 5) {
    return `cron式は5フィールド必要です（現在: ${fields.length}フィールド）`;
  }

  // Stage 2: 値域チェック
  const allValid = fields.every((field, idx) =>
    isValidCronField(field, FIELD_RANGES[idx][0], FIELD_RANGES[idx][1]),
  );
  if (!allValid) {
    return CRON_VALIDATION_ERRORS.INVALID_FORMAT;
  }

  // Stage 3: 意味論的チェック
  return validateCronSemantics(fields);
}

/**
 * IANA timezone 文字列の妥当性を検証する。
 * Intl.DateTimeFormat で例外が出れば無効と判定する。
 * @returns エラーメッセージ文字列、または有効なら null
 */
export function validateTimezone(value: string): string | null {
  if (!value.trim()) {
    return "タイムゾーンを入力してください";
  }

  try {
    Intl.DateTimeFormat("en-US", { timeZone: value });
    return null;
  } catch {
    return `無効なタイムゾーンです: ${value}`;
  }
}

/**
 * SkillWizardScheduleConfig の cronExpression と timezone を一括検証する。
 * エラーがないフィールドは結果オブジェクトに含まれない。
 */
export function validateSkillWizardScheduleConfig(
  config: SkillWizardScheduleConfig,
): ScheduleConfigValidationResult {
  const result: ScheduleConfigValidationResult = {};

  const cronError = validateCronExpression(config.cronExpression);
  if (cronError !== null) {
    result.cronExpression = cronError;
  }

  const timezoneError = validateTimezone(config.timezone);
  if (timezoneError !== null) {
    result.timezone = timezoneError;
  }

  return result;
}
