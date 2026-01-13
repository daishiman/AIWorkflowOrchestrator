# 検索クエリ・結果型定義

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [interfaces-rag.md](./interfaces-rag.md)

HybridRAG検索エンジンのクエリ・結果インターフェース。Keyword検索・Semantic検索・Graph検索を統合し、RRF（Reciprocal Rank Fusion）とCRAGによる高精度な検索を実現。

**実装場所**: `packages/shared/src/types/rag/search/`

---

## 主要型

### SearchQuery

ハイブリッド検索のクエリ型

| プロパティ | 型            | 説明                                     |
| ---------- | ------------- | ---------------------------------------- |
| text       | string        | 検索テキスト（1-1000文字）               |
| type       | QueryType     | クエリタイプ（local/global/hybrid等）    |
| embedding  | Float32Array  | 埋め込みベクトル（Semantic検索用）       |
| filters    | SearchFilters | 検索フィルター（ファイルID、日付範囲等） |
| options    | SearchOptions | 検索オプション（limit、戦略、重み等）    |

### SearchResult

統合検索結果

| プロパティ     | 型                    | 説明                                 |
| -------------- | --------------------- | ------------------------------------ |
| query          | SearchQuery           | 実行されたクエリ                     |
| results        | SearchResultItem[]    | 検索結果アイテム配列                 |
| totalCount     | number                | 総結果数                             |
| processingTime | number                | 処理時間（ミリ秒）                   |
| strategies     | SearchStrategyMetrics | 各戦略のメトリクス（実行時間、件数） |

### SearchResultItem

個別検索結果

| プロパティ | 型                  | 説明                                                 |
| ---------- | ------------------- | ---------------------------------------------------- |
| id         | string              | 結果アイテムID                                       |
| type       | SearchResultType    | 結果タイプ（chunk/entity/community）                 |
| score      | number              | 総合スコア（0.0-1.0）                                |
| relevance  | RelevanceScore      | 詳細スコア（keyword/semantic/graph/rerank）          |
| content    | SearchResultContent | コンテンツ（本文、要約、前後コンテキスト）           |
| highlights | Highlight[]         | ハイライト情報（マッチ箇所のオフセット）             |
| sources    | SearchResultSources | ソース情報（チャンクID、ファイルID、エンティティID） |

---

## 列挙型

| 型名             | 値                                  | 用途                       |
| ---------------- | ----------------------------------- | -------------------------- |
| QueryType        | local, global, relationship, hybrid | ユーザーの検索意図分類     |
| SearchStrategy   | keyword, semantic, graph, hybrid    | 検索アルゴリズム識別       |
| SearchResultType | chunk, entity, community            | 検索結果アイテムの種類識別 |

---

## 検索設定型

### SearchWeights

検索戦略の重み（合計1.0に制約）

| プロパティ | 型     | 説明                    |
| ---------- | ------ | ----------------------- |
| keyword    | number | Keyword検索重み（0-1）  |
| semantic   | number | Semantic検索重み（0-1） |
| graph      | number | Graph検索重み（0-1）    |

### SearchOptions

検索オプション

| プロパティ        | 型               | 説明                           |
| ----------------- | ---------------- | ------------------------------ |
| limit             | number           | 最大取得件数（1-100）          |
| offset            | number           | オフセット（ページネーション） |
| includeMetadata   | boolean          | メタデータを含む               |
| includeHighlights | boolean          | ハイライトを含む               |
| rerankEnabled     | boolean          | リランキング有効化             |
| cragEnabled       | boolean          | CRAG評価有効化                 |
| strategies        | SearchStrategy[] | 使用する検索戦略               |
| weights           | SearchWeights    | 各戦略の重み                   |

### CRAGScore

CRAG（Corrective RAG）評価スコア

