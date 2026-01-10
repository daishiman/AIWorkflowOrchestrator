/**
 * @file Leidenアルゴリズム実装
 * @module @repo/shared/services/graph/leiden-algorithm
 * @description グラフのコミュニティ検出を行うLeidenアルゴリズム
 */

import type { EntityId, CommunityId } from "../../types/rag/branded";
import {
  createCommunityId,
  generateCommunityId,
} from "../../types/rag/branded";
import type {
  GraphEdge,
  Community,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
} from "./types";

// =============================================================================
// 内部型定義
// =============================================================================

/**
 * 隣接リスト形式のグラフ表現
 */
interface AdjacencyList {
  /** ノード→隣接ノードと重みのマップ */
  readonly neighbors: Map<EntityId, Map<EntityId, number>>;
  /** ノードの次数（重み合計） */
  readonly degrees: Map<EntityId, number>;
  /** グラフ全体のエッジ重み合計（2m） */
  readonly totalWeight: number;
}

/**
 * ローカル移動フェーズの結果
 */
interface LocalMoveResult {
  /** ノード→コミュニティのマッピング */
  readonly nodeToCommunity: Map<EntityId, CommunityId>;
  /** 変更があったかどうか */
  readonly improved: boolean;
}

/**
 * リファインメントフェーズの結果
 */
interface RefinementResult {
  /** ノード→コミュニティのマッピング */
  readonly nodeToCommunity: Map<EntityId, CommunityId>;
}

/**
 * 集約されたグラフ（将来の拡張用）
 * @internal
 */
interface _AggregatedGraph {
  /** 新しいノード（コミュニティを表す） */
  readonly nodes: CommunityId[];
  /** 新しいエッジ（コミュニティ間） */
  readonly edges: GraphEdge[];
  /** 元ノード→新コミュニティのマッピング */
  readonly nodeMapping: Map<EntityId, CommunityId>;
}

// =============================================================================
// Leidenアルゴリズム実装
// =============================================================================

/**
 * Leidenアルゴリズムによるコミュニティ検出
 *
 * @description
 * モジュラリティ最大化に基づくコミュニティ検出アルゴリズム。
 * Louvain法を改良し、より高品質な分割を生成する。
 *
 * @example
 * const leiden = new LeidenAlgorithm();
 * const result = leiden.detect(nodes, edges, { resolution: 1.0 });
 */
export class LeidenAlgorithm {
  /** デフォルトオプション */
  private readonly defaultOptions: Required<CommunityDetectionOptions> = {
    resolution: 1.0,
    maxLevels: 3,
    minCommunitySize: 2,
    maxIterations: 100,
    seed: 0,
  };

