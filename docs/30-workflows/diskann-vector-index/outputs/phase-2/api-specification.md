# DiskANN ベクトルインデックス - API仕様書

## メタ情報

| 項目           | 内容                                              |
| -------------- | ------------------------------------------------- |
| 文書バージョン | 1.0                                               |
| 作成日         | 2026-01-04                                        |
| タスクID       | CONV-04-04                                        |
| 参照           | Phase 1 要件定義書                                |
| ファイル       | `packages/shared/src/db/queries/vector-search.ts` |

---

## 1. 型定義

### 1.1 VectorSearchResult

```typescript
/**
 * ベクトル検索結果
 *
 * @description 類似度検索の結果を表す型定義
 */
export interface VectorSearchResult {
  /**
   * チャンクID
   */
  chunkId: string;

  /**
   * 埋め込みID
   */
  embeddingId: string;

  /**
   * 距離（使用メトリクスによって意味が異なる）
   * - cosine: 0.0 (同一) ~ 2.0 (正反対)
   * - l2: 0.0 ~ ∞
   * - dot: -∞ ~ ∞
   */
  distance: number;

  /**
   * 類似度 (0.0 ~ 1.0)
   * @description コサイン類似度の場合: 1 - (distance / 2)
   */
  similarity: number;

  /**
   * チャンクのコンテンツ
   */
  content: string;

  /**
   * コンテキスト付きコンテンツ（nullableの場合あり）
   */
  contextualContent: string | null;
}
```

### 1.2 VectorSearchOptions

```typescript
/**
 * ベクトル検索オプション
 *
 * @description 検索のフィルタリングと結果数制御
 */
export interface VectorSearchOptions {
  /**
   * 取得する最大件数
   * @default 10
   */
  limit?: number;

  /**
   * 最小類似度閾値 (0.0 ~ 1.0)
   * @description この値未満の結果は除外される
   * @default undefined (フィルタなし)
   */
  minSimilarity?: number;

  /**
   * ファイルIDでフィルタリング
   * @description 指定されたファイルに属するチャンクのみ検索
   * @default undefined (フィルタなし)
   */
  fileIds?: string[];

  /**
   * 埋め込みモデルIDでフィルタリング
   * @description 指定されたモデルで生成された埋め込みのみ検索
   * @default undefined (フィルタなし)
   */
  modelId?: string;
}
```

### 1.3 EmbeddingInsertItem

```typescript
/**
 * 埋め込み挿入用データ
 *
 * @description バッチ挿入で使用する入力型
 */
export interface EmbeddingInsertItem {
  /**
   * チャンクID（必須）
   * @constraint 存在するchunks.idへの参照
   */
  chunkId: string;

  /**
   * 埋め込みベクトル
   * @constraint 設定された次元数と一致すること
   */
  vector: Float32Array;

  /**
   * 埋め込みモデルID
   * @example "text-embedding-3-small"
   */
  modelId: string;

  /**
   * ベクトル次元数
   * @example 1536
   */
  dimensions: number;

  /**
   * 正規化済みマグニチュード
   * @description 正規化済みベクトルの場合は1.0
   */
  normalizedMagnitude?: number;
}
```

---

## 2. データ変換関数

### 2.1 vectorToBlob

````typescript
/**
 * Float32ArrayをBufferに変換する
 *
 * @param vector - 変換するFloat32Arrayベクトル
 * @returns SQLiteのBLOBとして保存可能なBuffer
 *
 * @throws {Error} vectorが空の場合
 *
 * @example
 * ```typescript
 * const vector = new Float32Array([0.1, 0.2, 0.3]);
 * const blob = vectorToBlob(vector);
 * // blob.length === 12 (3 * 4 bytes)
 * ```
 */
export function vectorToBlob(vector: Float32Array): Buffer {
  if (vector.length === 0) {
    throw new Error("Vector cannot be empty");
  }
  return Buffer.from(vector.buffer, vector.byteOffset, vector.byteLength);
}
````

### 2.2 blobToVector

