# VectorSearchStrategy API仕様書

## Phase 12 Task 1: API仕様ドキュメント

---

## 概要

libSQL/TursoのDiskANNベクトルインデックスを使用したセマンティック検索ストラテジー。
HybridRAGのTriple Search（Keyword/Semantic/Graph）のSemantic検索部分を担当する。

---

## クラス一覧

| クラス名                   | 説明                             | インターフェース |
| -------------------------- | -------------------------------- | ---------------- |
| VectorSearchStrategy       | 基本ベクトル検索ストラテジー     | ISearchStrategy  |
| CachedVectorSearchStrategy | 埋め込みキャッシュ付きバージョン | ISearchStrategy  |

---

## VectorSearchStrategy

### 基本情報

| 項目       | 値                                                                         |
| ---------- | -------------------------------------------------------------------------- |
| パッケージ | `@repo/shared/services/search/strategies`                                  |
| 実装       | ISearchStrategy                                                            |
| name       | `"semantic"`                                                               |
| ファイル   | `packages/shared/src/services/search/strategies/vector-search-strategy.ts` |

### コンストラクタ

```typescript
constructor(
  db: LibSQLDatabase<Record<string, never>>,
  embeddingProvider: IEmbeddingProvider
)
```

| パラメータ        | 型                                    | 説明                             |
| ----------------- | ------------------------------------- | -------------------------------- |
| db                | LibSQLDatabase<Record<string, never>> | libSQL/Tursoデータベース接続     |
| embeddingProvider | IEmbeddingProvider                    | 埋め込みプロバイダー（OpenAI等） |

### メソッド

#### search()

セマンティック検索を実行する。

```typescript
async search(
  query: string,
  limit: number,
  filters?: SearchFilters
): Promise<Result<SearchResultItem[], Error>>
```

**パラメータ**

| パラメータ | 型            | 必須 | デフォルト | 説明                      |
| ---------- | ------------- | ---- | ---------- | ------------------------- |
| query      | string        | ○    | -          | 検索クエリ（1〜1000文字） |
| limit      | number        | ○    | -          | 取得件数（1〜100）        |
| filters    | SearchFilters | ×    | undefined  | 検索フィルター            |

**SearchFilters**

```typescript
interface SearchFilters {
  fileIds?: FileId[]; // 対象ファイルID
  fileTypes?: string[]; // ファイルタイプ（未実装）
  workspaceIds?: string[]; // ワークスペースID（未実装）
  minRelevance?: number; // 最小類似度閾値（0〜1）
  dateRange?: DateRange; // 日付範囲（未実装）
}
```

**戻り値**

```typescript
Result<SearchResultItem[], Error>;
```

- 成功時: `Ok<SearchResultItem[]>` - 検索結果配列
- 失敗時: `Err<Error>` - エラー

**SearchResultItem**

```typescript
interface SearchResultItem {
  id: string; // チャンクID
  type: "chunk"; // 結果タイプ
  score: number; // スコア（0〜1）
  relevance: {
    combined: number; // 統合スコア
    keyword: number; // キーワードスコア（0）
    semantic: number; // セマンティックスコア
    graph: number; // グラフスコア（0）
    rerank: number | null;
    crag: number | null;
  };
  content: {
    text: string; // チャンクテキスト
    summary: string | null; // 要約（contextualContent）
    contextBefore: string | null;
    contextAfter: string | null;
  };
  highlights: string[]; // ハイライト
  sources: {
    chunkId: ChunkId; // チャンクID
    fileId: FileId | null; // ファイルID
    entityIds: string[]; // エンティティID
    communityId: string | null;
    relationIds: string[];
  };
}
```

**エラーケース**

