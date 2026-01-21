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

## キーワード検索戦略（FTS5/BM25）

SQLite FTS5（Full-Text Search 5）とBM25ランキングアルゴリズムを使用したキーワード検索戦略。

**実装場所**: `packages/shared/src/services/search/strategies/keyword-search-strategy.ts`

### IKeywordSearchStrategy

| メソッド             | 戻り値                                     | 説明                                    |
| -------------------- | ------------------------------------------ | --------------------------------------- |
| search()             | Promise<Result<SearchResultItem[], Error>> | SearchQueryを受けてキーワード検索を実行 |
| searchNear()         | Promise<Result<SearchResultItem[], Error>> | 近接検索（NEAR演算子）を実行            |
| getStrategyName()    | "keyword"                                  | 戦略名を返す                            |
| getMetrics()         | StrategyMetric                             | 検索メトリクス取得                      |
| normalizeScore()     | number                                     | BM25スコアをシグモイド関数で0-1に正規化 |
| buildFTS5Query()     | string                                     | テキストからFTS5クエリ文字列を生成      |
| toSearchResultItem() | SearchResultItem                           | FTS検索結果をSearchResultItemに変換     |

### KeywordSearchError

```typescript
type KeywordSearchErrorType = "validation" | "database" | "timeout";

interface KeywordSearchError {
  type: KeywordSearchErrorType;
  message: string;
  cause?: Error;
}
```

| type       | 説明                         | 対処                         |
| ---------- | ---------------------------- | ---------------------------- |
| validation | クエリ長超過、無効形式       | クエリ修正を促す             |
| database   | DB接続エラー、クエリ実行失敗 | リトライまたはフォールバック |
| timeout    | 検索タイムアウト（10秒超過） | 結果を切り捨てて返す         |

### 定数

| 定数名               | 値    | 説明                           |
| -------------------- | ----- | ------------------------------ |
| MAX_QUERY_LENGTH     | 1000  | クエリ最大文字数               |
| DEFAULT_SCALE_FACTOR | 0.5   | BM25スコア正規化のスケール係数 |
| SEARCH_TIMEOUT_MS    | 10000 | 検索タイムアウト（ミリ秒）     |

### 検索モード

| モード  | 判定条件                       | 検索関数                | FTS5クエリ例          |
| ------- | ------------------------------ | ----------------------- | --------------------- |
| keyword | 通常クエリ                     | searchChunksByKeyword() | `term1 term2 term3`   |
| phrase  | ダブルクォートで囲まれた文字列 | searchChunksByPhrase()  | `"exact phrase"`      |
| near    | searchNear()メソッド呼び出し   | searchChunksByNear()    | `term1 NEAR/10 term2` |

### FTS5テーブル構造

```sql
CREATE VIRTUAL TABLE chunks_fts USING fts5(
  content,
  tokenize = 'unicode61 remove_diacritics 2',
  content_rowid = chunk_id
);
```

### FTS5クエリパターン

```sql
-- キーワード検索
SELECT rowid, bm25(chunks_fts) as score
FROM chunks_fts
WHERE chunks_fts MATCH ?
ORDER BY score
LIMIT ?;

-- フレーズ検索
SELECT rowid, bm25(chunks_fts) as score
FROM chunks_fts
WHERE chunks_fts MATCH '"exact phrase"'
ORDER BY score;

-- 近接検索（NEARオペレータ）
SELECT rowid, bm25(chunks_fts) as score
FROM chunks_fts
WHERE chunks_fts MATCH 'term1 NEAR/10 term2'
ORDER BY score;
```

### BM25スコア正規化

```typescript
function normalizeScore(bm25Score: number, scaleFactor = 0.5): number {
  // シグモイド関数で0-1に正規化
  return 1 / (1 + Math.exp(-scaleFactor * bm25Score));
}
```

### データフロー

```
SearchQuery → validateQuery() → validation error
      ↓
buildFTS5Query()
      ↓
executeFTS5Search() → database error / timeout
      ↓
FTS5Result[]
      ↓
normalizeScore() (each result)
      ↓
toSearchResultItem() (each result)
      ↓
SearchResultItem[]
```

