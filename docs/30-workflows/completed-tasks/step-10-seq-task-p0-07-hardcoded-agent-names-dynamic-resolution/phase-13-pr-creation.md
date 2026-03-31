# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 13                                                  |
| Phase名    | PR作成                                              |
| 対象機能   | TASK-P0-07 hardcoded-agent-names-dynamic-resolution |
| 前提Phase  | Phase 12: ドキュメント更新                          |
| 次Phase    | -                                                   |
| ステータス | blocked                                             |
| 作成日     | 2026-03-29                                          |
| 更新日     | 2026-03-30                                          |

## 目的

ユーザーの明示承認がある場合のみ change summary と local check をまとめる準備を行う。現時点では commit / push / PR は実行せず、blocked を維持する。

## 実行タスク

### Task 1: blocked 理由を記録する

- commit / push / PR を行わない理由を明記する
- ユーザー承認が来るまで blocked を維持する

### Task 2: 変更要約を準備する

- 変更点を整理する
  - 参照正本の修正
  - skill 準拠の強化
  - Phase 12 の必須成果物の補強
  - broken link と path drift の修正
- validator 結果を集約する
- 残リスクを整理する

### Task 3: 実行条件を確認する

- ユーザー承認がない限り commit / push / PR を実行しない
- TASK-P0-03 / TASK-P0-04 の前提が揃っているかを確認する
- ローカルチェックの結果が揃っているかを確認する

## 参照資料

| 資料名               | パス                                       | 説明          |
| -------------------- | ------------------------------------------ | ------------- |
| 設計書               | `outputs/phase-2/design-document.md`       | 背景要約      |
| 実装記録             | `outputs/phase-5/implementation-record.md` | 修正内容      |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md`  | テスト差分    |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`       | coverage 要約 |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`    | 整理内容      |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`        | 品質ゲート    |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`  | 判定          |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`   | evidence 状態 |
| ドキュメント更新     | `phase-12-documentation.md`                | 直前成果物    |
| ローカルチェック     | `outputs/phase-13/local-check-result.md`   | 実行時に更新  |

## 成果物

| 成果物               | パス                                     | 説明          |
| -------------------- | ---------------------------------------- | ------------- |
| 変更サマリ           | `outputs/phase-13/change-summary.md`     | PR 説明の素案 |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | 実行ログ要約  |
| blocked 記録         | `outputs/phase-13/blocked-reason.md`     | PR 保留理由   |

## 完了条件

- [ ] ユーザー承認の有無が明記されている
- [ ] blocked 条件が明記されている
- [ ] commit / push / PR を未実行であることが記録されている
- [ ] 承認後に必要な成果物が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

- blocked: ユーザー承認待ち
