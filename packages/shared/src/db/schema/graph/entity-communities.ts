import { sqliteTable, text, index, primaryKey } from "drizzle-orm/sqlite-core";
import { entities } from "./entities";
import { communities } from "./communities";

/**
 * entityCommunitiesテーブル - エンティティとコミュニティの中間テーブル
 *
 * @description
 * - エンティティとコミュニティの多対多関係を管理
 * - 1つのエンティティは複数のコミュニティに属することができる
 * - 1つのコミュニティは複数のエンティティを含む
 *
 * @remarks
 * - 複合主キー（entityId + communityId）
 * - エンティティまたはコミュニティ削除時はCASCADEで削除
 *
 * @see docs/30-workflows/conv-04-05-knowledge-graph-tables/outputs/phase-2/database-schema.md
 */
export const entityCommunities = sqliteTable(
  "entity_communities",
  {
    // ============================================
    // 主キー（複合）
    // ============================================

    /**
     * エンティティID
     * @references entities.id
     * @onDelete CASCADE
     */
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),

    /**
     * コミュニティID
     * @references communities.id
     * @onDelete CASCADE
     */
    communityId: text("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
  },
  (table) => ({
    // ============================================
    // 主キー定義
    // ============================================

    /**
     * 複合主キー
     */
    pk: primaryKey({ columns: [table.entityId, table.communityId] }),

    // ============================================
    // インデックス定義
    // ============================================

    /**
     * エンティティID インデックス
     * @description エンティティが属するコミュニティ取得
     * @query SELECT * FROM entity_communities WHERE entity_id = ?
     */
    entityIdIdx: index("entity_communities_entity_id_idx").on(table.entityId),

    /**
     * コミュニティID インデックス
     * @description コミュニティのメンバー取得
     * @query SELECT * FROM entity_communities WHERE community_id = ?
     */
    communityIdIdx: index("entity_communities_community_id_idx").on(
      table.communityId,
    ),
  }),
);

/**
 * entityCommunitiesテーブルのSELECT型
 */
export type EntityCommunity = typeof entityCommunities.$inferSelect;

/**
 * entityCommunitiesテーブルのINSERT型
 */
export type NewEntityCommunity = typeof entityCommunities.$inferInsert;