### 非機能要件

| 項目         | 要件                               |
| ------------ | ---------------------------------- |
| 検索速度     | 単一クエリ100ms以下                |
| タイムアウト | 10秒（SEARCH_TIMEOUT_MS）          |
| クエリ長上限 | 1000文字（MAX_QUERY_LENGTH）       |
| スコア正規化 | シグモイド関数（scale factor 0.5） |
| 並列処理     | バッチ検索での並列実行対応         |

### テスト品質

- **35テストケース**
- **93.39% Line Coverage**

**詳細参照**: `docs/30-workflows/CONV-07-02-keyword-search-fts5/` - 設計・実装ドキュメント

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

| メソッド     | 戻り値                                     | 説明               |
| ------------ | ------------------------------------------ | ------------------ |
| search()     | Promise<Result<SearchResultItem[], Error>> | ベクトル検索実行   |
| getMetrics() | StrategyMetric                             | 検索メトリクス取得 |
| name         | "semantic"                                 | 戦略名（readonly） |

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

| フィルタ     | VectorSearchStrategy | 説明                  |
| ------------ | -------------------- | --------------------- |
| fileIds      | ✅ 対応              | 特定ファイルに限定    |
| minRelevance | ✅ 対応              | 最低類似度閾値（0-1） |
| limit        | ✅ 対応              | 最大結果数（1-100）   |
| dateRange    | ❌ 未対応            | 将来対応予定          |
| fileTypes    | ❌ 未対応            | 将来対応予定          |
| workspaceIds | ❌ 未対応            | 将来対応予定          |

### 定数

| 定数名                | 値   | 説明                 |
| --------------------- | ---- | -------------------- |
| MAX_QUERY_LENGTH      | 1000 | クエリ最大文字数     |
| MIN_LIMIT             | 1    | 最小取得件数         |
| MAX_LIMIT             | 100  | 最大取得件数         |
| DEFAULT_LIMIT         | 10   | デフォルト取得件数   |
| DEFAULT_MIN_RELEVANCE | 0    | デフォルト最低類似度 |

### CachedVectorSearchStrategy

埋め込みキャッシュを使用した高速化版。

| 設定項目 | デフォルト値 | 説明                     |
| -------- | ------------ | ------------------------ |
| ttlMs    | 300000 (5分) | キャッシュ有効期間       |
| maxSize  | 1000         | 最大キャッシュエントリ数 |

### テスト品質

- **83テストケース**
- **98.71% Line Coverage**, **95.65% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/vector-search-diskann/outputs/phase-12/api-specification.md`

---

## グラフ検索戦略（GraphSearchStrategy）

Knowledge Graphを活用したエンティティベース・コミュニティサマリベース・関係パスベースの検索戦略。

**実装場所**: `packages/shared/src/services/search/strategies/graph-search-strategy.ts`

### GraphSearchStrategyインターフェース

| メソッド     | 戻り値                                     | 説明               |
| ------------ | ------------------------------------------ | ------------------ |
| search()     | Promise<Result<SearchResultItem[], Error>> | グラフ検索実行     |
| getMetrics() | StrategyMetric                             | 検索メトリクス取得 |
| name         | "graph"                                    | 戦略名（readonly） |

### クエリタイプ

| queryType    | 説明                                       | フォールバック            |
| ------------ | ------------------------------------------ | ------------------------- |
| local        | エンティティベースの詳細検索（デフォルト） | -                         |
| global       | コミュニティサマリベースの俯瞰検索         | localSearch               |
| relationship | エンティティ間のパス・関係検索             | 1エンティティ→localSearch |

### GraphSearchOptions

| オプション         | 型       | デフォルト | 説明                                    |
| ------------------ | -------- | ---------- | --------------------------------------- |
| queryType          | string   | "local"    | 検索タイプ（local/global/relationship） |
| entityThreshold    | number   | 0.5        | エンティティ類似度閾値（0-1）           |
| communityThreshold | number   | -          | コミュニティ類似度閾値（0-1）           |
| traversalDepth     | number   | 3          | トラバーサル深度（1-5）                 |
| relationTypes      | string[] | -          | 関係タイプフィルタ                      |

### 依存インターフェース

| インターフェース     | 必須 | 説明                      |
| -------------------- | ---- | ------------------------- |
| IKnowledgeGraphStore | ✅   | Knowledge Graphストレージ |
| IEmbeddingProvider   | ✅   | 埋め込み生成プロバイダー  |
| ICommunitySummarizer |      | コミュニティサマリ検索    |

### スコアリング

| 検索タイプ   | 計算式                                              |
| ------------ | --------------------------------------------------- |
| local        | `entitySimilarity × 0.6 + chunkRelevance × 0.4`     |
| relationship | `(1 / (1 + distance)) × 0.5 + chunkRelevance × 0.5` |
| global       | `summary.confidence`（コミュニティサマリの信頼度）  |

### 定数

| 定数名                   | 値   | 説明                       |
| ------------------------ | ---- | -------------------------- |
| MAX_QUERY_LENGTH         | 1000 | クエリ最大文字数           |
| MIN_LIMIT                | 1    | 最小取得件数               |
| MAX_LIMIT                | 100  | 最大取得件数               |
| DEFAULT_ENTITY_THRESHOLD | 0.5  | デフォルト類似度閾値       |
| DEFAULT_TRAVERSAL_DEPTH  | 3    | デフォルトトラバーサル深度 |
| MAX_TRAVERSAL_DEPTH      | 5    | 最大トラバーサル深度       |

### テスト品質

- **69テストケース**
- **94.54% Line Coverage**, **90.21% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/graph-search-strategy/outputs/phase-12/implementation-guide.md`

