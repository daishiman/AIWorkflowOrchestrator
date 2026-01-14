# Phase 1: 依存関係分析

## 作成日

2026-01-13

## 概要

`packages/shared/src/services/graph/types.ts` の依存関係を分析し、型エクスポートへの影響を明確化する。

---

## 依存関係図

```
services/graph/types.ts
    │
    ├── import type { EntityId, RelationId, ChunkId, CommunityId }
    │       from "../../types/rag/branded"
    │
    └── import type { EntityType, RelationType }
            from "../../types/rag/graph/types"
```

---

## 外部依存型

### 1. Branded Types (`../../types/rag/branded`)

| 型名          | 説明               | types.ts での使用箇所                           |
| ------------- | ------------------ | ----------------------------------------------- |
| `EntityId`    | エンティティ識別子 | StoredEntity, GraphNode, Community 等           |
| `RelationId`  | 関係識別子         | StoredRelation                                  |
| `ChunkId`     | チャンク識別子     | StoredEntity, RelationEvidence, EntityQuery     |
| `CommunityId` | コミュニティ識別子 | Community, CommunitySummary, CommunityStructure |

**影響**: これらの Branded Types は `types.ts` 内でのみ使用され、index.ts から再エクスポートする必要はない（Part 1 スコープ外）。

### 2. Graph Types (`../../types/rag/graph/types`)

| 型名           | 説明             | types.ts での使用箇所                               |
| -------------- | ---------------- | --------------------------------------------------- |
| `EntityType`   | エンティティ種別 | StoredEntity.type, ExtractedEntity.type             |
| `RelationType` | 関係種別         | StoredRelation.relationType, ExtractedRelation.type |

**影響**: これらの型も `types.ts` 内でのみ使用され、index.ts から再エクスポートする必要はない。

---

## 内部依存（型間の参照）

### 依存グラフ

```
StoredEntity ───────────────────┐
    │                           │
    └── EntityMention           │
                                │
GraphNode ──────────────────────┤
    │                           │
    ├── StoredEntity            │
    └── StoredRelation          │
                                │
GraphPath ──────────────────────┤
    │                           │
    ├── StoredEntity            │
    └── StoredRelation          │
                                │
GraphTraversalResult ───────────┤
    │                           │
    ├── StoredEntity            │
    └── GraphPath               │
                                │
Community ──────────────────────┤
                                │
CommunityStructure ─────────────┤
    │                           │
    └── Community               │
                                │
CommunityDetectionResult ───────┤
    │                           │
    ├── CommunityStructure      │
    └── CommunityDetectionStats │
                                │
CommunitySummarizationResult ───┘
    │
    └── CommunitySummary
```

---

## エクスポート順序の考慮

型の依存関係から、エクスポート順序に影響はない。TypeScript は型の宣言順序に依存しないため、任意の順序でエクスポート可能。

ただし、可読性のために以下の論理的順序を採用する：

1. Entity 関連型
2. Relation 関連型
3. Graph 関連型
4. Community 関連型
5. Query 関連型
6. ユーティリティ関数

---

## Part 1 スコープへの影響

### エクスポートする（Part 1）

- `services/graph/types.ts` で定義されている全ての型

### エクスポートしない（Part 2 以降）

- Branded Types（`EntityId`, `CommunityId` 等）
- Graph Types（`EntityType`, `RelationType`）

これらは Part 2（メイン index.ts からのエクスポート）で対応する。

---

## 破壊的変更の分析

### 既存コードへの影響

- `services/graph/types.ts` の内容は変更しない
- 新規ファイル `services/graph/index.ts` を追加するのみ
- 既存のインポートパターン（直接 `types.ts` を参照）は引き続き機能する

### 結論

**破壊的変更なし** - 新規バレルファイルの追加のみ

---

## タスク2完了

✅ 依存関係（Branded Types 等）が整理されている
✅ 破壊的変更がないことが確認されている
