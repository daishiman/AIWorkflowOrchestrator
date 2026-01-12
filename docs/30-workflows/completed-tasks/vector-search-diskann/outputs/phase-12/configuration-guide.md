# VectorSearchStrategy 設定ガイド

## Phase 12 Task 4: 設定ガイド作成

---

## 1. 設定項目一覧

### 1.1 VectorSearchStrategy設定

VectorSearchStrategyはコンストラクタで設定。追加のオプションはなし。

| 項目              | 型                 | 必須 | 説明                   |
| ----------------- | ------------------ | ---- | ---------------------- |
| db                | LibSQLDatabase     | ○    | libSQLデータベース接続 |
| embeddingProvider | IEmbeddingProvider | ○    | 埋め込みプロバイダー   |

### 1.2 CachedVectorSearchStrategy設定

| 設定項目     | 型     | デフォルト | 説明                         |
| ------------ | ------ | ---------- | ---------------------------- |
| cacheMaxAge  | number | 300000     | キャッシュ有効期限（ミリ秒） |
| maxCacheSize | number | 1000       | 最大キャッシュエントリ数     |

### 1.3 検索パラメータ定数

| 定数名           | 値   | 説明               |
| ---------------- | ---- | ------------------ |
| MAX_QUERY_LENGTH | 1000 | 最大クエリ文字数   |
| MIN_LIMIT        | 1    | 最小取得件数       |
| MAX_LIMIT        | 100  | 最大取得件数       |
| DEFAULT_LIMIT    | 20   | デフォルト取得件数 |

---

## 2. 環境変数設定

### 2.1 データベース設定

```bash
# libSQL/Turso接続URL
DATABASE_URL="libsql://your-database.turso.io"

# Turso認証トークン（本番環境）
DATABASE_AUTH_TOKEN="your-auth-token"

# ローカル開発（libSQL）
DATABASE_URL="file:./local.db"
```

### 2.2 埋め込みAPI設定

```bash
# OpenAI API Key
OPENAI_API_KEY="sk-..."

# 埋め込みモデル（オプション）
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
```

### 2.3 環境変数ファイル例（.env）

```bash
# Database
DATABASE_URL="libsql://your-db.turso.io"
DATABASE_AUTH_TOKEN="eyJ..."

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"

# Optional: Cache settings (for application code)
VECTOR_CACHE_MAX_AGE_MS="300000"
VECTOR_CACHE_MAX_SIZE="1000"
```

---

## 3. データベース設定

### 3.1 libSQL接続設定

```typescript
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

// ローカル開発
const localClient = createClient({
  url: "file:./local.db",
});

// Turso本番
const tursoClient = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(tursoClient);
```

### 3.2 DiskANNインデックス作成

```sql
-- チャンクテーブルにベクトルカラムが必要
ALTER TABLE chunks ADD COLUMN embedding F32_BLOB(1536);

-- DiskANNインデックス作成
CREATE INDEX idx_chunks_embedding ON chunks (
  libsql_vector_idx(embedding, 'metric=cosine', 'compress_neighbors=float8', 'max_neighbors=50')
);
```

### 3.3 インデックス確認

```sql
-- インデックス確認
SELECT name, type FROM sqlite_master WHERE type='index' AND name LIKE '%embedding%';

-- ベクトル検索テスト
SELECT
  chunk_id,
  content,
  vector_distance_cos(embedding, vector('[0.1, 0.2, ...]')) as distance
FROM chunks
ORDER BY distance
LIMIT 10;
```

---

## 4. 埋め込みプロバイダー設定

### 4.1 OpenAI埋め込みプロバイダー

```typescript
import { OpenAIEmbeddingProvider } from "@repo/shared/services/embedding";

const embeddingProvider = new OpenAIEmbeddingProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-small", // または "text-embedding-3-large"
});
```

### 4.2 IEmbeddingProviderインターフェース

```typescript
interface IEmbeddingProvider {
  embed(text: string): Promise<EmbeddingResult>;
}

interface EmbeddingResult {
  embedding: number[]; // Float32配列に変換される
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}
```

---

## 5. キャッシュ設定

### 5.1 キャッシュ設定例

