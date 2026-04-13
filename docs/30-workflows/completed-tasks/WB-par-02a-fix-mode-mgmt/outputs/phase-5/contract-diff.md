# Phase 5 成果物: 契約差分

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## Props差分

### SkillCreateWizardProps（変更なし）

```typescript
export interface SkillCreateWizardProps {
  onClose: () => void;
  source?: "lifecycle_panel" | "direct";
}
```

### SkillInfoStepProps（変更なし）

```typescript
export interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}
```

## State差分

### 削除されたstate

| state名               | 型                    |
| --------------------- | --------------------- |
| `generationMode`      | `"template" \| "llm"` |
| `hasActivatedLlmMode` | `boolean`             |
| `localPlanResult`     | `PlanResult \| null`  |
| `llmDescription`      | `string`              |

### 残存するstate（変更なし）

| state名                  | 型                           |
| ------------------------ | ---------------------------- |
| `formData`               | `SkillInfoFormData`          |
| `answers`                | `ConversationAnswers`        |
| `smartDefaults`          | `SmartDefaultResult \| null` |
| `generationMethod`       | `"complete" \| "skip"`       |
| `isGenerating`           | `boolean`                    |
| `error`                  | `Error \| null`              |
| `skillPath`              | `string \| null`             |
| `hasExternalIntegration` | `boolean`                    |
| `externalToolName`       | `string \| null`             |

## GenerateStep Props差分

| Prop            | 修正前                                                                                    | 修正後                                        |
| --------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| `onCancel`      | `generationMode === "llm" ? handleCancelPlan : handleCancelTemplateGeneration`            | `handleCancelGeneration`                      |
| `onRetry`       | `generationMode === "template" ? () => void handleGenerate(generationMethod) : undefined` | `() => void handleGenerate(generationMethod)` |
| `planResult`    | `generationMode === "llm" ? localPlanResult : undefined`                                  | 省略（undefined）                             |
| `onExecutePlan` | `generationMode === "llm" ? () => void handleExecutePlan() : undefined`                   | 省略（undefined）                             |
| `onCancelPlan`  | `generationMode === "llm" ? handleCancelPlan : undefined`                                 | 省略（undefined）                             |
