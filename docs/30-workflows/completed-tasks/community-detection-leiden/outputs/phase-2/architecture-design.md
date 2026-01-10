# アーキテクチャ設計書: コミュニティ検出 (Leiden)

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| タスクID | CONV-08-02                |
| タスク名 | コミュニティ検出 (Leiden) |
| 作成日   | 2026-01-10                |
| スキル   | architectural-patterns    |

---

## 1. アーキテクチャ概要

### 1.1 選定パターン

**採用パターン**: Hexagonal Architecture (Ports and Adapters)

**選定理由**:

| 観点             | 理由                                           |
| ---------------- | ---------------------------------------------- |
| テスタビリティ   | アルゴリズムを純粋関数として分離しやすい       |
| 依存性逆転       | IKnowledgeGraphStore等のインターフェースと統合 |
| 置換可能性       | アルゴリズム実装を独立してテスト可能           |
| 既存設計との整合 | プロジェクトの既存Repositoryパターンと一致     |

### 1.2 コンポーネント図

```
                      ┌────────────────────────────────────────┐
                      │           Application Layer            │
                      │                                        │
                      │  ┌──────────────────────────────────┐  │
                      │  │      CommunityDetector           │  │
                      │  │   (ICommunityDetector実装)        │  │
                      │  │                                  │  │
                      │  │  - detect()                      │  │
                      │  │  - saveResults()                 │  │
                      │  │  - getCommunitiesForEntity()     │  │
                      │  │  - getCommunitiesByLevel()       │  │
                      │  │  - getCommunityMembers()         │  │
                      │  └─────────────┬────────────────────┘  │
                      └────────────────┼───────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
     ┌──────────────────────┐ ┌───────────────┐ ┌───────────────────┐
     │   LeidenAlgorithm    │ │ IKnowledge-   │ │  ICommunity-      │
     │   (Domain Service)   │ │ GraphStore    │ │  Repository       │
     │                      │ │  (Port)       │ │   (Port)          │
     │  - detect()          │ └───────┬───────┘ └─────────┬─────────┘
     │  - localMovePhase()  │         │                   │
     │  - refinementPhase() │         ▼                   ▼
     │  - aggregateGraph()  │ ┌───────────────┐ ┌───────────────────┐
     │  - buildHierarchy()  │ │ SQLiteKnow-   │ │  SQLiteCommunity- │
     └──────────────────────┘ │ ledgeGraph-   │ │  Repository       │
                              │ Store         │ │  (Adapter)        │
                              │ (Adapter)     │ │                   │
                              └───────────────┘ └───────────────────┘
                                       │                   │
                                       └─────────┬─────────┘
                                                 ▼
                              ┌───────────────────────────────┐
                              │         SQLite/Turso          │
                              │    (Infrastructure Layer)     │
                              │                               │
                              │  - entities table             │
                              │  - relations table            │
                              │  - communities table          │
                              │  - entity_communities table   │
                              └───────────────────────────────┘
```

---

## 2. コンポーネント設計

### 2.1 LeidenAlgorithm (Domain Service)

**責務**: 純粋なLeidenアルゴリズムの実装

**特徴**:

- 外部依存なし（Pure Function的アプローチ）
- 入力: ノードリスト、エッジリスト、オプション
- 出力: CommunityDetectionResult
- 状態を持たない（各呼び出しが独立）

```typescript
class LeidenAlgorithm {
  // デフォルトオプション
  private readonly defaultOptions: Required<CommunityDetectionOptions>;

  // メインエントリポイント
  detect(
    nodes: EntityId[],
    edges: GraphEdge[],
    options?: CommunityDetectionOptions
  ): CommunityDetectionResult;

  // 内部フェーズ (private)
  private localMovePhase(...): LocalMoveResult;
  private refinementPhase(...): Map<EntityId, CommunityId>;
  private aggregateGraph(...): AggregatedGraph;
  private buildHierarchy(...): CommunityStructure;

  // ユーティリティ (private)
  private calculateModularityGain(...): number;
  private getNeighborCommunities(...): Set<CommunityId>;
  private shuffleArray<T>(array: T[], seed?: number): T[];
}
```