| エラーメッセージ                                    | 条件                     |
| --------------------------------------------------- | ------------------------ |
| `"Query cannot be empty"`                           | クエリが空または空白のみ |
| `"Query exceeds maximum length of 1000 characters"` | クエリが1000文字超       |
| `"Limit must be between 1 and 100"`                 | limitが範囲外            |
| `"Failed to generate embedding: {原因}"`            | 埋め込み生成失敗         |

#### getMetrics()

最後の検索実行のメトリクスを取得する。

```typescript
getMetrics(): StrategyMetric
```

**戻り値**

```typescript
interface StrategyMetric {
  enabled: boolean; // 有効フラグ
  resultCount: number; // 結果数
  processingTime: number; // 処理時間（ミリ秒）
  topScore: number; // 最高スコア
}
```

---

## CachedVectorSearchStrategy

### 基本情報

| 項目       | 値                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| パッケージ | `@repo/shared/services/search/strategies`                                         |
| 実装       | ISearchStrategy                                                                   |
| name       | `"semantic"`                                                                      |
| ファイル   | `packages/shared/src/services/search/strategies/cached-vector-search-strategy.ts` |

### コンストラクタ

```typescript
constructor(
  db: LibSQLDatabase<Record<string, never>>,
  embeddingProvider: IEmbeddingProvider,
  options?: CachedVectorSearchOptions
)
```

| パラメータ        | 型                        | 必須 | 説明                   |
| ----------------- | ------------------------- | ---- | ---------------------- |
| db                | LibSQLDatabase            | ○    | libSQLデータベース接続 |
| embeddingProvider | IEmbeddingProvider        | ○    | 埋め込みプロバイダー   |
| options           | CachedVectorSearchOptions | ×    | キャッシュ設定         |

**CachedVectorSearchOptions**

```typescript
interface CachedVectorSearchOptions {
  cacheMaxAge?: number; // キャッシュ有効期限（ミリ秒）デフォルト: 300000（5分）
  maxCacheSize?: number; // 最大キャッシュサイズ デフォルト: 1000
}
```

### メソッド

#### search()

VectorSearchStrategyと同一シグネチャ。キャッシュヒット時は埋め込み生成をスキップ。

#### getMetrics()

VectorSearchStrategyと同一。

#### clearCache()

キャッシュをクリアし、統計をリセットする。

```typescript
clearCache(): void
```

#### getCacheStats()

キャッシュ統計を取得する。

```typescript
getCacheStats(): CacheStats
```

**戻り値**

```typescript
interface CacheStats {
  size: number; // 現在のキャッシュサイズ
  maxSize: number; // 最大キャッシュサイズ
  hits: number; // キャッシュヒット数
  misses: number; // キャッシュミス数
  hitRate: number; // ヒット率（0〜1）
}
```

---

## ISearchStrategy インターフェース

```typescript
interface ISearchStrategy {
  readonly name: string;

  search(
    query: string,
    limit: number,
    filters?: SearchFilters,
  ): Promise<Result<SearchResultItem[], Error>>;

  getMetrics(): StrategyMetric;
}
```

---

## Result型

```typescript
type Result<T, E = Error> = Ok<T> | Err<E>;

class Ok<T> {
  readonly value: T;
  isOk(): true;
  isErr(): false;
}

class Err<E> {
  readonly error: E;
  isOk(): false;
  isErr(): true;
}

function ok<T>(value: T): Ok<T>;
function err<E>(error: E): Err<E>;
```

---

## 定数

| 定数名           | 値   | 説明               |
| ---------------- | ---- | ------------------ |
| MAX_QUERY_LENGTH | 1000 | 最大クエリ長       |
| MIN_LIMIT        | 1    | 最小取得件数       |
| MAX_LIMIT        | 100  | 最大取得件数       |
| DEFAULT_LIMIT    | 20   | デフォルト取得件数 |

---

## Phase 12 Task 1 完了記録

| 項目     | 内容           |
| -------- | -------------- |
| 完了日時 | 2026-01-12     |
| 成果物   | 本ドキュメント |
| 判定     | 完了           |
