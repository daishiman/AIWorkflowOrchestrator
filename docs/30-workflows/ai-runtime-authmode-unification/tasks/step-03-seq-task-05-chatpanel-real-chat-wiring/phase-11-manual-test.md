# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 11                                                                                                                                                                                  |
| Phase名    | 手動テスト                                                                                                                                                                          |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001                                                                                                                                                 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー） |
| 後続Phase  | Phase 12（ドキュメント）                                                                                                                                                            |
| ステータス | not_started                                                                                                                                                                         |
| 作成日     | 2026-03-13                                                                                                                                                                          |
| 機能名     | chatpanel-real-chat-wiring                                                                                                                                                          |

## 目的

ChatPanel の実 AI チャット配線 の代表シナリオを手動で確認する。

## 実行タスク

- message 送信確認: message 送信、streaming 表示、中断シナリオを確認する
- 設定確認: integrated runtime、terminal launcher、no-credentials の表示を確認する
- zero state 確認: 初回状態で capability banner と next action が見えることを確認する
- 常設 terminal 確認: chat 中でも同じ `Terminal` ボタンで dock を開けることを確認する
- transcript 添付確認: terminal transcript の手動共有が composer attachment と provenance label に反映されることを確認する

## テストケース

| テストケース | 目的                                | 期待結果                                                                     |
| ------------ | ----------------------------------- | ---------------------------------------------------------------------------- |
| TC-11-01     | ChatPanel の送信と streaming        | message list と input の本実装導線が明記されている                           |
| TC-11-02     | ChatPanel の access capability 切替 | access capability、terminal launcher、selected config の反映が明記されている |
| TC-11-03     | ChatPanel の zero state             | empty state と blocked / handoff guidance が同じ語彙で示される               |
| TC-11-04     | ChatPanel の persistent terminal    | panel 上から terminal dock をいつでも開ける                                  |
| TC-11-05     | ChatPanel の transcript attachment  | terminal 共有内容が attachment と provenance として見える                    |

## 画面カバレッジマトリクス

| テストケース | 対象画面  | 状態                         | 証跡計画                                     |
| ------------ | --------- | ---------------------------- | -------------------------------------------- |
| TC-11-01     | ChatPanel | streaming                    | TC-11-01-chatpanel-streaming.png             |
| TC-11-02     | ChatPanel | capability switched          | TC-11-02-chatpanel-capability.png            |
| TC-11-03     | ChatPanel | zero state + guidance        | TC-11-03-chatpanel-zero-guidance.png         |
| TC-11-04     | ChatPanel | persistent terminal launcher | TC-11-04-chatpanel-terminal-launcher.png     |
| TC-11-05     | ChatPanel | transcript attachment        | TC-11-05-chatpanel-transcript-attachment.png |

## 参照資料

| 参照資料                    | パス                                                                     | 内容                                                  |
| --------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                | 依存する前提成果物を確認する                          |
| Phase 2（設計）             | `phase-2-design.md`                                                      | 依存する前提成果物を確認する                          |
| Phase 5（実装）             | `phase-5-implementation.md`                                              | 依存する前提成果物を確認する                          |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                              | 依存する前提成果物を確認する                          |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                              | 依存する前提成果物を確認する                          |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                 | 依存する前提成果物を確認する                          |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                           | 依存する前提成果物を確認する                          |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                               | 依存する前提成果物を確認する                          |
| ChatPanel                   | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                | placeholder UI の現状を確認する                       |
| ai handlers                 | `apps/desktop/src/main/ipc/index.ts`                                     | AI_CHAT と selected config の current path を確認する |
| ChatPanel tests             | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` | 既存 UI 契約を確認する                                |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | LLM と chat contract の正本                             |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT と selected config の IPC 正本                  |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Workspace Chat Panel と ChatPanel 関連 UI 正本          |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access capability と settings 表示契約                  |
| ui-ux-panels                                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`                                    | ChatPanel 統合パターンの正本                            |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | selected config と auth key の既存ルール                |
| pack UI/UX 正本                                 | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                               | ChatPanel の empty / streaming / handoff 状態を確認する |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、ChatPanel の実 AI チャット配線 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

手動テスト の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AI_CHAT、selected config、access capability、workspace context、streaming UX の代表シナリオを手動で確認する。

## 成果物

| 成果物         | パス                                     | 内容                                  |
| -------------- | ---------------------------------------- | ------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 代表シナリオの結果を記録する          |
| 撮影計画       | `outputs/phase-11/screenshot-plan.json`  | 代表画面の撮影対象と TC-ID を整理する |

## 完了条件

- [ ] 代表シナリオが PASS している
- [ ] zero / streaming / capability switched の 3 状態が screenshot 証跡に残っている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