### 2.2 CommunityDetector (Application Service)

**責務**: コミュニティ検出の全体調整

**特徴**:

- ICommunityDetectorインターフェースを実装
- 依存性注入でLeidenAlgorithm、GraphStore、Repositoryを受け取る
- Result型でエラーハンドリング

```typescript
class CommunityDetector implements ICommunityDetector {
  constructor(
    private readonly leiden: LeidenAlgorithm,
    private readonly graphStore: IKnowledgeGraphStore,
    private readonly communityRepo: ICommunityRepository
  );

  // ICommunityDetector実装
  detect(options?: CommunityDetectionOptions): Promise<Result<CommunityDetectionResult, Error>>;
  saveResults(structure: CommunityStructure): Promise<Result<void, Error>>;
  getCommunitiesForEntity(entityId: EntityId): Promise<Result<Community[], Error>>;
  getCommunitiesByLevel(level: number): Promise<Result<Community[], Error>>;
  getCommunityMembers(communityId: CommunityId): Promise<Result<StoredEntity[], Error>>;
}
```

### 2.3 ICommunityRepository (Port)

**責務**: コミュニティデータの永続化抽象

```typescript
interface ICommunityRepository {
  insert(community: Community): Promise<Result<Community, Error>>;
  findById(id: CommunityId): Promise<Result<Community | null, Error>>;
  findByEntityId(entityId: EntityId): Promise<Result<Community[], Error>>;
  findByLevel(level: number): Promise<Result<Community[], Error>>;
  deleteAll(): Promise<Result<void, Error>>;
  addEntityCommunityMapping(
    entityId: EntityId,
    communityId: CommunityId,
  ): Promise<Result<void, Error>>;
}
```

### 2.4 SQLiteCommunityRepository (Adapter)

**責務**: ICommunityRepositoryのSQLite実装

```typescript
class SQLiteCommunityRepository implements ICommunityRepository {
  constructor(private readonly db: DrizzleDB);

  // CRUD操作
  async insert(community: Community): Promise<Result<Community, Error>>;
  async findById(id: CommunityId): Promise<Result<Community | null, Error>>;
  async findByEntityId(entityId: EntityId): Promise<Result<Community[], Error>>;
  async findByLevel(level: number): Promise<Result<Community[], Error>>;
  async deleteAll(): Promise<Result<void, Error>>;
  async addEntityCommunityMapping(entityId: EntityId, communityId: CommunityId): Promise<Result<void, Error>>;
}
```

---

## 3. 統合ポイント

### 3.1 IKnowledgeGraphStoreとの統合

| メソッド               | 用途                         |
| ---------------------- | ---------------------------- |
| getEntity()            | エンティティ取得             |
| getAllEntities()       | 全エンティティ取得（検出用） |
| getRelationsByEntity() | エンティティの関係取得       |
| getStats()             | グラフ統計（ノード数等）取得 |

### 3.2 データフロー

```
1. detect() 呼び出し
       │
       ▼
2. GraphStoreからノード・エッジ取得
       │
       ▼
3. LeidenAlgorithm.detect() 実行
   ├─ localMovePhase()
   ├─ refinementPhase()
   ├─ aggregateGraph() ← 階層レベルごとに繰り返し
   └─ buildHierarchy()
       │
       ▼
4. CommunityDetectionResult 返却
       │
       ▼
5. saveResults() 呼び出し（任意）
       │
       ▼
6. CommunityRepository経由でDB保存
```

---

## 4. ファイル構成

