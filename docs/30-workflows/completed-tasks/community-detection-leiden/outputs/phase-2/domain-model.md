# ドメインモデル設計書: コミュニティ検出 (Leiden)

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| タスクID | CONV-08-02                |
| タスク名 | コミュニティ検出 (Leiden) |
| 作成日   | 2026-01-10                |
| スキル   | domain-modeling           |

---

## 1. ユビキタス言語（Ubiquitous Language）

### 1.1 用語定義

| 用語               | 定義                                           |
| ------------------ | ---------------------------------------------- |
| Community          | 意味的に関連するエンティティのクラスター       |
| CommunityStructure | 階層的なコミュニティの全体構造                 |
| Level              | コミュニティの階層レベル（0が最上位）          |
| Modularity         | グラフ分割の品質を示す指標（高いほど良い分割） |
| Resolution         | コミュニティの粒度を制御するパラメータ         |
| Local Move         | ノードを別コミュニティに移動する操作           |
| Refinement         | Leiden特有の品質改善フェーズ                   |
| Aggregation        | コミュニティを単一ノードに集約する操作         |
| Partition          | ノードからコミュニティへのマッピング           |

### 1.2 関連用語（既存ドメインから）

| 用語        | 定義                                     | 参照元               |
| ----------- | ---------------------------------------- | -------------------- |
| Entity      | Knowledge Graphのノード                  | IKnowledgeGraphStore |
| Relation    | Knowledge Graphのエッジ                  | IKnowledgeGraphStore |
| EntityId    | エンティティの一意識別子（Branded Type） | types/branded        |
| CommunityId | コミュニティの一意識別子（Branded Type） | types/branded        |

---

## 2. エンティティ（Entity）

### 2.1 Community

**アイデンティティ**: CommunityId（UUID）
**ライフサイクル**: 検出時に作成、再検出時に置換

```typescript
/**
 * コミュニティエンティティ
 * 意味的に関連するエンティティのクラスター
 */
interface Community {
  /** コミュニティの一意識別子 */
  readonly id: CommunityId;

  /** 階層レベル（0が最上位、大きいほど細かい） */
  readonly level: number;

  /** メンバーエンティティのID配列 */
  readonly memberEntityIds: EntityId[];

  /** 親コミュニティID（level=0の場合はundefined） */
  readonly parentCommunityId?: CommunityId;

  /** 子コミュニティID配列 */
  readonly childCommunityIds: CommunityId[];

  /** コミュニティサイズ（メンバー数） */
  readonly size: number;

  /** 内部エッジ数 */
  readonly internalEdges: number;

  /** 外部エッジ数 */
  readonly externalEdges: number;

  /** モジュラリティスコア */
  readonly modularity: number;

  /** コミュニティ要約（CONV-08-03で設定） */
  summary?: string;

  /** 要約の埋め込みベクトル（CONV-08-03で設定） */
  summaryEmbedding?: number[];

  /** 作成日時 */
  readonly createdAt: Date;

  /** 更新日時 */
  updatedAt: Date;
}
```

**不変条件（Invariants）**:

- `size === memberEntityIds.length`
- `level >= 0`
- `level === 0` の場合、`parentCommunityId === undefined`
- `level > 0` の場合、`parentCommunityId !== undefined`
- `modularity >= -0.5 && modularity <= 1.0`

---

## 3. 値オブジェクト（Value Object）

### 3.1 CommunityStructure

**説明**: コミュニティ検出結果の全体構造

```typescript
/**
 * コミュニティ構造（検出結果全体）
 * 不変オブジェクト
 */
interface CommunityStructure {
  /** 全コミュニティのリスト */
  readonly communities: readonly Community[];

  /** 階層レベル数 */
  readonly levels: number;

  /** 全体のモジュラリティスコア */
  readonly totalModularity: number;

  /** エンティティからコミュニティへのマッピング（レベルごと） */
  readonly entityToCommunity: ReadonlyMap<EntityId, readonly CommunityId[]>;
}
```

### 3.2 CommunityDetectionOptions

**説明**: 検出パラメータを表す値オブジェクト

