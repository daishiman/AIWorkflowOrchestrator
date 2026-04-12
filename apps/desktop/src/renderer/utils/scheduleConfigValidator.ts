/**
 * @file scheduleConfigValidator.ts
 * @description SkillWizardScheduleConfig の cronExpression / timezone 共通バリデーション
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001, TASK-UI-SCHEDULE-CRON-SEMANTIC-001
 *
 * ConversationRoundStep と ScheduleDialog の両方から再利用される。
 * options.semantic が true の場合のみ next-run 計算による意味論的バリデーションを実行する。
 */

import { CronExpressionParser } from "cron-parser";
import type { SkillWizardScheduleConfig } from "@repo/shared/types/skillCreator";

export interface ScheduleConfigValidationResult {
  cronExpression?: string;
  timezone?: string;
}

/**
 * validateCronExpression のオプション設定
 */
export interface ValidateCronOptions {
  /**
   * true の場合、構文・値域チェックに加えて next-execution-time 計算による
   * 意味論的バリデーション（到達可能性チェック）を実行する。
   * false または省略した場合は従来の構文チェックのみ実行（後方互換）。
   * @default false
   */
  semantic?: boolean;
}

// 各フィールドの有効範囲: [分, 時, 日, 月, 曜日]
const FIELD_RANGES: Array<[number, number]> = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 7],
];

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
 * cron 式の 5 フィールド構文とフィールド値の範囲を検証する。
 * options.semantic が true の場合は next-execution-time 計算による到達可能性チェックも実行する。
 *
 * @param value - 検証対象の cron 式文字列
 * @param options - バリデーションオプション
 * @param options.semantic - true の場合、意味論的検証（next-run 計算）を追加実行する（デフォルト: false）
 * @returns エラーメッセージ文字列、または有効なら null
 */
export function validateCronExpression(
  value: string,
  options?: ValidateCronOptions,
): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return "cron式を入力してください";
  }

  const fields = trimmed.split(/\s+/);
  if (fields.length !== 5) {
    return `cron式は5フィールド必要です（現在: ${fields.length}フィールド）`;
  }

  const allValid = fields.every((field, idx) =>
    isValidCronField(field, FIELD_RANGES[idx][0], FIELD_RANGES[idx][1]),
  );

  if (!allValid) {
    return "cron式の形式が正しくありません";
  }

  // [5] semantic チェック（options.semantic === true の場合のみ実行・後方互換保証）
  if (options?.semantic === true) {
    try {
      const interval = CronExpressionParser.parse(trimmed);
      interval.next();
    } catch {
      return "指定した日付の組み合わせは存在しません（例: 2月31日）";
    }
  }

  return null;
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
