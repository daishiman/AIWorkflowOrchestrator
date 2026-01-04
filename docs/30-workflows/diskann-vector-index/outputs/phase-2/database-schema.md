# DiskANN ベクトルインデックス - データベーススキーマ設計書

## メタ情報

| 項目           | 内容               |
| -------------- | ------------------ |
| 文書バージョン | 1.0                |
| 作成日         | 2026-01-04         |
| タスクID       | CONV-04-04         |
| 参照           | Phase 1 要件定義書 |

---

## 1. embeddingsテーブル定義

### 1.1 Drizzle ORM スキーマ

```typescript
// packages/shared/src/db/schema/embeddings.ts

import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { chunks } from "./chunks";

/**
 * embeddingsテーブル - ベクトル埋め込み管理
 *
 * @description
 * - 各埋め込みは1つのチャンクに属する（1:1）
 * - libSQLのDiskANNベクトルインデックスを使用
 * - Float32Array形式のベクトルをBLOBとして保存
 *
 * @remarks
 * - チャンクが削除されると、関連する埋め込みもCASCADE DELETEにより自動削除
 * - chunk_idはUNIQUE制約があり、1チャンクに対して1埋め込みのみ
 *
 * @see docs/30-workflows/diskann-vector-index/outputs/phase-1/requirements-definition.md
 */
export const embeddings = sqliteTable(
  "embeddings",
  {
    // ============================================
    // 基本情報
    // ============================================

    /**
     * 主キー（UUID）
     * @default crypto.randomUUID()
     */
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    /**
     * 親チャンクID（外部キー）
     * @references chunks.id
     * @onDelete CASCADE - チャンク削除時に埋め込みも削除
     * @constraint UNIQUE - 1チャンクに対して1埋め込み
     */
    chunkId: text("chunk_id")
      .notNull()
      .references(() => chunks.id, { onDelete: "cascade" }),

    // ============================================
    // ベクトルデータ
    // ============================================

    /**
     * 埋め込みベクトル（Float32Array → BLOB）
     * @description Float32Arrayをバイナリ形式で保存
     * @size 1536次元 = 6,144 bytes
     */
    vector: blob("vector", { mode: "buffer" }).notNull(),

    /**
     * 埋め込みモデルID
     * @example "text-embedding-3-small", "text-embedding-ada-002"
     */
    modelId: text("model_id").notNull(),

    /**
     * ベクトル次元数
     * @example 1536 (OpenAI text-embedding-3-small)
     * @constraint > 0
     */
    dimensions: integer("dimensions").notNull(),

    /**
     * 正規化済みマグニチュード
     * @description ベクトルのL2ノルム（正規化後は1.0）
     * @constraint > 0
     */
    normalizedMagnitude: real("normalized_magnitude").notNull(),

    // ============================================
    // タイムスタンプ
    // ============================================

    /**
     * 作成日時（UNIX時刻）
     * @default unixepoch()
     */
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),

    /**
     * 更新日時（UNIX時刻）
     * @default unixepoch()
     */
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    // ============================================
    // インデックス定義
    // ============================================

    /**
     * チャンクID インデックス（UNIQUE）
     * @description 1チャンクに1埋め込みを保証
     * @query SELECT * FROM embeddings WHERE chunk_id = ?
     */
    chunkIdIdx: uniqueIndex("embeddings_chunk_id_idx").on(table.chunkId),

    /**
     * モデルID インデックス
     * @description モデル別の埋め込み取得
     * @query SELECT * FROM embeddings WHERE model_id = ?
     */
    modelIdIdx: index("embeddings_model_id_idx").on(table.modelId),
  }),
);

/**
 * embeddingsテーブルのSELECT型
 */
export type Embedding = typeof embeddings.$inferSelect;

/**
 * embeddingsテーブルのINSERT型
 */
export type NewEmbedding = typeof embeddings.$inferInsert;
```

### 1.2 カラム詳細

| カラム名             | 型      | 制約                         | デフォルト  | 説明                     |
| -------------------- | ------- | ---------------------------- | ----------- | ------------------------ |
| id                   | TEXT    | PRIMARY KEY                  | UUID        | 埋め込みID               |
| chunk_id             | TEXT    | NOT NULL, UNIQUE, FK(chunks) | -           | 関連チャンクID           |
| vector               | BLOB    | NOT NULL                     | -           | 埋め込みベクトル         |
| model_id             | TEXT    | NOT NULL                     | -           | 使用モデルID             |
| dimensions           | INTEGER | NOT NULL                     | -           | ベクトル次元数           |
| normalized_magnitude | REAL    | NOT NULL                     | -           | 正規化済みマグニチュード |
| created_at           | INTEGER | NOT NULL                     | unixepoch() | 作成日時                 |
| updated_at           | INTEGER | NOT NULL                     | unixepoch() | 更新日時                 |

