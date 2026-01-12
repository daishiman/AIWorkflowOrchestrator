# Phase 2: エラーハンドリング設計書

## 目的

VectorSearchStrategyで発生しうるエラーケースを列挙し、
統一的なエラーハンドリング方針を定義する。

---

## 1. エラーハンドリング方針

### 1.1 Result型パターン

```typescript
// 例外を投げずにResult型でエラーを返す
type SearchResult = Result<SearchResultItem[], Error>;
```

### 1.2 設計原則

| 原則                   | 説明                                         |
| ---------------------- | -------------------------------------------- |
| 例外を投げない         | すべてのエラーはResult.err()で返す           |
| エラーメッセージ標準化 | 一貫したフォーマットでエラーメッセージを生成 |
| 原因チェーン           | 元のエラーをcauseとして保持                  |
| リカバリ可能性表示     | リトライ可能かどうかを明示                   |

---

## 2. エラーケース一覧

### 2.1 入力バリデーションエラー

| エラーケース        | エラーメッセージ                                  | リトライ |
| ------------------- | ------------------------------------------------- | -------- |
| 空クエリ            | "Query cannot be empty"                           | No       |
| クエリ長超過        | "Query exceeds maximum length of 1000 characters" | No       |
| 無効なlimit         | "Limit must be between 1 and 100"                 | No       |
| 無効なminSimilarity | "minSimilarity must be between 0.0 and 1.0"       | No       |

### 2.2 埋め込み生成エラー

| エラーケース    | エラーメッセージ                                      | リトライ |
| --------------- | ----------------------------------------------------- | -------- |
| API接続エラー   | "Failed to generate embedding: Connection failed"     | Yes      |
| APIタイムアウト | "Failed to generate embedding: Request timeout"       | Yes      |
| APIレート制限   | "Failed to generate embedding: Rate limit exceeded"   | Yes      |
| 認証エラー      | "Failed to generate embedding: Authentication failed" | No       |
| モデル利用不可  | "Failed to generate embedding: Model not available"   | No       |

### 2.3 データベースエラー

| エラーケース       | エラーメッセージ                             | リトライ |
| ------------------ | -------------------------------------------- | -------- |
| 接続エラー         | "Database error: Connection failed"          | Yes      |
| クエリタイムアウト | "Database error: Query timeout"              | Yes      |
| ベクトル次元不一致 | "Database error: Vector dimensions mismatch" | No       |
| テーブル不存在     | "Database error: Table not found"            | No       |

---

## 3. エラー型定義

### 3.1 カスタムエラークラス

```typescript
/**
 * VectorSearchStrategy専用エラー基底クラス
 */
export class VectorSearchError extends Error {
  constructor(
    message: string,
    public readonly code: VectorSearchErrorCode,
    public readonly retriable: boolean,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "VectorSearchError";
  }
}

/**
 * エラーコード
 */
export enum VectorSearchErrorCode {
  // バリデーションエラー
  EMPTY_QUERY = "EMPTY_QUERY",
  QUERY_TOO_LONG = "QUERY_TOO_LONG",
  INVALID_LIMIT = "INVALID_LIMIT",
  INVALID_SIMILARITY = "INVALID_SIMILARITY",

  // 埋め込みエラー
  EMBEDDING_CONNECTION_FAILED = "EMBEDDING_CONNECTION_FAILED",
  EMBEDDING_TIMEOUT = "EMBEDDING_TIMEOUT",
  EMBEDDING_RATE_LIMITED = "EMBEDDING_RATE_LIMITED",
  EMBEDDING_AUTH_FAILED = "EMBEDDING_AUTH_FAILED",
  EMBEDDING_MODEL_UNAVAILABLE = "EMBEDDING_MODEL_UNAVAILABLE",

  // データベースエラー
  DB_CONNECTION_FAILED = "DB_CONNECTION_FAILED",
  DB_QUERY_TIMEOUT = "DB_QUERY_TIMEOUT",
  DB_VECTOR_MISMATCH = "DB_VECTOR_MISMATCH",
  DB_TABLE_NOT_FOUND = "DB_TABLE_NOT_FOUND",

  // その他
  UNKNOWN = "UNKNOWN",
}
```

### 3.2 エラーファクトリ

```typescript
/**
 * エラー生成ユーティリティ
 */
export const VectorSearchErrors = {
  emptyQuery(): VectorSearchError {
    return new VectorSearchError(
      "Query cannot be empty",
      VectorSearchErrorCode.EMPTY_QUERY,
      false,
    );
  },

  queryTooLong(length: number): VectorSearchError {
    return new VectorSearchError(
      `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters (got ${length})`,
      VectorSearchErrorCode.QUERY_TOO_LONG,
      false,
    );
  },

  invalidLimit(limit: number): VectorSearchError {
    return new VectorSearchError(
      `Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT} (got ${limit})`,
      VectorSearchErrorCode.INVALID_LIMIT,
      false,
    );
  },

  embeddingFailed(cause: Error): VectorSearchError {
    const isRetriable = isRetriableEmbeddingError(cause);
    return new VectorSearchError(
      `Failed to generate embedding: ${cause.message}`,
      categorizeEmbeddingError(cause),
      isRetriable,
      cause,
    );
  },

  databaseError(cause: Error): VectorSearchError {
    const isRetriable = isRetriableDatabaseError(cause);
    return new VectorSearchError(
      `Database error: ${cause.message}`,
      categorizeDatabaseError(cause),
      isRetriable,
      cause,
    );
  },
};
```

---

## 4. エラー分類ヘルパー

