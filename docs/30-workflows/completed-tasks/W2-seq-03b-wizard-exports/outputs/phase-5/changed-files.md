# 変更ファイル一覧

**タスクID**: UT-SKILL-WIZARD-W2-seq-03b

## 変更ファイル（4件）

| #   | ファイルパス                                                                  | 変更種別 | 変更内容                                          |
| --- | ----------------------------------------------------------------------------- | -------- | ------------------------------------------------- |
| 1   | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         | 修正     | `interface SkillInfoStepProps` に `export` を追加 |
| 2   | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                  | 修正     | DescribeStep 削除・SkillInfoStep 追加             |
| 3   | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`          | 修正     | `@deprecated` JSDoc を追加                        |
| 4   | `apps/desktop/src/renderer/components/skill/__tests__/wizard-exports.test.ts` | 新規     | エクスポート契約テスト 13 件                      |

## 変更なしファイル（参考）

以下は今回の変更対象外。

- `ConversationRoundStep.tsx`
- `GenerateStep.tsx`
- `CompleteStep.tsx`
- `StepIndicator.tsx`
- `InterviewProgressBar.tsx`
- `ApplySummaryCard.tsx`
