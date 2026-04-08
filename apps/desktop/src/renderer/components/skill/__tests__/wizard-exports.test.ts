/**
 * @file wizard-exports.test.ts
 * @description wizard/index.ts エクスポート契約の検証テスト
 * @task UT-SKILL-WIZARD-W2-seq-03b
 *
 * 削除エクスポート: DescribeStep, ConfigureStep, WizardOptions
 * 追加エクスポート: SkillInfoStepProps, ConversationRoundStepProps
 * 維持エクスポート: SkillInfoStep, ConversationRoundStep,
 *                   StepIndicator, stepStateStyles, GenerateStep, CompleteStep,
 *                   InterviewProgressBar, ApplySummaryCard 他
 */

import * as wizardIndex from "../wizard/index";

// ─── 削除エクスポートの非存在確認 ─────────────────────────────────────────────

describe("wizard/index.ts 削除エクスポート確認", () => {
  it("DescribeStep がエクスポートされていないこと", () => {
    expect(
      (wizardIndex as Record<string, unknown>).DescribeStep,
    ).toBeUndefined();
  });

  it("ConfigureStep がエクスポートされていないこと", () => {
    expect(
      (wizardIndex as Record<string, unknown>).ConfigureStep,
    ).toBeUndefined();
  });

  it("WizardOptions がエクスポートされていないこと", () => {
    expect(
      (wizardIndex as Record<string, unknown>).WizardOptions,
    ).toBeUndefined();
  });
});

// ─── 追加エクスポートの存在確認 ──────────────────────────────────────────────

describe("wizard/index.ts 維持・追加エクスポート確認", () => {
  it("SkillInfoStep がエクスポートされていること", () => {
    expect(wizardIndex.SkillInfoStep).toBeDefined();
    expect(typeof wizardIndex.SkillInfoStep).toBe("function");
  });

  it("ConversationRoundStep がエクスポートされていること", () => {
    expect(wizardIndex.ConversationRoundStep).toBeDefined();
    expect(typeof wizardIndex.ConversationRoundStep).toBe("function");
  });
});

// ─── 維持エクスポートの存在確認（回帰） ──────────────────────────────────────

describe("wizard/index.ts 維持エクスポート確認", () => {
  it("StepIndicator が引き続きエクスポートされていること", () => {
    expect(wizardIndex.StepIndicator).toBeDefined();
  });

  it("stepStateStyles が引き続きエクスポートされていること", () => {
    expect(wizardIndex.stepStateStyles).toBeDefined();
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

// ─── 型エクスポートの確認（コンパイル時チェック） ──────────────────────────

describe("wizard/index.ts 型エクスポート確認", () => {
  it("SkillInfoStepProps 型がエクスポートされていること（コンパイル成功が証明）", () => {
    // このファイルが型エラーなしでコンパイルされることが確認
    // import type { SkillInfoStepProps } from "../wizard/index" が有効
    type TestType = import("../wizard/index").SkillInfoStepProps;
    const check: TestType = {
      formData: { skillName: "", purpose: "", category: null },
      onFormDataChange: () => {},
      onNext: () => {},
    };
    expect(check).toBeDefined();
  });

  it("ConversationRoundStepProps 型がエクスポートされていること", () => {
    type TestType = import("../wizard/index").ConversationRoundStepProps;
    const check: TestType = {
      formData: { skillName: "", purpose: "", category: null },
      smartDefaults: {
        who: null,
        input: null,
        timing: null,
        output: null,
        tool: null,
        format: null,
      },
      answers: {
        q1: { selectedOption: null, freeText: "" },
        q2: { selectedOption: null, freeText: "" },
        q3: { selectedOption: null, freeText: "", scheduleConfig: undefined },
        q4: { selectedOption: null, freeText: "" },
        q5: { selectedOption: null, freeText: "" },
        q6: { selectedOption: null, freeText: "" },
      },
      onAnswersChange: () => {},
      onBack: () => {},
      onGenerate: () => {},
    };
    expect(check).toBeDefined();
  });
});