```
packages/shared/src/services/graph/
├── types.ts                  # 型定義（Community, CommunityStructure等）
├── community-detector.ts     # CommunityDetector実装
├── leiden-algorithm.ts       # LeidenAlgorithm実装
├── community-repository.ts   # SQLiteCommunityRepository実装
├── interfaces/
│   ├── community-detector.interface.ts  # ICommunityDetector
│   └── community-repository.interface.ts # ICommunityRepository
├── utils/
│   ├── modularity.ts         # モジュラリティ計算ユーティリティ
│   ├── graph-utils.ts        # グラフ操作ユーティリティ
│   └── random.ts             # シード付き乱数生成
└── __tests__/
    ├── leiden-algorithm.test.ts
    ├── community-detector.test.ts
    └── community-repository.test.ts
```

---

## 5. 依存関係

### 5.1 依存方向

```
CommunityDetector
    ├── LeidenAlgorithm (composition)
    ├── IKnowledgeGraphStore (injection)
    └── ICommunityRepository (injection)
           │
           ▼
    SQLiteCommunityRepository
           │
           ▼
    Drizzle ORM / SQLite
```

### 5.2 依存ルール

| ルール               | 説明                                     |
| -------------------- | ---------------------------------------- |
| アルゴリズムは純粋   | LeidenAlgorithmは外部依存を持たない      |
| インターフェース経由 | 具象クラスではなくインターフェースに依存 |
| 依存性注入           | コンストラクタで依存を注入               |
| Result型使用         | 例外を投げずResult<T, Error>を返す       |

---

## 6. エラーハンドリング戦略

### 6.1 エラー分類

| エラー種別           | 対応                             |
| -------------------- | -------------------------------- |
| GraphStoreエラー     | Result.err()で伝播               |
| 検出失敗（空グラフ） | 空のCommunityStructureを返す     |
| 保存失敗             | Result.err()で伝播、ロールバック |
| 存在しないID         | Result.err()でNotFoundエラー     |

### 6.2 エラー型

```typescript
class CommunityDetectionError extends Error {
  constructor(
    message: string,
    public readonly code: CommunityErrorCode,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "CommunityDetectionError";
  }
}

enum CommunityErrorCode {
  GRAPH_LOAD_FAILED = "GRAPH_LOAD_FAILED",
  DETECTION_FAILED = "DETECTION_FAILED",
  SAVE_FAILED = "SAVE_FAILED",
  NOT_FOUND = "NOT_FOUND",
}
```

---

## 7. パフォーマンス考慮事項

### 7.1 最適化ポイント

| 最適化項目     | 対策                                   |
| -------------- | -------------------------------------- |
| 大規模グラフ   | バッチ処理、早期終了条件               |
| メモリ使用量   | 隣接リスト形式、不要オブジェクトの解放 |
| イテレーション | 収束判定の精度調整、maxIterations制限  |

### 7.2 キャッシュ戦略

```typescript
// LeidenAlgorithm内部でのキャッシュ（検出中のみ）
private degreeCache: Map<EntityId, number>;
private communityDegreeCache: Map<CommunityId, number>;
```

---

## 8. テスト戦略

### 8.1 テストレベル

| レベル         | 対象                   | モック           |
| -------------- | ---------------------- | ---------------- |
| ユニットテスト | LeidenAlgorithm        | なし（純粋関数） |
| ユニットテスト | CommunityDetector      | GraphStore, Repo |
| 統合テスト     | CommunityDetector + DB | なし             |

### 8.2 テストデータ

```typescript
// テスト用のグラフ構造
const testGraphs = {
  // 明確な2コミュニティ構造
  twoCliques: {
    nodes: ["A", "B", "C", "D", "E", "F"],
    edges: [
      // クリーク1: A-B-C
      { source: "A", target: "B", weight: 1 },
      { source: "B", target: "C", weight: 1 },
      { source: "C", target: "A", weight: 1 },
      // クリーク2: D-E-F
      { source: "D", target: "E", weight: 1 },
      { source: "E", target: "F", weight: 1 },
      { source: "F", target: "D", weight: 1 },
      // ブリッジ
      { source: "C", target: "D", weight: 0.1 },
    ],
  },
};
```

---

## 9. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-10 | 初版作成 |
