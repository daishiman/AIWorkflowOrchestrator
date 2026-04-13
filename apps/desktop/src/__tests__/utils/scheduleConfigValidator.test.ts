/**
 * @file scheduleConfigValidator.test.ts
 * @description scheduleConfigValidator ユニットテスト
 * @phase Phase 4: テスト作成
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001 / TASK-CRON-SEMANTIC-VALIDATION-001
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

  it("SCV-11: weekday指定がある式は意味論チェックをスキップする", () => {
    expect(validateCronExpression("0 9 31 2 1")).toBeNull();
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

describe("validateCronExpression - 意味論的バリデーション (TASK-CRON-SEMANTIC-VALIDATION-001)", () => {
  describe("存在しない日付の検出（AC-1〜AC-2）", () => {
    it("TC-SV-01: 2月31日はエラーを返す", () => {
      const result = validateCronExpression("0 9 31 2 *");
      expect(result).not.toBeNull();
      expect(result).toMatch(/[\u3040-\u9FFF]/);
    });

    it("TC-SV-02: 2月30日はエラーを返す", () => {
      const result = validateCronExpression("0 9 30 2 *");
      expect(result).not.toBeNull();
    });
  });

  describe("有効なcron式は正常通過（AC-3〜AC-4）", () => {
    it("TC-SV-03: 2月29日は正常通過する", () => {
      expect(validateCronExpression("0 9 29 2 *")).toBeNull();
    });

    it("TC-SV-04: 2月1日は正常通過する", () => {
      expect(validateCronExpression("0 9 1 2 *")).toBeNull();
    });

    it("TC-SV-05: 毎日9時は正常通過する", () => {
      expect(validateCronExpression("0 9 * * *")).toBeNull();
    });

    it("TC-SV-06: 平日毎日は正常通過する", () => {
      expect(validateCronExpression("0 9 * * 1-5")).toBeNull();
    });
  });

  describe("既存の構文チェック（回帰確認）", () => {
    it("TC-SV-07: 不正な構文はエラーを返す", () => {
      expect(validateCronExpression("invalid")).not.toBeNull();
    });
  });

  describe("エラーメッセージの確認（AC-5）", () => {
    it("存在しない日付のエラーメッセージは日本語を含む", () => {
      const result = validateCronExpression("0 9 31 2 *");
      expect(result).not.toBeNull();
      expect(result).toMatch(/[\u3040-\u9FFF]/);
    });
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

  it("SCV-13: 意味論エラーはcronExpressionに反映される", () => {
    const result = validateSkillWizardScheduleConfig({
      cronExpression: "0 9 31 2 *",
      timezone: "UTC",
    });
    expect(result.cronExpression).toBe(
      "指定した日付は存在しません（例: 2月31日）",
    );
    expect(result.timezone).toBeUndefined();
  });
});
