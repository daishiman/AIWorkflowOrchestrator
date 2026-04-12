/**
 * @file scheduleConfigValidator.edge.test.ts
 * @description scheduleConfigValidator エッジケース追加テスト（Phase 6）
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
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
