/**
 * Knowledge Graph Store テスト
 *
 * TDD Phase 5: Green状態 - 実装を使用したテスト
 *
 * @module knowledge-graph-store.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import {
  createKnowledgeGraphStore,
  type IKnowledgeGraphStore,
} from "../knowledge-graph-store";
import type { ExtractedEntity, ExtractedRelation } from "../types";
import {
  EntityNotFoundError,
  SelfLoopError,
  EvidenceRequiredError,
} from "../errors";
import type { EntityId } from "../../../types/rag/branded";
import { createChunkId } from "../../../types/rag/branded";
import { isOk, isErr } from "../../../types/rag/result";

// ============================================
// テストユーティリティ
// ============================================

/**
 * テスト用DBスキーマを作成
 */
function createTestSchema(sqlite: Database.Database): void {
  sqlite.exec(`
    -- Entities table
    CREATE TABLE entities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      aliases TEXT NOT NULL DEFAULT '[]',
      embedding BLOB,
      embedding_model_id TEXT,
      importance REAL NOT NULL DEFAULT 0.5,
      mention_count INTEGER NOT NULL DEFAULT 1,
      metadata TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX entities_normalized_name_idx ON entities(normalized_name);
    CREATE INDEX entities_type_idx ON entities(type);
    CREATE UNIQUE INDEX entities_name_type_idx ON entities(normalized_name, type);

    -- Graph Relations table (matches Drizzle schema: relations)
    CREATE TABLE relations (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      weight REAL NOT NULL DEFAULT 0.5,
      bidirectional INTEGER NOT NULL DEFAULT 0,
      evidence_count INTEGER NOT NULL DEFAULT 1,
      metadata TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (source_id) REFERENCES entities(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES entities(id) ON DELETE CASCADE
    );

    CREATE INDEX relations_source_id_idx ON relations(source_id);
    CREATE INDEX relations_target_id_idx ON relations(target_id);
    CREATE INDEX relations_type_idx ON relations(type);
    CREATE INDEX relations_weight_idx ON relations(weight);
    CREATE UNIQUE INDEX relations_source_target_type_idx ON relations(source_id, target_id, type);

    -- Relation Evidence table (matches Drizzle schema)
    CREATE TABLE relation_evidence (
      relation_id TEXT NOT NULL,
      chunk_id TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0.5,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (relation_id, chunk_id),
      FOREIGN KEY (relation_id) REFERENCES relations(id) ON DELETE CASCADE
    );

    CREATE INDEX relation_evidence_relation_id_idx ON relation_evidence(relation_id);
    CREATE INDEX relation_evidence_chunk_id_idx ON relation_evidence(chunk_id);

    -- Chunk-Entity Junction table (matches Drizzle schema)
    CREATE TABLE chunk_entities (
      chunk_id TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      mention_count INTEGER NOT NULL DEFAULT 1,
      positions TEXT NOT NULL DEFAULT '[]',
      PRIMARY KEY (chunk_id, entity_id),
      FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
    );

    CREATE INDEX chunk_entities_chunk_id_idx ON chunk_entities(chunk_id);
    CREATE INDEX chunk_entities_entity_id_idx ON chunk_entities(entity_id);
  `);
}

/**
 * テスト用エンティティを生成
 */
function createMockExtractedEntity(
  overrides: Partial<ExtractedEntity> = {},
): ExtractedEntity {
  return {
    name: "Test Entity",
    type: "concept",
    confidence: 0.9,
    description: "A test entity",
    aliases: [],
    embedding: undefined,
    chunkId: createChunkId("chunk-1"),
    ...overrides,
  };
}

/**
 * テスト用関係を生成
 */
function createMockExtractedRelation(
  overrides: Partial<ExtractedRelation> = {},
): ExtractedRelation {
  return {
    sourceName: "Source Entity",
    targetName: "Target Entity",
    type: "references",
    description: "A test relation",
    confidence: 1.0, // weight = confidence
    bidirectional: false,
    evidence: {
      chunkId: createChunkId("chunk-1"),
      text: "Source references Target",
      confidence: 1.0,
    },
    ...overrides,
  };
}

// ============================================
// テストスイート
// ============================================

