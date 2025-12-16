# CONV-04-04: DiskANN ベクトルインデックス設定

## 概要

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| タスクID | CONV-04-04                                    |
| タスク名 | DiskANN ベクトルインデックス設定              |
| 依存     | CONV-04-03                                    |
| 規模     | 中                                            |
| 出力場所 | `packages/shared/src/db/schema/embeddings.ts` |

## 目的

埋め込みベクトルを保存し、高速なベクトル類似度検索を可能にするテーブルとインデックスを定義する。
セマンティック検索基盤となる。

## 背景

libSQLは2024年にベクトル検索機能を追加。DiskANNベースの近似最近傍探索（ANN）をサポート。

## 成果物

### 1. embeddingsテーブル定義

```typescript
// packages/shared/src/db/schema/embeddings.ts

import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { uuidPrimaryKey, timestamps } from "./common";
import { chunks } from "./chunks";

/**
 * embeddingsテーブル - ベクトル埋め込み
 *
 * 注: libSQLのベクトル機能を使用
 * ベクトルカラムはBLOB型で格納し、vector_extract/vector_distance関数で操作
 */
export const embeddings = sqliteTable(
  "embeddings",
  {
    // 主キー
    id: uuidPrimaryKey(),

    // 外部キー
    chunkId: text("chunk_id")
      .notNull()
      .references(() => chunks.id, { onDelete: "cascade" }),

    // ベクトルデータ（Float32Array → BLOB）
    vector: blob("vector", { mode: "buffer" }).notNull(),

    // モデル情報
    modelId: text("model_id").notNull(),
    dimensions: integer("dimensions").notNull(),

    // 品質情報
    normalizedMagnitude: real("normalized_magnitude").notNull(),

    // タイムスタンプ
    ...timestamps,
  },
  (table) => ({
    // インデックス
    chunkIdIdx: uniqueIndex("embeddings_chunk_id_idx").on(table.chunkId),
    modelIdIdx: index("embeddings_model_id_idx").on(table.modelId),
  }),
);

/**
 * embeddingsテーブルの型
 */
export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
```

### 2. ベクトルインデックス管理

```typescript
// packages/shared/src/db/schema/vector-index.ts

import { sql } from "drizzle-orm";
import type { Database } from "../client";

/**
 * ベクトルインデックス設定
 */
export interface VectorIndexConfig {
  readonly name: string;
  readonly dimensions: number;
  readonly metric: "cosine" | "l2" | "dot";
  readonly maxElements?: number;
  readonly efConstruction?: number; // インデックス構築時の探索幅
  readonly efSearch?: number; // 検索時の探索幅
}

/**
 * デフォルト設定
 */
export const defaultVectorIndexConfig: VectorIndexConfig = {
  name: "embeddings_vector_idx",
  dimensions: 1536, // OpenAI text-embedding-3-small
  metric: "cosine",
  maxElements: 1000000,
  efConstruction: 200,
  efSearch: 100,
};

/**
 * libSQLベクトルインデックス作成
 *
 * 注: libSQLのベクトル拡張構文に準拠
 * https://github.com/libsql/libsql/blob/main/libsql-sqlite3/doc/vector_search.md
 */
export const createVectorIndex = async (
  db: Database,
  config: VectorIndexConfig = defaultVectorIndexConfig,
): Promise<void> => {
  const { name, dimensions, metric } = config;

  // libSQLベクトルインデックス作成
  // 注: 実際の構文はlibSQLのバージョンに依存
  await db.run(sql`
    CREATE INDEX IF NOT EXISTS ${sql.raw(name)}
    ON embeddings(vector)
    USING vector(${dimensions})
    WITH (metric = '${sql.raw(metric)}');
  `);
};

/**
 * ベクトルインデックス削除
 */
export const dropVectorIndex = async (
  db: Database,
  indexName: string = "embeddings_vector_idx",
): Promise<void> => {
  await db.run(sql`DROP INDEX IF EXISTS ${sql.raw(indexName)}`);
};

/**
 * ベクトルインデックス再構築
 */
export const rebuildVectorIndex = async (
  db: Database,
  config: VectorIndexConfig = defaultVectorIndexConfig,
): Promise<void> => {
  await dropVectorIndex(db, config.name);
  await createVectorIndex(db, config);
};

/**
 * ベクトルインデックス統計情報取得
 */
export const getVectorIndexStats = async (
  db: Database,
): Promise<{ totalVectors: number; dimensions: number }> => {
  const result = await db.get(sql`
    SELECT
      COUNT(*) as total_vectors,
      MAX(dimensions) as dimensions
    FROM embeddings
  `);

  return {
    totalVectors: (result as any)?.total_vectors ?? 0,
    dimensions: (result as any)?.dimensions ?? 0,
  };
};
```

