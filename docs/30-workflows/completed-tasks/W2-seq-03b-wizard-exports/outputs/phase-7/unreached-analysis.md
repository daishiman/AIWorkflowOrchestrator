# 未到達分析

**タスクID**: UT-SKILL-WIZARD-W2-seq-03b

## 結論

未到達シンボル: **0件**

全エクスポートシンボルに対応するテストケースが存在する。

## 分析詳細

### 値エクスポート（10シンボル）

| シンボル                | 対応テスト     | 到達状況 |
| ----------------------- | -------------- | -------- |
| `StepIndicator`         | 維持確認テスト | 到達済み |
| `stepStateStyles`       | 維持確認テスト | 到達済み |
| `SkillInfoStep`         | 追加確認テスト | 到達済み |
| `ConversationRoundStep` | 追加確認テスト | 到達済み |
| `InterviewProgressBar`  | 維持確認テスト | 到達済み |
| `ApplySummaryCard`      | 維持確認テスト | 到達済み |
| `GenerateStep`          | 維持確認テスト | 到達済み |
| `CompleteStep`          | 維持確認テスト | 到達済み |

### 型エクスポート（コンパイル時検証）

| 型名                                  | 対応テスト                             | 到達状況 |
| ------------------------------------- | -------------------------------------- | -------- |
| `SkillInfoStepProps`                  | 型確認テスト（インライン型インポート） | 到達済み |
| `ConversationRoundStepProps`          | 型確認テスト（インライン型インポート） | 到達済み |
| `StepState` / `StepIndicatorProps` 他 | 型エラーなしコンパイルにて確認         | 到達済み |

### 削除シンボルの非存在確認

| シンボル        | 対応テスト     | 確認状況           |
| --------------- | -------------- | ------------------ |
| `DescribeStep`  | 削除確認テスト | undefined 確認済み |
| `ConfigureStep` | 削除確認テスト | undefined 確認済み |
| `WizardOptions` | 削除確認テスト | undefined 確認済み |