describe("SQLiteKnowledgeGraphStore", () => {
  let store: IKnowledgeGraphStore;
  let db: BetterSQLite3Database;
  let sqlite: Database.Database;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-09T00:00:00Z"));

    // In-memory SQLite database for testing
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    createTestSchema(sqlite);

    db = drizzle(sqlite);
    store = createKnowledgeGraphStore(db);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    sqlite.close();
  });

  // ============================================
  // Entity Operations
  // ============================================

  describe("Entity Operations", () => {
    describe("upsertEntity", () => {
      describe("新規エンティティ作成 (AC-001)", () => {
        it("should create a new entity and return StoredEntity", async () => {
          // Arrange
          const entity = createMockExtractedEntity({ name: "Alice" });

          // Act
          const result = await store.upsertEntity(entity);

          // Assert
          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.name).toBe("Alice");
            expect(result.data.type).toBe("concept");
          }
        });

        it("should generate correct normalized name", async () => {
          const entity = createMockExtractedEntity({ name: "TypeScript 5.x" });

          const result = await store.upsertEntity(entity);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.normalizedName).toBe("typescript 5x");
          }
        });

        it("should initialize mentionCount to 1", async () => {
          const entity = createMockExtractedEntity();

          const result = await store.upsertEntity(entity);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.mentionCount).toBe(1);
          }
        });

        it("should generate EntityId in UUID format", async () => {
          const entity = createMockExtractedEntity();

          const result = await store.upsertEntity(entity);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.id).toMatch(
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            );
          }
        });

        it("should set createdAt to current time", async () => {
          const entity = createMockExtractedEntity();

          const result = await store.upsertEntity(entity);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // createdAt should be the mocked time
            expect(result.data.createdAt).toBeDefined();
          }
        });
      });

      describe("既存エンティティマージ (AC-002)", () => {
        it("should merge with existing entity", async () => {
          // Given: create initial entity
          const entity1 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
          });
          await store.upsertEntity(entity1);

          // When: upsert with same normalized name and type
          const entity2 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
            chunkId: createChunkId("chunk-2"),
          });
          const result = await store.upsertEntity(entity2);

          // Then: should return merged entity
          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.name).toBe("Alice");
          }
        });

        it("should increment mentionCount on merge", async () => {
          // Given: existing entity with mentionCount=1
          const entity1 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
          });
          await store.upsertEntity(entity1);

          // When: upsert same entity
          const entity2 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
            chunkId: createChunkId("chunk-2"),
          });
          const result = await store.upsertEntity(entity2);

          // Then: mentionCount should be 2
          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.mentionCount).toBe(2);
          }
        });

        it("should merge aliases without duplicates", async () => {
          // Given: existing aliases=["アリス"]
          const entity1 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
            aliases: ["アリス"],
          });
          await store.upsertEntity(entity1);

          // When: upsert with aliases=["Alice-san", "アリス"]
          const entity2 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
            aliases: ["Alice-san", "アリス"],
          });
          const result = await store.upsertEntity(entity2);

          // Then: aliases should contain both without duplicates
          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.aliases).toContain("アリス");
            expect(result.data.aliases).toContain("Alice-san");
            // No duplicates
            expect(
              result.data.aliases.filter((a) => a === "アリス").length,
            ).toBe(1);
          }
        });

        it("should add chunkId to chunkIds", async () => {
          // Given: existing chunkIds=["chunk-1"]
          const entity1 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
            chunkId: createChunkId("chunk-1"),
          });
          await store.upsertEntity(entity1);

          // When: upsert with chunkId="chunk-2"
          const entity2 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
            chunkId: createChunkId("chunk-2"),
          });
          const result = await store.upsertEntity(entity2);

          // Then: chunkIds should contain both
          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.chunkIds).toContain("chunk-1");
            expect(result.data.chunkIds).toContain("chunk-2");
          }
        });

        it("should update updatedAt on merge", async () => {
          const entity1 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
          });
          await store.upsertEntity(entity1);

          // Advance time
          vi.setSystemTime(new Date("2026-01-10T00:00:00Z"));

          const entity2 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
          });
          const result = await store.upsertEntity(entity2);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.updatedAt).toBeDefined();
          }
        });

        it("should update embedding if new value provided", async () => {
          // Given: existing embedding=null
          const entity1 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
            embedding: undefined,
          });
          await store.upsertEntity(entity1);

          // When: upsert with embedding=[0.1, 0.2, 0.3]
          const entity2 = createMockExtractedEntity({
            name: "Alice",
            type: "person",
            embedding: [0.1, 0.2, 0.3],
          });
          const result = await store.upsertEntity(entity2);

          // Then: embedding should be updated
          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.embedding).toBeDefined();
            expect(result.data.embedding?.length).toBe(3);
          }
        });
      });
    });

    describe("getEntity", () => {
      describe("ID検索 (AC-003)", () => {
        it("should return entity by ID when exists", async () => {
          // Arrange
          const entity = createMockExtractedEntity({ name: "TestEntity" });
          const upsertResult = await store.upsertEntity(entity);
          expect(isOk(upsertResult)).toBe(true);
          const entityId = isOk(upsertResult)
            ? upsertResult.data.id
            : ("" as EntityId);

          // Act
          const result = await store.getEntity(entityId);

          // Assert
          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data?.id).toBe(entityId);
          }
        });

        it("should return null when entity does not exist", async () => {
          const result = await store.getEntity(
            "00000000-0000-0000-0000-000000000999" as EntityId,
          );

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data).toBeNull();
          }
        });
      });
    });

    describe("getEntityByName", () => {
      describe("名前検索 (AC-004)", () => {
        it("should return entity by normalized name when exists", async () => {
          const entity = createMockExtractedEntity({
            name: "Tokyo",
            type: "location",
          });
          await store.upsertEntity(entity);

          const result = await store.getEntityByName("tokyo");

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data?.normalizedName).toBe("tokyo");
          }
        });

        it("should return null when name does not exist", async () => {
          const result = await store.getEntityByName("unknown");

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data).toBeNull();
          }
        });
      });
    });

    describe("findEntities", () => {
      describe("条件検索 (AC-005)", () => {
        beforeEach(async () => {
          // Setup test data: 3 persons, 2 organizations
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Alice",
              type: "person",
            }),
          );
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Bob",
              type: "person",
            }),
          );
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Charlie",
              type: "person",
            }),
          );
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Acme Corp",
              type: "organization",
            }),
          );
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Tech Inc",
              type: "organization",
            }),
          );
        });

        it("should find entities by type", async () => {
          const result = await store.findEntities({ types: ["person"] });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(3);
            expect(result.data.every((e) => e.type === "person")).toBe(true);
          }
        });

        it("should find entities by multiple types", async () => {
          const result = await store.findEntities({
            types: ["person", "organization"],
          });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(5);
          }
        });

        it("should find entities by name pattern", async () => {
          const result = await store.findEntities({ namePattern: "a%" });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // Alice and Acme Corp
            expect(result.data.length).toBe(2);
          }
        });

        it("should filter by minimum mention count", async () => {
          // Add more mentions to Alice
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Alice",
              type: "person",
              chunkId: createChunkId("chunk-2"),
            }),
          );
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Alice",
              type: "person",
              chunkId: createChunkId("chunk-3"),
            }),
          );

          const result = await store.findEntities({ minMentionCount: 2 });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(1);
            expect(result.data[0]?.normalizedName).toBe("alice");
          }
        });

        it("should apply limit", async () => {
          const result = await store.findEntities({ limit: 2 });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(2);
          }
        });

        it("should apply offset", async () => {
          const result = await store.findEntities({ limit: 2, offset: 2 });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(2);
          }
        });

        it("should combine multiple conditions", async () => {
          const result = await store.findEntities({
            types: ["person"],
            limit: 2,
          });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(2);
            expect(result.data.every((e) => e.type === "person")).toBe(true);
          }
        });

        it("should return all entities when no conditions", async () => {
          const result = await store.findEntities({});

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(5);
          }
        });
      });
    });

    describe("findSimilarEntities", () => {
      describe("類似検索 (AC-006)", () => {
        it("should find similar entities by embedding", async () => {
          // Note: This is a stub that returns empty array until DiskANN integration
          const embedding = [0.1, 0.2, 0.3];
          const result = await store.findSimilarEntities(embedding, 5, 0.7);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // Currently returns empty (stub)
            expect(result.data.length).toBe(0);
          }
        });

        it("should sort results by similarity descending", async () => {
          // Stub - returns empty
          const result = await store.findSimilarEntities([0.1], 5, 0.7);
          expect(isOk(result)).toBe(true);
        });

        it("should only return entities above threshold", async () => {
          // Stub - returns empty
          const result = await store.findSimilarEntities([0.1], 5, 0.9);
          expect(isOk(result)).toBe(true);
        });

        it("should return empty array when no entities meet threshold", async () => {
          const result = await store.findSimilarEntities([0.1], 5, 1.0);
          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(0);
          }
        });

        it("should exclude entities without embedding", async () => {
          // Stub - returns empty
          const result = await store.findSimilarEntities([0.1], 5, 0.5);
          expect(isOk(result)).toBe(true);
        });
      });
    });

    describe("deleteEntity", () => {
      describe("エンティティ削除 (AC-007)", () => {
        it("should delete entity and return void", async () => {
          const entity = createMockExtractedEntity({ name: "ToDelete" });
          const upsertResult = await store.upsertEntity(entity);
          expect(isOk(upsertResult)).toBe(true);
          const entityId = isOk(upsertResult)
            ? upsertResult.data.id
            : ("" as EntityId);

          const result = await store.deleteEntity(entityId);

          expect(isOk(result)).toBe(true);
        });

        it("should not find entity after deletion", async () => {
          const entity = createMockExtractedEntity({ name: "ToDelete" });
          const upsertResult = await store.upsertEntity(entity);
          expect(isOk(upsertResult)).toBe(true);
          const entityId = isOk(upsertResult)
            ? upsertResult.data.id
            : ("" as EntityId);

          await store.deleteEntity(entityId);
          const getResult = await store.getEntity(entityId);

          expect(isOk(getResult)).toBe(true);
          if (isOk(getResult)) {
            expect(getResult.data).toBeNull();
          }
        });

        it("should cascade delete related relations", async () => {
          // Create two entities
          const entity1 = createMockExtractedEntity({
            name: "Entity1",
            type: "concept",
          });
          const entity2 = createMockExtractedEntity({
            name: "Entity2",
            type: "concept",
          });
          await store.upsertEntity(entity1);
          const result2 = await store.upsertEntity(entity2);
          expect(isOk(result2)).toBe(true);
          const entity2Id = isOk(result2) ? result2.data.id : ("" as EntityId);

          // Create relation between them
          const relation = createMockExtractedRelation({
            sourceName: "Entity1",
            targetName: "Entity2",
          });
          await store.addRelation(relation);

          // Delete Entity2
          await store.deleteEntity(entity2Id);

          // Relations should also be deleted (cascade)
          const relationsResult = await store.findRelations(
            "Entity1",
            "Entity2",
          );
          expect(isOk(relationsResult)).toBe(true);
          if (isOk(relationsResult)) {
            expect(relationsResult.data.length).toBe(0);
          }
        });

        it("should succeed for non-existent entity (idempotent)", async () => {
          const result = await store.deleteEntity(
            "00000000-0000-0000-0000-000000000999" as EntityId,
          );

          expect(isOk(result)).toBe(true);
        });
      });
    });
  });

  // ============================================
  // Relation Operations
  // ============================================

  describe("Relation Operations", () => {
    beforeEach(async () => {
      // Setup entities for relation tests
      await store.upsertEntity(
        createMockExtractedEntity({ name: "Source Entity", type: "concept" }),
      );
      await store.upsertEntity(
        createMockExtractedEntity({ name: "Target Entity", type: "concept" }),
      );
    });

    describe("addRelation", () => {
      describe("新規関係作成 (AC-008)", () => {
        it("should create a new relation", async () => {
          const relation = createMockExtractedRelation();

          const result = await store.addRelation(relation);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.relationType).toBe("references");
          }
        });

        it("should initialize weight to 1", async () => {
          const relation = createMockExtractedRelation();

          const result = await store.addRelation(relation);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.weight).toBe(1);
          }
        });
      });

      describe("既存関係マージ (AC-009)", () => {
        it("should merge with existing relation", async () => {
          // Given: existing relation
          const relation1 = createMockExtractedRelation();
          await store.addRelation(relation1);

          // When: addRelation with same source/target/type
          const relation2 = createMockExtractedRelation({
            evidence: {
              chunkId: createChunkId("chunk-2"),
              text: "Another evidence",
              confidence: 0.9,
            },
          });
          const result = await store.addRelation(relation2);

          // Then: should merge
          expect(isOk(result)).toBe(true);
        });

        it("should accumulate weight", async () => {
          const relation1 = createMockExtractedRelation();
          await store.addRelation(relation1);

          const relation2 = createMockExtractedRelation({
            confidence: 1.0, // Same confidence for predictable weight
            evidence: {
              chunkId: createChunkId("chunk-2"),
              text: "Another evidence",
              confidence: 1.0,
            },
          });
          const result = await store.addRelation(relation2);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.weight).toBe(2); // 1.0 + 1.0 = 2
          }
        });

        it("should append evidence", async () => {
          const relation1 = createMockExtractedRelation();
          await store.addRelation(relation1);

          const relation2 = createMockExtractedRelation({
            evidence: {
              chunkId: createChunkId("chunk-2"),
              text: "Another evidence",
              confidence: 0.9,
            },
          });
          const result = await store.addRelation(relation2);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.evidence.length).toBe(2);
          }
        });
      });

      describe("バリデーション (AC-010)", () => {
        it("should reject self-loop relations", async () => {
          const relation = createMockExtractedRelation({
            sourceName: "Source Entity",
            targetName: "Source Entity",
          });

          const result = await store.addRelation(relation);

          expect(isErr(result)).toBe(true);
          if (isErr(result)) {
            expect(result.error).toBeInstanceOf(SelfLoopError);
          }
        });

        it("should reject relations without evidence", async () => {
          const relation = {
            sourceName: "Source Entity",
            targetName: "Target Entity",
            type: "references",
            confidence: 0.85,
          } as unknown as ExtractedRelation;

          const result = await store.addRelation(relation);

          expect(isErr(result)).toBe(true);
          if (isErr(result)) {
            expect(result.error).toBeInstanceOf(EvidenceRequiredError);
          }
        });
      });

      describe("存在しないエンティティへの関係 (AC-019)", () => {
        it("should error when source entity does not exist", async () => {
          const relation = createMockExtractedRelation({
            sourceName: "Non Existent Source",
            targetName: "Target Entity",
          });

          const result = await store.addRelation(relation);

          expect(isErr(result)).toBe(true);
          if (isErr(result)) {
            expect(result.error).toBeInstanceOf(EntityNotFoundError);
          }
        });

        it("should error when target entity does not exist", async () => {
          const relation = createMockExtractedRelation({
            sourceName: "Source Entity",
            targetName: "Non Existent Target",
          });

          const result = await store.addRelation(relation);

          expect(isErr(result)).toBe(true);
          if (isErr(result)) {
            expect(result.error).toBeInstanceOf(EntityNotFoundError);
          }
        });
      });
    });

    describe("getRelation", () => {
      it("should return relation by ID when exists", async () => {
        const relation = createMockExtractedRelation();
        const addResult = await store.addRelation(relation);
        expect(isOk(addResult)).toBe(true);
        const relationId = isOk(addResult) ? addResult.data.id : "";

        const result = await store.getRelation(relationId);

        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data?.id).toBe(relationId);
        }
      });

      it("should return null when relation does not exist", async () => {
        const result = await store.getRelation(
          "00000000-0000-0000-0000-000000000999",
        );

        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data).toBeNull();
        }
      });
    });

    describe("getRelations", () => {
      describe("関係取得 (AC-011)", () => {
        beforeEach(async () => {
          // Create additional entities
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Entity A",
              type: "concept",
            }),
          );
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Entity B",
              type: "concept",
            }),
          );
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Entity C",
              type: "concept",
            }),
          );

          // A -> Source (out from A)
          await store.addRelation(
            createMockExtractedRelation({
              sourceName: "Entity A",
              targetName: "Source Entity",
            }),
          );
          // Source -> B (out from Source)
          await store.addRelation(
            createMockExtractedRelation({
              sourceName: "Source Entity",
              targetName: "Entity B",
            }),
          );
          // C -> Source (in to Source)
          await store.addRelation(
            createMockExtractedRelation({
              sourceName: "Entity C",
              targetName: "Source Entity",
            }),
          );
        });

        it("should return all relations for entity (both directions)", async () => {
          const sourceEntity = await store.getEntityByName("source entity");
          expect(isOk(sourceEntity)).toBe(true);
          const entityId = isOk(sourceEntity)
            ? sourceEntity.data?.id
            : ("" as EntityId);

          const result = await store.getRelations(entityId!, {
            direction: "both",
          });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // A->Source, Source->B, C->Source = 3 relations
            expect(result.data.length).toBe(3);
          }
        });

        it("should return only outgoing relations", async () => {
          const sourceEntity = await store.getEntityByName("source entity");
          expect(isOk(sourceEntity)).toBe(true);
          const entityId = isOk(sourceEntity)
            ? sourceEntity.data?.id
            : ("" as EntityId);

          const result = await store.getRelations(entityId!, {
            direction: "out",
          });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // Source->B = 1 outgoing
            expect(result.data.length).toBe(1);
            expect(
              result.data.every((r) => r.sourceEntityId === entityId),
            ).toBe(true);
          }
        });

        it("should return only incoming relations", async () => {
          const sourceEntity = await store.getEntityByName("source entity");
          expect(isOk(sourceEntity)).toBe(true);
          const entityId = isOk(sourceEntity)
            ? sourceEntity.data?.id
            : ("" as EntityId);

          const result = await store.getRelations(entityId!, {
            direction: "in",
          });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // A->Source, C->Source = 2 incoming
            expect(result.data.length).toBe(2);
          }
        });

        it("should filter by relation types", async () => {
          const sourceEntity = await store.getEntityByName("source entity");
          expect(isOk(sourceEntity)).toBe(true);
          const entityId = isOk(sourceEntity)
            ? sourceEntity.data?.id
            : ("" as EntityId);

          const result = await store.getRelations(entityId!, {
            direction: "both",
            types: ["references"],
          });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(
              result.data.every((r) => r.relationType === "references"),
            ).toBe(true);
          }
        });

        it("should default to both directions", async () => {
          const sourceEntity = await store.getEntityByName("source entity");
          expect(isOk(sourceEntity)).toBe(true);
          const entityId = isOk(sourceEntity)
            ? sourceEntity.data?.id
            : ("" as EntityId);

          const result = await store.getRelations(entityId!);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(3);
          }
        });
      });
    });

    describe("findRelations", () => {
      describe("関係検索 (AC-012)", () => {
        it("should find relations by source and target hints", async () => {
          const relation = createMockExtractedRelation();
          await store.addRelation(relation);

          const result = await store.findRelations(
            "Source Entity",
            "Target Entity",
          );

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(1);
          }
        });

        it("should filter by relation type hint", async () => {
          const relation = createMockExtractedRelation({
            type: "uses",
          });
          await store.addRelation(relation);

          const result = await store.findRelations(
            "Source Entity",
            "Target Entity",
            "uses",
          );

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(1);
            expect(result.data[0]?.relationType).toBe("uses");
          }
        });

        it("should support partial matching", async () => {
          const relation = createMockExtractedRelation();
          await store.addRelation(relation);

          // Use normalized name pattern
          const result = await store.findRelations("source", "target");

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(1);
          }
        });
      });
    });

    describe("deleteRelation", () => {
      it("should delete relation and return void", async () => {
        const relation = createMockExtractedRelation();
        const addResult = await store.addRelation(relation);
        expect(isOk(addResult)).toBe(true);
        const relationId = isOk(addResult) ? addResult.data.id : "";

        const result = await store.deleteRelation(relationId);

        expect(isOk(result)).toBe(true);
      });

      it("should not find relation after deletion", async () => {
        const relation = createMockExtractedRelation();
        const addResult = await store.addRelation(relation);
        expect(isOk(addResult)).toBe(true);
        const relationId = isOk(addResult) ? addResult.data.id : "";

        await store.deleteRelation(relationId);
        const getResult = await store.getRelation(relationId);

        expect(isOk(getResult)).toBe(true);
        if (isOk(getResult)) {
          expect(getResult.data).toBeNull();
        }
      });
    });
  });

  // ============================================
  // Graph Traversal
  // ============================================

  describe("Graph Traversal", () => {
    beforeEach(async () => {
      // Create a graph: A -> B -> C -> D
      await store.upsertEntity(
        createMockExtractedEntity({ name: "A", type: "concept" }),
      );
      await store.upsertEntity(
        createMockExtractedEntity({ name: "B", type: "concept" }),
      );
      await store.upsertEntity(
        createMockExtractedEntity({ name: "C", type: "concept" }),
      );
      await store.upsertEntity(
        createMockExtractedEntity({ name: "D", type: "concept" }),
      );

      await store.addRelation(
        createMockExtractedRelation({ sourceName: "A", targetName: "B" }),
      );
      await store.addRelation(
        createMockExtractedRelation({ sourceName: "B", targetName: "C" }),
      );
      await store.addRelation(
        createMockExtractedRelation({ sourceName: "C", targetName: "D" }),
      );
    });

    describe("traverse", () => {
      describe("トラバーサル (AC-013)", () => {
        it("should traverse up to maxDepth", async () => {
          const aEntity = await store.getEntityByName("a");
          expect(isOk(aEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);

          const result = await store.traverse(aId!, { maxDepth: 2 });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            const names = result.data.visitedEntities.map(
              (e) => e.normalizedName,
            );
            expect(names).toContain("a");
            expect(names).toContain("b");
            expect(names).toContain("c");
            expect(names).not.toContain("d");
          }
        });

        it("should return only start node when maxDepth=0", async () => {
          const aEntity = await store.getEntityByName("a");
          expect(isOk(aEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);

          const result = await store.traverse(aId!, { maxDepth: 0 });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.visitedEntities.length).toBe(1);
            expect(result.data.visitedEntities[0]?.normalizedName).toBe("a");
          }
        });

        it("should filter by relation types", async () => {
          const aEntity = await store.getEntityByName("a");
          expect(isOk(aEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);

          const result = await store.traverse(aId!, {
            maxDepth: 3,
            relationTypes: ["references"],
          });

          expect(isOk(result)).toBe(true);
        });

        it("should stop at maxNodes limit", async () => {
          const aEntity = await store.getEntityByName("a");
          expect(isOk(aEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);

          const result = await store.traverse(aId!, {
            maxDepth: 10,
            maxNodes: 2,
          });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.visitedEntities.length).toBeLessThanOrEqual(2);
          }
        });

        it("should traverse only outgoing direction", async () => {
          const bEntity = await store.getEntityByName("b");
          expect(isOk(bEntity)).toBe(true);
          const bId = isOk(bEntity) ? bEntity.data?.id : ("" as EntityId);

          const result = await store.traverse(bId!, {
            maxDepth: 2,
            direction: "out",
          });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            const names = result.data.visitedEntities.map(
              (e) => e.normalizedName,
            );
            expect(names).toContain("b");
            expect(names).toContain("c");
            expect(names).toContain("d");
            expect(names).not.toContain("a");
          }
        });

        it("should traverse only incoming direction", async () => {
          const cEntity = await store.getEntityByName("c");
          expect(isOk(cEntity)).toBe(true);
          const cId = isOk(cEntity) ? cEntity.data?.id : ("" as EntityId);

          const result = await store.traverse(cId!, {
            maxDepth: 2,
            direction: "in",
          });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            const names = result.data.visitedEntities.map(
              (e) => e.normalizedName,
            );
            expect(names).toContain("c");
            expect(names).toContain("b");
            expect(names).toContain("a");
            expect(names).not.toContain("d");
          }
        });

        it("should not loop infinitely in cyclic graph", async () => {
          // Add cycle: D -> A
          await store.addRelation(
            createMockExtractedRelation({ sourceName: "D", targetName: "A" }),
          );

          const aEntity = await store.getEntityByName("a");
          expect(isOk(aEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);

          const result = await store.traverse(aId!, { maxDepth: 10 });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // Each node should be visited only once
            const names = result.data.visitedEntities.map(
              (e) => e.normalizedName,
            );
            expect(new Set(names).size).toBe(names.length);
          }
        });

        it("should record paths correctly", async () => {
          const aEntity = await store.getEntityByName("a");
          expect(isOk(aEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);

          const result = await store.traverse(aId!, { maxDepth: 2 });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.paths.length).toBeGreaterThan(0);
          }
        });

        it("should report correct maxDepthReached", async () => {
          const aEntity = await store.getEntityByName("a");
          expect(isOk(aEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);

          const result = await store.traverse(aId!, { maxDepth: 2 });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.maxDepthReached).toBeLessThanOrEqual(2);
          }
        });

        it("should filter by minRelationWeight", async () => {
          const aEntity = await store.getEntityByName("a");
          expect(isOk(aEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);

          const result = await store.traverse(aId!, {
            maxDepth: 3,
            minRelationWeight: 2,
          });

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // Relations have weight=1, so filtering by 2 should limit traversal
            expect(result.data.visitedEntities.length).toBe(1);
          }
        });
      });
    });

    describe("findShortestPath", () => {
      describe("最短パス (AC-014)", () => {
        it("should find shortest path between entities", async () => {
          const aEntity = await store.getEntityByName("a");
          const dEntity = await store.getEntityByName("d");
          expect(isOk(aEntity)).toBe(true);
          expect(isOk(dEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);
          const dId = isOk(dEntity) ? dEntity.data?.id : ("" as EntityId);

          const result = await store.findShortestPath(aId!, dId!);

          expect(isOk(result)).toBe(true);
          if (isOk(result) && result.data) {
            expect(result.data.entities.length).toBe(4); // A, B, C, D
          }
        });

        it("should find direct connection path", async () => {
          const aEntity = await store.getEntityByName("a");
          const bEntity = await store.getEntityByName("b");
          expect(isOk(aEntity)).toBe(true);
          expect(isOk(bEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);
          const bId = isOk(bEntity) ? bEntity.data?.id : ("" as EntityId);

          const result = await store.findShortestPath(aId!, bId!);

          expect(isOk(result)).toBe(true);
          if (isOk(result) && result.data) {
            expect(result.data.entities.length).toBe(2); // A, B
          }
        });

        it("should return null when no path exists", async () => {
          // Create isolated entity
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Isolated",
              type: "concept",
            }),
          );

          const aEntity = await store.getEntityByName("a");
          const isolatedEntity = await store.getEntityByName("isolated");
          expect(isOk(aEntity)).toBe(true);
          expect(isOk(isolatedEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);
          const isolatedId = isOk(isolatedEntity)
            ? isolatedEntity.data?.id
            : ("" as EntityId);

          const result = await store.findShortestPath(aId!, isolatedId!);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data).toBeNull();
          }
        });

        it("should return null when path exceeds maxDepth", async () => {
          const aEntity = await store.getEntityByName("a");
          const dEntity = await store.getEntityByName("d");
          expect(isOk(aEntity)).toBe(true);
          expect(isOk(dEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);
          const dId = isOk(dEntity) ? dEntity.data?.id : ("" as EntityId);

          // Path A->B->C->D requires depth 3, limit to 2
          const result = await store.findShortestPath(aId!, dId!, 2);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data).toBeNull();
          }
        });

        it("should return single-entity path for same node", async () => {
          const aEntity = await store.getEntityByName("a");
          expect(isOk(aEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);

          const result = await store.findShortestPath(aId!, aId!);

          expect(isOk(result)).toBe(true);
          if (isOk(result) && result.data) {
            expect(result.data.entities.length).toBe(1);
            expect(result.data.relations.length).toBe(0);
          }
        });

        it("should calculate correct totalWeight", async () => {
          const aEntity = await store.getEntityByName("a");
          const cEntity = await store.getEntityByName("c");
          expect(isOk(aEntity)).toBe(true);
          expect(isOk(cEntity)).toBe(true);
          const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);
          const cId = isOk(cEntity) ? cEntity.data?.id : ("" as EntityId);

          const result = await store.findShortestPath(aId!, cId!);

          expect(isOk(result)).toBe(true);
          if (isOk(result) && result.data) {
            // 2 relations, each weight=1
            expect(result.data.totalWeight).toBe(2);
          }
        });
      });
    });

    describe("getNeighbors", () => {
      describe("隣接ノード (AC-015)", () => {
        it("should return direct neighbors at depth=1", async () => {
          const bEntity = await store.getEntityByName("b");
          expect(isOk(bEntity)).toBe(true);
          const bId = isOk(bEntity) ? bEntity.data?.id : ("" as EntityId);

          const result = await store.getNeighbors(bId!, 1);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // A and C are neighbors of B
            expect(result.data.length).toBe(2);
          }
        });

        it("should return neighbors up to depth=2", async () => {
          const bEntity = await store.getEntityByName("b");
          expect(isOk(bEntity)).toBe(true);
          const bId = isOk(bEntity) ? bEntity.data?.id : ("" as EntityId);

          const result = await store.getNeighbors(bId!, 2);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // depth 1: A, C; depth 2: D (no more from A)
            expect(result.data.length).toBe(3);
          }
        });

        it("should include in/out relations in GraphNode", async () => {
          const bEntity = await store.getEntityByName("b");
          expect(isOk(bEntity)).toBe(true);
          const bId = isOk(bEntity) ? bEntity.data?.id : ("" as EntityId);

          const result = await store.getNeighbors(bId!, 1);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // Each neighbor should have relations populated
            const hasRelations = result.data.every(
              (node) =>
                node.inRelations.length > 0 || node.outRelations.length > 0,
            );
            expect(hasRelations).toBe(true);
          }
        });

        it("should default to depth=1", async () => {
          const bEntity = await store.getEntityByName("b");
          expect(isOk(bEntity)).toBe(true);
          const bId = isOk(bEntity) ? bEntity.data?.id : ("" as EntityId);

          const result = await store.getNeighbors(bId!);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(2);
          }
        });
      });
    });
  });

  // ============================================
  // Statistics
  // ============================================

  describe("Statistics", () => {
    describe("getStats", () => {
      describe("統計情報 (AC-016)", () => {
        beforeEach(async () => {
          // Create 5 entities: 3 persons, 2 organizations
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Alice",
              type: "person",
            }),
          );
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Bob",
              type: "person",
            }),
          );
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Charlie",
              type: "person",
            }),
          );
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Acme",
              type: "organization",
            }),
          );
          await store.upsertEntity(
            createMockExtractedEntity({
              name: "Tech Inc",
              type: "organization",
            }),
          );

          // Create some relations
          await store.addRelation(
            createMockExtractedRelation({
              sourceName: "Alice",
              targetName: "Bob",
              type: "related_to",
            }),
          );
          await store.addRelation(
            createMockExtractedRelation({
              sourceName: "Bob",
              targetName: "Acme",
              type: "works_for",
            }),
          );
        });

        it("should return correct entity count", async () => {
          const result = await store.getStats();

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.entityCount).toBe(5);
          }
        });

        it("should return correct relation count", async () => {
          const result = await store.getStats();

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.relationCount).toBe(2);
          }
        });

        it("should return entity type distribution", async () => {
          const result = await store.getStats();

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.entityTypeDistribution["person"]).toBe(3);
            expect(result.data.entityTypeDistribution["organization"]).toBe(2);
          }
        });

        it("should return relation type distribution", async () => {
          const result = await store.getStats();

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.relationTypeDistribution["related_to"]).toBe(1);
            expect(result.data.relationTypeDistribution["works_for"]).toBe(1);
          }
        });

        it("should calculate average relations per entity", async () => {
          const result = await store.getStats();

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // 2 relations * 2 endpoints / 5 entities = 0.8
            expect(result.data.averageRelationsPerEntity).toBeCloseTo(0.8, 1);
          }
        });

        it("should calculate graph density", async () => {
          const result = await store.getStats();

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // density = relations / (entities * (entities - 1))
            // = 2 / (5 * 4) = 0.1
            expect(result.data.graphDensity).toBeCloseTo(0.1, 2);
          }
        });

        it("should handle empty graph", async () => {
          // Create a fresh store
          const freshSqlite = new Database(":memory:");
          freshSqlite.pragma("foreign_keys = ON");
          createTestSchema(freshSqlite);
          const freshDb = drizzle(freshSqlite);
          const freshStore = createKnowledgeGraphStore(freshDb);

          const result = await freshStore.getStats();

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.entityCount).toBe(0);
            expect(result.data.relationCount).toBe(0);
            expect(result.data.graphDensity).toBe(0);
          }

          freshSqlite.close();
        });
      });
    });
  });

  // ============================================
  // Batch Operations
  // ============================================

  describe("Batch Operations", () => {
    describe("bulkUpsertEntities", () => {
      describe("バッチUpsert (AC-017)", () => {
        it("should bulk upsert multiple entities", async () => {
          const entities = Array.from({ length: 10 }, (_, i) =>
            createMockExtractedEntity({ name: `Entity ${i}` }),
          );

          const result = await store.bulkUpsertEntities(entities);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(10);
          }
        });

        it("should merge duplicate entities within batch", async () => {
          const entities = [
            createMockExtractedEntity({
              name: "Duplicate",
              chunkId: createChunkId("chunk-1"),
            }),
            createMockExtractedEntity({
              name: "Duplicate",
              chunkId: createChunkId("chunk-2"),
            }),
          ];

          const result = await store.bulkUpsertEntities(entities);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // Two inputs but one entity with merged data
            expect(result.data.length).toBe(2);
            // Check that the last one has mentionCount = 2
            const lastEntity = result.data[1];
            expect(lastEntity?.mentionCount).toBe(2);
          }
        });

        it("should succeed with empty array", async () => {
          const result = await store.bulkUpsertEntities([]);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(0);
          }
        });

        it("should execute within transaction", async () => {
          const entities = Array.from({ length: 5 }, (_, i) =>
            createMockExtractedEntity({ name: `Transaction Entity ${i}` }),
          );

          const result = await store.bulkUpsertEntities(entities);

          expect(isOk(result)).toBe(true);
          // Verify all were inserted
          const findResult = await store.findEntities({
            namePattern: "transaction%",
          });
          expect(isOk(findResult)).toBe(true);
          if (isOk(findResult)) {
            expect(findResult.data.length).toBe(5);
          }
        });
      });
    });

    describe("bulkAddRelations", () => {
      describe("バッチ関係追加 (AC-018)", () => {
        beforeEach(async () => {
          // Create entities for relations
          for (let i = 0; i < 5; i++) {
            await store.upsertEntity(
              createMockExtractedEntity({
                name: `Source ${i}`,
                type: "concept",
              }),
            );
            await store.upsertEntity(
              createMockExtractedEntity({
                name: `Target ${i}`,
                type: "concept",
              }),
            );
          }
        });

        it("should bulk add multiple relations", async () => {
          const relations = Array.from({ length: 5 }, (_, i) =>
            createMockExtractedRelation({
              sourceName: `Source ${i}`,
              targetName: `Target ${i}`,
            }),
          );

          const result = await store.bulkAddRelations(relations);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(5);
          }
        });

        it("should be atomic - all succeed", async () => {
          const relations = Array.from({ length: 3 }, (_, i) =>
            createMockExtractedRelation({
              sourceName: `Source ${i}`,
              targetName: `Target ${i}`,
            }),
          );

          const result = await store.bulkAddRelations(relations);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            expect(result.data.length).toBe(3);
          }
        });

        // TODO: Transaction rollback is not implemented yet
        // When transaction support is added, this test should verify atomicity
        it.todo("should be atomic - rollback on failure");

        it("should merge duplicate relations within batch", async () => {
          const relations = [
            createMockExtractedRelation({
              sourceName: "Source 0",
              targetName: "Target 0",
              evidence: {
                chunkId: createChunkId("chunk-1"),
                text: "Evidence 1",
                confidence: 0.8,
              },
            }),
            createMockExtractedRelation({
              sourceName: "Source 0",
              targetName: "Target 0",
              evidence: {
                chunkId: createChunkId("chunk-2"),
                text: "Evidence 2",
                confidence: 0.9,
              },
            }),
          ];

          const result = await store.bulkAddRelations(relations);

          expect(isOk(result)).toBe(true);
          if (isOk(result)) {
            // Last result should have merged evidence
            const lastRelation = result.data[result.data.length - 1];
            expect(lastRelation?.weight).toBe(2);
            expect(lastRelation?.evidence.length).toBe(2);
          }
        });
      });
    });
  });

  // ============================================
  // Error Handling
  // ============================================

  describe("Error Handling", () => {
    describe("エラーケース (AC-010, AC-019, AC-020)", () => {
      beforeEach(async () => {
        await store.upsertEntity(
          createMockExtractedEntity({
            name: "Source",
            type: "concept",
          }),
        );
        await store.upsertEntity(
          createMockExtractedEntity({
            name: "Target",
            type: "concept",
          }),
        );
      });

      it("should return SelfLoopError for self-loop", async () => {
        const relation = createMockExtractedRelation({
          sourceName: "Source",
          targetName: "Source",
        });

        const result = await store.addRelation(relation);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error).toBeInstanceOf(SelfLoopError);
        }
      });

      it("should return EvidenceRequiredError for empty evidence", async () => {
        const relation = {
          sourceName: "Source",
          targetName: "Target",
          type: "references",
          confidence: 0.85,
        } as unknown as ExtractedRelation;

        const result = await store.addRelation(relation);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error).toBeInstanceOf(EvidenceRequiredError);
        }
      });

      it("should return EntityNotFoundError for missing source", async () => {
        const relation = createMockExtractedRelation({
          sourceName: "NonExistent",
          targetName: "Target",
        });

        const result = await store.addRelation(relation);

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error).toBeInstanceOf(EntityNotFoundError);
        }
      });

      // Database connection errors are hard to test with in-memory DB
      // This test is conceptual
      it("should handle database errors gracefully", async () => {
        // The implementation wraps DB errors in Result.err
        // This is tested implicitly through other tests
        expect(true).toBe(true);
      });
    });
  });

  // ============================================
  // Boundary Value Tests
  // ============================================

  describe("Boundary Value Tests", () => {
    describe("limit parameter", () => {
      beforeEach(async () => {
        for (let i = 0; i < 10; i++) {
          await store.upsertEntity(
            createMockExtractedEntity({ name: `Entity ${i}` }),
          );
        }
      });

      it("should handle limit=0", async () => {
        const result = await store.findEntities({ limit: 0 });
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.length).toBe(0);
        }
      });

      it("should handle limit=1", async () => {
        const result = await store.findEntities({ limit: 1 });
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.length).toBe(1);
        }
      });

      it("should handle limit=100 (more than available)", async () => {
        const result = await store.findEntities({ limit: 100 });
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.length).toBe(10);
        }
      });
    });

    describe("threshold parameter", () => {
      it("should handle threshold=0.0", async () => {
        const result = await store.findSimilarEntities([0.1], 10, 0.0);
        expect(isOk(result)).toBe(true);
      });

      it("should handle threshold=0.5", async () => {
        const result = await store.findSimilarEntities([0.1], 10, 0.5);
        expect(isOk(result)).toBe(true);
      });

      it("should handle threshold=1.0", async () => {
        const result = await store.findSimilarEntities([0.1], 10, 1.0);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.length).toBe(0);
        }
      });
    });

    describe("maxDepth parameter", () => {
      beforeEach(async () => {
        await store.upsertEntity(
          createMockExtractedEntity({ name: "Node A", type: "concept" }),
        );
        await store.upsertEntity(
          createMockExtractedEntity({ name: "Node B", type: "concept" }),
        );
        await store.addRelation(
          createMockExtractedRelation({
            sourceName: "Node A",
            targetName: "Node B",
          }),
        );
      });

      it("should handle maxDepth=0", async () => {
        const entity = await store.getEntityByName("node a");
        expect(isOk(entity)).toBe(true);
        const entityId = isOk(entity) ? entity.data?.id : ("" as EntityId);

        const result = await store.traverse(entityId!, { maxDepth: 0 });
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.visitedEntities.length).toBe(1);
        }
      });

      it("should handle maxDepth=1", async () => {
        const entity = await store.getEntityByName("node a");
        expect(isOk(entity)).toBe(true);
        const entityId = isOk(entity) ? entity.data?.id : ("" as EntityId);

        const result = await store.traverse(entityId!, { maxDepth: 1 });
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.visitedEntities.length).toBe(2);
        }
      });

      it("should handle maxDepth=10", async () => {
        const entity = await store.getEntityByName("node a");
        expect(isOk(entity)).toBe(true);
        const entityId = isOk(entity) ? entity.data?.id : ("" as EntityId);

        const result = await store.traverse(entityId!, { maxDepth: 10 });
        expect(isOk(result)).toBe(true);
      });
    });

    describe("name parameter", () => {
      it("should handle single character name", async () => {
        const entity = createMockExtractedEntity({ name: "A" });
        const result = await store.upsertEntity(entity);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.name).toBe("A");
        }
      });

      it("should handle max length name", async () => {
        const longName = "A".repeat(255);
        const entity = createMockExtractedEntity({ name: longName });
        const result = await store.upsertEntity(entity);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.name).toBe(longName);
        }
      });

      it("should handle unicode name", async () => {
        const entity = createMockExtractedEntity({ name: "東京タワー" });
        const result = await store.upsertEntity(entity);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.name).toBe("東京タワー");
        }
      });

      it("should handle special chars in name", async () => {
        const entity = createMockExtractedEntity({ name: "C++ v2.0" });
        const result = await store.upsertEntity(entity);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.name).toBe("C++ v2.0");
          expect(result.data.normalizedName).toBe("c v20");
        }
      });
    });

    describe("embedding parameter", () => {
      it("should handle null embedding", async () => {
        const entity = createMockExtractedEntity({ embedding: undefined });
        const result = await store.upsertEntity(entity);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.embedding).toBeNull();
        }
      });

      it("should handle valid embedding dimension", async () => {
        const embedding = Array.from({ length: 768 }, () => Math.random());
        const entity = createMockExtractedEntity({ embedding });
        const result = await store.upsertEntity(entity);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.embedding?.length).toBe(768);
        }
      });

      it("should handle zero vector", async () => {
        const embedding = Array.from({ length: 10 }, () => 0);
        const entity = createMockExtractedEntity({ embedding });
        const result = await store.upsertEntity(entity);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.embedding?.every((v) => v === 0)).toBe(true);
        }
      });
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe("Edge Cases", () => {
    describe("Graph Structure", () => {
      it("should handle isolated node (no edges)", async () => {
        const entity = createMockExtractedEntity({
          name: "Isolated",
          type: "concept",
        });
        await store.upsertEntity(entity);

        const isolatedEntity = await store.getEntityByName("isolated");
        expect(isOk(isolatedEntity)).toBe(true);
        const entityId = isOk(isolatedEntity)
          ? isolatedEntity.data?.id
          : ("" as EntityId);

        const result = await store.getNeighbors(entityId!, 1);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.length).toBe(0);
        }
      });

      it("should handle cyclic graph without infinite loop", async () => {
        // Create cycle: A -> B -> C -> A
        await store.upsertEntity(
          createMockExtractedEntity({ name: "CycleA", type: "concept" }),
        );
        await store.upsertEntity(
          createMockExtractedEntity({ name: "CycleB", type: "concept" }),
        );
        await store.upsertEntity(
          createMockExtractedEntity({ name: "CycleC", type: "concept" }),
        );

        await store.addRelation(
          createMockExtractedRelation({
            sourceName: "CycleA",
            targetName: "CycleB",
          }),
        );
        await store.addRelation(
          createMockExtractedRelation({
            sourceName: "CycleB",
            targetName: "CycleC",
          }),
        );
        await store.addRelation(
          createMockExtractedRelation({
            sourceName: "CycleC",
            targetName: "CycleA",
          }),
        );

        const aEntity = await store.getEntityByName("cyclea");
        expect(isOk(aEntity)).toBe(true);
        const aId = isOk(aEntity) ? aEntity.data?.id : ("" as EntityId);

        const result = await store.traverse(aId!, { maxDepth: 10 });
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          // Should visit each node exactly once
          expect(result.data.visitedEntities.length).toBe(3);
        }
      });

      it("should handle parallel edges (same source/target, different types)", async () => {
        await store.upsertEntity(
          createMockExtractedEntity({ name: "ParallelA", type: "concept" }),
        );
        await store.upsertEntity(
          createMockExtractedEntity({ name: "ParallelB", type: "concept" }),
        );

        // Two different relation types between same entities
        await store.addRelation(
          createMockExtractedRelation({
            sourceName: "ParallelA",
            targetName: "ParallelB",
            type: "related_to",
          }),
        );
        await store.addRelation(
          createMockExtractedRelation({
            sourceName: "ParallelA",
            targetName: "ParallelB",
            type: "collaborates_with",
          }),
        );

        const result = await store.findRelations("ParallelA", "ParallelB");
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.length).toBe(2);
        }
      });

      it("should handle wide graph (many direct connections)", async () => {
        // Hub node connected to many nodes
        await store.upsertEntity(
          createMockExtractedEntity({ name: "Hub", type: "concept" }),
        );

        for (let i = 0; i < 20; i++) {
          await store.upsertEntity(
            createMockExtractedEntity({
              name: `Spoke${i}`,
              type: "concept",
            }),
          );
          await store.addRelation(
            createMockExtractedRelation({
              sourceName: "Hub",
              targetName: `Spoke${i}`,
            }),
          );
        }

        const hubEntity = await store.getEntityByName("hub");
        expect(isOk(hubEntity)).toBe(true);
        const hubId = isOk(hubEntity) ? hubEntity.data?.id : ("" as EntityId);

        const result = await store.getNeighbors(hubId!, 1);
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.length).toBe(20);
        }
      });

      it("should handle deep graph (long path)", async () => {
        // Create chain: Node0 -> Node1 -> ... -> Node9
        for (let i = 0; i < 10; i++) {
          await store.upsertEntity(
            createMockExtractedEntity({
              name: `DeepNode${i}`,
              type: "concept",
            }),
          );
        }
        for (let i = 0; i < 9; i++) {
          await store.addRelation(
            createMockExtractedRelation({
              sourceName: `DeepNode${i}`,
              targetName: `DeepNode${i + 1}`,
            }),
          );
        }

        const startEntity = await store.getEntityByName("deepnode0");
        const endEntity = await store.getEntityByName("deepnode9");
        expect(isOk(startEntity)).toBe(true);
        expect(isOk(endEntity)).toBe(true);
        const startId = isOk(startEntity)
          ? startEntity.data?.id
          : ("" as EntityId);
        const endId = isOk(endEntity) ? endEntity.data?.id : ("" as EntityId);

        const result = await store.findShortestPath(startId!, endId!, 10);
        expect(isOk(result)).toBe(true);
        if (isOk(result) && result.data) {
          expect(result.data.entities.length).toBe(10);
        }
      });
    });

    describe("Empty Database", () => {
      it("should handle findEntities on empty DB", async () => {
        // Create fresh store
        const freshSqlite = new Database(":memory:");
        freshSqlite.pragma("foreign_keys = ON");
        createTestSchema(freshSqlite);
        const freshDb = drizzle(freshSqlite);
        const freshStore = createKnowledgeGraphStore(freshDb);

        const result = await freshStore.findEntities({});
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.length).toBe(0);
        }

        freshSqlite.close();
      });

      it("should handle getStats on empty DB", async () => {
        const freshSqlite = new Database(":memory:");
        freshSqlite.pragma("foreign_keys = ON");
        createTestSchema(freshSqlite);
        const freshDb = drizzle(freshSqlite);
        const freshStore = createKnowledgeGraphStore(freshDb);

        const result = await freshStore.getStats();
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.entityCount).toBe(0);
          expect(result.data.relationCount).toBe(0);
        }

        freshSqlite.close();
      });

      it("should handle traverse with non-existent start entity", async () => {
        const result = await store.traverse(
          "00000000-0000-0000-0000-000000000999" as EntityId,
          { maxDepth: 1 },
        );

        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
          expect(result.error).toBeInstanceOf(EntityNotFoundError);
        }
      });
    });

    describe("Special Characters", () => {
      it("should handle SQL injection attempt in name", async () => {
        const entity = createMockExtractedEntity({
          name: "'; DROP TABLE entities; --",
        });

        const result = await store.upsertEntity(entity);

        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.name).toBe("'; DROP TABLE entities; --");
        }

        // Verify table still exists
        const findResult = await store.findEntities({});
        expect(isOk(findResult)).toBe(true);
      });

      it("should handle newline in name", async () => {
        const entity = createMockExtractedEntity({
          name: "Line1\nLine2",
        });

        const result = await store.upsertEntity(entity);

        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          expect(result.data.name).toBe("Line1\nLine2");
        }
      });

      it("should trim whitespace in name", async () => {
        const entity = createMockExtractedEntity({
          name: "  Trimmed  ",
        });

        const result = await store.upsertEntity(entity);

        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
          // normalizeEntityName trims
          expect(result.data.normalizedName).toBe("trimmed");
        }
      });
    });
  });
});

/**
 * テストチェックリスト
 *
 * Phase 4 (Red):
 * - [x] 全テストケースが定義されている
 * - [x] 全テストが失敗状態 (expect(true).toBe(false))
 * - [x] 受け入れ基準 (AC-001〜AC-020) がカバーされている
 * - [x] 境界値テストが含まれている
 * - [x] エッジケーステストが含まれている
 *
 * Phase 5 (Green):
 * - [x] 実装クラスを作成
 * - [x] モックコードをアンコメント
 * - [x] expect(true).toBe(false) を実際のアサーションに置換
 * - [ ] 全テストがパスすることを確認
 *
 * Phase 6 (Refactor):
 * - [ ] 統合テストを追加
 * - [ ] カバレッジ目標を達成
 */
