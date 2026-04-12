# Phase 4: テスト仕様書 — UT-SKILL-WIZARD-W2-seq-03b

## テストファイル

`apps/desktop/src/renderer/components/skill/__tests__/wizard-exports.test.ts`

## テストケース一覧

| TC    | describe             | it                                                                 | 期待結果              |
| ----- | -------------------- | ------------------------------------------------------------------ | --------------------- |
| TC-01 | 削除エクスポート確認 | DescribeStep がエクスポートされていないこと                        | `undefined`           |
| TC-02 | 削除エクスポート確認 | ConfigureStep がエクスポートされていないこと                       | `undefined`           |
| TC-03 | 削除エクスポート確認 | WizardOptions がエクスポートされていないこと                       | `undefined`           |
| TC-04 | 追加エクスポート確認 | SkillInfoStep がエクスポートされていること                         | `function` 型         |
| TC-05 | 追加エクスポート確認 | ConversationRoundStep がエクスポートされていること                 | `function` 型         |
| TC-06 | 維持エクスポート確認 | StepIndicator が引き続きエクスポートされていること                 | defined               |
| TC-07 | 維持エクスポート確認 | GenerateStep が引き続きエクスポートされていること                  | defined               |
| TC-08 | 維持エクスポート確認 | CompleteStep が引き続きエクスポートされていること                  | defined               |
| TC-09 | 維持エクスポート確認 | InterviewProgressBar が引き続きエクスポートされていること          | defined               |
| TC-10 | 維持エクスポート確認 | ApplySummaryCard が引き続きエクスポートされていること              | defined               |
| TC-11 | 型契約確認           | GenerationMode が barrel から期待どおりの union 型で参照できること | `"llm" \| "template"` |
| TC-12 | 型契約確認           | SkillInfoStepProps.formData が SkillInfoFormData と一致すること    | type-equal            |
| TC-13 | 型契約確認           | SkillInfoStepProps.onNext が `() => void` と一致すること           | type-equal            |

## Red 状態確認（実装前）

| TC    | 状態（実装前） | 理由                                           |
| ----- | -------------- | ---------------------------------------------- |
| TC-01 | ❌ FAIL        | `DescribeStep` がまだ `index.ts` にある        |
| TC-02 | ✅ PASS        | `ConfigureStep` はすでに存在しない             |
| TC-03 | ✅ PASS        | `WizardOptions` はすでに存在しない             |
| TC-04 | ✅ PASS        | `SkillInfoStep` はすでにエクスポート済み       |
| TC-05 | ✅ PASS        | `ConversationRoundStep` は既にエクスポート済み |
| TC-06 | ✅ PASS        | `StepIndicator` は維持されている               |
| TC-07 | ✅ PASS        | `GenerateStep` は維持されている                |
| TC-08 | ✅ PASS        | `CompleteStep` は維持されている                |
| TC-09 | ✅ PASS        | `InterviewProgressBar` は維持されている        |
| TC-10 | ✅ PASS        | `ApplySummaryCard` は維持されている            |
| TC-11 | ❌ FAIL        | inline 定義のため再転送 contract が未成立      |
| TC-12 | ❌ FAIL        | `SkillInfoStepProps` が public type ではない   |
| TC-13 | ❌ FAIL        | `SkillInfoStepProps` の barrel contract 未成立 |
