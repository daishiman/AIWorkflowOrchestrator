# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 5                          |
| 機能名 | task-knowledge-graph-store |
| 作成日 | 2026-01-13                 |

## 目的

TDDのGreen段階として、Phase 4で作成したテストを通すための最小限の実装を行う。各Store（Entity/Relation/Community/RelationEvidence）とGraphQueryServiceを実装し、すべてのテストが成功状態（Green）になることを確認する。

## 実行タスク

- **EntityStore実装**: エンティティCRUD + 検索機能
- **RelationStore実装**: 関係CRUD + 証拠管理
- **CommunityStore実装**: コミュニティCRUD + 階層操作
- **RelationEvidenceStore実装**: 証拠CRUD
- **GraphQueryService実装**: グラフ探索機能
- **ファクトリ関数実装**: createKnowledgeGraphStore
- **エラーハンドリング**: Result型パターンの適用

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                               | パス                                                                                        | 内容                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| Knowledge Graph Store インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | Store API仕様・データ構造 |
| データベーススキーマ                   | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      | テーブル定義              |
| データベース実装                       | `.claude/skills/aiworkflow-requirements/references/database-implementation.md`              | DB実装パターン            |

### 前Phase成果物

| 資料名           | パス                                     | 説明          |
| ---------------- | ---------------------------------------- | ------------- |
| 設計書           | `outputs/phase-2/architecture-design.md` | Phase 2成果物 |
| インターフェース | `outputs/phase-2/interface-design.md`    | Phase 2成果物 |
| テスト仕様書     | `outputs/phase-4/test-specification.md`  | Phase 4成果物 |

## 実行手順

### 1. ファイル構造

```
packages/shared/src/services/graph/
├── index.ts                     # エクスポート
├── types.ts                     # 型定義
├── errors.ts                    # エラークラス
├── entity-store.ts              # EntityStore実装
├── relation-store.ts            # RelationStore実装
├── community-store.ts           # CommunityStore実装
├── relation-evidence-store.ts   # RelationEvidenceStore実装
├── graph-query-service.ts       # GraphQueryService実装
├── knowledge-graph-store.ts     # 統合Store（IKnowledgeGraphStore実装）
└── utils/
    ├── normalize.ts             # 名前正規化
    └── graph-algorithms.ts      # BFS, 最短経路等
```

### 2. 型定義（types.ts）

システム仕様に基づいて以下の型を定義:

- Branded Types: `EntityId`, `RelationId`, `CommunityId`
- Data Types: `StoredEntity`, `StoredRelation`, `RelationEvidence`, `StoredCommunity`
- Input Types: `EntityInput`, `RelationInput`, `CommunityInput`
- Query Types: `EntitySearchQuery`, `TraversalOptions`, `TraversalResult`, `GraphStats`

### 3. エラークラス（errors.ts）

Phase 2設計に基づいて以下のエラーを実装:

- `EntityNotFoundError`
- `RelationNotFoundError`
- `CommunityNotFoundError`
- `SelfLoopError`
- `EvidenceRequiredError`
- `DatabaseError`

### 4. EntityStore実装

```typescript
// entity-store.ts
export class EntityStore {
  constructor(private db: Database) {}

  async addEntity(input: EntityInput): Promise<Result<StoredEntity, Error>> {
    // 1. 名前正規化
    // 2. 既存エンティティ検索（normalizedNameで）
    // 3. 重複時: upsert（mentionCount加算、aliases統合）
    // 4. 新規時: INSERT
    // 5. Result.ok(entity) または Result.err(error)
  }

  async getEntity(id: EntityId): Promise<Result<StoredEntity | null, Error>> {
    // Drizzle ORMでSELECT
  }

  async getEntityByName(
    name: string,
  ): Promise<Result<StoredEntity | null, Error>> {
    // 正規化名で検索
  }

  async updateEntity(
    id: EntityId,
    updates: Partial<EntityInput>,
  ): Promise<Result<StoredEntity, Error>> {
    // 存在確認 → UPDATE
  }

  async deleteEntity(id: EntityId): Promise<Result<void, Error>> {
    // CASCADE削除
  }

  async searchEntities(
    query: EntitySearchQuery,
  ): Promise<Result<StoredEntity[], Error>> {
    // 動的クエリ構築
  }

  async bulkUpsertEntities(
    entities: EntityInput[],
  ): Promise<Result<StoredEntity[], Error>> {
    // トランザクション内でバッチ処理
  }
}
```