```typescript
/**
 * コミュニティ検出オプション
 * 不変オブジェクト
 */
interface CommunityDetectionOptions {
  /** 解像度パラメータ（デフォルト: 1.0） */
  readonly resolution?: number;

  /** 最大階層レベル（デフォルト: 3） */
  readonly maxLevels?: number;

  /** 最小コミュニティサイズ（デフォルト: 2） */
  readonly minCommunitySize?: number;

  /** 最大イテレーション数（デフォルト: 100） */
  readonly maxIterations?: number;

  /** 乱数シード（再現性用） */
  readonly seed?: number;
}
```

**制約**:

- `resolution > 0`（正の実数）
- `maxLevels >= 1 && maxLevels <= 10`
- `minCommunitySize >= 1`
- `maxIterations >= 1 && maxIterations <= 1000`

### 3.3 CommunityDetectionResult

**説明**: 検出処理の結果を表す値オブジェクト

```typescript
/**
 * コミュニティ検出結果
 */
interface CommunityDetectionResult {
  /** 検出されたコミュニティ構造 */
  readonly structure: CommunityStructure;

  /** 処理時間（ミリ秒） */
  readonly processingTimeMs: number;

  /** 総イテレーション数 */
  readonly iterations: number;
}
```

### 3.4 GraphEdge

**説明**: グラフのエッジを表す値オブジェクト

```typescript
/**
 * グラフエッジ（LeidenAlgorithm用）
 */
interface GraphEdge {
  readonly source: EntityId;
  readonly target: EntityId;
  readonly weight: number;
}
```

**制約**:

- `source !== target`（自己ループ禁止）
- `weight > 0`（正の重み）

---

## 4. ドメインサービス（Domain Service）

### 4.1 LeidenAlgorithm

**責務**: 純粋なLeidenアルゴリズムの実行

```typescript
/**
 * Leidenアルゴリズム実装
 * 状態を持たない純粋なドメインサービス
 */
class LeidenAlgorithm {
  /**
   * コミュニティ検出を実行
   * @param nodes ノードID配列
   * @param edges エッジ配列
   * @param options 検出オプション
   * @returns 検出結果
   */
  detect(
    nodes: readonly EntityId[],
    edges: readonly GraphEdge[],
    options?: CommunityDetectionOptions,
  ): CommunityDetectionResult;
}
```

**特徴**:

- 外部依存なし（Pure Function的）
- 入力が同じなら出力も同じ（seed指定時）
- 副作用なし

---

## 5. 集約（Aggregate）

### 5.1 CommunityAggregate

**集約ルート**: Community
**境界**: 単一のCommunityとそのメンバーエンティティIDリスト

```typescript
/**
 * コミュニティ集約
 * トランザクション整合性の境界
 */
class CommunityAggregate {
  private constructor(private readonly community: Community) {
    this.validateInvariants();
  }

  static create(props: CreateCommunityProps): CommunityAggregate;
  static reconstitute(community: Community): CommunityAggregate;

  get id(): CommunityId {
    return this.community.id;
  }

  /** メンバーを追加 */
  addMember(entityId: EntityId): CommunityAggregate;

  /** メンバーを削除 */
  removeMember(entityId: EntityId): CommunityAggregate;

  /** 要約を設定 */
  setSummary(summary: string, embedding?: number[]): CommunityAggregate;

  /** 不変条件を検証 */
  private validateInvariants(): void;

  /** ドメインオブジェクトを取得 */
  toCommunity(): Community;
}
```

**不変条件**:

- メンバーリストは重複なし
- サイズとメンバー数は常に一致
- レベル0の場合、親IDはなし

---

## 6. リポジトリインターフェース

### 6.1 ICommunityRepository

