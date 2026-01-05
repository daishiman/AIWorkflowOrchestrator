# コミュニティ検出 (Leiden) - タスク指示書

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | CONV-08-02                         |
| タスク名     | コミュニティ検出 (Leiden)          |
| 親タスク     | CONV-08 (Knowledge Graph構築)      |
| 依存タスク   | CONV-08-01 (Knowledge Graphストア) |
| 規模         | 大                                 |
| 見積もり工数 | 1.5日                              |
| ステータス   | 未実施                             |

---

## 1. 目的

Knowledge Graph内のエンティティをLeidenアルゴリズムでクラスタリングし、意味的に関連するコミュニティを検出する。グローバルクエリ対応の基盤となる。

---

## 2. 背景

### Leidenアルゴリズム

Louvainアルゴリズムの改良版で、以下の特徴がある：

- モジュラリティ最適化によるコミュニティ検出
- 階層的なコミュニティ構造の発見
- Louvainより高品質なコミュニティを生成
- 大規模グラフでも効率的

### GraphRAGでの役割

- グローバルクエリ（「全体のテーマは？」等）への回答に使用
- コミュニティ単位での要約生成
- VectorRAG単体では不可能なクエリタイプに対応

---

## 3. 成果物

- `packages/shared/src/services/graph/community-detector.ts`
- `packages/shared/src/services/graph/leiden-algorithm.ts`
- `packages/shared/src/services/graph/__tests__/community-detector.test.ts`

---

## 4. 出力

```typescript
// packages/shared/src/services/graph/types.ts（追加）
import type { EntityId, CommunityId } from "@/types/branded";

export interface Community {
  id: CommunityId;
  level: number; // 階層レベル（0が最上位）
  memberEntityIds: EntityId[];
  parentCommunityId?: CommunityId;
  childCommunityIds: CommunityId[];
  size: number;
  internalEdges: number;
  externalEdges: number;
  modularity: number;
  summary?: string;
  summaryEmbedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityStructure {
  communities: Community[];
  levels: number;
  totalModularity: number;
  entityToCommunity: Map<EntityId, CommunityId[]>; // レベルごと
}

export interface CommunityDetectionOptions {
  /**
   * 解像度パラメータ（大きいほど小さいコミュニティを検出）
   */
  resolution?: number;

  /**
   * 最大階層レベル
   */
  maxLevels?: number;

  /**
   * 最小コミュニティサイズ
   */
  minCommunitySize?: number;

  /**
   * 乱数シード（再現性のため）
   */
  seed?: number;

  /**
   * 最大イテレーション数
   */
  maxIterations?: number;
}

export interface CommunityDetectionResult {
  structure: CommunityStructure;
  processingTimeMs: number;
  iterations: number;
}
```

---

## 5. 実装仕様

### 5.1 コミュニティ検出インターフェース

```typescript
// packages/shared/src/services/graph/community-detector.ts
import type { Result } from "@/types/result";

export interface ICommunityDetector {
  /**
   * グラフからコミュニティを検出
   */
  detect(
    graphStore: IKnowledgeGraphStore,
    options?: CommunityDetectionOptions,
  ): Promise<Result<CommunityDetectionResult, Error>>;

  /**
   * 検出結果をDBに保存
   */
  saveResults(structure: CommunityStructure): Promise<Result<void, Error>>;

  /**
   * エンティティが属するコミュニティを取得
   */
  getCommunitiesForEntity(
    entityId: EntityId,
  ): Promise<Result<Community[], Error>>;

  /**
   * 特定レベルのコミュニティ一覧を取得
   */
  getCommunitiesByLevel(level: number): Promise<Result<Community[], Error>>;

  /**
   * コミュニティのメンバーエンティティを取得
   */
  getCommunityMembers(
    communityId: CommunityId,
  ): Promise<Result<StoredEntity[], Error>>;
}
```

### 5.2 Leidenアルゴリズム実装

