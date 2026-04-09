/**
 * UT-SKILL-WIZARD-W0-seq-01: スキルウィザード共有型定義テスト
 *
 * TypeScript の型チェックによる型制約検証。
 * 実行時テストではなく、コンパイル時の型安全性を確認する。
 */
import { describe, it, expectTypeOf } from "vitest";
import type {
  ConversationAnswers,
  QuestionAnswer,
  SkillCategory,
  SkillInfoFormData,
  SkillWizardScheduleConfig,
  SkeletonQualityFeedback,
  SmartDefaultResult,
} from "../skillCreator";

describe("SkillInfoFormData", () => {
  it("最小構成で構築できる", () => {
    const data: SkillInfoFormData = {
      purpose: "Slack通知を整理する",
      category: null,
    };
    expectTypeOf(data).toMatchTypeOf<SkillInfoFormData>();
  });

  it("カテゴリを含む構成で構築できる", () => {
    const data: SkillInfoFormData = {
      skillName: "slack-notifier",
      purpose: "Slack通知を整理する",
      category: "automation",
    };
    expectTypeOf(data).toMatchTypeOf<SkillInfoFormData>();
  });

  it("category が SkillCategory | null 型である", () => {
    expectTypeOf<
      SkillInfoFormData["category"]
    >().toEqualTypeOf<SkillCategory | null>();
  });

  it("skillName は string | undefined 型である", () => {
    expectTypeOf<SkillInfoFormData["skillName"]>().toEqualTypeOf<
      string | undefined
    >();
  });
});

describe("SkillCategory", () => {
  it("有効なカテゴリ値を受け入れる", () => {
    const categories: SkillCategory[] = [
      "automation",
      "external-integration",
      "data-analysis",
      "code-support",
      "other",
    ];
    expectTypeOf(categories).toMatchTypeOf<SkillCategory[]>();
  });
});

describe("SkillWizardScheduleConfig", () => {
  it("cronExpression と timezone だけで構築できる", () => {
    const config: SkillWizardScheduleConfig = {
      cronExpression: "0 9 * * 1-5",
      timezone: "Asia/Tokyo",
    };
    expectTypeOf(config).toMatchTypeOf<SkillWizardScheduleConfig>();
  });

  it("cronExpression が string 型である", () => {
    expectTypeOf<SkillWizardScheduleConfig["cronExpression"]>().toBeString();
  });
});

describe("QuestionAnswer", () => {
  it("Q3 用の scheduleConfig を含められる", () => {
    const answer: QuestionAnswer = {
      selectedOptions: ["定期実行"],
      freeText: "",
      scheduleConfig: {
        cronExpression: "0 9 * * 1-5",
        timezone: "Asia/Tokyo",
      },
    };
    expectTypeOf(answer).toMatchTypeOf<QuestionAnswer>();
  });

  it("selectedOptions が string[] 型である", () => {
    expectTypeOf<QuestionAnswer["selectedOptions"]>().toEqualTypeOf<string[]>();
  });

  it("selectedOption プロパティは型定義に存在しない", () => {
    type HasSelectedOption = "selectedOption" extends keyof QuestionAnswer
      ? true
      : false;
    expectTypeOf<HasSelectedOption>().toEqualTypeOf<false>();
  });
});

describe("ConversationAnswers", () => {
  it("6問分の回答を保持できる", () => {
    const answers: ConversationAnswers = {
      q1: { selectedOptions: ["自分のみ"], freeText: "" },
      q2: { selectedOptions: ["テキスト"], freeText: "" },
      q3: {
        selectedOptions: ["定期実行"],
        freeText: "",
        scheduleConfig: {
          cronExpression: "0 9 * * 1-5",
          timezone: "Asia/Tokyo",
        },
      },
      q4: { selectedOptions: ["通知"], freeText: "" },
      q5: { selectedOptions: ["Slack"], freeText: "" },
      q6: { selectedOptions: ["Markdown"], freeText: "" },
    };
    expectTypeOf(answers).toMatchTypeOf<ConversationAnswers>();
  });

  it("q3 が QuestionAnswer 型である", () => {
    expectTypeOf<ConversationAnswers["q3"]>().toEqualTypeOf<QuestionAnswer>();
  });
});

describe("SmartDefaultResult", () => {
  it("semantic key で初期値を保持できる", () => {
    const defaults: SmartDefaultResult = {
      who: "自分のみ",
      input: "テキスト",
      timing: null,
      output: null,
      tool: null,
      format: "Markdown",
      inferenceLog: ["purpose に Slack を含むため who を推論"],
    };
    expectTypeOf(defaults).toMatchTypeOf<SmartDefaultResult>();
  });

  it("who が string | null 型である", () => {
    expectTypeOf<SmartDefaultResult["who"]>().toEqualTypeOf<string | null>();
  });
});

describe("SkeletonQualityFeedback", () => {
  it("complete と skip の両方を表現できる", () => {
    const complete: SkeletonQualityFeedback = {
      satisfied: true,
      generationMethod: "complete",
      timestamp: Date.now(),
    };
    const skip: SkeletonQualityFeedback = {
      satisfied: false,
      generationMethod: "skip",
      timestamp: Date.now(),
    };
    expectTypeOf(complete).toMatchTypeOf<SkeletonQualityFeedback>();
    expectTypeOf(skip).toMatchTypeOf<SkeletonQualityFeedback>();
  });

  it("generationMethod が正しい union 型である", () => {
    expectTypeOf<SkeletonQualityFeedback["generationMethod"]>().toEqualTypeOf<
      "complete" | "skip"
    >();
  });
});
