# Phase 2 成果物: アーキテクチャ設計書

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 1. 廃止 State 一覧

| State名               | 型                    | 廃止理由                      | 状態              |
| --------------------- | --------------------- | ----------------------------- | ----------------- |
| `generationMode`      | `"template" \| "llm"` | LLM 専用化のため不要          | Wave A で削除済み |
| `hasActivatedLlmMode` | `boolean`             | generationMode 廃止に伴い不要 | Wave A で削除済み |

## 2. 維持 State 一覧

| State名                  | 型                           | 役割                       |
| ------------------------ | ---------------------------- | -------------------------- |
| `formData`               | `SkillInfoFormData`          | Step 0 フォーム入力値      |
| `answers`                | `ConversationAnswers`        | Q1〜Q6 回答                |
| `smartDefaults`          | `SmartDefaultResult \| null` | 自動推論されたデフォルト値 |
| `generationMethod`       | `"complete" \| "skip"`       | 生成方式（完全/スキップ）  |
| `isGenerating`           | `boolean`                    | 生成中フラグ               |
| `error`                  | `Error \| null`              | 生成エラー                 |
| `skillPath`              | `string \| null`             | 生成されたスキルのパス     |
| `hasExternalIntegration` | `boolean`                    | 外部連携フラグ             |
| `externalToolName`       | `string \| null`             | 外部ツール名               |

## 3. SkillInfoStep Props 修正設計

### 廃止した props（Wave A で削除済み）

- `generationMode: "template" | "llm"`
- `onGenerationModeChange: (mode: "template" | "llm") => void`

### 現在の SkillInfoStepProps

```typescript
interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}
```

## 4. 不要なimport（削除済み）

- `GenerationMode` 型（`@repo/shared` から）: 削除済み
