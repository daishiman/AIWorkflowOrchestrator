/**
 * CONV-03-05: Search Types Tests
 * 型ガード関数のテスト
 *
 * @module @repo/shared/types/rag/search/__tests__/types
 */

import { describe, it, expect } from "vitest";
import {
  isChunkResult,
  isEntityResult,
  isCommunityResult,
  type SearchResultItem,
} from "../types";

// ==================== Type Guard Tests ====================

describe("isChunkResult", () => {
  it("Given: chunk type with non-null chunkId, When: 型ガード, Then: true", () => {
    const item: SearchResultItem = {
      id: "test-1",
      type: "chunk",
      score: 0.8,
      relevance: {
        combined: 0.8,
        keyword: 0.7,
        semantic: 0.8,
        graph: 0.9,
        rerank: null,
        crag: null,
      },
      content: {
        text: "Test content",
        summary: null,
        contextBefore: null,
        contextAfter: null,
      },
      highlights: [],
      sources: {
        chunkId: "chunk-123" as any, // ChunkId branded type
        fileId: null,
        entityIds: [],
        communityId: null,
        relationIds: [],
      },
    };

    expect(isChunkResult(item)).toBe(true);
  });

  it("Given: chunk type with null chunkId, When: 型ガード, Then: false", () => {
    const item: SearchResultItem = {
      id: "test-2",
      type: "chunk",
      score: 0.8,
      relevance: {
        combined: 0.8,
        keyword: 0.7,
        semantic: 0.8,
        graph: 0.9,
        rerank: null,
        crag: null,
      },
      content: {
        text: "Test content",
        summary: null,
        contextBefore: null,
        contextAfter: null,
      },
      highlights: [],
      sources: {
        chunkId: null,
        fileId: null,
        entityIds: [],
        communityId: null,
        relationIds: [],
      },
    };

    expect(isChunkResult(item)).toBe(false);
  });

  it("Given: entity type, When: 型ガード, Then: false", () => {
    const item: SearchResultItem = {
      id: "test-3",
      type: "entity",
      score: 0.8,
      relevance: {
        combined: 0.8,
        keyword: 0.7,
        semantic: 0.8,
        graph: 0.9,
        rerank: null,
        crag: null,
      },
      content: {
        text: "Test content",
        summary: null,
        contextBefore: null,
        contextAfter: null,
      },
      highlights: [],
      sources: {
        chunkId: null,
        fileId: null,
        entityIds: ["entity-1" as any],
        communityId: null,
        relationIds: [],
      },
    };

    expect(isChunkResult(item)).toBe(false);
  });
});

describe("isEntityResult", () => {
  it("Given: entity type with non-empty entityIds, When: 型ガード, Then: true", () => {
    const item: SearchResultItem = {
      id: "test-4",
      type: "entity",
      score: 0.8,
      relevance: {
        combined: 0.8,
        keyword: 0.7,
        semantic: 0.8,
        graph: 0.9,
        rerank: null,
        crag: null,
      },
      content: {
        text: "Test content",
        summary: null,
        contextBefore: null,
        contextAfter: null,
      },
      highlights: [],
      sources: {
        chunkId: null,
        fileId: null,
        entityIds: ["entity-1" as any, "entity-2" as any],
        communityId: null,
        relationIds: [],
      },
    };

    expect(isEntityResult(item)).toBe(true);
  });

  it("Given: entity type with empty entityIds, When: 型ガード, Then: false", () => {
    const item: SearchResultItem = {
      id: "test-5",
      type: "entity",
      score: 0.8,
      relevance: {
        combined: 0.8,
        keyword: 0.7,
        semantic: 0.8,
        graph: 0.9,
        rerank: null,
        crag: null,
      },
      content: {
        text: "Test content",
        summary: null,
        contextBefore: null,
        contextAfter: null,
      },
      highlights: [],
      sources: {
        chunkId: null,
        fileId: null,
        entityIds: [],
        communityId: null,
        relationIds: [],
      },
    };

    expect(isEntityResult(item)).toBe(false);
  });

  it("Given: chunk type, When: 型ガード, Then: false", () => {
    const item: SearchResultItem = {
      id: "test-6",
      type: "chunk",
      score: 0.8,
      relevance: {
        combined: 0.8,
        keyword: 0.7,
        semantic: 0.8,
        graph: 0.9,
        rerank: null,
        crag: null,
      },
      content: {
        text: "Test content",
        summary: null,
        contextBefore: null,
        contextAfter: null,
      },
      highlights: [],
      sources: {
        chunkId: "chunk-123" as any,
        fileId: null,
        entityIds: [],
        communityId: null,
        relationIds: [],
      },
    };

    expect(isEntityResult(item)).toBe(false);
  });
});

describe("isCommunityResult", () => {
  it("Given: community type with non-null communityId, When: 型ガード, Then: true", () => {
    const item: SearchResultItem = {
      id: "test-7",
      type: "community",
      score: 0.8,
      relevance: {
        combined: 0.8,
        keyword: 0.7,
        semantic: 0.8,
        graph: 0.9,
        rerank: null,
        crag: null,
      },
      content: {
        text: "Test content",
        summary: null,
        contextBefore: null,
        contextAfter: null,
      },
      highlights: [],
      sources: {
        chunkId: null,
        fileId: null,
        entityIds: [],
        communityId: "community-123" as any,
        relationIds: [],
      },
    };

    expect(isCommunityResult(item)).toBe(true);
  });

  it("Given: community type with null communityId, When: 型ガード, Then: false", () => {
    const item: SearchResultItem = {
      id: "test-8",
      type: "community",
      score: 0.8,
      relevance: {
        combined: 0.8,
        keyword: 0.7,
        semantic: 0.8,
        graph: 0.9,
        rerank: null,
        crag: null,
      },
      content: {
        text: "Test content",
        summary: null,
        contextBefore: null,
        contextAfter: null,
      },
      highlights: [],
      sources: {
        chunkId: null,
        fileId: null,
        entityIds: [],
        communityId: null,
        relationIds: [],
      },
    };

    expect(isCommunityResult(item)).toBe(false);
  });

  it("Given: chunk type, When: 型ガード, Then: false", () => {
    const item: SearchResultItem = {
      id: "test-9",
      type: "chunk",
      score: 0.8,
      relevance: {
        combined: 0.8,
        keyword: 0.7,
        semantic: 0.8,
        graph: 0.9,
        rerank: null,
        crag: null,
      },
      content: {
        text: "Test content",
        summary: null,
        contextBefore: null,
        contextAfter: null,
      },
      highlights: [],
      sources: {
        chunkId: "chunk-123" as any,
        fileId: null,
        entityIds: [],
        communityId: null,
        relationIds: [],
      },
    };

    expect(isCommunityResult(item)).toBe(false);
  });
});
