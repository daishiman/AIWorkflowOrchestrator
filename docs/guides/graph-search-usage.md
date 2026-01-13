# GraphSearchStrategy Usage Guide

## Introduction

GraphSearchStrategy is the third search strategy in the HybridRAG system, providing Knowledge Graph-based search capabilities alongside KeywordSearchStrategy (FTS5) and VectorSearchStrategy (DiskANN).

---

## Quick Start

### Basic Setup

```typescript
import { GraphSearchStrategy } from "@repo/shared/services/search/strategies/graph-search-strategy";

// Create the strategy with required dependencies
const strategy = new GraphSearchStrategy(
  graphStore, // IKnowledgeGraphStore implementation
  embeddingProvider, // IEmbeddingProvider implementation
  communitySummarizer, // Optional: ICommunitySummarizer implementation
);

// Execute a search
const result = await strategy.search("TypeScript type definitions", 10);

if (result.isOk()) {
  for (const item of result.value) {
    console.log(`${item.content.text} (score: ${item.score})`);
  }
}
```

---

## Query Types

GraphSearchStrategy supports three query types, each optimized for different search scenarios.

### 1. Local Search (default)

Use for specific topic queries that target individual entities.

**Best for:**

- Detailed information about a specific concept
- API references and definitions
- Technical documentation lookup

**Example queries:**

- "TypeScript interface definition"
- "React useEffect hook"
- "Database connection pooling"

```typescript
const result = await strategy.search(
  "TypeScript interface definition",
  10,
  undefined,
  { queryType: "local" },
);
```

### 2. Global Search

Use for high-level, overview queries that span multiple topics.

**Best for:**

- Project architecture overviews
- System design summaries
- Cross-cutting concerns

**Example queries:**

- "Project overall architecture"
- "Main system components"
- "Security design principles"

```typescript
const result = await strategy.search(
  "Project overall architecture",
  10,
  undefined,
  { queryType: "global" },
);
```

**Note:** Requires `communitySummarizer` to be provided. Falls back to local search if not available.

### 3. Relationship Search

Use for queries about connections between multiple concepts.

**Best for:**

- Understanding how components interact
- Tracing data flow between services
- Finding dependencies between modules

**Example queries:**

- "UserService and Database relationship"
- "API endpoint and data model connection"
- "Authentication flow between frontend and backend"

```typescript
const result = await strategy.search(
  "UserService and Database relationship",
  10,
  undefined,
  { queryType: "relationship" },
);
```

---

## Configuration Options

### Entity Threshold

Controls the minimum similarity score for entity matching.

```typescript
// Higher threshold = more precise matches
const result = await strategy.search("query", 10, undefined, {
  entityThreshold: 0.7, // default: 0.5
});
```

| Value | Effect                               |
| ----- | ------------------------------------ |
| 0.3   | More results, lower precision        |
| 0.5   | Balanced (default)                   |
| 0.7   | Fewer results, higher precision      |
| 0.9   | Very strict, only near-exact matches |

### Traversal Depth

Controls how many relationship hops to explore in path/relationship searches.

```typescript
const result = await strategy.search("query", 10, undefined, {
  queryType: "relationship",
  traversalDepth: 4, // default: 3, max: 5
});
```

| Depth | Coverage         | Performance |
| ----- | ---------------- | ----------- |
| 1     | Direct relations | Fastest     |
| 3     | Extended network | Balanced    |
| 5     | Full exploration | Slower      |

### Relation Type Filtering

Limit search to specific relationship types.

```typescript
const result = await strategy.search("query", 10, undefined, {
  queryType: "relationship",
  relationTypes: ["DEPENDS_ON", "USES", "EXTENDS"],
});
```

---

## Integration with HybridRAGSearcher

GraphSearchStrategy is designed to work as part of the HybridRAGSearcher multi-strategy system.

### Complete Setup