---

## Corrective RAG（CRAG）

検索結果の関連性をLLMで評価し、必要に応じて補正を行う自己修正RAGパイプライン。

**実装場所**: `packages/shared/src/services/search/crag/`

### アーキテクチャ

```
検索結果 → RelevanceEvaluator → アクション判定 → 補正処理 → CRAGResult
                 ↓                    ↓
              LLM評価        ┌────────┼────────┐
                             │        │        │
                          correct  ambiguous  incorrect
                             │        │        │
                          そのまま  フィルタ   破棄+
                          (Refine?) +Refine?   Web検索
```

### 主要インターフェース

#### IRelevanceEvaluator

関連性評価器

| メソッド   | 戻り値                                      | 説明                     |
| ---------- | ------------------------------------------- | ------------------------ |
| evaluate() | Promise<Result<RelevanceEvaluation, Error>> | 検索結果全体の関連性評価 |

#### ICorrectiveRAG

Corrective RAGプロセッサ

| メソッド  | 戻り値                             | 説明                 |
| --------- | ---------------------------------- | -------------------- |
| process() | Promise<Result<CRAGResult, Error>> | 検索結果を評価・補正 |

### 型定義

#### RelevanceAction

```typescript
type RelevanceAction = "correct" | "incorrect" | "ambiguous";
```

#### RelevanceEvaluation

| プロパティ       | 型                | 説明                          |
| ---------------- | ----------------- | ----------------------------- |
| overallScore     | number            | 全体スコア（0.0-1.0）加重平均 |
| action           | RelevanceAction   | 評価アクション                |
| individualScores | IndividualScore[] | 各結果の個別スコア            |
| reasoning        | string            | 評価の推論理由                |

#### IndividualScore

| プロパティ | 型      | 説明                    |
| ---------- | ------- | ----------------------- |
| chunkId    | ChunkId | チャンクID              |
| score      | number  | 関連性スコア（0.0-1.0） |
| reason     | string  | スコアの理由            |

#### CRAGResult

| プロパティ       | 型                  | 説明                          |
| ---------------- | ------------------- | ----------------------------- |
| results          | FusedSearchResult[] | 補正後の検索結果              |
| evaluation       | object              | 評価情報（下記参照）          |
| augmentedContext | string \| undefined | Web検索による補強コンテキスト |

**evaluation**:
| プロパティ | 型 | 説明 |
| -------------- | ------------------ | ---------------------- |
| relevanceScore | number | 関連性スコア |
| action | RelevanceAction | 実行されたアクション |
| corrections | CorrectionAction[] | 実行された補正アクション |