````typescript
/**
 * BufferをFloat32Arrayに変換する
 *
 * @param blob - 変換するBuffer
 * @returns Float32Arrayベクトル
 *
 * @throws {Error} blobが空の場合
 * @throws {Error} blobのサイズが4の倍数でない場合
 *
 * @example
 * ```typescript
 * const blob = Buffer.from(new Float32Array([0.1, 0.2, 0.3]).buffer);
 * const vector = blobToVector(blob);
 * // vector.length === 3
 * ```
 */
export function blobToVector(blob: Buffer): Float32Array {
  if (blob.length === 0) {
    throw new Error("Blob cannot be empty");
  }
  if (blob.length % 4 !== 0) {
    throw new Error("Blob size must be a multiple of 4 bytes");
  }
  return new Float32Array(blob.buffer, blob.byteOffset, blob.length / 4);
}
````

### 2.3 normalizeVector

````typescript
/**
 * ベクトルを正規化する（L2ノルム = 1）
 *
 * @param vector - 正規化するFloat32Arrayベクトル
 * @returns 正規化されたFloat32Array
 *
 * @throws {Error} vectorが空の場合
 * @throws {Error} ゼロベクトルの場合
 *
 * @example
 * ```typescript
 * const vector = new Float32Array([3, 4]);
 * const normalized = normalizeVector(vector);
 * // normalized ≈ [0.6, 0.8]
 * ```
 */
export function normalizeVector(vector: Float32Array): Float32Array {
  if (vector.length === 0) {
    throw new Error("Vector cannot be empty");
  }

  let magnitude = 0;
  for (let i = 0; i < vector.length; i++) {
    magnitude += vector[i] * vector[i];
  }
  magnitude = Math.sqrt(magnitude);

  if (magnitude === 0) {
    throw new Error("Cannot normalize zero vector");
  }

  const normalized = new Float32Array(vector.length);
  for (let i = 0; i < vector.length; i++) {
    normalized[i] = vector[i] / magnitude;
  }

  return normalized;
}

/**
 * ベクトルのマグニチュード（L2ノルム）を計算する
 *
 * @param vector - 計算対象のFloat32Arrayベクトル
 * @returns マグニチュード値
 */
export function calculateMagnitude(vector: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < vector.length; i++) {
    sum += vector[i] * vector[i];
  }
  return Math.sqrt(sum);
}
````

---

## 3. 検索関数

### 3.1 searchByVector (コサイン類似度)

````typescript
/**
 * コサイン類似度によるベクトル検索
 *
 * @param db - LibSQLデータベースインスタンス
 * @param queryVector - クエリベクトル（Float32Array）
 * @param options - 検索オプション
 * @returns 類似度順でソートされた検索結果
 *
 * @throws {Error} queryVectorの次元数が一致しない場合
 * @throws {Error} データベースエラー
 *
 * @example
 * ```typescript
 * const queryVector = new Float32Array(1536).fill(0.1);
 * const results = await searchByVector(db, queryVector, {
 *   limit: 10,
 *   minSimilarity: 0.7,
 *   fileIds: ["file-123"],
 * });
 *
 * for (const result of results) {
 *   console.log(`${result.chunkId}: ${result.similarity}`);
 * }
 * ```
 */
