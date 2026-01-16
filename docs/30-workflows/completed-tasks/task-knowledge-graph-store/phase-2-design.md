# Phase 2: 設計

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 2                          |
| 機能名 | task-knowledge-graph-store |
| 作成日 | 2026-01-13                 |

## 目的

Phase 1で定義した要件を実現可能なアーキテクチャとインターフェース設計に落とし込む。各Storeの責務分離、型定義、データ構造を設計する。

## 実行タスク

- **アーキテクチャ設計**: Store層の構造とパターン選定
- **インターフェース設計**: IKnowledgeGraphStore、各Store型定義
- **データ構造設計**: StoredEntity, StoredRelation等のデータ型定義
- **エラー型設計**: EntityNotFoundError等のエラークラス設計

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                               | パス                                                                                        | 内容                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| Knowledge Graph Store インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | Store API仕様・データ構造 |
| データベーススキーマ                   | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      | テーブル定義              |
| アーキテクチャパターン                 | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`                | 設計パターン              |
| データベース実装                       | `.claude/skills/aiworkflow-requirements/references/database-implementation.md`              | DB実装パターン            |

### Phase 1成果物

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |

## 実行手順

### 1. アーキテクチャ設計

**実装場所**: `packages/shared/src/services/graph/`

```
┌────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  (エンティティ抽出、関係抽出、RAGパイプライン)          │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│              IKnowledgeGraphStore (Interface)           │
│  - addEntity / getEntity / updateEntity / deleteEntity  │
│  - addRelation / getRelation / deleteRelation           │
│  - traverse / findShortestPath / getNeighbors           │
│  - bulkUpsertEntities / bulkAddRelations                │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Store Layer                                     │
├─────────────────┬─────────────────┬─────────────────┬───────────────┤
│  EntityStore    │  RelationStore  │  CommunityStore │ RelEvidence   │
│  - CRUD         │  - CRUD         │  - CRUD         │ - CRUD        │
│  - Search       │  - Traverse     │  - Hierarchy    │ - Link        │
└─────────────────┴─────────────────┴─────────────────┴───────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│           SQLiteKnowledgeGraphStore (実装)              │
│  - Drizzle ORM によるデータベース操作                   │
│  - Result<T, Error> パターンによるエラー処理            │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                    SQLite Database                      │
│  - entities テーブル                                    │
│  - relations テーブル                                   │
│  - relation_evidence テーブル                           │
│  - communities テーブル                                 │
│  - entity_communities テーブル                          │
│  - chunk_entities テーブル                              │
└────────────────────────────────────────────────────────┘
```

### 2. インターフェース設計

#### Branded Types（ID型安全性）

```typescript
// EntityId, RelationId, CommunityId をBranded Typesで定義
type EntityId = string & { readonly __brand: "EntityId" };
type RelationId = string & { readonly __brand: "RelationId" };
type CommunityId = string & { readonly __brand: "CommunityId" };
```

#### IKnowledgeGraphStore インターフェース

```typescript
interface IKnowledgeGraphStore {
  // Entity operations
  addEntity(entity: EntityInput): Result<StoredEntity, Error>;
  getEntity(id: EntityId): Result<StoredEntity | null, Error>;
  getEntityByName(name: string): Result<StoredEntity | null, Error>;
  updateEntity(
    id: EntityId,
    updates: Partial<EntityInput>,
  ): Result<StoredEntity, Error>;
  deleteEntity(id: EntityId): Result<void, Error>;
  searchEntities(query: EntitySearchQuery): Result<StoredEntity[], Error>;
  bulkUpsertEntities(entities: EntityInput[]): Result<StoredEntity[], Error>;

  // Relation operations
  addRelation(relation: RelationInput): Result<StoredRelation, Error>;
  getRelation(id: RelationId): Result<StoredRelation | null, Error>;
  deleteRelation(id: RelationId): Result<void, Error>;
  getRelationsByEntity(entityId: EntityId): Result<StoredRelation[], Error>;
  bulkAddRelations(relations: RelationInput[]): Result<StoredRelation[], Error>;

  // Graph operations
  traverse(
    startId: EntityId,
    options: TraversalOptions,
  ): Result<TraversalResult, Error>;
  findShortestPath(
    fromId: EntityId,
    toId: EntityId,
  ): Result<EntityId[] | null, Error>;
  getNeighbors(id: EntityId, depth?: number): Result<StoredEntity[], Error>;
  getStats(): Result<GraphStats, Error>;
}
```

### 3. データ構造設計

#### StoredEntity（永続化エンティティ）

```typescript
interface StoredEntity {
  id: EntityId;
  name: string;
  normalizedName: string;
  type: EntityType;
  description?: string;
  aliases: string[];
  confidence: number;
  mentionCount: number;
  importance: number;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### StoredRelation（永続化関係）

```typescript
interface StoredRelation {
  id: RelationId;
  sourceEntityId: EntityId;
  targetEntityId: EntityId;
  relationType: RelationType;
  description?: string;
  confidence: number;
  bidirectional: boolean;
  evidence: RelationEvidence[];
  createdAt: Date;
}
```

#### RelationEvidence（関係証拠）

```typescript
interface RelationEvidence {
  id: string;
  relationId: RelationId;
  chunkId: string;
  confidence: number;
  extractedText?: string;
  createdAt: Date;
}
```

### 4. エラー型設計

```typescript
class EntityNotFoundError extends Error {
  constructor(public entityId: EntityId) {
    super(`Entity not found: ${entityId}`);
    this.name = "EntityNotFoundError";
  }
}

class SelfLoopError extends Error {
  constructor(public entityId: EntityId) {
    super(`Self-loop relations are not allowed: ${entityId}`);
    this.name = "SelfLoopError";
  }
}

class EvidenceRequiredError extends Error {
  constructor() {
    super("At least one evidence is required for a relation");
    this.name = "EvidenceRequiredError";
  }
}

class DatabaseError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}
```

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント        | 契約定義                                               |
| ------------------- | ------------------------------------------------------ |
| EntityStore → DB    | entities テーブルスキーマに準拠                        |
| RelationStore → DB  | relations, relation_evidence テーブルスキーマに準拠    |
| CommunityStore → DB | communities, entity_communities テーブルスキーマに準拠 |
| Store → Result型    | Result<T, Error> パターンで戻り値を統一                |
| 外部サービス契約    | ファクトリ関数 createKnowledgeGraphStore(db) で生成    |

## 成果物

| 成果物           | パス                                     | 説明         |
| ---------------- | ---------------------------------------- | ------------ |
| アーキテクチャ   | `outputs/phase-2/architecture-design.md` | システム構造 |
| インターフェース | `outputs/phase-2/interface-design.md`    | 型定義       |
| データモデル     | `outputs/phase-2/domain-model.md`        | エンティティ |
| エラー設計       | `outputs/phase-2/error-design.md`        | エラー型     |

## 完了条件

- [ ] アーキテクチャ図が作成されている
- [ ] IKnowledgeGraphStoreインターフェースが定義されている
- [ ] StoredEntity, StoredRelation等のデータ型が定義されている
- [ ] エラー型（EntityNotFoundError等）が定義されている
- [ ] Phase 1要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. アーキテクチャ図の作成
3. Branded Types（EntityId等）の設計
4. IKnowledgeGraphStoreインターフェース設計
5. StoredEntity/StoredRelation型設計
6. エラー型設計
7. 統合ポイント/契約の反映
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/task-knowledge-graph-store --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
