# リポジトリインターフェース設計 - Knowledge Graph ストア

## 文書情報

| 項目           | 内容       |
| -------------- | ---------- |
| タスクID       | CONV-08-01 |
| Phase          | 2          |
| 文書バージョン | 1.0.0      |
| 作成日         | 2026-01-09 |

---

## 1. インターフェース概要

### 1.1 IKnowledgeGraphStore

```typescript
/**
 * Knowledge Graphストアインターフェース
 *
 * @description
 * エンティティと関係の永続化・検索・トラバーサル機能を提供する。
 * 全メソッドはResult型を返却し、エラーハンドリングを統一。
 */
export interface IKnowledgeGraphStore {
  // ============================================
  // エンティティ操作
  // ============================================

  /**
   * エンティティのUpsert（新規作成または既存マージ）
   */
  upsertEntity(entity: ExtractedEntity): Promise<Result<StoredEntity, Error>>;

  /**
   * IDによるエンティティ取得
   */
  getEntity(id: EntityId): Promise<Result<StoredEntity | null, Error>>;

  /**
   * 正規化名によるエンティティ取得
   */
  getEntityByName(
    normalizedName: string,
  ): Promise<Result<StoredEntity | null, Error>>;

  /**
   * 条件によるエンティティ検索
   */
  findEntities(query: EntityQuery): Promise<Result<StoredEntity[], Error>>;

  /**
   * 埋め込みベクトルによる類似エンティティ検索
   */
  findSimilarEntities(
    embedding: number[],
    limit: number,
    threshold?: number,
  ): Promise<Result<StoredEntity[], Error>>;

  /**
   * エンティティ削除（関連する関係もCASCADE削除）
   */
  deleteEntity(id: EntityId): Promise<Result<void, Error>>;

  // ============================================
  // 関係操作
  // ============================================

  /**
   * 関係の追加（既存関係はマージ）
   */
  addRelation(
    relation: ExtractedRelation,
  ): Promise<Result<StoredRelation, Error>>;

  /**
   * IDによる関係取得
   */
  getRelation(id: RelationId): Promise<Result<StoredRelation | null, Error>>;

  /**
   * エンティティに関連する関係の取得
   */
  getRelations(
    entityId: EntityId,
    options?: RelationQueryOptions,
  ): Promise<Result<StoredRelation[], Error>>;

  /**
   * ヒントによる関係検索
   */
  findRelations(
    sourceHint: string,
    targetHint: string,
    relationHint?: string,
  ): Promise<Result<StoredRelation[], Error>>;

  /**
   * 関係削除
   */
  deleteRelation(id: RelationId): Promise<Result<void, Error>>;

  // ============================================
  // グラフトラバーサル
  // ============================================

  /**
   * グラフトラバーサル（BFS）
   */
  traverse(
    startEntityId: EntityId,
    options: TraversalOptions,
  ): Promise<Result<GraphTraversalResult, Error>>;

  /**
   * 最短パス検索
   */
  findShortestPath(
    sourceId: EntityId,
    targetId: EntityId,
    maxDepth?: number,
  ): Promise<Result<GraphPath | null, Error>>;

  /**
   * 隣接ノード取得
   */
  getNeighbors(
    entityId: EntityId,
    depth?: number,
  ): Promise<Result<GraphNode[], Error>>;

  // ============================================
  // グラフ統計
  // ============================================

  /**
   * グラフ統計情報取得
   */
  getStats(): Promise<Result<GraphStats, Error>>;

  // ============================================
  // バッチ操作
  // ============================================

  /**
   * 複数エンティティの一括Upsert
   */
  bulkUpsertEntities(
    entities: ExtractedEntity[],
  ): Promise<Result<StoredEntity[], Error>>;

  /**
   * 複数関係の一括追加
   */
  bulkAddRelations(
    relations: ExtractedRelation[],
  ): Promise<Result<StoredRelation[], Error>>;
}
```

---

## 2. メソッド詳細仕様

### 2.1 エンティティ操作

#### upsertEntity

