# CONV-03-05: Zodスキーマ設計書

**バージョン**: 1.0.0
**作成日**: 2025-12-18
**最終更新**: 2025-12-18
**作成者**: Schema Definition Agent
**前提ドキュメント**: task-step02-type-design.md

---

## 1. 概要

### 1.1 目的

本ドキュメントは、HybridRAG検索エンジンの検索クエリ・結果スキーマに関するZodスキーマを設計する。
ランタイムバリデーション、型推論、カスタムバリデーションルールを定義し、実装の基準とする。

### 1.2 設計原則

| 原則                     | 説明                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| **Runtime Safety**       | ランタイムでの型安全性を保証                                         |
| **Type Inference**       | z.inferによる型推論を活用し、型とスキーマの一貫性を保つ              |
| **User-Friendly Errors** | 日本語エラーメッセージで、ユーザーフレンドリーなバリデーションを実現 |
| **Performance**          | 複雑なrefineバリデーションを最小限に留め、パフォーマンスを重視       |

---

## 2. Zodスキーマ定義

### 2.1 列挙型スキーマ

#### 2.1.1 queryTypeSchema

```typescript
import { z } from "zod";

export const queryTypeSchema = z.enum(
  ["local", "global", "relationship", "hybrid"],
  {
    errorMap: () => ({
      message:
        "クエリタイプは local, global, relationship, hybrid のいずれかである必要があります",
    }),
  },
);

export type QueryType = z.infer<typeof queryTypeSchema>;
```

#### 2.1.2 searchStrategySchema

```typescript
export const searchStrategySchema = z.enum(
  ["keyword", "semantic", "graph", "hybrid"],
  {
    errorMap: () => ({
      message:
        "検索戦略は keyword, semantic, graph, hybrid のいずれかである必要があります",
    }),
  },
);

export type SearchStrategy = z.infer<typeof searchStrategySchema>;
```

#### 2.1.3 searchResultTypeSchema

```typescript
export const searchResultTypeSchema = z.enum(["chunk", "entity", "community"], {
  errorMap: () => ({
    message:
      "結果タイプは chunk, entity, community のいずれかである必要があります",
  }),
});

export type SearchResultType = z.infer<typeof searchResultTypeSchema>;
```

---

### 2.2 検索クエリ関連スキーマ

#### 2.2.1 dateRangeSchema

```typescript
export const dateRangeSchema = z
  .object({
    start: z.date().nullable(),
    end: z.date().nullable(),
  })
  .refine(
    (data) => {
      if (data.start !== null && data.end !== null) {
        return data.start <= data.end;
      }
      return true;
    },
    { message: "開始日は終了日以前である必要があります" },
  );

export type DateRange = z.infer<typeof dateRangeSchema>;
```

#### 2.2.2 searchWeightsSchema

```typescript
export const searchWeightsSchema = z
  .object({
    keyword: z.number().min(0).max(1),
    semantic: z.number().min(0).max(1),
    graph: z.number().min(0).max(1),
  })
  .refine(
    (weights) => {
      const sum = weights.keyword + weights.semantic + weights.graph;
      return Math.abs(sum - 1.0) < 0.01;
    },
    { message: "検索重みの合計は1.0である必要があります" },
  );

export type SearchWeights = z.infer<typeof searchWeightsSchema>;
```

#### 2.2.3 searchFiltersSchema

```typescript
import { fileIdSchema } from "../branded-schemas";

export const searchFiltersSchema = z.object({
  fileIds: z.array(fileIdSchema).nullable(),
  entityTypes: z.array(z.string()).nullable(),
  dateRange: dateRangeSchema.nullable(),
  minRelevance: z.number().min(0).max(1).default(0.3),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
```

#### 2.2.4 searchOptionsSchema

```typescript
export const searchOptionsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  includeMetadata: z.boolean().default(true),
  includeHighlights: z.boolean().default(true),
  rerankEnabled: z.boolean().default(true),
  cragEnabled: z.boolean().default(false),
  strategies: z.array(searchStrategySchema).min(1).default(["hybrid"]),
  weights: searchWeightsSchema.default({
    keyword: 0.35,
    semantic: 0.35,
    graph: 0.3,
  }),
});

export type SearchOptions = z.infer<typeof searchOptionsSchema>;
```

#### 2.2.5 searchQuerySchema

```typescript
export const searchQuerySchema = z.object({
  text: z.string().min(1).max(1000),
  type: queryTypeSchema,
  embedding: z.instanceof(Float32Array).nullable(),
  filters: searchFiltersSchema,
  options: searchOptionsSchema,
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
```

#### 2.2.6 queryClassificationSchema