  /**
   * コミュニティを検出する
   *
   * @param nodes ノードIDリスト
   * @param edges エッジリスト
   * @param options 検出オプション
   * @returns コミュニティ検出結果
   */
  detect(
    nodes: EntityId[],
    edges: GraphEdge[],
    options?: CommunityDetectionOptions,
  ): CommunityDetectionResult {
    const startTime = performance.now();
    const opts = this.mergeOptions(options);

    // 空グラフの処理
    if (nodes.length === 0) {
      return this.createEmptyResult(opts, startTime);
    }

    // 隣接リスト構築
    const graph = this.buildAdjacencyList(nodes, edges);

    // 初期コミュニティ割り当て（各ノードが独自コミュニティ）
    let nodeToCommunity = this.initializeCommunities(nodes);

    // 階層構造を格納
    const hierarchyLevels: Map<EntityId, CommunityId>[] = [];
    let totalIterations = 0;
    let converged = false;

    // Leidenアルゴリズムのメインループ
    for (let level = 0; level < opts.maxLevels; level++) {
      let levelImproved = false;

      for (let iter = 0; iter < opts.maxIterations; iter++) {
        totalIterations++;

        // Phase 1: ローカル移動
        const moveResult = this.localMovePhase(
          graph,
          nodeToCommunity,
          opts.resolution,
          opts.seed,
        );

        if (!moveResult.improved) {
          converged = true;
          break;
        }

        levelImproved = true;
        nodeToCommunity = moveResult.nodeToCommunity;

        // Phase 2: リファインメント
        const refineResult = this.refinementPhase(
          graph,
          nodeToCommunity,
          opts.resolution,
          opts.seed,
        );
        nodeToCommunity = refineResult.nodeToCommunity;
      }

      // このレベルの割り当てを保存
      hierarchyLevels.push(new Map(nodeToCommunity));

      if (!levelImproved) {
        break;
      }

      // コミュニティ数が1つなら終了
      const uniqueCommunities = new Set(nodeToCommunity.values());
      if (uniqueCommunities.size <= 1) {
        break;
      }
    }

    // 階層構造を構築
    const structure = this.buildHierarchy(
      nodes,
      edges,
      hierarchyLevels,
      graph,
      opts,
    );

    const processingTimeMs = performance.now() - startTime;

    return {
      structure,
      processingTimeMs,
      options: opts,
      stats: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        communityCount: structure.communities.length,
        iterationsRun: totalIterations,
        converged,
      },
    };
  }

  // ===========================================================================
  // Private: オプション処理
  // ===========================================================================

  /**
   * オプションをマージする
   */
  private mergeOptions(
    options?: CommunityDetectionOptions,
  ): Required<CommunityDetectionOptions> {
    return {
      resolution: options?.resolution ?? this.defaultOptions.resolution,
      maxLevels: Math.min(
        Math.max(options?.maxLevels ?? this.defaultOptions.maxLevels, 1),
        10,
      ),
      minCommunitySize:
        options?.minCommunitySize ?? this.defaultOptions.minCommunitySize,
      maxIterations: Math.min(
        Math.max(
          options?.maxIterations ?? this.defaultOptions.maxIterations,
          1,
        ),
        1000,
      ),
      seed: options?.seed ?? this.defaultOptions.seed,
    };
  }

  // ===========================================================================
  // Private: グラフ構築
  // ===========================================================================

  /**
   * 隣接リストを構築する
   */
  private buildAdjacencyList(
    nodes: EntityId[],
    edges: GraphEdge[],
  ): AdjacencyList {
    const neighbors = new Map<EntityId, Map<EntityId, number>>();
    const degrees = new Map<EntityId, number>();
    let totalWeight = 0;

    // ノードを初期化
    for (const node of nodes) {
      neighbors.set(node, new Map());
      degrees.set(node, 0);
    }

    // エッジを追加（無向グラフとして扱う）
    for (const edge of edges) {
      if (edge.source === edge.target) continue; // 自己ループを無視
      if (edge.weight <= 0) continue; // 無効な重みを無視

      const sourceNeighbors = neighbors.get(edge.source);
      const targetNeighbors = neighbors.get(edge.target);

      if (!sourceNeighbors || !targetNeighbors) continue;

      // 既存エッジがあれば重みを加算
      const existingWeight = sourceNeighbors.get(edge.target) ?? 0;
      sourceNeighbors.set(edge.target, existingWeight + edge.weight);
      targetNeighbors.set(edge.source, existingWeight + edge.weight);

      // 次数を更新
      degrees.set(edge.source, (degrees.get(edge.source) ?? 0) + edge.weight);
      degrees.set(edge.target, (degrees.get(edge.target) ?? 0) + edge.weight);

      totalWeight += edge.weight;
    }

    return { neighbors, degrees, totalWeight };
  }

  /**
   * 初期コミュニティ割り当て
   */
  private initializeCommunities(nodes: EntityId[]): Map<EntityId, CommunityId> {
    const nodeToCommunity = new Map<EntityId, CommunityId>();
    for (const node of nodes) {
      nodeToCommunity.set(node, createCommunityId(node));
    }
    return nodeToCommunity;
  }

  // ===========================================================================
  // Private: ローカル移動フェーズ
  // ===========================================================================

  /**
   * ローカル移動フェーズ
   *
   * @description
   * 各ノードを最もモジュラリティゲインが大きい隣接コミュニティに移動する
   */
  private localMovePhase(
    graph: AdjacencyList,
    nodeToCommunity: Map<EntityId, CommunityId>,
    resolution: number,
    seed: number,
  ): LocalMoveResult {
    const newMapping = new Map(nodeToCommunity);
    let improved = false;

    // ノードをシャッフル
    const nodeList = Array.from(graph.neighbors.keys());
    this.shuffleArray(nodeList, seed);

    // コミュニティの内部重み合計をキャッシュ
    const communityTotals = this.calculateCommunityTotals(graph, newMapping);

    for (const node of nodeList) {
      const currentCommunity = newMapping.get(node);
      if (!currentCommunity) continue;

      const nodeNeighbors = graph.neighbors.get(node);
      if (!nodeNeighbors) continue;

      const nodeDegree = graph.degrees.get(node) ?? 0;

      // 隣接コミュニティを収集
      const neighborCommunities = this.getNeighborCommunities(
        nodeNeighbors,
        newMapping,
      );

      // 現在のコミュニティから削除した場合のゲインを計算
      const currentSum = this.calculateSumTowardsCommunity(
        nodeNeighbors,
        currentCommunity,
        newMapping,
      );

      let bestCommunity = currentCommunity;
      let bestGain = 0;

      for (const targetCommunity of neighborCommunities) {
        if (targetCommunity === currentCommunity) continue;

        const gain = this.calculateModularityGain(
          node,
          targetCommunity,
          nodeNeighbors,
          newMapping,
          communityTotals,
          nodeDegree,
          currentSum,
          graph.totalWeight,
          resolution,
        );

        if (gain > bestGain) {
          bestGain = gain;
          bestCommunity = targetCommunity;
        }
      }

      // より良いコミュニティが見つかった場合、移動
      if (bestCommunity !== currentCommunity) {
        // コミュニティ重み合計を更新
        const currentTotal = communityTotals.get(currentCommunity) ?? 0;
        communityTotals.set(currentCommunity, currentTotal - nodeDegree);

        const bestTotal = communityTotals.get(bestCommunity) ?? 0;
        communityTotals.set(bestCommunity, bestTotal + nodeDegree);

        newMapping.set(node, bestCommunity);
        improved = true;
      }
    }

    return { nodeToCommunity: newMapping, improved };
  }

  /**
   * コミュニティの重み合計を計算
   */
  private calculateCommunityTotals(
    graph: AdjacencyList,
    nodeToCommunity: Map<EntityId, CommunityId>,
  ): Map<CommunityId, number> {
    const totals = new Map<CommunityId, number>();

    for (const [node, community] of nodeToCommunity) {
      const degree = graph.degrees.get(node) ?? 0;
      totals.set(community, (totals.get(community) ?? 0) + degree);
    }

    return totals;
  }

  /**
   * 隣接コミュニティを取得
   */
  private getNeighborCommunities(
    nodeNeighbors: Map<EntityId, number>,
    nodeToCommunity: Map<EntityId, CommunityId>,
  ): Set<CommunityId> {
    const communities = new Set<CommunityId>();

    for (const neighbor of nodeNeighbors.keys()) {
      const community = nodeToCommunity.get(neighbor);
      if (community) {
        communities.add(community);
      }
    }

    return communities;
  }

  /**
   * 特定コミュニティへの重み合計を計算
   */
  private calculateSumTowardsCommunity(
    nodeNeighbors: Map<EntityId, number>,
    community: CommunityId,
    nodeToCommunity: Map<EntityId, CommunityId>,
  ): number {
    let sum = 0;

    for (const [neighbor, weight] of nodeNeighbors) {
      if (nodeToCommunity.get(neighbor) === community) {
        sum += weight;
      }
    }

    return sum;
  }

  /**
   * モジュラリティゲインを計算
   */
  private calculateModularityGain(
    _node: EntityId,
    targetCommunity: CommunityId,
    nodeNeighbors: Map<EntityId, number>,
    nodeToCommunity: Map<EntityId, CommunityId>,
    communityTotals: Map<CommunityId, number>,
    nodeDegree: number,
    currentSum: number,
    totalWeight: number,
    resolution: number,
  ): number {
    if (totalWeight === 0) return 0;

    // ターゲットコミュニティへの重み合計
    const targetSum = this.calculateSumTowardsCommunity(
      nodeNeighbors,
      targetCommunity,
      nodeToCommunity,
    );

    // コミュニティの総次数
    const targetTotal = communityTotals.get(targetCommunity) ?? 0;

    // モジュラリティゲイン計算
    const deltaQ =
      (targetSum - currentSum) / totalWeight +
      (resolution *
        nodeDegree *
        (targetTotal -
          (communityTotals.get(nodeToCommunity.get(_node)!) ?? 0) +
          nodeDegree)) /
        (2 * totalWeight * totalWeight);

    return deltaQ;
  }

  // ===========================================================================
  // Private: リファインメントフェーズ
  // ===========================================================================

  /**
   * リファインメントフェーズ
   *
   * @description
   * Leidenアルゴリズムの特徴。
   * 各コミュニティ内でさらに細分化を試みる。
   */
  private refinementPhase(
    graph: AdjacencyList,
    nodeToCommunity: Map<EntityId, CommunityId>,
    resolution: number,
    seed: number,
  ): RefinementResult {
    const newMapping = new Map(nodeToCommunity);

    // コミュニティごとにノードをグループ化
    const communityNodes = new Map<CommunityId, EntityId[]>();
    for (const [node, community] of nodeToCommunity) {
      const nodes = communityNodes.get(community) ?? [];
      nodes.push(node);
      communityNodes.set(community, nodes);
    }

    // 各コミュニティ内でリファインメント
    for (const [community, nodes] of communityNodes) {
      if (nodes.length <= 2) continue; // 小さすぎるコミュニティはスキップ

      // コミュニティ内のノードをシャッフル
      this.shuffleArray(nodes, seed);

      // サブコミュニティを試行
      for (const node of nodes) {
        const nodeNeighbors = graph.neighbors.get(node);
        if (!nodeNeighbors) continue;

        // 同じコミュニティ内の隣接ノードのみを考慮
        const inCommunityNeighbors = new Map<EntityId, number>();
        for (const [neighbor, weight] of nodeNeighbors) {
          if (nodeToCommunity.get(neighbor) === community) {
            inCommunityNeighbors.set(neighbor, weight);
          }
        }

        if (inCommunityNeighbors.size === 0) continue;

        // 接続強度が弱い場合、新しいサブコミュニティを作成
        const connectionStrength = this.calculateConnectionStrength(
          node,
          inCommunityNeighbors,
          graph,
        );

        if (connectionStrength < resolution * 0.5) {
          // 新しいコミュニティを作成
          const newCommunity = generateCommunityId();
          newMapping.set(node, newCommunity);
        }
      }
    }

    return { nodeToCommunity: newMapping };
  }

  /**
   * 接続強度を計算
   */
  private calculateConnectionStrength(
    node: EntityId,
    neighbors: Map<EntityId, number>,
    graph: AdjacencyList,
  ): number {
    const nodeDegree = graph.degrees.get(node) ?? 0;
    if (nodeDegree === 0) return 0;

    let neighborSum = 0;
    for (const weight of neighbors.values()) {
      neighborSum += weight;
    }

    return neighborSum / nodeDegree;
  }

  // ===========================================================================
  // Private: 階層構造構築
  // ===========================================================================

  /**
   * 階層構造を構築
   */
  private buildHierarchy(
    nodes: EntityId[],
    edges: GraphEdge[],
    hierarchyLevels: Map<EntityId, CommunityId>[],
    graph: AdjacencyList,
    options: Required<CommunityDetectionOptions>,
  ): CommunityStructure {
    if (hierarchyLevels.length === 0) {
      return {
        communities: [],
        levels: 0,
        totalModularity: 0,
        entityToCommunity: new Map(),
      };
    }

    const communities: Community[] = [];
    const entityToCommunity = new Map<EntityId, CommunityId[]>();
    const now = new Date();

    // レベルごとのコミュニティIDを保持（親コミュニティ検索用）
    const levelCommunities: Map<
      number,
      Map<CommunityId, EntityId[]>
    > = new Map();

    // 各レベルのコミュニティを構築
    for (let level = 0; level < hierarchyLevels.length; level++) {
      const levelMapping = hierarchyLevels[level];

      // コミュニティごとにメンバーを集計
      const communityMembers = new Map<CommunityId, EntityId[]>();
      for (const [node, community] of levelMapping) {
        const members = communityMembers.get(community) ?? [];
        members.push(node);
        communityMembers.set(community, members);
      }

      // このレベルのコミュニティを保存
      levelCommunities.set(level, communityMembers);

      // 各コミュニティを作成
      for (const [communityId, members] of communityMembers) {
        // 最小サイズチェック
        if (members.length < options.minCommunitySize) continue;

        // 内部・外部エッジをカウント
        const { internal, external } = this.countEdges(
          members,
          levelMapping,
          graph,
        );

        // モジュラリティ貢献を計算
        const modularity = this.calculateCommunityModularity(
          members,
          internal,
          graph,
        );

        // レベル1以上は親コミュニティIDを設定
        let parentCommunityId: CommunityId | undefined;
        if (level > 0) {
          const prevLevelMapping = hierarchyLevels[level - 1];
          // 最初のメンバーの前レベルでのコミュニティを親とする
          const firstMember = members[0];
          if (firstMember && prevLevelMapping) {
            parentCommunityId = prevLevelMapping.get(firstMember);
          }
        }

        const community: Community = {
          id: communityId,
          level,
          memberEntityIds: members,
          childCommunityIds: [],
          parentCommunityId,
          size: members.length,
          internalEdges: internal,
          externalEdges: external,
          modularity,
          createdAt: now,
          updatedAt: now,
        };

        communities.push(community);

        // エンティティ→コミュニティマッピングを更新
        for (const member of members) {
          const existing = entityToCommunity.get(member) ?? [];
          existing.push(communityId);
          entityToCommunity.set(member, existing);
        }
      }
    }

    // 全体モジュラリティを計算
    const totalModularity = this.calculateTotalModularity(
      hierarchyLevels[hierarchyLevels.length - 1],
      graph,
    );

    return {
      communities,
      levels: hierarchyLevels.length,
      totalModularity,
      entityToCommunity,
    };
  }

  /**
   * 内部・外部エッジをカウント
   */
  private countEdges(
    members: EntityId[],
    nodeToCommunity: Map<EntityId, CommunityId>,
    graph: AdjacencyList,
  ): { internal: number; external: number } {
    const memberSet = new Set(members);
    let internal = 0;
    let external = 0;

    for (const member of members) {
      const neighbors = graph.neighbors.get(member);
      if (!neighbors) continue;

      for (const [neighbor, weight] of neighbors) {
        if (memberSet.has(neighbor)) {
          internal += weight;
        } else {
          external += weight;
        }
      }
    }

    // 内部エッジは両端点からカウントされるので半分にする
    return { internal: internal / 2, external };
  }

  /**
   * コミュニティのモジュラリティを計算
   */
  private calculateCommunityModularity(
    members: EntityId[],
    internalEdges: number,
    graph: AdjacencyList,
  ): number {
    if (graph.totalWeight === 0) return 0;

    let totalDegree = 0;
    for (const member of members) {
      totalDegree += graph.degrees.get(member) ?? 0;
    }

    const m = graph.totalWeight;
    const modularity =
      internalEdges / m - (totalDegree * totalDegree) / (4 * m * m);

    return modularity;
  }

  /**
   * 全体モジュラリティを計算
   */
  private calculateTotalModularity(
    nodeToCommunity: Map<EntityId, CommunityId>,
    graph: AdjacencyList,
  ): number {
    if (graph.totalWeight === 0) return 0;

    // コミュニティごとにグループ化
    const communityMembers = new Map<CommunityId, EntityId[]>();
    for (const [node, community] of nodeToCommunity) {
      const members = communityMembers.get(community) ?? [];
      members.push(node);
      communityMembers.set(community, members);
    }

    let totalModularity = 0;
    for (const [, members] of communityMembers) {
      const { internal } = this.countEdges(members, nodeToCommunity, graph);
      const modularity = this.calculateCommunityModularity(
        members,
        internal,
        graph,
      );
      totalModularity += modularity;
    }

    return totalModularity;
  }

  // ===========================================================================
  // Private: ユーティリティ
  // ===========================================================================

  /**
   * 配列をシャッフルする（Fisher-Yates）
   *
   * @description
   * seedが指定されている場合は再現可能なシャッフルを行う
   */
  private shuffleArray<T>(array: T[], seed: number): void {
    const random = this.createSeededRandom(seed);

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * シード付き乱数生成器を作成
   */
  private createSeededRandom(seed: number): () => number {
    if (seed === 0) {
      return () => Math.random();
    }

    // Linear Congruential Generator (LCG)
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  /**
   * 空の結果を作成
   */
  private createEmptyResult(
    options: Required<CommunityDetectionOptions>,
    startTime: number,
  ): CommunityDetectionResult {
    return {
      structure: {
        communities: [],
        levels: 0,
        totalModularity: 0,
        entityToCommunity: new Map(),
      },
      processingTimeMs: performance.now() - startTime,
      options,
      stats: {
        nodeCount: 0,
        edgeCount: 0,
        communityCount: 0,
        iterationsRun: 0,
        converged: true,
      },
    };
  }
}
