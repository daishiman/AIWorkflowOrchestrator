# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 5                                   |
| Phase名    | 実装                                |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 前提Phase  | Phase 4（テスト作成）               |
| 後続Phase  | Phase 6（テスト拡充）               |
| ステータス | not_started                         |
| 作成日     | 2026-03-13                          |
| 機能名     | chatpanel-real-chat-wiring          |

## 目的

ChatPanel の実 AI チャット配線 の実装順序と変更境界を整理する。

## 実行タスク

- placeholder 置換順序: placeholder を real state と IPC call へ置き換える順序を整理する
- handoff 実装順序: selected config、access capability、workspace context を接続する順序を整理する

## 参照資料

| 参照資料              | パス                                                                     | 内容                                                  |
| --------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| Phase 4（テスト作成） | `phase-4-test-creation.md`                                               | 依存する前提成果物を確認する                          |
| ChatPanel             | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                | placeholder UI の現状を確認する                       |
| ai handlers           | `apps/desktop/src/main/ipc/index.ts`                                     | AI_CHAT と selected config の current path を確認する |
| ChatPanel tests       | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` | 既存 UI 契約を確認する                                |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | LLM と chat contract の正本                    |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT と selected config の IPC 正本         |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Workspace Chat Panel と ChatPanel 関連 UI 正本 |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access capability と settings 表示契約         |
| ui-ux-panels                                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`                                    | ChatPanel 統合パターンの正本                   |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | selected config と auth key の既存ルール       |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、ChatPanel の実 AI チャット配線 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

実装 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AI_CHAT、selected config、access capability、workspace context、streaming UX の実装順序と接続点を記録する。

## 成果物

| 成果物   | パス                                     | 内容                         |
| -------- | ---------------------------------------- | ---------------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 実装順序と変更対象を整理する |

## 完了条件

- [ ] 実装順序が明確になっている
- [ ] 依存タスクとの接続点が整理されている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