```typescript
// packages/shared/src/services/graph/leiden-algorithm.ts
export class LeidenAlgorithm {
  private readonly defaultOptions: CommunityDetectionOptions = {
    resolution: 1.0,
    maxLevels: 3,
    minCommunitySize: 2,
    maxIterations: 100,
  };

  /**
   * Leidenアルゴリズムのメイン処理
   */
  async detect(
    nodes: EntityId[],
    edges: Array<{ source: EntityId; target: EntityId; weight: number }>,
    options?: CommunityDetectionOptions,
  ): Promise<CommunityDetectionResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const startTime = performance.now();

    // 初期化: 各ノードを独自のコミュニティに
    let partition = this.initializePartition(nodes);
    let graph = this.buildGraph(nodes, edges);

    let totalIterations = 0;
    const levelCommunities: Community[][] = [];

    // 階層的にコミュニティを検出
    for (let level = 0; level < mergedOptions.maxLevels!; level++) {
      // Phase 1: ローカル移動（モジュラリティ最適化）
      const { partition: newPartition, iterations } = this.localMovePhase(
        graph,
        partition,
        mergedOptions,
      );
      partition = newPartition;
      totalIterations += iterations;

      // Phase 2: リファインメント（Leiden特有）
      partition = this.refinementPhase(graph, partition, mergedOptions);

      // Phase 3: 集約（次のレベルへ）
      const levelResult = this.extractCommunities(
        partition,
        nodes,
        edges,
        level,
      );
      levelCommunities.push(levelResult);

      // 収束チェック
      if (levelResult.length <= 1) break;

      // グラフを集約
      const { aggregatedGraph, nodeMapping } = this.aggregateGraph(
        graph,
        partition,
      );
      graph = aggregatedGraph;
      partition = this.initializePartition(
        Array.from(nodeMapping.keys()) as EntityId[],
      );
    }

    // 階層構造を構築
    const structure = this.buildHierarchy(levelCommunities);

    return {
      structure,
      processingTimeMs: performance.now() - startTime,
      iterations: totalIterations,
    };
  }

  /**
   * ローカル移動フェーズ（モジュラリティ最大化）
   */
  private localMovePhase(
    graph: Graph,
    partition: Map<EntityId, CommunityId>,
    options: CommunityDetectionOptions,
  ): { partition: Map<EntityId, CommunityId>; iterations: number } {
    let improved = true;
    let iterations = 0;

    while (improved && iterations < options.maxIterations!) {
      improved = false;
      iterations++;

      // ノードをランダムな順序で処理
      const nodes = this.shuffleArray(Array.from(partition.keys()));

      for (const node of nodes) {
        const currentCommunity = partition.get(node)!;
        const neighborCommunities = this.getNeighborCommunities(
          graph,
          node,
          partition,
        );

        let bestCommunity = currentCommunity;
        let bestDelta = 0;

        // 各隣接コミュニティへの移動を評価
        for (const community of neighborCommunities) {
          if (community === currentCommunity) continue;

          const delta = this.calculateModularityGain(
            graph,
            node,
            currentCommunity,
            community,
            partition,
            options.resolution!,
          );

          if (delta > bestDelta) {
            bestDelta = delta;
            bestCommunity = community;
          }
        }

        // 改善があれば移動
        if (bestCommunity !== currentCommunity) {
          partition.set(node, bestCommunity);
          improved = true;
        }
      }
    }

    return { partition, iterations };
  }

  /**
   * リファインメントフェーズ（Leiden特有）
   * Louvainより高品質なコミュニティを生成
   */
  private refinementPhase(
    graph: Graph,
    partition: Map<EntityId, CommunityId>,
    options: CommunityDetectionOptions,
  ): Map<EntityId, CommunityId> {
    const refined = new Map(partition);

    // 各コミュニティ内でサブコミュニティを検出
    const communities = this.groupByCommunity(partition);

    for (const [communityId, members] of communities) {
      if (members.length < options.minCommunitySize! * 2) continue;

      // サブグラフを作成
      const subgraph = this.extractSubgraph(graph, members);

      // シングルトンに初期化
      const subPartition = new Map<EntityId, CommunityId>();
      for (const member of members) {
        subPartition.set(member, `${communityId}_sub_${member}` as CommunityId);
      }

      // ローカル移動を適用
      const { partition: refinedSubPartition } = this.localMovePhase(
        subgraph,
        subPartition,
        { ...options, maxIterations: 10 },
      );

      // 結果を統合
      for (const [node, subCommunity] of refinedSubPartition) {
        refined.set(node, subCommunity);
      }
    }

    return refined;
  }

  /**
   * モジュラリティゲインを計算
   */
  private calculateModularityGain(
    graph: Graph,
    node: EntityId,
    currentCommunity: CommunityId,
    targetCommunity: CommunityId,
    partition: Map<EntityId, CommunityId>,
    resolution: number,
  ): number {
    const m = graph.totalWeight;
    const ki = graph.getNodeDegree(node);

    // ターゲットコミュニティへの接続重み
    const kiIn = this.getConnectionWeight(
      graph,
      node,
      targetCommunity,
      partition,
    );

    // 現在コミュニティからの接続重み
    const kiOut = this.getConnectionWeight(
      graph,
      node,
      currentCommunity,
      partition,
    );

    // コミュニティの総次数
    const sigmaTot = this.getCommunityDegree(graph, targetCommunity, partition);
    const sigmaIn = this.getCommunityDegree(graph, currentCommunity, partition);

    // モジュラリティゲイン
    const deltaQ =
      (kiIn - kiOut) / m -
      resolution * ki * ((sigmaTot - sigmaIn) / (2 * m * m));

    return deltaQ;
  }

  /**
   * 階層構造を構築
   */
  private buildHierarchy(levelCommunities: Community[][]): CommunityStructure {
    const allCommunities: Community[] = [];
    const entityToCommunity = new Map<EntityId, CommunityId[]>();

    // 親子関係を設定
    for (let level = 0; level < levelCommunities.length; level++) {
      for (const community of levelCommunities[level]) {
        community.level = level;

        // 親コミュニティを見つける
        if (level > 0) {
          const parentLevel = levelCommunities[level - 1];
          for (const parent of parentLevel) {
            if (
              community.memberEntityIds.some((id) =>
                parent.memberEntityIds.includes(id),
              )
            ) {
              community.parentCommunityId = parent.id;
              parent.childCommunityIds.push(community.id);
              break;
            }
          }
        }

        // エンティティとコミュニティのマッピング
        for (const entityId of community.memberEntityIds) {
          const communities = entityToCommunity.get(entityId) ?? [];
          communities.push(community.id);
          entityToCommunity.set(entityId, communities);
        }

        allCommunities.push(community);
      }
    }

    const totalModularity = this.calculateTotalModularity(allCommunities);

    return {
      communities: allCommunities,
      levels: levelCommunities.length,
      totalModularity,
      entityToCommunity,
    };
  }

  // ヘルパーメソッドは省略
}
```

