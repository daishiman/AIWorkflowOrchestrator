/**
 * @file scheduleConfigValidator.edge.test.ts
 * @description scheduleConfigValidator エッジケース追加テスト（Phase 6 + TASK-UI-SCHEDULE-CRON-SEMANTIC-001）
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001, TASK-UI-SCHEDULE-CRON-SEMANTIC-001
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

// TASK-UI-SCHEDULE-CRON-SEMANTIC-001: semantic validation TDD Red フェーズ (TC-01〜TC-08)
const validateCronExpressionSemantic = validateCronExpression as (
  value: string,
  options?: { semantic?: boolean },
) => string | null;

describe("validateCronExpression - semantic validation (TDD Red Phase)", () => {
  // TC-01: 2月31日は存在しない（AC-1）
  it("TC-01: semantic=true で 0 0 31 2 * はエラーを返す", () => {
    const result = validateCronExpressionSemantic("0 0 31 2 *", {
      semantic: true,
    });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-02: うるう年の未来到達は有効
  it("TC-02: semantic=true で 0 0 29 2 * は null を返す", () => {
    const result = validateCronExpressionSemantic("0 0 29 2 *", {
      semantic: true,
    });
    expect(result).toBeNull();
  });

  // TC-03: 30日は多数の月に存在する
  it("TC-03: semantic=true で 0 0 30 * * は null を返す（PASS）", () => {
    const result = validateCronExpressionSemantic("0 0 30 * *", {
      semantic: true,
    });
    expect(result).toBeNull();
  });

  // TC-04: 毎日実行（AC-2）
  it("TC-04: semantic=true で 0 0 * * * は null を返す（PASS）", () => {
    const result = validateCronExpressionSemantic("0 0 * * *", {
      semantic: true,
    });
    expect(result).toBeNull();
  });

  // TC-05: semantic=false は後方互換（意味論チェックをスキップ）
  it("TC-05: semantic=false で 0 0 31 2 * は null を返す（後方互換）", () => {
    const result = validateCronExpressionSemantic("0 0 31 2 *", {
      semantic: false,
    });
    expect(result).toBeNull();
  });

  // TC-06: options 未指定はデフォルトで semantic 無効
  it("TC-06: options 未指定で 0 0 31 2 * は null を返す（後方互換）", () => {
    const result = validateCronExpressionSemantic("0 0 31 2 *");
    expect(result).toBeNull();
  });

  // TC-07: 1,3,5,7,8,10,12月は31日がある
  it("TC-07: semantic=true で 0 0 31 1,3,5,7,8,10,12 * は null を返す（PASS）", () => {
    const result = validateCronExpressionSemantic("0 0 31 1,3,5,7,8,10,12 *", {
      semantic: true,
    });
    expect(result).toBeNull();
  });

  // TC-08: cron-parser は OR semantics を実装しないため、2月31日は曜日指定があっても拒否される
  // ※ Unix cron の OR semantics（day-of-month と day-of-week の非ワイルドカード指定でどちらかが一致すれば実行）は
  //    cron-parser では未サポート。より安全側の判定（AND semantics）を採用。
  it("TC-08: semantic=true で 0 0 31 2 1 はエラーを返す（cron-parser AND semantics）", () => {
    const result = validateCronExpressionSemantic("0 0 31 2 1", {
      semantic: true,
    });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });
});

// TASK-UI-SCHEDULE-CRON-SEMANTIC-001: semantic validation edge cases (Phase 6) TC-09〜TC-16
describe("validateCronExpression - semantic validation edge cases (Phase 6)", () => {
  // TC-09: 2月30日も存在しない
  it("TC-09: semantic=true で 0 0 30 2 * はエラーを返す", () => {
    const result = validateCronExpression("0 0 30 2 *", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-10: 4月31日は存在しない（4月は30日まで）
  it("TC-10: semantic=true で 0 0 31 4 * はエラーを返す", () => {
    const result = validateCronExpression("0 0 31 4 *", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-11: 6月31日は存在しない
  it("TC-11: semantic=true で 0 0 31 6 * はエラーを返す", () => {
    const result = validateCronExpression("0 0 31 6 *", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-12: 9月31日は存在しない
  it("TC-12: semantic=true で 0 0 31 9 * はエラーを返す", () => {
    const result = validateCronExpression("0 0 31 9 *", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-13: 11月31日は存在しない
  it("TC-13: semantic=true で 0 0 31 11 * はエラーを返す", () => {
    const result = validateCronExpression("0 0 31 11 *", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-14: semantic=false は後方互換
  it("TC-14: semantic=false で 0 0 31 4 * は null を返す（後方互換）", () => {
    const result = validateCronExpression("0 0 31 4 *", { semantic: false });
    expect(result).toBeNull();
  });

  // TC-15: 空文字は semantic チェック前に構文エラーで reject される
  it("TC-15: semantic=true で空文字はエラーを返す", () => {
    const result = validateCronExpression("", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  // TC-16: cron-parser は OR semantics 未サポートのため、2月31日は曜日範囲指定があっても拒否される
  it("TC-16: semantic=true で 0 0 31 2 1-5 はエラーを返す（AND semantics）", () => {
    const result = validateCronExpression("0 0 31 2 1-5", { semantic: true });
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });
});
