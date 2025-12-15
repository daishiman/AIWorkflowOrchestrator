# Knowledge Graph ストア実装 - タスク指示書

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | CONV-08-01                           |
| タスク名     | Knowledge Graph ストア実装           |
| 親タスク     | CONV-08 (Knowledge Graph構築)        |
| 依存タスク   | CONV-04-05 (Knowledge Graphテーブル) |
| 規模         | 中                                   |
| 見積もり工数 | 1日                                  |
| ステータス   | 未実施                               |

---

## 1. 目的

抽出されたエンティティと関係を永続化し、グラフトラバーサル・検索機能を提供するKnowledge Graphストアを実装する。

---

## 2. 成果物

- `packages/shared/src/services/graph/knowledge-graph-store.ts`
- `packages/shared/src/services/graph/types.ts`
- `packages/shared/src/services/graph/__tests__/knowledge-graph-store.test.ts`

---

## 3. 入力

- エンティティ情報（ExtractedEntity）
- 関係情報（ExtractedRelation）
- エンティティ埋め込み

---

## 4. 出力

```typescript
// packages/shared/src/services/graph/types.ts
import { z } from "zod";
import type {
  EntityId,
  RelationId,
  CommunityId,
  ChunkId,
} from "@/types/branded";

export interface StoredEntity {
  id: EntityId;
  name: string;
  normalizedName: string;
  type: EntityType;
  description?: string;
  aliases: string[];
  embedding?: number[];
  chunkIds: ChunkId[];
  mentionCount: number;
  attributes?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredRelation {
  id: RelationId;
  sourceEntityId: EntityId;
  targetEntityId: EntityId;
  relationType: RelationType;
  description?: string;
  weight: number; // 関係の強さ（出現頻度ベース）
  evidence: RelationEvidence[];
  bidirectional: boolean;
  attributes?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelationEvidence {
  chunkId: ChunkId;
  text: string;
  confidence: number;
}

export interface GraphNode {
  entity: StoredEntity;
  inRelations: StoredRelation[];
  outRelations: StoredRelation[];
}

export interface GraphTraversalResult {
  startEntity: StoredEntity;
  paths: GraphPath[];
  visitedEntities: StoredEntity[];
  maxDepthReached: number;
}

export interface GraphPath {
  entities: StoredEntity[];
  relations: StoredRelation[];
  totalWeight: number;
}

export interface GraphStats {
  entityCount: number;
  relationCount: number;
  entityTypeDistribution: Record<EntityType, number>;
  relationTypeDistribution: Record<RelationType, number>;
  averageRelationsPerEntity: number;
  graphDensity: number;
}
```

---

## 5. 実装仕様

### 5.1 Knowledge Graphストアインターフェース

