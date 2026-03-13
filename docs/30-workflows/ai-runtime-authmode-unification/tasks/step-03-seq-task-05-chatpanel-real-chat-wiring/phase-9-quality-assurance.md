# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 9                                   |
| Phase名    | 品質検証                            |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 前提Phase  | Phase 5（実装）                     |
| 後続Phase  | Phase 10（最終レビュー）            |
| ステータス | not_started                         |
| 作成日     | 2026-03-13                          |
| 機能名     | chatpanel-real-chat-wiring          |

## 目的

ChatPanel の実 AI チャット配線 の品質を横断観点で確認する。

## 実行タスク

- UX 確認: streaming UX、error guidance、selected config drift を確認する
- security 確認: secret masking と error surface の整合を確認する

## 参照資料

| 参照資料        | パス                                                                     | 内容                                                  |
| --------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| Phase 5（実装） | `phase-5-implementation.md`                                              | 依存する前提成果物を確認する                          |
| ChatPanel       | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                | placeholder UI の現状を確認する                       |
| ai handlers     | `apps/desktop/src/main/ipc/index.ts`                                     | AI_CHAT と selected config の current path を確認する |
| ChatPanel tests | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` | 既存 UI 契約を確認する                                |

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

品質検証 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AI_CHAT、selected config、access capability、workspace context、streaming UX の品質観点を横断確認する。

## 成果物

| 成果物             | パス                              | 内容                                           |
| ------------------ | --------------------------------- | ---------------------------------------------- |
| 品質チェックリスト | `outputs/phase-9/qa-checklist.md` | セキュリティ、UX、契約整合の確認項目をまとめる |

## 完了条件

- [ ] 品質 blocker 0 件

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
