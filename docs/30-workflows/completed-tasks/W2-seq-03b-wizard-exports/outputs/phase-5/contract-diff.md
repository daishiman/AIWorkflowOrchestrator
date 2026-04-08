# 契約差分

**タスクID**: UT-SKILL-WIZARD-W2-seq-03b
**対象**: `apps/desktop/src/renderer/components/skill/wizard/index.ts`

## 削除エクスポート（5件）

| エクスポート名       | 種別 | 理由                            |
| -------------------- | ---- | ------------------------------- |
| `DescribeStep`       | 値   | `SkillInfoStep` へ置き換え      |
| `DescribeStepProps`  | 型   | `SkillInfoStepProps` へ置き換え |
| `ConfigureStep`      | 値   | 廃止済み（元々存在しなかった）  |
| `ConfigureStepProps` | 型   | 廃止済み（元々存在しなかった）  |
| `WizardOptions`      | 型   | 廃止済み（元々存在しなかった）  |

> 注: `ConfigureStep` / `WizardOptions` 系は過去の設計残留物。今回のテストで非存在を明示的に契約化。

## 追加エクスポート（4件）

| エクスポート名               | 種別 | 説明                                |
| ---------------------------- | ---- | ----------------------------------- |
| `SkillInfoStep`              | 値   | Step 0 のフォームコンポーネント     |
| `SkillInfoStepProps`         | 型   | `SkillInfoStep` の Props 型         |
| `ConversationRoundStep`      | 値   | Step 1 のインタビューコンポーネント |
| `ConversationRoundStepProps` | 型   | `ConversationRoundStep` の Props 型 |

## 維持エクスポート（6件）

| エクスポート名         | 種別 |
| ---------------------- | ---- |
| `StepIndicator`        | 値   |
| `stepStateStyles`      | 値   |
| `GenerateStep`         | 値   |
| `CompleteStep`         | 値   |
| `InterviewProgressBar` | 値   |
| `ApplySummaryCard`     | 値   |
