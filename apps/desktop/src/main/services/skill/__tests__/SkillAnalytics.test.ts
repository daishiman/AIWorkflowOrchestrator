/**
 * SkillAnalytics Unit Tests
 *
 * TASK-9J Phase 4: TDD
 * 29 test cases (SA-01 to SA-29)
 *
 * Tests recordEvent, getStatistics, getSummary, getUsageTrend, exportData, clearData.
 * P9 compliance: beforeEach resets all mocks and creates new SkillAnalytics instance.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  SkillUsageEvent,
  AnalyticsPeriod,
} from "@repo/shared/src/types/skill-analytics";
import { SkillAnalytics } from "../SkillAnalytics";
import type { AnalyticsStore } from "../AnalyticsStore";

// =============================================================================
// テストヘルパー
// =============================================================================

function createMockStore(): {
  store: AnalyticsStore;
  addEvent: ReturnType<typeof vi.fn>;
  getAllEvents: ReturnType<typeof vi.fn>;
  getEventsBySkill: ReturnType<typeof vi.fn>;
  getEventsByPeriod: ReturnType<typeof vi.fn>;
  clearBefore: ReturnType<typeof vi.fn>;
  clearAll: ReturnType<typeof vi.fn>;
} {
  const addEvent = vi.fn(
    (input: Omit<SkillUsageEvent, "id">): SkillUsageEvent => ({
      ...input,
      id: "generated-uuid",
    }),
  );
  const getAllEvents = vi.fn(() => []);
  const getEventsBySkill = vi.fn(() => []);
  const getEventsByPeriod = vi.fn(() => []);
  const clearBefore = vi.fn();
  const clearAll = vi.fn();

  return {
    store: {
      addEvent,
      getAllEvents,
      getEventsBySkill,
      getEventsByPeriod,
      clearBefore,
      clearAll,
    } as unknown as AnalyticsStore,
    addEvent,
    getAllEvents,
    getEventsBySkill,
    getEventsByPeriod,
    clearBefore,
    clearAll,
  };
}

function createEvent(
  overrides: Partial<SkillUsageEvent> = {},
): SkillUsageEvent {
  return {
    id: overrides.id ?? "event-001",
    skillName: overrides.skillName ?? "daily-report",
    eventType: overrides.eventType ?? "execution",
    timestamp: overrides.timestamp ?? "2026-02-28T09:00:00.000Z",
    success: overrides.success ?? true,
    toolsUsed: overrides.toolsUsed ?? ["Read", "Write"],
    duration: overrides.duration,
    errorMessage: overrides.errorMessage,
    tokenCount: overrides.tokenCount,
  };
}

// =============================================================================
// SkillAnalytics テスト
// =============================================================================
describe("SkillAnalytics", () => {
  let analytics: SkillAnalytics;
  let mock: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mock = createMockStore();
    analytics = new SkillAnalytics(mock.store);
  });

  // ===========================================================================
  // recordEvent (SA-01 ~ SA-04)
  // ===========================================================================
  describe("recordEvent", () => {
    // SA-01
    it("SA-01: イベントを記録すると store.addEvent に委譲される", () => {
      const input = {
        skillName: "daily-report",
        eventType: "execution" as const,
        timestamp: "2026-02-28T09:00:00.000Z",
        success: true,
        toolsUsed: ["Read"],
      };

      analytics.recordEvent(input);

      expect(mock.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          skillName: "daily-report",
          eventType: "execution",
          success: true,
        }),
      );
    });

    // SA-02
    it("SA-02: timestamp が未指定の場合は自動的に現在時刻が設定される", () => {
      const input = {
        skillName: "test",
        eventType: "execution" as const,
        success: true,
        toolsUsed: [],
      };

      analytics.recordEvent(input);

      expect(mock.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
    });

    // SA-03
    it("SA-03: 記録されたイベントが返される", () => {
      const result = analytics.recordEvent({
        skillName: "daily-report",
        eventType: "execution",
        timestamp: "2026-02-28T09:00:00.000Z",
        success: true,
        toolsUsed: ["Read"],
      });

      expect(result.id).toBe("generated-uuid");
      expect(result.skillName).toBe("daily-report");
    });

    // SA-04
    it("SA-04: オプショナルフィールド（duration, errorMessage, tokenCount）が保持される", () => {
      analytics.recordEvent({
        skillName: "test",
        eventType: "error",
        timestamp: "2026-02-28T09:00:00.000Z",
        success: false,
        toolsUsed: [],
        duration: 5000,
        errorMessage: "Timeout",
        tokenCount: 300,
      });

      expect(mock.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 5000,
          errorMessage: "Timeout",
          tokenCount: 300,
        }),
      );
    });
  });

  // ===========================================================================
  // getStatistics (SA-05 ~ SA-13)
  // ===========================================================================
  describe("getStatistics", () => {
    // SA-05
    it("SA-05: イベントがない場合はゼロ値の統計を返す", () => {
      mock.getEventsBySkill.mockReturnValue([]);

      const stats = analytics.getStatistics("non-existent");

      expect(stats.skillName).toBe("non-existent");
      expect(stats.totalExecutions).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.errorRate).toBe(0);
      expect(stats.totalTokens).toBe(0);
      expect(stats.mostUsedTools).toEqual([]);
    });

    // SA-06
    it("SA-06: successRate が成功数 / 総実行数で計算される", () => {
      mock.getEventsBySkill.mockReturnValue([
        createEvent({ success: true }),
        createEvent({ success: true }),
        createEvent({ success: false }),
        createEvent({ success: true }),
      ]);

      const stats = analytics.getStatistics("daily-report");
      expect(stats.successRate).toBeCloseTo(0.75);
    });

    // SA-07
    it("SA-07: averageDuration が duration の平均値で計算される", () => {
      mock.getEventsBySkill.mockReturnValue([
        createEvent({ duration: 1000 }),
        createEvent({ duration: 2000 }),
        createEvent({ duration: 3000 }),
      ]);

      const stats = analytics.getStatistics("daily-report");
      expect(stats.averageDuration).toBeCloseTo(2000);
    });

    // SA-08
    it("SA-08: duration が全て未設定の場合は averageDuration が 0 になる", () => {
      mock.getEventsBySkill.mockReturnValue([createEvent({}), createEvent({})]);

      const stats = analytics.getStatistics("daily-report");
      expect(stats.averageDuration).toBe(0);
    });

    // SA-09
    it("SA-09: errorRate が eventType === 'error' のイベント数 / 総実行数で計算される", () => {
      mock.getEventsBySkill.mockReturnValue([
        createEvent({ eventType: "execution" }),
        createEvent({ eventType: "error" }),
        createEvent({ eventType: "execution" }),
        createEvent({ eventType: "cancellation" }),
      ]);

      const stats = analytics.getStatistics("daily-report");
      expect(stats.errorRate).toBeCloseTo(0.25);
    });

    // SA-10
    it("SA-10: totalTokens がイベントの tokenCount の合計で計算される", () => {
      mock.getEventsBySkill.mockReturnValue([
        createEvent({ tokenCount: 100 }),
        createEvent({ tokenCount: 200 }),
        createEvent({}), // tokenCount 未設定
        createEvent({ tokenCount: 300 }),
      ]);

      const stats = analytics.getStatistics("daily-report");
      expect(stats.totalTokens).toBe(600);
    });

    // SA-11
    it("SA-11: mostUsedTools がツール使用頻度の降順で返される", () => {
      mock.getEventsBySkill.mockReturnValue([
        createEvent({ toolsUsed: ["Read", "Write", "Bash"] }),
        createEvent({ toolsUsed: ["Read", "Write"] }),
        createEvent({ toolsUsed: ["Read"] }),
      ]);

      const stats = analytics.getStatistics("daily-report");
      expect(stats.mostUsedTools[0].toolName).toBe("Read");
      expect(stats.mostUsedTools[0].count).toBe(3);
      expect(stats.mostUsedTools[1].toolName).toBe("Write");
      expect(stats.mostUsedTools[1].count).toBe(2);
      expect(stats.mostUsedTools[2].toolName).toBe("Bash");
      expect(stats.mostUsedTools[2].count).toBe(1);
    });

    // SA-12
    it("SA-12: mostUsedTools の percentage が正しく計算される", () => {
      mock.getEventsBySkill.mockReturnValue([
        createEvent({ toolsUsed: ["Read", "Read", "Write"] }),
      ]);

      const stats = analytics.getStatistics("daily-report");
      const readTool = stats.mostUsedTools.find((t) => t.toolName === "Read");
      const writeTool = stats.mostUsedTools.find((t) => t.toolName === "Write");

      expect(readTool).toBeDefined();
      expect(writeTool).toBeDefined();
      // Read: 2/3 = 66.67%, Write: 1/3 = 33.33%
      expect(readTool!.percentage).toBeCloseTo(66.67, 0);
      expect(writeTool!.percentage).toBeCloseTo(33.33, 0);
    });

    // SA-13
    it("SA-13: lastUsed が最新のタイムスタンプで設定される", () => {
      mock.getEventsBySkill.mockReturnValue([
        createEvent({ timestamp: "2026-02-01T00:00:00.000Z" }),
        createEvent({ timestamp: "2026-02-28T09:00:00.000Z" }),
        createEvent({ timestamp: "2026-02-15T12:00:00.000Z" }),
      ]);

      const stats = analytics.getStatistics("daily-report");
      expect(stats.lastUsed).toBe("2026-02-28T09:00:00.000Z");
    });
  });

  // ===========================================================================
  // getSummary (SA-14 ~ SA-19)
  // ===========================================================================
  describe("getSummary", () => {
    // SA-14
    it("SA-14: イベントがない場合はゼロ値のサマリーを返す", () => {
      mock.getAllEvents.mockReturnValue([]);

      const summary = analytics.getSummary();

      expect(summary.totalSkills).toBe(0);
      expect(summary.totalExecutions).toBe(0);
      expect(summary.overallSuccessRate).toBe(0);
      expect(summary.mostUsedSkills).toEqual([]);
      expect(summary.recentActivity).toEqual([]);
    });

    // SA-15
    it("SA-15: totalSkills がユニークなスキル数で計算される", () => {
      mock.getAllEvents.mockReturnValue([
        createEvent({ skillName: "skill-a" }),
        createEvent({ skillName: "skill-b" }),
        createEvent({ skillName: "skill-a" }),
        createEvent({ skillName: "skill-c" }),
      ]);

      const summary = analytics.getSummary();
      expect(summary.totalSkills).toBe(3);
    });

    // SA-16
    it("SA-16: totalExecutions が全イベント数で計算される", () => {
      mock.getAllEvents.mockReturnValue([
        createEvent({}),
        createEvent({}),
        createEvent({}),
      ]);

      const summary = analytics.getSummary();
      expect(summary.totalExecutions).toBe(3);
    });

    // SA-17
    it("SA-17: overallSuccessRate が全イベントの成功率で計算される", () => {
      mock.getAllEvents.mockReturnValue([
        createEvent({ success: true }),
        createEvent({ success: true }),
        createEvent({ success: false }),
        createEvent({ success: true }),
        createEvent({ success: false }),
      ]);

      const summary = analytics.getSummary();
      expect(summary.overallSuccessRate).toBeCloseTo(0.6);
    });

    // SA-18
    it("SA-18: mostUsedSkills が実行回数降順でソートされる", () => {
      mock.getAllEvents.mockReturnValue([
        createEvent({ skillName: "skill-a" }),
        createEvent({ skillName: "skill-b" }),
        createEvent({ skillName: "skill-a" }),
        createEvent({ skillName: "skill-c" }),
        createEvent({ skillName: "skill-a" }),
        createEvent({ skillName: "skill-b" }),
      ]);

      const summary = analytics.getSummary();
      expect(summary.mostUsedSkills[0].skillName).toBe("skill-a");
      expect(summary.mostUsedSkills[0].executionCount).toBe(3);
      expect(summary.mostUsedSkills[1].skillName).toBe("skill-b");
      expect(summary.mostUsedSkills[1].executionCount).toBe(2);
      expect(summary.mostUsedSkills[2].skillName).toBe("skill-c");
      expect(summary.mostUsedSkills[2].executionCount).toBe(1);
    });

    // SA-19
    it("SA-19: recentActivity が直近10件のイベントを返す", () => {
      const events = Array.from({ length: 15 }, (_, i) =>
        createEvent({
          id: `event-${i}`,
          timestamp: new Date(Date.UTC(2026, 1, 1 + i, 0, 0, 0)).toISOString(),
        }),
      );
      mock.getAllEvents.mockReturnValue(events);

      const summary = analytics.getSummary();
      expect(summary.recentActivity).toHaveLength(10);
      // 最新順に並んでいることを確認
      const timestamps = summary.recentActivity.map((e) =>
        new Date(e.timestamp).getTime(),
      );
      for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
      }
    });
  });

  // ===========================================================================
  // getUsageTrend (SA-20 ~ SA-23)
  // ===========================================================================
  describe("getUsageTrend", () => {
    const basePeriod: AnalyticsPeriod = {
      start: "2026-02-01T00:00:00.000Z",
      end: "2026-02-03T23:59:59.999Z",
      granularity: "day",
    };

    // SA-20
    it("SA-20: 指定期間のトレンドデータが返される", () => {
      mock.getEventsByPeriod.mockReturnValue([]);

      const trend = analytics.getUsageTrend(basePeriod);

      expect(trend.period).toEqual(basePeriod);
      expect(trend.dataPoints).toBeDefined();
      expect(Array.isArray(trend.dataPoints)).toBe(true);
    });

    // SA-21
    it("SA-21: イベントが存在する場合はデータポイントに集計される", () => {
      const events = [
        createEvent({
          timestamp: "2026-02-01T10:00:00.000Z",
          eventType: "execution",
          duration: 1000,
        }),
        createEvent({
          timestamp: "2026-02-01T14:00:00.000Z",
          eventType: "error",
          duration: 2000,
        }),
        createEvent({
          timestamp: "2026-02-02T10:00:00.000Z",
          eventType: "execution",
          duration: 3000,
        }),
      ];
      mock.getEventsByPeriod.mockReturnValue(events);

      const trend = analytics.getUsageTrend(basePeriod);

      expect(trend.dataPoints.length).toBeGreaterThan(0);
    });

    // SA-22
    it("SA-22: イベントがない期間のデータポイントは0値を持つ", () => {
      mock.getEventsByPeriod.mockReturnValue([]);

      const trend = analytics.getUsageTrend(basePeriod);

      trend.dataPoints.forEach((point) => {
        expect(point.executions).toBe(0);
        expect(point.errors).toBe(0);
        expect(point.avgDuration).toBe(0);
      });
    });

    // SA-23
    it("SA-23: skillName フィルタでスキル固有のトレンドを取得できる", () => {
      const targetEvents = [
        createEvent({
          skillName: "target-skill",
          timestamp: "2026-02-01T10:00:00.000Z",
        }),
      ];
      mock.getEventsBySkill.mockReturnValue(targetEvents);

      const trend = analytics.getUsageTrend(basePeriod, "target-skill");

      expect(mock.getEventsBySkill).toHaveBeenCalledWith("target-skill");
      const total = trend.dataPoints.reduce(
        (sum, dp) => sum + dp.executions,
        0,
      );
      expect(total).toBe(1);
    });
  });

  // ===========================================================================
  // exportData (SA-24 ~ SA-27)
  // ===========================================================================
  describe("exportData", () => {
    // SA-24
    it("SA-24: JSON 形式でエクスポートできる", () => {
      const events = [
        createEvent({ skillName: "skill-a" }),
        createEvent({ skillName: "skill-b" }),
      ];
      mock.getAllEvents.mockReturnValue(events);

      const result = analytics.exportData("json");

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].skillName).toBe("skill-a");
    });

    // SA-25
    it("SA-25: CSV 形式でエクスポートできる（ヘッダー行付き、toolsUsed はセミコロン区切り）", () => {
      const events = [
        createEvent({
          id: "1",
          skillName: "test",
          eventType: "execution",
          timestamp: "2026-02-28T09:00:00.000Z",
          success: true,
          toolsUsed: ["Read", "Write"],
          duration: 1500,
        }),
      ];
      mock.getAllEvents.mockReturnValue(events);

      const result = analytics.exportData("csv");

      // ヘッダー行があることを確認
      expect(result).toContain(
        "id,skillName,eventType,timestamp,success,toolsUsed,duration,errorMessage,tokenCount",
      );
      // データ行があることを確認
      expect(result).toContain("test");
      // toolsUsed がセミコロン区切りであることを確認
      expect(result).toContain("Read;Write");
    });

    // SA-26
    it("SA-26: period を指定すると期間内のイベントのみエクスポートされる", () => {
      const periodEvents = [createEvent({ skillName: "within-period" })];
      mock.getEventsByPeriod.mockReturnValue(periodEvents);

      const result = analytics.exportData("json", {
        start: "2026-02-01T00:00:00.000Z",
        end: "2026-02-28T23:59:59.999Z",
      });

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].skillName).toBe("within-period");
      expect(mock.getEventsByPeriod).toHaveBeenCalledWith(
        "2026-02-01T00:00:00.000Z",
        "2026-02-28T23:59:59.999Z",
      );
    });

    // SA-27
    it("SA-27: イベントが空の場合は空のエクスポートを返す", () => {
      mock.getAllEvents.mockReturnValue([]);

      const jsonResult = analytics.exportData("json");
      expect(JSON.parse(jsonResult)).toEqual([]);

      const csvResult = analytics.exportData("csv");
      // ヘッダー行のみ
      const lines = csvResult.split("\n");
      expect(lines).toHaveLength(1);
      expect(lines[0]).toContain("id,skillName");
    });
  });

  // ===========================================================================
  // clearData (SA-28 ~ SA-29)
  // ===========================================================================
  describe("clearData", () => {
    // SA-28
    it("SA-28: before を指定すると store.clearBefore に委譲される", () => {
      analytics.clearData("2026-02-15T00:00:00.000Z");

      expect(mock.clearBefore).toHaveBeenCalledWith("2026-02-15T00:00:00.000Z");
    });

    // SA-29
    it("SA-29: before を未指定の場合は store.clearAll に委譲される", () => {
      analytics.clearData();

      expect(mock.clearAll).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Phase 6: テスト拡充 - 境界値・グラニュラリティ・パフォーマンス
  // ===========================================================================
  describe("Phase 6: テスト拡充", () => {
    // SB-01: week グラニュラリティのトレンド生成
    it("SB-01: getUsageTrend で week グラニュラリティのデータポイントが正しく生成される", () => {
      mock.getEventsByPeriod.mockReturnValue([]);

      const weekPeriod = {
        start: "2026-02-01T00:00:00.000Z",
        end: "2026-02-28T23:59:59.999Z",
        granularity: "week" as const,
      };
      const trend = analytics.getUsageTrend(weekPeriod);

      expect(trend.period.granularity).toBe("week");
      // 4週間分のデータポイント
      expect(trend.dataPoints.length).toBeGreaterThanOrEqual(4);
    });

    // SB-02: month グラニュラリティのトレンド生成
    it("SB-02: getUsageTrend で month グラニュラリティのデータポイントが正しく生成される", () => {
      mock.getEventsByPeriod.mockReturnValue([]);

      const monthPeriod = {
        start: "2026-01-01T00:00:00.000Z",
        end: "2026-06-30T23:59:59.999Z",
        granularity: "month" as const,
      };
      const trend = analytics.getUsageTrend(monthPeriod);

      expect(trend.period.granularity).toBe("month");
      // 6ヶ月分のデータポイント
      expect(trend.dataPoints.length).toBeGreaterThanOrEqual(6);
    });

    // SB-03: hour グラニュラリティのトレンド生成
    it("SB-03: getUsageTrend で hour グラニュラリティのデータポイントが正しく生成される", () => {
      mock.getEventsByPeriod.mockReturnValue([]);

      const hourPeriod = {
        start: "2026-02-28T00:00:00.000Z",
        end: "2026-02-28T05:59:59.999Z",
        granularity: "hour" as const,
      };
      const trend = analytics.getUsageTrend(hourPeriod);

      expect(trend.period.granularity).toBe("hour");
      // 6時間分のデータポイント
      expect(trend.dataPoints.length).toBeGreaterThanOrEqual(6);
    });

    // SB-04: getStatistics で period フィルタが正しく動作する
    it("SB-04: getStatistics で period フィルタを指定するとフィルタされた結果を返す", () => {
      const events = [
        createEvent({
          timestamp: "2026-02-01T09:00:00.000Z",
          success: true,
        }),
        createEvent({
          timestamp: "2026-02-15T09:00:00.000Z",
          success: true,
        }),
        createEvent({
          timestamp: "2026-03-01T09:00:00.000Z",
          success: false,
        }),
      ];
      mock.getEventsBySkill.mockReturnValue(events);

      const stats = analytics.getStatistics("test", {
        start: "2026-02-01T00:00:00.000Z",
        end: "2026-02-28T23:59:59.999Z",
      });

      expect(stats.totalExecutions).toBe(2);
      expect(stats.successRate).toBe(1);
    });

    // SB-05: getSummary で recentActivity の limit が機能する
    it("SB-05: getSummary で recentActivity は指定数以内に制限される", () => {
      const events = Array.from({ length: 20 }, (_, i) =>
        createEvent({
          id: `evt-${i}`,
          timestamp: `2026-02-${String(i + 1).padStart(2, "0")}T09:00:00.000Z`,
        }),
      );
      mock.getAllEvents.mockReturnValue(events);

      const summary = analytics.getSummary(5);

      expect(summary.recentActivity).toHaveLength(5);
    });

    // SB-06: パフォーマンス - 10,000件の集計が1秒以内
    it("SB-06: 10,000件のイベントで getStatistics が1秒以内に完了する（NFR-4）", () => {
      const events = Array.from({ length: 10000 }, (_, i) => ({
        id: `perf-${i}`,
        skillName: "perf-test",
        eventType: "execution" as const,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        success: i % 10 !== 0,
        toolsUsed: ["Read", "Write"],
        duration: 1000 + (i % 100),
        tokenCount: 50 + (i % 50),
      }));
      mock.getEventsBySkill.mockReturnValue(events);

      const start = performance.now();
      const stats = analytics.getStatistics("perf-test");
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(1000);
      expect(stats.totalExecutions).toBe(10000);
    });

    // SB-07: exportData CSV でオプショナルフィールドが空の場合
    it("SB-07: exportData CSV でオプショナルフィールドが未定義の場合は空文字が出力される", () => {
      const events = [
        createEvent({
          id: "1",
          skillName: "test",
          duration: undefined,
          errorMessage: undefined,
          tokenCount: undefined,
        }),
      ];
      mock.getAllEvents.mockReturnValue(events);

      const csv = analytics.exportData("csv");
      const lines = csv.split("\n");
      expect(lines).toHaveLength(2);
      // 末尾3カラムが空
      const dataLine = lines[1];
      expect(dataLine).toMatch(/,,$/);
    });

    // SB-08: getStatistics で toolsUsed が空配列のイベントがある場合
    it("SB-08: getStatistics で toolsUsed が空配列のイベントがある場合は mostUsedTools が空になる", () => {
      const events = [
        createEvent({ toolsUsed: [] }),
        createEvent({ toolsUsed: [] }),
      ];
      mock.getEventsBySkill.mockReturnValue(events);

      const stats = analytics.getStatistics("test");

      expect(stats.mostUsedTools).toEqual([]);
    });
  });
});