```typescript
export const queryClassificationSchema = z.object({
  originalQuery: z.string(),
  type: queryTypeSchema,
  confidence: z.number().min(0).max(1),
  extractedEntities: z.array(z.string()),
  suggestedWeights: searchWeightsSchema,
  expandedQueries: z.array(z.string()),
});

export type QueryClassification = z.infer<typeof queryClassificationSchema>;
```

---

### 2.3 検索結果関連スキーマ

#### 2.3.1 highlightOffsetSchema

```typescript
export const highlightOffsetSchema = z
  .object({
    start: z.number().int().min(0),
    end: z.number().int().min(0),
  })
  .refine((data) => data.start < data.end, {
    message: "開始位置は終了位置より小さい必要があります",
  });

export type HighlightOffset = z.infer<typeof highlightOffsetSchema>;
```

#### 2.3.2 highlightSchema

```typescript
export const highlightSchema = z.object({
  field: z.string(),
  fragment: z.string(),
  offsets: z.array(highlightOffsetSchema),
});

export type Highlight = z.infer<typeof highlightSchema>;
```

#### 2.3.3 searchResultContentSchema

```typescript
export const searchResultContentSchema = z.object({
  text: z.string(),
  summary: z.string().nullable(),
  contextBefore: z.string().nullable(),
  contextAfter: z.string().nullable(),
});

export type SearchResultContent = z.infer<typeof searchResultContentSchema>;
```

#### 2.3.4 cragScoreSchema

```typescript
export const cragScoreSchema = z.object({
  relevance: z.enum(["correct", "incorrect", "ambiguous"]),
  confidence: z.number().min(0).max(1),
  needsWebSearch: z.boolean(),
  refinedQuery: z.string().nullable(),
});

export type CRAGScore = z.infer<typeof cragScoreSchema>;
```

#### 2.3.5 relevanceScoreSchema

```typescript
export const relevanceScoreSchema = z.object({
  combined: z.number().min(0).max(1),
  keyword: z.number().min(0).max(1),
  semantic: z.number().min(0).max(1),
  graph: z.number().min(0).max(1),
  rerank: z.number().min(0).max(1).nullable(),
  crag: cragScoreSchema.nullable(),
});

export type RelevanceScore = z.infer<typeof relevanceScoreSchema>;
```

#### 2.3.6 searchResultSourcesSchema

```typescript
import {
  chunkIdSchema,
  fileIdSchema,
  entityIdSchema,
  communityIdSchema,
} from "../branded-schemas";

export const searchResultSourcesSchema = z.object({
  chunkId: chunkIdSchema.nullable(),
  fileId: fileIdSchema.nullable(),
  entityIds: z.array(entityIdSchema),
  communityId: communityIdSchema.nullable(),
  relationIds: z.array(z.string()),
});

export type SearchResultSources = z.infer<typeof searchResultSourcesSchema>;
```

#### 2.3.7 searchResultItemSchema

```typescript
export const searchResultItemSchema = z.object({
  id: z.string(),
  type: searchResultTypeSchema,
  score: z.number().min(0).max(1),
  relevance: relevanceScoreSchema,
  content: searchResultContentSchema,
  highlights: z.array(highlightSchema),
  sources: searchResultSourcesSchema,
});

export type SearchResultItem = z.infer<typeof searchResultItemSchema>;
```

#### 2.3.8 strategyMetricSchema

```typescript
export const strategyMetricSchema = z.object({
  enabled: z.boolean(),
  resultCount: z.number().int().min(0),
  processingTime: z.number().min(0),
  topScore: z.number().min(0).max(1),
});

export type StrategyMetric = z.infer<typeof strategyMetricSchema>;
```

#### 2.3.9 searchStrategyMetricsSchema

```typescript
export const searchStrategyMetricsSchema = z.object({
  keyword: strategyMetricSchema,
  semantic: strategyMetricSchema,
  graph: strategyMetricSchema,
});

export type SearchStrategyMetrics = z.infer<typeof searchStrategyMetricsSchema>;
```

#### 2.3.10 searchResultSchema

```typescript
export const searchResultSchema = z.object({
  query: searchQuerySchema,
  results: z.array(searchResultItemSchema),
  totalCount: z.number().int().min(0),
  processingTime: z.number().min(0),
  strategies: searchStrategyMetricsSchema,
});

export type SearchResult = z.infer<typeof searchResultSchema>;
```

---

### 2.4 設定関連スキーマ

#### 2.4.1 rrfConfigSchema

```typescript
export const rrfConfigSchema = z.object({
  k: z.number().int().min(1).max(1000).default(60),
  normalizeScores: z.boolean().default(true),
});

export type RRFConfig = z.infer<typeof rrfConfigSchema>;
```

#### 2.4.2 rerankConfigSchema

