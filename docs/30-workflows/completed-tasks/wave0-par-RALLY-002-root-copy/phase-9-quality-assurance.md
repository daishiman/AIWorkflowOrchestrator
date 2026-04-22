# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 9                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| タスク名   | restoredPendingRequest合成ルール明確化 |
| 前提Phase  | Phase 8                                |
| 後続Phase  | Phase 10                               |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |
| 実装モード | verify_existing                        |

## 目的

RALLY-002 スコープに限定して 4 条件を再監査する。ここでの PASS は「RALLY-002 が新たな矛盾や依存破壊を持ち込んでいないこと」を意味し、他タスク未完了を理由に自己矛盾した PARTIAL 判定を量産しない。

## 実行タスク

1. 4 条件の監査結果を RALLY-002 スコープで判定する。
2. 実行できた静的検証と実行できなかったテストを分離記録する。
3. 残リスクを risk register へ記録する。

## 参照資料

| 資料名       | パス                                                                                     | 用途         |
| ------------ | ---------------------------------------------------------------------------------------- | ------------ |
| 上流分析書   | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-1-analysis.md` | Phase 1 基準 |
| レビュー資料 | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-3-review.md`   | handoff 基準 |
| Phase 7 出力 | `outputs/phase-7/coverage-check-result.md`                                               | 実測結果     |
| Phase 8 出力 | `outputs/phase-8/change-rationale-table.md`                                              | no-op 判定   |

## 実行手順

1. 4 条件を `four-conditions-audit.md` に整理する。
2. `typecheck`、`eslint`、`vitest` の結果を `quality-report.md` に整理する。
3. 残リスクを `risk-register.md` に整理する。

## 統合テスト連携

- `typecheck`: 実行済み PASS
- `eslint`: 対象ファイル単位で実行済み PASS
- `vitest`: esbuild version mismatch により未完了。品質問題ではなく環境制約として扱う

## 成果物

- `outputs/phase-9/quality-report.md`
- `outputs/phase-9/risk-register.md`
- `outputs/phase-9/four-conditions-audit.md`

## 完了条件

- [ ] 4条件を RALLY-002 スコープで監査した
- [ ] コマンド結果を記録した
- [ ] 残リスクを整理した

## タスク100%実行確認【必須】

- [ ] Phase 9 の3成果物を作成した
- [ ] 矛盾した PASS/PARTIAL を混在させていない

## 次のPhase

Phase 10: 最終レビューゲート