| プロパティ     | 型                                      | 説明                                  |
| -------------- | --------------------------------------- | ------------------------------------- |
| relevance      | "correct" \| "incorrect" \| "ambiguous" | 関連性評価                            |
| confidence     | number                                  | 信頼度（0.0-1.0）                     |
| needsWebSearch | boolean                                 | Web検索が必要か                       |
| refinedQuery   | string \| null                          | 改良されたクエリ（ambiguous時に生成） |

---

## デフォルト値

- `DEFAULT_SEARCH_OPTIONS`: limit=20, weights={keyword:0.35, semantic:0.35, graph:0.3}
- `DEFAULT_RRF_CONFIG`: k=60, normalizeScores=true
- `DEFAULT_RERANK_CONFIG`: model="cross-encoder/ms-marco-MiniLM-L-6-v2", topK=50

---

## ユーティリティ関数

| 関数               | 説明                                                        |
| ------------------ | ----------------------------------------------------------- |
| calculateRRFScore  | 複数戦略のランキングをRRFアルゴリズムで統合                 |
| normalizeScores    | スコア配列をMin-Max正規化                                   |
| deduplicateResults | 重複結果を4種の戦略で排除（max_score/sum_score/first/last） |
| expandQuery        | クエリ拡張（同義語・関連語追加）                            |
| calculateCRAGScore | CRAG評価スコア計算（correct/incorrect/ambiguous判定）       |
| mergeSearchResults | 複数ソースの検索結果をマージ・重複排除                      |
| sortByRelevance    | 関連度でソート（昇順/降順、タイブレーカー対応）             |
| filterByThreshold  | 閾値でフィルタリング                                        |

---

## 型ガード

| 関数              | 説明                                  |
| ----------------- | ------------------------------------- |
| isChunkResult     | SearchResultItemがChunk結果か判定     |
| isEntityResult    | SearchResultItemがEntity結果か判定    |
| isCommunityResult | SearchResultItemがCommunity結果か判定 |

---

## バリデーション

**Zodスキーマ**: 全25型に対応するZodスキーマを提供

- 実行時型安全性を保証
- カスタムrefineバリデーション（searchWeights合計1.0、日付範囲、ハイライトオフセット等）
- 日本語エラーメッセージ対応

**テスト品質**: 123テストケース、96.93%カバレッジ達成

**参照**: `docs/30-workflows/completed-tasks/rag-search-system/` - 詳細な設計・実装ドキュメント

---

## クエリ分類器

検索クエリを分類し、最適な検索戦略を選択するコンポーネント。

### IQueryClassifier

| メソッド           | 説明                       |
| ------------------ | -------------------------- |
| classify()         | クエリを分類               |
| getSearchWeights() | タイプに応じた検索重み取得 |

**実装**:

- LLMQueryClassifier: 高精度分類（推奨）
- RuleBasedQueryClassifier: フォールバック用

**参照**: `packages/shared/src/services/search/`

---

## キーワード検索戦略

SQLite FTS5とBM25アルゴリズムを使用したキーワード検索戦略。

**実装場所**: `packages/shared/src/services/search/keyword-search-strategy.ts`

### IKeywordSearchStrategy

| メソッド            | 説明                                       |
| ------------------- | ------------------------------------------ |
| search()            | SearchQueryを受けてキーワード検索を実行    |
| searchNear()        | 近接検索（NEAR演算子）を実行               |
| getStrategyName()   | 戦略名を返す（"keyword"）                  |
| getMetrics()        | StrategyMetricを返す                       |
| normalizeScore()    | BM25スコアをシグモイド関数で0-1に正規化    |
| buildFTS5Query()    | テキストからFTS5クエリ文字列を生成         |
| toSearchResultItem()| FTS検索結果をSearchResultItemに変換        |

### KeywordSearchError

| type        | 説明                         |
| ----------- | ---------------------------- |
| validation  | クエリ長超過、無効形式       |
| database    | DB接続エラー、クエリ実行失敗 |
| timeout     | 検索タイムアウト（10秒超過） |

### 定数

