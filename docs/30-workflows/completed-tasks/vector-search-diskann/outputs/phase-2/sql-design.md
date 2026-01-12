# Phase 2: SQLクエリ設計書

## 目的

libSQLベクトル検索のSQLクエリを設計し、VectorSearchStrategyで使用するクエリパターンを定義する。

---

## 1. 基本検索クエリ

### 1.1 コサイン類似度検索

```sql
SELECT
  e.id as embedding_id,
  e.chunk_id,
  c.content,
  c.contextual_content,
  vector_distance_cos(e.vector, X'{queryBlobHex}') as distance
FROM embeddings e
INNER JOIN chunks c ON e.chunk_id = c.id
ORDER BY distance ASC
LIMIT {limit}
```

### 1.2 クエリパラメータ

| パラメータ     | 型     | 説明                                  |
| -------------- | ------ | ------------------------------------- |
| `queryBlobHex` | string | Float32ArrayをHex文字列に変換したもの |
| `limit`        | number | 最大取得件数（1-100）                 |

### 1.3 距離→類似度変換

```typescript
// コサイン距離（0.0-2.0）→ コサイン類似度（0.0-1.0）
similarity = 1 - distance / 2;
```

---

## 2. フィルタ付きクエリ

### 2.1 ファイルIDフィルタ

```sql
SELECT
  e.id as embedding_id,
  e.chunk_id,
  c.content,
  c.contextual_content,
  vector_distance_cos(e.vector, X'{queryBlobHex}') as distance
FROM embeddings e
INNER JOIN chunks c ON e.chunk_id = c.id
WHERE c.file_id IN ('{fileId1}', '{fileId2}', ...)
ORDER BY distance ASC
LIMIT {limit}
```

### 2.2 モデルIDフィルタ

```sql
SELECT
  e.id as embedding_id,
  e.chunk_id,
  c.content,
  c.contextual_content,
  vector_distance_cos(e.vector, X'{queryBlobHex}') as distance
FROM embeddings e
INNER JOIN chunks c ON e.chunk_id = c.id
WHERE e.model_id = '{modelId}'
ORDER BY distance ASC
LIMIT {limit}
```

### 2.3 複合フィルタ

```sql
SELECT
  e.id as embedding_id,
  e.chunk_id,
  c.content,
  c.contextual_content,
  vector_distance_cos(e.vector, X'{queryBlobHex}') as distance
FROM embeddings e
INNER JOIN chunks c ON e.chunk_id = c.id
WHERE e.model_id = '{modelId}'
  AND c.file_id IN ('{fileId1}', '{fileId2}', ...)
ORDER BY distance ASC
LIMIT {limit}
```

---

## 3. 類似度閾値フィルタ

### 3.1 アプリケーション側でフィルタリング

**理由**: `vector_distance_cos()` の結果を WHERE 句で再利用すると2回計算されるため非効率

```typescript
// クエリ実行後にフィルタリング
const results = rawResults.filter(
  (r) => minSimilarity === undefined || r.similarity >= minSimilarity,
);
```

### 3.2 代替案（距離閾値でWHERE）

```sql
-- 類似度0.7以上 = 距離0.6以下
-- similarity >= 0.7 → 1 - distance/2 >= 0.7 → distance <= 0.6
WHERE vector_distance_cos(e.vector, X'{queryBlobHex}') <= 0.6
```

**注意**: この方法はインデックス使用時に効率的だが、閾値計算の変換が必要

---

## 4. WHERE句構築

### 4.1 TypeScript実装

```typescript
interface WhereClauseOptions {
  modelId?: string;
  fileIds?: string[];
}

function buildWhereClause(options: WhereClauseOptions): string {
  const conditions: string[] = [];

  if (options.modelId) {
    conditions.push(`e.model_id = '${escapeSql(options.modelId)}'`);
  }

  if (options.fileIds && options.fileIds.length > 0) {
    const fileIdList = options.fileIds
      .map((id) => `'${escapeSql(id)}'`)
      .join(",");
    conditions.push(`c.file_id IN (${fileIdList})`);
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
}
```

### 4.2 SQLエスケープ

```typescript
function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}
```

---

## 5. パラメータバインディング

### 5.1 Hex変換によるベクトルバインディング

```typescript
function vectorToHex(vector: Float32Array): string {
  const buffer = Buffer.from(
    vector.buffer,
    vector.byteOffset,
    vector.byteLength,
  );
  return buffer.toString("hex");
}

// 使用例
const queryBlobHex = vectorToHex(queryVector);
const query = `
  SELECT ...
  vector_distance_cos(e.vector, X'${queryBlobHex}') as distance
  ...
`;
```

### 5.2 SQLインジェクション対策

| 対策               | 実装方法                               |
| ------------------ | -------------------------------------- |
| ベクトルパラメータ | Hex文字列変換（英数字のみ）            |
| 文字列パラメータ   | シングルクォートエスケープ             |
| 数値パラメータ     | Number型チェック＋テンプレートリテラル |
| IN句               | 個別エスケープ後に結合                 |

---

## 6. 結果型定義

### 6.1 生の検索結果型

```typescript
interface RawVectorSearchResult {
  embedding_id: string;
  chunk_id: string;
  content: string;
  contextual_content: string | null;
  distance: number;
}
```

### 6.2 変換後の結果型

```typescript
interface VectorSearchResult {
  embeddingId: string;
  chunkId: string;
  content: string;
  contextualContent: string | null;
  distance: number;
  similarity: number; // 1 - distance / 2
}
```

---

## 7. パフォーマンス考慮事項

### 7.1 インデックス使用

```sql
-- DiskANNインデックスが存在する場合、自動的に使用される
-- インデックス作成は別途必要（マイグレーション時）
CREATE INDEX idx_embeddings_vector ON embeddings(vector)
  USING diskann(cosine);
```

### 7.2 LIMIT最適化

- 小さい LIMIT 値（10-50）はインデックス検索で高速
- 大きい LIMIT 値（100+）は全スキャンに近くなる

### 7.3 JOIN最適化

- `INNER JOIN chunks` は chunk_id の外部キーインデックスを使用
- `file_id` フィルタには chunks.file_id のインデックスが必要

---

## 8. クエリテンプレート

### 8.1 VectorSearchStrategy用テンプレート

```typescript
const VECTOR_SEARCH_QUERY = `
SELECT
  e.id as embedding_id,
  e.chunk_id,
  c.content,
  c.contextual_content,
  vector_distance_cos(e.vector, X'{queryBlobHex}') as distance
FROM embeddings e
INNER JOIN chunks c ON e.chunk_id = c.id
{whereClause}
ORDER BY distance ASC
LIMIT {limit}
`;
```

### 8.2 クエリ構築関数

```typescript
function buildSearchQuery(
  queryBlobHex: string,
  limit: number,
  options?: { modelId?: string; fileIds?: string[] },
): string {
  const whereClause = buildWhereClause(options ?? {});
  return VECTOR_SEARCH_QUERY.replace("{queryBlobHex}", queryBlobHex)
    .replace("{whereClause}", whereClause)
    .replace("{limit}", String(limit));
}
```

---

## まとめ

| 項目                | 設計内容                            |
| ------------------- | ----------------------------------- |
| 基本クエリ          | vector_distance_cos + JOIN chunks   |
| フィルタ            | file_id, model_id 対応              |
| 類似度閾値          | アプリケーション側でフィルタリング  |
| SQLインジェクション | Hex変換、シングルクォートエスケープ |
| パフォーマンス      | DiskANNインデックス、LIMIT最適化    |