```typescript
import { HybridRAGSearcher } from "@repo/shared/services/search/hybrid-rag-searcher";
import { KeywordSearchStrategy } from "@repo/shared/services/search/strategies/keyword-search-strategy";
import { VectorSearchStrategy } from "@repo/shared/services/search/strategies/vector-search-strategy";
import { GraphSearchStrategy } from "@repo/shared/services/search/strategies/graph-search-strategy";
import { RRFMergeStrategy } from "@repo/shared/services/search/merge/rrf-merge-strategy";

// Initialize all three strategies
const keywordStrategy = new KeywordSearchStrategy(fts5Engine);
const vectorStrategy = new VectorSearchStrategy(vectorStore, embeddingProvider);
const graphStrategy = new GraphSearchStrategy(
  graphStore,
  embeddingProvider,
  communitySummarizer,
);

// Create the hybrid searcher
const searcher = new HybridRAGSearcher({
  strategies: [keywordStrategy, vectorStrategy, graphStrategy],
  mergeStrategy: new RRFMergeStrategy(),
});

// Search - all three strategies are executed and results merged
const result = await searcher.search("project management best practices");
```

### Strategy Weights

Each strategy contributes to the final score through RRF (Reciprocal Rank Fusion):

| Strategy | Strength                | Best Queries                 |
| -------- | ----------------------- | ---------------------------- |
| Keyword  | Exact term matching     | Code symbols, error messages |
| Vector   | Semantic similarity     | Natural language questions   |
| Graph    | Relationships & context | Multi-concept queries        |

---

## Filtering Results

### Filter by File IDs

```typescript
const result = await strategy.search("query", 10, {
  fileIds: ["file-001", "file-002"],
});
```

### Filter by Entity Types

```typescript
const result = await strategy.search("query", 10, {
  entityTypes: ["class", "function", "interface"],
});
```

---

## Error Handling

GraphSearchStrategy returns `Result<SearchResultItem[], Error>` for type-safe error handling.

```typescript
const result = await strategy.search("query", 10);

if (result.isErr()) {
  console.error("Search failed:", result.error.message);
  // Handle specific errors
  if (result.error.message.includes("Query cannot be empty")) {
    // Handle empty query
  }
  return;
}

// Safe to access result.value
const items = result.value;
```

### Common Errors

| Error Message                                     | Cause                     | Solution                |
| ------------------------------------------------- | ------------------------- | ----------------------- |
| "Query cannot be empty"                           | Empty or whitespace query | Provide non-empty query |
| "Query exceeds maximum length of 1000 characters" | Query too long            | Shorten query           |
| "Limit must be between 1 and 100"                 | Invalid limit value       | Use limit 1-100         |
| "Failed to generate embedding: ..."               | Embedding provider error  | Check provider status   |

---

## Monitoring Performance

### Using Metrics

```typescript
// After search execution
const metrics = strategy.getMetrics();

console.log({
  enabled: metrics.enabled,
  resultCount: metrics.resultCount,
  processingTime: `${metrics.processingTime.toFixed(2)}ms`,
  topScore: metrics.topScore,
});
```

### Performance Guidelines

| Metric         | Expected Range | Action if Exceeded      |
| -------------- | -------------- | ----------------------- |
| processingTime | < 200ms        | Check graph store index |
| resultCount    | > 0            | Adjust threshold/depth  |
| topScore       | > 0.5          | Refine query terms      |

---

## Best Practices

### 1. Choose the Right Query Type

```typescript
// Specific technical question → local
await strategy.search("React useState hook usage", 10, undefined, {
  queryType: "local",
});

// High-level overview → global
await strategy.search("System architecture overview", 10, undefined, {
  queryType: "global",
});

// Multi-concept relationship → relationship
await strategy.search(
  "How UserService connects to AuthProvider",
  10,
  undefined,
  {
    queryType: "relationship",
  },
);
```

### 2. Adjust Threshold Based on Query Precision Needs

```typescript
// Exploratory search (more results)
{
  entityThreshold: 0.3;
}

// Focused search (fewer, more relevant results)
{
  entityThreshold: 0.7;
}
```

### 3. Use Filters for Large Knowledge Graphs

```typescript
// Limit to specific modules
const result = await strategy.search("authentication", 10, {
  fileIds: authModuleFileIds,
  entityTypes: ["class", "interface"],
});
```

---

## Related Documents

- [API Reference](../api/graph-search-strategy.md)
- [Implementation Guide](../../docs/30-workflows/graph-search-strategy/outputs/phase-12/implementation-guide.md)
