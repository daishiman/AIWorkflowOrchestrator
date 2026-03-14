# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 3                                         |
| Phase名    | 設計レビュー                              |
| タスクID   | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）      |
| 後続Phase  | Phase 4（テスト作成）                     |
| ステータス | not_started                               |
| 作成日     | 2026-03-13                                |
| 機能名     | claude-code-terminal-surface              |

## 目的

Claude Code terminal surface と手動操作境界の整流に関する設計が、実装前ゲートを満たすか確認する。

## 実行タスク

- レビュー実施: レビュー観点に沿って PASS、MINOR、MAJOR の判定根拠を整理する

## レビュー観点

- `copy only / no auto-send`、credential 非中継、hidden prompt injection 禁止が設計に明記されているか
- launch / session / transcript / abort / retry / history / large output の責務分離が明確か
- CLI unavailable 時の guidance と fallback 経路が定義されているか
- Step-01 foundation 契約（capability / settings review）と矛盾しないか

## レビューゲート

設計レビュー の判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定  | 条件                     | 次のアクション         |
| ----- | ------------------------ | ---------------------- |
| PASS  | 重大な問題がない         | Phase 4 に進む         |
| MINOR | 軽微な指摘がある         | 指摘を記録して次へ進む |
| MAJOR | 戻り先が必要な問題がある | 下表の戻り先へ戻す     |

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

## 参照資料

| 参照資料                 | パス                                                                            | 内容                                                         |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Phase 1（要件定義）      | `phase-1-requirements.md`                                                       | 依存する前提成果物を確認する                                 |
| Phase 2（設計）          | `phase-2-design.md`                                                             | 依存する前提成果物を確認する                                 |
| ClaudeCliManager         | `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`                          | session / output / status 契約の設計前提を確認する           |
| ProcessManager           | `apps/desktop/src/main/claude-cli/ProcessManager.ts`                            | process lifecycle と terminal transport の設計前提を確認する |
| SessionManager           | `apps/desktop/src/main/claude-cli/SessionManager.ts`                            | transcript 保持と history 表示の設計前提を確認する           |
| Claude CLI IPC           | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                               | invoke/on 経路と sender 制約の設計前提を確認する             |
| preload index / channels | `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/channels.ts`     | preload API と channel whitelist の設計前提を確認する        |
| ExecutionEnvironment     | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx` | terminal surface 統合位置の設計前提を確認する                |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                 | パス                                                                                            | 内容                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| workflow-ai-runtime-authmode-unification | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | Step-01 foundation 契約と terminal 伝搬条件の正本              |
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

設計レビュー の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                              | 仕様参照先                                               |
| -------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| セキュリティ   | manual boundary の妥当性判定に必須                    | `security-api-electron.md`, `security-electron-ipc.md`   |
| UI/UX          | launch / transcript / unavailable guidance 判定に必須 | `interfaces-agent-sdk-ui.md`, `ui-ux-agent-execution.md` |
| アーキテクチャ | main/preload/renderer 責務分離判定に必須              | `arch-claude-cli.md`, `architecture-overview.md`         |
| API/IPC        | channel / error envelope 判定に必須                   | `security-electron-ipc.md`                               |
| パフォーマンス | large output / replay 判定に必須                      | `interfaces-agent-sdk-history.md`                        |

## サブタスク管理

- [ ] 参照資料とシステム仕様を確認する
- [ ] レビュー観点4項目を判定する
- [ ] PASS/MINOR/MAJOR 判定と戻り先を記録する
- [ ] 成果物と完了条件を確認する

## 統合テスト連携

launch、session、output stream、abort、retry、history、large output、`no auto-send` 境界の設計整合をレビューする。

## 成果物

| 成果物           | パス                                      | 内容                                    |
| ---------------- | ----------------------------------------- | --------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | PASS、MINOR、MAJOR の判定根拠を記録する |

## 完了条件

- [ ] MAJOR 指摘 0 件
- [ ] Phase 4 のテスト設計に必要な戻り先判定と是正項目が明記されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] レビュー観点4項目の判定結果を記録
- [ ] 判定結果に応じた戻り先を明示
- [ ] 次Phaseの開始条件を明記

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む
