/**
 * Skill Schedule Types - スキルスケジュール実行の型定義
 *
 * TASK-9G: スキルスケジュール実行機能
 *
 * IPC シリアライズ方針:
 * - 日時フィールド（lastRun, nextRun, startedAt, completedAt, runAt）は全て string（ISO 8601）で定義
 * - Main Process 内部では Date オブジェクトを使用し、IPC 境界で .toISOString() に変換する
 */

/**
 * スケジュール済みスキル
 */
export interface ScheduledSkill {
  /** スケジュールの一意識別子 */
  id: string;
  /** 実行対象のスキル名 */
  skillName: string;
  /** スキル実行時のプロンプト */
  prompt: string;
  /** スケジュール設定 */
  schedule: SkillSchedule;
  /** スケジュールが有効かどうか */
  enabled: boolean;
  /** 実行履歴（最新が先頭、最大100件） */
  runHistory: ScheduledRunResult[];
  /** 通知設定 */
  notification: NotificationSettings;
  /** 最後に実行した日時（ISO 8601） */
  lastRun?: string | null;
  /** 次回実行予定日時（ISO 8601） */
  nextRun?: string | null;
  /** 作成日時（ISO 8601） */
  createdAt: string;
  /** 更新日時（ISO 8601） */
  updatedAt: string;
}

/**
 * スケジュール設定
 */
export interface SkillSchedule {
  /** スケジュール方式 */
  type: "cron" | "interval" | "once" | "event";
  /** cron 式（type: "cron" の場合に必須） */
  cronExpression?: string;
  /** 実行間隔（ミリ秒、type: "interval" の場合に必須） */
  interval?: number;
  /** 実行日時（ISO 8601、type: "once" の場合に使用） */
  runAt?: string | null;
  /** トリガーイベント（type: "event" の場合に必須） */
  event?: "app_start" | "file_change" | "git_commit";
  /** イベント固有設定（type: "event" の場合に使用） */
  eventConfig?: Record<string, unknown>;
}

/**
 * 通知設定
 */
export interface NotificationSettings {
  /** 成功時に通知するかどうか */
  onSuccess: boolean;
  /** 失敗時に通知するかどうか */
  onFailure: boolean;
  /** 通知方式 */
  notificationType: "system" | "inApp" | "both";
}

/**
 * スケジュール実行結果
 */
export interface ScheduledRunResult {
  /** 実行の一意識別子 */
  runId: string;
  /** 実行開始日時（ISO 8601） */
  startedAt: string;
  /** 実行が成功したかどうか */
  success: boolean;
  /** 実行完了日時（ISO 8601） */
  completedAt?: string | null;
  /** 実行結果の出力 */
  output?: string;
  /** エラーメッセージ */
  error?: string;
}