export async function searchByVector(
  db: LibSQLDatabase,
  queryVector: Float32Array,
  options: VectorSearchOptions = {},
): Promise<VectorSearchResult[]> {
  const { limit = 10, minSimilarity, fileIds, modelId } = options;

  // バリデーション
  validateVector(queryVector);

  const queryBlob = vectorToBlob(queryVector);

  // SQL構築
  let whereClause = "";
  const conditions: string[] = [];

  if (modelId) {
    conditions.push(`e.model_id = '${modelId}'`);
  }

  if (fileIds && fileIds.length > 0) {
    const fileIdList = fileIds.map((id) => `'${id}'`).join(",");
    conditions.push(`c.file_id IN (${fileIdList})`);
  }

  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }

  // クエリ実行
  const results = await db.all(
    sql.raw(`
    SELECT
      e.id as embedding_id,
      e.chunk_id,
      c.content,
      c.contextual_content,
      vector_distance_cos(e.vector, X'${queryBlob.toString("hex")}') as distance
    FROM embeddings e
    INNER JOIN chunks c ON e.chunk_id = c.id
    ${whereClause}
    ORDER BY distance ASC
    LIMIT ${limit}
  `),
  );

  // 結果変換
  return results
    .map((row: any) => ({
      embeddingId: row.embedding_id,
      chunkId: row.chunk_id,
      content: row.content,
      contextualContent: row.contextual_content,
      distance: row.distance,
      similarity: 1 - row.distance / 2,
    }))
    .filter(
      (result) =>
        minSimilarity === undefined || result.similarity >= minSimilarity,
    );
}
````

### 3.2 searchByVectorL2 (ユークリッド距離)

````typescript
/**
 * ユークリッド距離によるベクトル検索
 *
 * @param db - LibSQLデータベースインスタンス
 * @param queryVector - クエリベクトル（Float32Array）
 * @param options - 検索オプション
 * @returns 距離順（近い順）でソートされた検索結果
 *
 * @example
 * ```typescript
 * const results = await searchByVectorL2(db, queryVector, { limit: 5 });
 * ```
 */
export async function searchByVectorL2(
  db: LibSQLDatabase,
  queryVector: Float32Array,
  options: VectorSearchOptions = {},
): Promise<VectorSearchResult[]> {
  const { limit = 10, fileIds, modelId } = options;

  validateVector(queryVector);

  const queryBlob = vectorToBlob(queryVector);

  // SQL構築（コサイン類似度と同様の構造）
  let whereClause = "";
  const conditions: string[] = [];

  if (modelId) {
    conditions.push(`e.model_id = '${modelId}'`);
  }

  if (fileIds && fileIds.length > 0) {
    const fileIdList = fileIds.map((id) => `'${id}'`).join(",");
    conditions.push(`c.file_id IN (${fileIdList})`);
  }

  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }

  const results = await db.all(
    sql.raw(`
    SELECT
      e.id as embedding_id,
      e.chunk_id,
      c.content,
      c.contextual_content,
      vector_distance_l2(e.vector, X'${queryBlob.toString("hex")}') as distance
    FROM embeddings e
    INNER JOIN chunks c ON e.chunk_id = c.id
    ${whereClause}
    ORDER BY distance ASC
    LIMIT ${limit}
  `),
  );

  return results.map((row: any) => ({
    embeddingId: row.embedding_id,
    chunkId: row.chunk_id,
    content: row.content,
    contextualContent: row.contextual_content,
    distance: row.distance,
    // L2距離では類似度計算が異なる
    similarity: 1 / (1 + row.distance),
  }));
}
````

### 3.3 searchByVectorDot (内積)

````typescript
/**
 * 内積によるベクトル検索
 *
 * @param db - LibSQLデータベースインスタンス
 * @param queryVector - クエリベクトル（Float32Array、正規化推奨）
 * @param options - 検索オプション
 * @returns 内積値順（高い順）でソートされた検索結果
 *
 * @remarks
 * 内積検索は正規化されたベクトルで使用すると、コサイン類似度と同等の結果になります。
 *
 * @example
 * ```typescript
 * const normalizedQuery = normalizeVector(queryVector);
 * const results = await searchByVectorDot(db, normalizedQuery, { limit: 5 });
 * ```
 */
