/**
 * pgVector スキーマテンプレート
 *
 * このファイルをコピーして、プロジェクトに合わせて設定してください。
 *
 * 前提条件:
 * - pgvector拡張がインストール済み
 * - Drizzle ORM使用
 */

import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// =============================================================================
// カスタム型定義（pgvector用）
// =============================================================================

/**
 * ベクトル型のカスタム定義
 * Drizzleの標準型にない場合に使用
 */
import { customType } from "drizzle-orm/pg-core";

const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions || 1536})`;
  },
  toDriver(value) {
    return `[${value.join(",")}]`;
  },
  fromDriver(value) {
    // "[0.1,0.2,...]" -> [0.1, 0.2, ...]
    return value
      .substring(1, value.length - 1)
      .split(",")
      .map(Number);
  },
});

// =============================================================================
// ドキュメントスキーマ
// =============================================================================

/**
 * メインドキュメントテーブル
 * RAGシステムでの検索対象
 */
export const documents = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),

    // コンテンツ
    title: text("title"),
    content: text("content").notNull(),

    // Embedding（OpenAI text-embedding-3-small: 1536次元）
    embedding: vector("embedding", { dimensions: 1536 }),

    // メタデータ
    metadata: jsonb("metadata")
      .$type<{
        source?: string;
        category?: string;
        tags?: string[];
        author?: string;
        language?: string;
        [key: string]: unknown;
      }>()
      .default({}),

    // タイムスタンプ
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // HNSWインデックス（推奨）
    embeddingIdx: index("idx_documents_embedding")
      .on(table.embedding)
      .using(sql`hnsw (embedding vector_cosine_ops)`),

    // メタデータ検索用GINインデックス
    metadataIdx: index("idx_documents_metadata")
      .on(table.metadata)
      .using(sql`gin`),
  }),
);

// =============================================================================
// チャンクスキーマ（大きなドキュメントを分割する場合）
// =============================================================================

/**
 * ドキュメントチャンクテーブル
 * 大きなドキュメントを分割して格納
 */
export const documentChunks = pgTable(
  "document_chunks",
  {
    id: serial("id").primaryKey(),

    // 親ドキュメントへの参照
    documentId: integer("document_id")
      .references(() => documents.id, { onDelete: "cascade" })
      .notNull(),

    // チャンク情報
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),

    // チャンクのEmbedding
    embedding: vector("embedding", { dimensions: 1536 }),

    // チャンク固有のメタデータ
    metadata: jsonb("metadata")
      .$type<{
        startChar?: number;
        endChar?: number;
        tokenCount?: number;
        [key: string]: unknown;
      }>()
      .default({}),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    // ユニーク制約
    uniqueChunk: uniqueIndex("idx_chunks_unique").on(
      table.documentId,
      table.chunkIndex,
    ),

    // HNSWインデックス
    embeddingIdx: index("idx_chunks_embedding")
      .on(table.embedding)
      .using(sql`hnsw (embedding vector_cosine_ops)`),

    // ドキュメントIDでの検索用
    documentIdx: index("idx_chunks_document").on(table.documentId),
  }),
);

// =============================================================================
// Embeddingキャッシュスキーマ
// =============================================================================

/**
 * Embeddingキャッシュテーブル
 * 同じテキストのEmbedding再生成を防ぐ
 */
export const embeddingCache = pgTable(
  "embedding_cache",
  {
    id: serial("id").primaryKey(),

    // テキストのハッシュ（ルックアップ用）
    textHash: text("text_hash").notNull().unique(),

    // Embeddingモデル情報
    model: text("model").notNull().default("text-embedding-3-small"),
    dimensions: integer("dimensions").notNull().default(1536),

    // Embedding
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),

    // キャッシュメタデータ
    createdAt: timestamp("created_at").defaultNow(),
    lastUsedAt: timestamp("last_used_at").defaultNow(),
    useCount: integer("use_count").default(1),
  },
  (table) => ({
    hashIdx: index("idx_cache_hash").on(table.textHash),
    modelIdx: index("idx_cache_model").on(table.model),
  }),
);

// =============================================================================
// 型定義
// =============================================================================

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type DocumentChunk = typeof documentChunks.$inferSelect;
export type NewDocumentChunk = typeof documentChunks.$inferInsert;

export type EmbeddingCache = typeof embeddingCache.$inferSelect;
export type NewEmbeddingCache = typeof embeddingCache.$inferInsert;

// =============================================================================
// ヘルパー関数
// =============================================================================

import { db } from "./db"; // プロジェクトのDB設定に合わせて変更

/**
 * 類似ドキュメントを検索
 */
export async function searchSimilarDocuments(
  queryEmbedding: number[],
  limit = 10,
  threshold = 0.7,
) {
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  return db.execute(sql`
    SELECT
      id,
      title,
      content,
      metadata,
      1 - (embedding <=> ${embeddingStr}::vector) AS similarity
    FROM documents
    WHERE embedding IS NOT NULL
      AND 1 - (embedding <=> ${embeddingStr}::vector) > ${threshold}
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `);
}

/**
 * メタデータでフィルタリングして検索
 */
export async function searchWithMetadataFilter(
  queryEmbedding: number[],
  filter: {
    category?: string;
    tags?: string[];
  },
  limit = 10,
) {
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  let query = sql`
    SELECT
      id,
      title,
      content,
      metadata,
      1 - (embedding <=> ${embeddingStr}::vector) AS similarity
    FROM documents
    WHERE embedding IS NOT NULL
  `;

  if (filter.category) {
    query = sql`${query} AND metadata->>'category' = ${filter.category}`;
  }

  if (filter.tags?.length) {
    query = sql`${query} AND metadata->'tags' ?| ${filter.tags}`;
  }

  query = sql`${query} ORDER BY embedding <=> ${embeddingStr}::vector LIMIT ${limit}`;

  return db.execute(query);
}

/**
 * ドキュメントとチャンクを一括挿入
 */
export async function insertDocumentWithChunks(
  doc: NewDocument,
  chunks: { content: string; embedding: number[] }[],
) {
  return db.transaction(async (tx) => {
    // ドキュメントを挿入
    const [insertedDoc] = await tx.insert(documents).values(doc).returning();

    // チャンクを挿入
    if (chunks.length > 0) {
      await tx.insert(documentChunks).values(
        chunks.map((chunk, index) => ({
          documentId: insertedDoc.id,
          chunkIndex: index,
          content: chunk.content,
          embedding: chunk.embedding,
        })),
      );
    }

    return insertedDoc;
  });
}

// =============================================================================
// マイグレーション用SQL
// =============================================================================

/*
マイグレーションファイルに追加が必要なSQL:

-- pgvector拡張を有効化
CREATE EXTENSION IF NOT EXISTS vector;

-- HNSWインデックスの作成（本番用）
CREATE INDEX CONCURRENTLY idx_documents_embedding_hnsw
ON documents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 検索パフォーマンスの調整
-- セッションまたはグローバルで設定
SET hnsw.ef_search = 100;

-- IVFFlatを使用する場合
CREATE INDEX CONCURRENTLY idx_documents_embedding_ivfflat
ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

SET ivfflat.probes = 10;
*/
