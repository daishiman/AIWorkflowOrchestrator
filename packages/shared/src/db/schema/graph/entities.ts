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

/**
 * エンティティタイプのEnum定義
 *
 * @description Knowledge Graphのノードタイプを定義
 * @see docs/30-workflows/conv-04-05-knowledge-graph-tables/outputs/phase-2/architecture-design.md
 */
export const entityTypes = [
  "person", // 人物
  "organization", // 組織・会社
  "location", // 場所・地域
  "date", // 日付・期間
  "event", // イベント・出来事
  "technology", // 技術・言語
  "concept", // 概念・アイデア
  "product", // 製品・サービス
  "api", // API・エンドポイント
  "function", // 関数
  "class", // クラス
  "document", // ドキュメント
  "section", // セクション
  "other", // その他
] as const;

export type EntityType = (typeof entityTypes)[number];

/**
 * エンティティのメタデータ型定義
 *
 * @description
 * エンティティに関する追加情報を格納するJSON構造
 * 将来的な拡張性を確保するため、追加プロパティを許可
 */
export interface EntityMetadata {
  /**
   * 抽出元ソース
   */
  source?: string;

  /**
   * 信頼度スコア
   */
  confidence?: number;

  /**
   * カスタムメタデータ
   */
  [key: string]: unknown;
}

/**
 * entitiesテーブル - Knowledge Graphのエンティティ（ノード）
 *
 * @description
 * - GraphRAGシステムのノードを管理
 * - 名前の正規化により同一エンティティの検出を支援
 * - 埋め込みベクトルでセマンティック検索をサポート
 * - 重要度スコアでエンティティのランキングを提供
 *
 * @remarks
 * - 同一タイプ内で正規化名がユニークである必要がある
 * - エンティティ削除時は関連するrelationsもCASCADEで削除
 *
 * @see docs/30-workflows/conv-04-05-knowledge-graph-tables/outputs/phase-2/database-schema.md
 */
export const entities = sqliteTable(
  "entities",
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
     * エンティティ名
     * @description 元の表記を保持
     * @example "TypeScript", "React.js"
     */
    name: text("name").notNull(),

    /**
     * 検索用正規化名
     * @description 小文字化・正規化された名前
     * @example "typescript", "react.js"
     */
    normalizedName: text("normalized_name").notNull(),

    /**
     * エンティティタイプ
     * @see EntityType
     */
    type: text("type").notNull(),

    /**
     * 説明
     * @description エンティティの説明文（LLM生成可能）
     */
    description: text("description"),

    /**
     * 別名リスト
     * @description JSON配列として格納
     * @example ["TS", "TypeScript 5.x"]
     * @default []
     */
    aliases: text("aliases", { mode: "json" })
      .notNull()
      .$type<string[]>()
      .default(sql`'[]'`),

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
     * @example "text-embedding-3-small"
     */
    embeddingModelId: text("embedding_model_id"),

    // ============================================
    // スコアリング
    // ============================================

    /**
     * 重要度スコア
     * @description 0.0-1.0の範囲
     * @default 0.5
     */
    importance: real("importance").notNull().default(0.5),

    /**
     * 出現回数
     * @description ドキュメント全体での出現カウント
     * @default 1
     */
    mentionCount: integer("mention_count").notNull().default(1),

    // ============================================
    // メタデータ・監査
    // ============================================

    /**
     * JSONメタデータ
     * @description 追加情報
     */
    metadata: text("metadata", { mode: "json" }).$type<EntityMetadata>(),

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
     * 正規化名 インデックス
     * @description エンティティ名検索
     * @query SELECT * FROM entities WHERE normalized_name = ?
     */
    normalizedNameIdx: index("entities_normalized_name_idx").on(
      table.normalizedName,
    ),

    /**
     * タイプ インデックス
     * @description タイプ別フィルタリング
     * @query SELECT * FROM entities WHERE type = ?
     */
    typeIdx: index("entities_type_idx").on(table.type),

    /**
     * 重要度 インデックス
     * @description 重要度順ソート
     * @query SELECT * FROM entities ORDER BY importance DESC
     */
    importanceIdx: index("entities_importance_idx").on(table.importance),

    /**
     * 正規化名+タイプ 一意インデックス
     * @description 同一タイプ内での名前の一意性保証
     * @query SELECT * FROM entities WHERE normalized_name = ? AND type = ?
     */
    nameTypeIdx: uniqueIndex("entities_name_type_idx").on(
      table.normalizedName,
      table.type,
    ),
  }),
);

/**
 * entitiesテーブルのSELECT型
 */
export type Entity = typeof entities.$inferSelect;

/**
 * entitiesテーブルのINSERT型
 */
export type NewEntity = typeof entities.$inferInsert;
