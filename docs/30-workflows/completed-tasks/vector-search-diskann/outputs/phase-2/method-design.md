# Phase 2: メソッド詳細設計書

## 目的

VectorSearchStrategyの各メソッドの入出力と処理フローを詳細に定義する。

---

## 1. search() メソッド

### シグネチャ

```typescript
async search(
  query: string,
  limit: number,
  filters?: SearchFilters,
): Promise<Result<SearchResultItem[], Error>>
```

### 入力パラメータ

| パラメータ | 型            | 必須 | デフォルト | 説明                     |
| ---------- | ------------- | ---- | ---------- | ------------------------ |
| query      | string        | Yes  | -          | 検索クエリ（1-1000文字） |
| limit      | number        | Yes  | -          | 最大取得件数（1-100）    |
| filters    | SearchFilters | No   | undefined  | 検索フィルター           |

### 出力

```typescript
Result<SearchResultItem[], Error>;
```

- **成功時**: `Result.ok(SearchResultItem[])`
- **失敗時**: `Result.err(Error)`

### 処理フロー

```typescript
async search(
  query: string,
  limit: number,
  filters?: SearchFilters,
): Promise<Result<SearchResultItem[], Error>> {
  const startTime = performance.now();

  // 1. 入力バリデーション
  const validationResult = this.validateInput(query, limit);
  if (validationResult.isErr()) {
    return Result.err(validationResult.error);
  }

  // 2. クエリ埋め込み生成
  const embeddingResult = await this.generateQueryEmbedding(query);
  if (embeddingResult.isErr()) {
    return Result.err(embeddingResult.error);
  }
  const queryVector = embeddingResult.value;

  // 3. ベクトル検索実行
  try {
    const vectorResults = await this.executeVectorSearch(
      queryVector,
      limit,
      filters,
    );

    // 4. 結果変換
    const results = vectorResults.map((r) => this.toSearchResultItem(r));

    // 5. メトリクス更新
    const processingTime = performance.now() - startTime;
    this.lastMetric = {
      enabled: true,
      resultCount: results.length,
      processingTime,
      topScore: results.length > 0 ? results[0].score : 0,
    };

    return Result.ok(results);
  } catch (error) {
    return Result.err(
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}
```

---

## 2. getMetrics() メソッド

### シグネチャ

```typescript
getMetrics(): StrategyMetric
```

### 入力パラメータ

なし

### 出力

```typescript
interface StrategyMetric {
  readonly enabled: boolean;
  readonly resultCount: number;
  readonly processingTime: number; // ミリ秒
  readonly topScore: number; // 0.0-1.0
}
```

### 処理フロー

```typescript
getMetrics(): StrategyMetric {
  return { ...this.lastMetric };
}
```

---

## 3. generateQueryEmbedding() メソッド（プライベート）

### シグネチャ

```typescript
private async generateQueryEmbedding(
  query: string,
): Promise<Result<Float32Array, Error>>
```

### 入力パラメータ

| パラメータ | 型     | 必須 | 説明       |
| ---------- | ------ | ---- | ---------- |
| query      | string | Yes  | 検索クエリ |

### 出力

```typescript
Result<Float32Array, Error>;
```

### 処理フロー

```typescript
private async generateQueryEmbedding(
  query: string,
): Promise<Result<Float32Array, Error>> {
  try {
    const result = await this.embeddingProvider.embed(query);
    const vector = new Float32Array(result.embedding);
    return Result.ok(vector);
  } catch (error) {
    return Result.err(
      new Error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}
```

---

## 4. executeVectorSearch() メソッド（プライベート）

### シグネチャ

```typescript
private async executeVectorSearch(
  queryVector: Float32Array,
  limit: number,
  filters?: SearchFilters,
): Promise<VectorSearchResult[]>
```

### 入力パラメータ

| パラメータ  | 型            | 必須 | 説明           |
| ----------- | ------------- | ---- | -------------- |
| queryVector | Float32Array  | Yes  | クエリ埋め込み |
| limit       | number        | Yes  | 最大取得件数   |
| filters     | SearchFilters | No   | 検索フィルター |

