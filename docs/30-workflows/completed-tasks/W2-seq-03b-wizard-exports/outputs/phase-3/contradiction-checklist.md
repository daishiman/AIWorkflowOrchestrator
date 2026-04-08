# 矛盾チェックリスト

タスクID: UT-SKILL-WIZARD-W2-seq-03b

## 削除対象エクスポート（6件）

| #   | エクスポート名                | index.ts から除去済み | ファイル依存なし            | 確認状態 |
| --- | ----------------------------- | --------------------- | --------------------------- | -------- |
| 1   | `DescribeStep`                | [x]                   | [x]                         | OK       |
| 2   | `DescribeStepProps`           | [x]                   | [x]                         | OK       |
| 3   | `ConfigureStep`               | [x]                   | [x] ファイル削除済み        | OK       |
| 4   | `ConfigureStepProps`          | [x]                   | [x] ファイル削除済み        | OK       |
| 5   | `WizardOptions`               | [x]                   | [x]                         | OK       |
| 6   | `GenerationMode` (standalone) | [x]                   | [x] GenerateStep 経由で維持 | OK       |

## 追加対象エクスポート（4件）

| #   | エクスポート名               | index.ts に存在 | ソースファイル存在            | 確認状態 |
| --- | ---------------------------- | --------------- | ----------------------------- | -------- |
| 7   | `SkillInfoStep`              | [x]             | [x] SkillInfoStep.tsx         | OK       |
| 8   | `SkillInfoStepProps`         | [x]             | [x] SkillInfoStep.tsx         | OK       |
| 9   | `ConversationRoundStep`      | [x]             | [x] ConversationRoundStep.tsx | OK       |
| 10  | `ConversationRoundStepProps` | [x]             | [x] ConversationRoundStep.tsx | OK       |

## 維持対象エクスポート（主要 9 件）

| #   | エクスポート名                       | index.ts に存在 | 確認状態 |
| --- | ------------------------------------ | --------------- | -------- |
| 11  | `StepIndicator`                      | [x]             | OK       |
| 12  | `stepStateStyles`                    | [x]             | OK       |
| 13  | `StepState`                          | [x]             | OK       |
| 14  | `StepIndicatorProps`                 | [x]             | OK       |
| 15  | `GenerateStep`                       | [x]             | OK       |
| 16  | `GenerateStepProps`                  | [x]             | OK       |
| 17  | `GenerationMode` (GenerateStep 経由) | [x]             | OK       |
| 18  | `CompleteStep`                       | [x]             | OK       |
| 19  | `CompleteStepProps`                  | [x]             | OK       |

## 判定

全 19 件チェック完了。矛盾・漏れなし。
