/**
 * @file cronParser.test.ts
 * @description cronParser ユニットテスト（TDD Red フェーズ）
 * @phase Phase 4: テスト作成
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import { describe, it, expect } from "vitest";
import { cronToVisualConfig } from "../../renderer/utils/cronParser";

describe("cronToVisualConfig", () => {
  it("CP-01: '* * * * *' → every-minute", () => {
    const result = cronToVisualConfig("* * * * *");
    expect(result?.frequency).toBe("every-minute");
  });

  it("CP-02: '0 * * * *' → every-hour, minute=0", () => {
    const result = cronToVisualConfig("0 * * * *");
    expect(result?.frequency).toBe("every-hour");
    expect(result?.minute).toBe(0);
  });

  it("CP-03: '30 * * * *' → every-hour, minute=30", () => {
    const result = cronToVisualConfig("30 * * * *");
    expect(result?.frequency).toBe("every-hour");
    expect(result?.minute).toBe(30);
  });

  it("CP-04: '0 9 * * *' → daily, hour=9, minute=0", () => {
    const result = cronToVisualConfig("0 9 * * *");
    expect(result?.frequency).toBe("daily");
    expect(result?.hour).toBe(9);
    expect(result?.minute).toBe(0);
  });

  it("CP-05: '55 23 * * *' → daily, hour=23, minute=55", () => {
    const result = cronToVisualConfig("55 23 * * *");
    expect(result?.frequency).toBe("daily");
    expect(result?.hour).toBe(23);
    expect(result?.minute).toBe(55);
  });

  it("CP-06: '0 9 * * 1' → weekly, weekdays=[1]", () => {
    const result = cronToVisualConfig("0 9 * * 1");
    expect(result?.frequency).toBe("weekly");
    expect(result?.weekdays).toEqual([1]);
  });

  it("CP-07: '0 9 * * 1,3,5' → weekly, weekdays=[1,3,5]", () => {
    const result = cronToVisualConfig("0 9 * * 1,3,5");
    expect(result?.frequency).toBe("weekly");
    expect(result?.weekdays).toEqual([1, 3, 5]);
  });

  it("CP-07b: '0 8 * * 1-5' → weekly, weekdays=[1,2,3,4,5]", () => {
    const result = cronToVisualConfig("0 8 * * 1-5");
    expect(result?.frequency).toBe("weekly");
    expect(result?.weekdays).toEqual([1, 2, 3, 4, 5]);
  });

  it("CP-08: '30 8 * * 0,6' → weekly, hour=8, minute=30, weekdays=[0,6]", () => {
    const result = cronToVisualConfig("30 8 * * 0,6");
    expect(result?.frequency).toBe("weekly");
    expect(result?.hour).toBe(8);
    expect(result?.minute).toBe(30);
    expect(result?.weekdays).toEqual([0, 6]);
  });

  it("CP-09: '0 9 1 * *' → monthly, dayOfMonth=1", () => {
    const result = cronToVisualConfig("0 9 1 * *");
    expect(result?.frequency).toBe("monthly");
    expect(result?.hour).toBe(9);
    expect(result?.minute).toBe(0);
    expect(result?.dayOfMonth).toBe(1);
  });

  it("CP-10: '59 23 31 * *' → monthly, dayOfMonth=31", () => {
    const result = cronToVisualConfig("59 23 31 * *");
    expect(result?.frequency).toBe("monthly");
    expect(result?.hour).toBe(23);
    expect(result?.minute).toBe(59);
    expect(result?.dayOfMonth).toBe(31);
  });

  it("CP-10B: '0 9 0 * *' → monthly, dayOfMonth=0（範囲外は UI 側でバリデーション）", () => {
    const result = cronToVisualConfig("0 9 0 * *");
    expect(result?.frequency).toBe("monthly");
    expect(result?.dayOfMonth).toBe(0);
  });

  it("CP-10C: '0 9 32 * *' → monthly, dayOfMonth=32（範囲外は UI 側でバリデーション）", () => {
    const result = cronToVisualConfig("0 9 32 * *");
    expect(result?.frequency).toBe("monthly");
    expect(result?.dayOfMonth).toBe(32);
  });

  it("CP-11: 無効な式（空文字）→ null", () => {
    expect(cronToVisualConfig("")).toBeNull();
  });

  it("CP-12: 無効な式（フィールド不足）→ null", () => {
    expect(cronToVisualConfig("0 9 *")).toBeNull();
  });

  it("CP-13: 複雑なパターン（分ステップ）→ custom フォールバック", () => {
    const result = cronToVisualConfig("0 */6 * * *");
    expect(result?.frequency).toBe("custom");
    expect(result?.rawCronExpression).toBe("0 */6 * * *");
  });

  it("CP-14: ステップ値 → custom フォールバック", () => {
    const result = cronToVisualConfig("*/15 * * * *");
    expect(result?.frequency).toBe("custom");
    expect(result?.rawCronExpression).toBe("*/15 * * * *");
  });

  it("CP-15: 複数フィールド複雑指定 → custom フォールバック", () => {
    const result = cronToVisualConfig("0 9-18 * * 1-5");
    expect(result?.frequency).toBe("custom");
    expect(result?.rawCronExpression).toBe("0 9-18 * * 1-5");
  });

  it("CP-16: weekdays が数値配列としてパースされること", () => {
    const result = cronToVisualConfig("0 0 * * 1,2,3");
    expect(result?.weekdays).toEqual([1, 2, 3]);
    expect(typeof result?.weekdays[0]).toBe("number");
  });

  it("CP-17: 日・月・曜日フィールドに * がある場合のみ daily と判定", () => {
    const result = cronToVisualConfig("0 9 * * *");
    expect(result?.frequency).toBe("daily");
  });

  it("CP-18: weekday range 1-5 は weekly に展開される", () => {
    const result = cronToVisualConfig("0 9 * * 1-5");
    expect(result?.frequency).toBe("weekly");
    expect(result?.weekdays).toEqual([1, 2, 3, 4, 5]);
  });
});
