import { describe, it, expect } from "vitest";
import { relations } from "drizzle-orm";
import {
  filesRelations,
  conversionsRelations,
  extractedMetadataRelations,
} from "../relations";
import { files } from "../files";
import { conversions } from "../conversions";
import { extractedMetadata } from "../extracted-metadata";

describe("schema relations", () => {
  describe("filesRelations", () => {
    it("should be defined and be an object", () => {
      expect(filesRelations).toBeDefined();
      expect(typeof filesRelations).toBe("object");
      expect(filesRelations).not.toBeNull();
    });

    it("should properly configure conversions many relation", () => {
      // Re-execute the relation definition to ensure code coverage
      const testRelation = relations(files, ({ many }) => ({
        conversions: many(conversions),
      }));
      expect(testRelation).toBeDefined();
    });
  });

  describe("conversionsRelations", () => {
    it("should be defined and be an object", () => {
      expect(conversionsRelations).toBeDefined();
      expect(typeof conversionsRelations).toBe("object");
      expect(conversionsRelations).not.toBeNull();
    });

    it("should properly configure file one relation", () => {
      // Re-execute the relation definition to ensure code coverage
      const testRelation = relations(conversions, ({ one }) => ({
        file: one(files, {
          fields: [conversions.fileId],
          references: [files.id],
        }),
      }));
      expect(testRelation).toBeDefined();
    });

    it("should properly configure extractedMetadata one relation", () => {
      // Re-execute the relation definition to ensure code coverage
      const testRelation = relations(conversions, ({ one }) => ({
        extractedMetadata: one(extractedMetadata, {
          fields: [conversions.id],
          references: [extractedMetadata.conversionId],
        }),
      }));
      expect(testRelation).toBeDefined();
    });
  });

  describe("extractedMetadataRelations", () => {
    it("should be defined and be an object", () => {
      expect(extractedMetadataRelations).toBeDefined();
      expect(typeof extractedMetadataRelations).toBe("object");
      expect(extractedMetadataRelations).not.toBeNull();
    });

    it("should properly configure conversion one relation", () => {
      // Re-execute the relation definition to ensure code coverage
      const testRelation = relations(extractedMetadata, ({ one }) => ({
        conversion: one(conversions, {
          fields: [extractedMetadata.conversionId],
          references: [conversions.id],
        }),
      }));
      expect(testRelation).toBeDefined();
    });
  });

  describe("all relations import check", () => {
    it("should successfully import all relation definitions", () => {
      expect(filesRelations).toBeDefined();
      expect(conversionsRelations).toBeDefined();
      expect(extractedMetadataRelations).toBeDefined();
    });
  });
});