---

## 2. ベクトルインデックス設計

### 2.1 VectorIndexConfig インターフェース

```typescript
// packages/shared/src/db/schema/vector-index.ts

/**
 * ベクトルインデックス設定
 *
 * @description libSQLのDiskANNベクトルインデックスの設定パラメータ
 *
 * @see https://github.com/libsql/libsql/blob/main/libsql-sqlite3/doc/vector_search.md
 */
export interface VectorIndexConfig {
  /**
   * インデックス名
   * @example "embeddings_vector_idx"
   */
  readonly name: string;

  /**
   * ベクトル次元数
   * @example 1536 (OpenAI text-embedding-3-small)
   */
  readonly dimensions: number;

  /**
   * 距離メトリクス
   * - "cosine": コサイン距離（推奨）
   * - "l2": ユークリッド距離
   * - "dot": 内積
   */
  readonly metric: "cosine" | "l2" | "dot";

  /**
   * 最大要素数（オプション）
   * @default 1000000
   */
  readonly maxElements?: number;

  /**
   * 構築時の探索パラメータ（オプション）
   * @description 値が大きいほど精度が高いが構築が遅くなる
   * @default 200
   */
  readonly efConstruction?: number;

  /**
   * 検索時の探索パラメータ（オプション）
   * @description 値が大きいほど精度が高いが検索が遅くなる
   * @default 100
   */
  readonly efSearch?: number;
}

/**
 * デフォルトのベクトルインデックス設定
 *
 * @description OpenAI text-embedding-3-small (1536次元)向けの最適化設定
 */
export const defaultVectorIndexConfig: VectorIndexConfig = {
  name: "embeddings_vector_idx",
  dimensions: 1536,
  metric: "cosine",
  maxElements: 1000000,
  efConstruction: 200,
  efSearch: 100,
};

/**
 * 異なる埋め込みモデル向けの設定例
 */
export const vectorIndexConfigs = {
  /** OpenAI text-embedding-3-small */
  openai_small: {
    ...defaultVectorIndexConfig,
    dimensions: 1536,
  },
  /** OpenAI text-embedding-3-large */
  openai_large: {
    ...defaultVectorIndexConfig,
    dimensions: 3072,
  },
  /** Cohere embed-multilingual-v3.0 */
  cohere_multilingual: {
    ...defaultVectorIndexConfig,
    dimensions: 1024,
  },
} as const;
```

### 2.2 インデックス管理関数

````typescript
// packages/shared/src/db/schema/vector-index.ts (続き)

import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";

/**
 * ベクトルインデックスを作成する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param config - ベクトルインデックス設定
 * @throws インデックス作成に失敗した場合
 *
 * @example
 * ```typescript
 * await createVectorIndex(db, defaultVectorIndexConfig);
 * ```
 */
export async function createVectorIndex(
  db: LibSQLDatabase,
  config: VectorIndexConfig = defaultVectorIndexConfig,
): Promise<void> {
  await db.run(
    sql.raw(`
    CREATE INDEX IF NOT EXISTS ${config.name}
    ON embeddings(vector)
    USING vector(${config.dimensions})
    WITH (metric = '${config.metric}')
  `),
  );
}

/**
 * ベクトルインデックスを削除する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param indexName - 削除するインデックス名
 *
 * @example
 * ```typescript
 * await dropVectorIndex(db, "embeddings_vector_idx");
 * ```
 */
export async function dropVectorIndex(
  db: LibSQLDatabase,
  indexName: string = defaultVectorIndexConfig.name,
): Promise<void> {
  await db.run(sql.raw(`DROP INDEX IF EXISTS ${indexName}`));
}

/**
 * ベクトルインデックスを再構築する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param config - ベクトルインデックス設定
 *
 * @example
 * ```typescript
 * await rebuildVectorIndex(db, defaultVectorIndexConfig);
 * ```
 */
export async function rebuildVectorIndex(
  db: LibSQLDatabase,
  config: VectorIndexConfig = defaultVectorIndexConfig,
): Promise<void> {
  await dropVectorIndex(db, config.name);
  await createVectorIndex(db, config);
}

/**
 * ベクトルインデックスの統計情報
 */
export interface VectorIndexStats {
  /** インデックス名 */
  name: string;
  /** エントリ数 */
  entryCount: number;
  /** インデックスが存在するか */
  exists: boolean;
}

