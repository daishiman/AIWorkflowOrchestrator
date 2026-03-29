# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 13                                               |
| Phase名    | PR作成                                           |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 12: ドキュメント更新                       |
| 次Phase    | -                                                |
| ステータス | blocked                                          |
| 作成日     | 2026-03-29                                       |

## 目的

ユーザー承認がある場合のみ change summary と local check をまとめる。現時点では blocked を維持する。

## 実行タスク

### Task 1: 変更要約準備

- 変更点を整理する:
  - `recordVerifyPass()` の追加
  - improve→verify 遷移の追加
  - phase 遷移テーブルの修正
  - Facade / IPC handler の更新
  - UI snapshot の verify 状態反映
- validator 結果を記録する
- 残リスク（P0-01 依存、verification engine 未統合時のフォールバック）を記録する

### Task 2: PR 実行条件の確認

- ユーザー承認がない限り commit / push / PR を実行しない
- TASK-P0-01 の完了状況を PR 前提条件として記録する

## 参照資料

| 資料名               | パス                                       | 説明          |
| -------------------- | ------------------------------------------ | ------------- |
| 設計成果物           | `outputs/phase-2/design-document.md`       | 背景要約      |
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

## 完了条件

- [ ] ユーザー承認の有無が明記されている
- [ ] blocked 条件が明記されている
- [ ] commit / push / PR を未実行であることが記録されている
- [ ] TASK-P0-01 の依存状況が記録されている
- [ ] 承認後に必要な成果物が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

- blocked: ユーザー承認待ち
