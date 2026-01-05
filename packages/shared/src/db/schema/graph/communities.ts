import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  blob,
  index,
} from "drizzle-orm/sqlite-core";

/**
 * communitiesテーブル - Leidenアルゴリズムで検出されたコミュニティ
 *
 * @description
 * - GraphRAGのコミュニティ検出結果を格納
 * - 階層構造をサポート（Leidenマルチレベル）
 * - LLM生成サマリーでコミュニティの概要を提供
 *
 * @remarks
 * - 自己参照外部キー（parentId）で階層を表現
 * - 親コミュニティ削除時はparentIdをNULLに設定（SET NULL）
 *
 * @see docs/30-workflows/conv-04-05-knowledge-graph-tables/outputs/phase-2/database-schema.md
 */
export const communities = sqliteTable(
  "communities",
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
     * 階層レベル
     * @description Leiden検出のレベル（0から開始）
     * @default 0
     */
    level: integer("level").notNull().default(0),

    /**
     * 親コミュニティID
     * @description 自己参照外部キー
     * @nullable ルートコミュニティの場合NULL
     * @onDelete SET NULL
     */
    parentId: text("parent_id"),

    /**
     * コミュニティ名
     * @description LLM生成の名前
     */
    name: text("name").notNull(),

    /**
     * LLM生成サマリー
     * @description コミュニティの概要説明
     */
    summary: text("summary").notNull(),

    /**
     * メンバー数
     * @description このコミュニティに属するエンティティ数
     * @default 0
     */
    memberCount: integer("member_count").notNull().default(0),

    // ============================================
    // 埋め込み情報
    // ============================================

    /**
     * 埋め込みベクトル
     * @description BLOB形式で格納されたFloat32Array
     */
    embedding: blob("embedding"),

    /**
     * 埋め込みモデルID
     * @description ベクトル生成に使用したモデル
     */
    embeddingModelId: text("embedding_model_id"),

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
    // インデックス定義
    // ============================================

    /**
     * レベル インデックス
     * @description 階層レベル別取得
     * @query SELECT * FROM communities WHERE level = ?
     */
    levelIdx: index("communities_level_idx").on(table.level),

    /**
     * 親ID インデックス
     * @description 子コミュニティ一覧取得
     * @query SELECT * FROM communities WHERE parent_id = ?
     */
    parentIdIdx: index("communities_parent_id_idx").on(table.parentId),
  }),
);

/**
 * communitiesテーブルのSELECT型
 */
export type Community = typeof communities.$inferSelect;

/**
 * communitiesテーブルのINSERT型
 */
export type NewCommunity = typeof communities.$inferInsert;
