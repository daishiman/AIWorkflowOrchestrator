import { relations } from "drizzle-orm";
import { entities } from "./entities";
import { graphRelations } from "./relations";
import { relationEvidence } from "./relation-evidence";
import { communities } from "./communities";
import { entityCommunities } from "./entity-communities";
import { chunkEntities } from "./chunk-entities";
import { chunks } from "../chunks";

/**
 * entitiesテーブルのDrizzleリレーション定義
 *
 * @description
 * - outgoingRelations: このエンティティからの関係（source）
 * - incomingRelations: このエンティティへの関係（target）
 * - communities: 所属するコミュニティ（中間テーブル経由）
 * - chunks: 出現するチャンク（中間テーブル経由）
 */
export const entitiesRelations = relations(entities, ({ many }) => ({
  outgoingRelations: many(graphRelations, { relationName: "source" }),
  incomingRelations: many(graphRelations, { relationName: "target" }),
  communities: many(entityCommunities),
  chunks: many(chunkEntities),
}));

/**
 * graphRelationsテーブルのDrizzleリレーション定義
 *
 * @description
 * - source: ソースエンティティ
 * - target: ターゲットエンティティ
 * - evidence: 関係の証拠（中間テーブル）
 */
export const graphRelationsTableRelations = relations(
  graphRelations,
  ({ one, many }) => ({
    source: one(entities, {
      fields: [graphRelations.sourceId],
      references: [entities.id],
      relationName: "source",
    }),
    target: one(entities, {
      fields: [graphRelations.targetId],
      references: [entities.id],
      relationName: "target",
    }),
    evidence: many(relationEvidence),
  }),
);

/**
 * relationEvidenceテーブルのDrizzleリレーション定義
 *
 * @description
 * - relation: 親の関係
 * - chunk: 証拠のソースチャンク
 */
export const relationEvidenceRelations = relations(
  relationEvidence,
  ({ one }) => ({
    relation: one(graphRelations, {
      fields: [relationEvidence.relationId],
      references: [graphRelations.id],
    }),
    chunk: one(chunks, {
      fields: [relationEvidence.chunkId],
      references: [chunks.id],
    }),
  }),
);

/**
 * communitiesテーブルのDrizzleリレーション定義
 *
 * @description
 * - parent: 親コミュニティ（自己参照）
 * - children: 子コミュニティ（自己参照）
 * - members: メンバーエンティティ（中間テーブル経由）
 */
export const communitiesRelations = relations(communities, ({ one, many }) => ({
  parent: one(communities, {
    fields: [communities.parentId],
    references: [communities.id],
    relationName: "parentChild",
  }),
  children: many(communities, { relationName: "parentChild" }),
  members: many(entityCommunities),
}));

/**
 * entityCommunitiesテーブルのDrizzleリレーション定義
 *
 * @description
 * - entity: 関連するエンティティ
 * - community: 関連するコミュニティ
 */
export const entityCommunitiesRelations = relations(
  entityCommunities,
  ({ one }) => ({
    entity: one(entities, {
      fields: [entityCommunities.entityId],
      references: [entities.id],
    }),
    community: one(communities, {
      fields: [entityCommunities.communityId],
      references: [communities.id],
    }),
  }),
);

/**
 * chunkEntitiesテーブルのDrizzleリレーション定義
 *
 * @description
 * - chunk: 関連するチャンク
 * - entity: 関連するエンティティ
 */
export const chunkEntitiesRelations = relations(chunkEntities, ({ one }) => ({
  chunk: one(chunks, {
    fields: [chunkEntities.chunkId],
    references: [chunks.id],
  }),
  entity: one(entities, {
    fields: [chunkEntities.entityId],
    references: [entities.id],
  }),
}));
