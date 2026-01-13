# Phase 12: 実装ガイド

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| タスクID   | SHARED-TYPE-EXPORT-02 |
| Phase      | 12                    |
| 作成日     | 2026-01-14            |
| ステータス | 完了                  |

---

## Part 1: 概念的説明

### 型エクスポートとは?

パッケージの「型エクスポート」は、図書館の蔵書目録のようなものです。本（型定義）がどこにあるか（ファイルパス）を知らなくても、目録（エクスポート）を見れば必要な本を見つけられます。

### なぜメインindex.tsからエクスポートするのか?

1. **利便性**: 利用者は深いパスを知らなくても型を使える
2. **明確なAPI**: パッケージの公開APIが明確になる
3. **保守性**: 将来の内部リファクタリングが容易になる

### 今回の変更で何ができるようになったか?

以下のインポートが可能になりました:

```typescript
// Before: 深いパスからインポート
import type { Community } from "@repo/shared/src/services/graph";

// After: パッケージルートからインポート
import type { Community } from "@repo/shared";
```

---

## Part 2: 技術的詳細

### 追加したエクスポート

#### A. Graph Service - 型（export type）

| カテゴリ       | 型名                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| Entity関連     | `StoredEntity`, `ExtractedEntity`, `EntityMention`                                 |
| Relation関連   | `StoredRelation`, `ExtractedRelation`, `RelationEvidence`                          |
| Graph関連      | `GraphNode`, `GraphEdge`, `GraphPath`, `GraphTraversalResult`, `GraphStats`        |
| Community関連  | `Community`, `CommunitySummary`, `CommunityStructure`                              |
| 検出オプション | `CommunityDetectionOptions`, `CommunityDetectionResult`, `CommunityDetectionStats` |
| 要約オプション | `CommunitySummarizationOptions`, `CommunitySummarizationResult`                    |
| Query関連      | `EntityQuery`, `TraversalOptions`, `RelationQueryOptions`                          |

#### B. Graph Service - 値（export）

| 種別     | 名前                                                     |
| -------- | -------------------------------------------------------- |
| enum     | `CommunityErrorCode`, `CommunitySummarizationErrorCode`  |
| class    | `CommunityDetectionError`, `CommunitySummarizationError` |
| function | `normalizeEntityName`                                    |

#### C. Branded ID型

| 種別     | 名前                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type     | `Brand`, `FileId`, `ChunkId`, `ConversionId`, `EntityId`, `RelationId`, `CommunityId`, `EmbeddingId`                                                                |
| function | `createFileId`, `createChunkId`, `createConversionId`, `createEntityId`, `createRelationId`, `createCommunityId`, `createEmbeddingId`                               |
| function | `generateUUID`, `generateFileId`, `generateChunkId`, `generateConversionId`, `generateEntityId`, `generateRelationId`, `generateCommunityId`, `generateEmbeddingId` |

---

## Part 3: 使用例

### 型のインポート

```typescript
import type {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityId,
  EntityId,
} from "@repo/shared";

// 型アノテーションで使用
function getCommunityTitle(community: Community): CommunityId {
  return community.id;
}

function getEntityName(entity: StoredEntity): string {
  return entity.name;
}
```

### 値のインポート

```typescript
import {
  CommunityErrorCode,
  CommunityDetectionError,
  normalizeEntityName,
  createCommunityId,
  generateCommunityId,
} from "@repo/shared";

// エラーハンドリング
throw new CommunityDetectionError(
  "Detection failed",
  CommunityErrorCode.DETECTION_FAILED,
);

// エンティティ名の正規化
const normalized = normalizeEntityName("TypeScript 5.x"); // "typescript 5x"

// Branded ID の作成
const communityId = createCommunityId("existing-id");
const newCommunityId = generateCommunityId(); // UUID v4 生成
```

---

## Part 4: 注意事項

### 循環参照の回避

今回の実装では、以下の依存方向を維持しています:

```
index.ts
    ↓
./src/services/graph/index.ts
    ↓
./src/services/graph/types.ts
    ↓
./src/types/rag/branded.ts
```

新しいエクスポートを追加する際は、この方向に逆らう依存関係を作らないよう注意してください。

### 重複エクスポートの回避

`export * from "./src/types/rag"` ではなく、個別のエクスポートを使用しています。
これは、既存の `./types` からのエクスポートと重複を避けるためです。

---

## Part 5: 関連タスク

| タスクID              | 内容                           | ステータス |
| --------------------- | ------------------------------ | ---------- |
| SHARED-TYPE-EXPORT-01 | services/graph からの型整理    | 完了       |
| SHARED-TYPE-EXPORT-02 | メインindex からのエクスポート | 完了       |
| SHARED-TYPE-EXPORT-03 | 型チェック検証                 | 未実施     |