#### CorrectionAction

```typescript
type CorrectionAction =
  | { type: "keep"; reason: string }
  | { type: "discard"; reason: string }
  | { type: "refine"; refinedQuery: string }
  | { type: "web_search"; searchQuery: string }
  | { type: "expand"; expansionStrategy: string };
```

### 設定オプション

#### EvaluatorOptions

| プロパティ         | 型     | デフォルト | 説明                |
| ------------------ | ------ | ---------- | ------------------- |
| maxEvaluate        | number | 5          | 評価する最大結果数  |
| correctThreshold   | number | 0.7        | correct判定の閾値   |
| incorrectThreshold | number | 0.3        | incorrect判定の閾値 |

#### CRAGOptions

| プロパティ                | 型      | デフォルト | 説明                       |
| ------------------------- | ------- | ---------- | -------------------------- |
| enableWebSearch           | boolean | false      | Web検索補強を有効化        |
| enableRefinement          | boolean | false      | Knowledge Refinement有効化 |
| ambiguousFilterThreshold  | number  | 0.4        | Ambiguous時のフィルタ閾値  |
| minResultsBeforeWebSearch | number  | 3          | Web検索前の最小結果数      |
| webSearchLimit            | number  | 5          | Web検索結果数上限          |

### 外部依存インターフェース

#### ILLMClient

| メソッド   | 戻り値                         | 説明                 |
| ---------- | ------------------------------ | -------------------- |
| complete() | Promise<Result<string, Error>> | プロンプト補完を生成 |

**complete()パラメータ**:
| パラメータ | 型 | 説明 |
| ----------- | ------ | -------------------- |
| prompt | string | プロンプト |
| maxTokens | number | 最大トークン数 |
| temperature | number | 生成温度 |

#### IWebSearcher

| メソッド | 戻り値                                    | 説明          |
| -------- | ----------------------------------------- | ------------- |
| search() | Promise<Result<WebSearchResult[], Error>> | Web検索を実行 |

#### WebSearchResult

| プロパティ | 型     | 説明             |
| ---------- | ------ | ---------------- |
| title      | string | 結果のタイトル   |
| url        | string | 結果のURL        |
| snippet    | string | 結果のスニペット |

### 定数

#### CRAG_DEFAULTS

| 定数名                        | 値    | 説明                    |
| ----------------------------- | ----- | ----------------------- |
| MAX_EVALUATE                  | 5     | 評価する最大結果数      |
| CORRECT_THRESHOLD             | 0.7   | correct判定の閾値       |
| INCORRECT_THRESHOLD           | 0.3   | incorrect判定の閾値     |
| AMBIGUOUS_FILTER_THRESHOLD    | 0.4   | Ambiguous時フィルタ閾値 |
| MIN_RESULTS_BEFORE_WEB_SEARCH | 3     | Web検索前の最小結果数   |
| WEB_SEARCH_LIMIT              | 5     | Web検索結果数上限       |
| EVALUATION_TIMEOUT_MS         | 10000 | LLM評価タイムアウト(ms) |
| MAX_TOKENS                    | 500   | LLM評価の最大トークン数 |
| TEMPERATURE                   | 0     | LLM評価の温度           |

### 型ガード

| 関数名                | 説明                           |
| --------------------- | ------------------------------ |
| isCRAGResultCorrect   | CRAGResultがcorrect判定か      |
| isCRAGResultIncorrect | CRAGResultがincorrect判定か    |
| isCRAGResultAmbiguous | CRAGResultがambiguous判定か    |
| isKeepAction          | CorrectionActionがkeepか       |
| isDiscardAction       | CorrectionActionがdiscardか    |
| isWebSearchAction     | CorrectionActionがweb_searchか |

### アクション決定ロジック

| 条件               | アクション | 処理                                   |
| ------------------ | ---------- | -------------------------------------- |
| overallScore ≥ 0.7 | correct    | 結果をそのまま使用（Refineオプション） |
| overallScore ≤ 0.3 | incorrect  | 結果を破棄、Web検索で補強              |
| 0.3 < score < 0.7  | ambiguous  | 低スコア結果をフィルタ+Refine          |

