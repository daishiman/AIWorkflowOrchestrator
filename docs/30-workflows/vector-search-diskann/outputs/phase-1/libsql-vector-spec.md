# Phase 1: libSQL ベクトル検索仕様確認

## 目的

DiskANNベクトルインデックスを使用した検索クエリの仕様を確認し、VectorSearchStrategyの実装要件を明確化する。

---

## 1. embeddings テーブル構造

**ファイル**: `packages/shared/src/db/schema/embeddings.ts`

### カラム定義

| カラム               | 型      | 制約                 | 説明                             |
| -------------------- | ------- | -------------------- | -------------------------------- |
| id                   | TEXT    | PRIMARY KEY          | UUID                             |
| chunk_id             | TEXT    | NOT NULL, FK, UNIQUE | 親チャンクID（1:1関係）          |
| vector               | BLOB    | NOT NULL             | 埋め込みベクトル（Float32Array） |
| model_id             | TEXT    | NOT NULL             | 埋め込みモデルID                 |
| dimensions           | INTEGER | NOT NULL             | ベクトル次元数                   |
| normalized_magnitude | REAL    | NOT NULL             | 正規化済みマグニチュード         |
| created_at           | INTEGER | NOT NULL             | 作成日時（UNIX時刻）             |
| updated_at           | INTEGER | NOT NULL             | 更新日時（UNIX時刻）             |

### インデックス

| インデックス名          | 対象カラム | タイプ |
| ----------------------- | ---------- | ------ |
| embeddings_chunk_id_idx | chunk_id   | UNIQUE |
| embeddings_model_id_idx | model_id   | INDEX  |

### 外部キー制約

```sql
FOREIGN KEY (chunk_id) REFERENCES chunks(id) ON DELETE CASCADE
```

---

## 2. ベクトル検索関数

**ファイル**: `packages/shared/src/db/queries/vector-search.ts`

### vector_distance_cos()

コサイン距離を計算するlibSQL組み込み関数。

```sql
vector_distance_cos(e.vector, X'<hex_encoded_query_vector>') as distance
```

**戻り値**: 0.0（同一）〜 2.0（正反対）

### vector_distance_l2()

ユークリッド距離を計算。

```sql
vector_distance_l2(e.vector, X'<hex_encoded_query_vector>') as distance
```

**戻り値**: 0.0 〜 ∞

### vector_dot()

内積を計算。

```sql
vector_dot(e.vector, X'<hex_encoded_query_vector>') as dot_product
```

**戻り値**: -∞ 〜 ∞

---

## 3. 距離から類似度への変換

### コサイン類似度（推奨）

```typescript
similarity = 1 - distance / 2;
// 距離 0.0 → 類似度 1.0（同一）
// 距離 1.0 → 類似度 0.5（直交）
// 距離 2.0 → 類似度 0.0（正反対）
```

### ユークリッド距離

```typescript
similarity = 1 / (1 + distance);
// 距離 0.0 → 類似度 1.0
// 距離が大きいほど類似度は0に近づく
```

### 内積

```typescript
similarity = (dotProduct + 1) / 2;
// 内積 1.0 → 類似度 1.0
// 内積 0.0 → 類似度 0.5
// 内積 -1.0 → 類似度 0.0
```

---

## 4. Float32Array ⇄ BLOB 変換

### Float32Array → Buffer（BLOB用）

```typescript
function vectorToBlob(vector: Float32Array): Buffer {
  if (vector.length === 0) {
    throw new Error("Vector cannot be empty");
  }
  return Buffer.from(vector.buffer, vector.byteOffset, vector.byteLength);
}
```

### Buffer → Float32Array

```typescript
function blobToVector(blob: Buffer): Float32Array {
  if (blob.length === 0) {
    throw new Error("Blob cannot be empty");
  }
  if (blob.length % 4 !== 0) {
    throw new Error("Blob size must be a multiple of 4 bytes");
  }
  return new Float32Array(blob.buffer, blob.byteOffset, blob.length / 4);
}
```

### SQLクエリでのベクトル指定

```typescript
const queryBlob = vectorToBlob(queryVector);
const hexString = queryBlob.toString("hex");
// SQL: X'<hexString>'
```

---

## 5. 既存の検索関数

