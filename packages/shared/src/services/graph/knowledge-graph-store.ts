/**
 * @file Knowledge Graph Store 実装
 * @module @repo/shared/services/graph/knowledge-graph-store
 * @description SQLite + Drizzle ORMを使用したKnowledge Graphストアの実装
 */

import { eq, and, like, or, sql, inArray, gte } from "drizzle-orm";
import type { Result } from "../../types/rag/result";
import { ok, err } from "../../types/rag/result";
import type { EntityId, RelationId, ChunkId } from "../../types/rag/branded";
import {
  createEntityId,
  createRelationId,
  createChunkId,
  generateEntityId,
  generateRelationId,
} from "../../types/rag/branded";
import type { EntityType, RelationType } from "../../types/rag/graph/types";
import type { Database } from "../../db/repositories/base.repository";
import {
  entities,
  type Entity,
  type NewEntity,
} from "../../db/schema/graph/entities";
import {
  graphRelations,
  type Relation,
  type NewRelation,
} from "../../db/schema/graph/relations";
import { relationEvidence } from "../../db/schema/graph/relation-evidence";
import { chunkEntities } from "../../db/schema/graph/chunk-entities";

import type {
  StoredEntity,
  StoredRelation,
  ExtractedEntity,
  ExtractedRelation,
  EntityQuery,
  TraversalOptions,
  GraphTraversalResult,
  GraphPath,
  GraphNode,
  GraphStats,
  RelationQueryOptions,
  RelationEvidence as RelationEvidenceType,
} from "./types";
import { normalizeEntityName } from "./types";
import {
  KnowledgeGraphError,
  EntityNotFoundError,
  SelfLoopError,
  EvidenceRequiredError,
  DatabaseQueryError,
} from "./errors";

// =============================================================================
// Interface
// =============================================================================

/**
 * Knowledge Graphストアインターフェース
 *
 * @description
 * エンティティと関係の永続化・検索・トラバーサル機能を提供する。
 * 全メソッドはResult型を返却し、エラーハンドリングを統一。
 */
export interface IKnowledgeGraphStore {
  // Entity Operations
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

  // Relation Operations
  addRelation(
    relation: ExtractedRelation,
  ): Promise<Result<StoredRelation, Error>>;
  getRelation(id: RelationId): Promise<Result<StoredRelation | null, Error>>;
  getRelations(
    entityId: EntityId,
    options?: RelationQueryOptions,
  ): Promise<Result<StoredRelation[], Error>>;
  findRelations(
    sourceHint: string,
    targetHint: string,
    relationHint?: string,
  ): Promise<Result<StoredRelation[], Error>>;
  deleteRelation(id: RelationId): Promise<Result<void, Error>>;

  // Graph Traversal
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

  // Statistics
  getStats(): Promise<Result<GraphStats, Error>>;

  // Batch Operations
  bulkUpsertEntities(
    entities: ExtractedEntity[],
  ): Promise<Result<StoredEntity[], Error>>;
  bulkAddRelations(
    relations: ExtractedRelation[],
  ): Promise<Result<StoredRelation[], Error>>;
}

// =============================================================================
// Implementation
// =============================================================================

/**
 * SQLite実装のKnowledge Graphストア
 */
export class SQLiteKnowledgeGraphStore implements IKnowledgeGraphStore {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // ===========================================================================
  // Entity Operations
  // ===========================================================================

