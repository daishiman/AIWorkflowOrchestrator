# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 9                                           |
| Phase名    | 品質検証                                    |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 前提Phase  | Phase 5（実装）                             |
| 後続Phase  | Phase 10（最終レビュー）                    |
| ステータス | not_started                                 |
| 作成日     | 2026-03-13                                  |
| 機能名     | workspace-chat-edit-runtime-activation      |

## 目的

Workspace Chat Edit の AI runtime 有効化 の品質を横断観点で確認する。

## 実行タスク

- security 確認: path traversal、sender validation、secret masking を確認する
- UX 確認: missing credentials、timeout、rate limit の文言を確認する

## 参照資料

| 参照資料               | パス                                                          | 内容                              |
| ---------------------- | ------------------------------------------------------------- | --------------------------------- |
| Phase 5（実装）        | `phase-5-implementation.md`                                   | 依存する前提成果物を確認する      |
| chatEditHandlers       | `apps/desktop/src/main/handlers/chatEditHandlers.ts`          | stub 実装と TODO の起点           |
| ChatEditService        | `apps/desktop/src/main/services/chat-edit/ChatEditService.ts` | real adapter を受ける facade      |
| chatEdit IPC bootstrap | `apps/desktop/src/main/ipc/index.ts`                          | stub adapter 注入の現状を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                            | 内容                                     |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------- |
| api-ipc-agent            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`            | Chat Edit IPC 正本                       |
| llm-workspace-chat-edit  | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`  | Chat Edit service interface 正本         |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | LLM 契約と coverage 指針                 |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | sender、masking、error envelope の正本   |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Workspace Chat Edit の UI component 正本 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Workspace Chat Edit の AI runtime 有効化 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

品質検証 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

selection handoff、chat-edit IPC、workspacePath 制約、runtime resolution の品質観点を横断確認する。

## 成果物

| 成果物             | パス                              | 内容                                           |
| ------------------ | --------------------------------- | ---------------------------------------------- |
| 品質チェックリスト | `outputs/phase-9/qa-checklist.md` | セキュリティ、UX、契約整合の確認項目をまとめる |

## 完了条件

- [ ] 品質 blocker 0 件

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
