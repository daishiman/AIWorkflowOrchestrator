# Knowledge Graph Store インターフェース設計

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 2                          |
| 機能名     | task-knowledge-graph-store |
| 作成日     | 2026-01-13                 |
| 作成者     | Claude Opus 4.5            |
| バージョン | 1.0.0                      |

---

## 1. IKnowledgeGraphStore インターフェース

### 1.1 全体構造

```typescript
interface IKnowledgeGraphStore {
  // Entity Operations
  upsertEntity(
    entity: ExtractedEntity,
    chunkId?: ChunkId,
  ): Promise<Result<StoredEntity, KnowledgeGraphError>>;
  getEntity(
    id: EntityId,
  ): Promise<Result<StoredEntity | null, KnowledgeGraphError>>;
  getEntityByName(
    name: string,
    type?: EntityType,
  ): Promise<Result<StoredEntity | null, KnowledgeGraphError>>;
  findEntities(
    options?: FindEntitiesOptions,
  ): Promise<Result<StoredEntity[], KnowledgeGraphError>>;
  findSimilarEntities(
    embedding: number[],
    options?: SimilaritySearchOptions,
  ): Promise<Result<StoredEntity[], KnowledgeGraphError>>;
  deleteEntity(id: EntityId): Promise<Result<void, KnowledgeGraphError>>;
  bulkUpsertEntities(
    entities: ExtractedEntity[],
    chunkId?: ChunkId,
  ): Promise<Result<StoredEntity[], KnowledgeGraphError>>;

  // Relation Operations
  addRelation(
    relation: ExtractedRelation,
  ): Promise<Result<StoredRelation, KnowledgeGraphError>>;
  getRelation(
    id: RelationId,
  ): Promise<Result<StoredRelation | null, KnowledgeGraphError>>;
  getRelations(
    entityId: EntityId,
    direction?: "outgoing" | "incoming" | "both",
  ): Promise<Result<StoredRelation[], KnowledgeGraphError>>;
  findRelations(
    options?: FindRelationsOptions,
  ): Promise<Result<StoredRelation[], KnowledgeGraphError>>;
  deleteRelation(id: RelationId): Promise<Result<void, KnowledgeGraphError>>;
  bulkAddRelations(
    relations: ExtractedRelation[],
  ): Promise<Result<StoredRelation[], KnowledgeGraphError>>;

  // Graph Traversal
  traverse(
    startEntityId: EntityId,
    options?: TraversalOptions,
  ): Promise<Result<GraphTraversalResult, KnowledgeGraphError>>;
  findShortestPath(
    fromId: EntityId,
    toId: EntityId,
    options?: PathOptions,
  ): Promise<Result<GraphPath | null, KnowledgeGraphError>>;
  getNeighbors(
    entityId: EntityId,
    options?: NeighborOptions,
  ): Promise<Result<StoredEntity[], KnowledgeGraphError>>;

  // Statistics
  getStats(): Promise<Result<GraphStats, KnowledgeGraphError>>;
}
```

---

## 2. Entity Operations

### 2.1 upsertEntity

```typescript
upsertEntity(
  entity: ExtractedEntity,
  chunkId?: ChunkId
): Promise<Result<StoredEntity, KnowledgeGraphError>>
```

| 引数    | 型              | 必須 | 説明                       |
| ------- | --------------- | ---- | -------------------------- |
| entity  | ExtractedEntity | ✅   | 抽出されたエンティティ情報 |
| chunkId | ChunkId         | ❌   | 関連チャンクID             |

| 戻り値 | 説明                              |
| ------ | --------------------------------- |
| 成功   | `Result.ok(StoredEntity)`         |
| 失敗   | `Result.err(KnowledgeGraphError)` |

**動作仕様:**

- 名前を正規化してnormalizedNameを生成
- 同一normalizedName + typeの既存エンティティがあればupsert
- upsert時: mentionCount加算、aliases統合
- 新規時: 新しいEntityIdを生成してINSERT

### 2.2 getEntity

```typescript
getEntity(id: EntityId): Promise<Result<StoredEntity | null, KnowledgeGraphError>>
```

| 引数 | 型       | 必須 | 説明           |
| ---- | -------- | ---- | -------------- |
| id   | EntityId | ✅   | エンティティID |