export async function searchByVectorDot(
  db: LibSQLDatabase,
  queryVector: Float32Array,
  options: VectorSearchOptions = {},
): Promise<VectorSearchResult[]> {
  const { limit = 10, fileIds, modelId } = options;

  validateVector(queryVector);

  const queryBlob = vectorToBlob(queryVector);

  let whereClause = "";
  const conditions: string[] = [];

  if (modelId) {
    conditions.push(`e.model_id = '${modelId}'`);
  }

  if (fileIds && fileIds.length > 0) {
    const fileIdList = fileIds.map((id) => `'${id}'`).join(",");
    conditions.push(`c.file_id IN (${fileIdList})`);
  }

  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }

  const results = await db.all(
    sql.raw(`
    SELECT
      e.id as embedding_id,
      e.chunk_id,
      c.content,
      c.contextual_content,
      vector_dot(e.vector, X'${queryBlob.toString("hex")}') as dot_product
    FROM embeddings e
    INNER JOIN chunks c ON e.chunk_id = c.id
    ${whereClause}
    ORDER BY dot_product DESC
    LIMIT ${limit}
  `),
  );

  return results.map((row: any) => ({
    embeddingId: row.embedding_id,
    chunkId: row.chunk_id,
    content: row.content,
    contextualContent: row.contextual_content,
    distance: -row.dot_product, // 内積は大きいほど類似
    similarity: (row.dot_product + 1) / 2, // -1~1 を 0~1 に変換
  }));
}
````

---

## 4. 挿入関数

### 4.1 insertEmbedding

````typescript
/**
 * 単一の埋め込みを挿入する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param item - 挿入する埋め込みデータ
 * @returns 挿入されたレコードのID
 *
 * @throws {Error} chunkIdが存在しない場合（外部キー制約）
 * @throws {Error} chunkIdが重複している場合（UNIQUE制約）
 *
 * @example
 * ```typescript
 * const id = await insertEmbedding(db, {
 *   chunkId: "chunk-123",
 *   vector: new Float32Array(1536).fill(0.1),
 *   modelId: "text-embedding-3-small",
 *   dimensions: 1536,
 * });
 * ```
 */
export async function insertEmbedding(
  db: LibSQLDatabase,
  item: EmbeddingInsertItem,
): Promise<string> {
  validateVector(item.vector, item.dimensions);

  const magnitude = item.normalizedMagnitude ?? calculateMagnitude(item.vector);
  const id = crypto.randomUUID();

  await db.insert(embeddings).values({
    id,
    chunkId: item.chunkId,
    vector: vectorToBlob(item.vector),
    modelId: item.modelId,
    dimensions: item.dimensions,
    normalizedMagnitude: magnitude,
  });

  return id;
}
````

### 4.2 insertEmbeddingsBatch

````typescript
/**
 * 埋め込みをバッチ挿入する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param items - 挿入する埋め込みデータの配列
 * @param batchSize - 1バッチあたりの件数（デフォルト: 100）
 *
 * @throws {Error} いずれかのアイテムでエラーが発生した場合（ロールバック）
 *
 * @remarks
 * - トランザクション内で処理され、エラー時は全てロールバック
 * - 100件単位でバッチ処理を行い、メモリ効率を確保
 *
 * @example
 * ```typescript
 * const items: EmbeddingInsertItem[] = chunks.map(chunk => ({
 *   chunkId: chunk.id,
 *   vector: generateEmbedding(chunk.content),
 *   modelId: "text-embedding-3-small",
 *   dimensions: 1536,
 * }));
 *
 * await insertEmbeddingsBatch(db, items);
 * ```
 */
export async function insertEmbeddingsBatch(
  db: LibSQLDatabase,
  items: EmbeddingInsertItem[],
  batchSize: number = 100,
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  // 全アイテムのバリデーション
  for (const item of items) {
    validateVector(item.vector, item.dimensions);
  }

  // トランザクション内でバッチ処理
  await db.transaction(async (tx) => {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const values = batch.map((item) => ({
        id: crypto.randomUUID(),
        chunkId: item.chunkId,
        vector: vectorToBlob(item.vector),
        modelId: item.modelId,
        dimensions: item.dimensions,
        normalizedMagnitude:
          item.normalizedMagnitude ?? calculateMagnitude(item.vector),
      }));

      await tx.insert(embeddings).values(values);
    }
  });
}
````

---

## 5. 削除関数

### 5.1 deleteEmbeddingByChunkId

