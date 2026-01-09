# Drizzleクエリ設計 - Knowledge Graph ストア

## 文書情報

| 項目           | 内容       |
| -------------- | ---------- |
| タスクID       | CONV-08-01 |
| Phase          | 2          |
| 文書バージョン | 1.0.0      |
| 作成日         | 2026-01-09 |

---

## 1. スキーマ参照

### 1.1 使用テーブル

```typescript
import { entities } from "@/db/schema/graph/entities";
import { graphRelations } from "@/db/schema/graph/relations";
import { chunkEntities } from "@/db/schema/graph/chunk-entities";
import { relationEvidence } from "@/db/schema/graph/relation-evidence";
```

### 1.2 テーブル構造サマリー

| テーブル         | 主キー | 主要カラム                                          |
| ---------------- | ------ | --------------------------------------------------- |
| entities         | id     | name, normalizedName, type, embedding, mentionCount |
| graphRelations   | id     | sourceId, targetId, type, weight, bidirectional     |
| chunkEntities    | (複合) | chunkId, entityId, mentionCount, positions          |
| relationEvidence | id     | relationId, chunkId, excerpt, confidence            |

---

## 2. エンティティ操作クエリ

### 2.1 正規化名でエンティティ検索

```typescript
/**
 * 正規化名とタイプで既存エンティティを検索
 */
async function findEntityByNormalizedName(
  db: DrizzleDatabase,
  normalizedName: string,
  type: EntityType,
): Promise<Entity | undefined> {
  const results = await db
    .select()
    .from(entities)
    .where(
      and(eq(entities.normalizedName, normalizedName), eq(entities.type, type)),
    )
    .limit(1);

  return results[0];
}
```

### 2.2 エンティティ挿入

```typescript
/**
 * 新規エンティティ挿入
 */
async function insertEntity(
  db: DrizzleDatabase,
  entity: NewEntity,
): Promise<Entity> {
  const results = await db.insert(entities).values(entity).returning();

  return results[0];
}
```

### 2.3 エンティティ更新（マージ）

```typescript
/**
 * 既存エンティティの更新（マージ処理）
 */
async function updateEntityForMerge(
  db: DrizzleDatabase,
  id: string,
  updates: {
    mentionCount: number;
    aliases: string[];
    embedding?: Buffer | null;
    updatedAt: Date;
  },
): Promise<Entity> {
  const results = await db
    .update(entities)
    .set({
      mentionCount: updates.mentionCount,
      aliases: updates.aliases,
      embedding: updates.embedding,
      updatedAt: updates.updatedAt,
    })
    .where(eq(entities.id, id))
    .returning();

  return results[0];
}
```

### 2.4 条件検索

```typescript
/**
 * 複合条件でエンティティ検索
 */
async function findEntitiesByQuery(
  db: DrizzleDatabase,
  query: EntityQuery,
): Promise<Entity[]> {
  const conditions: SQL[] = [];

  // タイプフィルタ
  if (query.types && query.types.length > 0) {
    conditions.push(inArray(entities.type, query.types));
  }

  // 名前パターン検索
  if (query.namePattern) {
    conditions.push(like(entities.normalizedName, query.namePattern));
  }

  // 最小mentionCount
  if (query.minMentionCount !== undefined) {
    conditions.push(gte(entities.mentionCount, query.minMentionCount));
  }

  let queryBuilder = db.select().from(entities);

  if (conditions.length > 0) {
    queryBuilder = queryBuilder.where(and(...conditions));
  }

  // ページネーション
  if (query.limit !== undefined) {
    queryBuilder = queryBuilder.limit(query.limit);
  }
  if (query.offset !== undefined) {
    queryBuilder = queryBuilder.offset(query.offset);
  }

  return queryBuilder;
}
```

### 2.5 ベクトル類似検索

```typescript
/**
 * DiskANNを使用した類似エンティティ検索
 *
 * @description
 * libSQLのvector_distance_cos()を使用してコサイン距離を計算。
 * 距離を類似度に変換: similarity = 1 - distance / 2
 */
async function findSimilarEntitiesQuery(
  db: DrizzleDatabase,
  embedding: number[],
  limit: number,
  threshold: number = 0.5,
): Promise<{ entity: Entity; similarity: number }[]> {
  // Float32Arrayに変換してBLOB化
  const embeddingBuffer = Buffer.from(new Float32Array(embedding).buffer);

  // 距離を類似度に変換する閾値計算
  // similarity = 1 - distance / 2
  // distance = 2 * (1 - similarity)
  const maxDistance = 2 * (1 - threshold);

  const results = await db.all(sql`
    SELECT
      e.*,
      (1 - vector_distance_cos(e.embedding, ${embeddingBuffer}) / 2) as similarity
    FROM entities e
    WHERE e.embedding IS NOT NULL
      AND vector_distance_cos(e.embedding, ${embeddingBuffer}) <= ${maxDistance}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `);

  return results.map((row: Record<string, unknown>) => ({
    entity: mapRowToEntity(row),
    similarity: row.similarity as number,
  }));
}
```