```typescript
// packages/shared/src/services/graph/knowledge-graph-store.ts
import type { Result } from "@/types/result";

export interface IKnowledgeGraphStore {
  // エンティティ操作
  upsertEntity(entity: ExtractedEntity): Promise<Result<StoredEntity, Error>>;
  getEntity(id: EntityId): Promise<Result<StoredEntity | null, Error>>;
  getEntityByName(
    normalizedName: string,
  ): Promise<Result<StoredEntity | null, Error>>;
  findEntities(query: EntityQuery): Promise<Result<StoredEntity[], Error>>;
  findSimilarEntities(
    embedding: number[],
    limit: number,
    threshold?: number,
  ): Promise<Result<StoredEntity[], Error>>;
  deleteEntity(id: EntityId): Promise<Result<void, Error>>;

  // 関係操作
  addRelation(
    relation: ExtractedRelation,
  ): Promise<Result<StoredRelation, Error>>;
  getRelation(id: RelationId): Promise<Result<StoredRelation | null, Error>>;
  getRelations(
    entityId: EntityId,
    options?: { direction?: "in" | "out" | "both"; types?: RelationType[] },
  ): Promise<Result<StoredRelation[], Error>>;
  findRelations(
    sourceHint: string,
    targetHint: string,
    relationHint?: string,
  ): Promise<Result<StoredRelation[], Error>>;
  deleteRelation(id: RelationId): Promise<Result<void, Error>>;

  // グラフトラバーサル
  traverse(
    startEntityId: EntityId,
    options: TraversalOptions,
  ): Promise<Result<GraphTraversalResult, Error>>;
  findShortestPath(
    sourceId: EntityId,
    targetId: EntityId,
    maxDepth?: number,
  ): Promise<Result<GraphPath | null, Error>>;
  getNeighbors(
    entityId: EntityId,
    depth?: number,
  ): Promise<Result<GraphNode[], Error>>;

  // グラフ統計
  getStats(): Promise<Result<GraphStats, Error>>;

  // バッチ操作
  bulkUpsertEntities(
    entities: ExtractedEntity[],
  ): Promise<Result<StoredEntity[], Error>>;
  bulkAddRelations(
    relations: ExtractedRelation[],
  ): Promise<Result<StoredRelation[], Error>>;
}

export interface EntityQuery {
  types?: EntityType[];
  namePattern?: string;
  minMentionCount?: number;
  chunkIds?: ChunkId[];
  limit?: number;
  offset?: number;
}

export interface TraversalOptions {
  maxDepth: number;
  relationTypes?: RelationType[];
  direction?: "in" | "out" | "both";
  maxNodes?: number;
  minRelationWeight?: number;
}
```

### 5.2 SQLiteベースの実装

