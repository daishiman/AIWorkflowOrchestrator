# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 6                                          |
| 機能名   | task-exec-scope-definition-path-update-001 |
| 作成日   | 2026-03-27                                 |
| タスクID | UT-EXEC-01                                 |

## 目的

想定外の path drift や duplicate source による再発を、docs-only 観点の回帰ケースへ拡張する。

## 実行タスク

- stale path 参照の再発ケースを定義する
- duplicate source が残っていても target patch が一意に決まるか確認する
- grep / diff の repeated execution を想定した再現性メモを残す

## 参照資料

| 資料名             | パス                                         | 説明             |
| ------------------ | -------------------------------------------- | ---------------- |
| Phase 4            | `phase-4-test-creation.md`                   | baseline command |
| status drift cases | `outputs/phase-4/status-drift-checkcases.md` | 拡張元           |
| file change plan   | `outputs/phase-5/file-change-plan.md`        | patch 対象の固定 |

## 成果物

| 成果物                    | パス                                           | 説明               |
| ------------------------- | ---------------------------------------------- | ------------------ |
| regression expansion plan | `outputs/phase-6/regression-expansion-plan.md` | 回帰観点           |
| blocker handling cases    | `outputs/phase-6/blocker-handling-cases.md`    | false blocker 対応 |
| repeatability notes       | `outputs/phase-6/repeatability-notes.md`       | 再実行メモ         |

## 統合テスト連携

- command が 2 回目以降でも同じ判定になることを確認する観点を追加する。

## 完了条件

- [ ] stale path / duplicate source / repeated run の 3 観点がある
- [ ] **本Phase内の全タスクを100%実行完了**