```typescript
/**
 * コミュニティリポジトリインターフェース
 */
interface ICommunityRepository {
  /** コミュニティを保存 */
  insert(community: Community): Promise<Result<Community, Error>>;

  /** 複数コミュニティを一括保存 */
  insertMany(communities: Community[]): Promise<Result<Community[], Error>>;

  /** IDで取得 */
  findById(id: CommunityId): Promise<Result<Community | null, Error>>;

  /** エンティティIDから関連コミュニティを取得 */
  findByEntityId(entityId: EntityId): Promise<Result<Community[], Error>>;

  /** レベルで取得 */
  findByLevel(level: number): Promise<Result<Community[], Error>>;

  /** 全コミュニティを削除 */
  deleteAll(): Promise<Result<void, Error>>;

  /** エンティティ-コミュニティマッピングを追加 */
  addEntityCommunityMapping(
    entityId: EntityId,
    communityId: CommunityId,
  ): Promise<Result<void, Error>>;

  /** エンティティ-コミュニティマッピングを一括追加 */
  addEntityCommunityMappings(
    mappings: Array<{ entityId: EntityId; communityId: CommunityId }>,
  ): Promise<Result<void, Error>>;
}
```

---

## 7. ファクトリ（Factory）

### 7.1 CommunityFactory

```typescript
/**
 * コミュニティファクトリ
 */
class CommunityFactory {
  /**
   * 検出結果からコミュニティを作成
   */
  static createFromDetection(
    id: CommunityId,
    level: number,
    memberEntityIds: EntityId[],
    modularity: number,
    internalEdges: number,
    externalEdges: number,
    parentCommunityId?: CommunityId,
  ): Community;

  /**
   * 新規IDを生成してコミュニティを作成
   */
  static createNew(
    level: number,
    memberEntityIds: EntityId[],
    modularity: number,
    internalEdges: number,
    externalEdges: number,
    parentCommunityId?: CommunityId,
  ): Community;
}
```

---

## 8. ドメインイベント（Domain Event）

### 8.1 イベント定義

```typescript
/**
 * コミュニティ検出完了イベント
 */
interface CommunityDetectionCompletedEvent {
  readonly type: "COMMUNITY_DETECTION_COMPLETED";
  readonly timestamp: Date;
  readonly payload: {
    readonly communityCount: number;
    readonly levels: number;
    readonly totalModularity: number;
    readonly processingTimeMs: number;
  };
}

/**
 * コミュニティ保存完了イベント
 */
interface CommunitiesSavedEvent {
  readonly type: "COMMUNITIES_SAVED";
  readonly timestamp: Date;
  readonly payload: {
    readonly communityIds: CommunityId[];
  };
}
```

---

## 9. ドメインモデル図

```
┌─────────────────────────────────────────────────────────────┐
│                    CommunityStructure                        │
│  (Value Object)                                              │
│  ─────────────────────────────                               │
│  + communities: Community[]                                  │
│  + levels: number                                            │
│  + totalModularity: number                                   │
│  + entityToCommunity: Map<EntityId, CommunityId[]>           │
└─────────────────────────────────────────────────────────────┘
                              │ contains
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Community                              │
│  (Entity / Aggregate Root)                                   │
│  ─────────────────────────────                               │
│  + id: CommunityId [identity]                                │
│  + level: number                                             │
│  + memberEntityIds: EntityId[]                               │
│  + parentCommunityId?: CommunityId                           │
│  + childCommunityIds: CommunityId[]                          │
│  + size: number                                              │
│  + modularity: number                                        │
│  + summary?: string                                          │
│  ─────────────────────────────                               │
│  «invariant» size == memberEntityIds.length                  │
│  «invariant» level >= 0                                      │
│  «invariant» level == 0 => parentCommunityId == undefined    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 CommunityDetectionOptions                    │
│  (Value Object)                                              │
│  ─────────────────────────────                               │
│  + resolution?: number                                       │
│  + maxLevels?: number                                        │
│  + minCommunitySize?: number                                 │
│  + maxIterations?: number                                    │
│  + seed?: number                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    LeidenAlgorithm                           │
│  (Domain Service)                                            │
│  ─────────────────────────────                               │
│  + detect(nodes, edges, options): CommunityDetectionResult   │
│  ─────────────────────────────                               │
│  - localMovePhase()                                          │
│  - refinementPhase()                                         │
│  - aggregateGraph()                                          │
│  - buildHierarchy()                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-10 | 初版作成 |
