# Phase 13: PR作成

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 13                                                            |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

Task03 の差分をレビューしやすい単位で整理し、依存タスク、主要変更、テスト結果、手動検証結果を追跡できる PR 情報を準備する。

## 実行タスク

- PR 要約作成: 単一セッション導線化の変更点を要約する
- 依存関係整理: Task01 / Task02 と Task03 の関係を明記する
- テスト結果整理: 自動テストと手動テストの結果を要約する
- レビュー観点整理: wizard 縮退、内部エンジン境界、UI 回帰の観点を明記する

## 参照資料

| 資料名                       | パス                                          | 説明                        |
| ---------------------------- | --------------------------------------------- | --------------------------- |
| Phase 2 設計                 | `outputs/phase-2/architecture-design.md`      | 設計の追跡元                |
| Phase 5 実装記録             | `outputs/phase-5/implementation-summary.md`   | 主要変更点                  |
| Phase 6 テスト拡充結果       | `outputs/phase-6/test-expansion-report.md`    | failure coverage と回復戦略 |
| Phase 7 カバレッジレポート   | `outputs/phase-7/coverage-report.md`          | task scope coverage         |
| Phase 8 リファクタリング記録 | `outputs/phase-8/refactoring-log.md`          | 整理した責務境界            |
| Phase 9 品質保証レポート     | `outputs/phase-9/quality-assurance-report.md` | 品質ゲート結果              |
| Phase 10 最終レビュー結果    | `outputs/phase-10/final-review-report.md`     | 承認判定                    |
| Phase 11 手動テスト結果      | `outputs/phase-11/manual-test-result.md`      | 手動検証の要約元            |
| Phase 12 仕様更新要約        | `outputs/phase-12/spec-update-summary.md`     | ドキュメント変更点          |

## 実行手順

### ステップ1: 変更要約を整理する

UI、state、API、wizard、documentation の変更点をレビュー単位へまとめる。

### ステップ2: 検証結果を整理する

自動テスト、カバレッジ確認、手動テスト、視覚レビューの結果を要約する。

### ステップ3: レビュー観点を明文化する

PR で重点確認すべきポイントを列挙し、依存タスクとの関係を追跡可能にする。

## 成果物

| 成果物  | パス                             | 説明          |
| ------- | -------------------------------- | ------------- |
| PR 情報 | `outputs/phase-13/pr-summary.md` | PR 本文の素案 |

## 完了条件

- [ ] 依存 Task01 / Task02 との関係が追跡できる
- [ ] 主要変更点と検証結果が要約されている
- [ ] レビュー観点が明文化されている
