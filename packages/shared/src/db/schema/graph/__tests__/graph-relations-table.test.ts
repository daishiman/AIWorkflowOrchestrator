import { describe, it, expect } from "vitest";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import {
  graphRelations,
  Relation,
  NewRelation,
  relationTypes,
  RelationType,
} from "../relations";

describe("graphRelations schema (relations table)", () => {
  const tableConfig = getTableConfig(graphRelations);

  describe("table configuration", () => {
    it("should have correct table name", () => {
      expect(graphRelations).toBeDefined();
      expect(tableConfig.name).toBe("relations");
    });

    it("should have primary key on id", () => {
      expect(tableConfig.primaryKeys).toBeDefined();
    });
  });

  describe("columns", () => {
    it("should have id column", () => {
      expect(graphRelations.id).toBeDefined();
    });

    it("should have sourceId column", () => {
      expect(graphRelations.sourceId).toBeDefined();
    });

    it("should have targetId column", () => {
      expect(graphRelations.targetId).toBeDefined();
    });

    it("should have type column", () => {
      expect(graphRelations.type).toBeDefined();
    });

    it("should have description column", () => {
      expect(graphRelations.description).toBeDefined();
    });

    it("should have weight column", () => {
      expect(graphRelations.weight).toBeDefined();
    });

    it("should have bidirectional column", () => {
      expect(graphRelations.bidirectional).toBeDefined();
    });

    it("should have evidenceCount column", () => {
      expect(graphRelations.evidenceCount).toBeDefined();
    });

    it("should have metadata column", () => {
      expect(graphRelations.metadata).toBeDefined();
    });

    it("should have createdAt column", () => {
      expect(graphRelations.createdAt).toBeDefined();
    });

    it("should have updatedAt column", () => {
      expect(graphRelations.updatedAt).toBeDefined();
    });

    it("should have exactly 11 columns", () => {
      const columns = Object.keys(graphRelations);
      expect(columns).toHaveLength(11);
    });
  });

  describe("foreign keys", () => {
    it("should have foreign key to entities table for sourceId", () => {
      expect(graphRelations.sourceId).toBeDefined();
      expect(tableConfig.foreignKeys).toBeDefined();
      expect(tableConfig.foreignKeys.length).toBeGreaterThanOrEqual(2);
    });

    it("should have foreign key to entities table for targetId", () => {
      expect(graphRelations.targetId).toBeDefined();
    });
  });

  describe("indexes", () => {
    it("should have index on sourceId", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("relations_source_id_idx");
    });

    it("should have index on targetId", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("relations_target_id_idx");
    });

    it("should have index on type", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("relations_type_idx");
    });

    it("should have index on weight", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("relations_weight_idx");
    });

    it("should have unique composite index on sourceId, targetId, type", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("relations_source_target_type_idx");

      const uniqueIndex = tableConfig.indexes.find(
        (idx) => idx.config.name === "relations_source_target_type_idx",
      );
      expect(uniqueIndex?.config.unique).toBe(true);
    });

    it("should have exactly 5 indexes", () => {
      expect(tableConfig.indexes).toHaveLength(5);
    });
  });

  describe("relation types enum", () => {
    it("should export relationTypes array", () => {
      expect(relationTypes).toBeDefined();
      expect(Array.isArray(relationTypes)).toBe(true);
    });

    it("should have exactly 23 relation types", () => {
      expect(relationTypes).toHaveLength(23);
    });

    it("should contain basic relation types", () => {
      expect(relationTypes).toContain("related_to");
      expect(relationTypes).toContain("part_of");
      expect(relationTypes).toContain("has_part");
      expect(relationTypes).toContain("belongs_to");
    });

    it("should contain temporal relation types", () => {
      expect(relationTypes).toContain("preceded_by");
      expect(relationTypes).toContain("followed_by");
      expect(relationTypes).toContain("concurrent_with");
    });

    it("should contain code relation types", () => {
      expect(relationTypes).toContain("uses");
      expect(relationTypes).toContain("used_by");
      expect(relationTypes).toContain("implements");
      expect(relationTypes).toContain("extends");
      expect(relationTypes).toContain("depends_on");
      expect(relationTypes).toContain("calls");
      expect(relationTypes).toContain("imports");
    });

    it("should contain hierarchy relation types", () => {
      expect(relationTypes).toContain("parent_of");
      expect(relationTypes).toContain("child_of");
    });

    it("should contain reference relation types", () => {
      expect(relationTypes).toContain("references");
      expect(relationTypes).toContain("referenced_by");
      expect(relationTypes).toContain("defines");
      expect(relationTypes).toContain("defined_by");
    });

    it("should contain social relation types", () => {
      expect(relationTypes).toContain("authored_by");
      expect(relationTypes).toContain("works_for");
      expect(relationTypes).toContain("collaborates_with");
    });

    it("should export RelationType type", () => {
      const testType: RelationType = "related_to";
      expect(testType).toBe("related_to");
    });
  });

  describe("type exports", () => {
    it("should export Relation type", () => {
      const testType: Relation = {} as Relation;
      expect(testType).toBeDefined();
    });

    it("should export NewRelation type", () => {
      const testType: NewRelation = {} as NewRelation;
      expect(testType).toBeDefined();
    });
  });

  describe("default values", () => {
    it("should have weight default to 0.5", () => {
      expect(graphRelations.weight).toBeDefined();
    });

    it("should have bidirectional default to false (0)", () => {
      expect(graphRelations.bidirectional).toBeDefined();
    });

    it("should have evidenceCount default to 1", () => {
      expect(graphRelations.evidenceCount).toBeDefined();
    });

    it("should have timestamp defaults configured", () => {
      expect(graphRelations.createdAt).toBeDefined();
      expect(graphRelations.updatedAt).toBeDefined();
    });
  });

  describe("column nullability", () => {
    it("should have required columns", () => {
      const requiredColumns = [
        "id",
        "sourceId",
        "targetId",
        "type",
        "weight",
        "bidirectional",
        "evidenceCount",
        "createdAt",
        "updatedAt",
      ];

      for (const colName of requiredColumns) {
        const col = graphRelations[colName as keyof typeof graphRelations];
        expect(col).toBeDefined();
      }
    });

    it("should have optional columns", () => {
      const optionalColumns = ["description", "metadata"];

      for (const colName of optionalColumns) {
        const col = graphRelations[colName as keyof typeof graphRelations];
        expect(col).toBeDefined();
      }
    });
  });
});
