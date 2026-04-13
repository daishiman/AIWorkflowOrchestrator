/**
 * @file cronConverter.edge.test.ts
 * @description cronConverter エッジケース追加テスト
 * @task TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001
 */

import { describe, it, expect } from "vitest";
import { visualConfigToCron } from "../../renderer/utils/cronConverter";

describe("visualConfigToCron エッジケース", () => {
  it("weekly weekdays が空配列のとき空文字を返す", () => {
    const result = visualConfigToCron({
      frequency: "weekly",
      hour: 9,
      minute: 0,
      weekdays: [],
      dayOfMonth: 1,
    });
    // AC-1: weekdays が空なら空文字を返す（不正なcron式を生成しない）
    expect(result).toBe("");
  });

  it("monthly dayOfMonth=1 のとき '0 9 1 * *'", () => {
    const result = visualConfigToCron({
      frequency: "monthly",
      hour: 9,
      minute: 0,
      weekdays: [],
      dayOfMonth: 1,
    });
    expect(result).toBe("0 9 1 * *");
  });

  it("every-hour minute=0 のとき '0 * * * *'", () => {
    const result = visualConfigToCron({
      frequency: "every-hour",
      hour: 0,
      minute: 0,
      weekdays: [],
      dayOfMonth: 1,
    });
    expect(result).toBe("0 * * * *");
  });

  it("custom rawCronExpression が空文字のとき空文字を返す", () => {
    const result = visualConfigToCron({
      frequency: "custom",
      hour: 0,
      minute: 0,
      weekdays: [],
      dayOfMonth: 1,
      rawCronExpression: "",
    });
    expect(result).toBe("");
  });
});

// TC-01〜TC-06: 空weekdaysガード処理テスト (Phase 4)
describe("visualConfigToCron - 空weekdaysガード処理", () => {
  // TC-01: 空配列のとき空文字を返す
  it("TC-01: frequency='weekly' かつ weekdays=[] のとき空文字を返す", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [],
        hour: 9,
        minute: 0,
      }),
    ).toBe("");
  });

  // TC-02: weekdays=[0]（日曜のみ）で正常なcron式が返る
  it("TC-02: weekdays=[0]（日曜のみ）で正常なcron式が返る", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [0],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 0");
  });

  // TC-03: weekdays=[1,3,5]（複数曜日）で正常なcron式が返る
  it("TC-03: weekdays=[1,3,5]（複数曜日）で正常なcron式が返る", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [1, 3, 5],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 1,3,5");
  });

  // TC-04: frequency="daily" のとき weekday 影響を受けない
  it("TC-04: frequency='daily' のとき weekday 影響を受けない", () => {
    expect(visualConfigToCron({ frequency: "daily", hour: 9, minute: 0 })).toBe(
      "0 9 * * *",
    );
  });

  // TC-05: frequency="every-hour" のとき weekday 影響を受けない
  it("TC-05: frequency='every-hour' のとき weekday 影響を受けない", () => {
    expect(visualConfigToCron({ frequency: "every-hour", minute: 30 })).toBe(
      "30 * * * *",
    );
  });
});

// TC-07〜TC-10: エッジケース拡充テスト (Phase 6)
describe("visualConfigToCron - テスト拡充", () => {
  // TC-07: 空曜日時は空文字を返す（TC-01の重複確認）
  it("TC-07: weekdays空かつweekly → 空文字を返す", () => {
    const result = visualConfigToCron({
      frequency: "weekly",
      weekdays: [],
      hour: 9,
      minute: 0,
    });
    expect(result).toBe("");
  });

  // TC-08: weekdays の順序と重複を正規化する
  it("TC-08: weekdays の順序と重複を正規化する", () => {
    const result = visualConfigToCron({
      frequency: "weekly",
      weekdays: [5, 1, 3, 3],
      hour: 9,
      minute: 0,
    });
    expect(result).toBe("0 9 * * 1,3,5");
  });

  // TC-09: every-hour 頻度では weekdays が無視されること
  it("TC-09: frequency=every-hour のとき weekdays は cron 式に反映されない", () => {
    const result = visualConfigToCron({
      frequency: "every-hour",
      weekdays: [1, 3, 5],
      minute: 0,
      hour: 8,
      dayOfMonth: 1,
    });
    expect(result).toBe("0 * * * *");
  });

  // TC-10: monthly 頻度では weekdays が無視されること
  it("TC-10: frequency=monthly のとき weekdays は cron 式に反映されない", () => {
    const result = visualConfigToCron({
      frequency: "monthly",
      weekdays: [1, 3, 5],
      hour: 8,
      minute: 0,
      dayOfMonth: 1,
    });
    expect(result).toBe("0 8 1 * *");
  });
});

