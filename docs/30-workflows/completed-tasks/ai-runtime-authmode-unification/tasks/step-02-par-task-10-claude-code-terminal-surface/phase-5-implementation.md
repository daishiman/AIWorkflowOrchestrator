# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| Phase名    | 実装                                      |
| タスクID   | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 |
| 前提Phase  | Phase 4（テスト作成）                     |
| 後続Phase  | Phase 6（テスト拡充）                     |
| ステータス | not_started                               |
| 作成日     | 2026-03-13                                |
| 機能名     | claude-code-terminal-surface              |

## 目的

Claude Code terminal surface と手動操作境界の整流に必要な実装順序と変更境界を固定する。

## 実行タスク

- main 実装: launcher / session / transcript / status / abort / retry の main process 実装を整理する
- preload 実装: `window.claudeCliAPI` の公開面と channel whitelist を terminal surface 契約に揃える
- renderer 実装: terminal surface UI、manual transcript share、unavailable guidance を統合する
- 境界実装: `no auto-send`、credential 非中継、manual retry boundary をコード上で固定する

## 参照資料

| 参照資料                 | パス                                                                            | 内容                                                  |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 4（テスト作成）    | `phase-4-test-creation.md`                                                      | 依存する前提成果物を確認する                          |
| ClaudeCliManager         | `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`                          | session / output / status 契約の実装起点を確認する    |
| ProcessManager           | `apps/desktop/src/main/claude-cli/ProcessManager.ts`                            | process lifecycle と abort / retry 実装起点を確認する |
| SessionManager           | `apps/desktop/src/main/claude-cli/SessionManager.ts`                            | transcript 保持と history 実装起点を確認する          |
| Claude CLI IPC           | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                               | invoke/on 経路と sender 制約の実装起点を確認する      |
| preload index / channels | `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/channels.ts`     | preload API と whitelist 更新箇所を確認する           |
| ExecutionEnvironment     | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx` | terminal surface UI の統合起点を確認する              |
| AgentSDKPage             | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                        | 画面導線と CTA 統合起点を確認する                     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                 | パス                                                                                            | 内容                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| workflow-ai-runtime-authmode-unification | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | Step-01 foundation 契約と terminal 伝搬先の正本                |
| ui-ux-settings                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                           | settings 3領域レビューと表示語彙整合の正本                     |
| interfaces-auth                          | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | capability 型契約（integratedRuntime / terminalSurface）の正本 |
| api-ipc-system                           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | runtime 解決経路と settings 反映 IPC 契約の正本                |
| interfaces-agent-sdk-ui                  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                  | terminal UI / execution environment の正本                     |
| interfaces-agent-sdk-integration         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md`         | Claude CLI / Agent SDK 統合の正本                              |
| interfaces-agent-sdk-history             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`             | transcript / history / replay 契約の正本                       |
| ui-ux-agent-execution                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                    | terminal execution UX と guidance 契約の正本                   |
| security-api-electron                    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                    | preload 公開面と renderer trust 境界の正本                     |
| security-electron-ipc                    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                    | IPC sender / error envelope / lifecycle の正本                 |
| arch-claude-cli                          | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                          | terminal session architecture の正本                           |
| architecture-overview                    | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                    | main / preload / renderer 責務分離の正本                       |
| task-workflow                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                            | 完了台帳と関連未タスクの正本                                   |
| lessons-learned                          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                          | 苦戦箇所と再利用手順の正本                                     |
| legacy-ordinal-family-register           | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | 旧 filename 互換管理の正本                                     |
| resource-map                             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                | 必要仕様の抽出順を確認する                                     |
| quick-reference                          | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                             | 検索キーワードと読込順を確認する                               |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Claude Code terminal surface と手動操作境界の整流 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

実装 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

launch、session、output stream、abort、retry、history、manual share、`no auto-send` 境界の接続点を実装計画へ反映する。

## 成果物

| 成果物   | パス                                     | 内容                         |
| -------- | ---------------------------------------- | ---------------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 実装順序と変更対象を整理する |

## 完了条件

- [ ] main / preload / renderer の責務境界と実装順序が定義されている
- [ ] `no auto-send` と credential 非中継の実装方針が明記されている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
