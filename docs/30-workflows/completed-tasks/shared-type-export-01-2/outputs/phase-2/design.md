# Phase 2: 設計 - 成果物

## 実行日時

2026-01-22

## タスク1: 既存 index.ts の確認

### 確認結果

`packages/shared/src/services/graph/index.ts` が**既に存在し、全エクスポートが実装済み**であることを確認。

**ファイル状態**: 存在する（131行）

**既存エクスポート構造**:

```typescript
// Type Re-exports (export type { })
export type { StoredEntity, ExtractedEntity, EntityMention } from "./types";
export type {
  StoredRelation,
  ExtractedRelation,
  RelationEvidence,
} from "./types";
export type {
  GraphNode,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  GraphEdge,
} from "./types";
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
export type {
  EntityQuery,
  TraversalOptions,
  RelationQueryOptions,
} from "./types";

// Value Re-exports (export { })
export { CommunityErrorCode, CommunityDetectionError } from "./types";
export {
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
} from "./types";
export { normalizeEntityName } from "./types";
```

---

## タスク2: エクスポート構造設計

### 設計内容

既存実装は `architecture-monorepo.md` の「services/graph エクスポート構造」に**完全準拠**していることを確認。

#### エクスポートグループ構造

| グループ  | 型/値                                                                                                     | エクスポート形式  |
| --------- | --------------------------------------------------------------------------------------------------------- | ----------------- |
| Entity    | StoredEntity, ExtractedEntity, EntityMention                                                              | `export type { }` |
| Relation  | StoredRelation, ExtractedRelation, RelationEvidence                                                       | `export type { }` |
| Graph     | GraphNode, GraphPath, GraphTraversalResult, GraphStats, GraphEdge                                         | `export type { }` |
| Community | Community, CommunitySummary, CommunityStructure, CommunityDetection*, CommunitySummarization*             | `export type { }` |
| Query     | EntityQuery, TraversalOptions, RelationQueryOptions                                                       | `export type { }` |
| Errors    | CommunityErrorCode, CommunityDetectionError, CommunitySummarizationErrorCode, CommunitySummarizationError | `export { }`      |
| Utils     | normalizeEntityName                                                                                       | `export { }`      |

#### JSDocコメント

既存実装には適切なJSDocコメントが含まれている:

````typescript
/**
 * @file Knowledge Graph Service - Public API
 * @module @repo/shared/services/graph
 * @description
 * Knowledge Graphサービスの公開インターフェース。
 * ...
 * @example
 * ```typescript
 * // 型のインポート
 * import type { Community, StoredEntity, CommunitySummary } from "@repo/shared/services/graph";
 * ...
 * ```
 */
````

---

## タスク3: 下位互換性設計

### インポートパス対応表

| インポートパス                       | 用途                     | 状態        |
| ------------------------------------ | ------------------------ | ----------- |
| `from "./types"`                     | services/graph 内部      | ✅ 継続動作 |
| `from "../graph/types"`              | 他サービスからの参照     | ✅ 継続動作 |
| `from "@repo/shared/services/graph"` | 外部パッケージからの参照 | ✅ 新規追加 |

### 下位互換性チェックリスト

| チェック項目                                           | 結果 | 備考                        |
| ------------------------------------------------------ | ---- | --------------------------- |
| 既存の内部インポートが動作するか                       | ✅   | types.ts への直接参照は維持 |
| 既存の型エイリアスが維持されるか                       | ✅   | 名称変更なし                |
| 既存の値（enum/class/function）が維持されるか          | ✅   | 全て再エクスポート済み      |
| 新規インポートパスが追加されるだけで破壊的変更がないか | ✅   | 追加のみ、削除なし          |

---

## 設計検証

### architecture-monorepo.md との整合性

| 仕様項目           | 仕様内容                  | 既存実装 | 判定 |
| ------------------ | ------------------------- | -------- | ---- |
| バレルファイル配置 | `services/graph/index.ts` | 配置済み | ✅   |
| 型エクスポート形式 | `export type { }`         | 準拠     | ✅   |
| 値エクスポート形式 | `export { }`              | 準拠     | ✅   |
| インターフェース数 | 22型                      | 22型     | ✅   |
| enum数             | 2                         | 2        | ✅   |
| class数            | 2                         | 2        | ✅   |
| function数         | 1                         | 1        | ✅   |

---

## 設計結論

既存の `packages/shared/src/services/graph/index.ts` は:

1. **全ての要件を満たしている**
2. **architecture-monorepo.md に完全準拠**
3. **下位互換性を維持**
4. **適切なJSDocコメントを含む**

**追加実装は不要**。Phase 4以降はテストによる検証と品質保証を実施する。

---

## 完了条件チェックリスト

- [x] 既存 `index.ts` の状態を確認
- [x] エクスポート構造を設計（既存実装の検証）
- [x] 下位互換性を確認
- [x] `outputs/phase-2/design.md` を作成

---

## Phase末端アクション

- [x] 本Phase内の全タスク（3タスク）を100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認
