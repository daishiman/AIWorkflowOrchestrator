/**
 * @file wizard-exports.test.ts
 * @description wizard/index.ts エクスポート確認テスト
 * @task UT-SKILL-WIZARD-W2-seq-03b
 * @phase Phase 4-6: テスト作成・拡充
 *
 * 検証対象:
 * - 削除エクスポート: DescribeStep, ConfigureStep が存在しないこと
 * - 追加エクスポート: SkillInfoStep, ConversationRoundStep が存在すること
 * - 維持エクスポート: StepIndicator, GenerateStep, CompleteStep が存在すること
 * - バレル整合: エクスポート数・型確認
 */

import { describe, it, expect, expectTypeOf } from "vitest";
import * as wizardIndex from "../wizard/index";
import type { SkillInfoStepProps } from "../wizard";
import type { SkillInfoFormData } from "@repo/shared/types/skillCreator";

describe("wizard/index.ts 削除エクスポート確認", () => {
  it("DescribeStep がエクスポートされていないこと", () => {
    expect(
      (wizardIndex as Record<string, unknown>)["DescribeStep"],
    ).toBeUndefined();
  });

  it("ConfigureStep がエクスポートされていないこと", () => {
    expect(
      (wizardIndex as Record<string, unknown>)["ConfigureStep"],
    ).toBeUndefined();
  });

  it("WizardOptions がエクスポートされていないこと", () => {
    expect(
      (wizardIndex as Record<string, unknown>)["WizardOptions"],
    ).toBeUndefined();
  });
});

describe("wizard/index.ts 追加エクスポート確認", () => {
  it("SkillInfoStep がエクスポートされていること", () => {
    expect(wizardIndex.SkillInfoStep).toBeDefined();
    expect(typeof wizardIndex.SkillInfoStep).toBe("function");
  });

  it("ConversationRoundStep がエクスポートされていること", () => {
    expect(wizardIndex.ConversationRoundStep).toBeDefined();
    expect(typeof wizardIndex.ConversationRoundStep).toBe("function");
  });
});

describe("wizard/index.ts 維持エクスポート確認（回帰テスト）", () => {
  it("StepIndicator が引き続きエクスポートされていること", () => {
    expect(wizardIndex.StepIndicator).toBeDefined();
  });

  it("GenerateStep が引き続きエクスポートされていること", () => {
    expect(wizardIndex.GenerateStep).toBeDefined();
  });

  it("CompleteStep が引き続きエクスポートされていること", () => {
    expect(wizardIndex.CompleteStep).toBeDefined();
    expect(typeof wizardIndex.CompleteStep).toBe("function");
  });

  it("InterviewProgressBar が引き続きエクスポートされていること", () => {
    expect(wizardIndex.InterviewProgressBar).toBeDefined();
  });

  it("ApplySummaryCard が引き続きエクスポートされていること", () => {
    expect(wizardIndex.ApplySummaryCard).toBeDefined();
  });
});

describe("wizard/index.ts バレルエクスポート整合確認", () => {
  it("全コンポーネントエクスポートが defined であること", () => {
    const componentKeys = [
      "StepIndicator",
      "SkillInfoStep",
      "ConversationRoundStep",
      "InterviewProgressBar",
      "ApplySummaryCard",
      "GenerateStep",
      "CompleteStep",
    ] as const;
    for (const key of componentKeys) {
      expect(wizardIndex[key], `${key} should be defined`).toBeDefined();
    }
  });

  it("GenerationMode が barrel から公開されていないこと", () => {
    expect(
      (wizardIndex as Record<string, unknown>)["GenerationMode"],
    ).toBeUndefined();
  });

  it("SkillInfoStepProps が barrel から期待どおりの型で参照できること", () => {
    expectTypeOf<
      SkillInfoStepProps["formData"]
    >().toEqualTypeOf<SkillInfoFormData>();
    expectTypeOf<SkillInfoStepProps["onNext"]>().toEqualTypeOf<() => void>();
  });
});