```typescript
export const rerankConfigSchema = z.object({
  enabled: z.boolean().default(true),
  model: z.string().default("cross-encoder/ms-marco-MiniLM-L-6-v2"),
  topK: z.number().int().min(1).max(100).default(50),
  batchSize: z.number().int().min(1).max(32).default(16),
});

export type RerankConfig = z.infer<typeof rerankConfigSchema>;
```

---

## 3. グローバルエラーマップ

```typescript
import { z } from 'zod';

/**
 * グローバルエラーマップ（日本語エラーメッセージ）
 */
export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'string') {
      return { message: '文字列である必要があります' };
    }
    if (issue.expected === 'number') {
      return { message: '数値である必要があります' };
    }
    if (issue.expected === 'boolean') {
      return { message: 真偽値である必要があります' };
    }
  }
  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === 'string') {
      return { message: `${issue.minimum}文字以上である必要があります` };
    }
    if (issue.type === 'number') {
      return { message: `${issue.minimum}以上である必要があります` };
    }
    if (issue.type === 'array') {
      return { message: `${issue.minimum}個以上の要素が必要です` };
    }
  }
  if (issue.code === z.ZodIssueCode.too_big) {
    if (issue.type === 'string') {
      return { message: `${issue.maximum}文字以下である必要があります` };
    }
    if (issue.type === 'number') {
      return { message: `${issue.maximum}以下である必要があります` };
    }
    if (issue.type === 'array') {
      return { message: `${issue.maximum}個以下の要素である必要があります` };
    }
  }
  return { message: ctx.defaultError };
};

// グローバルエラーマップの設定
z.setErrorMap(customErrorMap);
```

---

## 4. カスタムバリデーションルール

### 4.1 searchWeightsSchema のrefine

```typescript
/**
 * 検索重みの合計が1.0であることを検証
 *
 * 許容誤差: 0.01（浮動小数点誤差を考慮）
 */
searchWeightsSchema.refine(
  (weights) => {
    const sum = weights.keyword + weights.semantic + weights.graph;
    return Math.abs(sum - 1.0) < 0.01;
  },
  { message: "検索重みの合計は1.0である必要があります" },
);
```

### 4.2 dateRangeSchema のrefine

```typescript
/**
 * 開始日が終了日以前であることを検証
 */
dateRangeSchema.refine(
  (data) => {
    if (data.start !== null && data.end !== null) {
      return data.start <= data.end;
    }
    return true; // 片方がnullの場合は開放区間として許可
  },
  { message: "開始日は終了日以前である必要があります" },
);
```

### 4.3 highlightOffsetSchema のrefine

```typescript
/**
 * 開始位置が終了位置より小さいことを検証
 */
highlightOffsetSchema.refine((data) => data.start < data.end, {
  message: "開始位置は終了位置より小さい必要があります",
});
```

---

## 5. スキーマバージョニング戦略

### 5.1 バージョニング方式

セマンティックバージョニング（v1.0.0形式）を採用する。

| バージョン     | 意味                                               |
| -------------- | -------------------------------------------------- |
| Major（1.x.x） | 破壊的変更（既存スキーマとの互換性なし）           |
| Minor（x.1.x） | 後方互換性のある機能追加（optional追加、enum拡張） |
| Patch（x.x.1） | バグ修正、エラーメッセージ改善                     |

### 5.2 後方互換性ポリシー

| 変更内容                | 互換性 | バージョン  |
| ----------------------- | ------ | ----------- |
| optional プロパティ追加 | 互換   | Minor       |
| enum値追加              | 互換   | Minor       |
| 必須プロパティ追加      | 非互換 | Major       |
| プロパティ削除          | 非互換 | Major       |
| 型変更                  | 非互換 | Major       |
| デフォルト値変更        | 要確認 | Major/Minor |

### 5.3 バージョンメタデータ

```typescript
/**
 * スキーマバージョン情報
 */
export const SCHEMA_VERSION = {
  version: "1.0.0",
  releaseDate: "2025-12-18",
  changes: [
    "初版リリース",
    "全25型のスキーマ定義",
    "カスタムバリデーション（searchWeights、dateRange）",
  ],
} as const;
```

### 5.4 マイグレーションパス

```typescript
/**
 * スキーママイグレーション関数
 *
 * @param data - 旧バージョンのデータ
 * @param fromVersion - 変換元バージョン
 * @param toVersion - 変換先バージョン
 * @returns 新バージョンのデータ
 */
export function migrateSchema<T>(
  data: unknown,
  fromVersion: string,
  toVersion: string,
): T {
  // 将来的なマイグレーションロジックをここに実装
  // 現在はv1.0.0のみのため、そのまま返す
  return data as T;
}
```

---

## 6. スキーマテスト例

### 6.1 searchWeightsSchemaのテスト