### 3. ベクトル検索クエリ

```typescript
// packages/shared/src/db/queries/vector-search.ts

import { sql, eq, and, inArray } from "drizzle-orm";
import type { Database } from "../client";
import { embeddings } from "../schema/embeddings";
import { chunks } from "../schema/chunks";

/**
 * ベクトル検索結果
 */
export interface VectorSearchResult {
  chunkId: string;
  embeddingId: string;
  distance: number;
  similarity: number;
  content: string;
  contextualContent: string | null;
}

/**
 * ベクトル検索オプション
 */
export interface VectorSearchOptions {
  limit?: number;
  minSimilarity?: number;
  fileIds?: string[];
  modelId?: string;
}

/**
 * Float32ArrayをBlob形式に変換
 */
export const vectorToBlob = (vector: Float32Array): Buffer => {
  return Buffer.from(vector.buffer);
};

/**
 * BlobをFloat32Arrayに変換
 */
export const blobToVector = (blob: Buffer): Float32Array => {
  return new Float32Array(blob.buffer, blob.byteOffset, blob.byteLength / 4);
};

/**
 * ベクトル類似度検索（コサイン類似度）
 *
 * libSQLのvector_distance_cosを使用
 */
export const searchByVector = async (
  db: Database,
  queryVector: Float32Array,
  options: VectorSearchOptions = {},
): Promise<VectorSearchResult[]> => {
  const { limit = 20, minSimilarity = 0.5, fileIds, modelId } = options;

  const queryBlob = vectorToBlob(queryVector);

  // 基本クエリ
  let query = sql`
    SELECT
      e.id as embedding_id,
      e.chunk_id,
      c.content,
      c.contextual_content,
      vector_distance_cos(e.vector, ${queryBlob}) as distance
    FROM embeddings e
    INNER JOIN chunks c ON e.chunk_id = c.id
    WHERE 1=1
  `;

  // モデルIDフィルター
  if (modelId) {
    query = sql`${query} AND e.model_id = ${modelId}`;
  }

  // ファイルIDフィルター
  if (fileIds && fileIds.length > 0) {
    query = sql`${query} AND c.file_id IN (${sql.join(
      fileIds.map((id) => sql`${id}`),
      sql`, `,
    )})`;
  }

  // 類似度フィルター（cosine距離を類似度に変換）
  const maxDistance = 1 - minSimilarity;
  query = sql`${query} AND vector_distance_cos(e.vector, ${queryBlob}) <= ${maxDistance}`;

  // ソート・リミット
  query = sql`${query}
    ORDER BY distance ASC
    LIMIT ${limit}
  `;

  const results = await db.all(query);

  return results.map((row: any) => ({
    embeddingId: row.embedding_id,
    chunkId: row.chunk_id,
    content: row.content,
    contextualContent: row.contextual_content,
    distance: row.distance,
    similarity: 1 - row.distance, // cosine距離を類似度に変換
  }));
};

/**
 * ユークリッド距離でのベクトル検索
 */
export const searchByVectorL2 = async (
  db: Database,
  queryVector: Float32Array,
  options: VectorSearchOptions = {},
): Promise<VectorSearchResult[]> => {
  const { limit = 20, fileIds, modelId } = options;

  const queryBlob = vectorToBlob(queryVector);

  let query = sql`
    SELECT
      e.id as embedding_id,
      e.chunk_id,
      c.content,
      c.contextual_content,
      vector_distance_l2(e.vector, ${queryBlob}) as distance
    FROM embeddings e
    INNER JOIN chunks c ON e.chunk_id = c.id
    WHERE 1=1
  `;

  if (modelId) {
    query = sql`${query} AND e.model_id = ${modelId}`;
  }

  if (fileIds && fileIds.length > 0) {
    query = sql`${query} AND c.file_id IN (${sql.join(
      fileIds.map((id) => sql`${id}`),
      sql`, `,
    )})`;
  }

  query = sql`${query}
    ORDER BY distance ASC
    LIMIT ${limit}
  `;

  const results = await db.all(query);

  return results.map((row: any) => ({
    embeddingId: row.embedding_id,
    chunkId: row.chunk_id,
    content: row.content,
    contextualContent: row.contextual_content,
    distance: row.distance,
    similarity: 1 / (1 + row.distance), // 距離を類似度に変換
  }));
};

/**
 * 内積でのベクトル検索（正規化済みベクトル用）
 */
export const searchByVectorDot = async (
  db: Database,
  queryVector: Float32Array,
  options: VectorSearchOptions = {},
): Promise<VectorSearchResult[]> => {
  const { limit = 20, fileIds, modelId } = options;

  const queryBlob = vectorToBlob(queryVector);

  let query = sql`
    SELECT
      e.id as embedding_id,
      e.chunk_id,
      c.content,
      c.contextual_content,
      vector_dot(e.vector, ${queryBlob}) as similarity
    FROM embeddings e
    INNER JOIN chunks c ON e.chunk_id = c.id
    WHERE 1=1
  `;

  if (modelId) {
    query = sql`${query} AND e.model_id = ${modelId}`;
  }

  if (fileIds && fileIds.length > 0) {
    query = sql`${query} AND c.file_id IN (${sql.join(
      fileIds.map((id) => sql`${id}`),
      sql`, `,
    )})`;
  }

  query = sql`${query}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  const results = await db.all(query);

  return results.map((row: any) => ({
    embeddingId: row.embedding_id,
    chunkId: row.chunk_id,
    content: row.content,
    contextualContent: row.contextual_content,
    distance: 1 - row.similarity,
    similarity: row.similarity,
  }));
};

