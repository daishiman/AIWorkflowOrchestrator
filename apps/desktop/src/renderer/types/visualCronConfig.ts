/**
 * @file visualCronConfig.ts
 * @description VisualCronPicker で使用する型定義
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

export type FrequencyType =
  | "every-minute"
  | "every-hour"
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

/** 曜日: 0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface VisualCronConfig {
  frequency: FrequencyType;
  /** 0-23 */
  hour: number;
  /** 0-59 */
  minute: number;
  /** weekly のみ有効 */
  weekdays: Weekday[];
  /** 1-31, monthly のみ有効 */
  dayOfMonth: number;
  /** custom モード用の生 cron 式 */
  rawCronExpression?: string;
}
