# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 12                                                                                                                                                                                                          |
| Phase名    | ドキュメント                                                                                                                                                                                                |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                                                                                                                                                                 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）                                                                                                                                                                                          |
| ステータス | completed                                                                                                                                                                                                   |
| 作成日     | 2026-03-13                                                                                                                                                                                                  |
| 機能名     | workspace-chat-edit-runtime-activation                                                                                                                                                                      |

## 目的

Workspace Chat Edit の AI runtime 有効化 の内容を system spec と task 台帳へ同期する。

## 実行タスク

- ドキュメント同期: implementation guide、changelog、未タスク、feedback を整理する
- system spec 実更新: aiworkflow-requirements 正本に Task02 実装内容を反映する
- 未タスク formalize: 検出した 5 件を `unassigned-task/` に指示書として作成する

## Phase 12 必須タスク

- 実装ガイド作成: Part 1 と Part 2 の 2 部構成で implementation guide を作成する
- system spec 同期: workflow-ai-runtime-authmode-unification.md / interfaces-auth.md / api-ipc-system.md / api-ipc-agent.md / llm-workspace-chat-edit.md / llm-streaming.md / interfaces-llm.md / ui-ux-settings.md / ui-ux-feature-components.md / arch-state-management.md / security-electron-ipc.md / task-workflow.md / lessons-learned.md / legacy-ordinal-family-register.md を更新対象として固定する
- 変更履歴作成: documentation changelog を出力する
- 未タスク検出: 残件があれば formalize し、0件でも検出結果を出力する
- スキルフィードバック記録: 改善観点を 0 件でも記録する

### システム仕様同期先

- workflow-ai-runtime-authmode-unification.md
- interfaces-auth.md
- api-ipc-system.md
- api-ipc-agent.md
- llm-workspace-chat-edit.md
- llm-streaming.md
- interfaces-llm.md
- ui-ux-settings.md
- ui-ux-feature-components.md
- arch-state-management.md
- security-electron-ipc.md
- task-workflow.md
- lessons-learned.md
- legacy-ordinal-family-register.md

## 参照資料

| 参照資料                    | パス                                                          | 内容                              |
| --------------------------- | ------------------------------------------------------------- | --------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                     | 依存する前提成果物を確認する      |
| Phase 2（設計）             | `phase-2-design.md`                                           | 依存する前提成果物を確認する      |
| Phase 5（実装）             | `phase-5-implementation.md`                                   | 依存する前提成果物を確認する      |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                   | 依存する前提成果物を確認する      |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                   | 依存する前提成果物を確認する      |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                      | 依存する前提成果物を確認する      |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                | 依存する前提成果物を確認する      |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                    | 依存する前提成果物を確認する      |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                     | 依存する前提成果物を確認する      |
| chatEditHandlers            | `apps/desktop/src/main/handlers/chatEditHandlers.ts`          | stub 実装と TODO の起点           |
| ChatEditService             | `apps/desktop/src/main/services/chat-edit/ChatEditService.ts` | real adapter を受ける facade      |
| chatEdit IPC bootstrap      | `apps/desktop/src/main/ipc/index.ts`                          | stub adapter 注入の現状を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                 | パス                                                                                            | 内容                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| api-ipc-agent                            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                            | Chat Edit IPC 正本                                                    |
| llm-workspace-chat-edit                  | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | Chat Edit service interface 正本                                      |
| interfaces-llm                           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                           | LLM 契約と coverage 指針                                              |
| security-electron-ipc                    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                    | sender、masking、error envelope の正本                                |
| ui-ux-feature-components                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | Workspace Chat Edit の UI component 正本                              |
| workflow-ai-runtime-authmode-unification | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | Task01 foundation 契約と後続タスク反映順の正本                        |
| interfaces-auth                          | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | access capability 型契約（integratedRuntime / terminalSurface）の正本 |
| api-ipc-system                           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | runtime resolver / selected config / settings 反映の IPC 契約の正本   |
| llm-streaming                            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                            | stream / cancel 契約とエラー分類の正本                                |
| ui-ux-settings                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                           | settings access card / guidance 語彙の正本                            |
| arch-state-management                    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                    | chatEdit state ownership / handoff 境界の正本                         |
| task-workflow                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                            | 完了台帳、関連タスク、未タスク導線の正本                              |
| lessons-learned                          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                          | 苦戦箇所と再発防止手順の正本                                          |
| legacy-ordinal-family-register           | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | 旧成果物命名（例: qa-checklist）との互換管理の正本                    |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Workspace Chat Edit の AI runtime 有効化 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

ドキュメント の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 成果物

| 成果物               | パス                                            | 内容                                                                    |
| -------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 と Part 2 の 2 部構成でまとめる                                  |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 仕様書更新履歴を残す                                                    |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 残件があれば formalize する                                             |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善観点を記録する                                                      |
| 仕様同期記録         | `outputs/phase-12/system-spec-sync-plan.md`     | workflow / IPC / LLM / state / backlog / lessons の実更新結果を記録する |

## 完了条件

- [x] spec sync 先が Chat Edit 契約、foundation 契約、settings 契約、台帳更新まで定義されている
- [x] aiworkflow-requirements 正本更新（workflow / llm / api-ipc / state / backlog / lessons）が完了している
- [x] 未タスク 5 件の指示書が `docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/unassigned-task/` に移管されている

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
