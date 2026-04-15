# Phase 13: PR作成

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 対象機能   | TASK-SW-FIX-STATE-DETAIL-001 |
| 前提Phase  | Phase 12: ドキュメント更新   |
| 次Phase    | -                            |
| ステータス | skipped / blocked            |
| 作成日     | 2026-04-12                   |

## 目的

ユーザー承認がある場合のみchange summaryとlocal checkをまとめ、
PRを作成する。今回はユーザー指示により PR / push / commit を行わない。

## 実行タスク

### Task 1: 変更要約準備

- 4件のバグ修正（問題12・13・18・19）の変更点をまとめる
- 修正した3ファイルの変更概要を記載する
- validator結果・テスト結果・残リスクを整理する

### Task 2: PR実行条件の確認

- ユーザー承認がない限りcommit / push / PRを実行しない
- Wave C（TASK-SW-FIX-UI-001との並列完了）を確認してからPRをまとめるか、個別にPRを作成するかをユーザーと確認する
- 現時点ではユーザー指示により blocked 扱いとする

## 参照資料

| 資料名               | パス                                             | 説明               |
| -------------------- | ------------------------------------------------ | ------------------ |
| 設計書               | `outputs/phase-2/design-document.md`             | 背景要約           |
| 実装記録             | `outputs/phase-5/implementation-record.md`       | 修正内容           |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md`        | テスト差分         |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`             | coverage要約       |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`          | 整理内容           |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`              | 品質ゲート         |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`        | 判定               |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`         | evidence状態       |
| 手動テストレポート   | `outputs/phase-11/manual-test-report.md`         | 実施概要           |
| 発見課題一覧         | `outputs/phase-11/discovered-issues.md`          | blocker / note     |
| 視覚レビュー         | `outputs/phase-11/ui-sanity-visual-review.md`    | UI/UX 所見         |
| 画面カバレッジ       | `outputs/phase-11/screenshot-coverage.md`        | 100% 判定          |
| capture メタデータ   | `outputs/phase-11/phase11-capture-metadata.json` | evidence inventory |
| ドキュメント更新     | `phase-12-documentation.md`                      | 直前成果物         |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md`         | 実行時に更新       |

## 成果物

| 成果物               | パス                                     | 説明         |
| -------------------- | ---------------------------------------- | ------------ |
| 変更サマリ           | `outputs/phase-13/change-summary.md`     | PR説明の素案 |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | 実行ログ要約 |

## 完了条件

- [x] ユーザー承認の有無が明記されている
- [x] blocked条件が明記されている
- [x] commit / push / PRを未実行であることが記録されている
- [x] 承認後に必要な成果物が定義されている
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

- blocked: ユーザー承認待ち
