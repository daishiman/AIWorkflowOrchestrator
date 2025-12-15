# CONV-04-05: Knowledge Graph テーブル群

## 概要

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | CONV-04-05                             |
| タスク名 | Knowledge Graph テーブル群             |
| 依存     | CONV-04-01                             |
| 規模     | 中                                     |
| 出力場所 | `packages/shared/src/db/schema/graph/` |

## 目的

Knowledge Graph（エンティティ、関係、コミュニティ）を永続化するテーブル群を定義する。
GraphRAGの基盤となる。

## 成果物

### 1. entitiesテーブル定義

```typescript
// packages/shared/src/db/schema/graph/entities.ts

import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { uuidPrimaryKey, timestamps, metadataColumn } from "../common";

/**
 * entitiesテーブル - エンティティ（ノード）
 */
export const entities = sqliteTable(
  "entities",
  {
    // 主キー
    id: uuidPrimaryKey(),

    // 基本情報
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(), // 検索用正規化名
    type: text("type", {
      enum: [
        "person",
        "organization",
        "location",
        "date",
        "event",
        "technology",
        "concept",
        "product",
        "api",
        "function",
        "class",
        "document",
        "section",
        "other",
      ],
    }).notNull(),

    // 詳細
    description: text("description"),
    aliases: text("aliases", { mode: "json" }).$type<string[]>().default([]),

    // 埋め込み（オプション）
    embedding: blob("embedding", { mode: "buffer" }),
    embeddingModelId: text("embedding_model_id"),

    // 重要度スコア
    importance: real("importance").notNull().default(0.5),

    // 出現回数（チャンク横断）
    mentionCount: integer("mention_count").notNull().default(1),

    // メタデータ
    metadata: metadataColumn(),

    // タイムスタンプ
    ...timestamps,
  },
  (table) => ({
    // インデックス
    normalizedNameIdx: index("entities_normalized_name_idx").on(
      table.normalizedName,
    ),
    typeIdx: index("entities_type_idx").on(table.type),
    importanceIdx: index("entities_importance_idx").on(table.importance),
    nameTypeIdx: uniqueIndex("entities_name_type_idx").on(
      table.normalizedName,
      table.type,
    ),
  }),
);

/**
 * entitiesテーブルの型
 */
export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;
```

### 2. relationsテーブル定義

```typescript
// packages/shared/src/db/schema/graph/relations.ts

import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  foreignKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { uuidPrimaryKey, timestamps, metadataColumn } from "../common";
import { entities } from "./entities";

/**
 * relationsテーブル - 関係（エッジ）
 */
export const relations = sqliteTable(
  "relations",
  {
    // 主キー
    id: uuidPrimaryKey(),

    // 外部キー（エッジの両端）
    sourceId: text("source_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    targetId: text("target_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),

    // 関係タイプ
    type: text("type", {
      enum: [
        "related_to",
        "part_of",
        "has_part",
        "belongs_to",
        "preceded_by",
        "followed_by",
        "concurrent_with",
        "uses",
        "used_by",
        "implements",
        "extends",
        "depends_on",
        "calls",
        "imports",
        "parent_of",
        "child_of",
        "references",
        "referenced_by",
        "defines",
        "defined_by",
        "authored_by",
        "works_for",
        "collaborates_with",
      ],
    }).notNull(),

    // 詳細
    description: text("description"),

    // 関係の強さ
    weight: real("weight").notNull().default(0.5),

    // 双方向フラグ
    bidirectional: integer("bidirectional", { mode: "boolean" })
      .notNull()
      .default(false),

    // 証拠数（この関係を支持するチャンク数）
    evidenceCount: integer("evidence_count").notNull().default(1),

    // メタデータ
    metadata: metadataColumn(),

    // タイムスタンプ
    ...timestamps,
  },
  (table) => ({
    // インデックス
    sourceIdIdx: index("relations_source_id_idx").on(table.sourceId),
    targetIdIdx: index("relations_target_id_idx").on(table.targetId),
    typeIdx: index("relations_type_idx").on(table.type),
    weightIdx: index("relations_weight_idx").on(table.weight),
    // 複合インデックス（重複チェック用）
    sourceTargetTypeIdx: uniqueIndex("relations_source_target_type_idx").on(
      table.sourceId,
      table.targetId,
      table.type,
    ),
  }),
);

/**
 * relationsテーブルの型
 */
export type Relation = typeof relations.$inferSelect;
export type NewRelation = typeof relations.$inferInsert;
```

### 3. relation_evidenceテーブル定義

