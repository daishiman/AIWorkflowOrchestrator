import { describe, it, expect } from "vitest";
import * as graphModule from "../index";

describe("graph schema barrel export", () => {
  describe("table exports", () => {
    it("should export entities table", () => {
      expect(graphModule.entities).toBeDefined();
    });

    it("should export graphRelations table", () => {
      expect(graphModule.graphRelations).toBeDefined();
    });

    it("should export relationEvidence table", () => {
      expect(graphModule.relationEvidence).toBeDefined();
    });

    it("should export communities table", () => {
      expect(graphModule.communities).toBeDefined();
    });

    it("should export entityCommunities table", () => {
      expect(graphModule.entityCommunities).toBeDefined();
    });

    it("should export chunkEntities table", () => {
      expect(graphModule.chunkEntities).toBeDefined();
    });
  });

  describe("type exports", () => {
    it("should export Entity type", () => {
      const testType: graphModule.Entity = {} as graphModule.Entity;
      expect(testType).toBeDefined();
    });

    it("should export NewEntity type", () => {
      const testType: graphModule.NewEntity = {} as graphModule.NewEntity;
      expect(testType).toBeDefined();
    });

    it("should export Relation type", () => {
      const testType: graphModule.Relation = {} as graphModule.Relation;
      expect(testType).toBeDefined();
    });

    it("should export NewRelation type", () => {
      const testType: graphModule.NewRelation = {} as graphModule.NewRelation;
      expect(testType).toBeDefined();
    });

    it("should export RelationEvidence type", () => {
      const testType: graphModule.RelationEvidence =
        {} as graphModule.RelationEvidence;
      expect(testType).toBeDefined();
    });

    it("should export NewRelationEvidence type", () => {
      const testType: graphModule.NewRelationEvidence =
        {} as graphModule.NewRelationEvidence;
      expect(testType).toBeDefined();
    });

    it("should export Community type", () => {
      const testType: graphModule.Community = {} as graphModule.Community;
      expect(testType).toBeDefined();
    });

    it("should export NewCommunity type", () => {
      const testType: graphModule.NewCommunity = {} as graphModule.NewCommunity;
      expect(testType).toBeDefined();
    });

    it("should export EntityCommunity type", () => {
      const testType: graphModule.EntityCommunity =
        {} as graphModule.EntityCommunity;
      expect(testType).toBeDefined();
    });

    it("should export NewEntityCommunity type", () => {
      const testType: graphModule.NewEntityCommunity =
        {} as graphModule.NewEntityCommunity;
      expect(testType).toBeDefined();
    });

    it("should export ChunkEntity type", () => {
      const testType: graphModule.ChunkEntity = {} as graphModule.ChunkEntity;
      expect(testType).toBeDefined();
    });

    it("should export NewChunkEntity type", () => {
      const testType: graphModule.NewChunkEntity =
        {} as graphModule.NewChunkEntity;
      expect(testType).toBeDefined();
    });
  });

  describe("enum exports", () => {
    it("should export entityTypes array", () => {
      expect(graphModule.entityTypes).toBeDefined();
      expect(Array.isArray(graphModule.entityTypes)).toBe(true);
    });

    it("should export relationTypes array", () => {
      expect(graphModule.relationTypes).toBeDefined();
      expect(Array.isArray(graphModule.relationTypes)).toBe(true);
    });

    it("should export EntityType type", () => {
      const testType: graphModule.EntityType = "person";
      expect(testType).toBe("person");
    });

    it("should export RelationType type", () => {
      const testType: graphModule.RelationType = "related_to";
      expect(testType).toBe("related_to");
    });
  });

  describe("interface exports", () => {
    it("should export EntityPosition interface", () => {
      const testType: graphModule.EntityPosition = {
        startChar: 0,
        endChar: 10,
        surfaceForm: "test",
      };
      expect(testType).toBeDefined();
    });
  });

  describe("relation exports", () => {
    it("should export entitiesRelations", () => {
      expect(graphModule.entitiesRelations).toBeDefined();
    });

    it("should export graphRelationsTableRelations", () => {
      expect(graphModule.graphRelationsTableRelations).toBeDefined();
    });

    it("should export relationEvidenceRelations", () => {
      expect(graphModule.relationEvidenceRelations).toBeDefined();
    });

    it("should export communitiesRelations", () => {
      expect(graphModule.communitiesRelations).toBeDefined();
    });

    it("should export entityCommunitiesRelations", () => {
      expect(graphModule.entityCommunitiesRelations).toBeDefined();
    });

    it("should export chunkEntitiesRelations", () => {
      expect(graphModule.chunkEntitiesRelations).toBeDefined();
    });
  });
});