### テスト品質

- **RelevanceEvaluator**: 12テストケース（RE-001〜RE-012）
- **CorrectiveRAG**: 11テストケース（CR-001〜CR-011）
- **カバレッジ**: Line 80%+, Branch 60%+, Function 80%+

**詳細参照**: `docs/30-workflows/corrective-rag/outputs/phase-12/implementation-guide.md`

---

## HybridRAG統合エンジン

4ステージパイプラインを統合した検索エンジン。Keyword/Semantic/Graph検索を並列実行し、RRF統合→Reranking→CRAG補正を行う。

**実装場所**: `packages/shared/src/services/search/hybrid-rag-engine.ts`

### HybridRAGEngineクラス

| メソッド | 戻り値                                    | 説明                |
| -------- | ----------------------------------------- | ------------------- |
| search() | Promise<Result<HybridRAGResponse, Error>> | HybridRAG検索を実行 |

**コンストラクタ**:

```typescript
constructor(
  queryClassifier: IQueryClassifier,
  searchStrategies: {
    keyword: ISearchStrategy;
    semantic: ISearchStrategy;
    graph: ISearchStrategy;
  },
  fusion: IFusionStrategy,
  reranker: IReranker,
  crag: ICorrectiveRAG | null,
  options?: HybridRAGOptions
)
```

### HybridRAGResponse

| プロパティ       | 型                  | 説明                       |
| ---------------- | ------------------- | -------------------------- |
| results          | HybridRAGResult[]   | 最終検索結果               |
| metadata         | object              | パイプライン実行メタデータ |
| augmentedContext | string \| undefined | CRAGによる補強コンテキスト |

**metadata**:

| プロパティ     | 型                    | 説明                   |
| -------------- | --------------------- | ---------------------- |
| queryType      | QueryType             | クエリタイプ           |
| searchWeights  | SearchWeights         | 検索戦略の重み         |
| pipelineStages | PipelineStageResult[] | 各ステージの実行結果   |
| totalDuration  | number                | 全体処理時間（ミリ秒） |
| cragAction     | RelevanceAction?      | CRAGの評価アクション   |

### HybridRAGResult

| プロパティ | 型                      | 説明                                   |
| ---------- | ----------------------- | -------------------------------------- |
| chunkId    | ChunkId                 | チャンクID                             |
| content    | string                  | コンテンツ本文                         |
| score      | number                  | 総合スコア（0.0-1.0）                  |
| sources    | SourceInfo[]            | ソース情報（検索戦略、ランク、スコア） |
| metadata   | Record<string, unknown> | メタデータ                             |

### PipelineStageResult

| プロパティ  | 型     | 説明               |
| ----------- | ------ | ------------------ |
| stage       | string | ステージ名         |
| duration    | number | 実行時間（ミリ秒） |
| inputCount  | number | 入力件数           |
| outputCount | number | 出力件数           |

**stage 値**: `"query_classification"` | `"triple_search"` | `"rrf_fusion"` | `"reranking"` | `"crag"`

### SearchOptions（HybridRAG）

| プロパティ            | 型      | デフォルト | 説明                         |
| --------------------- | ------- | ---------- | ---------------------------- |
| enableCRAG            | boolean | undefined  | CRAGを有効にするか           |
| searchLimitMultiplier | number  | 3          | 各戦略の結果数倍率           |
| vectorThreshold       | number  | undefined  | ベクトル検索の類似度閾値     |
| graphDepth            | number  | undefined  | グラフ検索のトラバーサル深度 |

### HybridRAGOptions

| プロパティ        | 型      | デフォルト | 説明                     |
| ----------------- | ------- | ---------- | ------------------------ |
| defaultEnableCRAG | boolean | true       | デフォルトでCRAGを有効化 |
| timeout           | number  | undefined  | タイムアウト（ミリ秒）   |

### 定数

| 定数名                          | 値  | 説明                 |
| ------------------------------- | --- | -------------------- |
| DEFAULT_LIMIT                   | 10  | デフォルト検索結果数 |
| MAX_LIMIT                       | 100 | 最大検索結果数       |
| DEFAULT_SEARCH_LIMIT_MULTIPLIER | 3   | デフォルト結果数倍率 |

