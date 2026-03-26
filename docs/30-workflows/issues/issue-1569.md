# [#1569] "[UT-RAG-08-006] GraphSearchStrategy queryType 伝播改善"

## メタ情報

```yaml
task_id: UT-RAG-08-006
task_name: GraphSearchStrategy queryType 伝播改善
category: 機能改善
target_feature: HybridRAG 検索パイプライン - グラフ検索戦略
priority: 中
scale: S（0.5〜1日）
status: 未実施
source_phase: UT-RAG-08-002 Phase 3 RV 多角的チェック観点 / Phase 10 FU-01 formalize
created_date: 2026-03-20
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-rag-08-006-graph-query-type-propagation.md
```

| 項目       | 内容          |
| ---------- | ------------- |
| 優先度     | 中            |
| 規模       | S（0.5〜1日） |
| ステータス | 未実施        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`GraphSearchStrategy` は現在 `local` モードのみで動作する制約がある。
`HybridRAGEngine.search()` が受け取る `queryType`（`local` / `global` / `hybrid` 等）を `GraphSearchStrategy` に伝播する仕組みが実装されていないため、グラフ検索は常に local トラバーサルのみを実行する。

### 1.2 問題点・課題

- `HybridRAGEngine` は `IQueryClassifier` でクエリタイプを分類するが、その結果を各 `ISearchStrategy` に渡す経路が設計されていない。
- `GraphSearchStrategy` が `queryType === "global"` のとき community summary を活用する Global クエリパターンに対応できない。
- UT-RAG-08-002（HybridRAGFactory 実配線）完了後も、グラフ検索は実質 local 専用のまま残る。

## 2. スコープ

### 含む

- `ISearchStrategy` の `search()` シグネチャへの `queryType` 引数追加（または SearchOptions 拡張）
- `HybridRAGEngine.search()` から `GraphSearchStrategy` へ `queryType` を渡す経路の実装
- `GraphSearchStrategy` 内での `queryType` 分岐ロジック（`local` / `global` / `hybrid`）
- 変更に伴う既存テストの修正

### 含まない

- `communitySummarizer` 本体の実装（UT-RAG-08-008 のスコープ）
- `HybridRAGFactory.createFull()` の config 拡張（UT-RAG-08-008 のスコープ）
- `KeywordSearchStrategy` / `VectorSearchStrategy` への queryType 伝播（本タスクでは不要）

## 3. 技術コンテキスト

### 現状の制約

```
HybridRAGEngine.search(query, options)
  └─ queryClassifier.classify(query) → QueryType
  └─ 並列実行: keyword.search() / semantic.search() / graph.search()
       ※ graph.search() に queryType が渡されていない
```

### 想定修正後

```
HybridRAGEngine.search(query, options)
  └─ queryClassifier.classify(query) → queryType
  └─ 並列実行:
       keyword.search(query, options)
       semantic.search(query, options)
       graph.search(query, { ...options, queryType })  // ← 追加
```

### 関連ファイル

| ファイル                                                       | 役割                                   |
| -------------------------------------------------------------- | -------------------------------------- |
| `packages/shared/src/services/search/hybrid-rag-engine.ts`     | queryType を保持するエンジン本体       |
| `packages/shared/src/services/search/graph-search-strategy.ts` | queryType を受け取る対象               |
| `packages/shared/src/services/search/interfaces.ts`            | `ISearchStrategy` インターフェース定義 |

## 4. 依存タスク

| タスクID      | タスク名                        | 依存種別 |
| ------------- | ------------------------------- | -------- |
| UT-RAG-08-002 | HybridRAGFactory 実配線         | 推奨前提 |
| UT-RAG-08-008 | communitySummarizer Config 拡張 | 後続     |

UT-RAG-08-002 完了後（Factory が production 状態になった後）に実施することを推奨する。

## 5. 受入基準

- [ ] `GraphSearchStrategy.search()` が `queryType` を受け取れること
- [ ] `queryType === "global"` のとき community summary パスに分岐できること（community summarizer が未接続でも分岐コードが存在する）
- [ ] `queryType === "local"` のとき既存の local トラバーサルが維持されること
- [ ] 変更後の全テストが PASS すること
- [ ] `ISearchStrategy` の変更が keyword / semantic 戦略の既存テストに影響しないこと

## 6. 苦戦箇所（UT-RAG-08-002 での知見）

| 箇所                             | 内容                                                                                                                                                                 | 対策                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `ISearchStrategy` 変更の波及範囲 | `search()` シグネチャを変更すると keyword/semantic/graph の全戦略に影響する。UT-RAG-08-002 では KeywordSearchStrategyAdapter を導入して旧 API を吸収した（P64 派生） | `SearchOptions` に optional フィールドとして追加し、既存戦略は無視できる設計にする                    |
| queryType の分類精度             | `RuleBasedQueryClassifier` は keyword ベースの簡易分類で、global/local の判定精度が低い。LLMQueryClassifier を使うと精度は上がるが LLM 呼び出しコストが増加する      | まず RuleBasedQueryClassifier で分岐コードを実装し、classifier の差し替えで精度を調整できるようにする |
| テスト時の queryType 伝播検証    | `HybridRAGEngine` の並列実行パスで queryType が正しく各戦略に渡されているかの検証が難しい。mock の setup が複雑になる                                                | `createForTesting()` を活用し、各戦略を個別に mock して queryType の受け渡しを検証する                |

## 7. リスク

| リスク                                                     | 影響度 | 対策                                                                        |
| ---------------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `ISearchStrategy` インターフェース変更による既存実装の波及 | 中     | `SearchOptions` に optional フィールドとして追加し後方互換を維持する        |
| `communitySummarizer` 未実装時の null 参照                 | 中     | `communitySummarizer` が null のとき local フォールバックを明示的に実装する |
