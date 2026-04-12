# Phase 2: 変更差分テーブル — UT-SKILL-WIZARD-W2-seq-03b

## wizard/index.ts 差分

| エクスポート                                           | 変更前 | 変更後 | 操作                          |
| ------------------------------------------------------ | ------ | ------ | ----------------------------- |
| `DescribeStep`                                         | あり   | なし   | 削除                          |
| `DescribeStepProps`                                    | あり   | なし   | 削除                          |
| `GenerationMode`（インライン `type` 定義）             | あり   | なし   | 削除                          |
| `SkillInfoStepProps`                                   | なし   | あり   | 追加                          |
| `GenerationMode`（`GenerateStep` 再転送）              | なし   | あり   | 追加（再転送）                |
| `StepIndicator` / `StepIndicatorProps`                 | あり   | あり   | 維持                          |
| `SkillInfoStep`                                        | あり   | あり   | 維持                          |
| `ConversationRoundStep` / `ConversationRoundStepProps` | あり   | あり   | 維持                          |
| `InterviewProgressBar` / 関連型                        | あり   | あり   | 維持                          |
| `ApplySummaryCard` / 関連型                            | あり   | あり   | 維持                          |
| `GenerateStep` / `GenerateStepProps` 等                | あり   | あり   | 維持（`GenerationMode` 追加） |
| `CompleteStep` / `CompleteStepProps`                   | あり   | あり   | 維持                          |

## SkillInfoStep.tsx 差分

| 変更箇所                                | 変更前                         | 変更後                                |
| --------------------------------------- | ------------------------------ | ------------------------------------- |
| `SkillInfoStepProps` interface の可視性 | `interface SkillInfoStepProps` | `export interface SkillInfoStepProps` |

## DescribeStep.tsx 差分

| 変更箇所         | 変更内容                   |
| ---------------- | -------------------------- |
| ファイルコメント | `@deprecated` JSDoc を追加 |
