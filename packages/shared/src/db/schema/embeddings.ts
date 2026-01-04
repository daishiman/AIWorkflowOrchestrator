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
 * @see docs/30-workflows/diskann-vector-index/outputs/phase-2/database-schema.md
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
