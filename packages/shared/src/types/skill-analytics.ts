/**
 * Skill Analytics Types - スキル利用分析型定義
 *
 * TASK-9J: スキル利用分析・統計機能
 *
 * スキルの利用状況を記録・分析するための型定義。
 * AnalyticsStore / SkillAnalytics / IPCハンドラで使用される。
 */

/**
 * スキル利用イベント
 *
 * スキル実行時に記録される個別のイベントデータ。
 */
export interface SkillUsageEvent {
  /** イベントの一意識別子 (UUID) */
  id: string;
  /** スキル名 */
  skillName: string;
  /** イベント種別 */
  eventType: "execution" | "error" | "cancellation";
  /** イベント発生日時 (ISO 8601形式) */
  timestamp: string;
  /** 実行成功フラグ */
  success: boolean;
  /** 使用されたツール一覧 */
  toolsUsed: string[];
  /** 実行時間（ミリ秒） */
  duration?: number;
  /** エラーメッセージ（eventType === "error" の場合） */
  errorMessage?: string;
  /** トークン消費量 */
  tokenCount?: number;
}

/**
 * ツール利用統計
 *
 * 特定スキルで使用されたツールの利用頻度情報。
 */
export interface ToolUsageStat {
  /** ツール名 */
  toolName: string;
  /** 使用回数 */
  count: number;
  /** 全使用回数に対する割合 (0-100) */
  percentage: number;
}

/**
 * スキル統計情報
 *
 * 特定スキルの集計統計データ。
 */
export interface SkillStatistics {
  /** スキル名 */
  skillName: string;
  /** 総実行回数 */
  totalExecutions: number;
  /** 成功率 (0-1) */
  successRate: number;
  /** 平均実行時間（ミリ秒） */
  averageDuration: number;
  /** エラー率 (0-1) */
  errorRate: number;
  /** 総トークン消費量 */
  totalTokens: number;
  /** 最終使用日時 (ISO 8601形式) */
  lastUsed?: string | null;
  /** ツール利用統計（使用頻度降順） */
  mostUsedTools: ToolUsageStat[];
}

/**
 * 分析期間
 *
 * トレンドデータの集計期間と粒度を指定する。
 */
export interface AnalyticsPeriod {
  /** 期間開始日時 (ISO 8601形式) */
  start: string;
  /** 期間終了日時 (ISO 8601形式) */
  end: string;
  /** 集計粒度 */
  granularity: "hour" | "day" | "week" | "month";
}

/**
 * トレンドデータポイント
 *
 * 時系列上の1データポイント。
 */
export interface TrendDataPoint {
  /** データポイントの日時 (ISO 8601形式) */
  timestamp: string;
  /** 実行回数 */
  executions: number;
  /** エラー回数 */
  errors: number;
  /** 平均実行時間（ミリ秒） */
  avgDuration: number;
}

/**
 * 利用トレンド
 *
 * 指定期間における利用推移データ。
 */
export interface UsageTrend {
  /** 分析期間 */
  period: AnalyticsPeriod;
  /** データポイント配列 */
  dataPoints: TrendDataPoint[];
}

/**
 * スキル利用サマリー
 *
 * サマリー表示用の簡略化されたスキル情報。
 */
export interface SkillUsageSummary {
  /** スキル名 */
  skillName: string;
  /** 実行回数 */
  executionCount: number;
  /** 最終使用日時 (ISO 8601形式) */
  lastUsed?: string | null;
}

/**
 * 分析サマリー
 *
 * 全スキルの利用状況を集約したサマリーデータ。
 */
export interface AnalyticsSummary {
  /** ユニークスキル数 */
  totalSkills: number;
  /** 総実行回数 */
  totalExecutions: number;
  /** 全体成功率 (0-1) */
  overallSuccessRate: number;
  /** 最も使用されたスキル（実行回数降順） */
  mostUsedSkills: SkillUsageSummary[];
  /** 直近のアクティビティ */
  recentActivity: SkillUsageEvent[];
}