---

## 3. 関係操作クエリ

### 3.1 同一関係検索

```typescript
/**
 * source/target/typeが同一の既存関係を検索
 */
async function findExistingRelation(
  db: DrizzleDatabase,
  sourceId: string,
  targetId: string,
  type: RelationType,
): Promise<Relation | undefined> {
  const results = await db
    .select()
    .from(graphRelations)
    .where(
      and(
        eq(graphRelations.sourceId, sourceId),
        eq(graphRelations.targetId, targetId),
        eq(graphRelations.type, type),
      ),
    )
    .limit(1);

  return results[0];
}
```

### 3.2 関係挿入

```typescript
/**
 * 新規関係挿入
 */
async function insertRelation(
  db: DrizzleDatabase,
  relation: NewRelation,
): Promise<Relation> {
  const results = await db.insert(graphRelations).values(relation).returning();

  return results[0];
}
```

### 3.3 関係更新（マージ）

```typescript
/**
 * 既存関係の更新（重み累積）
 */
async function updateRelationForMerge(
  db: DrizzleDatabase,
  id: string,
  currentWeight: number,
  additionalWeight: number,
): Promise<Relation> {
  const results = await db
    .update(graphRelations)
    .set({
      weight: currentWeight + additionalWeight,
      evidenceCount: sql`${graphRelations.evidenceCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(graphRelations.id, id))
    .returning();

  return results[0];
}
```

### 3.4 エンティティの関係取得

```typescript
/**
 * 指定エンティティに関連する関係を取得
 */
async function getRelationsByEntityId(
  db: DrizzleDatabase,
  entityId: string,
  options: RelationQueryOptions = {},
): Promise<Relation[]> {
  const direction = options.direction ?? "both";
  const conditions: SQL[] = [];

  if (direction === "out" || direction === "both") {
    conditions.push(eq(graphRelations.sourceId, entityId));
  }
  if (direction === "in" || direction === "both") {
    conditions.push(eq(graphRelations.targetId, entityId));
  }

  let whereClause: SQL;
  if (conditions.length === 2) {
    whereClause = or(...conditions)!;
  } else {
    whereClause = conditions[0];
  }

  // タイプフィルタ
  if (options.types && options.types.length > 0) {
    whereClause = and(
      whereClause,
      inArray(graphRelations.type, options.types),
    )!;
  }

  return db.select().from(graphRelations).where(whereClause);
}
```

---

## 4. 証拠操作クエリ

### 4.1 証拠挿入

```typescript
/**
 * 関係の証拠を挿入
 */
async function insertRelationEvidence(
  db: DrizzleDatabase,
  evidence: {
    relationId: string;
    chunkId: string;
    excerpt: string;
    confidence: number;
  },
): Promise<void> {
  await db.insert(relationEvidence).values({
    id: crypto.randomUUID(),
    relationId: evidence.relationId,
    chunkId: evidence.chunkId,
    excerpt: evidence.excerpt,
    confidence: evidence.confidence,
    createdAt: new Date(),
  });
}
```

### 4.2 関係の証拠取得

```typescript
/**
 * 関係に紐づく証拠を取得
 */
async function getEvidenceByRelationId(
  db: DrizzleDatabase,
  relationId: string,
): Promise<RelationEvidenceRow[]> {
  return db
    .select()
    .from(relationEvidence)
    .where(eq(relationEvidence.relationId, relationId))
    .orderBy(desc(relationEvidence.confidence));
}
```

---

## 5. グラフ統計クエリ

### 5.1 エンティティ統計

```typescript
/**
 * エンティティ数とタイプ別分布を取得
 */
async function getEntityStats(
  db: DrizzleDatabase,
): Promise<{ total: number; distribution: Record<string, number> }> {
  // 総数
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(entities);

  // タイプ別分布
  const distributionResult = await db
    .select({
      type: entities.type,
      count: sql<number>`count(*)`,
    })
    .from(entities)
    .groupBy(entities.type);

  const distribution: Record<string, number> = {};
  for (const row of distributionResult) {
    distribution[row.type] = row.count;
  }

  return {
    total: countResult[0]?.count ?? 0,
    distribution,
  };
}
```

### 5.2 関係統計

```typescript
/**
 * 関係数とタイプ別分布を取得
 */