  async upsertEntity(
    entity: ExtractedEntity,
  ): Promise<Result<StoredEntity, Error>> {
    try {
      const normalizedName = normalizeEntityName(entity.name);

      // Check for existing entity
      const existing = await this.db
        .select()
        .from(entities)
        .where(
          and(
            eq(entities.normalizedName, normalizedName),
            eq(entities.type, entity.type),
          ),
        )
        .limit(1);

      const now = new Date();

      if (existing.length > 0) {
        // Merge with existing entity
        const existingEntity = existing[0];

        // Merge aliases without duplicates
        const existingAliases = existingEntity.aliases || [];
        const newAliases = entity.aliases || [];
        const mergedAliases = [...new Set([...existingAliases, ...newAliases])];

        // Update existing entity
        const updated = await this.db
          .update(entities)
          .set({
            name: entity.name,
            description: entity.description ?? existingEntity.description,
            aliases: mergedAliases,
            embedding: entity.embedding
              ? this.serializeEmbedding(entity.embedding)
              : existingEntity.embedding,
            importance: entity.confidence,
            mentionCount: existingEntity.mentionCount + 1,
            updatedAt: now,
          })
          .where(eq(entities.id, existingEntity.id))
          .returning();

        // Add chunk relation if chunkId provided
        if (entity.chunkId) {
          await this.addChunkEntityRelation(
            existingEntity.id as EntityId,
            entity.chunkId,
          );
        }

        // Get chunk IDs
        const chunkIds = await this.getEntityChunkIds(
          existingEntity.id as EntityId,
        );

        return ok(this.mapToStoredEntity(updated[0], chunkIds));
      } else {
        // Create new entity
        const newEntityId = generateEntityId();
        const newEntity: NewEntity = {
          id: newEntityId,
          name: entity.name,
          normalizedName,
          type: entity.type,
          description: entity.description ?? null,
          aliases: entity.aliases ? [...entity.aliases] : [],
          embedding: entity.embedding
            ? this.serializeEmbedding(entity.embedding)
            : null,
          importance: entity.confidence,
          mentionCount: 1,
          metadata: null,
          createdAt: now,
          updatedAt: now,
        };

        const inserted = await this.db
          .insert(entities)
          .values(newEntity)
          .returning();

        // Add chunk relation if chunkId provided
        if (entity.chunkId) {
          await this.addChunkEntityRelation(newEntityId, entity.chunkId);
        }

        const chunkIds = entity.chunkId ? [entity.chunkId] : [];
        return ok(this.mapToStoredEntity(inserted[0], chunkIds));
      }
    } catch (error) {
      return err(
        new DatabaseQueryError(
          `Failed to upsert entity: ${entity.name}`,
          error as Error,
        ),
      );
    }
  }

  async getEntity(id: EntityId): Promise<Result<StoredEntity | null, Error>> {
    try {
      const result = await this.db
        .select()
        .from(entities)
        .where(eq(entities.id, id))
        .limit(1);

      if (result.length === 0) {
        return ok(null);
      }

      const chunkIds = await this.getEntityChunkIds(id);
      return ok(this.mapToStoredEntity(result[0], chunkIds));
    } catch (error) {
      return err(
        new DatabaseQueryError(`Failed to get entity: ${id}`, error as Error),
      );
    }
  }

  async getEntityByName(
    normalizedName: string,
  ): Promise<Result<StoredEntity | null, Error>> {
    try {
      const result = await this.db
        .select()
        .from(entities)
        .where(eq(entities.normalizedName, normalizedName))
        .limit(1);

      if (result.length === 0) {
        return ok(null);
      }

      const chunkIds = await this.getEntityChunkIds(result[0].id as EntityId);
      return ok(this.mapToStoredEntity(result[0], chunkIds));
    } catch (error) {
      return err(
        new DatabaseQueryError(
          `Failed to get entity by name: ${normalizedName}`,
          error as Error,
        ),
      );
    }
  }

