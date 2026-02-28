/**
 * SkillAnalytics - スキル利用分析サービス
 *
 * TASK-9J: スキル利用分析・統計機能
 *
 * AnalyticsStore に蓄積されたイベントデータを集計・分析する。
 * DI: constructor(analyticsStore: AnalyticsStore)
 */

import type {
  SkillUsageEvent,
  SkillStatistics,
  AnalyticsSummary,
  AnalyticsPeriod,
  UsageTrend,
  TrendDataPoint,
  ToolUsageStat,
  SkillUsageSummary,
} from "@repo/shared";
import type { AnalyticsStore } from "./AnalyticsStore";

/** CSV ヘッダ行 */
const CSV_HEADER =
  "id,skillName,eventType,timestamp,success,toolsUsed,duration,errorMessage,tokenCount";

/**
 * スキル利用分析サービス
 */
export class SkillAnalytics {
  constructor(private readonly analyticsStore: AnalyticsStore) {}

  /**
   * イベントを記録する
   *
   * timestamp が未設定の場合は現在時刻を自動設定する。
   *
   * @param event - 記録するイベントデータ（id は自動生成）
   * @returns 記録されたイベント
   */
  recordEvent(
    event: Omit<SkillUsageEvent, "id" | "timestamp"> & { timestamp?: string },
  ): SkillUsageEvent {
    const timestamp = event.timestamp || new Date().toISOString();
    return this.analyticsStore.addEvent({
      ...event,
      timestamp,
    });
  }