### 5.3 コミュニティ検出サービス

```typescript
export class CommunityDetector implements ICommunityDetector {
  constructor(
    private readonly leiden: LeidenAlgorithm,
    private readonly graphStore: IKnowledgeGraphStore,
    private readonly communityRepository: CommunityRepository,
  ) {}

  async detect(
    graphStore: IKnowledgeGraphStore,
    options?: CommunityDetectionOptions,
  ): Promise<Result<CommunityDetectionResult, Error>> {
    try {
      // グラフデータを取得
      const statsResult = await graphStore.getStats();
      if (!statsResult.success) {
        return err(statsResult.error);
      }

      // ノードとエッジを取得
      const nodesResult = await this.getAllEntityIds(graphStore);
      const edgesResult = await this.getAllRelations(graphStore);

      if (!nodesResult.success || !edgesResult.success) {
        return err(new Error("Failed to load graph data"));
      }

      // Leidenアルゴリズムを実行
      const result = await this.leiden.detect(
        nodesResult.data,
        edgesResult.data,
        options,
      );

      return ok(result);
    } catch (error) {
      return err(
        error instanceof Error
          ? error
          : new Error("Community detection failed"),
      );
    }
  }

  async saveResults(
    structure: CommunityStructure,
  ): Promise<Result<void, Error>> {
    try {
      // 既存のコミュニティを削除
      await this.communityRepository.deleteAll();

      // 新しいコミュニティを保存
      for (const community of structure.communities) {
        await this.communityRepository.insert(community);

        // エンティティ-コミュニティの関連を保存
        for (const entityId of community.memberEntityIds) {
          await this.communityRepository.addEntityCommunityMapping(
            entityId,
            community.id,
          );
        }
      }

      return ok(undefined);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Failed to save results"),
      );
    }
  }

  async getCommunitiesForEntity(
    entityId: EntityId,
  ): Promise<Result<Community[], Error>> {
    return this.communityRepository.findByEntityId(entityId);
  }

  async getCommunitiesByLevel(
    level: number,
  ): Promise<Result<Community[], Error>> {
    return this.communityRepository.findByLevel(level);
  }

  async getCommunityMembers(
    communityId: CommunityId,
  ): Promise<Result<StoredEntity[], Error>> {
    const community = await this.communityRepository.findById(communityId);
    if (!community.success || !community.data) {
      return err(new Error(`Community not found: ${communityId}`));
    }

    const entities: StoredEntity[] = [];
    for (const entityId of community.data.memberEntityIds) {
      const entity = await this.graphStore.getEntity(entityId);
      if (entity.success && entity.data) {
        entities.push(entity.data);
      }
    }

    return ok(entities);
  }
}
```