````typescript
/**
 * チャンクIDで埋め込みを削除する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param chunkId - 削除対象のチャンクID
 * @returns 削除された件数
 *
 * @example
 * ```typescript
 * const deletedCount = await deleteEmbeddingByChunkId(db, "chunk-123");
 * ```
 */
export async function deleteEmbeddingByChunkId(
  db: LibSQLDatabase,
  chunkId: string,
): Promise<number> {
  const result = await db
    .delete(embeddings)
    .where(eq(embeddings.chunkId, chunkId));

  return result.rowsAffected;
}
````

### 5.2 deleteEmbeddingsByFileId

````typescript
/**
 * ファイルIDで関連する全ての埋め込みを削除する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param fileId - 削除対象のファイルID
 * @returns 削除された件数
 *
 * @remarks
 * chunks経由でfileIdに紐づく全埋め込みを削除
 *
 * @example
 * ```typescript
 * const deletedCount = await deleteEmbeddingsByFileId(db, "file-123");
 * ```
 */
export async function deleteEmbeddingsByFileId(
  db: LibSQLDatabase,
  fileId: string,
): Promise<number> {
  const result = await db.run(
    sql.raw(`
    DELETE FROM embeddings
    WHERE chunk_id IN (
      SELECT id FROM chunks WHERE file_id = '${fileId}'
    )
  `),
  );

  return result.rowsAffected;
}
````

---

## 6. ユーティリティ関数

### 6.1 validateVector

```typescript
/**
 * ベクトルをバリデーションする
 *
 * @param vector - 検証するFloat32Array
 * @param expectedDimensions - 期待する次元数（オプション）
 *
 * @throws {Error} ベクトルが空の場合
 * @throws {Error} 次元数が一致しない場合
 * @throws {Error} NaNまたはInfinityを含む場合
 */
export function validateVector(
  vector: Float32Array,
  expectedDimensions?: number,
): void {
  if (vector.length === 0) {
    throw new Error("Vector cannot be empty");
  }

  if (
    expectedDimensions !== undefined &&
    vector.length !== expectedDimensions
  ) {
    throw new Error(
      `Vector dimensions mismatch: expected ${expectedDimensions}, got ${vector.length}`,
    );
  }

  for (let i = 0; i < vector.length; i++) {
    if (!Number.isFinite(vector[i])) {
      throw new Error(
        `Vector contains invalid value at index ${i}: ${vector[i]}`,
      );
    }
  }
}
```

### 6.2 getEmbeddingByChunkId

````typescript
/**
 * チャンクIDで埋め込みを取得する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param chunkId - 取得対象のチャンクID
 * @returns 埋め込みレコード（存在しない場合はundefined）
 *
 * @example
 * ```typescript
 * const embedding = await getEmbeddingByChunkId(db, "chunk-123");
 * if (embedding) {
 *   const vector = blobToVector(embedding.vector);
 * }
 * ```
 */
export async function getEmbeddingByChunkId(
  db: LibSQLDatabase,
  chunkId: string,
): Promise<Embedding | undefined> {
  return await db.query.embeddings.findFirst({
    where: eq(embeddings.chunkId, chunkId),
  });
}
````

### 6.3 countEmbeddingsByModelId

````typescript
/**
 * モデルIDごとの埋め込み数をカウントする
 *
 * @param db - LibSQLデータベースインスタンス
 * @returns モデルIDと件数のマップ
 *
 * @example
 * ```typescript
 * const counts = await countEmbeddingsByModelId(db);
 * // { "text-embedding-3-small": 1000, "text-embedding-ada-002": 500 }
 * ```
 */
export async function countEmbeddingsByModelId(
  db: LibSQLDatabase,
): Promise<Record<string, number>> {
  const results = await db.all(
    sql.raw(`
    SELECT model_id, COUNT(*) as count
    FROM embeddings
    GROUP BY model_id
  `),
  );

  const counts: Record<string, number> = {};
  for (const row of results as { model_id: string; count: number }[]) {
    counts[row.model_id] = row.count;
  }

  return counts;
}
````

---

## 7. エクスポート一覧

