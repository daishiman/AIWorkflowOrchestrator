/**
 * @file scheduleConfigValidator.test.ts
 * @description scheduleConfigValidator ユニットテスト（TDD Red フェーズ）
 * @phase Phase 4: テスト作成
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import { describe, it, expect } from "vitest";
import {
  validateCronExpression,
  validateTimezone,
  validateSkillWizardScheduleConfig,
} from "../../renderer/utils/scheduleConfigValidator";

describe("validateCronExpression", () => {
  it("SCV-01: 5フィールドの有効なcron式はnullを返す", () => {
    expect(validateCronExpression("0 9 * * *")).toBeNull();
  });

  it("SCV-02: 空文字はエラーメッセージを返す", () => {
    expect(validateCronExpression("")).not.toBeNull();
  });

  it("SCV-03: 4フィールドはエラーメッセージを返す", () => {
    expect(validateCronExpression("0 9 * *")).not.toBeNull();
  });

  it("SCV-04: 6フィールドはエラーメッセージを返す", () => {
    expect(validateCronExpression("0 9 * * * *")).not.toBeNull();
  });

  it("SCV-10: 前後の空白はtrimして判定される", () => {
    expect(validateCronExpression(" 0 9 * * * ")).toBeNull();
  });

  it("SCV-11: semantic validationは行わない（月次指定はnull）", () => {
    expect(validateCronExpression("0 9 1 * *")).toBeNull();
  });

  it("ワイルドカードのみは有効", () => {
    expect(validateCronExpression("* * * * *")).toBeNull();
  });

  it("複雑なステップ値も構文的に有効", () => {
    expect(validateCronExpression("*/15 * * * *")).toBeNull();
  });
});

describe("validateTimezone", () => {
  it("SCV-05: Asia/Tokyo はnullを返す", () => {
    expect(validateTimezone("Asia/Tokyo")).toBeNull();
  });

  it("SCV-05: UTC はnullを返す", () => {
    expect(validateTimezone("UTC")).toBeNull();
  });

  it("SCV-06: 未知の文字列はエラーを返す", () => {
    expect(validateTimezone("Mars/Phobos")).not.toBeNull();
  });

  it("空文字はエラーを返す", () => {
    expect(validateTimezone("")).not.toBeNull();
  });

  it("America/New_York は有効", () => {
    expect(validateTimezone("America/New_York")).toBeNull();
  });
});

describe("validateSkillWizardScheduleConfig", () => {
  it("SCV-07: cronもtimezoneも有効ならエラーなし", () => {
    const result = validateSkillWizardScheduleConfig({
      cronExpression: "0 9 * * *",
      timezone: "UTC",
    });
    expect(result.cronExpression).toBeUndefined();
    expect(result.timezone).toBeUndefined();
  });

  it("SCV-08: cron だけ無効ならcronのみエラー", () => {
    const result = validateSkillWizardScheduleConfig({
      cronExpression: "bad",
      timezone: "UTC",
    });
    expect(result.cronExpression).toBeDefined();
    expect(result.timezone).toBeUndefined();
  });

  it("SCV-09: timezone だけ無効ならtimezoneのみエラー", () => {
    const result = validateSkillWizardScheduleConfig({
      cronExpression: "0 9 * * *",
      timezone: "bad",
    });
    expect(result.cronExpression).toBeUndefined();
    expect(result.timezone).toBeDefined();
  });

  it("SCV-12: 両方無効なら両方エラー", () => {
    const result = validateSkillWizardScheduleConfig({
      cronExpression: "bad",
      timezone: "bad",
    });
    expect(result.cronExpression).toBeDefined();
    expect(result.timezone).toBeDefined();
  });
});
