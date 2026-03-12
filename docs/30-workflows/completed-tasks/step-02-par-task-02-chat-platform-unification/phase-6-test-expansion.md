# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 6                                                        |
| Phase名    | テスト拡充                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 機能名     | chat-platform-unification                                |
| 前提Phase  | [phase-5-implementation.md](./phase-5-implementation.md) |
| 後続Phase  | [phase-7-coverage-check.md](./phase-7-coverage-check.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-11                                               |

## 目的

ストリーミング中断、履歴再開、文脈差し替え、Task03 handoff failure、forbidden boundary の境界ケースを検証する。

## 実行タスク

- Task 6-1: abort / retry のテストを追加する
- Task 6-2: 履歴復元テストを追加する
- Task 6-3: mode 切替時の状態リセット / 保持テストを追加する
- Task 6-4: Workspace 文脈複数ファイルの境界ケースを追加する
- Task 6-5: Task03 handoff failure / forbidden boundary テストを追加する

## 参照資料

| 参照資料                 | パス                                         | 内容            |
| ------------------------ | -------------------------------------------- | --------------- |
| 実装ログ                 | `outputs/phase-5/implementation-log.md`      | 実装差分        |
| 変更ファイルマトリクス   | `outputs/phase-5/change-file-matrix.md`      | テスト対象      |
| 契約テストチェックリスト | `outputs/phase-4/contract-test-checklist.md` | downstream 契約 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                    |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| llm-streaming           | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`           | abort / done / partial  |
| interfaces-chat-history | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | session / resume        |
| llm-workspace-chat-edit | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | workspacePath / context |
| security-electron-ipc   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | timeout / cancel 安全性 |

## 実行手順

1. Phase 5 実装差分に対して failure / edge case を洗い出す。
2. abort / retry / resume / adapter leak を優先して追加する。
3. Task03 へ渡す public contract が失敗時も保たれることを検証する。

## 統合テスト連携

| 観点              | 連携内容                                                        |
| ----------------- | --------------------------------------------------------------- |
| stream failure    | abort / retry / timeout を統合テストと state テストの両方で検証 |
| history recovery  | resume / reopen / mode switch の再開条件を検証する              |
| context boundary  | workspace 複数ファイル / no-context / stale-context を比較する  |
| downstream safety | Task03 が誤った mode / state を受け取らないことを検証する       |

## 成果物

| 成果物                     | パス                                          | 説明                      |
| -------------------------- | --------------------------------------------- | ------------------------- |
| 境界ケーステストマトリクス | `outputs/phase-6/edge-case-test-matrix.md`    | failure / edge case 一覧  |
| 回帰ケース一覧             | `outputs/phase-6/regression-case-matrix.md`   | 過去回帰防止              |
| Task03 failure 契約一覧    | `outputs/phase-6/task03-failure-contracts.md` | downstream failure ケース |

## 完了条件

- [x] 境界ケースが網羅されている
- [x] Task03 連携に必要な失敗系テストがある
- [x] abort / retry / resume / context boundary が検証されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-5-implementation.md](./phase-5-implementation.md)
- 後続: [phase-7-coverage-check.md](./phase-7-coverage-check.md)

## サブタスク管理

- [x] 実装差分確認
- [x] edge case 洗い出し
- [x] failure テスト追加
- [x] regression matrix 作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] Task03 failure 契約が成果物化されている
- [x] stream / history / context の境界ケースが揃っている

## 次のPhase

Phase 7: [phase-7-coverage-check.md](./phase-7-coverage-check.md)
