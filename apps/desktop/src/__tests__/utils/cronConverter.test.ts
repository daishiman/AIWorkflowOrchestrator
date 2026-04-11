/**
 * @file cronConverter.test.ts
 * @description cronConverter ユニットテスト（TDD Red フェーズ）
 * @phase Phase 4: テスト作成
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import { describe, it, expect } from "vitest";
import { visualConfigToCron } from "../../renderer/utils/cronConverter";
import type { VisualCronConfig } from "../../renderer/types/visualCronConfig";

const base: VisualCronConfig = {
  frequency: "daily",
  hour: 9,
  minute: 0,
  weekdays: [],
  dayOfMonth: 1,
};

describe("visualConfigToCron", () => {
  it("CC-01: every-minute は '* * * * *' を返す", () => {
    expect(visualConfigToCron({ ...base, frequency: "every-minute" })).toBe(
      "* * * * *",
    );
  });

  it("CC-02: every-hour 分=0", () => {
    expect(
      visualConfigToCron({ ...base, frequency: "every-hour", minute: 0 }),
    ).toBe("0 * * * *");
  });

  it("CC-03: every-hour 分=30", () => {
    expect(
      visualConfigToCron({ ...base, frequency: "every-hour", minute: 30 }),
    ).toBe("30 * * * *");
  });

  it("CC-04: every-hour 分=59", () => {
    expect(
      visualConfigToCron({ ...base, frequency: "every-hour", minute: 59 }),
    ).toBe("59 * * * *");
  });

  it("CC-05: daily 時=9, 分=0", () => {
    expect(
      visualConfigToCron({ ...base, frequency: "daily", hour: 9, minute: 0 }),
    ).toBe("0 9 * * *");
  });

  it("CC-06: daily 時=0, 分=0（深夜0時）", () => {
    expect(
      visualConfigToCron({ ...base, frequency: "daily", hour: 0, minute: 0 }),
    ).toBe("0 0 * * *");
  });

  it("CC-07: daily 時=23, 分=55（最大値）", () => {
    expect(
      visualConfigToCron({
        ...base,
        frequency: "daily",
        hour: 23,
        minute: 55,
      }),
    ).toBe("55 23 * * *");
  });

  it("CC-08: weekly 月曜のみ", () => {
    expect(
      visualConfigToCron({
        ...base,
        frequency: "weekly",
        hour: 9,
        minute: 0,
        weekdays: [1],
      }),
    ).toBe("0 9 * * 1");
  });

  it("CC-09: weekly 月・水・金", () => {
    expect(
      visualConfigToCron({
        ...base,
        frequency: "weekly",
        hour: 9,
        minute: 0,
        weekdays: [1, 3, 5],
      }),
    ).toBe("0 9 * * 1,3,5");
  });

  it("CC-10: weekly 土・日（週末）", () => {
    expect(
      visualConfigToCron({
        ...base,
        frequency: "weekly",
        hour: 8,
        minute: 30,
        weekdays: [0, 6],
      }),
    ).toBe("30 8 * * 0,6");
  });

  it("CC-11: weekly 全曜日", () => {
    expect(
      visualConfigToCron({
        ...base,
        frequency: "weekly",
        hour: 6,
        minute: 0,
        weekdays: [0, 1, 2, 3, 4, 5, 6],
      }),
    ).toBe("0 6 * * 0,1,2,3,4,5,6");
  });

  it("CC-12: weekly weekdays がソートされていない場合も昇順に正規化", () => {
    const result = visualConfigToCron({
      ...base,
      frequency: "weekly",
      hour: 9,
      minute: 0,
      weekdays: [5, 1, 3],
    });
    expect(result).toContain("1,3,5");
  });

  it("CC-13: monthly 1日, 9:00", () => {
    expect(
      visualConfigToCron({
        ...base,
        frequency: "monthly",
        hour: 9,
        minute: 0,
        dayOfMonth: 1,
      }),
    ).toBe("0 9 1 * *");
  });

  it("CC-14: monthly 31日, 23:59", () => {
    expect(
      visualConfigToCron({
        ...base,
        frequency: "monthly",
        hour: 23,
        minute: 59,
        dayOfMonth: 31,
      }),
    ).toBe("59 23 31 * *");
  });

  it("CC-15: monthly 15日", () => {
    expect(
      visualConfigToCron({
        ...base,
        frequency: "monthly",
        hour: 12,
        minute: 0,
        dayOfMonth: 15,
      }),
    ).toBe("0 12 15 * *");
  });

  it("CC-16: custom rawCronExpression をそのまま返す（標準式）", () => {
    expect(
      visualConfigToCron({
        ...base,
        frequency: "custom",
        rawCronExpression: "5 4 * * 2",
      }),
    ).toBe("5 4 * * 2");
  });

  it("CC-17: custom rawCronExpression をそのまま返す（複雑式）", () => {
    expect(
      visualConfigToCron({
        ...base,
        frequency: "custom",
        rawCronExpression: "0 */6 * * *",
      }),
    ).toBe("0 */6 * * *");
  });

  it("CC-18: custom rawCronExpression が未定義のとき空文字を返す", () => {
    expect(visualConfigToCron({ ...base, frequency: "custom" })).toBe("");
  });

  it("CC-19: every-minute は hour/minute の値を無視する", () => {
    expect(
      visualConfigToCron({
        ...base,
        frequency: "every-minute",
        hour: 5,
        minute: 30,
      }),
    ).toBe("* * * * *");
  });

  it("CC-20: weekly weekdays の順序が常に昇順になること", () => {
    const result = visualConfigToCron({
      ...base,
      frequency: "weekly",
      hour: 9,
      minute: 0,
      weekdays: [6, 0, 3],
    });
    expect(result).toBe("0 9 * * 0,3,6");
  });

  it("CC-21: daily 時=1, 分=5 の境界値", () => {
    expect(
      visualConfigToCron({ ...base, frequency: "daily", hour: 1, minute: 5 }),
    ).toBe("5 1 * * *");
  });
});
