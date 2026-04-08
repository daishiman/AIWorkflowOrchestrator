# 要件定義書

タスクID: UT-SKILL-WIZARD-W2-seq-03b
タスク名: wizard/index.ts エクスポート更新

## 目的

`apps/desktop/src/renderer/components/skill/wizard/index.ts` のエクスポート定義を、
現在のコンポーネント実態に合わせて整理する。

- 削除済みコンポーネント（DescribeStep, ConfigureStep）の参照をパブリック API から除去
- 新規実装コンポーネント（SkillInfoStep, ConversationRoundStep）の型エクスポートを確立
- インポート側がコンパイルエラーなく移行できる状態にする

## 変更対象

| 操作 | エクスポート名                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------ |
| 削除 | DescribeStep, DescribeStepProps                                                                        |
| 削除 | ConfigureStep, ConfigureStepProps                                                                      |
| 削除 | WizardOptions                                                                                          |
| 削除 | GenerationMode (standalone 再エクスポート)                                                             |
| 追加 | SkillInfoStep, SkillInfoStepProps                                                                      |
| 追加 | ConversationRoundStep, ConversationRoundStepProps                                                      |
| 維持 | StepIndicator, stepStateStyles, StepState, StepIndicatorProps                                          |
| 維持 | GenerateStep, GenerateStepProps, GenerationError, GenerationMode, GenerationStage, GenerationErrorCode |
| 維持 | CompleteStep, CompleteStepProps                                                                        |

## 影響範囲

- `wizard/index.ts` から DescribeStep/DescribeStepProps を削除
- `DescribeStep.test.tsx` は直接 `../DescribeStep` からインポートしているため、index.ts 変更の影響を受けない
- `SkillCreateWizard.tsx` は index.ts 経由でコンポーネントを参照するため、削除対象エクスポートの使用有無を確認が必要

## 受け入れ基準

- 削除 6 件がすべて index.ts から取り除かれていること
- 追加 4 件がすべて index.ts に存在すること
- 維持 6 件（グループ）が引き続きエクスポートされていること
- TypeScript コンパイルエラーがないこと
- 既存テストがすべて PASS すること