```typescript
/**
 * エンティティのUpsert
 *
 * @param entity 抽出されたエンティティ
 * @returns 永続化されたエンティティ
 *
 * @description
 * 1. nameからnormalizedNameを生成
 * 2. 同一(normalizedName, type)のエンティティを検索
 * 3. 存在する場合:
 *    - mentionCount を +1
 *    - aliases をマージ
 *    - chunkIds に追加
 *    - embedding を更新（新しい値があれば）
 *    - updatedAt を更新
 * 4. 存在しない場合:
 *    - 新規エンティティとして INSERT
 */
upsertEntity(entity: ExtractedEntity): Promise<Result<StoredEntity, Error>>;
```

#### findSimilarEntities

```typescript
/**
 * 類似エンティティ検索
 *
 * @param embedding 検索用埋め込みベクトル
 * @param limit 最大取得件数
 * @param threshold 最小類似度 (デフォルト: 0.5)
 * @returns 類似エンティティリスト（類似度降順）
 *
 * @description
 * 1. DiskANN vector_distance_cos() でベクトル検索
 * 2. 距離を類似度に変換: similarity = 1 - distance / 2
 * 3. threshold以上のエンティティをフィルタ
 * 4. 類似度降順でソート
 */
findSimilarEntities(
  embedding: number[],
  limit: number,
  threshold?: number
): Promise<Result<StoredEntity[], Error>>;
```

### 2.2 関係操作

#### addRelation

```typescript
/**
 * 関係の追加
 *
 * @param relation 抽出された関係
 * @returns 永続化された関係
 *
 * @throws SelfLoopError sourceId === targetId の場合
 * @throws EvidenceRequiredError evidence が空の場合
 * @throws EntityNotFoundError source/target が存在しない場合
 *
 * @description
 * 1. Self-loop チェック
 * 2. source/target エンティティの存在確認
 * 3. 同一(source, target, type)の関係を検索
 * 4. 存在する場合:
 *    - weight を累積
 *    - evidence を追加
 *    - updatedAt を更新
 * 5. 存在しない場合:
 *    - 新規関係として INSERT
 */
addRelation(relation: ExtractedRelation): Promise<Result<StoredRelation, Error>>;
```

#### getRelations

```typescript
/**
 * エンティティに関連する関係の取得
 *
 * @param entityId 対象エンティティID
 * @param options 取得オプション
 *   - direction: "in" | "out" | "both" (デフォルト: "both")
 *   - types: 関係タイプフィルタ
 * @returns 関係リスト
 */
getRelations(
  entityId: EntityId,
  options?: RelationQueryOptions
): Promise<Result<StoredRelation[], Error>>;
```

### 2.3 グラフトラバーサル

#### traverse

```typescript
/**
 * グラフトラバーサル（BFS）
 *
 * @param startEntityId 開始エンティティID
 * @param options トラバーサルオプション
 *   - maxDepth: 最大探索深度 (必須)
 *   - relationTypes: 関係タイプフィルタ
 *   - direction: 探索方向
 *   - maxNodes: 最大ノード数
 *   - minRelationWeight: 最小関係重み
 * @returns トラバーサル結果
 *
 * @description
 * BFSアルゴリズムでグラフを探索:
 * 1. startEntity をキューに追加
 * 2. キューが空になるか、maxDepth/maxNodes に達するまで:
 *    a. キューからノード取得
 *    b. 隣接関係を取得（オプションでフィルタ）
 *    c. 未訪問ノードをキューに追加
 *    d. パスを記録
 * 3. 結果を集約して返却
 */
traverse(
  startEntityId: EntityId,
  options: TraversalOptions
): Promise<Result<GraphTraversalResult, Error>>;
```

#### findShortestPath

```typescript
/**
 * 最短パス検索
 *
 * @param sourceId 始点エンティティID
 * @param targetId 終点エンティティID
 * @param maxDepth 最大探索深度 (デフォルト: 6)
 * @returns 最短パス（見つからない場合はnull）
 *
 * @description
 * 双方向BFSで最短パスを探索:
 * 1. sourceとtargetから同時にBFS開始
 * 2. 2つの探索が交差したら終了
 * 3. パスを構築して返却
 */
findShortestPath(
  sourceId: EntityId,
  targetId: EntityId,
  maxDepth?: number
): Promise<Result<GraphPath | null, Error>>;
```

