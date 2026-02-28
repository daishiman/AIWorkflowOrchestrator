/**
 * Skill Analytics Types - Type Definition Tests
 *
 * TASK-9J Phase 4: TDD Red Phase
 * 8 test cases (T-01 to T-08)
 *
 * Tests that type definitions compile correctly.
 */
import { describe, it, expect } from "vitest";

import type {
  SkillUsageEvent,
  ToolUsageStat,
  SkillStatistics,
  AnalyticsPeriod,
  AnalyticsSummary,
} from "../skill-analytics";

// =============================================================================
// Task 1: 型定義テスト (T-01 ~ T-08)
// =============================================================================
describe("Skill Analytics Types", () => {
  // T-01: SkillUsageEvent 型が必須フィールドを持つ
  it("T-01: SkillUsageEvent 型が必須フィールド（id, skillName, eventType, timestamp, success, toolsUsed）を持つ", () => {
    const event: SkillUsageEvent = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      skillName: "daily-report",
      eventType: "execution",
      timestamp: "2026-02-28T09:00:00.000Z",
      success: true,
      toolsUsed: ["Read", "Write"],
    };

    expect(event.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(event.skillName).toBe("daily-report");
    expect(event.eventType).toBe("execution");
    expect(event.timestamp).toBe("2026-02-28T09:00:00.000Z");
    expect(event.success).toBe(true);
    expect(event.toolsUsed).toEqual(["Read", "Write"]);
  });

  // T-02: eventType は "execution" | "error" | "cancellation" を受け入れる
  it('T-02: eventType は "execution" | "error" | "cancellation" の3種類を受け入れる', () => {
    const execution: SkillUsageEvent = {
      id: "1",
      skillName: "test",
      eventType: "execution",
      timestamp: "2026-02-28T09:00:00.000Z",
      success: true,
      toolsUsed: [],
    };

    const error: SkillUsageEvent = {
      id: "2",
      skillName: "test",
      eventType: "error",
      timestamp: "2026-02-28T09:00:00.000Z",
      success: false,
      toolsUsed: [],
    };

    const cancellation: SkillUsageEvent = {
      id: "3",
      skillName: "test",
      eventType: "cancellation",
      timestamp: "2026-02-28T09:00:00.000Z",
      success: false,
      toolsUsed: [],
    };

    expect(execution.eventType).toBe("execution");
    expect(error.eventType).toBe("error");
    expect(cancellation.eventType).toBe("cancellation");
  });

  // T-03: duration, errorMessage, tokenCount はオプショナル
  it("T-03: duration, errorMessage, tokenCount はオプショナルフィールドとして型チェックを通過する", () => {
    const withOptionals: SkillUsageEvent = {
      id: "1",
      skillName: "test",
      eventType: "execution",
      timestamp: "2026-02-28T09:00:00.000Z",
      success: true,
      toolsUsed: ["Read"],
      duration: 1500,
      errorMessage: "Something went wrong",
      tokenCount: 250,
    };

    expect(withOptionals.duration).toBe(1500);
    expect(withOptionals.errorMessage).toBe("Something went wrong");
    expect(withOptionals.tokenCount).toBe(250);

    const withoutOptionals: SkillUsageEvent = {
      id: "2",
      skillName: "test",
      eventType: "execution",
      timestamp: "2026-02-28T09:00:00.000Z",
      success: true,
      toolsUsed: [],
    };

    expect(withoutOptionals.duration).toBeUndefined();
    expect(withoutOptionals.errorMessage).toBeUndefined();
    expect(withoutOptionals.tokenCount).toBeUndefined();
  });

  // T-04: SkillStatistics 型が必須フィールドを持つ
  it("T-04: SkillStatistics 型が必須フィールド（skillName, totalExecutions, successRate, averageDuration, errorRate, totalTokens, mostUsedTools）を持つ", () => {
    const stats: SkillStatistics = {
      skillName: "daily-report",
      totalExecutions: 100,
      successRate: 0.95,
      averageDuration: 3200,
      errorRate: 0.05,
      totalTokens: 25000,
      mostUsedTools: [
        { toolName: "Read", count: 80, percentage: 40 },
        { toolName: "Write", count: 60, percentage: 30 },
      ],
    };

    expect(stats.skillName).toBe("daily-report");
    expect(stats.totalExecutions).toBe(100);
    expect(stats.successRate).toBe(0.95);
    expect(stats.averageDuration).toBe(3200);
    expect(stats.errorRate).toBe(0.05);
    expect(stats.totalTokens).toBe(25000);
    expect(stats.mostUsedTools).toHaveLength(2);
  });

  // T-05: lastUsed は string | null | undefined を受け入れる
  it("T-05: lastUsed は string | null | undefined を受け入れる", () => {
    const withString: SkillStatistics = {
      skillName: "test",
      totalExecutions: 1,
      successRate: 1,
      averageDuration: 100,
      errorRate: 0,
      totalTokens: 50,
      mostUsedTools: [],
      lastUsed: "2026-02-28T09:00:00.000Z",
    };

    const withNull: SkillStatistics = {
      skillName: "test",
      totalExecutions: 0,
      successRate: 0,
      averageDuration: 0,
      errorRate: 0,
      totalTokens: 0,
      mostUsedTools: [],
      lastUsed: null,
    };

    const withUndefined: SkillStatistics = {
      skillName: "test",
      totalExecutions: 0,
      successRate: 0,
      averageDuration: 0,
      errorRate: 0,
      totalTokens: 0,
      mostUsedTools: [],
    };

    expect(withString.lastUsed).toBe("2026-02-28T09:00:00.000Z");
    expect(withNull.lastUsed).toBeNull();
    expect(withUndefined.lastUsed).toBeUndefined();
  });

  // T-06: granularity は "hour" | "day" | "week" | "month" を受け入れる
  it('T-06: granularity は "hour" | "day" | "week" | "month" の4種類を受け入れる', () => {
    const hourly: AnalyticsPeriod = {
      start: "2026-02-01T00:00:00.000Z",
      end: "2026-02-28T23:59:59.999Z",
      granularity: "hour",
    };

    const daily: AnalyticsPeriod = {
      start: "2026-02-01T00:00:00.000Z",
      end: "2026-02-28T23:59:59.999Z",
      granularity: "day",
    };

    const weekly: AnalyticsPeriod = {
      start: "2026-02-01T00:00:00.000Z",
      end: "2026-02-28T23:59:59.999Z",
      granularity: "week",
    };

    const monthly: AnalyticsPeriod = {
      start: "2026-01-01T00:00:00.000Z",
      end: "2026-12-31T23:59:59.999Z",
      granularity: "month",
    };

    expect(hourly.granularity).toBe("hour");
    expect(daily.granularity).toBe("day");
    expect(weekly.granularity).toBe("week");
    expect(monthly.granularity).toBe("month");
  });

  // T-07: AnalyticsSummary 型が必須フィールドを持つ
  it("T-07: AnalyticsSummary 型が必須フィールド（totalSkills, totalExecutions, overallSuccessRate, mostUsedSkills, recentActivity）を持つ", () => {
    const summary: AnalyticsSummary = {
      totalSkills: 5,
      totalExecutions: 500,
      overallSuccessRate: 0.92,
      mostUsedSkills: [
        {
          skillName: "daily-report",
          executionCount: 200,
          lastUsed: "2026-02-28T09:00:00.000Z",
        },
      ],
      recentActivity: [
        {
          id: "1",
          skillName: "daily-report",
          eventType: "execution",
          timestamp: "2026-02-28T09:00:00.000Z",
          success: true,
          toolsUsed: ["Read"],
        },
      ],
    };

    expect(summary.totalSkills).toBe(5);
    expect(summary.totalExecutions).toBe(500);
    expect(summary.overallSuccessRate).toBe(0.92);
    expect(summary.mostUsedSkills).toHaveLength(1);
    expect(summary.recentActivity).toHaveLength(1);
  });

  // T-08: ToolUsageStat 型が必須フィールドを持つ
  it("T-08: ToolUsageStat 型が必須フィールド（toolName, count, percentage）を持つ", () => {
    const stat: ToolUsageStat = {
      toolName: "Read",
      count: 150,
      percentage: 45.5,
    };

    expect(stat.toolName).toBe("Read");
    expect(stat.count).toBe(150);
    expect(stat.percentage).toBe(45.5);
  });
});