/**
 * ベクトルインデックスの統計情報を取得する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param indexName - インデックス名
 * @returns 統計情報
 *
 * @example
 * ```typescript
 * const stats = await getVectorIndexStats(db);
 * console.log(`Entry count: ${stats.entryCount}`);
 * ```
 */
export async function getVectorIndexStats(
  db: LibSQLDatabase,
  indexName: string = defaultVectorIndexConfig.name,
): Promise<VectorIndexStats> {
  // インデックス存在確認
  const indexResult = await db.all(
    sql.raw(`
    SELECT name FROM sqlite_master
    WHERE type = 'index' AND name = '${indexName}'
  `),
  );

  const exists = indexResult.length > 0;

  // エントリ数カウント
  const countResult = await db.get(
    sql.raw(`
    SELECT COUNT(*) as count FROM embeddings
  `),
  );

  return {
    name: indexName,
    entryCount: (countResult as { count: number })?.count ?? 0,
    exists,
  };
}
````

---

## 3. リレーション定義

### 3.1 embeddingsRelations

````typescript
// packages/shared/src/db/schema/relations.ts に追加

import { relations } from "drizzle-orm";
import { embeddings } from "./embeddings";
import { chunks } from "./chunks";

/**
 * embeddingsテーブルのリレーション定義
 *
 * @remarks
 * - chunk: 1つの埋め込みは1つのチャンクに属する（1:1）
 *   - embeddings.chunkId → chunks.id
 *
 * カスケード削除の流れ:
 * ファイル削除 → チャンク削除（CASCADE） → 埋め込み削除（CASCADE）
 *
 * @example
 * ```typescript
 * // 埋め込みと関連するチャンクを一括取得
 * const embeddingWithChunk = await db.query.embeddings.findFirst({
 *   where: eq(embeddings.id, embeddingId),
 *   with: {
 *     chunk: true, // 1:1 relation
 *   },
 * });
 * ```
 */
export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  /**
   * 親チャンク（1:1）
   * embeddings.chunkId → chunks.id
   */
  chunk: one(chunks, {
    fields: [embeddings.chunkId],
    references: [chunks.id],
  }),
}));
````

### 3.2 chunksRelations 更新

```typescript
// packages/shared/src/db/schema/relations.ts の chunksRelations を更新

/**
 * chunksテーブルのリレーション定義（更新版）
 */
export const chunksRelations = relations(chunks, ({ one }) => ({
  // 既存のリレーション
  file: one(files, {
    fields: [chunks.fileId],
    references: [files.id],
  }),
  prevChunk: one(chunks, {
    fields: [chunks.prevChunkId],
    references: [chunks.id],
    relationName: "prevChunkRelation",
  }),
  nextChunk: one(chunks, {
    fields: [chunks.nextChunkId],
    references: [chunks.id],
    relationName: "nextChunkRelation",
  }),

  // 新規追加: 埋め込みとの1:1リレーション
  /**
   * 埋め込み（1:1）
   * chunks.id → embeddings.chunkId
   * @description チャンクに紐づく埋め込みを取得
   */
  embedding: one(embeddings, {
    fields: [chunks.id],
    references: [embeddings.chunkId],
  }),
}));
```

---

## 4. マイグレーションSQL

### 4.1 マイグレーションファイル

```sql
-- packages/shared/src/db/migrations/0006_create_embeddings_table.sql

-- ============================================
-- embeddingsテーブル作成
-- ============================================

CREATE TABLE IF NOT EXISTS embeddings (
  -- 基本情報
  id TEXT PRIMARY KEY,
  chunk_id TEXT NOT NULL UNIQUE REFERENCES chunks(id) ON DELETE CASCADE,

  -- ベクトルデータ
  vector BLOB NOT NULL,
  model_id TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  normalized_magnitude REAL NOT NULL,

  -- タイムスタンプ
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================
-- インデックス作成
-- ============================================

-- chunk_id ユニークインデックス（外部キー制約と別にインデックスも作成）
CREATE UNIQUE INDEX IF NOT EXISTS embeddings_chunk_id_idx
ON embeddings(chunk_id);

-- model_id インデックス
CREATE INDEX IF NOT EXISTS embeddings_model_id_idx
ON embeddings(model_id);

-- ベクトルインデックス（DiskANN）
-- 注意: libSQL 固有の構文
CREATE INDEX IF NOT EXISTS embeddings_vector_idx
ON embeddings(vector)
USING vector(1536)
WITH (metric = 'cosine');

-- ============================================
-- コメント
-- ============================================
-- このマイグレーションは以下を作成します:
-- 1. embeddings テーブル（ベクトル埋め込み保存用）
-- 2. chunk_id の UNIQUE インデックス（1チャンク1埋め込み保証）
-- 3. model_id のインデックス（モデル別フィルタリング用）
-- 4. vector の DiskANN インデックス（高速類似度検索用）
--
-- ロールバック:
-- DROP INDEX IF EXISTS embeddings_vector_idx;
-- DROP INDEX IF EXISTS embeddings_model_id_idx;
-- DROP INDEX IF EXISTS embeddings_chunk_id_idx;
-- DROP TABLE IF EXISTS embeddings;
```