### 出力

```typescript
VectorSearchResult[]
```

### 処理フロー

```typescript
private async executeVectorSearch(
  queryVector: Float32Array,
  limit: number,
  filters?: SearchFilters,
): Promise<VectorSearchResult[]> {
  // SearchFilters → VectorSearchOptions 変換
  const options: VectorSearchOptions = {
    limit,
    minSimilarity: filters?.minRelevance,
    fileIds: filters?.fileIds?.map((id) => id.toString()) ?? undefined,
  };

  return searchByVector(this.db, queryVector, options);
}
```

---

## 5. toSearchResultItem() メソッド（プライベート）

### シグネチャ

```typescript
private toSearchResultItem(result: VectorSearchResult): SearchResultItem
```

### 入力パラメータ

| パラメータ | 型                 | 必須 | 説明             |
| ---------- | ------------------ | ---- | ---------------- |
| result     | VectorSearchResult | Yes  | ベクトル検索結果 |

### 出力

```typescript
SearchResultItem;
```

### 処理フロー

```typescript
private toSearchResultItem(result: VectorSearchResult): SearchResultItem {
  return {
    id: result.chunkId,
    type: "chunk",
    score: result.similarity,
    relevance: {
      combined: result.similarity,
      keyword: 0,
      semantic: result.similarity,
      graph: 0,
      rerank: null,
      crag: null,
    },
    content: {
      text: result.content,
      summary: result.contextualContent,
      contextBefore: null,
      contextAfter: null,
    },
    highlights: [],
    sources: {
      chunkId: result.chunkId as ChunkId,
      fileId: null, // 別途取得が必要な場合はJOINで取得
      entityIds: [],
      communityId: null,
      relationIds: [],
    },
  };
}
```

---

## 6. validateInput() メソッド（プライベート）

### シグネチャ

```typescript
private validateInput(query: string, limit: number): Result<void, Error>
```

### 入力パラメータ

| パラメータ | 型     | 必須 | 説明         |
| ---------- | ------ | ---- | ------------ |
| query      | string | Yes  | 検索クエリ   |
| limit      | number | Yes  | 最大取得件数 |

### 出力

```typescript
Result<void, Error>;
```

### 処理フロー

```typescript
private validateInput(query: string, limit: number): Result<void, Error> {
  // クエリバリデーション
  if (!query || query.trim().length === 0) {
    return Result.err(new Error("Query cannot be empty"));
  }
  if (query.length > 1000) {
    return Result.err(new Error("Query exceeds maximum length of 1000 characters"));
  }

  // limitバリデーション
  if (limit < 1 || limit > 100) {
    return Result.err(new Error("Limit must be between 1 and 100"));
  }

  return Result.ok(undefined);
}
```

---

## 7. 定数定義

```typescript
/**
 * 最大クエリ長
 */
export const MAX_QUERY_LENGTH = 1000;

/**
 * 最小取得件数
 */
export const MIN_LIMIT = 1;

/**
 * 最大取得件数
 */
export const MAX_LIMIT = 100;

/**
 * デフォルト取得件数
 */
export const DEFAULT_LIMIT = 20;
```

---

## 8. エラーメッセージ

| エラー種別         | メッセージ                                        |
| ------------------ | ------------------------------------------------- |
| 空クエリ           | "Query cannot be empty"                           |
| クエリ長超過       | "Query exceeds maximum length of 1000 characters" |
| 無効なlimit        | "Limit must be between 1 and 100"                 |
| 埋め込み生成失敗   | "Failed to generate embedding: {詳細}"            |
| データベースエラー | "Database error: {詳細}"                          |

---

## まとめ

| メソッド                 | 役割               | 可視性  |
| ------------------------ | ------------------ | ------- |
| search()                 | メイン検索メソッド | public  |
| getMetrics()             | メトリクス取得     | public  |
| generateQueryEmbedding() | 埋め込み生成       | private |
| executeVectorSearch()    | ベクトル検索実行   | private |
| toSearchResultItem()     | 結果変換           | private |
| validateInput()          | 入力バリデーション | private |
