# 変更差分テーブル

タスクID: UT-SKILL-WIZARD-W2-seq-03b

## エクスポート変更一覧

| エクスポート                         | Before                   | After | 操作     | 理由                                     |
| ------------------------------------ | ------------------------ | ----- | -------- | ---------------------------------------- |
| `DescribeStep`                       | あり                     | なし  | 削除     | SkillInfoStep に置き換え済み             |
| `DescribeStepProps`                  | あり                     | なし  | 削除     | 同上                                     |
| `ConfigureStep`                      | なし（ファイル削除済み） | なし  | 削除済み | ConfigureStep.tsx が存在しない           |
| `ConfigureStepProps`                 | なし（ファイル削除済み） | なし  | 削除済み | 同上                                     |
| `WizardOptions`                      | あり（想定）             | なし  | 削除     | ConversationRoundStep 方式に移行         |
| `GenerationMode` (standalone)        | あり（想定）             | なし  | 削除     | GenerateStep 内定義で統一                |
| `SkillInfoStep`                      | あり                     | あり  | 維持     | 新規コンポーネント、既存エクスポート済み |
| `SkillInfoStepProps`                 | なし（欠落）             | あり  | 追加     | 型エクスポートが漏れていた               |
| `ConversationRoundStep`              | あり                     | あり  | 維持     | 既存エクスポート済み                     |
| `ConversationRoundStepProps`         | あり                     | あり  | 維持     | 既存エクスポート済み                     |
| `StepIndicator`                      | あり                     | あり  | 維持     | 継続使用                                 |
| `stepStateStyles`                    | あり                     | あり  | 維持     | 継続使用                                 |
| `StepState`                          | あり                     | あり  | 維持     | 継続使用                                 |
| `StepIndicatorProps`                 | あり                     | あり  | 維持     | 継続使用                                 |
| `GenerateStep`                       | あり                     | あり  | 維持     | 継続使用                                 |
| `GenerateStepProps`                  | あり                     | あり  | 維持     | 継続使用                                 |
| `GenerationError`                    | あり                     | あり  | 維持     | 継続使用                                 |
| `GenerationMode` (GenerateStep 経由) | あり                     | あり  | 維持     | GenerateStep 内定義のものは維持          |
| `GenerationStage`                    | あり                     | あり  | 維持     | 継続使用                                 |
| `GenerationErrorCode`                | あり                     | あり  | 維持     | 継続使用                                 |
| `CompleteStep`                       | あり                     | あり  | 維持     | 継続使用                                 |
| `CompleteStepProps`                  | あり                     | あり  | 維持     | 継続使用                                 |
| `GeneratedSkill`                     | あり                     | あり  | 維持     | 継続使用                                 |

## 変更サマリ

- 削除: 6件
- 追加: 1件（SkillInfoStepProps の型エクスポート補完）
- 実質追加（既存コンポーネントの確立）: ConversationRoundStep/SkillInfoStep は既存のため「維持」扱い
- 維持: 16件