| 定数名              | 値    | 説明                           |
| ------------------- | ----- | ------------------------------ |
| MAX_QUERY_LENGTH    | 1000  | クエリ最大文字数               |
| DEFAULT_SCALE_FACTOR| 0.5   | BM25スコア正規化のスケール係数 |
| SEARCH_TIMEOUT_MS   | 10000 | 検索タイムアウト（ミリ秒）     |

### 検索モード

| モード  | 判定条件                    | 検索関数                 |
| ------- | --------------------------- | ------------------------ |
| keyword | 通常クエリ                  | searchChunksByKeyword()  |
| phrase  | ダブルクォートで囲まれた文字列 | searchChunksByPhrase()   |
| near    | searchNear()メソッド呼び出し | searchChunksByNear()     |

**テスト品質**: 35テストケース、93.39%カバレッジ達成

**参照**: `docs/30-workflows/keyword-search-fts5/` - 詳細な設計・実装ドキュメント

---

---

## ベクトル検索戦略（VectorSearchStrategy）

libSQL/TursoのDiskANNベクトルインデックスを使用したセマンティック検索戦略。

**実装場所**: `packages/shared/src/services/search/strategies/vector-search-strategy.ts`

### ISearchStrategy実装

| 実装クラス                 | name       | 状態   | 説明                       |
| -------------------------- | ---------- | ------ | -------------------------- |
| KeywordSearchStrategy      | "keyword"  | 実装済 | FTS5/BM25全文検索          |
| VectorSearchStrategy       | "semantic" | 実装済 | DiskANNベクトル検索        |
| CachedVectorSearchStrategy | "semantic" | 実装済 | キャッシュ付きベクトル検索 |
| GraphSearchStrategy        | "graph"    | 実装済 | GraphRAGクエリ検索         |

### VectorSearchStrategyインターフェース

| メソッド      | 戻り値                                     | 説明                     |
| ------------- | ------------------------------------------ | ------------------------ |
| search()      | Promise<Result<SearchResultItem[], Error>> | ベクトル検索実行         |
| getMetrics()  | StrategyMetric                             | 検索メトリクス取得       |
| name          | "semantic"                                 | 戦略名（readonly）       |

### Result型

```typescript
type Result<T, E> = Ok<T> | Err<E>;

class Ok<T> {
  constructor(readonly value: T);
  isOk(): this is Ok<T>;
  isErr(): this is Err<never>;
}

class Err<E> {
  constructor(readonly error: E);
  isOk(): this is Ok<never>;
  isErr(): this is Err<E>;
}
```

### フィルタ対応

| フィルタ       | VectorSearchStrategy | 説明                     |
| -------------- | -------------------- | ------------------------ |
| fileIds        | ✅ 対応              | 特定ファイルに限定       |
| minRelevance   | ✅ 対応              | 最低類似度閾値（0-1）    |
| limit          | ✅ 対応              | 最大結果数（1-100）      |
| dateRange      | ❌ 未対応            | 将来対応予定             |
| fileTypes      | ❌ 未対応            | 将来対応予定             |
| workspaceIds   | ❌ 未対応            | 将来対応予定             |

### 定数

| 定数名              | 値    | 説明                      |
| ------------------- | ----- | ------------------------- |
| MAX_QUERY_LENGTH    | 1000  | クエリ最大文字数          |
| MIN_LIMIT           | 1     | 最小取得件数              |
| MAX_LIMIT           | 100   | 最大取得件数              |
| DEFAULT_LIMIT       | 10    | デフォルト取得件数        |
| DEFAULT_MIN_RELEVANCE | 0   | デフォルト最低類似度      |

### CachedVectorSearchStrategy

埋め込みキャッシュを使用した高速化版。

| 設定項目       | デフォルト値 | 説明                     |
| -------------- | ------------ | ------------------------ |
| ttlMs          | 300000 (5分) | キャッシュ有効期間       |
| maxSize        | 1000         | 最大キャッシュエントリ数 |

### テスト品質