### 5. RelationStore実装

- 証拠情報必須チェック
- 自己ループ禁止チェック
- CASCADE削除対応
- RelationEvidenceStoreとの連携

### 6. CommunityStore実装

- 階層構造（parent_community_id）対応
- メンバー管理（entity_communities中間テーブル）
- entity_count非正規化カラムの更新

### 7. GraphQueryService実装

```typescript
// graph-query-service.ts
export class GraphQueryService {
  constructor(
    private entityStore: EntityStore,
    private relationStore: RelationStore,
  ) {}

  async traverse(
    startId: EntityId,
    options: TraversalOptions,
  ): Promise<Result<TraversalResult, Error>> {
    // BFSアルゴリズム
    // 深度制限
    // 訪問済みノード管理
  }

  async findShortestPath(
    fromId: EntityId,
    toId: EntityId,
  ): Promise<Result<EntityId[] | null, Error>> {
    // BFSで最短経路探索
    // パスがない場合はnull
  }

  async getNeighbors(
    id: EntityId,
    depth: number = 1,
  ): Promise<Result<StoredEntity[], Error>> {
    // 指定深度の隣接ノード取得
  }

  async getStats(): Promise<Result<GraphStats, Error>> {
    // COUNT クエリ
  }
}
```

### 8. ファクトリ関数

```typescript
// knowledge-graph-store.ts
export function createKnowledgeGraphStore(db: Database): IKnowledgeGraphStore {
  const entityStore = new EntityStore(db);
  const relationStore = new RelationStore(db);
  const communityStore = new CommunityStore(db);
  const graphQueryService = new GraphQueryService(entityStore, relationStore);

  return {
    // Entity operations
    addEntity: (input) => entityStore.addEntity(input),
    getEntity: (id) => entityStore.getEntity(id),
    // ... 他のメソッドを委譲
  };
}
```

## 統合テスト連携【必須】

Store間連携・DB接続の実装とテスト支援コード整備:

| 実装項目         | 内容                                             |
| ---------------- | ------------------------------------------------ |
| Store間連携      | EntityStore, RelationStore間のEntityId参照整合性 |
| DB接続           | Drizzle ORMによるSQLite操作                      |
| トランザクション | バッチ操作でのトランザクション境界制御           |
| テストヘルパー   | インメモリDBでのテスト用ファクトリ               |

## 成果物

| 成果物            | パス                                                          | 説明           |
| ----------------- | ------------------------------------------------------------- | -------------- |
| 型定義            | `packages/shared/src/services/graph/types.ts`                 | 型定義         |
| エラークラス      | `packages/shared/src/services/graph/errors.ts`                | エラー型       |
| EntityStore       | `packages/shared/src/services/graph/entity-store.ts`          | Entity実装     |
| RelationStore     | `packages/shared/src/services/graph/relation-store.ts`        | Relation実装   |
| CommunityStore    | `packages/shared/src/services/graph/community-store.ts`       | Community実装  |
| GraphQueryService | `packages/shared/src/services/graph/graph-query-service.ts`   | グラフ探索実装 |
| ファクトリ        | `packages/shared/src/services/graph/knowledge-graph-store.ts` | 統合Store      |

## 完了条件

- [ ] EntityStoreの全メソッドが実装されている
- [ ] RelationStoreの全メソッドが実装されている
- [ ] CommunityStoreの全メソッドが実装されている
- [ ] GraphQueryServiceの全メソッドが実装されている
- [ ] すべてのテストが成功状態（Green）
- [ ] Result型パターンが適用されている
- [ ] Branded Typesが使用されている
- [ ] Store間連携が実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run src/services/graph/__tests__

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. ファイル構造の作成
3. 型定義（types.ts）の実装
4. エラークラス（errors.ts）の実装
5. EntityStore実装
6. RelationStore実装
7. CommunityStore実装
8. RelationEvidenceStore実装
9. GraphQueryService実装
10. ファクトリ関数実装
11. Green状態の確認
12. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/task-knowledge-graph-store --phase 5
```

## 次のPhase

Phase 6: テスト拡充