```typescript
// packages/shared/src/db/schema/graph/relation-evidence.ts

import {
  sqliteTable,
  text,
  real,
  index,
  foreignKey,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { timestamps } from "../common";
import { relations } from "./relations";
import { chunks } from "../chunks";

/**
 * relationEvidenceテーブル - 関係の証拠（出典チャンク）
 */
export const relationEvidence = sqliteTable(
  "relation_evidence",
  {
    // 複合主キー
    relationId: text("relation_id")
      .notNull()
      .references(() => relations.id, { onDelete: "cascade" }),
    chunkId: text("chunk_id")
      .notNull()
      .references(() => chunks.id, { onDelete: "cascade" }),

    // 証拠テキスト抜粋
    excerpt: text("excerpt").notNull(),

    // 信頼度スコア
    confidence: real("confidence").notNull().default(0.5),

    // タイムスタンプ
    ...timestamps,
  },
  (table) => ({
    pk: primaryKey({ columns: [table.relationId, table.chunkId] }),
    relationIdIdx: index("relation_evidence_relation_id_idx").on(
      table.relationId,
    ),
    chunkIdIdx: index("relation_evidence_chunk_id_idx").on(table.chunkId),
  }),
);

/**
 * relationEvidenceテーブルの型
 */
export type RelationEvidence = typeof relationEvidence.$inferSelect;
export type NewRelationEvidence = typeof relationEvidence.$inferInsert;
```

### 4. communitiesテーブル定義

```typescript
// packages/shared/src/db/schema/graph/communities.ts

import {
  sqliteTable,
  text,
  integer,
  blob,
  index,
  foreignKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { uuidPrimaryKey, timestamps } from "../common";

/**
 * communitiesテーブル - コミュニティ（Leidenアルゴリズム検出）
 */
export const communities = sqliteTable(
  "communities",
  {
    // 主キー
    id: uuidPrimaryKey(),

    // 階層情報
    level: integer("level").notNull().default(0),
    parentId: text("parent_id"), // 親コミュニティID（自己参照）

    // 基本情報
    name: text("name").notNull(),
    summary: text("summary").notNull(), // LLM生成サマリー

    // メンバー情報
    memberCount: integer("member_count").notNull().default(0),

    // 埋め込み（オプション）
    embedding: blob("embedding", { mode: "buffer" }),
    embeddingModelId: text("embedding_model_id"),

    // タイムスタンプ
    ...timestamps,
  },
  (table) => ({
    // インデックス
    levelIdx: index("communities_level_idx").on(table.level),
    parentIdIdx: index("communities_parent_id_idx").on(table.parentId),
  }),
);

/**
 * communitiesテーブルの型
 */
export type Community = typeof communities.$inferSelect;
export type NewCommunity = typeof communities.$inferInsert;
```

### 5. entity_communitiesテーブル定義

```typescript
// packages/shared/src/db/schema/graph/entity-communities.ts

import { sqliteTable, text, index, primaryKey } from "drizzle-orm/sqlite-core";
import { entities } from "./entities";
import { communities } from "./communities";

/**
 * entityCommunitiesテーブル - エンティティとコミュニティの多対多関係
 */
export const entityCommunities = sqliteTable(
  "entity_communities",
  {
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    communityId: text("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.entityId, table.communityId] }),
    entityIdIdx: index("entity_communities_entity_id_idx").on(table.entityId),
    communityIdIdx: index("entity_communities_community_id_idx").on(
      table.communityId,
    ),
  }),
);

/**
 * entityCommunitiesテーブルの型
 */
export type EntityCommunity = typeof entityCommunities.$inferSelect;
export type NewEntityCommunity = typeof entityCommunities.$inferInsert;
```

### 6. chunk_entitiesテーブル定義

```typescript
// packages/shared/src/db/schema/graph/chunk-entities.ts

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
 * chunkEntitiesテーブル - チャンクとエンティティの多対多関係
 */
export const chunkEntities = sqliteTable(
  "chunk_entities",
  {
    chunkId: text("chunk_id")
      .notNull()
      .references(() => chunks.id, { onDelete: "cascade" }),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),

    // メンション情報
    mentionCount: integer("mention_count").notNull().default(1),
    positions: text("positions", { mode: "json" })
      .$type<
        Array<{
          startChar: number;
          endChar: number;
          surfaceForm: string;
        }>
      >()
      .default([]),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chunkId, table.entityId] }),
    chunkIdIdx: index("chunk_entities_chunk_id_idx").on(table.chunkId),
    entityIdIdx: index("chunk_entities_entity_id_idx").on(table.entityId),
  }),
);

/**
 * chunkEntitiesテーブルの型
 */
export type ChunkEntity = typeof chunkEntities.$inferSelect;
export type NewChunkEntity = typeof chunkEntities.$inferInsert;
```