```typescript
export class SQLiteKnowledgeGraphStore implements IKnowledgeGraphStore {
  constructor(
    private readonly db: DrizzleClient,
    private readonly entityRepository: EntityRepository,
    private readonly relationRepository: RelationRepository,
  ) {}

  async upsertEntity(
    entity: ExtractedEntity,
  ): Promise<Result<StoredEntity, Error>> {
    try {
      // 既存エンティティをチェック
      const existing = await this.entityRepository.findByNormalizedName(
        entity.normalizedName,
      );

      if (existing.success && existing.data) {
        // 更新: メンション追加、エイリアスマージ
        const updated = await this.entityRepository.update(existing.data.id, {
          mentionCount: existing.data.mentionCount + entity.mentions.length,
          aliases: [...new Set([...existing.data.aliases, ...entity.aliases])],
          chunkIds: [
            ...new Set([
              ...existing.data.chunkIds,
              ...entity.mentions.map((m) => m.chunkId),
            ]),
          ],
          // 説明は長い方を採用
          description:
            entity.description &&
            (!existing.data.description ||
              entity.description.length > existing.data.description.length)
              ? entity.description
              : existing.data.description,
          updatedAt: new Date(),
        });
        return updated;
      }

      // 新規作成
      const stored: StoredEntity = {
        id: generateEntityId(),
        name: entity.name,
        normalizedName: entity.normalizedName,
        type: entity.type,
        description: entity.description,
        aliases: entity.aliases,
        chunkIds: entity.mentions.map((m) => m.chunkId as ChunkId),
        mentionCount: entity.mentions.length,
        attributes: entity.attributes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return this.entityRepository.insert(stored);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Failed to upsert entity"),
      );
    }
  }

  async findSimilarEntities(
    embedding: number[],
    limit: number,
    threshold: number = 0.7,
  ): Promise<Result<StoredEntity[], Error>> {
    try {
      // ベクトル類似検索
      const sql = `
        SELECT e.*, vector_distance_cos(e.embedding, ?) as distance
        FROM entities e
        WHERE e.embedding IS NOT NULL
          AND vector_distance_cos(e.embedding, ?) <= ?
        ORDER BY distance
        LIMIT ?
      `;

      const results = await this.db.execute(sql, [
        JSON.stringify(embedding),
        JSON.stringify(embedding),
        1 - threshold, // コサイン距離に変換
        limit,
      ]);

      return ok(results.rows.map(this.mapRowToEntity));
    } catch (error) {
      return err(
        error instanceof Error
          ? error
          : new Error("Failed to find similar entities"),
      );
    }
  }

  async addRelation(
    relation: ExtractedRelation,
  ): Promise<Result<StoredRelation, Error>> {
    try {
      // ソースとターゲットのエンティティIDを取得
      const sourceResult = await this.getEntityByName(relation.sourceEntity);
      const targetResult = await this.getEntityByName(relation.targetEntity);

      if (!sourceResult.success || !sourceResult.data) {
        return err(
          new Error(`Source entity not found: ${relation.sourceEntity}`),
        );
      }
      if (!targetResult.success || !targetResult.data) {
        return err(
          new Error(`Target entity not found: ${relation.targetEntity}`),
        );
      }

      // 既存の同じ関係をチェック
      const existingResult = await this.relationRepository.findByEntities(
        sourceResult.data.id,
        targetResult.data.id,
        relation.relationType,
      );

      if (existingResult.success && existingResult.data) {
        // 更新: エビデンス追加、重み更新
        const updated = await this.relationRepository.update(
          existingResult.data.id,
          {
            weight: existingResult.data.weight + 1,
            evidence: [
              ...existingResult.data.evidence,
              ...relation.evidence.map((e) => ({
                ...e,
                confidence: relation.confidence,
              })),
            ],
            updatedAt: new Date(),
          },
        );
        return updated;
      }

      // 新規作成
      const stored: StoredRelation = {
        id: generateRelationId(),
        sourceEntityId: sourceResult.data.id,
        targetEntityId: targetResult.data.id,
        relationType: relation.relationType,
        description: relation.description,
        weight: 1,
        evidence: relation.evidence.map((e) => ({
          ...e,
          confidence: relation.confidence,
        })),
        bidirectional: relation.bidirectional,
        attributes: relation.attributes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return this.relationRepository.insert(stored);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Failed to add relation"),
      );
    }
  }

  async traverse(
    startEntityId: EntityId,
    options: TraversalOptions,
  ): Promise<Result<GraphTraversalResult, Error>> {
    const visited = new Set<string>();
    const paths: GraphPath[] = [];
    const visitedEntities: StoredEntity[] = [];

    const startEntity = await this.getEntity(startEntityId);
    if (!startEntity.success || !startEntity.data) {
      return err(new Error(`Start entity not found: ${startEntityId}`));
    }

    // BFSでトラバーサル
    const queue: { entity: StoredEntity; path: GraphPath; depth: number }[] = [
      {
        entity: startEntity.data,
        path: { entities: [startEntity.data], relations: [], totalWeight: 0 },
        depth: 0,
      },
    ];

    let maxDepthReached = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.depth > options.maxDepth) continue;
      if (visited.has(current.entity.id)) continue;
      if (options.maxNodes && visited.size >= options.maxNodes) break;

      visited.add(current.entity.id);
      visitedEntities.push(current.entity);
      maxDepthReached = Math.max(maxDepthReached, current.depth);

      if (current.depth > 0) {
        paths.push(current.path);
      }

      // 隣接エンティティを取得
      const relationsResult = await this.getRelations(current.entity.id, {
        direction: options.direction ?? "both",
        types: options.relationTypes,
      });

      if (!relationsResult.success) continue;

      for (const relation of relationsResult.data) {
        if (
          options.minRelationWeight &&
          relation.weight < options.minRelationWeight
        )
          continue;

        const nextEntityId =
          relation.sourceEntityId === current.entity.id
            ? relation.targetEntityId
            : relation.sourceEntityId;

        if (visited.has(nextEntityId)) continue;

        const nextEntity = await this.getEntity(nextEntityId);
        if (!nextEntity.success || !nextEntity.data) continue;

        queue.push({
          entity: nextEntity.data,
          path: {
            entities: [...current.path.entities, nextEntity.data],
            relations: [...current.path.relations, relation],
            totalWeight: current.path.totalWeight + relation.weight,
          },
          depth: current.depth + 1,
        });
      }
    }

    return ok({
      startEntity: startEntity.data,
      paths,
      visitedEntities,
      maxDepthReached,
    });
  }

  async findShortestPath(
    sourceId: EntityId,
    targetId: EntityId,
    maxDepth: number = 5,
  ): Promise<Result<GraphPath | null, Error>> {
    const visited = new Set<string>();
    const queue: { entityId: EntityId; path: GraphPath }[] = [
      {
        entityId: sourceId,
        path: { entities: [], relations: [], totalWeight: 0 },
      },
    ];

    const sourceEntity = await this.getEntity(sourceId);
    if (!sourceEntity.success || !sourceEntity.data) {
      return err(new Error(`Source entity not found: ${sourceId}`));
    }

    queue[0].path.entities.push(sourceEntity.data);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.path.entities.length > maxDepth + 1) continue;
      if (visited.has(current.entityId)) continue;

      visited.add(current.entityId);

      if (current.entityId === targetId) {
        return ok(current.path);
      }

      const relationsResult = await this.getRelations(current.entityId, {
        direction: "both",
      });

      if (!relationsResult.success) continue;

      for (const relation of relationsResult.data) {
        const nextEntityId =
          relation.sourceEntityId === current.entityId
            ? relation.targetEntityId
            : relation.sourceEntityId;

        if (visited.has(nextEntityId)) continue;

        const nextEntity = await this.getEntity(nextEntityId);
        if (!nextEntity.success || !nextEntity.data) continue;

        queue.push({
          entityId: nextEntityId,
          path: {
            entities: [...current.path.entities, nextEntity.data],
            relations: [...current.path.relations, relation],
            totalWeight: current.path.totalWeight + relation.weight,
          },
        });
      }
    }

    return ok(null);
  }

  async getStats(): Promise<Result<GraphStats, Error>> {
    try {
      const entityCount = await this.entityRepository.count();
      const relationCount = await this.relationRepository.count();
      const entityTypeDist = await this.entityRepository.countByType();
      const relationTypeDist = await this.relationRepository.countByType();

      return ok({
        entityCount: entityCount.data ?? 0,
        relationCount: relationCount.data ?? 0,
        entityTypeDistribution: entityTypeDist.data ?? {},
        relationTypeDistribution: relationTypeDist.data ?? {},
        averageRelationsPerEntity: entityCount.data
          ? (relationCount.data ?? 0) / entityCount.data
          : 0,
        graphDensity: this.calculateDensity(
          entityCount.data ?? 0,
          relationCount.data ?? 0,
        ),
      });
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Failed to get stats"),
      );
    }
  }

  private calculateDensity(nodes: number, edges: number): number {
    if (nodes <= 1) return 0;
    const maxEdges = nodes * (nodes - 1);
    return edges / maxEdges;
  }

  // バッチ操作の実装は省略（上記の単体操作を繰り返し呼び出し）
}
```

