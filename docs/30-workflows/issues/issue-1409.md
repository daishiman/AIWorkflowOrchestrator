# [#1409] [UT-RAG-08-006] GraphSearchStrategy queryType 伝播改善

## 概要

`GraphSearchStrategy` に `queryType` を伝播する仕組みを実装し、`local` / `global` / `hybrid` クエリへの対応を可能にする。

## メタ情報

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-RAG-08-006                                                          |
| 分類         | 機能改善                                                               |
| 対象機能     | HybridRAG 検索パイプライン - グラフ検索戦略                            |
| 優先度       | 中                                                                     |
| 見積もり規模 | S（0.5〜1日）                                                          |
| 発見元       | UT-RAG-08-002 Phase 3 RV 多角的チェック観点 / Phase 10 FU-01 formalize |
| 発見日       | 2026-03-20                                                             |

## 背景・問題

`GraphSearchStrategy` は現在 `local` モードのみで動作する制約がある。`HybridRAGEngine.search()` が受け取る `queryType`（`local` / `global` / `hybrid` 等）を `GraphSearchStrategy` に伝播する仕組みが未実装のため、グラフ検索は常に local トラバーサルのみを実行する。

- `HybridRAGEngine` は `IQueryClassifier` でクエリタイプを分類するが、その結果を各 `ISearchStrategy` に渡す経路が設計されていない
- `GraphSearchStrategy` が `queryType === "global"` のとき community summary を活用する Global クエリパターンに対応できない
- UT-RAG-08-002（HybridRAGFactory 実配線）完了後も、グラフ検索は実質 local 専用のまま残る

## スコープ

**含む:**

- `ISearchStrategy` の `search()` シグネチャへの `queryType` 引数追加（または SearchOptions 拡張）
- `HybridRAGEngine.search()` から `GraphSearchStrategy` へ `queryType` を渡す経路の実装
- `GraphSearchStrategy` 内での `queryType` 分岐ロジック（`local` / `global` / `hybrid`）
- 変更に伴う既存テストの修正

**含まない:**

- `communitySummarizer` 本体の実装（UT-RAG-08-008 のスコープ）
- `HybridRAGFactory.createFull()` の config 拡張（UT-RAG-08-008 のスコープ）
- `KeywordSearchStrategy` / `VectorSearchStrategy` への queryType 伝播

## 関連ファイル

| ファイル                                                       | 役割                                   |
| -------------------------------------------------------------- | -------------------------------------- |
| `packages/shared/src/services/search/hybrid-rag-engine.ts`     | queryType を保持するエンジン本体       |
| `packages/shared/src/services/search/graph-search-strategy.ts` | queryType を受け取る対象               |
| `packages/shared/src/services/search/interfaces.ts`            | `ISearchStrategy` インターフェース定義 |

## 受入基準

- [ ] `GraphSearchStrategy.search()` が `queryType` を受け取れること
- [ ] `queryType === "global"` のとき community summary パスに分岐できること（community summarizer が未接続でも分岐コードが存在する）
- [ ] `queryType === "local"` のとき既存の local トラバーサルが維持されること
- [ ] 変更後の全テストが PASS すること
- [ ] `ISearchStrategy` の変更が keyword / semantic 戦略の既存テストに影響しないこと

## 依存タスク

| タスクID      | タスク名                        | 依存種別 |
| ------------- | ------------------------------- | -------- |
| UT-RAG-08-002 | HybridRAGFactory 実配線         | 推奨前提 |
| UT-RAG-08-008 | communitySummarizer Config 拡張 | 後続     |

UT-RAG-08-002 完了後（Factory が production 状態になった後）に実施することを推奨。

## 指示書パス

`docs/30-workflows/unassigned-task/task-rag-08-006-graph-query-type-propagation.md`
