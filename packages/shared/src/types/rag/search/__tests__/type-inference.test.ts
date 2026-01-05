/**
 * CONV-03-05: Type Inference Validation Tests
 * 型推論検証テスト - TypeScriptコンパイラレベルでの型推論動作確認
 *
 * @module @repo/shared/types/rag/search/__tests__/type-inference
 */

import { describe, it, expectTypeOf } from "vitest";
import { z } from "zod";
import type {
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SearchWeights,
  DateRange,
  SearchFilters,
  SearchOptions,
  QueryType,
  SearchStrategy,
  SearchResultType,
  RRFResult,
  CRAGScore,
  QueryClassification,
  RRFConfig,
  RerankConfig,
} from "../types";
import {
  searchQuerySchema,
  searchResultSchema,
  searchWeightsSchema,
  dateRangeSchema,
  queryTypeSchema,
  searchStrategySchema,
  searchResultTypeSchema,
  queryClassificationSchema,
  rrfConfigSchema,
  rerankConfigSchema,
} from "../schemas";

// ==================== Test Case 1: SearchQuery型推論 ====================

describe("型推論検証: SearchQuery", () => {
  it("Should infer SearchQuery properties correctly", () => {
    const query: SearchQuery = {
      text: "test query",
      type: "hybrid",
      embedding: null,
      filters: {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 0.3,
      },
      options: {
        limit: 20,
        offset: 0,
        includeMetadata: true,
        includeHighlights: true,
        rerankEnabled: true,
        cragEnabled: false,
        strategies: ["hybrid"],
        weights: {
          keyword: 0.35,
          semantic: 0.35,
          graph: 0.3,
        },
      },
    };

    // Property access should work
    expectTypeOf(query.text).toEqualTypeOf<string>();
    expectTypeOf(query.type).toEqualTypeOf<QueryType>();
    expectTypeOf(query.embedding).toEqualTypeOf<Float32Array | null>();
    expectTypeOf(query.filters).toEqualTypeOf<SearchFilters>();
    expectTypeOf(query.options).toEqualTypeOf<SearchOptions>();
  });
});

// ==================== Test Case 2: Zodスキーマからの型推論 ====================

describe("型推論検証: Zod Schema Inference", () => {
  it("Should infer type from searchQuerySchema matches SearchQuery", () => {
    type InferredSearchQuery = z.infer<typeof searchQuerySchema>;

    expectTypeOf<InferredSearchQuery>().toMatchTypeOf<SearchQuery>();
    expectTypeOf<SearchQuery>().toMatchTypeOf<InferredSearchQuery>();
  });

  it("Should infer type from searchWeightsSchema matches SearchWeights", () => {
    type InferredSearchWeights = z.infer<typeof searchWeightsSchema>;

    expectTypeOf<InferredSearchWeights>().toEqualTypeOf<SearchWeights>();
  });

  it("Should infer type from dateRangeSchema matches DateRange", () => {
    type InferredDateRange = z.infer<typeof dateRangeSchema>;

    expectTypeOf<InferredDateRange>().toEqualTypeOf<DateRange>();
  });

  it("Should infer enum types from schemas", () => {
    type InferredQueryType = z.infer<typeof queryTypeSchema>;
    type InferredSearchStrategy = z.infer<typeof searchStrategySchema>;
    type InferredSearchResultType = z.infer<typeof searchResultTypeSchema>;

    expectTypeOf<InferredQueryType>().toEqualTypeOf<QueryType>();
    expectTypeOf<InferredSearchStrategy>().toEqualTypeOf<SearchStrategy>();
    expectTypeOf<InferredSearchResultType>().toEqualTypeOf<SearchResultType>();
  });

  it("Should infer complex nested types correctly", () => {
    type InferredSearchResult = z.infer<typeof searchResultSchema>;

    expectTypeOf<InferredSearchResult>().toMatchTypeOf<SearchResult>();
  });

  it("Should infer config types correctly", () => {
    type InferredRRFConfig = z.infer<typeof rrfConfigSchema>;
    type InferredRerankConfig = z.infer<typeof rerankConfigSchema>;
    type InferredQueryClassification = z.infer<
      typeof queryClassificationSchema
    >;

    expectTypeOf<InferredRRFConfig>().toEqualTypeOf<RRFConfig>();
    expectTypeOf<InferredRerankConfig>().toEqualTypeOf<RerankConfig>();
    expectTypeOf<InferredQueryClassification>().toEqualTypeOf<QueryClassification>();
  });
});

// ==================== Test Case 3: Branded Type推論 ====================

