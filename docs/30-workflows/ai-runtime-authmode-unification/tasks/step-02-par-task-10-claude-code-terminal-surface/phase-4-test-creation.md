# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 4                                                             |
| Phase名    | テスト作成                                                    |
| タスクID   | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001                     |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）                                               |
| ステータス | not_started                                                   |
| 作成日     | 2026-03-13                                                    |
| 機能名     | claude-code-terminal-surface                                  |

## 目的

Claude Code terminal surface と手動操作境界の整流 に必要な成功系、異常系、回帰系テストを定義する。

## 実行タスク

- launch テスト定義: install 済み / 未インストール、launch shell、open cwd、session 作成のテストを定義する
- transcript テスト定義: stdout / stderr、large output、history reload、status 更新のテストを定義する
- boundary テスト定義: `no auto-send`、abort、retry、concurrent sessions のテストを定義する

## 参照資料

| 参照資料                | パス                                                                            | 内容                                                          |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Phase 1（要件定義）     | `phase-1-requirements.md`                                                       | 依存する前提成果物を確認する                                  |
| Phase 2（設計）         | `phase-2-design.md`                                                             | 依存する前提成果物を確認する                                  |
| Phase 3（設計レビュー） | `phase-3-design-review.md`                                                      | 依存する前提成果物を確認する                                  |
| ClaudeCliManager        | `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`                          | current facade / session API を確認する                       |
| ProcessManager          | `apps/desktop/src/main/claude-cli/ProcessManager.ts`                            | process lifecycle と terminal transport 候補を確認する        |
| ExecutionEnvironment    | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx` | terminal placeholder と environment selector の現状を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                     | パス                                                                                | 内容                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| interfaces-agent-sdk-ui      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`      | terminal UI と execution environment の正本                  |
| interfaces-agent-sdk-history | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md` | terminal history / transcript の正本                         |
| security-api-electron        | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`        | preload / terminal renderer security の正本                  |
| security-electron-ipc        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`        | sender / error envelope / channel whitelist の正本           |
| arch-claude-cli              | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`              | Claude Code terminal / session / preload architecture の正本 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Claude Code terminal surface と手動操作境界の整流 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

テスト作成 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

launch、transcript、abort、retry、history、large output、concurrent sessions、`no auto-send` の成功系、異常系、回帰系テストを定義する。

## 成果物

| 成果物           | パス                             | 内容                               |
| ---------------- | -------------------------------- | ---------------------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | 成功系、異常系、回帰対象を整理する |

## 完了条件

- [ ] install / launch / transcript / boundary の主要成功系と異常系のテストが定義されている

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