async function getRelationStats(
  db: DrizzleDatabase,
): Promise<{ total: number; distribution: Record<string, number> }> {
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(graphRelations);

  const distributionResult = await db
    .select({
      type: graphRelations.type,
      count: sql<number>`count(*)`,
    })
    .from(graphRelations)
    .groupBy(graphRelations.type);

  const distribution: Record<string, number> = {};
  for (const row of distributionResult) {
    distribution[row.type] = row.count;
  }

  return {
    total: countResult[0]?.count ?? 0,
    distribution,
  };
}
```

### 5.3 グラフ密度計算

```typescript
/**
 * グラフ密度を計算
 *
 * @description
 * 密度 = 実際のエッジ数 / 可能な最大エッジ数
 * 可能な最大エッジ数 = n * (n - 1)（有向グラフ）
 */
async function calculateGraphDensity(db: DrizzleDatabase): Promise<number> {
  const entityCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(entities);

  const relationCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(graphRelations);

  const n = entityCount[0]?.count ?? 0;
  const e = relationCount[0]?.count ?? 0;

  if (n <= 1) return 0;

  const maxEdges = n * (n - 1);
  return e / maxEdges;
}
```

---

## 6. トランザクション処理

### 6.1 バッチUpsert

```typescript
/**
 * トランザクション内でバッチUpsert
 */
async function batchUpsertEntities(
  db: DrizzleDatabase,
  extractedEntities: ExtractedEntity[],
): Promise<StoredEntity[]> {
  return db.transaction(async (tx) => {
    const results: StoredEntity[] = [];

    for (const extracted of extractedEntities) {
      const normalizedName = normalizeEntityName(extracted.name);

      // 既存エンティティ検索
      const existing = await tx
        .select()
        .from(entities)
        .where(
          and(
            eq(entities.normalizedName, normalizedName),
            eq(entities.type, extracted.type),
          ),
        )
        .limit(1);

      let stored: Entity;

      if (existing[0]) {
        // マージ
        const merged = await tx
          .update(entities)
          .set({
            mentionCount: existing[0].mentionCount + 1,
            aliases: mergeAliases(existing[0].aliases, extracted.aliases ?? []),
            embedding: extracted.embedding
              ? Buffer.from(new Float32Array(extracted.embedding).buffer)
              : existing[0].embedding,
            updatedAt: new Date(),
          })
          .where(eq(entities.id, existing[0].id))
          .returning();

        stored = merged[0];
      } else {
        // 新規挿入
        const inserted = await tx
          .insert(entities)
          .values({
            name: extracted.name,
            normalizedName,
            type: extracted.type,
            description: extracted.description ?? null,
            aliases: extracted.aliases ?? [],
            embedding: extracted.embedding
              ? Buffer.from(new Float32Array(extracted.embedding).buffer)
              : null,
            importance: extracted.confidence,
            mentionCount: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        stored = inserted[0];
      }

      results.push(mapEntityToStored(stored));
    }

    return results;
  });
}
```

---

## 7. ユーティリティ関数

### 7.1 エンティティマッピング

```typescript
/**
 * DBエンティティをStoredEntityに変換
 */
function mapEntityToStored(entity: Entity): StoredEntity {
  return {
    id: entity.id as EntityId,
    name: entity.name,
    normalizedName: entity.normalizedName,
    type: entity.type as EntityType,
    description: entity.description,
    aliases: entity.aliases,
    embedding: entity.embedding
      ? Array.from(new Float32Array(entity.embedding))
      : null,
    chunkIds: [], // chunkEntitiesから取得
    mentionCount: entity.mentionCount,
    importance: entity.importance,
    attributes: entity.metadata ?? null,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
```

### 7.2 エイリアスマージ

```typescript
/**
 * エイリアスをマージ（重複除去）
 */
function mergeAliases(existing: string[], newAliases: string[]): string[] {
  const set = new Set([...existing, ...newAliases]);
  return Array.from(set);
}
```

---

## 8. インデックス活用ガイド

| 操作                   | 使用インデックス                 | クエリパターン                                       |
| ---------------------- | -------------------------------- | ---------------------------------------------------- |
| 正規化名検索           | entities_name_type_idx           | `WHERE normalized_name = ? AND type = ?`             |
| タイプフィルタ         | entities_type_idx                | `WHERE type = ?`                                     |
| 重要度ソート           | entities_importance_idx          | `ORDER BY importance DESC`                           |
| ソースからの関係取得   | relations_source_id_idx          | `WHERE source_id = ?`                                |
| ターゲットへの関係取得 | relations_target_id_idx          | `WHERE target_id = ?`                                |
| 関係の一意性チェック   | relations_source_target_type_idx | `WHERE source_id = ? AND target_id = ? AND type = ?` |
| ベクトル検索           | DiskANN Vector Index             | `vector_distance_cos(embedding, ?)`                  |

---

## 9. 変更履歴

| バージョン | 日付       | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 1.0.0      | 2026-01-09 | Claude | 初版作成 |