### 2.4 バッチ操作

#### bulkUpsertEntities

```typescript
/**
 * 複数エンティティの一括Upsert
 *
 * @param entities 抽出されたエンティティリスト
 * @returns 永続化されたエンティティリスト
 *
 * @description
 * トランザクション内で一括処理:
 * 1. トランザクション開始
 * 2. 各エンティティに対して upsertEntity 実行
 * 3. エラー発生時は全てロールバック
 * 4. 成功時はコミット
 */
bulkUpsertEntities(
  entities: ExtractedEntity[]
): Promise<Result<StoredEntity[], Error>>;
```

---

## 3. 実装クラス

### 3.1 SQLiteKnowledgeGraphStore

```typescript
/**
 * SQLite実装のKnowledge Graphストア
 */
export class SQLiteKnowledgeGraphStore implements IKnowledgeGraphStore {
  private readonly db: DrizzleDatabase;

  constructor(db: DrizzleDatabase) {
    this.db = db;
  }

  // 各メソッドの実装...
}
```

### 3.2 コンストラクタパターン

```typescript
/**
 * ストアのファクトリー関数
 */
export function createKnowledgeGraphStore(
  db: DrizzleDatabase,
): IKnowledgeGraphStore {
  return new SQLiteKnowledgeGraphStore(db);
}
```

---

## 4. エラー型

```typescript
/**
 * Knowledge Graphストアのエラー基底クラス
 */
export class KnowledgeGraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KnowledgeGraphError";
  }
}

/**
 * エンティティ未発見エラー
 */
export class EntityNotFoundError extends KnowledgeGraphError {
  constructor(id: string) {
    super(`Entity not found: ${id}`);
    this.name = "EntityNotFoundError";
  }
}

/**
 * 関係未発見エラー
 */
export class RelationNotFoundError extends KnowledgeGraphError {
  constructor(id: string) {
    super(`Relation not found: ${id}`);
    this.name = "RelationNotFoundError";
  }
}

/**
 * Self-loopエラー
 */
export class SelfLoopError extends KnowledgeGraphError {
  constructor() {
    super("Self-loop relations are not allowed");
    this.name = "SelfLoopError";
  }
}

/**
 * Evidence必須エラー
 */
export class EvidenceRequiredError extends KnowledgeGraphError {
  constructor() {
    super("At least one evidence is required for a relation");
    this.name = "EvidenceRequiredError";
  }
}
```

---

## 5. 使用例

### 5.1 基本的な使用

```typescript
// ストアの作成
const store = createKnowledgeGraphStore(db);

// エンティティのUpsert
const entityResult = await store.upsertEntity({
  name: "TypeScript",
  type: "technology",
  confidence: 0.95,
  description: "A typed superset of JavaScript",
});

if (isOk(entityResult)) {
  console.log("Created entity:", entityResult.data.id);
}

// 類似エンティティ検索
const similarResult = await store.findSimilarEntities(embedding, 10, 0.7);

if (isOk(similarResult)) {
  for (const entity of similarResult.data) {
    console.log(`Similar: ${entity.name}`);
  }
}
```

### 5.2 グラフトラバーサル

```typescript
// トラバーサル実行
const traversalResult = await store.traverse(startEntityId, {
  maxDepth: 3,
  relationTypes: ["uses", "depends_on"],
  direction: "out",
  maxNodes: 100,
});

if (isOk(traversalResult)) {
  const { visitedEntities, paths } = traversalResult.data;
  console.log(`Visited ${visitedEntities.length} entities`);
  console.log(`Found ${paths.length} paths`);
}
```

### 5.3 バッチ処理

```typescript
// バッチUpsert
const entities: ExtractedEntity[] = [...];
const bulkResult = await store.bulkUpsertEntities(entities);

if (isOk(bulkResult)) {
  console.log(`Upserted ${bulkResult.data.length} entities`);
} else {
  console.error("Batch failed:", bulkResult.error);
  // 全てロールバックされている
}
```

---

## 6. 変更履歴

| バージョン | 日付       | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 1.0.0      | 2026-01-09 | Claude | 初版作成 |
