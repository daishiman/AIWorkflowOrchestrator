/**
 * Knowledge Graph スキーマモジュール
 *
 * @description
 * GraphRAGシステムのデータ層を構成するテーブル群のエクスポート
 *
 * @see docs/30-workflows/conv-04-05-knowledge-graph-tables/
 */

// ============================================
// テーブル定義
// ============================================

export { entities, entityTypes } from "./entities";
export type { Entity, NewEntity, EntityType, EntityMetadata } from "./entities";

export { graphRelations, relationTypes } from "./relations";
export type {
  Relation,
  NewRelation,
  RelationType,
  RelationMetadata,
} from "./relations";

export { relationEvidence } from "./relation-evidence";
export type {
  RelationEvidence,
  NewRelationEvidence,
} from "./relation-evidence";

export { communities } from "./communities";
export type { Community, NewCommunity } from "./communities";

export { entityCommunities } from "./entity-communities";
export type { EntityCommunity, NewEntityCommunity } from "./entity-communities";

export { chunkEntities } from "./chunk-entities";
export type {
  ChunkEntity,
  NewChunkEntity,
  EntityPosition,
} from "./chunk-entities";

// ============================================
// Drizzle リレーション定義
// ============================================

export {
  entitiesRelations,
  graphRelationsTableRelations,
  relationEvidenceRelations,
  communitiesRelations,
  entityCommunitiesRelations,
  chunkEntitiesRelations,
} from "./graph-relations";
