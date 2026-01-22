# Phase 1: 要件定義 - 成果物

## 実行日時

2026-01-22

## タスク1: 既存型定義の確認

### 確認結果

`packages/shared/src/services/graph/types.ts` を確認した結果、以下の型が定義されていることを確認:

#### Entity Types

| 型名            | 用途                               | 依存関係                      |
| --------------- | ---------------------------------- | ----------------------------- |
| StoredEntity    | DBに保存されたエンティティ         | EntityId, EntityType, ChunkId |
| ExtractedEntity | テキストから抽出されたエンティティ | EntityType, ChunkId           |
| EntityMention   | エンティティの出現箇所             | なし                          |

#### Relation Types

| 型名              | 用途                       | 依存関係                           |
| ----------------- | -------------------------- | ---------------------------------- |
| StoredRelation    | DBに保存された関係         | RelationId, EntityId, RelationType |
| ExtractedRelation | テキストから抽出された関係 | RelationType                       |
| RelationEvidence  | 関係の証拠情報             | ChunkId                            |

#### Graph Types

| 型名                 | 用途                     | 依存関係                     |
| -------------------- | ------------------------ | ---------------------------- |
| GraphNode            | グラフの頂点             | StoredEntity, StoredRelation |
| GraphPath            | グラフ上のパス           | StoredEntity, StoredRelation |
| GraphTraversalResult | トラバーサル結果         | StoredEntity, GraphPath      |
| GraphStats           | グラフ統計情報           | なし                         |
| GraphEdge            | コミュニティ検出用エッジ | EntityId                     |

#### Community Types

| 型名                          | 用途                   | 依存関係                                    |
| ----------------------------- | ---------------------- | ------------------------------------------- |
| Community                     | コミュニティ構造       | CommunityId, EntityId                       |
| CommunitySummary              | コミュニティの要約     | CommunityId                                 |
| CommunityStructure            | 階層的コミュニティ構造 | Community, EntityId, CommunityId            |
| CommunityDetectionOptions     | 検出オプション         | なし                                        |
| CommunityDetectionResult      | 検出結果               | CommunityStructure, CommunityDetectionStats |
| CommunityDetectionStats       | 検出統計               | なし                                        |
| CommunitySummarizationOptions | 要約オプション         | なし                                        |
| CommunitySummarizationResult  | 要約結果               | CommunitySummary, CommunityId               |

#### Query Types

| 型名                 | 用途                         | 依存関係            |
| -------------------- | ---------------------------- | ------------------- |
| EntityQuery          | エンティティ検索クエリ       | EntityType, ChunkId |
| TraversalOptions     | グラフトラバーサルオプション | RelationType        |
| RelationQueryOptions | 関係検索オプション           | RelationType        |

#### 値（enum, class, function）

| 名前                            | 種別     | 用途                         |
| ------------------------------- | -------- | ---------------------------- |
| CommunityErrorCode              | enum     | コミュニティ検出エラーコード |
| CommunityDetectionError         | class    | コミュニティ検出エラー       |
| CommunitySummarizationErrorCode | enum     | コミュニティ要約エラーコード |
| CommunitySummarizationError     | class    | コミュニティ要約エラー       |
| normalizeEntityName             | function | エンティティ名の正規化       |

---

## タスク2: エクスポート要件の定義

### エクスポート形式の決定

| カテゴリ         | エクスポート形式  | 理由                             |
| ---------------- | ----------------- | -------------------------------- |
| インターフェース | `export type { }` | コンパイル後に消える型のみの定義 |
| enum             | `export { }`      | ランタイムに存在する値           |
| class            | `export { }`      | ランタイムに存在する値           |
| function         | `export { }`      | ランタイムに存在する値           |

### 下位互換性チェックリスト

| チェック項目                                       | 結果 |
| -------------------------------------------------- | ---- |
| `from "./types"` (services/graph内部) が動作するか | ✅   |
| `from "../graph/types"` (他サービス) が動作するか  | ✅   |
| 既存の値エクスポートが維持されるか                 | ✅   |

---

## タスク3: 要件ドキュメント

### エクスポート対象型一覧（全22型）

**Type exports (`export type { }`)**:

1. StoredEntity
2. ExtractedEntity
3. EntityMention
4. StoredRelation
5. ExtractedRelation
6. RelationEvidence
7. GraphNode
8. GraphPath
9. GraphTraversalResult
10. GraphStats
11. GraphEdge
12. Community
13. CommunitySummary
14. CommunityStructure
15. CommunityDetectionOptions
16. CommunityDetectionResult
17. CommunityDetectionStats
18. CommunitySummarizationOptions
19. CommunitySummarizationResult
20. EntityQuery
21. TraversalOptions
22. RelationQueryOptions

**Value exports (`export { }`)**:

1. CommunityErrorCode (enum)
2. CommunityDetectionError (class)
3. CommunitySummarizationErrorCode (enum)
4. CommunitySummarizationError (class)
5. normalizeEntityName (function)

### 受け入れ基準

1. `packages/shared/src/services/graph/index.ts` から全22型がエクスポートされること
2. `packages/shared/src/services/graph/index.ts` から全5値がエクスポートされること
3. `apps/desktop` から `@repo/shared/services/graph` 経由で型をインポートできること
4. TypeScriptコンパイルが成功すること
5. 既存の内部インポートパスが引き続き動作すること

### 統合テスト連携（apps/desktop からのインポート要件）

期待されるインポート構文:

```typescript
// 型のインポート
import type {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityDetectionResult,
} from "@repo/shared/services/graph";

// 値のインポート
import {
  CommunityErrorCode,
  CommunityDetectionError,
  normalizeEntityName,
} from "@repo/shared/services/graph";
```

---

## 現状確認

**重要**: 既存の `packages/shared/src/services/graph/index.ts` を確認したところ、**すでに全ての型と値がエクスポートされている状態**であることを確認。

これは以下のいずれかを意味する:

1. 仕様書作成後に別途実装が完了した
2. 本タスクのスコープはエクスポートの検証と品質保証が主目的

→ Phase 2以降では、既存実装の検証・テスト・品質保証を中心に進行する。

---

## 完了条件チェックリスト

- [x] `services/graph/types.ts` の型定義を確認完了
- [x] エクスポート対象型の一覧を作成
- [x] エクスポート形式（type vs value）を決定
- [x] 下位互換性要件を確認
- [x] `outputs/phase-1/requirements.md` を作成

---

## Phase末端アクション

- [x] 本Phase内の全タスク（3タスク）を100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認