- **83テストケース**
- **98.71% Line Coverage**, **95.65% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/vector-search-diskann/outputs/phase-12/api-specification.md`

---

## グラフ検索戦略（GraphSearchStrategy）

Knowledge Graphを活用したエンティティベース・コミュニティサマリベース・関係パスベースの検索戦略。

**実装場所**: `packages/shared/src/services/search/strategies/graph-search-strategy.ts`

### GraphSearchStrategyインターフェース

| メソッド     | 戻り値                                     | 説明                     |
| ------------ | ------------------------------------------ | ------------------------ |
| search()     | Promise<Result<SearchResultItem[], Error>> | グラフ検索実行           |
| getMetrics() | StrategyMetric                             | 検索メトリクス取得       |
| name         | "graph"                                    | 戦略名（readonly）       |

### クエリタイプ

| queryType    | 説明                                       | フォールバック           |
| ------------ | ------------------------------------------ | ------------------------ |
| local        | エンティティベースの詳細検索（デフォルト） | -                        |
| global       | コミュニティサマリベースの俯瞰検索         | localSearch              |
| relationship | エンティティ間のパス・関係検索             | 1エンティティ→localSearch |

### GraphSearchOptions

| オプション         | 型       | デフォルト | 説明                           |
| ------------------ | -------- | ---------- | ------------------------------ |
| queryType          | string   | "local"    | 検索タイプ（local/global/relationship） |
| entityThreshold    | number   | 0.5        | エンティティ類似度閾値（0-1） |
| communityThreshold | number   | -          | コミュニティ類似度閾値（0-1） |
| traversalDepth     | number   | 3          | トラバーサル深度（1-5）        |
| relationTypes      | string[] | -          | 関係タイプフィルタ             |

### 依存インターフェース

| インターフェース       | 必須 | 説明                           |
| ---------------------- | ---- | ------------------------------ |
| IKnowledgeGraphStore   | ✅   | Knowledge Graphストレージ      |
| IEmbeddingProvider     | ✅   | 埋め込み生成プロバイダー       |
| ICommunitySummarizer   |      | コミュニティサマリ検索         |

### スコアリング

| 検索タイプ   | 計算式                                                       |
| ------------ | ------------------------------------------------------------ |
| local        | `entitySimilarity × 0.6 + chunkRelevance × 0.4`             |
| relationship | `(1 / (1 + distance)) × 0.5 + chunkRelevance × 0.5`         |
| global       | `summary.confidence`（コミュニティサマリの信頼度）          |

### 定数

| 定数名                   | 値   | 説明                      |
| ------------------------ | ---- | ------------------------- |
| MAX_QUERY_LENGTH         | 1000 | クエリ最大文字数          |
| MIN_LIMIT                | 1    | 最小取得件数              |
| MAX_LIMIT                | 100  | 最大取得件数              |
| DEFAULT_ENTITY_THRESHOLD | 0.5  | デフォルト類似度閾値      |
| DEFAULT_TRAVERSAL_DEPTH  | 3    | デフォルトトラバーサル深度 |
| MAX_TRAVERSAL_DEPTH      | 5    | 最大トラバーサル深度      |

### テスト品質

- **69テストケース**
- **94.54% Line Coverage**, **90.21% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/graph-search-strategy/outputs/phase-12/implementation-guide.md`

---

## 変更履歴

| 日付       | バージョン | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| 2026-01-13 | 6.7.0      | GraphSearchStrategy詳細セクション追加              |
| 2026-01-12 | 6.6.0      | VectorSearchStrategy・CachedVectorSearchStrategy追加 |
| 2026-01-11 | 6.5.0      | KeywordSearchStrategyセクション追加                |
| 2026-01-10 | 6.0.0      | HybridRAGSearcherインターフェース詳細化            |

---

## 関連ドキュメント

- [RAG・ファイル選択インターフェース](./interfaces-rag.md)
- [Search Service API](./api-internal-search.md)
- [チャンク検索API](./api-internal-chunk-search.md)
