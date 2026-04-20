# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 11                                      |
| 機能名     | UNASSIGNED-EMB-005                      |
| タスク名   | Late Chunking実装（検索品質10-30%向上） |
| 前提Phase  | Phase 10                                |
| 後続Phase  | Phase 12                                |
| 作成日     | 2026-04-19                              |
| ステータス | pending                                 |

## 目的

手動検証と証跡で実利用品質を確認し、TC単位で判定根拠を固定する。NON_VISUALタスクのため画面証跡は不要とし、コンソール動作確認とベンチマーク証跡を代替証跡とする。

## 背景

UNASSIGNED-EMB-005 は `packages/shared/` への backend/shared library 実装であり、UI/UX変更を伴わない NON_VISUAL タスクである。手動テストはコンソール動作確認とベンチマーク証跡の取得により実施する。

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                     |
| ---------- | ------------------ | ------------------------------------------ |
| SubAgent-A | アルゴリズム責務   | Late Chunking ロジック正確性・境界条件     |
| SubAgent-B | パフォーマンス契約 | 処理速度・メモリ消費・スループット         |
| SubAgent-C | API/型契約         | 公開インターフェース・型安全性・後方互換性 |
| SubAgent-D | 統合監査           | 矛盾・漏れ・整合・依存判定                 |

## 実行タスク

- 手動シナリオ設計: TC-IDベースで非視覚シナリオを固定する
- コンソール動作確認: Late Chunking有効/無効の切り替えテストを実施する
- ベンチマーク証跡取得: 処理速度・メモリ消費の計測結果を記録する
- 判定記録: PASS/FAIL判定と根拠を成果物に記録する

## 視覚証跡

**UI/UX変更なしのため Phase 11 スクリーンショット不要**

本タスク（UNASSIGNED-EMB-005）は `packages/shared/` への NON_VISUAL 実装タスクであり、フロントエンドの画面変更を一切含まない。そのため通常の視覚証跡（スクリーンショット）は不要である。

代替証跡として以下のファイルを参照すること：

- `outputs/phase-10/final-review-result.md`（Phase 10 最終レビュー結果）
- `outputs/phase-11/UNASSIGNED-EMB-005-manual-test-report.md`（Phase 11 手動テスト結果）
- `outputs/phase-11/benchmark-results.md`（Phase 11 ベンチマーク証跡）

`evidence-index.md` には、スクリーンショット未作成理由、CLI実行証跡、ベンチマーク証跡、上記canonical名の手動テスト結果ファイルを必ず対応付ける。

## 参照資料

| 参照資料               | パス                                              | 説明            |
| ---------------------- | ------------------------------------------------- | --------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物  |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`          | Phase 2 成果物  |
| テスト戦略             | `outputs/phase-2/test-strategy.md`                | Phase 2 成果物  |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物  |
| 契約差分               | `outputs/phase-5/contract-diff.md`                | Phase 5 成果物  |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物  |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md`       | Phase 6 成果物  |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物  |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物  |
| リファクタ計画         | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物  |
| 責務境界マップ         | `outputs/phase-8/responsibility-boundary-map.md`  | Phase 8 成果物  |
| 品質レポート           | `outputs/phase-9/quality-report.md`               | Phase 9 成果物  |
| リスク台帳             | `outputs/phase-9/risk-register.md`                | Phase 9 成果物  |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 是正計画               | `outputs/phase-10/corrective-action-plan.md`      | Phase 10 成果物 |
| 出荷準備チェック       | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. コンソール動作確認シナリオを実行する。
4. ベンチマーク証跡を取得・記録する。
5. 成果物を `outputs/phase-11/` に保存する。
6. 完了条件で矛盾・漏れ・整合・依存を判定する。

## コンソール動作確認シナリオ

| ケースID | 観点                | 手順                                                           | 期待結果                                             |
| -------- | ------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| NV-11-01 | Late Chunking有効化 | `enableLateChunking: true` で embeddingパイプラインを実行する  | Late Chunkingが適用されたチャンク結果が返却される    |
| NV-11-02 | Late Chunking無効化 | `enableLateChunking: false` で embeddingパイプラインを実行する | 従来のチャンク結果が返却される（後方互換性確認）     |
| NV-11-03 | 切り替えテスト      | 同一文書で有効/無効を交互に切り替えて実行する                  | 毎回一貫した結果が返却され、メモリリークが発生しない |
| NV-11-04 | 大規模文書処理      | 10,000トークン超の文書でLate Chunkingを実行する                | OOMが発生せず、許容時間内に処理が完了する            |
| NV-11-05 | 空文書・境界値      | 空文字列・1文字・最大長文書でLate Chunkingを実行する           | エラーなく正常なチャンク結果が返却される             |

## ベンチマーク証跡

| 計測項目           | 計測方法                                       | 記録先                                  |
| ------------------ | ---------------------------------------------- | --------------------------------------- |
| 検索品質向上率     | Late Chunking有効/無効でのretrievalスコア比較  | `outputs/phase-11/benchmark-results.md` |
| 処理速度（ms/doc） | 100件の文書でのembedding生成時間計測           | `outputs/phase-11/benchmark-results.md` |
| メモリ使用量（MB） | heapUsed の最大値をprocess.memoryUsage()で計測 | `outputs/phase-11/benchmark-results.md` |

## 多角的チェック観点

| 観点     | 確認内容                                                            |
| -------- | ------------------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                                  |
| 漏れ     | 要件から成果物への未反映項目がないか確認する                        |
| 整合性   | Late Chunking API・型定義・パイプライン契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する                       |

## 成果物

| 成果物           | パス                                                        | 説明         |
| ---------------- | ----------------------------------------------------------- | ------------ |
| 手動テスト結果   | `outputs/phase-11/UNASSIGNED-EMB-005-manual-test-report.md` | 手動検証結果 |
| 証跡インデックス | `outputs/phase-11/evidence-index.md`                        | 証跡一覧     |
| ベンチマーク結果 | `outputs/phase-11/benchmark-results.md`                     | 性能計測証跡 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] コンソール動作確認シナリオ NV-11-01〜NV-11-05 が全件 PASS
- [ ] ベンチマーク証跡が記録されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. コンソール動作確認シナリオの実行
4. ベンチマーク証跡の記録
5. SubAgent-D の統合判定
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

Phase 12: ドキュメント更新
