# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 6                              |
| タスクID   | UT-SKILL-WIZARD-W0-seq-01      |
| 機能名     | スキルウィザード共有型定義追加 |
| 前提Phase  | Phase 5                        |
| 後続Phase  | Phase 7                        |
| 作成日     | 2026-04-07                     |
| ステータス | pending                        |

## 目的

Phase 4 で作成した基本テストに加え、境界値・エッジケース・相互参照のテストを追加して型の堅牢性を高める。

## 実行タスク

- [ ] `SkillInfoFormData` の空文字・null 組み合わせテストを追加する
- [ ] `QuestionAnswer` の `scheduleConfig` 省略テストを追加する
- [ ] `ConversationAnswers` の Q3 スケジュール有りテストを追加する
- [ ] `SmartDefaultResult` の `inferenceLog` 任意性テストを追加する
- [ ] `SkeletonQualityFeedback` の `complete` / `skip` 両方を追加する

## 参照資料

| 資料名     | パス                                                              | 説明                     |
| ---------- | ----------------------------------------------------------------- | ------------------------ |
| 基本テスト | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | 拡充対象のテストファイル |
| 設計書     | `phase-2-design.md`                                               | 型の仕様確認             |

## 実行手順

### Step 1: 型ガードとエッジケースの追加

```typescript
describe("SkillInfoFormData エッジケース", () => {
  it("skillName は空文字を許容する", () => {
    const data: SkillInfoFormData = {
      skillName: "",
      purpose: "Slack 通知を整理する",
      category: "automation",
    };
    expectTypeOf(data).toMatchTypeOf<SkillInfoFormData>();
  });

  it("category は null を許容する", () => {
    const data: SkillInfoFormData = {
      skillName: "slack-notifier",
      purpose: "Slack 通知を整理する",
      category: null,
    };
    expectTypeOf(data).toMatchTypeOf<SkillInfoFormData>();
  });
});
```

### Step 2: `QuestionAnswer` のエッジケース追加

```typescript
describe("QuestionAnswer エッジケース", () => {
  it("scheduleConfig を省略できる", () => {
    const answer: QuestionAnswer = {
      selectedOption: "自分のみ",
      freeText: "",
    };
    expectTypeOf(answer).toMatchTypeOf<QuestionAnswer>();
  });
});
```

### Step 3: 相互参照テストの追加

```typescript
describe("ConversationAnswers と SkillWizardScheduleConfig の相互参照", () => {
  it("q3.scheduleConfig が SkillWizardScheduleConfig 型である", () => {
    expectTypeOf<
      NonNullable<ConversationAnswers["q3"]["scheduleConfig"]>
    >().toEqualTypeOf<SkillWizardScheduleConfig>();
  });

  it("Q3 に scheduleConfig を含めた ConversationAnswers を構築できる", () => {
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
});
```

### Step 4: `SmartDefaultResult` の任意性テスト

```typescript
describe("SmartDefaultResult", () => {
  it("inferenceLog は任意である", () => {
    const defaults: SmartDefaultResult = {
      who: "自分のみ",
      input: "テキスト",
      timing: null,
      output: null,
      tool: null,
      format: "Markdown",
    };
    expectTypeOf(defaults).toMatchTypeOf<SmartDefaultResult>();
  });
});
```

### Step 5: `SkeletonQualityFeedback` の追加ケース

```typescript
describe("SkeletonQualityFeedback エッジケース", () => {
  it("generationMethod が skip の場合を受け入れる", () => {
    const feedback: SkeletonQualityFeedback = {
      satisfied: false,
      generationMethod: "skip",
      timestamp: 0,
    };
    expectTypeOf(feedback).toMatchTypeOf<SkeletonQualityFeedback>();
  });
});
```

### Step 6: テスト実行

```bash
pnpm --filter @repo/shared test packages/shared/src/types/__tests__/skillCreator-wizard.test.ts --reporter=verbose
```

## 成果物

- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`: 拡充されたテストケースを追記（修正）

## 完了条件

- [ ] `SkillInfoFormData` の空文字・null ケースが追加されている
- [ ] `QuestionAnswer` の `scheduleConfig` 省略ケースが追加されている
- [ ] `ConversationAnswers` と `SkillWizardScheduleConfig` の相互参照が追加されている
- [ ] `SmartDefaultResult` の `inferenceLog` 任意性が追加されている
- [ ] `SkeletonQualityFeedback` の `skip` ケースが追加されている
- [ ] 全テストケースがパスしている
