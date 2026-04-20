# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 10                                      |
| 機能名     | UNASSIGNED-EMB-005                      |
| タスク名   | Late Chunking実装（検索品質10-30%向上） |
| 前提Phase  | Phase 9                                 |
| 後続Phase  | Phase 11                                |
| 作成日     | 2026-04-19                              |
| ステータス | pending                                 |

## 目的

最終ゲートで出荷可否と是正項目を確定する。acceptance criteria と blocker を判定し、PASS/MAJOR/MINOR のゲート判定を下す。

## 背景

Late Chunkingは文書全体のコンテキストを考慮した後処理型チャンキング手法であり、検索品質10〜30%向上を実現する機能追加タスクである。Phase 9の品質保証を経て最終的な出荷可否を判定する。

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                     |
| ---------- | ------------------ | ------------------------------------------ |
| SubAgent-A | アルゴリズム責務   | Late Chunking ロジック正確性・境界条件     |
| SubAgent-B | パフォーマンス契約 | 処理速度・メモリ消費・スループット         |
| SubAgent-C | API/型契約         | 公開インターフェース・型安全性・後方互換性 |
| SubAgent-D | 統合監査           | 矛盾・漏れ・整合・依存判定                 |

## 実行タスク

- 最終整合レビュー: 全Phaseの矛盾と漏れを再確認する
- 是正計画確定: 未解決項目の是正順序を確定する
- 出荷判定: ゲート判定（PASS/MAJOR/MINOR）を固定する

## ゲート判定基準

| 判定  | 条件                                                             |
| ----- | ---------------------------------------------------------------- |
| PASS  | acceptance criteria 全件クリア・blocker 0件                      |
| MINOR | 軽微な未解決項目あり（運用回避策が存在）・blocker 0件            |
| MAJOR | blocker が 1件以上 / acceptance criteria 未達・前Phaseへ差し戻し |

## パフォーマンスベンチマーク最終確認

| 指標           | 目標値    | 判定基準                                       |
| -------------- | --------- | ---------------------------------------------- |
| 検索品質向上率 | +10%以上  | 従来チャンキングとのA/B比較で10%以上の改善     |
| 処理速度低下   | -50%以内  | 従来比で処理時間増加が50%未満に収まること      |
| メモリ消費増加 | +200%以内 | 従来比でメモリ使用量増加が200%未満に収まること |

## 参照資料

| 参照資料               | パス                                                         | 説明           |
| ---------------------- | ------------------------------------------------------------ | -------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物 |
| 仕様抽出結果           | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物 |
| 差分カバレッジ         | `outputs/phase-1/branch-diff-coverage.md`                    | Phase 1 成果物 |
| トレーサビリティ行列   | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物 |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`                     | Phase 2 成果物 |
| テスト戦略             | `outputs/phase-2/test-strategy.md`                           | Phase 2 成果物 |
| 依存整合マトリクス     | `outputs/phase-2/dependency-consistency-matrix.md`           | Phase 2 成果物 |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                  | Phase 5 成果物 |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                           | Phase 5 成果物 |
| 契約差分               | `outputs/phase-5/contract-diff.md`                           | Phase 5 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                           | Phase 7 成果物 |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`                 | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md`            | Phase 7 成果物 |
| リファクタ計画         | `outputs/phase-8/refactoring-plan.md`                        | Phase 8 成果物 |
| 再テスト計画           | `outputs/phase-8/post-refactor-test-plan.md`                 | Phase 8 成果物 |
| 責務境界マップ         | `outputs/phase-8/responsibility-boundary-map.md`             | Phase 8 成果物 |
| 品質レポート           | `outputs/phase-9/quality-report.md`                          | Phase 9 成果物 |
| リスク台帳             | `outputs/phase-9/risk-register.md`                           | Phase 9 成果物 |
| 因果ループ監査         | `outputs/phase-9/causal-loop-check.md`                       | Phase 9 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. パフォーマンスベンチマークを最終確認する（検索品質+10%以上・処理速度-50%以内・メモリ+200%以内）。
4. acceptance criteria の全件充足を確認する。
5. blocker の有無を判定し、ゲート判定（PASS/MAJOR/MINOR）を下す。
6. 成果物を `outputs/phase-10/` に保存する。
7. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 多角的チェック観点

| 観点     | 確認内容                                                            |
| -------- | ------------------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                                  |
| 漏れ     | 要件から成果物への未反映項目がないか確認する                        |
| 整合性   | Late Chunking API・型定義・パイプライン契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する                       |

## 成果物

| 成果物           | パス                                              | 説明                 |
| ---------------- | ------------------------------------------------- | -------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | 最終判定・ゲート結果 |
| 是正計画         | `outputs/phase-10/corrective-action-plan.md`      | 是正手順             |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | 移行可否確認         |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] ゲート判定が PASS または MINOR であること
- [ ] パフォーマンスベンチマーク（検索品質+10%以上・処理速度-50%以内・メモリ+200%以内）を確認
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. パフォーマンスベンチマーク最終確認
4. SubAgent-D の統合判定
5. ゲート判定（PASS/MAJOR/MINOR）確定
6. 成果物出力
7. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UNASSIGNED-EMB-005-late-chunking
```

## 次のPhase

Phase 11: 手動テスト検証
