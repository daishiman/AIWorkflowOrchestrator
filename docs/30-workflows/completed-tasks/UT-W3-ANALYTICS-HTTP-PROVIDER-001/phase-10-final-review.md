# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 10                                                   |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 9                                              |
| 後続Phase  | Phase 11                                             |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

受け入れ基準（AC-01〜AC-07）の全件達成を確認し、Phase 11 へ進めるかを判定する。MAJOR 指摘がある場合は Phase 8 へ差し戻す。

## 背景

Phase 9 の品質保証が完了した。本 Phase では最終的な受け入れ判定と出荷準備チェックを行う。

## 実行タスク

1. AC-01〜AC-07 の達成状況を確認する。
2. IPC 非破壊性と HTTP 失敗時の非伝播を再確認する。
3. セキュリティと型安全性の最終確認を行う。
4. MINOR 指摘を未タスク化するかどうかを判定する。
5. Phase 11 へ進めるか、Phase 8 へ差し戻すかを決定する。

## レビュー観点

| 観点             | 確認内容                                                            |
| ---------------- | ------------------------------------------------------------------- |
| 受け入れ基準達成 | AC-01〜AC-07 が全件 PASS していること                               |
| IPC 非破壊性     | 既存 analytics:send チャネルが正常動作すること                      |
| エラー非伝播     | HTTP 失敗が IPC 全体を壊さないこと                                  |
| 型安全性         | TypeScript コンパイルエラーがないこと                               |
| セキュリティ     | `ANALYTICS_ENDPOINT_URL` がログ・エラーメッセージに漏れていないこと |
| ドキュメント     | コードコメントが適切であること                                      |

## 統合テスト連携【必須】

| 確認項目     | 確認内容                                              | 期待結果 |
| ------------ | ----------------------------------------------------- | -------- |
| 受け入れ基準 | AC-01〜AC-07 が全件 PASS                              | PASS     |
| IPC 非破壊性 | `analytics:send` の既存フローが壊れていない           | PASS     |
| 非伝播       | HTTP 失敗が IPC 全体を壊さない                        | PASS     |
| セキュリティ | `ANALYTICS_ENDPOINT_URL` がログ・エラーに漏れていない | PASS     |
| 型安全性     | `pnpm typecheck` にエラーがない                       | PASS     |

## ゲート判定基準

| 判定  | 条件                          | アクション                |
| ----- | ----------------------------- | ------------------------- |
| PASS  | MAJOR 指摘 0 件               | Phase 11 へ進む           |
| MINOR | 軽微な改善提案のみ            | Phase 11 継続・未タスク化 |
| MAJOR | AC 未達成・型エラー・IPC 破壊 | Phase 8 差し戻し          |

## MINOR 指摘の扱い

MINOR 指摘は未タスク化（unassigned-task として登録）し、本タスクはブロックしない。

## 参照資料

| 参照資料               | パス                                                         | 説明           |
| ---------------------- | ------------------------------------------------------------ | -------------- |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`                     | Phase 2 成果物 |
| HTTP送信設計           | `outputs/phase-2/http-send-design.md`                        | Phase 2 成果物 |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                  | Phase 5 成果物 |
| 品質レポート           | `outputs/phase-9/quality-report.md`                          | Phase 9 成果物 |
| リスク台帳             | `outputs/phase-9/risk-register.md`                           | Phase 9 成果物 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物 |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物 |
| 仕様抽出結果           | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物 |
| 差分カバレッジ         | `outputs/phase-1/branch-diff-coverage.md`                    | Phase 1 成果物 |
| トレーサビリティ行列   | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物 |
| テスト戦略             | `outputs/phase-2/test-strategy.md`                           | Phase 2 成果物 |
| 依存整合マトリクス     | `outputs/phase-2/dependency-consistency-matrix.md`           | Phase 2 成果物 |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                           | Phase 5 成果物 |
| 契約差分               | `outputs/phase-5/contract-diff.md`                           | Phase 5 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                           | Phase 7 成果物 |
| 未到達分析             | `outputs/phase-7/unreached-analysis.md`                      | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md`            | Phase 7 成果物 |
| リファクタ計画         | `outputs/phase-8/refactoring-plan.md`                        | Phase 8 成果物 |
| 再テスト計画           | `outputs/phase-8/post-refactor-test-plan.md`                 | Phase 8 成果物 |
| 責務境界マップ         | `outputs/phase-8/responsibility-boundary-map.md`             | Phase 8 成果物 |
| 因果ループ監査         | `outputs/phase-9/causal-loop-check.md`                       | Phase 9 成果物 |

## 成果物

| 成果物           | パス                                           | 説明                       |
| ---------------- | ---------------------------------------------- | -------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`      | AC 達成状況と総合判定      |
| 是正計画         | `outputs/phase-10/corrective-plan.md`          | MINOR/MAJOR 指摘の是正計画 |
| 出荷準備チェック | `outputs/phase-10/shipment-readiness-check.md` | 出荷前チェックリスト       |

## 完了条件

- [ ] AC-01〜AC-07 の達成状況が全件記録されていること
- [ ] ゲート判定（PASS/MINOR/MAJOR）が明記されていること
- [ ] MINOR 指摘がある場合は未タスク化されていること
- [ ] 出荷準備チェックリストが完成していること
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 9 全成果物の確認
2. AC-01〜AC-07 達成状況の確認
3. 最終レビュー実施
4. 是正計画作成（該当する場合）
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ゲート判定が明確であること
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001
```

## 次のPhase

Phase 11: 手動テスト検証（PASS の場合）
