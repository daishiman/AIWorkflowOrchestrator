# Phase 13: PR作成

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 13                                         |
| 機能名   | task-exec-scope-definition-path-update-001 |
| 作成日   | 2026-03-27                                 |
| タスクID | UT-EXEC-01                                 |

## 目的

ユーザー明示指示がある場合のみ PR 準備へ進めるよう、blocked 状態のまま必要情報だけ整理する。

## 実行タスク

- local check result の記録先を残す
- change summary の記録先を残す
- commit / push / PR を自動実行しないと明記する

## 参照資料

| 資料名               | パス                                           | 説明                    |
| -------------------- | ---------------------------------------------- | ----------------------- |
| target path decision | `outputs/phase-2/target-path-decision.md`      | PR 要約時の対象固定     |
| file change plan     | `outputs/phase-5/file-change-plan.md`          | 変更ファイル一覧        |
| regression expansion | `outputs/phase-6/regression-expansion-plan.md` | 補足検証の要点          |
| coverage matrix      | `outputs/phase-7/coverage-matrix.md`           | AC coverage             |
| duplication review   | `outputs/phase-8/duplication-review.md`        | duplicate source の扱い |
| quality checklist    | `outputs/phase-9/quality-checklist.md`         | ローカル確認観点        |
| Phase 10             | `phase-10-final-review.md`                     | 最終判定                |
| manual test result   | `outputs/phase-11/manual-test-result.md`       | 人手確認の要約          |
| Phase 12             | `phase-12-documentation.md`                    | close-out               |

## 成果物

| 成果物             | パス                                     | 説明                |
| ------------------ | ---------------------------------------- | ------------------- |
| local check result | `outputs/phase-13/local-check-result.md` | ローカル確認結果    |
| change summary     | `outputs/phase-13/change-summary.md`     | PR 要約テンプレート |

## 完了条件

- [ ] blocked 条件が明記されている
- [ ] commit / push / PR を自動実行しない方針が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
