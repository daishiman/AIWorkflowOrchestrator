# Knowledge Graph Store ドメインモデル設計

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 2                          |
| 機能名     | task-knowledge-graph-store |
| 作成日     | 2026-01-13                 |
| 作成者     | Claude Opus 4.5            |
| バージョン | 1.0.0                      |

---

## 1. Branded Types（ID型）

### 1.1 定義

```typescript
// EntityId - エンティティの一意識別子
type EntityId = string & { readonly __brand: "EntityId" };

// RelationId - 関係の一意識別子
type RelationId = string & { readonly __brand: "RelationId" };

// CommunityId - コミュニティの一意識別子
type CommunityId = string & { readonly __brand: "CommunityId" };

// ChunkId - チャンクの一意識別子
type ChunkId = string & { readonly __brand: "ChunkId" };
```

### 1.2 ファクトリ関数

```typescript
function createEntityId(id: string): EntityId {
  return id as EntityId;
}

function createRelationId(id: string): RelationId {
  return id as RelationId;
}

function createCommunityId(id: string): CommunityId {
  return id as CommunityId;
}

function createChunkId(id: string): ChunkId {
  return id as ChunkId;
}
```

### 1.3 型安全性の利点

| 利点             | 説明                                 |
| ---------------- | ------------------------------------ |
| コンパイル時検出 | 異なるID型の混同をコンパイル時に検出 |
| ゼロコスト抽象化 | ランタイムではstringとして動作       |
| IDE補完対応      | 型情報がエディタ補完に反映される     |
| ドキュメント効果 | コードの意図が型から明確に読み取れる |

---

## 2. Entity（エンティティ）モデル

### 2.1 EntityType（エンティティ種別）

```typescript
type EntityType =
  | "person"
  | "organization"
  | "location"
  | "event"
  | "concept"
  | "technology"
  | "product"
  | "document"
  | "other";
```

| タイプ       | 説明             | 例                           |
| ------------ | ---------------- | ---------------------------- |
| person       | 人物             | Albert Einstein, 田中太郎    |
| organization | 組織・企業       | Google, 東京大学             |
| location     | 場所・地名       | Tokyo, Mount Fuji            |
| event        | イベント・出来事 | World War II, Tokyo Olympics |
| concept      | 概念・アイデア   | Machine Learning, Democracy  |
| technology   | 技術             | React, GraphQL               |
| product      | 製品             | iPhone, Windows              |
| document     | 文書             | RFC 7231, 憲法               |
| other        | その他           | 分類不能なもの               |

### 2.2 ExtractedEntity（抽出エンティティ）

```typescript
interface ExtractedEntity {
  name: string;
  type: EntityType;
  description?: string;
  aliases?: string[];
  importance?: number;
  metadata?: Record<string, unknown>;
}
```

| フィールド  | 型                      | 必須 | 説明                     |
| ----------- | ----------------------- | ---- | ------------------------ |
| name        | string                  | ✅   | エンティティ名           |
| type        | EntityType              | ✅   | エンティティ種別         |
| description | string                  | ❌   | エンティティの説明文     |
| aliases     | string[]                | ❌   | 別名リスト               |
| importance  | number                  | ❌   | 重要度スコア（0.0〜1.0） |
| metadata    | Record<string, unknown> | ❌   | 追加のメタデータ         |

### 2.3 StoredEntity（永続化エンティティ）