// TC-11〜TC-15: monthly dayOfMonth ガード処理テスト (Phase 4)
describe("visualConfigToCron - monthly dayOfMonth ガード", () => {
  const baseConfig = {
    frequency: "monthly" as const,
    minute: 0,
    hour: 9,
    dayOfMonth: 1,
    weekdays: [] as [],
  };

  // TC-11: dayOfMonth=0 のとき空文字を返す (AC-1)
  it("TC-11: dayOfMonth=0 のとき空文字を返す (AC-1)", () => {
    const config = { ...baseConfig, dayOfMonth: 0 };
    expect(visualConfigToCron(config)).toBe("");
  });

  // TC-12: dayOfMonth=32 のとき空文字を返す (AC-2)
  it("TC-12: dayOfMonth=32 のとき空文字を返す (AC-2)", () => {
    const config = { ...baseConfig, dayOfMonth: 32 };
    expect(visualConfigToCron(config)).toBe("");
  });

  // TC-13: dayOfMonth=-1 のとき空文字を返す (AC-3)
  it("TC-13: dayOfMonth=-1 のとき空文字を返す (AC-3)", () => {
    const config = { ...baseConfig, dayOfMonth: -1 };
    expect(visualConfigToCron(config)).toBe("");
  });

  // TC-14: dayOfMonth=1 のとき正常なcron式を返す (AC-4)
  it("TC-14: dayOfMonth=1 のとき正常なcron式を返す (AC-4)", () => {
    const config = { ...baseConfig, dayOfMonth: 1 };
    expect(visualConfigToCron(config)).toBe("0 9 1 * *");
  });

  // TC-15: dayOfMonth=31 のとき正常なcron式を返す (AC-5)
  it("TC-15: dayOfMonth=31 のとき正常なcron式を返す (AC-5)", () => {
    const config = { ...baseConfig, dayOfMonth: 31 };
    expect(visualConfigToCron(config)).toBe("0 9 31 * *");
  });
});

// TC-16〜TC-19: monthly dayOfMonth エッジケース拡充テスト (Phase 6)
describe("visualConfigToCron - monthly dayOfMonth エッジケース拡充", () => {
  const baseConfig = {
    frequency: "monthly" as const,
    minute: 0,
    hour: 9,
    dayOfMonth: 1,
    weekdays: [] as [],
  };

  // TC-16: dayOfMonth=NaN のとき空文字を返す（非整数値チェック）
  it("TC-16: dayOfMonth=NaN のとき空文字を返す", () => {
    const config = { ...baseConfig, dayOfMonth: NaN };
    expect(visualConfigToCron(config)).toBe("");
  });

  // TC-17: dayOfMonth=15.5 のとき空文字を返す（小数値の拒否確認）
  it("TC-17: dayOfMonth=15.5 のとき空文字を返す", () => {
    const config = { ...baseConfig, dayOfMonth: 15.5 };
    expect(visualConfigToCron(config)).toBe("");
  });

  // TC-18: dayOfMonth=15（中間値）のとき正常なcron式を返す
  it("TC-18: dayOfMonth=15 のとき正常なcron式を返す（中間値確認）", () => {
    const config = { ...baseConfig, dayOfMonth: 15 };
    expect(visualConfigToCron(config)).toBe("0 9 15 * *");
  });

  // TC-19: dayOfMonth=0.5 のとき空文字を返す（小数値の拒否確認）
  it("TC-19: dayOfMonth=0.5 のとき空文字を返す", () => {
    const config = { ...baseConfig, dayOfMonth: 0.5 };
    expect(visualConfigToCron(config)).toBe("");
  });
});
