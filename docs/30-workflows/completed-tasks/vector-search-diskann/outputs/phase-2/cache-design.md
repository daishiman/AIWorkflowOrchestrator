# Phase 2: CachedVectorSearchStrategy設計書

## 目的

埋め込みキャッシュ付きのVectorSearchStrategy派生クラスを設計し、
同一クエリの再検索時のパフォーマンスを向上させる。

---

## 1. クラス構造

### 1.1 クラス図

```typescript
/**
 * キャッシュ付きベクトル検索戦略
 *
 * @description
 * クエリ埋め込みをキャッシュし、同一クエリの再検索を高速化
 */
export class CachedVectorSearchStrategy implements ISearchStrategy {
  // ========================================
  // プロパティ
  // ========================================

  /** 戦略名 */
  readonly name = "semantic";

  /** 埋め込みキャッシュ */
  private readonly cache = new Map<string, CacheEntry>();

  /** キャッシュ有効期限（ミリ秒） */
  private readonly cacheMaxAge: number;

  /** 最大キャッシュサイズ */
  private readonly maxCacheSize: number;

  /** 最後の検索メトリクス */
  private lastMetric: StrategyMetric = {
    enabled: true,
    resultCount: 0,
    processingTime: 0,
    topScore: 0,
  };

  // ========================================
  // コンストラクタ
  // ========================================

  constructor(
    private readonly db: LibSQLDatabase<Record<string, never>>,
    private readonly embeddingProvider: IEmbeddingProvider,
    options?: CachedVectorSearchStrategyOptions,
  ) {
    this.cacheMaxAge = options?.cacheMaxAge ?? DEFAULT_CACHE_MAX_AGE;
    this.maxCacheSize = options?.maxCacheSize ?? DEFAULT_MAX_CACHE_SIZE;
  }

  // ========================================
  // パブリックメソッド
  // ========================================

  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
  ): Promise<Result<SearchResultItem[], Error>>;

  getMetrics(): StrategyMetric;

  /**
   * キャッシュをクリア
   */
  clearCache(): void;

  /**
   * キャッシュ統計を取得
   */
  getCacheStats(): CacheStats;

  // ========================================
  // プライベートメソッド
  // ========================================

  private getCacheKey(query: string): string;
  private getFromCache(key: string): Float32Array | null;
  private setToCache(key: string, embedding: Float32Array): void;
  private cleanupExpiredEntries(): void;
}
```

---

## 2. キャッシュエントリ

### 2.1 型定義

```typescript
/**
 * キャッシュエントリ
 */
interface CacheEntry {
  /** 埋め込みベクトル */
  embedding: Float32Array;

  /** 作成時刻（ミリ秒） */
  createdAt: number;

  /** 最終アクセス時刻（ミリ秒） */
  lastAccessedAt: number;

  /** アクセス回数 */
  accessCount: number;
}
```

### 2.2 キャッシュ統計

```typescript
/**
 * キャッシュ統計情報
 */
interface CacheStats {
  /** 現在のエントリ数 */
  size: number;

  /** 最大エントリ数 */
  maxSize: number;

  /** ヒット数 */
  hits: number;

  /** ミス数 */
  misses: number;

  /** ヒット率（0.0-1.0） */
  hitRate: number;
}
```

---

## 3. キャッシュ戦略

### 3.1 キャッシュキー生成

```typescript
private getCacheKey(query: string): string {
  // 正規化: 小文字化 + 前後空白除去
  return query.toLowerCase().trim();
}
```

### 3.2 キャッシュ有効期限

```typescript
/**
 * デフォルトキャッシュ有効期限: 5分
 */
export const DEFAULT_CACHE_MAX_AGE = 5 * 60 * 1000;

private isExpired(entry: CacheEntry): boolean {
  return Date.now() - entry.createdAt > this.cacheMaxAge;
}
```

### 3.3 キャッシュサイズ制限

```typescript
/**
 * デフォルト最大キャッシュサイズ: 1000エントリ
 */
export const DEFAULT_MAX_CACHE_SIZE = 1000;

private evictIfNeeded(): void {
  if (this.cache.size >= this.maxCacheSize) {
    // LRU: 最も古いアクセスのエントリを削除
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessedAt < oldestTime) {
        oldestTime = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
```

---

## 4. 検索処理フロー

