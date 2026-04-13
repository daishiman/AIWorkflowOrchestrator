/**
 * @file scheduleConfigValidator.edge.test.ts
 * @description scheduleConfigValidator エッジケース追加テスト
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001 / TASK-CRON-SEMANTIC-VALIDATION-001
 */

import { describe, it, expect } from "vitest";
import {
  validateCronExpression,
  validateTimezone,
} from "../../renderer/utils/scheduleConfigValidator";

describe("validateCronExpression エッジケース", () => {
  it("ステップ値 */15 は有効", () => {
    expect(validateCronExpression("*/15 * * * *")).toBeNull();
  });

  it("範囲指定 1-5 は有効", () => {
    expect(validateCronExpression("0 9 * * 1-5")).toBeNull();
  });

  it("カンマ区切り 1,3,5 は有効", () => {
    expect(validateCronExpression("0 9 * * 1,3,5")).toBeNull();
  });

  it("時フィールドが 24 以上はエラー", () => {
    expect(validateCronExpression("0 24 * * *")).not.toBeNull();
  });

  it("分フィールドが 60 以上はエラー", () => {
    expect(validateCronExpression("60 9 * * *")).not.toBeNull();
  });

  it("タブ区切りフィールドでも正しく検証", () => {
    expect(validateCronExpression("0\t9\t*\t*\t*")).toBeNull();
  });
});

describe("validateCronExpression - 月末日エッジケース (TC-EDGE)", () => {
  it("TC-EDGE-01: 1月32日は存在しない", () => {
    expect(validateCronExpression("0 9 32 1 *")).not.toBeNull();
  });

  it("TC-EDGE-02: 4月31日は存在しない（4月は30日まで）", () => {
    expect(validateCronExpression("0 9 31 4 *")).not.toBeNull();
  });

  it("TC-EDGE-03: 6月31日は存在しない", () => {
    expect(validateCronExpression("0 9 31 6 *")).not.toBeNull();
  });

  it("TC-EDGE-04: 9月31日は存在しない", () => {
    expect(validateCronExpression("0 9 31 9 *")).not.toBeNull();
  });

  it("TC-EDGE-05: 11月31日は存在しない", () => {
    expect(validateCronExpression("0 9 31 11 *")).not.toBeNull();
  });

  it("TC-EDGE-06: 1月31日は有効", () => {
    expect(validateCronExpression("0 9 31 1 *")).toBeNull();
  });

  it("TC-EDGE-07: 4月30日は有効", () => {
    expect(validateCronExpression("0 9 30 4 *")).toBeNull();
  });

  it("TC-EDGE-08: 3月31日は有効", () => {
    expect(validateCronExpression("0 9 31 3 *")).toBeNull();
  });
});

describe("validateCronExpression - 2月特殊ケース (TC-LEAP)", () => {
  it("TC-LEAP-01: 2月29日は有効（閏年考慮）", () => {
    expect(validateCronExpression("0 9 29 2 *")).toBeNull();
  });

  it("TC-LEAP-02: 2月30日は存在しない", () => {
    expect(validateCronExpression("0 9 30 2 *")).not.toBeNull();
  });

  it("TC-LEAP-03: 2月31日は存在しない", () => {
    expect(validateCronExpression("0 9 31 2 *")).not.toBeNull();
  });
});

describe("validateCronExpression - 複合フィールド (TC-COMP)", () => {
  it("TC-COMP-01: カンマ区切りの日指定は有効", () => {
    expect(validateCronExpression("0 9 1,15 * *")).toBeNull();
  });

  it("TC-COMP-02: 範囲指定の日指定は有効", () => {
    expect(validateCronExpression("0 9 1-15 * *")).toBeNull();
  });

  it("TC-COMP-03: ステップ指定の日指定は有効", () => {
    expect(validateCronExpression("0 9 */5 * *")).toBeNull();
  });

  it("TC-COMP-04: カンマ区切り日 + 月指定は有効", () => {
    expect(validateCronExpression("0 9 1,15 2 *")).toBeNull();
  });
});

describe("validateCronExpression - 値域チェック回帰 (TC-REG)", () => {
  it("TC-REG-01: 分フィールドが60はエラー", () => {
    expect(validateCronExpression("60 9 * * *")).not.toBeNull();
  });

  it("TC-REG-02: 時フィールドが24はエラー", () => {
    expect(validateCronExpression("0 24 * * *")).not.toBeNull();
  });

  it("TC-REG-03: 日フィールドが0はエラー（1〜31）", () => {
    expect(validateCronExpression("0 9 0 * *")).not.toBeNull();
  });

  it("TC-REG-04: 月フィールドが13はエラー", () => {
    expect(validateCronExpression("0 9 * 13 *")).not.toBeNull();
  });

  it("TC-REG-05: 曜日フィールドが8はエラー（0〜7）", () => {
    expect(validateCronExpression("0 9 * * 8")).not.toBeNull();
  });

  it("TC-REG-06: 全ワイルドカードは有効", () => {
    expect(validateCronExpression("* * * * *")).toBeNull();
  });
});

describe("validateTimezone エッジケース", () => {
  it("Europe/London は有効", () => {
    expect(validateTimezone("Europe/London")).toBeNull();
  });

  it("Asia/Singapore は有効", () => {
    expect(validateTimezone("Asia/Singapore")).toBeNull();
  });

  it("空白のみはエラー", () => {
    expect(validateTimezone("   ")).not.toBeNull();
  });
});
