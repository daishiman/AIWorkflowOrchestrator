# Canonical Artifact List

## Phase 別 canonical 成果物一覧

| Phase | 成果物パス                                               | 用途                                        |
| ----- | -------------------------------------------------------- | ------------------------------------------- |
| 1     | `outputs/phase-1/requirements-definition.md`             | 要件定義                                    |
| 1     | `outputs/phase-1/method-inventory.md`                    | 実在4メソッド+仕様書前提5メソッド inventory |
| 1     | `outputs/phase-1/artifact-canonical-list.md`             | Phase 1-13 成果物一覧（本ファイル）         |
| 2     | `outputs/phase-2/solution-design.md`                     | ディレクトリ構造・クラス設計                |
| 2     | `outputs/phase-2/constructor-signature.md`               | `ChunkingService` コンストラクタ拡張方針    |
| 2     | `outputs/phase-2/validation-path.md`                     | SEP-01〜SEP-09 の mapping                   |
| 3     | `outputs/phase-3/design-review-result.md`                | 4 条件評価結果                              |
| 3     | `outputs/phase-3/solution-elegance-review.md`            | 30 思考法レビュー                           |
| 3     | `outputs/phase-3/review-prompt.txt`                      | レビュー実行プロンプト                      |
| 4     | `outputs/phase-4/test-scenarios.md`                      | SEP-01〜SEP-09 テストシナリオ               |
| 4     | `outputs/phase-4/command-expectations.md`                | `pnpm vitest` コマンド実行期待値            |
| 5     | `outputs/phase-5/implementation-diff-check.md`           | diff 確認                                   |
| 5     | `outputs/phase-5/patch-plan.md`                          | パッチ適用順序                              |
| 6     | `outputs/phase-6/regression-expansion-plan.md`           | 回帰拡充テスト計画                          |
| 7     | `outputs/phase-7/coverage-report.md`                     | `LateChunkingService` カバレッジ            |
| 8     | `outputs/phase-8/refactor-decision-log.md`               | リファクタリング決定ログ                    |
| 9     | `outputs/phase-9/quality-gate-report.md`                 | typecheck / lint / test 実行結果            |
| 10    | `outputs/phase-10/final-review-result.md`                | 最終レビュー結果                            |
| 11    | `outputs/phase-11/manual-test-result.md`                 | 自動テスト代替証跡                          |
| 11    | `outputs/phase-11/manual-test-checklist.md`              | チェックリスト                              |
| 11    | `outputs/phase-11/discovered-issues.md`                  | 発見された課題                              |
| 12    | `outputs/phase-12/implementation-guide.md`               | 実装ガイド（PR 本文素材）                   |
| 12    | `outputs/phase-12/system-spec-update-summary.md`         | システム仕様更新概要                        |
| 12    | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴                        |
| 12    | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出（先行タスク未完了を記録）      |
| 12    | `outputs/phase-12/skill-feedback-report.md`              | skill フィードバック                        |
| 12    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 mandatory 6 tasks 完了確認         |
| 13    | `outputs/phase-13/*`                                     | user 承認後のみ生成。本セッションでは不実施 |

## Phase 実行範囲（本セッション）

- 実行対象: Phase 1 〜 12
- Phase 13 (PR 作成) は user 指示がないため blocked

## artifacts.json parity（Phase 12 で確認）

- `outputs/artifacts.json`（存在する場合）と本一覧の完全一致を Phase 12 で確認する
