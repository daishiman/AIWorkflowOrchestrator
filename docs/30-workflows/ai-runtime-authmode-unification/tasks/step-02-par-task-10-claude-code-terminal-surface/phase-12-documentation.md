# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 12                                                                                                                                                                                                          |
| Phase名    | ドキュメント                                                                                                                                                                                                |
| タスクID   | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001                                                                                                                                                                   |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）                                                                                                                                                                                          |
| ステータス | not_started                                                                                                                                                                                                 |
| 作成日     | 2026-03-13                                                                                                                                                                                                  |
| 機能名     | claude-code-terminal-surface                                                                                                                                                                                |

## 目的

Claude Code terminal surface と手動操作境界の整流 の内容を system spec と task 台帳へ同期する。

## 実行タスク

- ドキュメント同期: implementation guide、terminal UX runbook、changelog、未タスク、feedback を整理する

## Phase 12 必須タスク

- 実装ガイド作成: Part 1 と Part 2 の 2 部構成で implementation guide を作成する
- system spec 同期: interfaces-agent-sdk-ui.md / interfaces-agent-sdk-integration.md / interfaces-agent-sdk-history.md / ui-ux-agent-execution.md / ui-ux-feature-components.md / security-api-electron.md / security-electron-ipc.md / arch-claude-cli.md / architecture-overview.md / task-workflow.md / lessons-learned.md を更新対象として固定する
- 変更履歴作成: documentation changelog を出力する
- 未タスク検出: 残件があれば formalize し、0件でも検出結果を出力する
- スキルフィードバック記録: 改善観点を 0 件でも記録する

### システム仕様同期先

- interfaces-agent-sdk-ui.md
- interfaces-agent-sdk-integration.md
- interfaces-agent-sdk-history.md
- ui-ux-agent-execution.md
- ui-ux-feature-components.md
- security-api-electron.md
- security-electron-ipc.md
- arch-claude-cli.md
- architecture-overview.md
- task-workflow.md
- lessons-learned.md

## 参照資料

| 参照資料                    | パス                                                                            | 内容                                                          |
| --------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                       | 依存する前提成果物を確認する                                  |
| Phase 2（設計）             | `phase-2-design.md`                                                             | 依存する前提成果物を確認する                                  |
| Phase 5（実装）             | `phase-5-implementation.md`                                                     | 依存する前提成果物を確認する                                  |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                                     | 依存する前提成果物を確認する                                  |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                                     | 依存する前提成果物を確認する                                  |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                        | 依存する前提成果物を確認する                                  |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                                  | 依存する前提成果物を確認する                                  |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                                      | 依存する前提成果物を確認する                                  |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                                       | 依存する前提成果物を確認する                                  |
| ClaudeCliManager            | `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`                          | current facade / session API を確認する                       |
| ProcessManager              | `apps/desktop/src/main/claude-cli/ProcessManager.ts`                            | process lifecycle と terminal transport 候補を確認する        |
| SessionManager              | `apps/desktop/src/main/claude-cli/SessionManager.ts`                            | session lifecycle / transcript 保持を確認する                 |
| AgentSDKPage                | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                        | terminal surface の既存統合位置を確認する                     |
| ExecutionEnvironment        | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx` | terminal placeholder と environment selector の現状を確認する |
| Claude CLI IPC              | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                               | invoke/on channel と current automation 経路を確認する        |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                         | パス                                                                                    | 内容                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| interfaces-agent-sdk-ui          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`          | Agent SDK UI / Hook の正本                                   |
| interfaces-agent-sdk-integration | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` | Claude CLI / Agent SDK 統合の正本                            |
| interfaces-agent-sdk-history     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`     | terminal history / execution environment の正本              |
| ui-ux-agent-execution            | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`            | Agent surface の UI 契約                                     |
| ui-ux-feature-components         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`         | terminal panel / environment surface の正本                  |
| security-api-electron            | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`            | preload / terminal renderer security の正本                  |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | IPC sender / error envelope の正本                           |
| arch-claude-cli                  | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                  | Claude Code terminal / session / preload architecture の正本 |
| architecture-overview            | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`            | terminal surface の責務境界を確認する                        |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Claude Code terminal surface と手動操作境界の整流 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

ドキュメント の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 成果物

| 成果物               | パス                                            | 内容                                                       |
| -------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 と Part 2 の 2 部構成でまとめる                     |
| 仕様同期計画         | `outputs/phase-12/system-spec-sync-plan.md`     | terminal UX / security / architecture の更新方針を整理する |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 仕様書更新履歴を残す                                       |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 残件があれば formalize する                                |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善観点を記録する                                         |

## 完了条件

- [ ] spec sync 先が terminal UI / preload / history / security / architecture の正本まで定義されている

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
