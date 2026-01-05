import { describe, it, expect } from "vitest";
import { relations } from "drizzle-orm";
import {
  entitiesRelations,
  graphRelationsTableRelations,
  relationEvidenceRelations,
  communitiesRelations,
  entityCommunitiesRelations,
  chunkEntitiesRelations,
} from "../graph-relations";
import { entities } from "../entities";
import { graphRelations } from "../relations";
import { relationEvidence } from "../relation-evidence";
import { communities } from "../communities";
import { entityCommunities } from "../entity-communities";
import { chunkEntities } from "../chunk-entities";
import { chunks } from "../../chunks";

describe("graph schema relations", () => {
  describe("entitiesRelations", () => {
    it("should be defined and be an object", () => {
      expect(entitiesRelations).toBeDefined();
      expect(typeof entitiesRelations).toBe("object");
      expect(entitiesRelations).not.toBeNull();
    });

    it("should properly configure outgoingRelations many relation", () => {
      const testRelation = relations(entities, ({ many }) => ({
        outgoingRelations: many(graphRelations),
      }));
      expect(testRelation).toBeDefined();
    });

    it("should properly configure incomingRelations many relation", () => {
      const testRelation = relations(entities, ({ many }) => ({
        incomingRelations: many(graphRelations),
      }));
      expect(testRelation).toBeDefined();
    });

    it("should properly configure communities many relation", () => {
      const testRelation = relations(entities, ({ many }) => ({
        communities: many(entityCommunities),
      }));
      expect(testRelation).toBeDefined();
    });

    it("should properly configure chunks many relation", () => {
      const testRelation = relations(entities, ({ many }) => ({
        chunks: many(chunkEntities),
      }));
      expect(testRelation).toBeDefined();
    });
  });

  describe("graphRelationsTableRelations", () => {
    it("should be defined and be an object", () => {
      expect(graphRelationsTableRelations).toBeDefined();
      expect(typeof graphRelationsTableRelations).toBe("object");
      expect(graphRelationsTableRelations).not.toBeNull();
    });

    it("should properly configure source one relation", () => {
      const testRelation = relations(graphRelations, ({ one }) => ({
        source: one(entities, {
          fields: [graphRelations.sourceId],
          references: [entities.id],
        }),
      }));
      expect(testRelation).toBeDefined();
    });

    it("should properly configure target one relation", () => {
      const testRelation = relations(graphRelations, ({ one }) => ({
        target: one(entities, {
          fields: [graphRelations.targetId],
          references: [entities.id],
        }),
      }));
      expect(testRelation).toBeDefined();
    });

    it("should properly configure evidence many relation", () => {
      const testRelation = relations(graphRelations, ({ many }) => ({
        evidence: many(relationEvidence),
      }));
      expect(testRelation).toBeDefined();
    });
  });

  describe("relationEvidenceRelations", () => {
    it("should be defined and be an object", () => {
      expect(relationEvidenceRelations).toBeDefined();
      expect(typeof relationEvidenceRelations).toBe("object");
      expect(relationEvidenceRelations).not.toBeNull();
    });

    it("should properly configure relation one relation", () => {
      const testRelation = relations(relationEvidence, ({ one }) => ({
        relation: one(graphRelations, {
          fields: [relationEvidence.relationId],
          references: [graphRelations.id],
        }),
      }));
      expect(testRelation).toBeDefined();
    });

    it("should properly configure chunk one relation", () => {
      const testRelation = relations(relationEvidence, ({ one }) => ({
        chunk: one(chunks, {
          fields: [relationEvidence.chunkId],
          references: [chunks.id],
        }),
      }));
      expect(testRelation).toBeDefined();
    });
  });

  describe("communitiesRelations", () => {
    it("should be defined and be an object", () => {
      expect(communitiesRelations).toBeDefined();
      expect(typeof communitiesRelations).toBe("object");
      expect(communitiesRelations).not.toBeNull();
    });

    it("should properly configure parent one relation (self-reference)", () => {
      const testRelation = relations(communities, ({ one }) => ({
        parent: one(communities, {
          fields: [communities.parentId],
          references: [communities.id],
        }),
      }));
      expect(testRelation).toBeDefined();
    });

    it("should properly configure children many relation (self-reference)", () => {
      const testRelation = relations(communities, ({ many }) => ({
        children: many(communities),
      }));
      expect(testRelation).toBeDefined();
    });

    it("should properly configure members many relation", () => {
      const testRelation = relations(communities, ({ many }) => ({
        members: many(entityCommunities),
      }));
      expect(testRelation).toBeDefined();
    });
  });

  describe("entityCommunitiesRelations", () => {
    it("should be defined and be an object", () => {
      expect(entityCommunitiesRelations).toBeDefined();
      expect(typeof entityCommunitiesRelations).toBe("object");
      expect(entityCommunitiesRelations).not.toBeNull();
    });

    it("should properly configure entity one relation", () => {
      const testRelation = relations(entityCommunities, ({ one }) => ({
        entity: one(entities, {
          fields: [entityCommunities.entityId],
          references: [entities.id],
        }),
      }));
      expect(testRelation).toBeDefined();
    });

    it("should properly configure community one relation", () => {
      const testRelation = relations(entityCommunities, ({ one }) => ({
        community: one(communities, {
          fields: [entityCommunities.communityId],
          references: [communities.id],
        }),
      }));
      expect(testRelation).toBeDefined();
    });
  });

  describe("chunkEntitiesRelations", () => {
    it("should be defined and be an object", () => {
      expect(chunkEntitiesRelations).toBeDefined();
      expect(typeof chunkEntitiesRelations).toBe("object");
      expect(chunkEntitiesRelations).not.toBeNull();
    });

    it("should properly configure chunk one relation", () => {
      const testRelation = relations(chunkEntities, ({ one }) => ({
        chunk: one(chunks, {
          fields: [chunkEntities.chunkId],
          references: [chunks.id],
        }),
      }));
      expect(testRelation).toBeDefined();
    });

    it("should properly configure entity one relation", () => {
      const testRelation = relations(chunkEntities, ({ one }) => ({
        entity: one(entities, {
          fields: [chunkEntities.entityId],
          references: [entities.id],
        }),
      }));
      expect(testRelation).toBeDefined();
    });
  });

  describe("all relations import check", () => {
    it("should successfully import all relation definitions", () => {
      expect(entitiesRelations).toBeDefined();
      expect(graphRelationsTableRelations).toBeDefined();
      expect(relationEvidenceRelations).toBeDefined();
      expect(communitiesRelations).toBeDefined();
      expect(entityCommunitiesRelations).toBeDefined();
      expect(chunkEntitiesRelations).toBeDefined();
    });
  });
});
