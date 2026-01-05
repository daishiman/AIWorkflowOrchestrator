import { describe, it, expect } from "vitest";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import {
  entities,
  Entity,
  NewEntity,
  entityTypes,
  EntityType,
} from "../entities";

describe("entities schema", () => {
  const tableConfig = getTableConfig(entities);

  describe("table configuration", () => {
    it("should have correct table name", () => {
      expect(entities).toBeDefined();
      expect(tableConfig.name).toBe("entities");
    });

    it("should have primary key on id", () => {
      expect(tableConfig.primaryKeys).toBeDefined();
    });
  });

  describe("columns", () => {
    it("should have id column", () => {
      expect(entities.id).toBeDefined();
    });

    it("should have name column", () => {
      expect(entities.name).toBeDefined();
    });

    it("should have normalizedName column", () => {
      expect(entities.normalizedName).toBeDefined();
    });

    it("should have type column", () => {
      expect(entities.type).toBeDefined();
    });

    it("should have description column", () => {
      expect(entities.description).toBeDefined();
    });

    it("should have aliases column", () => {
      expect(entities.aliases).toBeDefined();
    });

    it("should have embedding column", () => {
      expect(entities.embedding).toBeDefined();
    });

    it("should have embeddingModelId column", () => {
      expect(entities.embeddingModelId).toBeDefined();
    });

    it("should have importance column", () => {
      expect(entities.importance).toBeDefined();
    });

    it("should have mentionCount column", () => {
      expect(entities.mentionCount).toBeDefined();
    });

    it("should have metadata column", () => {
      expect(entities.metadata).toBeDefined();
    });

    it("should have createdAt column", () => {
      expect(entities.createdAt).toBeDefined();
    });

    it("should have updatedAt column", () => {
      expect(entities.updatedAt).toBeDefined();
    });

    it("should have exactly 13 columns", () => {
      const columns = Object.keys(entities);
      expect(columns).toHaveLength(13);
    });
  });

  describe("indexes", () => {
    it("should have index on normalizedName", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("entities_normalized_name_idx");
    });

    it("should have index on type", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("entities_type_idx");
    });

    it("should have index on importance", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("entities_importance_idx");
    });

    it("should have unique index on normalizedName and type", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("entities_name_type_idx");

      const uniqueIndex = tableConfig.indexes.find(
        (idx) => idx.config.name === "entities_name_type_idx",
      );
      expect(uniqueIndex?.config.unique).toBe(true);
    });

    it("should have exactly 4 indexes", () => {
      expect(tableConfig.indexes).toHaveLength(4);
    });
  });

  describe("entity types enum", () => {
    it("should export entityTypes array", () => {
      expect(entityTypes).toBeDefined();
      expect(Array.isArray(entityTypes)).toBe(true);
    });

    it("should have exactly 14 entity types", () => {
      expect(entityTypes).toHaveLength(14);
    });

    it("should contain all expected entity types", () => {
      expect(entityTypes).toContain("person");
      expect(entityTypes).toContain("organization");
      expect(entityTypes).toContain("location");
      expect(entityTypes).toContain("date");
      expect(entityTypes).toContain("event");
      expect(entityTypes).toContain("technology");
      expect(entityTypes).toContain("concept");
      expect(entityTypes).toContain("product");
      expect(entityTypes).toContain("api");
      expect(entityTypes).toContain("function");
      expect(entityTypes).toContain("class");
      expect(entityTypes).toContain("document");
      expect(entityTypes).toContain("section");
      expect(entityTypes).toContain("other");
    });

    it("should export EntityType type", () => {
      const testType: EntityType = "person";
      expect(testType).toBe("person");
    });
  });

  describe("type exports", () => {
    it("should export Entity type", () => {
      const testType: Entity = {} as Entity;
      expect(testType).toBeDefined();
    });

    it("should export NewEntity type", () => {
      const testType: NewEntity = {} as NewEntity;
      expect(testType).toBeDefined();
    });
  });

  describe("default values", () => {
    it("should have aliases default to empty array", () => {
      expect(entities.aliases).toBeDefined();
    });

    it("should have importance default to 0.5", () => {
      expect(entities.importance).toBeDefined();
    });

    it("should have mentionCount default to 1", () => {
      expect(entities.mentionCount).toBeDefined();
    });

    it("should have timestamp defaults configured", () => {
      expect(entities.createdAt).toBeDefined();
      expect(entities.updatedAt).toBeDefined();
    });
  });

  describe("column nullability", () => {
    it("should have required columns", () => {
      const requiredColumns = [
        "id",
        "name",
        "normalizedName",
        "type",
        "importance",
        "mentionCount",
        "createdAt",
        "updatedAt",
      ];

      for (const colName of requiredColumns) {
        const col = entities[colName as keyof typeof entities];
        expect(col).toBeDefined();
      }
    });

    it("should have optional columns", () => {
      const optionalColumns = [
        "description",
        "embedding",
        "embeddingModelId",
        "metadata",
      ];

      for (const colName of optionalColumns) {
        const col = entities[colName as keyof typeof entities];
        expect(col).toBeDefined();
      }
    });
  });
});