| 戻り値 | 説明                              |
| ------ | --------------------------------- |
| 存在   | `Result.ok(StoredEntity)`         |
| 不在   | `Result.ok(null)`                 |
| エラー | `Result.err(KnowledgeGraphError)` |

### 2.3 getEntityByName

```typescript
getEntityByName(
  name: string,
  type?: EntityType
): Promise<Result<StoredEntity | null, KnowledgeGraphError>>
```

| 引数 | 型         | 必須 | 説明               |
| ---- | ---------- | ---- | ------------------ |
| name | string     | ✅   | エンティティ名     |
| type | EntityType | ❌   | エンティティタイプ |

**動作仕様:**

- 入力名を正規化してnormalizedNameで検索
- typeが指定された場合は追加条件として適用
- 大文字小文字を区別しない検索

### 2.4 findEntities

```typescript
findEntities(
  options?: FindEntitiesOptions
): Promise<Result<StoredEntity[], KnowledgeGraphError>>
```

```typescript
interface FindEntitiesOptions {
  type?: EntityType;
  nameContains?: string;
  minImportance?: number;
  limit?: number;
  offset?: number;
  orderBy?: "name" | "importance" | "mentionCount" | "createdAt";
  orderDirection?: "asc" | "desc";
}
```

### 2.5 findSimilarEntities

```typescript
findSimilarEntities(
  embedding: number[],
  options?: SimilaritySearchOptions
): Promise<Result<StoredEntity[], KnowledgeGraphError>>
```

```typescript
interface SimilaritySearchOptions {
  limit?: number;
  minSimilarity?: number;
  type?: EntityType;
}
```

**注意:** 現在は空配列を返却（DiskANN統合後に実装予定）

### 2.6 deleteEntity

```typescript
deleteEntity(id: EntityId): Promise<Result<void, KnowledgeGraphError>>
```

| 引数 | 型       | 必須 | 説明           |
| ---- | -------- | ---- | -------------- |
| id   | EntityId | ✅   | エンティティID |

| 戻り値 | 説明                              |
| ------ | --------------------------------- |
| 成功   | `Result.ok(void)`                 |
| 不在   | `Result.err(EntityNotFoundError)` |
| エラー | `Result.err(KnowledgeGraphError)` |

**動作仕様:**

- 関連するrelationsをCASCADE削除
- 関連するentity_communitiesを削除
- 関連するchunk_entitiesを削除

### 2.7 bulkUpsertEntities

```typescript
bulkUpsertEntities(
  entities: ExtractedEntity[],
  chunkId?: ChunkId
): Promise<Result<StoredEntity[], KnowledgeGraphError>>
```

**動作仕様:**

- トランザクション内で全エンティティを処理
- 各エンティティにupsertロジックを適用
- 1件でも失敗した場合は全体をロールバック

---

## 3. Relation Operations

### 3.1 addRelation

```typescript
addRelation(
  relation: ExtractedRelation
): Promise<Result<StoredRelation, KnowledgeGraphError>>
```

```typescript
interface ExtractedRelation {
  sourceEntityName: string;
  targetEntityName: string;
  relationType: string;
  description?: string;
  weight?: number;
  evidence: RelationEvidence[];
}

interface RelationEvidence {
  chunkId: ChunkId;
  excerpt: string;
  confidence?: number;
}
```

**検証ルール:**

1. `evidence.length > 0` でなければ `EvidenceRequiredError`
2. sourceとtargetが同一の場合は `SelfLoopError`
3. sourceエンティティが存在しない場合は `EntityNotFoundError`
4. targetエンティティが存在しない場合は `EntityNotFoundError`

### 3.2 getRelation

```typescript
getRelation(id: RelationId): Promise<Result<StoredRelation | null, KnowledgeGraphError>>
```

**動作仕様:**

- 関係本体と関連するevidenceを結合して返却
- evidences配列にrelation_evidenceテーブルの内容を含める

### 3.3 getRelations

```typescript
getRelations(
  entityId: EntityId,
  direction?: "outgoing" | "incoming" | "both"
): Promise<Result<StoredRelation[], KnowledgeGraphError>>
```

| 引数      | 型       | 必須 | 説明                     |
| --------- | -------- | ---- | ------------------------ |
| entityId  | EntityId | ✅   | 基準エンティティID       |
| direction | string   | ❌   | 方向（デフォルト: both） |