---

## 6. テストケース

```typescript
describe("SQLiteKnowledgeGraphStore", () => {
  describe("Entity operations", () => {
    it("エンティティを作成・取得できる", async () => {
      const store = new SQLiteKnowledgeGraphStore(db, entityRepo, relationRepo);
      const result = await store.upsertEntity({
        name: "TypeScript",
        normalizedName: "typescript",
        type: "technology",
        mentions: [{ chunkId: "chunk-1", ... }],
        confidence: 0.9,
        aliases: ["TS"],
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("TypeScript");

      const fetched = await store.getEntity(result.data.id);
      expect(fetched.success).toBe(true);
      expect(fetched.data?.normalizedName).toBe("typescript");
    });

    it("既存エンティティはマージされる", async () => {
      const store = new SQLiteKnowledgeGraphStore(db, entityRepo, relationRepo);

      await store.upsertEntity({
        name: "TypeScript",
        normalizedName: "typescript",
        type: "technology",
        mentions: [{ chunkId: "chunk-1", ... }],
        confidence: 0.9,
        aliases: ["TS"],
      });

      await store.upsertEntity({
        name: "typescript",
        normalizedName: "typescript",
        type: "technology",
        mentions: [{ chunkId: "chunk-2", ... }],
        confidence: 0.8,
        aliases: ["TypeScript language"],
      });

      const entity = await store.getEntityByName("typescript");
      expect(entity.success).toBe(true);
      expect(entity.data?.mentionCount).toBe(2);
      expect(entity.data?.aliases).toContain("TS");
      expect(entity.data?.aliases).toContain("TypeScript language");
    });

    it("類似エンティティを検索できる", async () => {
      const store = new SQLiteKnowledgeGraphStore(db, entityRepo, relationRepo);
      // エンティティ埋め込みを事前に設定
      const result = await store.findSimilarEntities(queryEmbedding, 10, 0.7);
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe("Relation operations", () => {
    it("関係を追加・取得できる", async () => {
      const store = new SQLiteKnowledgeGraphStore(db, entityRepo, relationRepo);
      const result = await store.addRelation({
        sourceEntity: "typescript",
        targetEntity: "microsoft",
        relationType: "created_by",
        evidence: [{ chunkId: "chunk-1", text: "...", ... }],
        confidence: 0.9,
        bidirectional: false,
      });

      expect(result.success).toBe(true);
      expect(result.data.relationType).toBe("created_by");
    });

    it("同じ関係は重みが増加する", async () => {
      const store = new SQLiteKnowledgeGraphStore(db, entityRepo, relationRepo);

      await store.addRelation({
        sourceEntity: "typescript",
        targetEntity: "microsoft",
        relationType: "created_by",
        evidence: [{ chunkId: "chunk-1", ... }],
        confidence: 0.9,
        bidirectional: false,
      });

      const result = await store.addRelation({
        sourceEntity: "typescript",
        targetEntity: "microsoft",
        relationType: "created_by",
        evidence: [{ chunkId: "chunk-2", ... }],
        confidence: 0.8,
        bidirectional: false,
      });

      expect(result.success).toBe(true);
      expect(result.data.weight).toBe(2);
      expect(result.data.evidence.length).toBe(2);
    });
  });

  describe("Traversal", () => {
    it("グラフをトラバースできる", async () => {
      const store = new SQLiteKnowledgeGraphStore(db, entityRepo, relationRepo);
      const result = await store.traverse(startEntityId, {
        maxDepth: 3,
        direction: "both",
      });

      expect(result.success).toBe(true);
      expect(result.data.visitedEntities.length).toBeGreaterThan(0);
    });

    it("最短パスを見つけられる", async () => {
      const store = new SQLiteKnowledgeGraphStore(db, entityRepo, relationRepo);
      const result = await store.findShortestPath(sourceId, targetId);

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.entities[0].id).toBe(sourceId);
        expect(result.data.entities[result.data.entities.length - 1].id).toBe(targetId);
      }
    });
  });
});
```

---

## 7. 完了条件

- [ ] `IKnowledgeGraphStore`インターフェースが定義済み
- [ ] `SQLiteKnowledgeGraphStore`が実装済み
- [ ] エンティティのCRUD操作が動作する
- [ ] エンティティのマージが正しく動作する
- [ ] 類似エンティティ検索が動作する
- [ ] 関係のCRUD操作が動作する
- [ ] 関係の重み更新が動作する
- [ ] グラフトラバーサルが動作する
- [ ] 最短パス検索が動作する
- [ ] グラフ統計が取得できる
- [ ] バッチ操作が動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-08-02: コミュニティ検出 (Leiden)

---

## 9. 参照情報

- CONV-04-05: Knowledge Graphテーブル
- CONV-06-04: エンティティ抽出サービス
- CONV-06-05: 関係抽出サービス
- CONV-08: Knowledge Graph構築（親タスク）
