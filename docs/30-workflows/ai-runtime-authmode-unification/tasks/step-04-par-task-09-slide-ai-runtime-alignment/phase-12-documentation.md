# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 12                                                                                                                                                                                                          |
| Phase名    | ドキュメント                                                                                                                                                                                                |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001                                                                                                                                                                     |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）                                                                                                                                                                                          |
| ステータス | not_started                                                                                                                                                                                                 |
| 作成日     | 2026-03-13                                                                                                                                                                                                  |
| 機能名     | slide-ai-runtime-alignment                                                                                                                                                                                  |

## 目的

Slide / Modifier / Legacy Agent 経路の runtime 整流 の内容を system spec と task 台帳へ同期する。

## 実行タスク

- ドキュメント同期: implementation guide、changelog、未タスク、feedback を整理する

## Phase 12 必須タスク

- 実装ガイド作成: Part 1 と Part 2 の 2 部構成で implementation guide を作成する
- system spec 同期: api-ipc-system.md / interfaces-agent-sdk-skill.md / interfaces-agent-sdk-executor.md / interfaces-agent-sdk-integration.md / ui-ux-settings.md / security-api-electron.md / arch-claude-cli.md / task-workflow.md / lessons-learned.md を更新対象として固定する
- 変更履歴作成: documentation changelog を出力する
- 未タスク検出: 残件があれば formalize し、0件でも検出結果を出力する
- スキルフィードバック記録: 改善観点を 0 件でも記録する

### システム仕様同期先

- api-ipc-system.md
- interfaces-agent-sdk-skill.md
- interfaces-agent-sdk-executor.md
- interfaces-agent-sdk-integration.md
- ui-ux-settings.md
- security-api-electron.md
- arch-claude-cli.md
- task-workflow.md
- lessons-learned.md

## 参照資料

| 参照資料                    | パス                                                 | 内容                                                  |
| --------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                            | 依存する前提成果物を確認する                          |
| Phase 2（設計）             | `phase-2-design.md`                                  | 依存する前提成果物を確認する                          |
| Phase 5（実装）             | `phase-5-implementation.md`                          | 依存する前提成果物を確認する                          |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                          | 依存する前提成果物を確認する                          |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                          | 依存する前提成果物を確認する                          |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                             | 依存する前提成果物を確認する                          |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                       | 依存する前提成果物を確認する                          |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                           | 依存する前提成果物を確認する                          |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                            | 依存する前提成果物を確認する                          |
| slide skill-executor        | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する        |
| slide agent-client          | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する        |
| modifier-skill              | `apps/desktop/src/main/slide/modifier-skill.ts`      | reverse-sync modifier の current path を確認する      |
| sync-manager                | `apps/desktop/src/main/slide/sync-manager.ts`        | watcher と sync status の authority を確認する        |
| SlideWorkspace              | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                         | パス                                                                                    | 内容                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| api-ipc-system                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                   | slide reverse-sync / watch IPC の正本                        |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`       | slide sync / modifier 契約正本                               |
| interfaces-agent-sdk-executor    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`    | execute 契約と error code 正本                               |
| interfaces-agent-sdk-integration | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` | Claude CLI / Agent SDK 統合の正本                            |
| ui-ux-settings                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                   | slide settings / directory / auth surface の正本             |
| security-api-electron            | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`            | slide IPC / preload security の正本                          |
| arch-claude-cli                  | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                  | Claude Code terminal / session / preload architecture の正本 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Slide / Modifier / Legacy Agent 経路の runtime 整流 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

ドキュメント の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 成果物

| 成果物               | パス                                            | 内容                                                                                                                                                                                                                                                        |
| -------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 と Part 2 の 2 部構成でまとめる                                                                                                                                                                                                                      |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 仕様書更新履歴を残す                                                                                                                                                                                                                                        |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 残件があれば formalize する                                                                                                                                                                                                                                 |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善観点を記録する                                                                                                                                                                                                                                          |
| 仕様同期計画         | `outputs/phase-12/system-spec-sync-plan.md`     | api-ipc-system.md / interfaces-agent-sdk-skill.md / interfaces-agent-sdk-executor.md / interfaces-agent-sdk-integration.md / ui-ux-settings.md / security-api-electron.md / arch-claude-cli.md / task-workflow.md / lessons-learned.md の更新方針を整理する |

## 完了条件

- [ ] spec sync 先が slide reverse-sync / modifier / security / settings の正本まで定義されている

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
