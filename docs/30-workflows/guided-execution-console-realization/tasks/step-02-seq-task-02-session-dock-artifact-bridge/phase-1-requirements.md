# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| Phase名    | 要件定義                                  |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | なし                                      |
| 後続Phase  | Phase 2（設計）                           |
| ステータス | not_started                               |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

session dock、transcript persistence、artifact-first result、manual share の current gap と要件を定義する。

## 実行タスク

- state inventory
- persistence requirement 定義
- share / provenance requirement 定義
- artifact-first requirement 定義

## 参照資料

| 参照資料               | パス                                                                              | 内容                    |
| ---------------------- | --------------------------------------------------------------------------------- | ----------------------- |
| Task01 index           | `../step-01-seq-task-01-guided-execution-shell-foundation/index.md`               | 入口と先行前提          |
| root UX                | `docs/30-workflows/guided-execution-console-realization/ui-ux-realization.md`     | dock / share 契約       |
| agent execution core   | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md` | transcript / share      |
| unassigned persistence | `docs/30-workflows/unassigned-task/UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001.md`   | persistence GAP         |
| unassigned aborted     | `docs/30-workflows/unassigned-task/UT-TERMINAL-DOCK-ABORTED-STATE-001.md`         | aborted GAP             |
| preload                | `apps/desktop/src/preload/index.ts`                                               | session/output exposure |
| state slice            | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                            | handoff state 現状      |

## 実行手順

### ステップ1: P50チェック

```bash
rg -n "handoffGuidance|transcript|session|claudeCliAPI|PersistentTerminalLauncher|HandoffBlock" apps/desktop/src -S
git log --oneline -10 -- apps/desktop/src/preload/index.ts
```

### ステップ2: current state を棚卸しする

dock state、session ID、reopen 時挙動、artifact 表示順、manual share の current facts を記録する。

### ステップ3: AC を定義する

state、persistence、share、artifact の 4 観点で受入基準を明文化する。

## 統合テスト連携

open / close / reopen、share、artifact summary、aborted state の 4 観点を integration scope に含める。

## 成果物

| 成果物          | パス                                         | 説明                 |
| --------------- | -------------------------------------------- | -------------------- |
| 要件定義書      | `outputs/phase-1/requirements-definition.md` | Task02 の FR/NFR/AC  |
| スコープ定義    | `outputs/phase-1/scope-definition.md`        | 対象 / 非対象        |
| state inventory | `outputs/phase-1/state-inventory.md`         | current state と gap |

## 完了条件

- [ ] dock / persistence / share / artifact の 4 観点が棚卸しされている
- [ ] AC-1〜AC-4 が検証可能な文章で定義されている
- [ ] Task01 を先に見る前提が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md)
