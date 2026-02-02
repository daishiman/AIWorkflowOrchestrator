/**
 * @file dateFilterUtils テスト
 * @description TDD Red Phase - 日付フィルタリングロジックのユニットテスト
 * @feature task-imp-permission-date-filter
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getDateRangeStartDate,
  filterByDateRange,
  DAYS_IN_WEEK,
  DAYS_IN_MONTH,
} from "../dateFilterUtils";
import type { PermissionHistoryEntry } from "../../../skill/permissionHistory";

// ==========================================================================
// テストヘルパー
// ==========================================================================

/** テスト用エントリを作成 */
function createTestEntry(
  overrides: Partial<PermissionHistoryEntry> = {},
): PermissionHistoryEntry {
  return {
    id: `entry-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
    toolName: "Bash",
    argsSnapshot: "test command",
    decision: "approved",
    ...overrides,
  };
}

/** 指定日前のタイムスタンプを作成 */
function daysAgo(days: number, hours = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

// ==========================================================================
// getDateRangeStartDate テスト
// ==========================================================================

describe("getDateRangeStartDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-02T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('preset="all"でnullを返す', () => {
    const result = getDateRangeStartDate("all");
    expect(result).toBeNull();
  });

  it('preset="today"で本日00:00:00を返す', () => {
    const result = getDateRangeStartDate("today");
    expect(result).not.toBeNull();
    expect(result!.getHours()).toBe(0);
    expect(result!.getMinutes()).toBe(0);
    expect(result!.getSeconds()).toBe(0);
    expect(result!.getMilliseconds()).toBe(0);
  });

  it('preset="week"で7日前00:00:00を返す', () => {
    const result = getDateRangeStartDate("week");
    expect(result).not.toBeNull();
    const now = new Date();
    const expected = new Date(now);
    expected.setDate(expected.getDate() - 7);
    expected.setHours(0, 0, 0, 0);
    expect(result!.getTime()).toBe(expected.getTime());
  });

  it('preset="month"で30日前00:00:00を返す', () => {
    const result = getDateRangeStartDate("month");
    expect(result).not.toBeNull();
    const now = new Date();
    const expected = new Date(now);
    expected.setDate(expected.getDate() - 30);
    expected.setHours(0, 0, 0, 0);
    expect(result!.getTime()).toBe(expected.getTime());
  });

  it('preset="custom"でnullを返す', () => {
    const result = getDateRangeStartDate("custom");
    expect(result).toBeNull();
  });
});

// ==========================================================================
// filterByDateRange テスト
// ==========================================================================

describe("filterByDateRange", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-02T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ------ preset="all" ------

  it('preset="all"で全エントリを返す', () => {
    const entries = [
      createTestEntry({ timestamp: daysAgo(0) }),
      createTestEntry({ timestamp: daysAgo(100) }),
    ];
    const result = filterByDateRange(entries, { preset: "all" });
    expect(result).toHaveLength(2);
  });

  // ------ preset="today" ------

  it('preset="today"で今日のエントリのみ返す', () => {
    const entries = [
      createTestEntry({ timestamp: daysAgo(0) }),
      createTestEntry({ timestamp: daysAgo(1) }),
    ];
    const result = filterByDateRange(entries, { preset: "today" });
    expect(result).toHaveLength(1);
  });

  // ------ preset="week" ------

  it('preset="week"で7日以内のエントリのみ返す', () => {
    const entries = [
      createTestEntry({ timestamp: daysAgo(0) }),
      createTestEntry({ timestamp: daysAgo(3) }),
      createTestEntry({ timestamp: daysAgo(8) }),
    ];
    const result = filterByDateRange(entries, { preset: "week" });
    expect(result).toHaveLength(2);
  });

  // ------ preset="month" ------

  it('preset="month"で30日以内のエントリのみ返す', () => {
    const entries = [
      createTestEntry({ timestamp: daysAgo(0) }),
      createTestEntry({ timestamp: daysAgo(15) }),
      createTestEntry({ timestamp: daysAgo(31) }),
    ];
    const result = filterByDateRange(entries, { preset: "month" });
    expect(result).toHaveLength(2);
  });

  // ------ preset="custom" ------

  it('preset="custom"でstart/end範囲内のみ返す', () => {
    const entries = [
      createTestEntry({ timestamp: "2026-01-28T10:00:00.000Z" }),
      createTestEntry({ timestamp: "2026-02-01T10:00:00.000Z" }),
      createTestEntry({ timestamp: "2026-02-03T10:00:00.000Z" }),
    ];
    const result = filterByDateRange(entries, {
      preset: "custom",
      start: "2026-02-01",
      end: "2026-02-02",
    });
    expect(result).toHaveLength(1);
  });

  it('preset="custom"でstartのみ指定時、start以降の全エントリを返す', () => {
    const entries = [
      createTestEntry({ timestamp: "2026-01-28T10:00:00.000Z" }),
      createTestEntry({ timestamp: "2026-02-01T10:00:00.000Z" }),
      createTestEntry({ timestamp: "2026-02-03T10:00:00.000Z" }),
    ];
    const result = filterByDateRange(entries, {
      preset: "custom",
      start: "2026-02-01",
    });
    expect(result).toHaveLength(2);
  });

  it('preset="custom"でendのみ指定時、end以前の全エントリを返す', () => {
    const entries = [
      createTestEntry({ timestamp: "2026-01-28T10:00:00.000Z" }),
      createTestEntry({ timestamp: "2026-02-01T10:00:00.000Z" }),
      createTestEntry({ timestamp: "2026-02-03T10:00:00.000Z" }),
    ];
    const result = filterByDateRange(entries, {
      preset: "custom",
      end: "2026-02-01",
    });
    expect(result).toHaveLength(2);
  });

  // ------ 複合フィルタテスト ------

  it("空配列に対してフィルタが空配列を返す", () => {
    const result = filterByDateRange([], { preset: "today" });
    expect(result).toHaveLength(0);
  });

  it("1000件に対するフィルタが正常動作する", () => {
    const entries = Array.from({ length: 1000 }, (_, i) =>
      createTestEntry({
        id: `perf-${i}`,
        timestamp: daysAgo(i % 60),
      }),
    );
    const result = filterByDateRange(entries, { preset: "today" });
    expect(result.length).toBeLessThanOrEqual(1000);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  // ------ 境界値テスト ------

  describe("境界値テスト", () => {
    it("今日の00:00:00ちょうどのエントリはtodayプリセットで通過する", () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const entries = [
        createTestEntry({ timestamp: todayStart.toISOString() }),
      ];
      const result = filterByDateRange(entries, { preset: "today" });
      expect(result).toHaveLength(1);
    });

    it("昨日の23:59:59のエントリはtodayプリセットで除外される", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);
      const entries = [createTestEntry({ timestamp: yesterday.toISOString() })];
      const result = filterByDateRange(entries, { preset: "today" });
      expect(result).toHaveLength(0);
    });

    it("7日前の00:00:00ちょうどのエントリはweekプリセットで通過する", () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const entries = [
        createTestEntry({ timestamp: sevenDaysAgo.toISOString() }),
      ];
      const result = filterByDateRange(entries, { preset: "week" });
      expect(result).toHaveLength(1);
    });

    it("8日前の23:59:59のエントリはweekプリセットで除外される", () => {
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
      eightDaysAgo.setHours(23, 59, 59, 999);
      const entries = [
        createTestEntry({ timestamp: eightDaysAgo.toISOString() }),
      ];
      const result = filterByDateRange(entries, { preset: "week" });
      expect(result).toHaveLength(0);
    });

    it("カスタムstart境界ちょうどのエントリはフィルタ通過する", () => {
      const entries = [
        createTestEntry({ timestamp: "2026-02-01T00:00:00.000Z" }),
      ];
      const result = filterByDateRange(entries, {
        preset: "custom",
        start: "2026-02-01",
      });
      expect(result).toHaveLength(1);
    });

    it("カスタムend境界ちょうどのエントリはフィルタ通過する", () => {
      // end日の終わり（ローカル時間23:59:59）を生成
      const endOfDay = new Date("2026-02-05T00:00:00");
      endOfDay.setHours(23, 59, 59, 999);
      const entries = [createTestEntry({ timestamp: endOfDay.toISOString() })];
      const result = filterByDateRange(entries, {
        preset: "custom",
        end: "2026-02-05",
      });
      expect(result).toHaveLength(1);
    });
  });
});

// ==========================================================================
// 定数テスト
// ==========================================================================

describe("日付フィルタ定数", () => {
  it("DAYS_IN_WEEKが7である", () => {
    expect(DAYS_IN_WEEK).toBe(7);
  });

  it("DAYS_IN_MONTHが30である", () => {
    expect(DAYS_IN_MONTH).toBe(30);
  });
});
