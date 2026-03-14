# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 11                                                                                                                                                                                  |
| Phase名    | 手動テスト                                                                                                                                                                          |
| タスクID   | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001                                                                                                                                           |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー） |
| 後続Phase  | Phase 12（ドキュメント）                                                                                                                                                            |
| ステータス | not_started                                                                                                                                                                         |
| 作成日     | 2026-03-13                                                                                                                                                                          |
| 機能名     | claude-code-terminal-surface                                                                                                                                                        |

## 目的

Claude Code terminal surface と手動操作境界の整流 の代表シナリオを手動で確認する。

## 実行タスク

- terminal 起動確認: working directory 付き terminal を開き、ユーザーが `claude` を手動実行できることを確認する
- transcript / control 確認: stdout / stderr 出力、abort、retry、history 再表示を確認する
- unavailable 状態確認: CLI 未インストール時の guidance と copy command の扱いを確認する
- 操作境界確認: suggested command が自動送信されず、ユーザー操作だけで実行されることを確認する
- 常設導線確認: app shell からいつでも同じ `Terminal` ボタンで dock を開けることを確認する
- transcript 共有確認: terminal transcript を選択して chat へ手動共有できることを確認する

## テストケース

| テストケース | 目的                              | 期待結果                                                                           |
| ------------ | --------------------------------- | ---------------------------------------------------------------------------------- |
| TC-11-01     | terminal 起動と手動 `claude` 実行 | working directory が正しく反映され、手動入力したコマンドの transcript が表示される |
| TC-11-02     | transcript control                | abort、retry、history 再表示が UI 契約通りに動く                                   |
| TC-11-03     | CLI 未インストール                | unavailable guidance と install 導線が表示され、自動送信は行われない               |
| TC-11-04     | no auto-send                      | suggested command と context copy は提示されるが、実行はユーザー操作に限定される   |
| TC-11-05     | persistent launcher               | app shell と panel から同じ terminal 導線で開ける                                  |
| TC-11-06     | manual transcript share           | transcript を手動で chat へ共有でき、自動共有は起きない                            |

## 画面カバレッジマトリクス

| テストケース | 対象画面                     | 状態                        | 証跡計画                                   |
| ------------ | ---------------------------- | --------------------------- | ------------------------------------------ |
| TC-11-01     | Terminal Surface             | claude transcript visible   | TC-11-01-terminal-claude-transcript.png    |
| TC-11-02     | Terminal Surface             | abort retry history         | TC-11-02-terminal-controls.png             |
| TC-11-03     | Terminal Surface / Settings  | cli unavailable             | TC-11-03-terminal-unavailable-guidance.png |
| TC-11-04     | Terminal Surface             | no auto-send handoff        | TC-11-04-terminal-no-auto-send.png         |
| TC-11-05     | App Shell / Terminal Surface | persistent launcher visible | TC-11-05-terminal-persistent-launcher.png  |
| TC-11-06     | Terminal Surface / Chat      | transcript manual share     | TC-11-06-terminal-manual-share.png         |

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
| ClaudeCliManager            | `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`                          | current facade / session API を確認する                       |
| ProcessManager              | `apps/desktop/src/main/claude-cli/ProcessManager.ts`                            | process lifecycle と terminal transport 候補を確認する        |
| ExecutionEnvironment        | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx` | terminal placeholder と environment selector の現状を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                 | パス                                                                                            | 内容                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| workflow-ai-runtime-authmode-unification | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | Step-01 foundation 契約と terminal 伝搬先の正本                |
| ui-ux-settings                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                           | settings 3領域レビューと表示語彙整合の正本                     |
| interfaces-auth                          | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | capability 型契約（integratedRuntime / terminalSurface）の正本 |
| api-ipc-system                           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | runtime 解決経路と settings 反映 IPC 契約の正本                |
| interfaces-agent-sdk-ui                  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                  | terminal UI と execution environment の正本                    |
| interfaces-agent-sdk-history             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`             | terminal history / transcript の正本                           |
| ui-ux-agent-execution                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                    | terminal execution UX の正本                                   |
| security-api-electron                    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                    | preload / terminal renderer security の正本                    |
| arch-claude-cli                          | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                          | Claude Code terminal / session / preload architecture の正本   |
| task-workflow                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                            | 完了台帳と関連未タスクの正本                                   |
| lessons-learned                          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                          | 苦戦箇所と再利用手順の正本                                     |
| legacy-ordinal-family-register           | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | 旧 filename 互換管理の正本                                     |
| resource-map                             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                | 必要仕様の抽出順を確認する                                     |
| quick-reference                          | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                             | 検索キーワードと読込順を確認する                               |
| pack UI/UX 正本                          | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                        | terminal surface の screenshot 契約と状態を確認する            |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Claude Code terminal surface と手動操作境界の整流 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

手動テスト の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

launch、transcript、abort、retry、history、CLI unavailable、`no auto-send` の代表シナリオを手動で確認する。

## 成果物

| 成果物         | パス                                     | 内容                                    |
| -------------- | ---------------------------------------- | --------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 代表シナリオの結果を記録する            |
| 撮影計画       | `outputs/phase-11/screenshot-plan.json`  | 代表画面の撮影対象と TC-ID を整理する   |
| 発見課題       | `outputs/phase-11/discovered-issues.md`  | blocker / note / 未タスク候補を整理する |

## 完了条件

- [ ] 代表シナリオが PASS している
- [ ] transcript / unavailable / no auto-send の 3 観点が screenshot 証跡に残っている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
