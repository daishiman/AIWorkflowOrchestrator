# Phase 1 タスク1: 現行コードのインベントリ

## 調査日: 2026-04-08

---

## SkillCreateWizard.tsx（変更対象）

**パス**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

**重要**: W2-seq-03a で大幅改修済み。仕様書想定の DescribeStep/ConfigureStep から SkillInfoStep/ConversationRoundStep に変更されている。

### ステップ構成

| ステップ | コンポーネント          | 説明                             |
| -------- | ----------------------- | -------------------------------- |
| 0        | `SkillInfoStep`         | スキル名・目的・カテゴリ入力     |
| 1        | `ConversationRoundStep` | Q1〜Q6 詳細設定                  |
| 2        | `GenerateStep`          | 生成中表示（ストリーミング対応） |
| 3        | `CompleteStep`          | 生成完了・アクションカード       |

### 現在の状態管理

- `formData`: SkillInfoFormData（Step 0 入力値）
- `answers`: ConversationAnswers（Q1〜Q6）
- `smartDefaults`: SmartDefaultResult
- `generationMethod`: "complete" | "skip"
- `isGenerating`: boolean（ローカル）
- `error`: Error | null（ローカル）
- `skillPath`: string | null
- `hasExternalIntegration`: boolean
- `externalToolName`: string | null

### Store hooks（既使用）

- `useCreateSkill`
- `useIsSkillGenerating`
- `useGenerationProgress`
- `useGenerationError`
- `useClearGenerationState`
- `useWorkflowSnapshot`

### LLM生成フロー: 未実装

- `planSkill` / `executePlan` ハンドラなし
- `generationMode` state なし
- `localPlanResult` state なし

---

## DescribeStep.tsx（deprecated）

**パス**: `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`

**重要**: @deprecated（W2-seq-03b で SkillInfoStep に置き換え済み）

### 既実装済みの generationMode UI

- `generationMode?: GenerationMode`（optional）
- `onGenerationModeChange?: (mode: GenerationMode) => void`（optional）
- ラジオボタン UI（"テンプレートから作成" / "LLM で生成"）が実装済み
- デフォルト値: `generationMode = "template"`

---

## GenerateStep.tsx（変更対象）

**パス**: `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`

### 既実装済みの LLM Plan Props

- `planResult?: PlanResult | null` ✅
- `onExecutePlan?: () => void` ✅
- `onCancelPlan?: () => void` ✅
- `generationProgress?: string | null` ✅
- `isGenerating?: boolean` ✅

### 表示ロジック

- `planResult` あり → 生成計画セクション表示
- `onCancelPlan` あり → キャンセルボタン表示
- `planResult && onExecutePlan` → 実行するボタン表示
- `error && !planResult && onCancelPlan` → 「最初からやり直す」ボタン表示

---

## wizard/index.ts

**パス**: `apps/desktop/src/renderer/components/skill/wizard/index.ts`

- `GenerationMode = "llm" | "template"` がエクスポート済み ✅

---

## 既存テストファイル

### `__tests__/SkillCreateWizard.llm-generation.test.tsx`（存在）

- LLM生成フロー統合テスト（大部分 `.skip` 中）
- `window.skillCreatorAPI` パターンを使用
- パスしているテスト: W-7（テンプレートフロー）, W-8（createSkill呼出）, M-3（デフォルトテンプレート）
- スキップ中: AC-1, AC-2, AC-4, AC-5, AC-10（LLMフロー関連全般）

### `wizard/__tests__/DescribeStep.test.tsx`（存在）

- deprecated コンポーネントのテスト（generationMode UI含む）

### `wizard/__tests__/GenerateStep.test.tsx`（存在）

- planResult/onExecutePlan/onCancelPlan のテスト実装済み ✅

---

## ConversationRoundStep.tsx / SkillInfoStep.tsx

- ConversationRoundStep: LLM生成モード時はスキップ対象（step=1）
- SkillInfoStep: generationMode Props なし（TASK-SC-07で追加不要の方針）