  /**
   * スキル統計情報を取得する
   *
   * @param skillName - スキル名
   * @param period - 期間フィルタ（省略時は全期間）
   * @returns スキル統計情報
   */
  getStatistics(
    skillName: string,
    period?: { start: string; end: string },
  ): SkillStatistics {
    let events = this.analyticsStore.getEventsBySkill(skillName);

    if (period) {
      events = events.filter(
        (e) => e.timestamp >= period.start && e.timestamp <= period.end,
      );
    }

    const totalExecutions = events.length;
    const successCount = events.filter((e) => e.success).length;
    const errorCount = events.filter((e) => e.eventType === "error").length;

    // successRate: 0件の場合は0
    const successRate =
      totalExecutions > 0 ? successCount / totalExecutions : 0;

    // errorRate: error件数/全件数, 0件の場合は0
    const errorRate = totalExecutions > 0 ? errorCount / totalExecutions : 0;

    // averageDuration: durationが定義されているイベントのみ平均, 0件の場合は0
    const eventsWithDuration = events.filter(
      (e) => e.duration !== undefined && e.duration !== null,
    );
    const averageDuration =
      eventsWithDuration.length > 0
        ? eventsWithDuration.reduce((sum, e) => sum + (e.duration ?? 0), 0) /
          eventsWithDuration.length
        : 0;

    // totalTokens
    const totalTokens = events.reduce((sum, e) => sum + (e.tokenCount ?? 0), 0);

    // lastUsed: 最新のイベントのタイムスタンプ
    const lastUsed =
      events.length > 0
        ? events.reduce((latest, e) =>
            e.timestamp > latest.timestamp ? e : latest,
          ).timestamp
        : null;

    // mostUsedTools: ツール利用統計
    const toolCounts = new Map<string, number>();
    let totalToolUsage = 0;
    for (const event of events) {
      for (const tool of event.toolsUsed) {
        toolCounts.set(tool, (toolCounts.get(tool) ?? 0) + 1);
        totalToolUsage++;
      }
    }
    const mostUsedTools: ToolUsageStat[] = Array.from(toolCounts.entries())
      .map(([toolName, count]) => ({
        toolName,
        count,
        percentage:
          totalToolUsage > 0
            ? Math.round((count / totalToolUsage) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      skillName,
      totalExecutions,
      successRate,
      averageDuration,
      errorRate,
      totalTokens,
      lastUsed,
      mostUsedTools,
    };
  }

  /**
   * 全体サマリーを取得する
   *
   * @param limit - recentActivity の最大件数（デフォルト10）
   * @returns 全体サマリー
   */
  getSummary(limit = 10): AnalyticsSummary {
    const allEvents = this.analyticsStore.getAllEvents();

    // ユニークスキル名を取得
    const skillNames = new Set(allEvents.map((e) => e.skillName));
    const totalSkills = skillNames.size;

    const totalExecutions = allEvents.length;
    const successCount = allEvents.filter((e) => e.success).length;
    const overallSuccessRate =
      totalExecutions > 0 ? successCount / totalExecutions : 0;

    // mostUsedSkills: 実行回数降順
    const skillCounts = new Map<string, { count: number; lastUsed: string }>();
    for (const event of allEvents) {
      const existing = skillCounts.get(event.skillName);
      if (existing) {
        existing.count++;
        if (event.timestamp > existing.lastUsed) {
          existing.lastUsed = event.timestamp;
        }
      } else {
        skillCounts.set(event.skillName, {
          count: 1,
          lastUsed: event.timestamp,
        });
      }
    }
    const mostUsedSkills: SkillUsageSummary[] = Array.from(
      skillCounts.entries(),
    )
      .map(([skillName, data]) => ({
        skillName,
        executionCount: data.count,
        lastUsed: data.lastUsed,
      }))
      .sort((a, b) => b.executionCount - a.executionCount);

    // recentActivity: タイムスタンプ降順で上位N件
    const recentActivity = [...allEvents]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);

    return {
      totalSkills,
      totalExecutions,
      overallSuccessRate,
      mostUsedSkills,
      recentActivity,
    };
  }

  /**
   * 利用トレンドを取得する
   *
   * @param period - 分析期間
   * @param skillName - スキル名フィルタ（省略時は全スキル）
   * @returns 利用トレンド
   */
  getUsageTrend(period: AnalyticsPeriod, skillName?: string): UsageTrend {
    let events: SkillUsageEvent[];

    if (skillName) {
      events = this.analyticsStore
        .getEventsBySkill(skillName)
        .filter(
          (e) => e.timestamp >= period.start && e.timestamp <= period.end,
        );
    } else {
      events = this.analyticsStore.getEventsByPeriod(period.start, period.end);
    }

    // グラニュラリティに基づいてデータポイントを生成
    const dataPoints = this.generateDataPoints(period, events);

    return {
      period,
      dataPoints,
    };
  }

  /**
   * データをエクスポートする
   *
   * @param format - エクスポート形式（"json" | "csv"）
   * @param period - 期間フィルタ（省略時は全データ）
   * @returns エクスポートされたデータ文字列
   */
  exportData(
    format: "json" | "csv",
    period?: { start: string; end: string },
  ): string {
    let events: SkillUsageEvent[];

    if (period) {
      events = this.analyticsStore.getEventsByPeriod(period.start, period.end);
    } else {
      events = this.analyticsStore.getAllEvents();
    }

    if (format === "json") {
      return JSON.stringify(events, null, 2);
    }

    // CSV形式: ヘッダ行 + データ行
    const rows = events.map((e) =>
      [
        e.id,
        e.skillName,
        e.eventType,
        e.timestamp,
        e.success,
        e.toolsUsed.join(";"),
        e.duration ?? "",
        e.errorMessage ?? "",
        e.tokenCount ?? "",
      ].join(","),
    );

    return [CSV_HEADER, ...rows].join("\n");
  }

  /**
   * データを削除する
   *
   * @param before - この日時より前のデータを削除（省略時は全データ削除）
   */
  clearData(before?: string): void {
    if (before) {
      this.analyticsStore.clearBefore(before);
    } else {
      this.analyticsStore.clearAll();
    }
  }

  /**
   * 期間とグラニュラリティに基づいてデータポイントを生成する
   */
  private generateDataPoints(
    period: AnalyticsPeriod,
    events: SkillUsageEvent[],
  ): TrendDataPoint[] {
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);
    const dataPoints: TrendDataPoint[] = [];

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const nextDate = this.getNextDate(currentDate, period.granularity);
      const currentIso = currentDate.toISOString();
      const nextIso = nextDate.toISOString();

      // この期間内のイベントをフィルタ
      const periodEvents = events.filter(
        (e) => e.timestamp >= currentIso && e.timestamp < nextIso,
      );

      const executions = periodEvents.length;
      const errors = periodEvents.filter((e) => e.eventType === "error").length;
      const eventsWithDuration = periodEvents.filter(
        (e) => e.duration !== undefined && e.duration !== null,
      );
      const avgDuration =
        eventsWithDuration.length > 0
          ? eventsWithDuration.reduce((sum, e) => sum + (e.duration ?? 0), 0) /
            eventsWithDuration.length
          : 0;

      dataPoints.push({
        timestamp: currentIso,
        executions,
        errors,
        avgDuration,
      });

      currentDate = nextDate;
    }

    return dataPoints;
  }

  /**
   * グラニュラリティに基づいて次の日付を計算する
   */
  private getNextDate(current: Date, granularity: string): Date {
    const next = new Date(current);
    switch (granularity) {
      case "hour":
        next.setHours(next.getHours() + 1);
        break;
      case "day":
        next.setDate(next.getDate() + 1);
        break;
      case "week":
        next.setDate(next.getDate() + 7);
        break;
      case "month":
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        next.setDate(next.getDate() + 1);
    }
    return next;
  }
}