```typescript
interface StoredEntity {
  id: EntityId;
  name: string;
  normalizedName: string;
  type: EntityType;
  description: string | null;
  aliases: string[];
  importanceScore: number;
  mentionCount: number;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

| フィールド      | 型                              | 説明                            |
| --------------- | ------------------------------- | ------------------------------- |
| id              | EntityId                        | 一意識別子（UUID）              |
| name            | string                          | 元のエンティティ名              |
| normalizedName  | string                          | 正規化名（小文字・空白正規化）  |
| type            | EntityType                      | エンティティ種別                |
| description     | string \| null                  | エンティティの説明              |
| aliases         | string[]                        | 別名リスト（JSON配列）          |
| importanceScore | number                          | 重要度スコア（デフォルト: 0.5） |
| mentionCount    | number                          | 出現回数（upsert時に加算）      |
| metadata        | Record<string, unknown> \| null | 追加メタデータ                  |
| createdAt       | Date                            | 作成日時                        |
| updatedAt       | Date                            | 更新日時                        |
| deletedAt       | Date \| null                    | 論理削除日時                    |

---

## 3. Relation（関係）モデル

### 3.1 ExtractedRelation（抽出関係）

```typescript
interface ExtractedRelation {
  sourceEntityName: string;
  targetEntityName: string;
  relationType: string;
  description?: string;
  weight?: number;
  evidence: RelationEvidence[];
}
```

| フィールド       | 型                 | 必須 | 説明                    |
| ---------------- | ------------------ | ---- | ----------------------- |
| sourceEntityName | string             | ✅   | 起点エンティティ名      |
| targetEntityName | string             | ✅   | 終点エンティティ名      |
| relationType     | string             | ✅   | 関係タイプ              |
| description      | string             | ❌   | 関係の説明              |
| weight           | number             | ❌   | 関係の強さ（0.0〜1.0）  |
| evidence         | RelationEvidence[] | ✅   | 証拠情報（1件以上必須） |

### 3.2 RelationEvidence（関係証拠）

```typescript
interface RelationEvidence {
  chunkId: ChunkId;
  excerpt: string;
  confidence?: number;
}
```

| フィールド | 型      | 必須 | 説明                     |
| ---------- | ------- | ---- | ------------------------ |
| chunkId    | ChunkId | ✅   | 根拠となるチャンクID     |
| excerpt    | string  | ✅   | 根拠となるテキスト抜粋   |
| confidence | number  | ❌   | 信頼度スコア（0.0〜1.0） |

### 3.3 StoredRelation（永続化関係）

```typescript
interface StoredRelation {
  id: RelationId;
  sourceEntityId: EntityId;
  targetEntityId: EntityId;
  relationType: string;
  description: string | null;
  weight: number;
  evidenceCount: number;
  evidences: StoredEvidence[];
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

| フィールド     | 型                              | 説明                          |
| -------------- | ------------------------------- | ----------------------------- |
| id             | RelationId                      | 一意識別子（UUID）            |
| sourceEntityId | EntityId                        | 起点エンティティID            |
| targetEntityId | EntityId                        | 終点エンティティID            |
| relationType   | string                          | 関係タイプ                    |
| description    | string \| null                  | 関係の説明                    |
| weight         | number                          | 関係の強さ（デフォルト: 1.0） |
| evidenceCount  | number                          | 証拠件数                      |
| evidences      | StoredEvidence[]                | 証拠リスト                    |
| metadata       | Record<string, unknown> \| null | 追加メタデータ                |
| createdAt      | Date                            | 作成日時                      |
| updatedAt      | Date                            | 更新日時                      |
| deletedAt      | Date \| null                    | 論理削除日時                  |

### 3.4 StoredEvidence（永続化証拠）

```typescript
interface StoredEvidence {
  id: string;
  relationId: RelationId;
  chunkId: ChunkId;
  excerpt: string;
  confidence: number;
  createdAt: Date;
}
```

---

## 4. Community（コミュニティ）モデル

### 4.1 Community（コミュニティ）

```typescript
interface Community {
  id: CommunityId;
  title: string;
  summary: string | null;
  level: number;
  parentCommunityId: CommunityId | null;
  entityCount: number;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
```

| フィールド        | 型                              | 説明                      |
| ----------------- | ------------------------------- | ------------------------- |
| id                | CommunityId                     | 一意識別子（UUID）        |
| title             | string                          | コミュニティタイトル      |
| summary           | string \| null                  | コミュニティ要約          |
| level             | number                          | 階層レベル（0から始まる） |
| parentCommunityId | CommunityId \| null             | 親コミュニティID          |
| entityCount       | number                          | メンバーエンティティ数    |
| metadata          | Record<string, unknown> \| null | 追加メタデータ            |
| createdAt         | Date                            | 作成日時                  |
| updatedAt         | Date                            | 更新日時                  |

### 4.2 EntityCommunity（中間テーブル）

```typescript
interface EntityCommunity {
  entityId: EntityId;
  communityId: CommunityId;
  createdAt: Date;
}
```

---

## 5. Graph Traversal（グラフ探索）モデル

### 5.1 GraphNode（グラフノード）

```typescript
interface GraphNode {
  entity: StoredEntity;
  depth: number;
}
```

### 5.2 GraphEdge（グラフエッジ）

```typescript
interface GraphEdge {
  relation: StoredRelation;
  sourceDepth: number;
  targetDepth: number;
}
```

### 5.3 GraphTraversalResult（探索結果）

```typescript
interface GraphTraversalResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNodeId: EntityId;
  maxDepthReached: number;
}
```

### 5.4 GraphPath（パス）

```typescript
interface GraphPath {
  nodes: StoredEntity[];
  edges: StoredRelation[];
  totalWeight: number;
  length: number;
}
```

---

## 6. Statistics（統計）モデル

### 6.1 GraphStats（グラフ統計）

```typescript
interface GraphStats {
  totalEntities: number;
  totalRelations: number;
  totalCommunities: number;
  entitiesByType: Record<EntityType, number>;
  relationsByType: Record<string, number>;
  averageRelationsPerEntity: number;
}
```

---

## 7. ユーティリティ関数

### 7.1 normalizeEntityName

```typescript
function normalizeEntityName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}
```

**用途:**

- エンティティ名の正規化
- 重複検出の基準として使用
- 大文字小文字を区別しない検索の実現

---

## 8. データベーステーブルとのマッピング

| ドメインモデル  | テーブル           | 備考                      |
| --------------- | ------------------ | ------------------------- |
| StoredEntity    | entities           | JSON列: aliases, metadata |
| StoredRelation  | relations          | evidencesはJOINで取得     |
| StoredEvidence  | relation_evidence  | -                         |
| Community       | communities        | JSON列: metadata          |
| EntityCommunity | entity_communities | 中間テーブル              |

---

## 9. 参照ドキュメント

| ドキュメント         | パス                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| システム仕様         | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` |
| データベーススキーマ | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      |
| インターフェース設計 | `outputs/phase-2/interface-design.md`                                                       |
