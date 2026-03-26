# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 1                                               |
| Phase名    | 要件定義                                        |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | なし                                            |
| 後続Phase  | Phase 2（設計）                                 |
| ステータス | completed                                       |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

approval、AI 開示、外部送信開示、manual boundary、advanced console の要件を定義する。

## 実行タスク

- compliance baseline 定義
- approval requirement 定義
- disclosure requirement 定義
- advanced console exposure rule 定義

## 参照資料

| 参照資料         | パス                                                                              | 内容             |
| ---------------- | --------------------------------------------------------------------------------- | ---------------- |
| Task01 index     | `../step-01-seq-task-01-guided-execution-shell-foundation/index.md`               | front shell 前提 |
| Task02 index     | `../step-02-seq-task-02-session-dock-artifact-bridge/index.md`                    | session 前提     |
| root UX          | `docs/30-workflows/guided-execution-console-realization/ui-ux-realization.md`     | safety ルール    |
| security core    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | secret 非露出    |
| Usage Policy     | `https://www.anthropic.com/legal/aup`                                             | acceptable use   |
| Commercial Terms | `https://www.anthropic.com/legal/commercial-terms`                                | commercial terms |
| Data usage       | `https://code.claude.com/docs/en/data-usage`                                      | data handling    |
| Permissions      | `https://platform.claude.com/docs/en/agent-sdk/permissions`                       | approval         |

## 実行手順

### ステップ1: compliance baseline を定義する

AI 開示、外部送信開示、consumer auth 非流用、manual boundary を baseline として明文化する。

### ステップ2: P50チェック

```bash
rg -n "terminal.open|handoff|terminal_handoff|bypassPermissions|openTerminal" apps/desktop/src -S
git log --oneline -10 -- apps/desktop/src/main/ipc/terminalHandlers.ts
```

### ステップ3: AC を定義する

approval、disclosure、manual boundary、advanced console exposure の 4 観点で受入基準を定義する。

## 統合テスト連携

approval の有無、disclosure 表示、auto-send 不在、advanced console opt-in の 4 観点を integration scope に含める。

## 成果物

| 成果物              | パス                                         | 説明               |
| ------------------- | -------------------------------------------- | ------------------ |
| 要件定義書          | `outputs/phase-1/requirements-definition.md` | FR/NFR/AC          |
| スコープ定義        | `outputs/phase-1/scope-definition.md`        | 対象 / 非対象      |
| compliance baseline | `outputs/phase-1/compliance-baseline.md`     | 規約前提と禁止事項 |

## 多角的チェック観点（AIが判断）

- compliance / security / UX の3観点でクロスチェック実施

## サブタスク管理

本Phaseの全サブタスクは完了済み。

## タスク100%実行確認【必須】

- [x] 全実行タスクを100%完了した
- [x] 成果物が全て `outputs/phase-1/` に存在する
- [x] 完了条件を全て満たした

## 完了条件

- [ ] compliance baseline が明文化されている
- [ ] AC-1〜AC-4 が検証可能な文章で定義されている
- [ ] consumer auth 非流用が禁止事項として明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md)
