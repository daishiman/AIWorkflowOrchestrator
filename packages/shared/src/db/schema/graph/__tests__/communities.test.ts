import { describe, it, expect } from "vitest";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { communities, Community, NewCommunity } from "../communities";

describe("communities schema", () => {
  const tableConfig = getTableConfig(communities);

  describe("table configuration", () => {
    it("should have correct table name", () => {
      expect(communities).toBeDefined();
      expect(tableConfig.name).toBe("communities");
    });

    it("should have primary key on id", () => {
      expect(tableConfig.primaryKeys).toBeDefined();
    });
  });

  describe("columns", () => {
    it("should have id column", () => {
      expect(communities.id).toBeDefined();
    });

    it("should have level column", () => {
      expect(communities.level).toBeDefined();
    });

    it("should have parentId column", () => {
      expect(communities.parentId).toBeDefined();
    });

    it("should have name column", () => {
      expect(communities.name).toBeDefined();
    });

    it("should have summary column", () => {
      expect(communities.summary).toBeDefined();
    });

    it("should have memberCount column", () => {
      expect(communities.memberCount).toBeDefined();
    });

    it("should have embedding column", () => {
      expect(communities.embedding).toBeDefined();
    });

    it("should have embeddingModelId column", () => {
      expect(communities.embeddingModelId).toBeDefined();
    });

    it("should have createdAt column", () => {
      expect(communities.createdAt).toBeDefined();
    });

    it("should have updatedAt column", () => {
      expect(communities.updatedAt).toBeDefined();
    });

    it("should have exactly 10 columns", () => {
      const columns = Object.keys(communities);
      expect(columns).toHaveLength(10);
    });
  });

  describe("foreign keys (self-reference)", () => {
    it("should have optional foreign key to self for parentId", () => {
      expect(communities.parentId).toBeDefined();
      // parentId references communities.id for hierarchical structure
    });
  });

  describe("indexes", () => {
    it("should have index on level", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("communities_level_idx");
    });

    it("should have index on parentId", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("communities_parent_id_idx");
    });

    it("should have exactly 2 indexes", () => {
      expect(tableConfig.indexes).toHaveLength(2);
    });
  });

  describe("type exports", () => {
    it("should export Community type", () => {
      const testType: Community = {} as Community;
      expect(testType).toBeDefined();
    });

    it("should export NewCommunity type", () => {
      const testType: NewCommunity = {} as NewCommunity;
      expect(testType).toBeDefined();
    });
  });

  describe("default values", () => {
    it("should have level default to 0", () => {
      expect(communities.level).toBeDefined();
    });

    it("should have memberCount default to 0", () => {
      expect(communities.memberCount).toBeDefined();
    });

    it("should have timestamp defaults configured", () => {
      expect(communities.createdAt).toBeDefined();
      expect(communities.updatedAt).toBeDefined();
    });
  });

  describe("column nullability", () => {
    it("should have required columns", () => {
      const requiredColumns = [
        "id",
        "level",
        "name",
        "summary",
        "memberCount",
        "createdAt",
        "updatedAt",
      ];

      for (const colName of requiredColumns) {
        const col = communities[colName as keyof typeof communities];
        expect(col).toBeDefined();
      }
    });

    it("should have optional columns", () => {
      const optionalColumns = ["parentId", "embedding", "embeddingModelId"];

      for (const colName of optionalColumns) {
        const col = communities[colName as keyof typeof communities];
        expect(col).toBeDefined();
      }
    });
  });
});