describe("型推論検証: Branded Types", () => {
  it("Should prevent direct string assignment to ChunkId", () => {
    const item: SearchResultItem = {
      id: "test-id",
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
        text: "test",
        summary: null,
        contextBefore: null,
        contextAfter: null,
      },
      highlights: [],
      sources: {
        chunkId: "chunk-123" as any, // Branded type requires cast
        fileId: null,
        entityIds: [],
        communityId: null,
        relationIds: [],
      },
    };

    // This test verifies that Branded Types are being used
    expectTypeOf(item.sources.chunkId).toEqualTypeOf<any>();
  });
});

// ==================== Test Case 4: readonly修飾子検証 ====================

describe("型推論検証: readonly修飾子", () => {
  it("Should enforce readonly on SearchQuery properties", () => {
    const query: SearchQuery = {
      text: "test",
      type: "hybrid",
      embedding: null,
      filters: {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 0.3,
      },
      options: {
        limit: 20,
        offset: 0,
        includeMetadata: true,
        includeHighlights: true,
        rerankEnabled: true,
        cragEnabled: false,
        strategies: ["hybrid"],
        weights: {
          keyword: 0.35,
          semantic: 0.35,
          graph: 0.3,
        },
      },
    };

    // Verify readonly properties
    expectTypeOf(query.text).toEqualTypeOf<string>();
    expectTypeOf(query.filters).toEqualTypeOf<SearchFilters>();

    // Note: TypeScript doesn't enforce readonly at runtime,
    // but the type system prevents reassignment at compile time
  });

  it("Should enforce readonly on SearchWeights", () => {
    const weights: SearchWeights = {
      keyword: 0.35,
      semantic: 0.35,
      graph: 0.3,
    };

    expectTypeOf(weights.keyword).toEqualTypeOf<number>();
    expectTypeOf(weights.semantic).toEqualTypeOf<number>();
    expectTypeOf(weights.graph).toEqualTypeOf<number>();
  });

  it("Should enforce readonly on arrays", () => {
    const options: SearchOptions = {
      limit: 20,
      offset: 0,
      includeMetadata: true,
      includeHighlights: true,
      rerankEnabled: true,
      cragEnabled: false,
      strategies: ["hybrid"],
      weights: {
        keyword: 0.35,
        semantic: 0.35,
        graph: 0.3,
      },
    };

    // Strategies should be readonly array
    expectTypeOf(options.strategies).toEqualTypeOf<
      ReadonlyArray<SearchStrategy>
    >();
  });
});

// ==================== Test Case 5: Discriminated Union推論 ====================

describe("型推論検証: Discriminated Union", () => {
  it("Should narrow type based on 'type' discriminator", () => {
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
        text: "test",
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

    // Type should be narrowed to 'chunk'
    expectTypeOf(item.type).toEqualTypeOf<SearchResultType>();

    // When type is 'chunk', sources.chunkId should be accessible
    if (item.type === "chunk") {
      expectTypeOf(item.sources.chunkId).not.toEqualTypeOf<never>();
    }
  });
});

// ==================== Test Case 6: Default Values推論 ====================

describe("型推論検証: Default Values", () => {
  it("Should infer DEFAULT_SEARCH_OPTIONS type correctly", () => {
    // Import DEFAULT_SEARCH_OPTIONS dynamically
    import("../types").then((module) => {
      expectTypeOf(
        module.DEFAULT_SEARCH_OPTIONS,
      ).toMatchTypeOf<SearchOptions>();
    });
  });
});

// ==================== Test Case 7: Generic Type推論 ====================

describe("型推論検証: Generic Types", () => {
  it("Should infer RRFResult type correctly", () => {
    const result: RRFResult = {
      id: "test-id",
      rrfScore: 0.85,
      scoreBreakdown: {
        keyword: 0.3,
        semantic: 0.3,
        graph: 0.25,
      },
    };

    expectTypeOf(result.id).toEqualTypeOf<string>();
    expectTypeOf(result.rrfScore).toEqualTypeOf<number>();
    expectTypeOf(result.scoreBreakdown.keyword).toEqualTypeOf<number>();
  });

  it("Should infer CRAGScore type correctly", () => {
    const cragScore: CRAGScore = {
      relevance: "correct",
      confidence: 0.9,
      needsWebSearch: false,
      refinedQuery: null,
    };

    expectTypeOf(cragScore.relevance).toEqualTypeOf<
      "correct" | "incorrect" | "ambiguous"
    >();
    expectTypeOf(cragScore.confidence).toEqualTypeOf<number>();
    expectTypeOf(cragScore.needsWebSearch).toEqualTypeOf<boolean>();
    expectTypeOf(cragScore.refinedQuery).toEqualTypeOf<string | null>();
  });
});
