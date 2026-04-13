/**
 * @file cronConverter.test.ts
 * @description visualConfigToCron() のユニットテスト
 * @task TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001
 */

import { describe, expect, it } from "vitest";

import { InvalidConfigError, visualConfigToCron } from "../cronConverter";

// ---------------------------------------------------------------------------
// InvalidConfigError クラス自体のテスト
// ---------------------------------------------------------------------------

describe("InvalidConfigError", () => {
  it("name が 'InvalidConfigError' であること", () => {
    const err = new InvalidConfigError("test message");
    expect(err.name).toBe("InvalidConfigError");
  });

  it("Error のインスタンスであること", () => {
    const err = new InvalidConfigError("test message");
    expect(err).toBeInstanceOf(Error);
  });

  it("message が正しく設定されること", () => {
    const err = new InvalidConfigError("some message");
    expect(err.message).toBe("some message");
  });
});

// ---------------------------------------------------------------------------
// AC-01 / AC-05: weekdays=[] ガード処理
// ---------------------------------------------------------------------------

describe("visualConfigToCron - weekdays=[] ガード", () => {
  it("AC-01: frequency='weekly' かつ weekdays=[] の場合、InvalidConfigError をスローすること", () => {
    expect(() =>
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [],
        hour: 9,
        minute: 0,
      }),
    ).toThrow(InvalidConfigError);
  });

  it("AC-05: InvalidConfigError に適切なメッセージが含まれること", () => {
    expect(() =>
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [],
        hour: 9,
        minute: 0,
      }),
    ).toThrow("weekdays must not be empty when frequency is 'weekly'");
  });
});

// ---------------------------------------------------------------------------
// AC-02〜04: weekdays 正常系
// ---------------------------------------------------------------------------

describe("visualConfigToCron - weekdays 正常系", () => {
  it("AC-02: weekdays=[0] の場合、'0 9 * * 0' を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [0],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 0");
  });

  it("AC-03: weekdays=[1,2,3,4,5] の場合、'0 9 * * 1,2,3,4,5' を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [1, 2, 3, 4, 5],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 1,2,3,4,5");
  });

  it("AC-04: weekdays=[0,1,2,3,4,5,6] の場合、'0 9 * * 0,1,2,3,4,5,6' を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 0,1,2,3,4,5,6");
  });
});

// ---------------------------------------------------------------------------
// 回帰テスト: frequency !== "weekly"
// ---------------------------------------------------------------------------

describe("visualConfigToCron - 回帰テスト", () => {
  it("frequency='daily' の場合、weekdays が空でもエラーにならないこと", () => {
    expect(() =>
      visualConfigToCron({
        frequency: "daily",
        weekdays: [],
        hour: 9,
        minute: 0,
      }),
    ).not.toThrow();
  });

  it("frequency='every-minute' の場合、'* * * * *' を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "every-minute",
        weekdays: [],
        hour: 0,
        minute: 0,
      }),
    ).toBe("* * * * *");
  });

  it("frequency='every-hour' の場合、分フィールドのみ含む cron 式を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "every-hour",
        weekdays: [],
        hour: 0,
        minute: 30,
      }),
    ).toBe("30 * * * *");
  });

  it("frequency='monthly' の場合、dayOfMonth を含む cron 式を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "monthly",
        weekdays: [],
        hour: 9,
        minute: 0,
        dayOfMonth: 15,
      }),
    ).toBe("0 9 15 * *");
  });
});

// ---------------------------------------------------------------------------
// Phase 6 エッジケーステスト
// ---------------------------------------------------------------------------

describe("visualConfigToCron - weekdays エッジケース", () => {
  it("weekdays に重複値がある場合、正規化されて '0 9 * * 0' を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [0, 0],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 0");
  });

  it("weekdays=[6]（土曜のみ）の場合、'0 9 * * 6' を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [6],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 6");
  });

  it("weekdays が逆順の場合、ソートされた cron 式を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [5, 3, 1],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 1,3,5");
  });

  it("InvalidConfigError は InvalidConfigError のインスタンスであること", () => {
    let caught: unknown;
    try {
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [],
        hour: 9,
        minute: 0,
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(InvalidConfigError);
    expect(caught).toBeInstanceOf(Error);
  });
});
