# ベクトル検索戦略（VectorSearchStrategy）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-rag-search.md](./interfaces-rag-search.md)

libSQL/TursoのDiskANNベクトルインデックスを使用したセマンティック検索戦略。

**実装場所**: `packages/shared/src/services/search/strategies/vector-search-strategy.ts`

---

## ISearchStrategy実装

| 実装クラス                 | name       | 状態   | 説明                       |
| -------------------------- | ---------- | ------ | -------------------------- |
| KeywordSearchStrategy      | "keyword"  | 実装済 | FTS5/BM25全文検索          |
| VectorSearchStrategy       | "semantic" | 実装済 | DiskANNベクトル検索        |
| CachedVectorSearchStrategy | "semantic" | 実装済 | キャッシュ付きベクトル検索 |
| GraphSearchStrategy        | "graph"    | 実装済 | GraphRAGクエリ検索         |

---

## VectorSearchStrategyインターフェース

| メソッド     | 戻り値                                     | 説明               |
| ------------ | ------------------------------------------ | ------------------ |
| search()     | Promise<Result<SearchResultItem[], Error>> | ベクトル検索実行   |
| getMetrics() | StrategyMetric                             | 検索メトリクス取得 |
| name         | "semantic"                                 | 戦略名（readonly） |

---

## Result型

Result型は成功（Ok）または失敗（Err）を表現する直和型。TypeScriptの型ガードにより安全なエラーハンドリングを実現する。

**型定義**: `Result<T, E> = Ok<T> | Err<E>`

| クラス | プロパティ/メソッド | 型シグネチャ            | 説明                           |
| ------ | ------------------- | ----------------------- | ------------------------------ |
| Ok<T>  | value               | T（readonly）           | 成功時の値を保持               |
| Ok<T>  | isOk()              | this is Ok<T>           | 型ガード：常にtrueを返す       |
| Ok<T>  | isErr()             | this is Err<never>      | 型ガード：常にfalseを返す      |
| Err<E> | error               | E（readonly）           | エラー情報を保持               |
| Err<E> | isOk()              | this is Ok<never>       | 型ガード：常にfalseを返す      |
| Err<E> | isErr()             | this is Err<E>          | 型ガード：常にtrueを返す       |

---

## フィルタ対応

| フィルタ     | VectorSearchStrategy | 説明                  |
| ------------ | -------------------- | --------------------- |
| fileIds      | ✅ 対応              | 特定ファイルに限定    |
| minRelevance | ✅ 対応              | 最低類似度閾値（0-1） |
| limit        | ✅ 対応              | 最大結果数（1-100）   |
| dateRange    | ❌ 未対応            | 将来対応予定          |
| fileTypes    | ❌ 未対応            | 将来対応予定          |
| workspaceIds | ❌ 未対応            | 将来対応予定          |

---

## 定数

| 定数名                | 値   | 説明                 |
| --------------------- | ---- | -------------------- |
| MAX_QUERY_LENGTH      | 1000 | クエリ最大文字数     |
| MIN_LIMIT             | 1    | 最小取得件数         |
| MAX_LIMIT             | 100  | 最大取得件数         |
| DEFAULT_LIMIT         | 10   | デフォルト取得件数   |
| DEFAULT_MIN_RELEVANCE | 0    | デフォルト最低類似度 |

---

## CachedVectorSearchStrategy

埋め込みキャッシュを使用した高速化版。

| 設定項目 | デフォルト値 | 説明                     |
| -------- | ------------ | ------------------------ |
| ttlMs    | 300000 (5分) | キャッシュ有効期間       |
| maxSize  | 1000         | 最大キャッシュエントリ数 |

---

## テスト品質

- **83テストケース**
- **98.71% Line Coverage**, **95.65% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/vector-search-diskann/outputs/phase-12/api-specification.md`

---

## 関連ドキュメント

- [検索クエリ・結果型定義](./rag-search-types.md)
- [キーワード検索戦略](./rag-search-keyword.md)
- [グラフ検索戦略](./rag-search-graph.md)
- [DiskANNアーキテクチャ](./rag-vector-search.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                   |
| ---------- | ---------- | ---------------------------------------------------------- |
| v1.0.0     | 2025-01-01 | 初版作成                                                   |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式に変換       |
