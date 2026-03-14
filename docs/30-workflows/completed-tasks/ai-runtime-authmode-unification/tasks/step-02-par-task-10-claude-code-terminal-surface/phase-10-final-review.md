# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 10                                                                                                                                                        |
| Phase名    | 最終レビュー                                                                                                                                              |
| タスクID   | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001                                                                                                                 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証） |
| 後続Phase  | Phase 11（手動テスト）                                                                                                                                    |
| ステータス | not_started                                                                                                                                               |
| 作成日     | 2026-03-13                                                                                                                                                |
| 機能名     | claude-code-terminal-surface                                                                                                                              |

## 目的

Claude Code terminal surface と手動操作境界の整流が release 可否判定に必要な gate を満たすか最終レビューする。

## 実行タスク

- 最終レビュー実施: release blocker と戻り先を判断する
- 判定根拠整理: PASS / MINOR / MAJOR / CRITICAL の判断根拠をレビュー報告へ記録する
- 戻り先固定: 問題種別ごとの戻り先（Phase 1/2/4/5/8）を明記する

## レビュー観点

- `copy only / no auto-send`、credential 非中継、hidden prompt injection 禁止が実装計画・テスト計画で担保されているか
- launch / session / transcript / abort / retry / history / large output の責務分離が崩れていないか
- CLI unavailable guidance と manual transcript share の UI 契約が矛盾していないか
- Step-01 foundation 契約（capability / settings review）と矛盾しないか

## レビューゲート

最終レビュー の判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定     | 条件                         | 次のアクション             |
| -------- | ---------------------------- | -------------------------- |
| PASS     | 重大な問題がない             | Phase 11 に進む            |
| MINOR    | 軽微な指摘がある             | 指摘を記録して次へ進む     |
| MAJOR    | 戻り先が必要な問題がある     | 下表の戻り先へ戻す         |
| CRITICAL | 要件再確認が必要な問題がある | Phase 1 へ戻して再確認する |

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 1（要件定義）         |
| 設計の問題       | Phase 2（設計）             |
| テスト設計の問題 | Phase 4（テスト作成）       |
| 実装の問題       | Phase 5（実装）             |
| 品質の問題       | Phase 8（リファクタリング） |

## 参照資料

| 参照資料                    | パス                                                                            | 内容                                                 |
| --------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                       | 依存する前提成果物を確認する                         |
| Phase 2（設計）             | `phase-2-design.md`                                                             | 依存する前提成果物を確認する                         |
| Phase 5（実装）             | `phase-5-implementation.md`                                                     | 依存する前提成果物を確認する                         |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                                     | 依存する前提成果物を確認する                         |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                                     | 依存する前提成果物を確認する                         |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                        | 依存する前提成果物を確認する                         |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                                  | 依存する前提成果物を確認する                         |
| ClaudeCliManager            | `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`                          | session / output / status 契約の最終確認を行う       |
| ProcessManager              | `apps/desktop/src/main/claude-cli/ProcessManager.ts`                            | abort / retry / lifecycle 実装の最終確認を行う       |
| SessionManager              | `apps/desktop/src/main/claude-cli/SessionManager.ts`                            | transcript / history / replay 実装の最終確認を行う   |
| Claude CLI IPC              | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                               | invoke/on channel と error envelope の最終確認を行う |
| preload index / channels    | `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/channels.ts`     | preload API と whitelist の最終確認を行う            |
| ExecutionEnvironment        | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx` | terminal surface UI の最終確認を行う                 |
| AgentSDKPage                | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                        | launcher 導線の最終確認を行う                        |

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
| ui-ux-feature-components                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | terminal panel / execution surface の正本                      |
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

最終レビュー の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

launch、session、output stream、abort、retry、history、manual share、`no auto-send` 境界の release 可否を最終レビューする。

## 成果物

| 成果物           | パス                                      | 内容                               |
| ---------------- | ----------------------------------------- | ---------------------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md` | release blocker と戻り先を整理する |

## 完了条件

- [ ] release blocker 0 件、または戻り先付きで MAJOR / CRITICAL を記録している
- [ ] 判定根拠（PASS / MINOR / MAJOR / CRITICAL）と戻り先が成果物に明記されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] レビュー観点4項目の判定結果を記録
- [ ] 判定結果に応じた戻り先を明示
- [ ] 次Phase（手動テスト）の開始条件を明記

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md) に進む
