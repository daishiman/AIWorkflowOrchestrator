# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 8                                          |
| 機能名   | task-exec-scope-definition-path-update-001 |
| 作成日   | 2026-03-27                                 |
| タスクID | UT-EXEC-01                                 |

## 目的

docs-only task の wording とリンク導線を簡潔に保ち、余計な wider sync を防ぐ。

## 実行タスク

- wording を current facts に揃える
- duplicate source の扱いを 1 箇所に集約する
- stale root path を実行本文から排除する

## 参照資料

| 資料名               | パス                                           | 説明                 |
| -------------------- | ---------------------------------------------- | -------------------- |
| Phase 1 scope        | `outputs/phase-1/scope-definition.md`          | 守るべき scope 境界  |
| Phase 2              | `phase-2-design.md`                            | target path decision |
| file change plan     | `outputs/phase-5/file-change-plan.md`          | 実変更面の固定       |
| regression expansion | `outputs/phase-6/regression-expansion-plan.md` | 再発防止観点         |
| Phase 7              | `phase-7-coverage-check.md`                    | scope 外リスク       |

## 成果物

| 成果物                | パス                                       | 説明                    |
| --------------------- | ------------------------------------------ | ----------------------- |
| wording normalization | `outputs/phase-8/wording-normalization.md` | 用語統一                |
| duplication review    | `outputs/phase-8/duplication-review.md`    | duplicate source 取扱い |
| link cleanup          | `outputs/phase-8/link-cleanup.md`          | stale link 排除方針     |

## 統合テスト連携

- refactor 後も actual target path が 1 つだけ見えることを重視する。

## 完了条件

- [ ] stale root path が実行本文から排除されている
- [ ] duplicate source の説明が 1 箇所に集約されている
- [ ] **本Phase内の全タスクを100%実行完了**
