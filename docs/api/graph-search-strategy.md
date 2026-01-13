# GraphSearchStrategy API Reference

## Overview

`GraphSearchStrategy` is a search strategy that leverages Knowledge Graph for advanced search capabilities. It provides entity-based local search, community summary-based global search, and relationship-based path search.

## Class Definition

```typescript
class GraphSearchStrategy implements ISearchStrategy {
  readonly name = "graph";

  constructor(
    graphStore: IKnowledgeGraphStore,
    embeddingProvider: IEmbeddingProvider,
    communitySummarizer?: ICommunitySummarizer,
  );

  search(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions,
  ): Promise<Result<SearchResultItem[], Error>>;

  getMetrics(): StrategyMetric;
}
```

---

## Constructor

### Parameters

| Parameter           | Type                 | Required | Description                       |
| ------------------- | -------------------- | -------- | --------------------------------- |
| graphStore          | IKnowledgeGraphStore | Yes      | Knowledge Graph storage interface |
| embeddingProvider   | IEmbeddingProvider   | Yes      | Text embedding provider           |
| communitySummarizer | ICommunitySummarizer | No       | Community summary search provider |

### Example

```typescript
import { GraphSearchStrategy } from "@repo/shared/services/search/strategies/graph-search-strategy";

const strategy = new GraphSearchStrategy(
  graphStore,
  embeddingProvider,
  communitySummarizer, // optional
);
```

---

## Methods

### search()

Executes a graph-based search query.

#### Parameters

| Parameter | Type               | Required | Description       |
| --------- | ------------------ | -------- | ----------------- |
| query     | string             | Yes      | Search query text |
| limit     | number             | Yes      | Maximum results   |
| filters   | SearchFilters      | No       | Filter conditions |
| options   | GraphSearchOptions | No       | Search options    |

#### Returns

`Promise<Result<SearchResultItem[], Error>>`

#### Example

```typescript
const result = await strategy.search(
  "TypeScript type definitions",
  10,
  undefined,
  {
    queryType: "local",
  },
);

if (result.isOk()) {
  console.log(result.value); // SearchResultItem[]
}
```

---

### getMetrics()

Returns the metrics from the last search execution.

#### Returns

`StrategyMetric`

```typescript
interface StrategyMetric {
  enabled: boolean;
  resultCount: number;
  processingTime: number;
  topScore: number;
}
```

#### Example

```typescript
const metrics = strategy.getMetrics();
console.log(
  `Results: ${metrics.resultCount}, Time: ${metrics.processingTime}ms`,
);
```

---

## Types

### GraphSearchOptions

```typescript
interface GraphSearchOptions {
  queryType?: "local" | "global" | "relationship";
  entityThreshold?: number; // 0-1, default: 0.5
  communityThreshold?: number; // 0-1
  traversalDepth?: number; // 1-5, default: 3
  relationTypes?: string[];
}
```

### SearchFilters

```typescript
interface SearchFilters {
  fileIds?: string[];
  entityTypes?: string[];
  // ... other filter options
}
```

---

## Query Types

### local (default)

Entity-based search. Finds entities similar to the query and returns associated chunks.

**Score Calculation:**

```
score = entitySimilarity × 0.6 + chunkRelevance × 0.4
```

### global

Community summary-based search. Returns high-level summaries of related topics.

**Note:** Falls back to `local` search if `communitySummarizer` is not provided.

### relationship

Path-based search. Finds relationships between entities in the query.

**Score Calculation:**

```
score = (1 / (1 + distance)) × 0.5 + chunkRelevance × 0.5
```

**Fallback Behavior:**

- 0 entities found: Returns empty array
- 1 entity found: Falls back to `local` search
- 2+ entities found: Performs path search

---

## Validation

| Parameter | Constraint          | Error Message                                 |
| --------- | ------------------- | --------------------------------------------- |
| query     | 1-1000 characters   | "Query cannot be empty" or "Query exceeds..." |
| query     | Not whitespace only | "Query cannot be empty"                       |
| limit     | 1-100               | "Limit must be between 1 and 100"             |

---

## Constants

| Constant                 | Value | Description                   |
| ------------------------ | ----- | ----------------------------- |
| MAX_QUERY_LENGTH         | 1000  | Maximum query length          |
| MIN_LIMIT                | 1     | Minimum result limit          |
| MAX_LIMIT                | 100   | Maximum result limit          |
| DEFAULT_ENTITY_THRESHOLD | 0.5   | Default similarity threshold  |
| DEFAULT_TRAVERSAL_DEPTH  | 3     | Default graph traversal depth |
| MAX_TRAVERSAL_DEPTH      | 5     | Maximum traversal depth       |

---

## Integration with HybridRAGSearcher

```typescript
import { HybridRAGSearcher } from "@repo/shared/services/search/hybrid-rag-searcher";
import { KeywordSearchStrategy } from "@repo/shared/services/search/strategies/keyword-search-strategy";
import { VectorSearchStrategy } from "@repo/shared/services/search/strategies/vector-search-strategy";
import { GraphSearchStrategy } from "@repo/shared/services/search/strategies/graph-search-strategy";
import { RRFMergeStrategy } from "@repo/shared/services/search/merge/rrf-merge-strategy";

const searcher = new HybridRAGSearcher({
  strategies: [
    new KeywordSearchStrategy(fts5Engine),
    new VectorSearchStrategy(vectorStore, embeddingProvider),
    new GraphSearchStrategy(graphStore, embeddingProvider, communitySummarizer),
  ],
  mergeStrategy: new RRFMergeStrategy(),
});
```

---

## Related Documents

- [Usage Guide](../guides/graph-search-usage.md)
- [Implementation Guide](../../docs/30-workflows/graph-search-strategy/outputs/phase-12/implementation-guide.md)
