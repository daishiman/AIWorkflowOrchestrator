# Phase 12 成果物: システム仕様更新サマリー

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 廃止した State

| State名               | 旧型                  | 廃止理由             |
| --------------------- | --------------------- | -------------------- |
| `generationMode`      | `"template" \| "llm"` | LLM 専用化のため不要 |
| `hasActivatedLlmMode` | `boolean`             | 上記廃止に伴い不要   |

## 修正したコンポーネントインターフェース

### SkillInfoStepProps（修正後）

```typescript
interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
  // 廃止: generationMode / onGenerationModeChange
}
```

## 確立した正規フロー

```
Step 0（スキル情報入力）
  → Step 1（Q1〜Q6 LLMインタビュー）
  → Step 2（LLM生成中）
  → Step 3（完了）
```

## システム仕様への反映

- ウィザードは LLM 専用モード一本化
- template モードは廃止
- Step 1（ConversationRoundStep）は必須ステップ（スキップ不可）
