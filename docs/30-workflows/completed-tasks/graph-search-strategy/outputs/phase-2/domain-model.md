# GraphSearchStrategy ドメインモデル

> Phase 2 成果物
> 作成日: 2026-01-13
> 機能名: graph-search-strategy

---

## 概要

GraphSearchStrategyで使用する型定義を設計する。入力型、出力型、内部型の3カテゴリに分類。

---

## 入力型

### GraphSearchOptions

検索オプションを指定する型。search()メソッドの第4引数として使用。

```typescript
/**
 * グラフ検索オプション
 */
export interface GraphSearchOptions {
  /**
   * クエリタイプ
   * - "local": エンティティベース検索（デフォルト）
   * - "global": コミュニティサマリベース検索
   * - "relationship": 関係パスベース検索
   */
  queryType?: "local" | "global" | "relationship";

  /**
   * エンティティ類似度閾値
   * この値以上の類似度を持つエンティティのみ検索対象
   * @default 0.5
   * @range 0.0 - 1.0
   */
  entityThreshold?: number;

  /**
   * コミュニティ類似度閾値
   * globalSearch時に使用
   * @default 0.4
   * @range 0.0 - 1.0
   */
  communityThreshold?: number;

  /**
   * グラフトラバーサル深度
   * relationshipSearch時の探索深度
   * @default 2
   * @range 1 - 5
   */
  traversalDepth?: number;

  /**
   * 関係タイプフィルタ
   * 指定された関係タイプのみを探索対象とする
   */
  relationTypes?: RelationType[];
}
```

### GraphSearchOptionsDefaults

```typescript
/**
 * デフォルト値定数
 */
export const GRAPH_SEARCH_DEFAULTS = {
  queryType: "local" as const,
  entityThreshold: 0.5,
  communityThreshold: 0.4,
  traversalDepth: 2,
  maxTraversalDepth: 5,
} as const;
```

---

## 出力型

### SearchResultItem（既存型の拡張利用）

既存のSearchResultItem型をそのまま使用。sources.entityIds, sources.communityIdにグラフ検索固有の情報を格納。

```typescript
// packages/shared/src/types/rag/search/types.ts より

interface SearchResultItem {
  /** 結果アイテムID */
  id: string;

  /** 結果タイプ（"chunk" | "entity" | "community"） */
  type: SearchResultType;

  /** 総合スコア（0.0-1.0） */
  score: number;

  /** 詳細スコア */
  relevance: RelevanceScore;

  /** コンテンツ情報 */
  content: SearchResultContent;

  /** ハイライト情報 */
  highlights: Highlight[];

  /** ソース情報 */
  sources: SearchResultSources;
}
```

### RelevanceScore拡張

graphフィールドにグラフ検索スコアを格納。

```typescript
interface RelevanceScore {
  combined: number; // 総合スコア
  keyword: number; // キーワードスコア（Graph検索では0）
  semantic: number; // セマンティックスコア（埋め込み類似度）
  graph: number; // グラフスコア（パス距離、エンティティ類似度等）
  rerank: number | null;
  crag: CRAGScore | null;
}
```

### SearchResultSources拡張

```typescript
interface SearchResultSources {
  chunkId: ChunkId | null;
  fileId: FileId | null;
  entityIds: EntityId[]; // グラフ検索で関連エンティティIDを格納
  communityId: CommunityId | null; // globalSearchで使用
  relationIds: RelationId[]; // relationshipSearchでパス上の関係ID
}
```

---

## 内部型

### EntityMatch

クエリから抽出されたエンティティマッチ情報。

```typescript
/**
 * エンティティマッチ情報
 * findSimilarEntitiesの結果を表現
 */
interface EntityMatch {
  /** エンティティID */
  entityId: EntityId;

  /** エンティティ名 */
  name: string;

  /** エンティティタイプ */
  type: EntityType;

  /** クエリとの類似度（0.0-1.0） */
  similarity: number;

  /** エンティティ説明（オプション） */
  description?: string;
}
```

### ChunkInfo

エンティティに関連するチャンク情報。

```typescript
/**
 * チャンク情報
 */
interface ChunkInfo {
  /** チャンクID */
  chunkId: ChunkId;

  /** チャンクコンテンツ */
  content: string;

  /** コンテキスト情報 */
  contextualContent?: string;

  /** チャンク関連度（0.0-1.0） */
  relevance: number;

  /** 関連ファイルID */
  fileId?: FileId;
}
```

### PathInfo