---

## HybridRAGFactory

HybridRAGEngineのファクトリクラス。設定に基づいて適切なコンポーネントを組み立てる。

**実装場所**: `packages/shared/src/services/search/hybrid-rag-factory.ts`

### ファクトリメソッド

| メソッド           | 状態   | 説明                                     |
| ------------------ | ------ | ---------------------------------------- |
| createFull()       | 未実装 | フル機能エンジン（LLMベース、CRAG有効）  |
| createLite()       | 未実装 | 軽量版エンジン（ルールベース、CRAG無効） |
| createForTesting() | 実装済 | テスト用エンジン（モック注入）           |

### FullHybridRAGConfig

| プロパティ        | 型                   | 必須 | 説明                                    |
| ----------------- | -------------------- | ---- | --------------------------------------- |
| db                | DrizzleClient        | ✅   | データベースクライアント                |
| embeddingProvider | IEmbeddingProvider   | ✅   | 埋め込みプロバイダー                    |
| graphStore        | IKnowledgeGraphStore | ✅   | Knowledge Graphストア                   |
| llmClient         | ILLMClient           | ✅   | LLMクライアント                         |
| rerankerType      | string               | ✅   | "cohere" \| "voyage" \| "llm" \| "none" |
| enableCRAG        | boolean              |      | CRAG有効化                              |
| webSearcher       | IWebSearcher         |      | Web検索プロバイダー                     |

### LiteHybridRAGConfig

| プロパティ        | 型                   | 必須 | 説明                     |
| ----------------- | -------------------- | ---- | ------------------------ |
| db                | DrizzleClient        | ✅   | データベースクライアント |
| embeddingProvider | IEmbeddingProvider   | ✅   | 埋め込みプロバイダー     |
| graphStore        | IKnowledgeGraphStore | ✅   | Knowledge Graphストア    |

### TestMocks

| プロパティ       | 型               | 必須 | 説明                                       |
| ---------------- | ---------------- | ---- | ------------------------------------------ |
| queryClassifier  | IQueryClassifier | ✅   | クエリ分類器モック                         |
| keywordStrategy  | ISearchStrategy  | ✅   | キーワード検索モック                       |
| semanticStrategy | ISearchStrategy  | ✅   | セマンティック検索モック                   |
| graphStrategy    | ISearchStrategy  | ✅   | グラフ検索モック                           |
| fusion           | IFusionStrategy  |      | Fusionモック（デフォルト: RRFFusion）      |
| reranker         | IReranker        |      | Rerankerモック（デフォルト: NoOpReranker） |
| crag             | ICorrectiveRAG   |      | CRAGモック                                 |
| options          | HybridRAGOptions |      | エンジンオプション                         |

### テスト品質

- **39テストケース**（単体23 + 統合16）
- **94.32% Line Coverage**, **91.66% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/hybridrag-integration/outputs/phase-12/implementation-guide.md`

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                                 |
| ---------- | ---------- | ---------------------------------------------------------------------------------------- |
| 2026-01-19 | 6.10.0     | キーワード検索戦略詳細化: FTS5テーブル構造、クエリパターン、BM25正規化、データフロー追加 |
| 2026-01-17 | 6.9.0      | HybridRAGEngine、HybridRAGFactory セクション追加                                         |
| 2026-01-17 | 6.8.0      | Corrective RAG詳細セクション追加                                                         |
| 2026-01-13 | 6.7.0      | GraphSearchStrategy詳細セクション追加                                                    |
| 2026-01-12 | 6.6.0      | VectorSearchStrategy・CachedVectorSearchStrategy追加                                     |
| 2026-01-11 | 6.5.0      | KeywordSearchStrategyセクション追加                                                      |
| 2026-01-10 | 6.0.0      | HybridRAGSearcherインターフェース詳細化                                                  |

---

## 関連ドキュメント

- [RAG・ファイル選択インターフェース](./interfaces-rag.md)
- [Search Service API](./api-internal-search.md)
- [チャンク検索API](./api-internal-chunk-search.md)
