# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 7                                          |
| 機能名   | task-exec-scope-definition-path-update-001 |
| 作成日   | 2026-03-27                                 |
| タスクID | UT-EXEC-01                                 |

## 目的

AC と evidence が 1:1 で対応していることを確認し、docs-only task の coverage を可視化する。

## 実行タスク

- AC coverage を可視化する
- evidence traceability を整理する
- scope 外に残すリスクを明記する

## 参照資料

| 資料名                   | パス                                          | 説明            |
| ------------------------ | --------------------------------------------- | --------------- |
| Phase 1                  | `phase-1-requirements.md`                     | AC              |
| update surface checklist | `outputs/phase-5/update-surface-checklist.md` | no-op 境界      |
| Phase 6                  | `phase-6-test-expansion.md`                   | regression 観点 |

## 成果物

| 成果物                | パス                                       | 説明            |
| --------------------- | ------------------------------------------ | --------------- |
| coverage matrix       | `outputs/phase-7/coverage-matrix.md`       | AC coverage     |
| evidence traceability | `outputs/phase-7/evidence-traceability.md` | evidence 対応表 |
| uncovered risks       | `outputs/phase-7/uncovered-risks.md`       | scope 外リスク  |

## 統合テスト連携

- AC-1 から AC-4 まで未割当が 0 件であることを completion condition とする。

## 完了条件

- [ ] AC coverage が 100% である
- [ ] uncovered risk が scope 外として整理されている
- [ ] **本Phase内の全タスクを100%実行完了**