```typescript
// packages/shared/src/db/queries/vector-search.ts

// 型定義
export type { VectorSearchResult, VectorSearchOptions, EmbeddingInsertItem };

// データ変換
export { vectorToBlob, blobToVector, normalizeVector, calculateMagnitude };

// 検索
export { searchByVector, searchByVectorL2, searchByVectorDot };

// 挿入
export { insertEmbedding, insertEmbeddingsBatch };

// 削除
export { deleteEmbeddingByChunkId, deleteEmbeddingsByFileId };

// ユーティリティ
export { validateVector, getEmbeddingByChunkId, countEmbeddingsByModelId };
```

---

## 8. 使用例

### 8.1 基本的な検索フロー

```typescript
import { searchByVector, vectorToBlob, blobToVector } from "@repo/shared/db";

// 1. クエリベクトルを生成（外部API経由）
const queryVector = await generateEmbedding("検索クエリテキスト");

// 2. 類似チャンクを検索
const results = await searchByVector(db, queryVector, {
  limit: 10,
  minSimilarity: 0.7,
});

// 3. 結果を使用
for (const result of results) {
  console.log(`Chunk: ${result.chunkId}`);
  console.log(`Similarity: ${(result.similarity * 100).toFixed(1)}%`);
  console.log(`Content: ${result.content.substring(0, 100)}...`);
}
```

### 8.2 バッチ埋め込み生成

```typescript
import { insertEmbeddingsBatch, normalizeVector } from "@repo/shared/db";

// 1. チャンクを取得
const chunks = await db.query.chunks.findMany({
  where: eq(chunks.fileId, fileId),
});

// 2. 埋め込みを生成
const items: EmbeddingInsertItem[] = await Promise.all(
  chunks.map(async (chunk) => {
    const vector = await generateEmbedding(chunk.content);
    return {
      chunkId: chunk.id,
      vector: normalizeVector(vector),
      modelId: "text-embedding-3-small",
      dimensions: 1536,
      normalizedMagnitude: 1.0,
    };
  }),
);

// 3. バッチ挿入
await insertEmbeddingsBatch(db, items);
```

### 8.3 ファイル別フィルタリング検索

```typescript
// 特定のファイル群内でのみ検索
const results = await searchByVector(db, queryVector, {
  limit: 5,
  fileIds: ["file-1", "file-2", "file-3"],
  minSimilarity: 0.6,
});
```

---

## 9. パフォーマンス考慮事項

### 9.1 検索最適化

| 条件                 | 推奨設定                       |
| -------------------- | ------------------------------ |
| 小規模 (< 10,000件)  | limit: 10-50                   |
| 中規模 (< 100,000件) | limit: 10-20, インデックス使用 |
| 大規模 (> 100,000件) | limit: 10, インデックス必須    |

### 9.2 バッチ挿入最適化

| 条件            | 推奨batchSize |
| --------------- | ------------- |
| 少量 (< 100件)  | 100           |
| 中量 (< 1000件) | 100           |
| 大量 (> 1000件) | 100-500       |

---

## 10. エラーハンドリング

### 10.1 想定されるエラー

| エラー種別      | 原因                 | 対処                     |
| --------------- | -------------------- | ------------------------ |
| ValidationError | ベクトル次元数不一致 | 次元数を確認             |
| ForeignKeyError | 存在しないchunkId    | chunkの存在確認          |
| UniqueError     | 重複するchunkId      | 既存埋め込みを削除or更新 |
| DatabaseError   | 接続エラー等         | リトライ or エラー通知   |

### 10.2 エラーハンドリング例

```typescript
try {
  await insertEmbeddingsBatch(db, items);
} catch (error) {
  if (error.message.includes("UNIQUE constraint failed")) {
    // 重複エラー処理
    console.error("Duplicate chunk_id detected");
  } else if (error.message.includes("FOREIGN KEY constraint failed")) {
    // 外部キーエラー処理
    console.error("Referenced chunk does not exist");
  } else {
    // その他のエラー
    throw error;
  }
}
```