エンティティ間のパス情報。

```typescript
/**
 * パス情報
 * findShortestPathの結果を表現
 */
interface PathInfo {
  /** パス上のエンティティID列 */
  entityIds: EntityId[];

  /** パス上の関係ID列 */
  relationIds: RelationId[];

  /** パス長（エッジ数） */
  distance: number;

  /** パス上の関係情報 */
  relations: PathRelation[];
}

/**
 * パス上の関係
 */
interface PathRelation {
  relationId: RelationId;
  sourceEntityId: EntityId;
  targetEntityId: EntityId;
  relationType: RelationType;
  description?: string;
}
```

### TraversalResult

グラフトラバーサルの結果。

```typescript
/**
 * トラバーサル結果
 */
interface TraversalResult {
  /** 訪問したエンティティ */
  entities: EntityMatch[];

  /** 訪問した関係 */
  relations: PathRelation[];

  /** 各エンティティの深度 */
  depths: Map<EntityId, number>;
}
```

### GraphSearchResultInternal

内部処理用の検索結果型。toSearchResultItem()で変換前の型。

```typescript
/**
 * グラフ検索内部結果
 */
interface GraphSearchResultInternal {
  /** 結果タイプ */
  type: "entity" | "community" | "path";

  /** チャンク情報（存在する場合） */
  chunk?: ChunkInfo;

  /** エンティティ情報（localSearch, relationshipSearch） */
  entity?: EntityMatch;

  /** コミュニティ情報（globalSearch） */
  community?: CommunitySummary;

  /** パス情報（relationshipSearch） */
  path?: PathInfo;

  /** スコア情報 */
  scores: {
    entitySimilarity?: number;
    chunkRelevance?: number;
    summarySimilarity?: number;
    pathDistance?: number;
    combined: number;
  };
}
```

---

## Branded Types（既存定義の利用）

以下のBranded Typesは既存定義を使用。

```typescript
// packages/shared/src/types/rag/branded.ts より
type EntityId = string & { readonly __brand: "EntityId" };
type RelationId = string & { readonly __brand: "RelationId" };
type ChunkId = string & { readonly __brand: "ChunkId" };
type CommunityId = string & { readonly __brand: "CommunityId" };
type FileId = string & { readonly __brand: "FileId" };
```

---

## 定数定義

```typescript
/**
 * グラフ検索定数
 */
export const GRAPH_SEARCH_CONSTANTS = {
  // クエリ制限
  MAX_QUERY_LENGTH: 1000,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 10,

  // 閾値デフォルト
  DEFAULT_ENTITY_THRESHOLD: 0.5,
  DEFAULT_COMMUNITY_THRESHOLD: 0.4,

  // トラバーサル制限
  DEFAULT_TRAVERSAL_DEPTH: 2,
  MAX_TRAVERSAL_DEPTH: 5,

  // スコアリング重み
  LOCAL_ENTITY_WEIGHT: 0.6,
  LOCAL_CHUNK_WEIGHT: 0.4,
  PATH_DISTANCE_WEIGHT: 0.5,
  PATH_CHUNK_WEIGHT: 0.5,

  // タイムアウト
  SEARCH_TIMEOUT_MS: 10000,
} as const;
```

---

## 型ガード

```typescript
/**
 * EntityMatchの型ガード
 */
function isEntityMatch(obj: unknown): obj is EntityMatch {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "entityId" in obj &&
    "name" in obj &&
    "similarity" in obj
  );
}

/**
 * GraphSearchOptionsの型ガード
 */
function isGraphSearchOptions(obj: unknown): obj is GraphSearchOptions {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  if (
    o.queryType !== undefined &&
    !["local", "global", "relationship"].includes(o.queryType as string)
  ) {
    return false;
  }
  return true;
}
```

---

## Zodスキーマ（バリデーション用）

```typescript
import { z } from "zod";

/**
 * GraphSearchOptionsスキーマ
 */
export const graphSearchOptionsSchema = z
  .object({
    queryType: z.enum(["local", "global", "relationship"]).optional(),
    entityThreshold: z.number().min(0).max(1).optional(),
    communityThreshold: z.number().min(0).max(1).optional(),
    traversalDepth: z.number().int().min(1).max(5).optional(),
    relationTypes: z.array(z.string()).optional(),
  })
  .optional();
```

---

## 変更履歴

| 日付       | 変更内容                |
| ---------- | ----------------------- |
| 2026-01-13 | 初版作成（Phase 2完了） |