### searchByVector()

コサイン類似度によるベクトル検索。

```typescript
async function searchByVector(
  db: LibSQLDatabase,
  queryVector: Float32Array,
  options?: VectorSearchOptions,
): Promise<VectorSearchResult[]>;
```

**オプション**:
| オプション | 型 | デフォルト | 説明 |
| ------------- | --------- | ---------- | ------------------ |
| limit | number | 10 | 最大取得件数 |
| minSimilarity | number | undefined | 最小類似度閾値 |
| fileIds | string[] | undefined | ファイルIDフィルタ |
| modelId | string | undefined | モデルIDフィルタ |

**戻り値**:

```typescript
interface VectorSearchResult {
  chunkId: string;
  embeddingId: string;
  distance: number;
  similarity: number; // 0.0-1.0
  content: string;
  contextualContent: string | null;
}
```

---

## 6. SQLクエリ例

### 基本的なベクトル検索

```sql
SELECT
  e.id as embedding_id,
  e.chunk_id,
  c.content,
  c.contextual_content,
  vector_distance_cos(e.vector, X'<hex_query>') as distance
FROM embeddings e
INNER JOIN chunks c ON e.chunk_id = c.id
ORDER BY distance ASC
LIMIT 10
```

### フィルター付き検索

```sql
SELECT
  e.id as embedding_id,
  e.chunk_id,
  c.content,
  c.contextual_content,
  vector_distance_cos(e.vector, X'<hex_query>') as distance
FROM embeddings e
INNER JOIN chunks c ON e.chunk_id = c.id
WHERE c.file_id IN ('file-1', 'file-2')
  AND e.model_id = 'text-embedding-3-small'
ORDER BY distance ASC
LIMIT 10
```

---

## 7. VectorSearchStrategyでの利用

### 必要なインポート

```typescript
import {
  searchByVector,
  VectorSearchResult,
  VectorSearchOptions,
  vectorToBlob,
} from "@repo/shared/db/queries/vector-search";
```

### 実装フロー

```
1. クエリテキスト受信
2. IEmbeddingProvider.embed() でベクトル生成
3. number[] → Float32Array 変換
4. searchByVector() で検索実行
5. VectorSearchResult[] → SearchResultItem[] 変換
6. Result<SearchResult, Error> を返す
```

### フィルター適用

既存の `VectorSearchOptions` にはファイルIDフィルタがあるが、
`SearchFilters` の完全対応には追加実装が必要:

| SearchFilters | VectorSearchOptions | 対応状況 |
| ------------- | ------------------- | -------- |
| fileIds       | fileIds             | 対応済み |
| entityTypes   | -                   | 未対応   |
| dateRange     | -                   | 未対応   |
| minRelevance  | minSimilarity       | 対応済み |

---

## 8. DiskANNインデックス設定

**ファイル**: `packages/shared/src/db/schema/vector-index.ts`

### VectorIndexConfig

```typescript
interface VectorIndexConfig {
  name: string; // インデックス名
  dimensions: number; // ベクトル次元数
  metric: "cosine" | "l2" | "dot";
  maxElements?: number; // デフォルト: 1,000,000
  efConstruction?: number; // デフォルト: 200
  efSearch?: number; // デフォルト: 100
}
```

### プリセット設定

| プリセット          | 次元数 | メトリクス |
| ------------------- | ------ | ---------- |
| openai_small        | 1536   | cosine     |
| openai_large        | 3072   | cosine     |
| cohere_multilingual | 1024   | cosine     |

---

## まとめ

| 項目                  | 状態     | 備考                      |
| --------------------- | -------- | ------------------------- |
| embeddings テーブル   | 定義済み | schema/embeddings.ts      |
| vector_distance_cos() | 使用可能 | libSQL組み込み            |
| searchByVector()      | 実装済み | queries/vector-search.ts  |
| Float32Array変換      | 実装済み | vectorToBlob/blobToVector |
| DiskANNインデックス   | 設定済み | schema/vector-index.ts    |

---

## 次のステップ

Phase 2で以下を設計:

1. searchByVector() のラップ方法
2. SearchFilters → VectorSearchOptions 変換ロジック
3. VectorSearchResult → SearchResultItem 変換ロジック