### 4.2 ロールバックSQL

```sql
-- packages/shared/src/db/migrations/0006_create_embeddings_table.rollback.sql

-- インデックス削除
DROP INDEX IF EXISTS embeddings_vector_idx;
DROP INDEX IF EXISTS embeddings_model_id_idx;
DROP INDEX IF EXISTS embeddings_chunk_id_idx;

-- テーブル削除
DROP TABLE IF EXISTS embeddings;
```

---

## 5. index.ts 更新

### 5.1 エクスポート追加

```typescript
// packages/shared/src/db/schema/index.ts

/**
 * データベーススキーマのエクスポート
 */
export * from "./chat-history.js";

// ファイル・変換システム
export * from "./files.js";
export * from "./conversions.js";
export * from "./extracted-metadata.js";
export * from "./chunks.js";
export * from "./chunks-fts.js";

// ベクトル検索システム（新規追加）
export * from "./embeddings.js";
export * from "./vector-index.js";

// リレーション
export * from "./relations.js";
```

---

## 6. 型定義 (interfaces-rag.md との整合)

### 6.1 Branded Types 対応

```typescript
// interfaces-rag.md との整合を維持

// Branded Type 定義
declare const EmbeddingIdBrand: unique symbol;
export type EmbeddingId = string & {
  readonly [EmbeddingIdBrand]: typeof EmbeddingIdBrand;
};

/**
 * EmbeddingId を生成する
 */
export function createEmbeddingId(id: string): EmbeddingId {
  return id as EmbeddingId;
}

/**
 * UUID を EmbeddingId として生成する
 */
export function generateEmbeddingId(): EmbeddingId {
  return crypto.randomUUID() as EmbeddingId;
}
```

### 6.2 EmbeddingEntity 型との対応

| interfaces-rag.md           | embeddings テーブル        | 変換                        |
| --------------------------- | -------------------------- | --------------------------- |
| id: EmbeddingId             | id: text                   | Branded Type としてキャスト |
| chunkId: ChunkId            | chunk_id: text             | Branded Type としてキャスト |
| modelId: EmbeddingModelId   | model_id: text             | Branded Type としてキャスト |
| vector: Float32Array        | vector: blob               | vectorToBlob/blobToVector   |
| dimensions: number          | dimensions: integer        | そのまま                    |
| normalizedMagnitude: number | normalized_magnitude: real | そのまま                    |
| createdAt: Date             | created_at: integer        | UNIX timestamp → Date       |
| updatedAt: Date             | updated_at: integer        | UNIX timestamp → Date       |

---

## 7. データサイズ見積もり

### 7.1 1レコードあたりのサイズ

| カラム               | サイズ           | 備考                     |
| -------------------- | ---------------- | ------------------------ |
| id                   | 36 bytes         | UUID文字列               |
| chunk_id             | 36 bytes         | UUID文字列               |
| vector               | 6,144 bytes      | 1536 \* 4 bytes          |
| model_id             | ~30 bytes        | モデル名文字列           |
| dimensions           | 4 bytes          | INTEGER                  |
| normalized_magnitude | 8 bytes          | REAL                     |
| created_at           | 4 bytes          | INTEGER (UNIX timestamp) |
| updated_at           | 4 bytes          | INTEGER (UNIX timestamp) |
| **合計**             | **~6,270 bytes** | インデックス除く         |

### 7.2 スケール見積もり

| レコード数 | データサイズ | インデックス込み（概算） |
| ---------- | ------------ | ------------------------ |
| 10,000     | ~60 MB       | ~100 MB                  |
| 100,000    | ~600 MB      | ~1 GB                    |
| 1,000,000  | ~6 GB        | ~10 GB                   |

---

## 8. 検証チェックリスト

- [ ] embeddingsテーブルスキーマが正しく定義されている
- [ ] 全フィールドに適切な型・制約が設定されている
- [ ] chunk_idにUNIQUE制約がある
- [ ] カスケード削除が設定されている
- [ ] VectorIndexConfigインターフェースが定義されている
- [ ] インデックス管理関数が定義されている
- [ ] リレーションが正しく設定されている
- [ ] マイグレーションSQLがIF NOT EXISTSを使用している
- [ ] index.tsにエクスポートが追加されている
- [ ] interfaces-rag.mdの型定義と整合している
