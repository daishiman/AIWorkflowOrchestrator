import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { chunks } from "../chunks";
import { entities } from "./entities";

/**
 * エンティティ出現位置の型定義
 *
 * @description
 * チャンク内でエンティティが出現する位置情報
 */
export interface EntityPosition {
  /**
   * 開始文字位置
   */
  startChar: number;

  /**
   * 終了文字位置
   */
  endChar: number;

  /**
   * 表層形
   * @description 実際のテキストでの表記
   */
  surfaceForm: string;
}

/**
 * chunkEntitiesテーブル - チャンクとエンティティの中間テーブル
 *
 * @description
 * - チャンクとエンティティの多対多関係を管理
 * - 出現回数と位置情報を追跡
 * - 同一エンティティの複数出現をサポート
 *
 * @remarks
 * - 複合主キー（chunkId + entityId）
 * - チャンクまたはエンティティ削除時はCASCADEで削除
 *
 * @see docs/30-workflows/conv-04-05-knowledge-graph-tables/outputs/phase-2/database-schema.md
 */
export const chunkEntities = sqliteTable(
  "chunk_entities",
  {
    // ============================================
    // 主キー（複合）
    // ============================================

    /**
     * チャンクID
     * @references chunks.id
     * @onDelete CASCADE
     */
    chunkId: text("chunk_id")
      .notNull()
      .references(() => chunks.id, { onDelete: "cascade" }),

    /**
     * エンティティID
     * @references entities.id
     * @onDelete CASCADE
     */
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),

    // ============================================
    // 出現情報
    // ============================================

    /**
     * 出現回数
     * @description このチャンク内でのエンティティ出現回数
     * @default 1
     */
    mentionCount: integer("mention_count").notNull().default(1),

    /**
     * 出現位置リスト
     * @description JSON配列として格納
     * @see EntityPosition
     * @default []
     */
    positions: text("positions", { mode: "json" })
      .notNull()
      .$type<EntityPosition[]>()
      .default(sql`'[]'`),
  },
  (table) => ({
    // ============================================
    // 主キー定義
    // ============================================

    /**
     * 複合主キー
     */
    pk: primaryKey({ columns: [table.chunkId, table.entityId] }),

    // ============================================
    // インデックス定義
    // ============================================

    /**
     * チャンクID インデックス
     * @description チャンク内のエンティティ取得
     * @query SELECT * FROM chunk_entities WHERE chunk_id = ?
     */
    chunkIdIdx: index("chunk_entities_chunk_id_idx").on(table.chunkId),

    /**
     * エンティティID インデックス
     * @description エンティティが出現するチャンク取得
     * @query SELECT * FROM chunk_entities WHERE entity_id = ?
     */
    entityIdIdx: index("chunk_entities_entity_id_idx").on(table.entityId),
  }),
);

/**
 * chunkEntitiesテーブルのSELECT型
 */
export type ChunkEntity = typeof chunkEntities.$inferSelect;

/**
 * chunkEntitiesテーブルのINSERT型
 */
export type NewChunkEntity = typeof chunkEntities.$inferInsert;
