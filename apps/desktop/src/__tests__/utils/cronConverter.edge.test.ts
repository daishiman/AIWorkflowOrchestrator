/**
 * @file cronConverter.edge.test.ts
 * @description cronConverter エッジケース追加テスト
 * @task TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001
 */

import { describe, it, expect } from "vitest";
import {
  visualConfigToCron,
  InvalidConfigError,
} from "../../renderer/utils/cronConverter";

describe("visualConfigToCron エッジケース", () => {
  it("weekly weekdays が空配列のとき InvalidConfigError をスローする", () => {
    // AC-1: weekdays が空なら InvalidConfigError をスロー（不正なcron式を生成しない）
    expect(() =>
      visualConfigToCron({
        frequency: "weekly",
        hour: 9,
        minute: 0,
        weekdays: [],
        dayOfMonth: 1,
      }),
    ).toThrow(InvalidConfigError);
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
  // TC-01: 空配列のとき InvalidConfigError をスロー
  it("TC-01: frequency='weekly' かつ weekdays=[] のとき InvalidConfigError をスローする", () => {
    expect(() =>
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [],
        hour: 9,
        minute: 0,
      }),
    ).toThrow(InvalidConfigError);
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
  // TC-07: 空曜日時は InvalidConfigError をスロー（TC-01の重複確認）
  it("TC-07: weekdays空かつweekly → InvalidConfigError をスローする", () => {
    expect(() =>
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [],
        hour: 9,
        minute: 0,
      }),
    ).toThrow(InvalidConfigError);
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