| direction | 説明                                   |
| --------- | -------------------------------------- |
| outgoing  | 指定エンティティが起点の関係のみ       |
| incoming  | 指定エンティティが終点の関係のみ       |
| both      | 起点または終点のいずれかに該当する関係 |

### 3.4 findRelations

```typescript
findRelations(
  options?: FindRelationsOptions
): Promise<Result<StoredRelation[], KnowledgeGraphError>>
```

```typescript
interface FindRelationsOptions {
  sourceEntityId?: EntityId;
  targetEntityId?: EntityId;
  relationType?: string;
  minWeight?: number;
  limit?: number;
  offset?: number;
}
```

### 3.5 deleteRelation

```typescript
deleteRelation(id: RelationId): Promise<Result<void, KnowledgeGraphError>>
```

**動作仕様:**

- 関連するrelation_evidenceをCASCADE削除
- 冪等性: 存在しないIDでも正常終了（推奨）

### 3.6 bulkAddRelations

```typescript
bulkAddRelations(
  relations: ExtractedRelation[]
): Promise<Result<StoredRelation[], KnowledgeGraphError>>
```

**動作仕様:**

- トランザクション内で全関係を処理
- 各関係に検証ルール（証拠必須、自己ループ禁止）を適用

---

## 4. Graph Traversal Operations

### 4.1 traverse

```typescript
traverse(
  startEntityId: EntityId,
  options?: TraversalOptions
): Promise<Result<GraphTraversalResult, KnowledgeGraphError>>
```

```typescript
interface TraversalOptions {
  maxDepth?: number; // デフォルト: 3
  maxNodes?: number; // デフォルト: 100
  direction?: "outgoing" | "incoming" | "both";
  minWeight?: number; // 関係の最小重み
  relationTypes?: string[]; // フィルタする関係タイプ
}

interface GraphTraversalResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNodeId: EntityId;
  maxDepthReached: number;
}

interface GraphNode {
  entity: StoredEntity;
  depth: number;
}

interface GraphEdge {
  relation: StoredRelation;
  sourceDepth: number;
  targetDepth: number;
}
```

**アルゴリズム:** BFS（幅優先探索）

- 訪問済みノードを管理して無限ループを防止
- maxDepthに達したら探索を停止
- maxNodesに達したら探索を停止

### 4.2 findShortestPath

```typescript
findShortestPath(
  fromId: EntityId,
  toId: EntityId,
  options?: PathOptions
): Promise<Result<GraphPath | null, KnowledgeGraphError>>
```

```typescript
interface PathOptions {
  maxDepth?: number; // デフォルト: 10
  direction?: "outgoing" | "incoming" | "both";
  minWeight?: number;
}

interface GraphPath {
  nodes: StoredEntity[];
  edges: StoredRelation[];
  totalWeight: number;
  length: number;
}
```

**アルゴリズム:** BFS（最短パス保証）

- fromId === toIdの場合、そのノードのみを含むパスを返却
- パスが存在しない場合はnullを返却

### 4.3 getNeighbors

```typescript
getNeighbors(
  entityId: EntityId,
  options?: NeighborOptions
): Promise<Result<StoredEntity[], KnowledgeGraphError>>
```

```typescript
interface NeighborOptions {
  direction?: "outgoing" | "incoming" | "both";
  minWeight?: number;
  relationTypes?: string[];
  limit?: number;
}
```

**動作仕様:**

- 深度1（1ホップ）で到達可能なノードのみを返却
- `traverse(entityId, { maxDepth: 1 })`の簡易版

---

## 5. Statistics Operations

### 5.1 getStats

```typescript
getStats(): Promise<Result<GraphStats, KnowledgeGraphError>>
```

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

## 6. ファクトリ関数

```typescript
function createKnowledgeGraphStore(db: Database): IKnowledgeGraphStore {
  return new SQLiteKnowledgeGraphStore(db);
}
```

| 引数 | 型       | 説明                   |
| ---- | -------- | ---------------------- |
| db   | Database | Drizzle DBインスタンス |

---

## 7. 参照ドキュメント

| ドキュメント       | パス                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| システム仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                                                    |
| ドメインモデル     | `outputs/phase-2/domain-model.md`                                                           |
| エラー設計         | `outputs/phase-2/error-design.md`                                                           |