### 4.1 埋め込みエラー分類

```typescript
function categorizeEmbeddingError(error: Error): VectorSearchErrorCode {
  const message = error.message.toLowerCase();

  if (message.includes("timeout")) {
    return VectorSearchErrorCode.EMBEDDING_TIMEOUT;
  }
  if (message.includes("rate limit") || message.includes("429")) {
    return VectorSearchErrorCode.EMBEDDING_RATE_LIMITED;
  }
  if (message.includes("auth") || message.includes("401")) {
    return VectorSearchErrorCode.EMBEDDING_AUTH_FAILED;
  }
  if (message.includes("connection") || message.includes("network")) {
    return VectorSearchErrorCode.EMBEDDING_CONNECTION_FAILED;
  }
  if (message.includes("model") || message.includes("not found")) {
    return VectorSearchErrorCode.EMBEDDING_MODEL_UNAVAILABLE;
  }

  return VectorSearchErrorCode.UNKNOWN;
}

function isRetriableEmbeddingError(error: Error): boolean {
  const code = categorizeEmbeddingError(error);
  return [
    VectorSearchErrorCode.EMBEDDING_CONNECTION_FAILED,
    VectorSearchErrorCode.EMBEDDING_TIMEOUT,
    VectorSearchErrorCode.EMBEDDING_RATE_LIMITED,
  ].includes(code);
}
```

### 4.2 データベースエラー分類

```typescript
function categorizeDatabaseError(error: Error): VectorSearchErrorCode {
  const message = error.message.toLowerCase();

  if (message.includes("timeout")) {
    return VectorSearchErrorCode.DB_QUERY_TIMEOUT;
  }
  if (message.includes("connection") || message.includes("network")) {
    return VectorSearchErrorCode.DB_CONNECTION_FAILED;
  }
  if (message.includes("dimension") || message.includes("mismatch")) {
    return VectorSearchErrorCode.DB_VECTOR_MISMATCH;
  }
  if (message.includes("no such table") || message.includes("not found")) {
    return VectorSearchErrorCode.DB_TABLE_NOT_FOUND;
  }

  return VectorSearchErrorCode.UNKNOWN;
}

function isRetriableDatabaseError(error: Error): boolean {
  const code = categorizeDatabaseError(error);
  return [
    VectorSearchErrorCode.DB_CONNECTION_FAILED,
    VectorSearchErrorCode.DB_QUERY_TIMEOUT,
  ].includes(code);
}
```

---

## 5. エラーハンドリング実装

### 5.1 search() メソッド内

```typescript
async search(
  query: string,
  limit: number,
  filters?: SearchFilters,
): Promise<Result<SearchResultItem[], Error>> {
  // 1. 入力バリデーション
  if (!query || query.trim().length === 0) {
    return Result.err(VectorSearchErrors.emptyQuery());
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return Result.err(VectorSearchErrors.queryTooLong(query.length));
  }
  if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
    return Result.err(VectorSearchErrors.invalidLimit(limit));
  }

  // 2. 埋め込み生成
  try {
    const embeddingResult = await this.embeddingProvider.embed(query);
    queryVector = new Float32Array(embeddingResult.embedding);
  } catch (error) {
    return Result.err(
      VectorSearchErrors.embeddingFailed(
        error instanceof Error ? error : new Error(String(error)),
      ),
    );
  }

  // 3. ベクトル検索
  try {
    const results = await searchByVector(this.db, queryVector, options);
    return Result.ok(results.map(this.toSearchResultItem));
  } catch (error) {
    return Result.err(
      VectorSearchErrors.databaseError(
        error instanceof Error ? error : new Error(String(error)),
      ),
    );
  }
}
```

---

## 6. リトライ戦略（CachedVectorSearchStrategy用）

### 6.1 リトライ設定

```typescript
interface RetryConfig {
  /** 最大リトライ回数 */
  maxRetries: number;

  /** 初回待機時間（ミリ秒） */
  initialDelayMs: number;

  /** 最大待機時間（ミリ秒） */
  maxDelayMs: number;

  /** 指数バックオフ係数 */
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};
```

### 6.2 リトライ実装

```typescript
async function withRetry<T>(
  fn: () => Promise<Result<T, VectorSearchError>>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<Result<T, VectorSearchError>> {
  let lastError: VectorSearchError | null = null;
  let delayMs = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    const result = await fn();

    if (result.isOk()) {
      return result;
    }

    lastError = result.error;

    // リトライ不可能なエラー
    if (!lastError.retriable) {
      return result;
    }

    // 最後の試行
    if (attempt === config.maxRetries) {
      break;
    }

    // 待機
    await sleep(delayMs);
    delayMs = Math.min(delayMs * config.backoffMultiplier, config.maxDelayMs);
  }

  return Result.err(lastError!);
}
```

---

## 7. ログ出力

### 7.1 エラーログフォーマット

```typescript
function logError(error: VectorSearchError, context: object): void {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      component: "VectorSearchStrategy",
      code: error.code,
      message: error.message,
      retriable: error.retriable,
      cause: error.cause?.message,
      ...context,
    }),
  );
}
```

---

## まとめ

| 項目             | 設計内容                                    |
| ---------------- | ------------------------------------------- |
| エラー返却方式   | Result.err()（例外を投げない）              |
| カスタムエラー型 | VectorSearchError（code, retriable, cause） |
| エラー分類       | バリデーション/埋め込み/データベース        |
| リトライ戦略     | 指数バックオフ（最大3回）                   |
| リトライ可能判定 | retriableフラグで明示                       |
