# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 13                                              |
| Phase名    | PR作成                                          |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 1-12                                      |
| 後続Phase  | なし                                            |
| ステータス | blocked                                         |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

ユーザーの明示指示があった場合のみ PR 情報を整理する。現時点では実行しない。

## 実行タスク

- PR summary の下書き準備
- reviewer 観点の整理
- blocked 理由の明示

## 参照資料

| 参照資料           | パス                           | 内容         |
| ------------------ | ------------------------------ | ------------ |
| 依存Phase          | Phase 1-12                     | 前提成果物   |
| task 要件          | `phase-1-requirements.md`      | 受入基準定義 |
| task 設計          | `phase-2-design.md`            | 設計成果物   |
| task 実装計画      | `phase-5-implementation.md`    | 実装成果物   |
| task 回帰拡張      | `phase-6-test-expansion.md`    | テスト拡充   |
| task coverage      | `phase-7-coverage-check.md`    | カバレッジ   |
| task 整理方針      | `phase-8-refactoring.md`       | リファクタ   |
| task 品質確認      | `phase-9-quality-assurance.md` | 品質検証     |
| task 最終判定      | `phase-10-final-review.md`     | 最終判定結果 |
| task manual test   | `phase-11-manual-test.md`      | 手動テスト   |
| task documentation | `phase-12-documentation.md`    | ドキュメント |

## 実行手順

### ステップ1: Phase 12 完了根拠を確認する

全成果物の存在と artifacts.json の整合を検証する。

### ステップ2: PR summary の下書きを準備する

変更サマリー、テスト計画、レビュー観点を整理する（ユーザー承認待ち）。

## タスク完了処理【必須】

PR作成・マージ後に以下を実施する:

1. タスク仕様書を `docs/30-workflows/completed-tasks/` に移動
2. task-workflow.md のステータスを更新
3. GitHub Issue を Close

## 統合テスト連携

PR提出前のローカルチェック結果を記録。

## 多角的チェック観点

- Phase 12 全成果物の存在確認
- artifacts.json との整合確認
- PR summary の completeness（Summary / Test Plan / Reviewer 観点）
- blocked 状態の明示

## サブタスク管理

| サブタスク            | 担当 | ステータス |
| --------------------- | ---- | ---------- |
| PR summary 下書き準備 | -    | -          |
| reviewer 観点の整理   | -    | -          |
| blocked 理由の明示    | -    | -          |

## 成果物

| 成果物     | パス                                 | 説明           |
| ---------- | ------------------------------------ | -------------- |
| PR準備メモ | `outputs/phase-13/pr-preparation.md` | 将来用の下書き |

## 完了条件

- [ ] ユーザー明示指示なしでは PR を作成しないと明記している
- [ ] commit / push / PR が blocked のままである
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認

- [ ] PR summary 下書き準備完了
- [ ] reviewer 観点の整理完了
- [ ] blocked 理由の明示完了

## 次のPhase

- なし（最終Phase）
