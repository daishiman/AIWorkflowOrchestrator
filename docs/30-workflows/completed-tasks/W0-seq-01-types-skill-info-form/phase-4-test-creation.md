# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 4                              |
| タスクID   | UT-SKILL-WIZARD-W0-seq-01      |
| 機能名     | スキルウィザード共有型定義追加 |
| 前提Phase  | Phase 3                        |
| 後続Phase  | Phase 5                        |
| 作成日     | 2026-04-07                     |
| ステータス | pending                        |

## 目的

型定義の正確性を検証するテストを、実装前に作成する（TDD）。コンパイル時の型安全性で shape を固定し、後続 wave が迷わないようにする。

## 実行タスク

- [ ] テストファイルの作成場所を決定する
- [ ] `SkillInfoFormData` の型テストを作成する
- [ ] `SkillCategory` の union テストを作成する
- [ ] `SkillWizardScheduleConfig` の型テストを作成する
- [ ] `QuestionAnswer` の型テストを作成する
- [ ] `ConversationAnswers` の型テストを作成する
- [ ] `SmartDefaultResult` の型テストを作成する
- [ ] `SkeletonQualityFeedback` の型テストを作成する

## 参照資料

| 資料名       | パス                                   | 説明               |
| ------------ | -------------------------------------- | ------------------ |
| 設計書       | `phase-2-design.md`                    | テスト対象の型定義 |
| 既存テスト例 | `packages/shared/src/types/__tests__/` | テストパターン参照 |

## 実行手順

### Step 1: テストファイルの作成場所

```text
packages/shared/src/types/__tests__/skillCreator-wizard.test.ts
```

既存テストディレクトリに配置する。ファイルが存在しない場合は新規作成する。

### Step 2: テストファイルの内容

```typescript
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
      selectedOption: "定期実行",
      freeText: "",
      scheduleConfig: {
        cronExpression: "0 9 * * 1-5",
        timezone: "Asia/Tokyo",
      },
    };
    expectTypeOf(answer).toMatchTypeOf<QuestionAnswer>();
  });

  it("selectedOption が string | null 型である", () => {
    expectTypeOf<QuestionAnswer["selectedOption"]>().toEqualTypeOf<
      string | null
    >();
  });
});

describe("ConversationAnswers", () => {
  it("6問分の回答を保持できる", () => {
    const answers: ConversationAnswers = {
      q1: { selectedOption: "自分のみ", freeText: "" },
      q2: { selectedOption: "テキスト", freeText: "" },
      q3: {
        selectedOption: "定期実行",
        freeText: "",
        scheduleConfig: {
          cronExpression: "0 9 * * 1-5",
          timezone: "Asia/Tokyo",
        },
      },
      q4: { selectedOption: "通知", freeText: "" },
      q5: { selectedOption: "Slack", freeText: "" },
      q6: { selectedOption: "Markdown", freeText: "" },
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
```

### Step 3: テスト実行コマンド

```bash
# Phase 5 実装後にテストが通ることを確認
pnpm --filter @repo/shared test packages/shared/src/types/__tests__/skillCreator-wizard.test.ts

# 型チェックのみ確認したい場合
pnpm --filter @repo/shared typecheck
```

## 成果物

- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`: 型テストファイル（新規作成）

## 完了条件

- [ ] テストファイルが作成されている
- [ ] 全 7 型のテストケースが記述されている
- [ ] 必須フィールド・オプションフィールドの両方がテストされている
- [ ] union 型（`SkillCategory`, `generationMethod`）の制約がテストされている
- [ ] Phase 5 実装前の時点では型インポートエラーが発生する（TDD として正常）
