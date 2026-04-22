# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| タスク名   | restoredPendingRequest合成ルール明確化 |
| 前提Phase  | Phase 6                                |
| 後続Phase  | Phase 8                                |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |
| 実装モード | verify_existing                        |

## 目的

RALLY-002 固有の AC-1〜AC-5 に対して、どこまで自動検証・静的検証・手動検証で根拠を持てるかを整理する。ここでは他タスクの AC を背負わず、RALLY-002 単体の契約固定に必要な coverage のみを扱う。

## 実行タスク

1. AC-1〜AC-5 のトレーサビリティ表を作る。
2. 実行できたコマンドと実行できなかったコマンドを分離して記録する。
3. 未カバー項目を `uncovered-analysis.md` に記録する。

## 参照資料

| 資料名       | パス                                                                                     | 用途           |
| ------------ | ---------------------------------------------------------------------------------------- | -------------- |
| Phase 1 AC   | `outputs/phase-1/acceptance-criteria.md`                                                 | 基準           |
| 上流分析書   | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-1-analysis.md` | 問題起点       |
| レビュー資料 | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-3-review.md`   | handoff 観点   |
| テスト在庫   | `outputs/phase-4/existing-test-inventory.md`                                             | 既存テスト確認 |

## 実行手順

1. `existing-test-inventory.md` を読み、RALLY-002 関連テストの有無を確認する。
2. 実行できたコマンドの結果を `coverage-check-result.md` に記録する。
3. AC ごとの根拠と未カバー項目を `traceability-coverage-report.md` と `uncovered-analysis.md` に記録する。

## 統合テスト連携

- `typecheck` は実行済みなら静的根拠として扱う。
- `eslint` は対象ファイル単位で実行済みなら静的根拠として扱う。
- `vitest` は環境要因で失敗した場合、coverage 不足ではなく環境制約として分離する。

## 成果物

- `outputs/phase-7/coverage-check-result.md`
- `outputs/phase-7/traceability-coverage-report.md`
- `outputs/phase-7/uncovered-analysis.md`

## 完了条件

- [ ] AC-1〜AC-5 の根拠を整理した
- [ ] 実行済み/未実行のコマンドを分離した
- [ ] 未カバー項目を記録した

## タスク100%実行確認【必須】

- [ ] Phase 7 の3成果物を作成した
- [ ] RALLY-002 固有の coverage 論点だけを残した

## 次のPhase

Phase 8: リファクタリング