### 7. グラフリレーション定義

```typescript
// packages/shared/src/db/schema/graph/graph-relations.ts

import { relations as drizzleRelations } from "drizzle-orm";
import { entities } from "./entities";
import { relations } from "./relations";
import { relationEvidence } from "./relation-evidence";
import { communities } from "./communities";
import { entityCommunities } from "./entity-communities";
import { chunkEntities } from "./chunk-entities";
import { chunks } from "../chunks";

/**
 * entitiesテーブルのリレーション
 */
export const entitiesRelations = drizzleRelations(entities, ({ many }) => ({
  outgoingRelations: many(relations, { relationName: "source" }),
  incomingRelations: many(relations, { relationName: "target" }),
  communities: many(entityCommunities),
  chunks: many(chunkEntities),
}));

/**
 * relationsテーブルのリレーション
 */
export const relationsTableRelations = drizzleRelations(
  relations,
  ({ one, many }) => ({
    source: one(entities, {
      fields: [relations.sourceId],
      references: [entities.id],
      relationName: "source",
    }),
    target: one(entities, {
      fields: [relations.targetId],
      references: [entities.id],
      relationName: "target",
    }),
    evidence: many(relationEvidence),
  }),
);

/**
 * relationEvidenceテーブルのリレーション
 */
export const relationEvidenceRelations = drizzleRelations(
  relationEvidence,
  ({ one }) => ({
    relation: one(relations, {
      fields: [relationEvidence.relationId],
      references: [relations.id],
    }),
    chunk: one(chunks, {
      fields: [relationEvidence.chunkId],
      references: [chunks.id],
    }),
  }),
);

/**
 * communitiesテーブルのリレーション
 */
export const communitiesRelations = drizzleRelations(
  communities,
  ({ one, many }) => ({
    parent: one(communities, {
      fields: [communities.parentId],
      references: [communities.id],
      relationName: "parent",
    }),
    children: many(communities, { relationName: "parent" }),
    members: many(entityCommunities),
  }),
);

/**
 * entityCommunitiesテーブルのリレーション
 */
export const entityCommunitiesRelations = drizzleRelations(
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
 * chunkEntitiesテーブルのリレーション
 */
export const chunkEntitiesRelations = drizzleRelations(
  chunkEntities,
  ({ one }) => ({
    chunk: one(chunks, {
      fields: [chunkEntities.chunkId],
      references: [chunks.id],
    }),
    entity: one(entities, {
      fields: [chunkEntities.entityId],
      references: [entities.id],
    }),
  }),
);
```

### 8. スキーマエクスポート

```typescript
// packages/shared/src/db/schema/graph/index.ts

export * from "./entities";
export * from "./relations";
export * from "./relation-evidence";
export * from "./communities";
export * from "./entity-communities";
export * from "./chunk-entities";
export * from "./graph-relations";
```

## ディレクトリ構造

```
packages/shared/src/db/schema/graph/
├── index.ts              # バレルエクスポート
├── entities.ts           # エンティティテーブル
├── relations.ts          # 関係テーブル
├── relation-evidence.ts  # 関係証拠テーブル
├── communities.ts        # コミュニティテーブル
├── entity-communities.ts # エンティティ-コミュニティ中間テーブル
├── chunk-entities.ts     # チャンク-エンティティ中間テーブル
└── graph-relations.ts    # Drizzleリレーション定義
```

## 受け入れ条件

- [ ] `entities` テーブルが定義されている
- [ ] `relations` テーブルが定義されている
- [ ] `relationEvidence` テーブルが定義されている
- [ ] `communities` テーブルが定義されている
- [ ] `entityCommunities` 中間テーブルが定義されている
- [ ] `chunkEntities` 中間テーブルが定義されている
- [ ] 適切なインデックスが設定されている
- [ ] 外部キー制約が設定されている
- [ ] Drizzleリレーションが定義されている
- [ ] マイグレーションが正常に実行できる
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-04-01: Drizzle ORM セットアップ

### このタスクに依存するもの

- CONV-06-04: エンティティ抽出サービス (NER)
- CONV-06-05: 関係抽出サービス
- CONV-08-01: Knowledge Graph ストア実装
- CONV-08-02: コミュニティ検出 (Leiden)

## 備考

- `normalizedName` + `type` で一意性を担保（同名エンティティの区別）
- コミュニティは階層構造を持つ（Leidenアルゴリズムのマルチレベル検出に対応）
- 埋め込みはオプション（エンティティ/コミュニティ単位のセマンティック検索に使用）
- `relationEvidence` により、各関係の出典を追跡可能
