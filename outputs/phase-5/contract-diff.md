# Phase 5: 契約差分

## SkillCreateWizard コンポーネント

### 削除された state

| state            | 型                    | 理由                    |
| ---------------- | --------------------- | ----------------------- |
| `generationMode` | `"template" \| "llm"` | LLM 専用化により不要    |
| `description`    | `string`              | formData.purpose に統合 |
| `options`        | `WizardOptions`       | 削除                    |

### 追加された state（W2-seq-03a）

| state                    | 型                           | 初期値              |
| ------------------------ | ---------------------------- | ------------------- |
| `formData`               | `SkillInfoFormData`          | `DEFAULT_FORM_DATA` |
| `answers`                | `ConversationAnswers`        | `DEFAULT_ANSWERS`   |
| `smartDefaults`          | `SmartDefaultResult \| null` | `null`              |
| `generationMethod`       | `"complete" \| "skip"`       | `"complete"`        |
| `skillPath`              | `string \| null`             | `null`              |
| `hasExternalIntegration` | `boolean`                    | `false`             |
| `externalToolName`       | `string \| null`             | `null`              |

### GenerateStep への props 変更

| prop                      | 変更前                        | 変更後                        |
| ------------------------- | ----------------------------- | ----------------------------- |
| `mode` / `generationMode` | 渡していた（TASK-SC-07版）    | 削除（W2-seq-03a で不要）     |
| `onCancel`                | `generationMode` 条件分岐     | `handleCancelGeneration` 固定 |
| `planResult`              | `localPlanResult`（条件付き） | 渡さない                      |
| `onExecutePlan`           | 条件付き                      | 渡さない                      |
| `onCancelPlan`            | 条件付き                      | 渡さない                      |

### CompleteStep への props 変更（W2-seq-03a で新規接続）

| prop                     | 状態                              |
| ------------------------ | --------------------------------- |
| `skillPath`              | ✅ 接続済み                       |
| `hasExternalIntegration` | ✅ 接続済み                       |
| `externalToolName`       | ✅ 接続済み                       |
| `onRetry`                | ✅ handleRetry 接続済み           |
| `onQualityFeedback`      | ✅ handleQualityFeedback 接続済み |
