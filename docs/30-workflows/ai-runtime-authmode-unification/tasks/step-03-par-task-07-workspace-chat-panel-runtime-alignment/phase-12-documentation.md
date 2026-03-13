# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 12                                                                                                                                                                                                          |
| Phase名    | ドキュメント                                                                                                                                                                                                |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                                                                                                                                                                |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）                                                                                                                                                                                          |
| ステータス | not_started                                                                                                                                                                                                 |
| 作成日     | 2026-03-13                                                                                                                                                                                                  |
| 機能名     | workspace-chat-panel-runtime-alignment                                                                                                                                                                      |

## 目的

Workspace Chat Panel 同期仕様の内容を system spec と task 台帳へ同期する。

## 実行タスク

- ドキュメント同期: implementation guide、changelog、未タスク、feedback を整理する

## Phase 12 必須タスク

- 実装ガイド作成: Part 1 と Part 2 の 2 部構成で implementation guide を作成する
- system spec 同期: interfaces-llm.md / llm-streaming.md / ui-ux-feature-components.md / ui-ux-navigation.md / arch-state-management.md / task-workflow.md / lessons-learned.md を更新対象として固定する
- 変更履歴作成: documentation changelog を出力する
- 未タスク検出: 残件があれば formalize し、0件でも検出結果を出力する
- スキルフィードバック記録: 改善観点を 0 件でも記録する

### システム仕様同期先

- interfaces-llm.md
- llm-streaming.md
- ui-ux-feature-components.md
- ui-ux-navigation.md
- arch-state-management.md
- task-workflow.md
- lessons-learned.md

## 参照資料

| 参照資料                    | パス                                                                               | 内容                                  |
| --------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                          | 依存する前提成果物を確認する          |
| Phase 2（設計）             | `phase-2-design.md`                                                                | 依存する前提成果物を確認する          |
| Phase 5（実装）             | `phase-5-implementation.md`                                                        | 実装対象と authority 変更点を確認する |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                                        | 回帰拡張内容を確認する                |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                                        | critical path coverage を確認する     |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                           | 責務整理内容を確認する                |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                                     | stale stream / 誤添付観点を確認する   |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                                         | release 判定の前提を確認する          |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                                          | 依存する前提成果物を確認する          |
| WorkspaceChatPanel          | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`             | workspace chat UI surface を確認する  |
| completed task 059a         | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md` | 既存 UI / streaming 正本を確認する    |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                            | 内容                                  |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | workspace chat と conversation の正本 |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | stream chat / cancel 契約の正本       |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Workspace Chat Panel UI の正本        |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | workspace 導線の正本                  |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | selected files / state handoff の正本 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Workspace Chat Panel の runtime / access capability 同期 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

ドキュメント の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 成果物

| 成果物               | パス                                            | 内容                                   |
| -------------------- | ----------------------------------------------- | -------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 と Part 2 の 2 部構成でまとめる |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 仕様書更新履歴を残す                   |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 残件があれば formalize する            |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善観点を記録する                     |
| 仕様同期計画         | `outputs/phase-12/system-spec-sync-plan.md`     | 同期対象仕様の更新方針を整理する       |

## 完了条件

- [ ] spec sync 先が workspace chat / streaming / state 正本まで定義されている

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
