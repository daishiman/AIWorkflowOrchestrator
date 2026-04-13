# Phase 8 成果物: 責務境界マップ

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## コンポーネント責務マップ（修正後）

| コンポーネント                     | 責務                                                           | 状態     |
| ---------------------------------- | -------------------------------------------------------------- | -------- |
| `SkillCreateWizard.tsx`            | state管理・ハンドラ定義・Step間オーケストレーション（LLM専用） | 修正済み |
| `wizard/SkillInfoStep.tsx`         | Step 0 UI（スキル名・目的・カテゴリ入力のみ）                  | 変更なし |
| `wizard/ConversationRoundStep.tsx` | Step 1 UI（Q1〜Q6インタビュー・必ず通過）                      | 変更なし |
| `wizard/GenerateStep.tsx`          | Step 2 UI（LLM生成中表示・planResult prop不使用）              | 変更なし |
| `wizard/CompleteStep.tsx`          | Step 3 UI（完了表示）                                          | 変更なし |

## データフロー（修正後）

```
SkillCreateWizard
  ├─ formData ──→ SkillInfoStep（Step 0入力）
  ├─ smartDefaults ──→ ConversationRoundStep（Q1〜Q6初期値）
  ├─ answers ──→ handleGenerate（buildSkillContext経由）
  ├─ isGenerating / error / skillPath ──→ GenerateStep / CompleteStep
  └─ hasExternalIntegration / externalToolName ──→ CompleteStep
```
