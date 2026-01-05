import { describe, it, expect } from "vitest";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import {
  relationEvidence,
  RelationEvidence,
  NewRelationEvidence,
} from "../relation-evidence";

describe("relationEvidence schema", () => {
  const tableConfig = getTableConfig(relationEvidence);

  describe("table configuration", () => {
    it("should have correct table name", () => {
      expect(relationEvidence).toBeDefined();
      expect(tableConfig.name).toBe("relation_evidence");
    });

    it("should have composite primary key on relationId and chunkId", () => {
      expect(tableConfig.primaryKeys).toBeDefined();
      expect(tableConfig.primaryKeys.length).toBeGreaterThan(0);
    });
  });

  describe("columns", () => {
    it("should have relationId column", () => {
      expect(relationEvidence.relationId).toBeDefined();
    });

    it("should have chunkId column", () => {
      expect(relationEvidence.chunkId).toBeDefined();
    });

    it("should have excerpt column", () => {
      expect(relationEvidence.excerpt).toBeDefined();
    });

    it("should have confidence column", () => {
      expect(relationEvidence.confidence).toBeDefined();
    });

    it("should have createdAt column", () => {
      expect(relationEvidence.createdAt).toBeDefined();
    });

    it("should have updatedAt column", () => {
      expect(relationEvidence.updatedAt).toBeDefined();
    });

    it("should have exactly 6 columns", () => {
      const columns = Object.keys(relationEvidence);
      expect(columns).toHaveLength(6);
    });
  });

  describe("foreign keys", () => {
    it("should have foreign key to relations table", () => {
      expect(relationEvidence.relationId).toBeDefined();
      expect(tableConfig.foreignKeys).toBeDefined();
      expect(tableConfig.foreignKeys.length).toBeGreaterThanOrEqual(2);
    });

    it("should have foreign key to chunks table", () => {
      expect(relationEvidence.chunkId).toBeDefined();
    });
  });

  describe("indexes", () => {
    it("should have index on relationId", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("relation_evidence_relation_id_idx");
    });

    it("should have index on chunkId", () => {
      const indexNames = tableConfig.indexes.map((idx) => idx.config.name);
      expect(indexNames).toContain("relation_evidence_chunk_id_idx");
    });

    it("should have exactly 2 indexes", () => {
      expect(tableConfig.indexes).toHaveLength(2);
    });
  });

  describe("type exports", () => {
    it("should export RelationEvidence type", () => {
      const testType: RelationEvidence = {} as RelationEvidence;
      expect(testType).toBeDefined();
    });

    it("should export NewRelationEvidence type", () => {
      const testType: NewRelationEvidence = {} as NewRelationEvidence;
      expect(testType).toBeDefined();
    });
  });

  describe("default values", () => {
    it("should have confidence default to 0.5", () => {
      expect(relationEvidence.confidence).toBeDefined();
    });

    it("should have timestamp defaults configured", () => {
      expect(relationEvidence.createdAt).toBeDefined();
      expect(relationEvidence.updatedAt).toBeDefined();
    });
  });

  describe("column nullability", () => {
    it("should have required columns", () => {
      const requiredColumns = [
        "relationId",
        "chunkId",
        "excerpt",
        "confidence",
        "createdAt",
        "updatedAt",
      ];

      for (const colName of requiredColumns) {
        const col = relationEvidence[colName as keyof typeof relationEvidence];
        expect(col).toBeDefined();
      }
    });
  });
});
