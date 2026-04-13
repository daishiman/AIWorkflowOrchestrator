# Phase 1 成果物: スコープ定義書

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 影響を受けるファイル

| ファイル                                                                                         | 変更種別 | 影響内容                         |
| ------------------------------------------------------------------------------------------------ | -------- | -------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                               | 変更     | state削除・ハンドラ修正・JSX変更 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | 変更     | 新テスト追加（TC-01〜TC-06）     |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 変更     | describe.skip済みのため変更不要  |

## 削除対象の完全一覧

### States（SkillCreateWizard.tsx）

| 変数名                | 型                   | 行      |
| --------------------- | -------------------- | ------- |
| `generationMode`      | `GenerationMode`     | 426-428 |
| `hasActivatedLlmMode` | `boolean`            | 429     |
| `localPlanResult`     | `PlanResult \| null` | 431-432 |
| `llmDescription`      | `string`             | 433     |

### Refs

| 変数名                      | 行  |
| --------------------------- | --- |
| `llmGenerationRequestIdRef` | 392 |

### Store Hooks（SkillCreateWizard.tsx インポート）

| Hook名                     | 行  |
| -------------------------- | --- |
| `useSetIsSkillGenerating`  | ~57 |
| `useSetGenerationProgress` | ~58 |
| `useSetGenerationError`    | ~59 |
| `useSetCurrentPlanResult`  | ~60 |
| `useSetCurrentPlanId`      | ~61 |
| `useCurrentPlanId`         | ~55 |
| `useCurrentPlanResult`     | ~56 |

### Functions

| 関数名                             | 行      | 削除理由                      |
| ---------------------------------- | ------- | ----------------------------- |
| `isTerminalHandoffExecuteResponse` | 113-123 | `handleExecutePlan`でのみ使用 |
| `toHandoffGuidance`                | 184-191 | `handleExecutePlan`でのみ使用 |
| `toTerminalHandoffPlanResult`      | 193-207 | `handleExecutePlan`でのみ使用 |
| `handleStep0NextFromLlm`           | 488-498 | LLMモード専用関数             |
| `handleLlmGenerate`                | 614-692 | LLMプラン生成フロー（廃止）   |
| `handleExecutePlan`                | 695-828 | LLMプラン実行フロー（廃止）   |
| `handleCancelPlan`                 | 831-841 | LLMプランキャンセル（廃止）   |

### JSX（SkillCreateWizard.tsx renderブロック）

| 削除対象                                            | 行       |
| --------------------------------------------------- | -------- |
| ラジオボタンdiv（生成モード選択UI）                 | 898-923  |
| LLM説明textarea + div                               | 934-963  |
| `generationMode === "llm"` 条件分岐（Step 2 props） | 993-1009 |

## 変更しないファイル（影響なし）

- `SkillInfoStep.tsx`（props型はすでにgenerationMode不要の形式）
- `ConversationRoundStep.tsx`（変更なし）
- `GenerateStep.tsx`（`planResult`等はoptional propのため変更不要）
- `wizard/index.ts`（`GenerationMode`型は残す）

## TASK-SW-FIX-DATAFLOW-001との依存整合

- TASK-SW-FIX-DATAFLOW-001は「Step 1回答→スキル生成コンテキストブリッジ」を実装済み
- 本タスクでStep 1を必須化することで、TASK-SW-FIX-DATAFLOW-001の実装が有効活用される
- `buildSkillContext(formData, answers)` の呼び出しは`handleGenerate`内で維持する