```typescript
import { CachedVectorSearchStrategy } from "@repo/shared/services/search/strategies";

// デフォルト設定
const defaultStrategy = new CachedVectorSearchStrategy(db, embeddingProvider);

// 長時間キャッシュ（静的コンテンツ向け）
const longCacheStrategy = new CachedVectorSearchStrategy(
  db,
  embeddingProvider,
  {
    cacheMaxAge: 30 * 60 * 1000, // 30分
    maxCacheSize: 2000,
  },
);

// 短時間キャッシュ（動的コンテンツ向け）
const shortCacheStrategy = new CachedVectorSearchStrategy(
  db,
  embeddingProvider,
  {
    cacheMaxAge: 1 * 60 * 1000, // 1分
    maxCacheSize: 500,
  },
);

// メモリ節約設定
const lowMemoryStrategy = new CachedVectorSearchStrategy(
  db,
  embeddingProvider,
  {
    cacheMaxAge: 5 * 60 * 1000,
    maxCacheSize: 100, // 少ないエントリ数
  },
);
```

### 5.2 キャッシュ設定の推奨値

| ユースケース     | cacheMaxAge | maxCacheSize | 説明           |
| ---------------- | ----------- | ------------ | -------------- |
| 一般的な使用     | 5分         | 1000         | デフォルト設定 |
| 高頻度検索       | 15分        | 2000         | ヒット率重視   |
| リアルタイム更新 | 1分         | 500          | 鮮度重視       |
| メモリ制限環境   | 5分         | 100          | メモリ節約     |
| バッチ処理       | 30分        | 5000         | 大量処理向け   |

---

## 6. 検索フィルター設定

### 6.1 SearchFilters

```typescript
interface SearchFilters {
  fileIds?: FileId[]; // 対象ファイルID
  fileTypes?: string[]; // ファイルタイプ（未実装）
  workspaceIds?: string[]; // ワークスペースID（未実装）
  minRelevance?: number; // 最小類似度閾値（0〜1）
  dateRange?: DateRange; // 日付範囲（未実装）
}
```

### 6.2 minRelevance設定ガイド

| 値  | 用途           | 説明                 |
| --- | -------------- | -------------------- |
| 0.0 | すべての結果   | フィルタなし         |
| 0.3 | 緩いフィルタ   | 大まかに関連する結果 |
| 0.5 | 標準フィルタ   | 中程度の関連性       |
| 0.7 | 厳しいフィルタ | 高い関連性のみ       |
| 0.9 | 非常に厳しい   | ほぼ完全一致         |

---

## 7. パフォーマンスチューニング

### 7.1 推奨設定

```typescript
// 本番環境推奨設定
const productionStrategy = new CachedVectorSearchStrategy(
  db,
  embeddingProvider,
  {
    cacheMaxAge: 10 * 60 * 1000, // 10分
    maxCacheSize: 1500,
  },
);

// 検索時の推奨limit
const result = await strategy.search(query, 20, {
  minRelevance: 0.3, // 低品質結果を除外
});
```

### 7.2 メモリ使用量の目安

| maxCacheSize | 埋め込みサイズ | 概算メモリ使用量 |
| ------------ | -------------- | ---------------- |
| 100          | 1536次元       | ~0.6 MB          |
| 500          | 1536次元       | ~3 MB            |
| 1000         | 1536次元       | ~6 MB            |
| 2000         | 1536次元       | ~12 MB           |
| 5000         | 1536次元       | ~30 MB           |

計算式: `maxCacheSize × 1536 × 4 bytes = メモリ使用量`

---

## 8. 統合設定例

### 8.1 完全な初期化コード

```typescript
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { OpenAIEmbeddingProvider } from "@repo/shared/services/embedding";
import { CachedVectorSearchStrategy } from "@repo/shared/services/search/strategies";

// 1. データベース接続
const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client);

// 2. 埋め込みプロバイダー
const embeddingProvider = new OpenAIEmbeddingProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
});

// 3. 検索戦略
const vectorStrategy = new CachedVectorSearchStrategy(db, embeddingProvider, {
  cacheMaxAge: parseInt(process.env.VECTOR_CACHE_MAX_AGE_MS || "300000"),
  maxCacheSize: parseInt(process.env.VECTOR_CACHE_MAX_SIZE || "1000"),
});

// 4. 使用
const result = await vectorStrategy.search("検索クエリ", 10);
```

---

## Phase 12 Task 4 完了記録

| 項目     | 内容           |
| -------- | -------------- |
| 完了日時 | 2026-01-12     |
| 成果物   | 本ドキュメント |
| 判定     | 完了           |
