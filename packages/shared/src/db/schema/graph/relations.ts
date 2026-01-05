import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { entities } from "./entities";

/**
 * 関係タイプのEnum定義
 *
 * @description Knowledge Graphのエッジタイプを定義
 * @see docs/30-workflows/conv-04-05-knowledge-graph-tables/outputs/phase-2/architecture-design.md
 */
export const relationTypes = [
  // 基本関係
  "related_to", // 関連がある
  "part_of", // ～の一部
  "has_part", // ～を含む
  "belongs_to", // ～に属する

  // 時間関係
  "preceded_by", // ～に先行される
  "followed_by", // ～に続く
  "concurrent_with", // ～と同時

  // コード関係
  "uses", // 使用する
  "used_by", // 使用される
  "implements", // 実装する
  "extends", // 拡張する
  "depends_on", // 依存する
  "calls", // 呼び出す
  "imports", // インポートする

  // 階層関係
  "parent_of", // 親
  "child_of", // 子

  // 参照関係
  "references", // 参照する
  "referenced_by", // 参照される
  "defines", // 定義する
  "defined_by", // 定義される

  // 社会関係
  "authored_by", // 著者
  "works_for", // 所属
  "collaborates_with", // 協力
] as const;

export type RelationType = (typeof relationTypes)[number];

/**
 * 関係のメタデータ型定義
 *
 * @description
 * 関係に関する追加情報を格納するJSON構造
 */
export interface RelationMetadata {
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
 * graphRelationsテーブル - Knowledge Graphの関係（エッジ）
 *
 * @description
 * - エンティティ間の関係を管理
 * - 有向グラフとして設計（双方向フラグで両方向を表現可能）
 * - 証拠カウントで関係の信頼性を追跡
 *
 * @remarks
 * - 変数名は `graphRelations` を使用（Drizzle ORMの `relations` 関数と衝突回避）
 * - SQLテーブル名は `relations`
 * - エンティティ削除時はCASCADEで関連レコードも削除
 *
 * @see docs/30-workflows/conv-04-05-knowledge-graph-tables/outputs/phase-2/database-schema.md
 */
export const graphRelations = sqliteTable(
  "relations",
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
     * ソースエンティティID
     * @references entities.id
     * @onDelete CASCADE
     */
    sourceId: text("source_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),

    /**
     * ターゲットエンティティID
     * @references entities.id
     * @onDelete CASCADE
     */
    targetId: text("target_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),

    /**
     * 関係タイプ
     * @see RelationType
     */
    type: text("type").notNull(),

    /**
     * 説明
     * @description 関係の説明文（LLM生成可能）
     */
    description: text("description"),

    // ============================================
    // スコアリング
    // ============================================

    /**
     * 関係の強さ
     * @description 0.0-1.0の範囲
     * @default 0.5
     */
    weight: real("weight").notNull().default(0.5),

    /**
     * 双方向フラグ
     * @description 0=単方向, 1=双方向
     * @default 0
     */
    bidirectional: integer("bidirectional").notNull().default(0),

    /**
     * 証拠数
     * @description この関係を裏付けるチャンクの数
     * @default 1
     */
    evidenceCount: integer("evidence_count").notNull().default(1),

    // ============================================
    // メタデータ・監査
    // ============================================

    /**
     * JSONメタデータ
     * @description 追加情報
     */
    metadata: text("metadata", { mode: "json" }).$type<RelationMetadata>(),

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
     * ソースID インデックス
     * @description エンティティからの関係取得
     * @query SELECT * FROM relations WHERE source_id = ?
     */
    sourceIdIdx: index("relations_source_id_idx").on(table.sourceId),

    /**
     * ターゲットID インデックス
     * @description エンティティへの関係取得
     * @query SELECT * FROM relations WHERE target_id = ?
     */
    targetIdIdx: index("relations_target_id_idx").on(table.targetId),

    /**
     * タイプ インデックス
     * @description 関係タイプ別フィルタリング
     * @query SELECT * FROM relations WHERE type = ?
     */
    typeIdx: index("relations_type_idx").on(table.type),

    /**
     * 重み インデックス
     * @description 重要な関係の優先取得
     * @query SELECT * FROM relations ORDER BY weight DESC
     */
    weightIdx: index("relations_weight_idx").on(table.weight),

    /**
     * ソース+ターゲット+タイプ 一意インデックス
     * @description 同一ペア間の同種関係を防止
     * @query SELECT * FROM relations WHERE source_id = ? AND target_id = ? AND type = ?
     */
    sourceTargetTypeIdx: uniqueIndex("relations_source_target_type_idx").on(
      table.sourceId,
      table.targetId,
      table.type,
    ),
  }),
);

/**
 * graphRelationsテーブルのSELECT型
 */
export type Relation = typeof graphRelations.$inferSelect;

/**
 * graphRelationsテーブルのINSERT型
 */
export type NewRelation = typeof graphRelations.$inferInsert;