```typescript
import { describe, it, expect } from "vitest";
import { searchWeightsSchema } from "./schemas";

describe("searchWeightsSchema", () => {
  it("正常な重み（合計1.0）を受け入れる", () => {
    const result = searchWeightsSchema.safeParse({
      keyword: 0.35,
      semantic: 0.35,
      graph: 0.3,
    });
    expect(result.success).toBe(true);
  });

  it("合計が1.0でない重みを拒否する", () => {
    const result = searchWeightsSchema.safeParse({
      keyword: 0.5,
      semantic: 0.5,
      graph: 0.5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "検索重みの合計は1.0である必要があります",
      );
    }
  });

  it("許容誤差内（0.999）を受け入れる", () => {
    const result = searchWeightsSchema.safeParse({
      keyword: 0.334,
      semantic: 0.333,
      graph: 0.333,
    });
    expect(result.success).toBe(true);
  });
});
```

### 6.2 dateRangeSchemaのテスト

```typescript
describe("dateRangeSchema", () => {
  it("正常な日付範囲を受け入れる", () => {
    const result = dateRangeSchema.safeParse({
      start: new Date("2024-01-01"),
      end: new Date("2024-12-31"),
    });
    expect(result.success).toBe(true);
  });

  it("逆転した日付範囲を拒否する", () => {
    const result = dateRangeSchema.safeParse({
      start: new Date("2024-12-31"),
      end: new Date("2024-01-01"),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "開始日は終了日以前である必要があります",
      );
    }
  });

  it("片方がnullの場合を受け入れる", () => {
    const result1 = dateRangeSchema.safeParse({
      start: new Date("2024-01-01"),
      end: null,
    });
    expect(result1.success).toBe(true);

    const result2 = dateRangeSchema.safeParse({
      start: null,
      end: new Date("2024-12-31"),
    });
    expect(result2.success).toBe(true);
  });
});
```

---

## 7. エクスポート構成

```typescript
// packages/shared/src/schemas/rag/search/schemas.ts

import { z } from "zod";

// 列挙型スキーマ
export { queryTypeSchema, QueryType } from "./enums/query-type";
export { searchStrategySchema, SearchStrategy } from "./enums/search-strategy";
export {
  searchResultTypeSchema,
  SearchResultType,
} from "./enums/search-result-type";

// クエリ関連スキーマ
export {
  searchQuerySchema,
  searchFiltersSchema,
  dateRangeSchema,
  searchOptionsSchema,
  searchWeightsSchema,
  queryClassificationSchema,
} from "./query-schemas";

// 結果関連スキーマ
export {
  searchResultSchema,
  searchResultItemSchema,
  relevanceScoreSchema,
  cragScoreSchema,
  searchResultContentSchema,
  highlightSchema,
  highlightOffsetSchema,
  searchResultSourcesSchema,
  searchStrategyMetricsSchema,
  strategyMetricSchema,
} from "./result-schemas";

// 設定関連スキーマ
export { rrfConfigSchema, rerankConfigSchema } from "./config-schemas";

// 型推論
export type {
  QueryType,
  SearchStrategy,
  SearchResultType,
  SearchQuery,
  SearchFilters,
  DateRange,
  SearchOptions,
  SearchWeights,
  QueryClassification,
  SearchResult,
  SearchResultItem,
  RelevanceScore,
  CRAGScore,
  SearchResultContent,
  Highlight,
  HighlightOffset,
  SearchResultSources,
  SearchStrategyMetrics,
  StrategyMetric,
  RRFConfig,
  RerankConfig,
} from "./types";

// エラーマップ
export { customErrorMap } from "./error-map";

// スキーマバージョン
export { SCHEMA_VERSION, migrateSchema } from "./versioning";
```

---

## 8. パフォーマンス考慮事項

### 8.1 refineバリデーションのパフォーマンス

| スキーマ              | refine使用       | 計算量 | 影響度 |
| --------------------- | ---------------- | ------ | ------ |
| searchWeightsSchema   | あり（合計計算） | O(1)   | 低     |
| dateRangeSchema       | あり（日付比較） | O(1)   | 低     |
| highlightOffsetSchema | あり（数値比較） | O(1)   | 低     |

### 8.2 推奨事項

- 大量データの検証時は、バッチ処理を検討する
- 頻繁に実行されるバリデーションは、結果をキャッシュする
- Float32Arrayのスキーマ検証は、サイズが大きい場合にパフォーマンス影響がある点に注意

---

## 9. 変更履歴

| バージョン | 日付       | 変更者                  | 変更内容 |
| ---------- | ---------- | ----------------------- | -------- |
| 1.0.0      | 2025-12-18 | Schema Definition Agent | 初版作成 |
