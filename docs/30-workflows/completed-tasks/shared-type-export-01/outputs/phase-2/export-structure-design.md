# Phase 2: エクスポート構造設計書

## 作成日

2026-01-13

## 概要

`services/graph/index.ts` の具体的な構造を設計する。

---

## 設計方針

### 1. `export type` と `export` の使い分け

| 種別      | 使用構文      | 理由                           |
| --------- | ------------- | ------------------------------ |
| interface | `export type` | コンパイル後に消える型情報     |
| enum      | `export`      | ランタイムで値として存在       |
| class     | `export`      | ランタイムでインスタンス化可能 |
| function  | `export`      | ランタイムで呼び出し可能       |

### 2. エクスポート順序

論理的なグループ化に基づく順序:

1. **Entity 関連型** - 基本的なノード情報
2. **Relation 関連型** - エッジ情報
3. **Graph 関連型** - グラフ構造
4. **Community 関連型** - コミュニティ検出
5. **Query 関連型** - 検索・クエリ
6. **値のエクスポート** - enum, class, function

### 3. コメント規約

```typescript
// =============================================================================
// セクション名
// =============================================================================
```

---

## 設計結果: index.ts

```typescript
/**
 * @file Knowledge Graph Service - Public API
 * @module @repo/shared/services/graph
 * @description Knowledge Graphサービスの公開インターフェース
 */

// =============================================================================
// Type Re-exports
// =============================================================================

// Entity関連型
export type { StoredEntity, ExtractedEntity, EntityMention } from "./types";

// Relation関連型
export type {
  StoredRelation,
  ExtractedRelation,
  RelationEvidence,
} from "./types";

// Graph関連型
export type {
  GraphNode,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  GraphEdge,
} from "./types";

// Community関連型
export type {
  Community,
  CommunitySummary,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  CommunityDetectionStats,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
} from "./types";

// Query関連型
export type {
  EntityQuery,
  TraversalOptions,
  RelationQueryOptions,
} from "./types";

// =============================================================================
// Value Re-exports (enum, class, function)
// =============================================================================

// Community検出関連
export { CommunityErrorCode, CommunityDetectionError } from "./types";

// Community要約関連
export {
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
} from "./types";

// ユーティリティ関数
export { normalizeEntityName } from "./types";
```

---

## エクスポート数

| カテゴリ       | export type | export | 合計   |
| -------------- | ----------- | ------ | ------ |
| Entity関連     | 3           | 0      | 3      |
| Relation関連   | 3           | 0      | 3      |
| Graph関連      | 5           | 0      | 5      |
| Community関連  | 8           | 4      | 12     |
| Query関連      | 3           | 0      | 3      |
| ユーティリティ | 0           | 1      | 1      |
| **合計**       | **22**      | **5**  | **27** |

---

## タスク2完了

✅ エクスポート構造が詳細に設計されている
✅ `export type` と `export` の使い分けが明確
