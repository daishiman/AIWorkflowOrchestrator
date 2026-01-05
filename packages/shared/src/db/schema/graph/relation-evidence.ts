import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { graphRelations } from "./relations";
import { chunks } from "../chunks";

/**
 * relationEvidenceテーブル - 関係の証拠（出典チャンク）
 *
 * @description
 * - 関係とチャンクの多対多関係を管理
 * - 各関係が抽出されたテキストの証拠を保持
 * - 信頼度スコアで証拠の品質を追跡
 *
 * @remarks
 * - 複合主キー（relationId + chunkId）
 * - 関係またはチャンク削除時はCASCADEで削除
 *
 * @see docs/30-workflows/conv-04-05-knowledge-graph-tables/outputs/phase-2/database-schema.md
 */
export const relationEvidence = sqliteTable(
  "relation_evidence",
  {
    // ============================================
    // 主キー（複合）
    // ============================================

    /**
     * 関係ID
     * @references relations.id
     * @onDelete CASCADE
     */
    relationId: text("relation_id")
      .notNull()
      .references(() => graphRelations.id, { onDelete: "cascade" }),

    /**
     * チャンクID
     * @references chunks.id
     * @onDelete CASCADE
     */
    chunkId: text("chunk_id")
      .notNull()
      .references(() => chunks.id, { onDelete: "cascade" }),

    // ============================================
    // 証拠情報
    // ============================================

    /**
     * 証拠テキスト抜粋
     * @description 関係を示すテキストの抜粋
     */
    excerpt: text("excerpt").notNull(),

    /**
     * 信頼度スコア
     * @description 0.0-1.0の範囲
     * @default 0.5
     */
    confidence: real("confidence").notNull().default(0.5),

    // ============================================
    // 監査
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
    // 主キー定義
    // ============================================

    /**
     * 複合主キー
     */
    pk: primaryKey({ columns: [table.relationId, table.chunkId] }),

    // ============================================
    // インデックス定義
    // ============================================

    /**
     * 関係ID インデックス
     * @description 特定関係の証拠一覧取得
     * @query SELECT * FROM relation_evidence WHERE relation_id = ?
     */
    relationIdIdx: index("relation_evidence_relation_id_idx").on(
      table.relationId,
    ),

    /**
     * チャンクID インデックス
     * @description 特定チャンクに関連する証拠取得
     * @query SELECT * FROM relation_evidence WHERE chunk_id = ?
     */
    chunkIdIdx: index("relation_evidence_chunk_id_idx").on(table.chunkId),
  }),
);

/**
 * relationEvidenceテーブルのSELECT型
 */
export type RelationEvidence = typeof relationEvidence.$inferSelect;

/**
 * relationEvidenceテーブルのINSERT型
 */
export type NewRelationEvidence = typeof relationEvidence.$inferInsert;