/**
 * バッチベクトル挿入
 */
export const insertEmbeddingsBatch = async (
  db: Database,
  items: Array<{
    id: string;
    chunkId: string;
    vector: Float32Array;
    modelId: string;
    dimensions: number;
    normalizedMagnitude: number;
  }>,
): Promise<void> => {
  // バッチサイズで分割して挿入
  const batchSize = 100;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    await db.run(sql`
      INSERT INTO embeddings (id, chunk_id, vector, model_id, dimensions, normalized_magnitude, created_at, updated_at)
      VALUES ${sql.join(
        batch.map(
          (item) => sql`(
          ${item.id},
          ${item.chunkId},
          ${vectorToBlob(item.vector)},
          ${item.modelId},
          ${item.dimensions},
          ${item.normalizedMagnitude},
          unixepoch(),
          unixepoch()
        )`,
        ),
        sql`, `,
      )}
    `);
  }
};
```

### 4. リレーション更新

```typescript
// packages/shared/src/db/schema/relations.ts に追加

import { embeddings } from "./embeddings";

/**
 * chunksテーブルのリレーション（更新）
 */
export const chunksRelations = relations(chunks, ({ one, many }) => ({
  file: one(files, {
    fields: [chunks.fileId],
    references: [files.id],
  }),
  embedding: one(embeddings, {
    fields: [chunks.id],
    references: [embeddings.chunkId],
  }),
  // ... 他のリレーション
}));

/**
 * embeddingsテーブルのリレーション
 */
export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  chunk: one(chunks, {
    fields: [embeddings.chunkId],
    references: [chunks.id],
  }),
}));
```

### 5. マイグレーションSQL（参考）

```sql
-- 0006_create_embeddings_table.sql

CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY,
  chunk_id TEXT NOT NULL UNIQUE REFERENCES chunks(id) ON DELETE CASCADE,
  vector BLOB NOT NULL,
  model_id TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  normalized_magnitude REAL NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS embeddings_chunk_id_idx ON embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS embeddings_model_id_idx ON embeddings(model_id);

-- ベクトルインデックス（libSQL専用構文）
-- 注: libSQLのバージョンにより構文が異なる場合があります
CREATE INDEX IF NOT EXISTS embeddings_vector_idx
ON embeddings(vector)
USING vector(1536)
WITH (metric = 'cosine');
```

## ディレクトリ構造

```
packages/shared/src/db/
├── schema/
│   ├── embeddings.ts       # embeddingsテーブル
│   └── vector-index.ts     # ベクトルインデックス管理
└── queries/
    └── vector-search.ts    # ベクトル検索クエリ
```

## 受け入れ条件

- [ ] `embeddings` テーブルが定義されている
- [ ] ベクトルインデックスが作成できる
- [ ] コサイン類似度検索が実装されている
- [ ] ユークリッド距離検索が実装されている
- [ ] 内積検索が実装されている
- [ ] Float32Array ⇔ Blob変換が実装されている
- [ ] バッチ挿入が実装されている
- [ ] リレーションが定義されている
- [ ] マイグレーションが正常に実行できる
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-04-03: content_chunks テーブル + FTS5

### このタスクに依存するもの

- CONV-06-02: 埋め込みプロバイダー抽象化
- CONV-07-03: ベクトル検索戦略 (DiskANN)

## 備考

- libSQLのベクトル機能は比較的新しく、APIが変更される可能性がある
- 本番環境ではTurso（libSQLのマネージドサービス）の使用を推奨
- 1536次元（OpenAI text-embedding-3-small）を想定しているが、設定で変更可能
- 大規模データセットでは、インデックス構築に時間がかかる場合がある
- `vector_distance_cos`、`vector_distance_l2`、`vector_dot` はlibSQL固有の関数