---

## 6. テストケース

```typescript
describe("LeidenAlgorithm", () => {
  it("コミュニティを検出できる", async () => {
    const leiden = new LeidenAlgorithm();
    const result = await leiden.detect(mockNodes, mockEdges, {
      resolution: 1.0,
    });

    expect(result.structure.communities.length).toBeGreaterThan(0);
    expect(result.structure.totalModularity).toBeGreaterThan(0);
  });

  it("階層的なコミュニティ構造を生成する", async () => {
    const leiden = new LeidenAlgorithm();
    const result = await leiden.detect(mockNodes, mockEdges, { maxLevels: 3 });

    expect(result.structure.levels).toBeLessThanOrEqual(3);
    // 親子関係が正しく設定されている
    const childCommunities = result.structure.communities.filter(
      (c) => c.parentCommunityId !== undefined,
    );
    expect(childCommunities.length).toBeGreaterThan(0);
  });

  it("resolution パラメータでコミュニティサイズが変わる", async () => {
    const leiden = new LeidenAlgorithm();

    const lowResResult = await leiden.detect(mockNodes, mockEdges, {
      resolution: 0.5,
    });
    const highResResult = await leiden.detect(mockNodes, mockEdges, {
      resolution: 2.0,
    });

    // 高解像度ではより多くの小さいコミュニティ
    expect(highResResult.structure.communities.length).toBeGreaterThan(
      lowResResult.structure.communities.length,
    );
  });
});

describe("CommunityDetector", () => {
  it("検出結果を保存・取得できる", async () => {
    const detector = new CommunityDetector(leiden, graphStore, communityRepo);

    const detectResult = await detector.detect(graphStore);
    expect(detectResult.success).toBe(true);

    await detector.saveResults(detectResult.data.structure);

    const communities = await detector.getCommunitiesByLevel(0);
    expect(communities.success).toBe(true);
    expect(communities.data.length).toBeGreaterThan(0);
  });

  it("エンティティが属するコミュニティを取得できる", async () => {
    const detector = new CommunityDetector(leiden, graphStore, communityRepo);
    const result = await detector.getCommunitiesForEntity(entityId);

    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });
});
```

---

## 7. 完了条件

- [ ] `LeidenAlgorithm`が実装済み
- [ ] `ICommunityDetector`インターフェースが定義済み
- [ ] `CommunityDetector`が実装済み
- [ ] コミュニティ検出が動作する
- [ ] 階層的なコミュニティ構造が生成される
- [ ] resolutionパラメータで検出粒度を調整できる
- [ ] 検出結果のDB保存が動作する
- [ ] エンティティからコミュニティ取得が動作する
- [ ] レベル別コミュニティ取得が動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-08-03: コミュニティ要約生成

---

## 9. 参照情報

- CONV-04-05: Knowledge Graphテーブル（communitiesテーブル）
- CONV-08-01: Knowledge Graphストア
- CONV-08: Knowledge Graph構築（親タスク）
- [Leiden Algorithm Paper](https://www.nature.com/articles/s41598-019-41695-z)
- [Microsoft GraphRAG](https://github.com/microsoft/graphrag)

---

## 10. Leidenアルゴリズムのパラメータ

| パラメータ       | デフォルト | 説明                               |
| ---------------- | ---------- | ---------------------------------- |
| resolution       | 1.0        | 大きいほど小さいコミュニティを検出 |
| maxLevels        | 3          | 最大階層レベル                     |
| minCommunitySize | 2          | 最小コミュニティサイズ             |
| maxIterations    | 100        | 収束までの最大イテレーション       |
| seed             | undefined  | 乱数シード（再現性のため）         |