### 4.1 search() メソッド

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

  // 2. キャッシュキー生成
  const cacheKey = this.getCacheKey(query);

  // 3. キャッシュ確認
  let queryVector: Float32Array;
  const cachedEmbedding = this.getFromCache(cacheKey);

  if (cachedEmbedding) {
    // キャッシュヒット
    queryVector = cachedEmbedding;
    this.cacheStats.hits++;
  } else {
    // キャッシュミス: 埋め込み生成
    const embeddingResult = await this.generateQueryEmbedding(query);
    if (embeddingResult.isErr()) {
      return Result.err(embeddingResult.error);
    }
    queryVector = embeddingResult.value;
    this.setToCache(cacheKey, queryVector);
    this.cacheStats.misses++;
  }

  // 4. ベクトル検索実行
  try {
    const vectorResults = await this.executeVectorSearch(
      queryVector,
      limit,
      filters,
    );

    // 5. 結果変換
    const results = vectorResults.map((r) => this.toSearchResultItem(r));

    // 6. メトリクス更新
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

## 5. キャッシュ管理

### 5.1 getFromCache()

```typescript
private getFromCache(key: string): Float32Array | null {
  const entry = this.cache.get(key);

  if (!entry) {
    return null;
  }

  if (this.isExpired(entry)) {
    this.cache.delete(key);
    return null;
  }

  // アクセス情報更新
  entry.lastAccessedAt = Date.now();
  entry.accessCount++;

  return entry.embedding;
}
```

### 5.2 setToCache()

```typescript
private setToCache(key: string, embedding: Float32Array): void {
  // 期限切れエントリのクリーンアップ（10回に1回）
  if (Math.random() < 0.1) {
    this.cleanupExpiredEntries();
  }

  // サイズ制限チェック
  this.evictIfNeeded();

  const now = Date.now();
  this.cache.set(key, {
    embedding,
    createdAt: now,
    lastAccessedAt: now,
    accessCount: 1,
  });
}
```

### 5.3 cleanupExpiredEntries()

```typescript
private cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of this.cache) {
    if (now - entry.createdAt > this.cacheMaxAge) {
      this.cache.delete(key);
    }
  }
}
```

---

## 6. オプション型定義

### 6.1 CachedVectorSearchStrategyOptions

```typescript
/**
 * CachedVectorSearchStrategy固有のオプション
 */
export interface CachedVectorSearchStrategyOptions extends VectorSearchStrategyOptions {
  /**
   * キャッシュ有効期限（ミリ秒）
   * @default 300000 (5分)
   */
  cacheMaxAge?: number;

  /**
   * 最大キャッシュサイズ（エントリ数）
   * @default 1000
   */
  maxCacheSize?: number;
}
```

---

## 7. 使用例

### 7.1 基本使用

```typescript
const cachedStrategy = new CachedVectorSearchStrategy(db, embeddingProvider, {
  cacheMaxAge: 10 * 60 * 1000, // 10分
  maxCacheSize: 500,
});

// 初回検索（キャッシュミス）
const result1 = await cachedStrategy.search("検索クエリ", 10);

// 同一クエリ再検索（キャッシュヒット）
const result2 = await cachedStrategy.search("検索クエリ", 10);

// キャッシュ統計確認
const stats = cachedStrategy.getCacheStats();
console.log(`Hit rate: ${stats.hitRate}`);
```

### 7.2 キャッシュクリア

```typescript
// 手動クリア
cachedStrategy.clearCache();
```

---

## 8. 設計上の決定事項

| 項目           | 決定                       | 理由                     |
| -------------- | -------------------------- | ------------------------ |
| キャッシュ対象 | 埋め込みベクトルのみ       | 検索結果はフィルタ依存   |
| キャッシュキー | 正規化クエリ文字列         | 大文字小文字・空白正規化 |
| 有効期限       | 5分デフォルト              | 埋め込みは安定している   |
| 削除戦略       | LRU + 期限切れ             | メモリ効率とヒット率両立 |
| スレッドセーフ | 非対応（単一スレッド前提） | Electron環境限定         |

---

## まとめ

| 項目           | 設計内容                     |
| -------------- | ---------------------------- |
| キャッシュ対象 | クエリ埋め込みベクトル       |
| キャッシュ戦略 | LRU + TTL（5分）             |
| 最大サイズ     | 1000エントリ                 |
| キャッシュキー | `query.toLowerCase().trim()` |
| 統計情報       | ヒット数、ミス数、ヒット率   |