  async findEntities(
    query: EntityQuery,
  ): Promise<Result<StoredEntity[], Error>> {
    try {
      let dbQuery = this.db.select().from(entities);
      const conditions: ReturnType<typeof eq>[] = [];

      // Type filter
      if (query.types && query.types.length > 0) {
        conditions.push(inArray(entities.type, [...query.types]));
      }

      // Name pattern filter
      if (query.namePattern) {
        conditions.push(like(entities.normalizedName, query.namePattern));
      }

      // Min mention count filter
      if (query.minMentionCount !== undefined) {
        conditions.push(gte(entities.mentionCount, query.minMentionCount));
      }

      // Apply conditions
      if (conditions.length > 0) {
        dbQuery = dbQuery.where(and(...conditions)) as typeof dbQuery;
      }

      // Apply limit and offset
      let results: Entity[];
      if (query.limit !== undefined) {
        if (query.offset !== undefined) {
          results = await dbQuery.limit(query.limit).offset(query.offset);
        } else {
          results = await dbQuery.limit(query.limit);
        }
      } else {
        results = await dbQuery;
      }

      // Map to StoredEntity with chunkIds
      const storedEntities: StoredEntity[] = [];
      for (const entity of results) {
        const chunkIds = await this.getEntityChunkIds(entity.id as EntityId);
        storedEntities.push(this.mapToStoredEntity(entity, chunkIds));
      }

      return ok(storedEntities);
    } catch (error) {
      return err(
        new DatabaseQueryError(`Failed to find entities`, error as Error),
      );
    }
  }

  async findSimilarEntities(
    _embedding: number[],
    _limit: number,
    _threshold: number = 0.5,
  ): Promise<Result<StoredEntity[], Error>> {
    try {
      // For now, return empty array since vector search requires DiskANN
      // This will be implemented when vector search is available
      // TODO: Implement vector similarity search with DiskANN
      // Parameters _embedding, _limit, _threshold will be used when DiskANN is integrated
      return ok([]);
    } catch (error) {
      return err(
        new DatabaseQueryError(
          `Failed to find similar entities`,
          error as Error,
        ),
      );
    }
  }

  async deleteEntity(id: EntityId): Promise<Result<void, Error>> {
    try {
      // CASCADE delete will handle relations
      await this.db.delete(entities).where(eq(entities.id, id));
      return ok(undefined);
    } catch (error) {
      return err(
        new DatabaseQueryError(
          `Failed to delete entity: ${id}`,
          error as Error,
        ),
      );
    }
  }

  // ===========================================================================
  // Relation Operations
  // ===========================================================================

