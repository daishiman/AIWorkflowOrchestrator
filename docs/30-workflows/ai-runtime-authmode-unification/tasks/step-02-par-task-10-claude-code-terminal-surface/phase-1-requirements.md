# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| Phase名    | 要件定義                                  |
| タスクID   | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 |
| 前提Phase  | なし                                      |
| 後続Phase  | Phase 2（設計）                           |
| ステータス | not_started                               |
| 作成日     | 2026-03-13                                |
| 機能名     | claude-code-terminal-surface              |

## 目的

Claude Code terminal surface の現状経路と、`ユーザーが自分で terminal を操作する` 前提で必要な UI / UX / security 要件を把握する。

## 実行タスク

- 経路棚卸し: ClaudeCliManager、ProcessManager、SessionManager、Claude CLI IPC、preload、ExecutionEnvironment、AgentSDKPage、shared claude-cli types の launch / session / output / abort / retry 経路を整理する
- UX 要件整理: install check、working directory 表示、copy command、launch shell、session transcript、large output、history、abort / retry、empty state、error state の要件を整理する
- 境界要件整理: `copy only / no auto send`、OAuth token 非保持、credential 非中継、user-operated boundary、manual retry boundary を明文化する

## 参照資料

| 参照資料                         | パス                                                                                 | 内容                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| ClaudeCliManager                 | `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`                               | current facade / session API を確認する                       |
| ProcessManager                   | `apps/desktop/src/main/claude-cli/ProcessManager.ts`                                 | process lifecycle と terminal transport 候補を確認する        |
| SessionManager                   | `apps/desktop/src/main/claude-cli/SessionManager.ts`                                 | session lifecycle / transcript 保持を確認する                 |
| Claude CLI IPC                   | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                                    | invoke/on channel と current automation 経路を確認する        |
| claude-cli shared types          | `packages/shared/src/claude-cli/types.ts`                                            | session / output / status 契約を確認する                      |
| preload index                    | `apps/desktop/src/preload/index.ts`                                                  | `window.claudeCliAPI` の公開契約を確認する                    |
| preload channels                 | `apps/desktop/src/preload/channels.ts`                                               | whitelist channel と event 契約を確認する                     |
| preload types                    | `apps/desktop/src/preload/types.ts`                                                  | renderer API の terminal 型定義を確認する                     |
| ExecutionEnvironment             | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx`      | terminal placeholder と environment selector の現状を確認する |
| AgentSDKPage                     | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                             | terminal surface の既存統合位置を確認する                     |
| completed task: cli integration  | `docs/30-workflows/completed-tasks/claude-code-cli-integration/index.md`             | CLI integration の既存正本を確認する                          |
| completed task: renderer api     | `docs/30-workflows/completed-tasks/claude-cli-renderer-api/index.md`                 | preload / IPC / security の既存正本を確認する                 |
| unassigned: terminal environment | `docs/30-workflows/unassigned-task/task-environment-type-terminal-implementation.md` | terminal preview の未解決要件を確認する                       |
| unassigned: progress feedback    | `docs/30-workflows/unassigned-task/task-imp-claude-cli-progress-feedback.md`         | progress UX の未解決要件を確認する                            |
| unassigned: abort ui             | `docs/30-workflows/unassigned-task/task-imp-claude-cli-abort-ui.md`                  | abort UI の未解決要件を確認する                               |
| unassigned: retry ux             | `docs/30-workflows/unassigned-task/task-imp-claude-cli-retry-ux.md`                  | retry UX の未解決要件を確認する                               |
| unassigned: large output         | `docs/30-workflows/unassigned-task/task-perf-claude-cli-large-output.md`             | large output 性能課題を確認する                               |
| unassigned: concurrent load      | `docs/30-workflows/unassigned-task/task-perf-claude-cli-concurrent-load.md`          | session 同時実行の性能課題を確認する                          |

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

要件定義 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

launch、session、output stream、abort、retry、history、large output performance、`no auto-send` 境界の接続要件を要件として明文化する。

## 成果物

| 成果物       | パス                                         | 内容                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | 要件、制約、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲を明記する   |

## 完了条件

- [ ] terminal launch / session / output / abort / retry / history / performance の現状経路が整理されている
- [ ] `copy only / no auto-send`、credential 非中継、user-operated boundary が要件として固定されている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
