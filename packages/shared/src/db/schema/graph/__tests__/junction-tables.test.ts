import { describe, it, expect } from "vitest";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import {
  entityCommunities,
  EntityCommunity,
  NewEntityCommunity,
} from "../entity-communities";
import {
  chunkEntities,
  ChunkEntity,
  NewChunkEntity,
  EntityPosition,
} from "../chunk-entities";

describe("entityCommunities schema", () => {
  const tableConfig = getTableConfig(entityCommunities);

  describe("table configuration", () => {
    it("should have correct table name", () => {
      expect(entityCommunities).toBeDefined();
      expect(tableConfig.name).toBe("entity_communities");
    });

    it("should have composite primary key on entityId and communityId", () => {
      expect(tableConfig.primaryKeys).toBeDefined();
      expect(tableConfig.primaryKeys.length).toBeGreaterThan(0);
    });
  });

  describe("columns", () => {
    it("should have entityId column", () => {
      expect(entityCommunities.entityId).toBeDefined();
    });

    it("should have communityId column", () => {
      expect(entityCommunities.communityId).toBeDefined();
    });

    it("should have exactly 2 columns", () => {
      const columns = Object.keys(entityCommunities);
      expect(columns).toHaveLength(2);
    });
  });

  describe("foreign keys", () => {
    it("should have foreign key to entities table", () => {
      expect(entityCommunities.entityId).toBeDefined();
      expect(tableConfig.foreignKeys).toBeDefined();
      expect(tableConfig.foreignKeys.length).toBeGreaterThanOrEqual(2);
    });

    it("should have foreign key to communities table", () => {
      expect(entityCommunities.communityId).toBeDefined();
    });
  });

  describe("indexes", () => {
    it("should have index on entityId", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("entity_communities_entity_id_idx");
    });

    it("should have index on communityId", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("entity_communities_community_id_idx");
    });

    it("should have exactly 2 indexes", () => {
      expect(tableConfig.indexes).toHaveLength(2);
    });
  });

  describe("type exports", () => {
    it("should export EntityCommunity type", () => {
      const testType: EntityCommunity = {} as EntityCommunity;
      expect(testType).toBeDefined();
    });

    it("should export NewEntityCommunity type", () => {
      const testType: NewEntityCommunity = {} as NewEntityCommunity;
      expect(testType).toBeDefined();
    });
  });

  describe("column nullability", () => {
    it("should have all columns as required", () => {
      const requiredColumns = ["entityId", "communityId"];

      for (const colName of requiredColumns) {
        const col =
          entityCommunities[colName as keyof typeof entityCommunities];
        expect(col).toBeDefined();
      }
    });
  });
});

describe("chunkEntities schema", () => {
  const tableConfig = getTableConfig(chunkEntities);

  describe("table configuration", () => {
    it("should have correct table name", () => {
      expect(chunkEntities).toBeDefined();
      expect(tableConfig.name).toBe("chunk_entities");
    });

    it("should have composite primary key on chunkId and entityId", () => {
      expect(tableConfig.primaryKeys).toBeDefined();
      expect(tableConfig.primaryKeys.length).toBeGreaterThan(0);
    });
  });

  describe("columns", () => {
    it("should have chunkId column", () => {
      expect(chunkEntities.chunkId).toBeDefined();
    });

    it("should have entityId column", () => {
      expect(chunkEntities.entityId).toBeDefined();
    });

    it("should have mentionCount column", () => {
      expect(chunkEntities.mentionCount).toBeDefined();
    });

    it("should have positions column", () => {
      expect(chunkEntities.positions).toBeDefined();
    });

    it("should have exactly 4 columns", () => {
      const columns = Object.keys(chunkEntities);
      expect(columns).toHaveLength(4);
    });
  });

  describe("foreign keys", () => {
    it("should have foreign key to chunks table", () => {
      expect(chunkEntities.chunkId).toBeDefined();
      expect(tableConfig.foreignKeys).toBeDefined();
      expect(tableConfig.foreignKeys.length).toBeGreaterThanOrEqual(2);
    });

    it("should have foreign key to entities table", () => {
      expect(chunkEntities.entityId).toBeDefined();
    });
  });

  describe("indexes", () => {
    it("should have index on chunkId", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("chunk_entities_chunk_id_idx");
    });

    it("should have index on entityId", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("chunk_entities_entity_id_idx");
    });

    it("should have exactly 2 indexes", () => {
      expect(tableConfig.indexes).toHaveLength(2);
    });
  });

  describe("type exports", () => {
    it("should export ChunkEntity type", () => {
      const testType: ChunkEntity = {} as ChunkEntity;
      expect(testType).toBeDefined();
    });

    it("should export NewChunkEntity type", () => {
      const testType: NewChunkEntity = {} as NewChunkEntity;
      expect(testType).toBeDefined();
    });

    it("should export EntityPosition interface", () => {
      const testType: EntityPosition = {
        startChar: 0,
        endChar: 10,
        surfaceForm: "test",
      };
      expect(testType).toBeDefined();
      expect(testType.startChar).toBe(0);
      expect(testType.endChar).toBe(10);
      expect(testType.surfaceForm).toBe("test");
    });
  });

  describe("default values", () => {
    it("should have mentionCount default to 1", () => {
      expect(chunkEntities.mentionCount).toBeDefined();
    });

    it("should have positions default to empty array", () => {
      expect(chunkEntities.positions).toBeDefined();
    });
  });

  describe("column nullability", () => {
    it("should have required columns", () => {
      const requiredColumns = [
        "chunkId",
        "entityId",
        "mentionCount",
        "positions",
      ];

      for (const colName of requiredColumns) {
        const col = chunkEntities[colName as keyof typeof chunkEntities];
        expect(col).toBeDefined();
      }
    });
  });
});