  async addRelation(
    relation: ExtractedRelation,
  ): Promise<Result<StoredRelation, Error>> {
    try {
      // Validate evidence
      if (!relation.evidence) {
        return err(new EvidenceRequiredError());
      }

      // Find source entity
      const sourceNormalized = normalizeEntityName(relation.sourceName);
      const sourceEntity = await this.db
        .select()
        .from(entities)
        .where(eq(entities.normalizedName, sourceNormalized))
        .limit(1);

      if (sourceEntity.length === 0) {
        return err(
          new EntityNotFoundError(
            `Source entity not found: ${relation.sourceName}`,
          ),
        );
      }

      // Find target entity
      const targetNormalized = normalizeEntityName(relation.targetName);
      const targetEntity = await this.db
        .select()
        .from(entities)
        .where(eq(entities.normalizedName, targetNormalized))
        .limit(1);

      if (targetEntity.length === 0) {
        return err(
          new EntityNotFoundError(
            `Target entity not found: ${relation.targetName}`,
          ),
        );
      }

      const sourceId = sourceEntity[0].id;
      const targetId = targetEntity[0].id;

      // Check for self-loop
      if (sourceId === targetId) {
        return err(new SelfLoopError());
      }

      const now = new Date();

      // Check for existing relation
      const existing = await this.db
        .select()
        .from(graphRelations)
        .where(
          and(
            eq(graphRelations.sourceId, sourceId),
            eq(graphRelations.targetId, targetId),
            eq(graphRelations.type, relation.type),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        // Merge with existing relation
        const existingRelation = existing[0];

        // Update weight and evidence count
        const updated = await this.db
          .update(graphRelations)
          .set({
            weight: existingRelation.weight + relation.confidence,
            evidenceCount: existingRelation.evidenceCount + 1,
            updatedAt: now,
          })
          .where(eq(graphRelations.id, existingRelation.id))
          .returning();

        // Add new evidence
        await this.db.insert(relationEvidence).values({
          relationId: existingRelation.id,
          chunkId: relation.evidence.chunkId,
          excerpt: relation.evidence.text,
          confidence: relation.evidence.confidence,
          createdAt: now,
          updatedAt: now,
        });

        // Get all evidence
        const allEvidence = await this.getRelationEvidence(
          existingRelation.id as RelationId,
        );

        return ok(
          this.mapToStoredRelation(
            updated[0],
            sourceId as EntityId,
            targetId as EntityId,
            allEvidence,
          ),
        );
      } else {
        // Create new relation
        const newRelationId = generateRelationId();
        const newRelation: NewRelation = {
          id: newRelationId,
          sourceId,
          targetId,
          type: relation.type,
          description: relation.description ?? null,
          weight: relation.confidence,
          bidirectional: relation.bidirectional ? 1 : 0,
          evidenceCount: 1,
          metadata: null,
          createdAt: now,
          updatedAt: now,
        };

        const inserted = await this.db
          .insert(graphRelations)
          .values(newRelation)
          .returning();

        // Add evidence
        await this.db.insert(relationEvidence).values({
          relationId: newRelationId,
          chunkId: relation.evidence.chunkId,
          excerpt: relation.evidence.text,
          confidence: relation.evidence.confidence,
          createdAt: now,
          updatedAt: now,
        });

        return ok(
          this.mapToStoredRelation(
            inserted[0],
            sourceId as EntityId,
            targetId as EntityId,
            [relation.evidence],
          ),
        );
      }
    } catch (error) {
      if (error instanceof KnowledgeGraphError) {
        return err(error);
      }
      return err(
        new DatabaseQueryError(`Failed to add relation`, error as Error),
      );
    }
  }

  async getRelation(
    id: RelationId,
  ): Promise<Result<StoredRelation | null, Error>> {
    try {
      const result = await this.db
        .select()
        .from(graphRelations)
        .where(eq(graphRelations.id, id))
        .limit(1);

      if (result.length === 0) {
        return ok(null);
      }

      const evidence = await this.getRelationEvidence(id);
      return ok(
        this.mapToStoredRelation(
          result[0],
          result[0].sourceId as EntityId,
          result[0].targetId as EntityId,
          evidence,
        ),
      );
    } catch (error) {
      return err(
        new DatabaseQueryError(`Failed to get relation: ${id}`, error as Error),
      );
    }
  }

  async getRelations(
    entityId: EntityId,
    options?: RelationQueryOptions,
  ): Promise<Result<StoredRelation[], Error>> {
    try {
      const direction = options?.direction ?? "both";
      const types = options?.types;

      const conditions: ReturnType<typeof eq>[] = [];

      if (direction === "out") {
        conditions.push(eq(graphRelations.sourceId, entityId));
      } else if (direction === "in") {
        conditions.push(eq(graphRelations.targetId, entityId));
      } else {
        // both
        conditions.push(
          or(
            eq(graphRelations.sourceId, entityId),
            eq(graphRelations.targetId, entityId),
          )!,
        );
      }

      if (types && types.length > 0) {
        conditions.push(inArray(graphRelations.type, [...types]));
      }

      const results = await this.db
        .select()
        .from(graphRelations)
        .where(and(...conditions));

      const storedRelations: StoredRelation[] = [];
      for (const relation of results) {
        const evidence = await this.getRelationEvidence(
          relation.id as RelationId,
        );
        storedRelations.push(
          this.mapToStoredRelation(
            relation,
            relation.sourceId as EntityId,
            relation.targetId as EntityId,
            evidence,
          ),
        );
      }

      return ok(storedRelations);
    } catch (error) {
      return err(
        new DatabaseQueryError(`Failed to get relations`, error as Error),
      );
    }
  }

  async findRelations(
    sourceHint: string,
    targetHint: string,
    relationHint?: string,
  ): Promise<Result<StoredRelation[], Error>> {
    try {
      // Find source entities matching hint
      const sourceNormalized = normalizeEntityName(sourceHint);
      const sourceEntities = await this.db
        .select()
        .from(entities)
        .where(like(entities.normalizedName, `%${sourceNormalized}%`));

      if (sourceEntities.length === 0) {
        return ok([]);
      }

      // Find target entities matching hint
      const targetNormalized = normalizeEntityName(targetHint);
      const targetEntities = await this.db
        .select()
        .from(entities)
        .where(like(entities.normalizedName, `%${targetNormalized}%`));

      if (targetEntities.length === 0) {
        return ok([]);
      }

      const sourceIds = sourceEntities.map((e) => e.id);
      const targetIds = targetEntities.map((e) => e.id);

      const conditions: ReturnType<typeof eq>[] = [
        inArray(graphRelations.sourceId, sourceIds),
        inArray(graphRelations.targetId, targetIds),
      ];

      if (relationHint) {
        conditions.push(like(graphRelations.type, `%${relationHint}%`));
      }

      const results = await this.db
        .select()
        .from(graphRelations)
        .where(and(...conditions));

      const storedRelations: StoredRelation[] = [];
      for (const relation of results) {
        const evidence = await this.getRelationEvidence(
          relation.id as RelationId,
        );
        storedRelations.push(
          this.mapToStoredRelation(
            relation,
            relation.sourceId as EntityId,
            relation.targetId as EntityId,
            evidence,
          ),
        );
      }

      return ok(storedRelations);
    } catch (error) {
      return err(
        new DatabaseQueryError(`Failed to find relations`, error as Error),
      );
    }
  }

  async deleteRelation(id: RelationId): Promise<Result<void, Error>> {
    try {
      // CASCADE delete will handle evidence
      await this.db.delete(graphRelations).where(eq(graphRelations.id, id));
      return ok(undefined);
    } catch (error) {
      return err(
        new DatabaseQueryError(
          `Failed to delete relation: ${id}`,
          error as Error,
        ),
      );
    }
  }

  // ===========================================================================
  // Graph Traversal
  // ===========================================================================

  async traverse(
    startEntityId: EntityId,
    options: TraversalOptions,
  ): Promise<Result<GraphTraversalResult, Error>> {
    try {
      // Get start entity
      const startResult = await this.getEntity(startEntityId);
      if (!startResult.success || !startResult.data) {
        return err(new EntityNotFoundError(startEntityId));
      }
      const startEntity = startResult.data;

      const visited = new Map<string, StoredEntity>();
      const paths: GraphPath[] = [];
      const queue: Array<{
        entity: StoredEntity;
        depth: number;
        path: StoredEntity[];
        relations: StoredRelation[];
      }> = [
        { entity: startEntity, depth: 0, path: [startEntity], relations: [] },
      ];

      visited.set(startEntityId, startEntity);
      let maxDepthReached = 0;

      while (queue.length > 0) {
        const current = queue.shift()!;

        if (current.depth > maxDepthReached) {
          maxDepthReached = current.depth;
        }

        // Check max depth
        if (current.depth >= options.maxDepth) {
          // Record path
          if (current.path.length > 1) {
            paths.push({
              entities: current.path,
              relations: current.relations,
              totalWeight: current.relations.reduce(
                (sum, r) => sum + r.weight,
                0,
              ),
            });
          }
          continue;
        }

        // Check max nodes
        if (options.maxNodes && visited.size >= options.maxNodes) {
          break;
        }

        // Get relations based on direction
        const relationsResult = await this.getRelations(current.entity.id, {
          direction: options.direction ?? "both",
          types: options.relationTypes,
        });

        if (!relationsResult.success) {
          continue;
        }

        for (const relation of relationsResult.data) {
          // Filter by min weight
          if (
            options.minRelationWeight &&
            relation.weight < options.minRelationWeight
          ) {
            continue;
          }

          // Determine next entity
          const nextEntityId =
            relation.sourceEntityId === current.entity.id
              ? relation.targetEntityId
              : relation.sourceEntityId;

          // Skip if already visited
          if (visited.has(nextEntityId)) {
            continue;
          }

          // Get next entity
          const nextEntityResult = await this.getEntity(nextEntityId);
          if (!nextEntityResult.success || !nextEntityResult.data) {
            continue;
          }

          const nextEntity = nextEntityResult.data;
          visited.set(nextEntityId, nextEntity);

          queue.push({
            entity: nextEntity,
            depth: current.depth + 1,
            path: [...current.path, nextEntity],
            relations: [...current.relations, relation],
          });
        }
      }

      return ok({
        startEntity,
        paths,
        visitedEntities: Array.from(visited.values()),
        maxDepthReached,
      });
    } catch (error) {
      return err(
        new DatabaseQueryError(`Failed to traverse graph`, error as Error),
      );
    }
  }

  async findShortestPath(
    sourceId: EntityId,
    targetId: EntityId,
    maxDepth: number = 6,
  ): Promise<Result<GraphPath | null, Error>> {
    try {
      // Same entity
      if (sourceId === targetId) {
        const entityResult = await this.getEntity(sourceId);
        if (!entityResult.success || !entityResult.data) {
          return err(new EntityNotFoundError(sourceId));
        }
        return ok({
          entities: [entityResult.data],
          relations: [],
          totalWeight: 0,
        });
      }

      // BFS for shortest path
      const visited = new Set<string>();
      const queue: Array<{
        entityId: EntityId;
        path: StoredEntity[];
        relations: StoredRelation[];
        depth: number;
      }> = [];

      // Get source entity
      const sourceResult = await this.getEntity(sourceId);
      if (!sourceResult.success || !sourceResult.data) {
        return err(new EntityNotFoundError(sourceId));
      }

      queue.push({
        entityId: sourceId,
        path: [sourceResult.data],
        relations: [],
        depth: 0,
      });
      visited.add(sourceId);

      while (queue.length > 0) {
        const current = queue.shift()!;

        if (current.depth >= maxDepth) {
          continue;
        }

        // Get relations
        const relationsResult = await this.getRelations(current.entityId, {
          direction: "both",
        });

        if (!relationsResult.success) {
          continue;
        }

        for (const relation of relationsResult.data) {
          const nextEntityId =
            relation.sourceEntityId === current.entityId
              ? relation.targetEntityId
              : relation.sourceEntityId;

          // Found target
          if (nextEntityId === targetId) {
            const targetResult = await this.getEntity(targetId);
            if (targetResult.success && targetResult.data) {
              return ok({
                entities: [...current.path, targetResult.data],
                relations: [...current.relations, relation],
                totalWeight:
                  current.relations.reduce((sum, r) => sum + r.weight, 0) +
                  relation.weight,
              });
            }
          }

          // Skip visited
          if (visited.has(nextEntityId)) {
            continue;
          }
          visited.add(nextEntityId);

          // Get next entity
          const nextEntityResult = await this.getEntity(nextEntityId);
          if (!nextEntityResult.success || !nextEntityResult.data) {
            continue;
          }

          queue.push({
            entityId: nextEntityId,
            path: [...current.path, nextEntityResult.data],
            relations: [...current.relations, relation],
            depth: current.depth + 1,
          });
        }
      }

      // No path found
      return ok(null);
    } catch (error) {
      return err(
        new DatabaseQueryError(`Failed to find shortest path`, error as Error),
      );
    }
  }

  async getNeighbors(
    entityId: EntityId,
    depth: number = 1,
  ): Promise<Result<GraphNode[], Error>> {
    try {
      // Get entity to verify it exists
      const entityResult = await this.getEntity(entityId);
      if (!entityResult.success || !entityResult.data) {
        return err(new EntityNotFoundError(entityId));
      }

      const visited = new Set<string>();
      const result: GraphNode[] = [];
      const queue: Array<{ entityId: EntityId; currentDepth: number }> = [
        { entityId, currentDepth: 0 },
      ];

      visited.add(entityId);

      while (queue.length > 0) {
        const current = queue.shift()!;

        if (current.currentDepth >= depth) {
          continue;
        }

        // Get all relations for current entity
        const relationsResult = await this.getRelations(current.entityId, {
          direction: "both",
        });

        if (!relationsResult.success) {
          continue;
        }

        for (const relation of relationsResult.data) {
          const neighborId =
            relation.sourceEntityId === current.entityId
              ? relation.targetEntityId
              : relation.sourceEntityId;

          if (visited.has(neighborId)) {
            continue;
          }
          visited.add(neighborId);

          // Get neighbor entity
          const neighborResult = await this.getEntity(neighborId);
          if (!neighborResult.success || !neighborResult.data) {
            continue;
          }

          // Get neighbor's relations
          const neighborRelationsResult = await this.getRelations(neighborId, {
            direction: "both",
          });

          const inRelations: StoredRelation[] = [];
          const outRelations: StoredRelation[] = [];

          if (neighborRelationsResult.success) {
            for (const r of neighborRelationsResult.data) {
              if (r.targetEntityId === neighborId) {
                inRelations.push(r);
              }
              if (r.sourceEntityId === neighborId) {
                outRelations.push(r);
              }
            }
          }

          result.push({
            entity: neighborResult.data,
            inRelations,
            outRelations,
          });

          // Add to queue for further exploration
          if (current.currentDepth + 1 < depth) {
            queue.push({
              entityId: neighborId,
              currentDepth: current.currentDepth + 1,
            });
          }
        }
      }

      return ok(result);
    } catch (error) {
      return err(
        new DatabaseQueryError(`Failed to get neighbors`, error as Error),
      );
    }
  }

  // ===========================================================================
  // Statistics
  // ===========================================================================

  async getStats(): Promise<Result<GraphStats, Error>> {
    try {
      // Entity count
      const entityCountResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(entities);
      const entityCount = entityCountResult[0]?.count ?? 0;

      // Relation count
      const relationCountResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(graphRelations);
      const relationCount = relationCountResult[0]?.count ?? 0;

      // Entity type distribution
      const entityTypeResults = await this.db
        .select({
          type: entities.type,
          count: sql<number>`count(*)`,
        })
        .from(entities)
        .groupBy(entities.type);

      const entityTypeDistribution: Record<string, number> = {};
      for (const row of entityTypeResults) {
        entityTypeDistribution[row.type] = row.count;
      }

      // Relation type distribution
      const relationTypeResults = await this.db
        .select({
          type: graphRelations.type,
          count: sql<number>`count(*)`,
        })
        .from(graphRelations)
        .groupBy(graphRelations.type);

      const relationTypeDistribution: Record<string, number> = {};
      for (const row of relationTypeResults) {
        relationTypeDistribution[row.type] = row.count;
      }

      // Average relations per entity
      const averageRelationsPerEntity =
        entityCount > 0 ? (relationCount * 2) / entityCount : 0;

      // Graph density
      const maxPossibleRelations = entityCount * (entityCount - 1);
      const graphDensity =
        maxPossibleRelations > 0 ? relationCount / maxPossibleRelations : 0;

      return ok({
        entityCount,
        relationCount,
        entityTypeDistribution,
        relationTypeDistribution,
        averageRelationsPerEntity,
        graphDensity,
      });
    } catch (error) {
      return err(new DatabaseQueryError(`Failed to get stats`, error as Error));
    }
  }

  // ===========================================================================
  // Batch Operations
  // ===========================================================================

  async bulkUpsertEntities(
    entitiesToUpsert: ExtractedEntity[],
  ): Promise<Result<StoredEntity[], Error>> {
    try {
      if (entitiesToUpsert.length === 0) {
        return ok([]);
      }

      const results: StoredEntity[] = [];

      // Process each entity sequentially within a transaction
      // Note: For better performance, this could be optimized with batch operations
      for (const entity of entitiesToUpsert) {
        const result = await this.upsertEntity(entity);
        if (!result.success) {
          // Rollback would happen here in a real transaction
          return err(result.error);
        }
        results.push(result.data);
      }

      return ok(results);
    } catch (error) {
      return err(
        new DatabaseQueryError(
          `Failed to bulk upsert entities`,
          error as Error,
        ),
      );
    }
  }

  async bulkAddRelations(
    relationsToAdd: ExtractedRelation[],
  ): Promise<Result<StoredRelation[], Error>> {
    try {
      if (relationsToAdd.length === 0) {
        return ok([]);
      }

      const results: StoredRelation[] = [];

      // Process each relation sequentially
      for (const relation of relationsToAdd) {
        const result = await this.addRelation(relation);
        if (!result.success) {
          return err(result.error);
        }
        results.push(result.data);
      }

      return ok(results);
    } catch (error) {
      return err(
        new DatabaseQueryError(`Failed to bulk add relations`, error as Error),
      );
    }
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  private async getEntityChunkIds(entityId: EntityId): Promise<ChunkId[]> {
    try {
      const results = await this.db
        .select({ chunkId: chunkEntities.chunkId })
        .from(chunkEntities)
        .where(eq(chunkEntities.entityId, entityId));

      return results.map((r) => createChunkId(r.chunkId));
    } catch {
      return [];
    }
  }

  private async addChunkEntityRelation(
    entityId: EntityId,
    chunkId: ChunkId,
  ): Promise<void> {
    try {
      // Check if relation already exists
      const existing = await this.db
        .select()
        .from(chunkEntities)
        .where(
          and(
            eq(chunkEntities.entityId, entityId),
            eq(chunkEntities.chunkId, chunkId),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        // Update mention count
        await this.db
          .update(chunkEntities)
          .set({
            mentionCount: existing[0].mentionCount + 1,
          })
          .where(
            and(
              eq(chunkEntities.entityId, entityId),
              eq(chunkEntities.chunkId, chunkId),
            ),
          );
      } else {
        // Insert new relation
        await this.db.insert(chunkEntities).values({
          entityId,
          chunkId,
          mentionCount: 1,
          positions: [],
        });
      }
    } catch {
      // Silently fail - chunk relation is not critical
    }
  }

  private async getRelationEvidence(
    relationId: RelationId,
  ): Promise<RelationEvidenceType[]> {
    try {
      const results = await this.db
        .select()
        .from(relationEvidence)
        .where(eq(relationEvidence.relationId, relationId));

      return results.map((r) => ({
        chunkId: createChunkId(r.chunkId),
        text: r.excerpt,
        confidence: r.confidence,
      }));
    } catch {
      return [];
    }
  }

  private mapToStoredEntity(entity: Entity, chunkIds: ChunkId[]): StoredEntity {
    return {
      id: createEntityId(entity.id),
      name: entity.name,
      normalizedName: entity.normalizedName,
      type: entity.type as EntityType,
      description: entity.description,
      aliases: entity.aliases || [],
      embedding: entity.embedding
        ? this.deserializeEmbedding(entity.embedding)
        : null,
      chunkIds,
      mentionCount: entity.mentionCount,
      importance: entity.importance,
      attributes: entity.metadata as Record<string, unknown> | null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private mapToStoredRelation(
    relation: Relation,
    sourceEntityId: EntityId,
    targetEntityId: EntityId,
    evidence: RelationEvidenceType[],
  ): StoredRelation {
    return {
      id: createRelationId(relation.id),
      sourceEntityId,
      targetEntityId,
      relationType: relation.type as RelationType,
      description: relation.description,
      weight: relation.weight,
      evidence,
      bidirectional: relation.bidirectional === 1,
      attributes: relation.metadata as Record<string, unknown> | null,
      createdAt: relation.createdAt,
      updatedAt: relation.updatedAt,
    };
  }

  private serializeEmbedding(embedding: readonly number[]): Buffer {
    const float32Array = new Float32Array(embedding);
    return Buffer.from(float32Array.buffer);
  }

  private deserializeEmbedding(buffer: Buffer | unknown): number[] {
    if (buffer instanceof Buffer) {
      const float32Array = new Float32Array(
        buffer.buffer,
        buffer.byteOffset,
        buffer.length / 4,
      );
      return Array.from(float32Array);
    }
    return [];
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * ストアのファクトリー関数
 */
export function createKnowledgeGraphStore(db: Database): IKnowledgeGraphStore {
  return new SQLiteKnowledgeGraphStore(db);
}
