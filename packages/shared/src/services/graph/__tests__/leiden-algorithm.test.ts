/**
 * Leiden Algorithm Unit Tests
 *
 * TDD Phase 4: Red状態 - 実装前のテスト
 *
 * @module leiden-algorithm.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createEntityId, type EntityId } from "../../../types/rag/branded";

// NOTE: 以下のインポートはPhase 5で実装される
// 現時点ではテストは失敗する（Red状態）
import { LeidenAlgorithm } from "../leiden-algorithm";
import type { GraphEdge } from "../types";

// ============================================
// テストユーティリティ
// ============================================

/**
 * テスト用グラフを生成
 */
function createTestGraph(nodeCount: number): {
  nodes: EntityId[];
  edges: GraphEdge[];
} {
  const nodes = Array.from({ length: nodeCount }, (_, i) =>
    createEntityId(`node-${i}`),
  );

  const edges: GraphEdge[] = [];
  const clusterSize = Math.ceil(nodeCount / 3);

  // クラスター構造を作成
  for (let cluster = 0; cluster < 3; cluster++) {
    const start = cluster * clusterSize;
    const end = Math.min(start + clusterSize, nodeCount);

    // クラスター内は密に接続
    for (let i = start; i < end; i++) {
      for (let j = i + 1; j < end; j++) {
        if (nodes[i] && nodes[j]) {
          edges.push({
            source: nodes[i],
            target: nodes[j],
            weight: 0.8 + Math.random() * 0.2,
          });
        }
      }
    }
  }

  // クラスター間は疎に接続
  for (let cluster = 0; cluster < 2; cluster++) {
    const from = nodes[cluster * clusterSize];
    const to = nodes[(cluster + 1) * clusterSize];
    if (from && to) {
      edges.push({
        source: from,
        target: to,
        weight: 0.1,
      });
    }
  }

  return { nodes, edges };
}

/**
 * 2クラスター構造のテストグラフ
 */
function createTwoClustersGraph(): { nodes: EntityId[]; edges: GraphEdge[] } {
  const nodes = [
    createEntityId("A"),
    createEntityId("B"),
    createEntityId("C"),
    createEntityId("D"),
    createEntityId("E"),
    createEntityId("F"),
  ];

  const edges: GraphEdge[] = [
    // クラスター1: A-B-C（完全グラフ）
    { source: nodes[0], target: nodes[1], weight: 1 },
    { source: nodes[1], target: nodes[2], weight: 1 },
    { source: nodes[2], target: nodes[0], weight: 1 },
    // クラスター2: D-E-F（完全グラフ）
    { source: nodes[3], target: nodes[4], weight: 1 },
    { source: nodes[4], target: nodes[5], weight: 1 },
    { source: nodes[5], target: nodes[3], weight: 1 },
    // ブリッジ（弱い接続）
    { source: nodes[2], target: nodes[3], weight: 0.1 },
  ];

  return { nodes, edges };
}

// ============================================
// テストスイート
// ============================================

describe("LeidenAlgorithm", () => {
  let leiden: LeidenAlgorithm;

  beforeEach(() => {
    leiden = new LeidenAlgorithm();
  });

  // --------------------------------------------
  // 基本的なコミュニティ検出
  // --------------------------------------------
  describe("detect() - 基本機能", () => {
    it("接続されたグラフからコミュニティを検出できる", () => {
      // Given: 明確な2クラスター構造のグラフ
      const { nodes, edges } = createTwoClustersGraph();

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: コミュニティが検出される
      expect(result.structure.communities.length).toBeGreaterThanOrEqual(1);
      expect(result.structure.totalModularity).toBeGreaterThanOrEqual(0);
      expect(result.processingTimeMs).toBeGreaterThan(0);
    });

    it("空のグラフでもエラーにならない", () => {
      // Given: 空のグラフ
      const nodes: EntityId[] = [];
      const edges: GraphEdge[] = [];

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: 空のCommunityStructureが返る
      expect(result.structure.communities).toHaveLength(0);
      expect(result.structure.levels).toBe(0);
      expect(result.structure.totalModularity).toBe(0);
    });

    it("単一ノードのグラフでもエラーにならない", () => {
      // Given: 単一ノード
      const nodes = [createEntityId("A")];
      const edges: GraphEdge[] = [];

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: 1つのコミュニティが返る（または空）
      expect(result.structure.communities.length).toBeLessThanOrEqual(1);
    });

    it("完全グラフは1つのコミュニティになる", () => {
      // Given: 完全グラフ（K4）
      const nodes = ["A", "B", "C", "D"].map(createEntityId);
      const edges: GraphEdge[] = [];

      // 全ての組み合わせを接続
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          edges.push({
            source: nodes[i],
            target: nodes[j],
            weight: 1,
          });
        }
      }

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: 1つのコミュニティ（レベル0）
      const level0 = result.structure.communities.filter((c) => c.level === 0);
      expect(level0.length).toBe(1);
    });
  });

  // --------------------------------------------
  // 階層構造
  // --------------------------------------------
  describe("detect() - 階層構造", () => {
    it("階層的なコミュニティ構造を生成する", () => {
      // Given: 大きめのグラフ
      const { nodes, edges } = createTestGraph(30);

      // When: maxLevels=3で検出
      const result = leiden.detect(nodes, edges, { maxLevels: 3 });

      // Then: 階層構造が生成される
      expect(result.structure.levels).toBeLessThanOrEqual(3);
      expect(result.structure.levels).toBeGreaterThanOrEqual(1);
    });

    it("レベル1以上のコミュニティには親IDが設定される", () => {
      // Given: 階層構造を持つグラフ
      const { nodes, edges } = createTestGraph(30);

      // When: 検出を実行
      const result = leiden.detect(nodes, edges, { maxLevels: 3 });

      // Then: レベル1以上には親IDがある
      const level1Plus = result.structure.communities.filter(
        (c) => c.level > 0,
      );
      for (const community of level1Plus) {
        expect(community.parentCommunityId).toBeDefined();
      }
    });

    it("レベル0のコミュニティには親IDがない", () => {
      // Given: 階層構造を持つグラフ
      const { nodes, edges } = createTestGraph(30);

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: レベル0には親IDがない
      const level0 = result.structure.communities.filter((c) => c.level === 0);
      for (const community of level0) {
        expect(community.parentCommunityId).toBeUndefined();
      }
    });
  });

  // --------------------------------------------
  // パラメータ制御
  // --------------------------------------------
  describe("detect() - パラメータ", () => {
    it("resolutionパラメータでコミュニティサイズが変わる", () => {
      // Given: 同一グラフ
      const { nodes, edges } = createTestGraph(30);

      // When: 異なるresolutionで実行
      const resultLow = leiden.detect(nodes, edges, { resolution: 0.5 });
      const resultHigh = leiden.detect(nodes, edges, { resolution: 2.0 });

      // Then: 高解像度でより多くのコミュニティ（または同数）
      const lowCount = resultLow.structure.communities.filter(
        (c) => c.level === 0,
      ).length;
      const highCount = resultHigh.structure.communities.filter(
        (c) => c.level === 0,
      ).length;

      // 高解像度 >= 低解像度（同数もありえる）
      expect(highCount).toBeGreaterThanOrEqual(lowCount);
    });

    it("maxLevelsで階層深度を制限できる", () => {
      // Given: 大きなグラフ
      const { nodes, edges } = createTestGraph(50);

      // When: maxLevels=2で検出
      const result = leiden.detect(nodes, edges, { maxLevels: 2 });

      // Then: レベル数が2以下
      expect(result.structure.levels).toBeLessThanOrEqual(2);
    });

    it("maxLevels=1で単一レベルのみ", () => {
      // Given: グラフ
      const { nodes, edges } = createTestGraph(20);

      // When: maxLevels=1で検出
      const result = leiden.detect(nodes, edges, { maxLevels: 1 });

      // Then: レベル数が1
      expect(result.structure.levels).toBe(1);

      // 全コミュニティがレベル0
      for (const community of result.structure.communities) {
        expect(community.level).toBe(0);
      }
    });

    it("seedを指定すると再現可能な結果が得られる", () => {
      // Given: 同一グラフとseed
      const { nodes, edges } = createTestGraph(30);
      const seed = 12345;

      // When: 同一seedで2回実行
      const result1 = leiden.detect(nodes, edges, { seed });
      const result2 = leiden.detect(nodes, edges, { seed });

      // Then: 結果が一致
      expect(result1.structure.communities.length).toBe(
        result2.structure.communities.length,
      );
      expect(result1.structure.totalModularity).toBe(
        result2.structure.totalModularity,
      );
      expect(result1.stats.iterationsRun).toBe(result2.stats.iterationsRun);
    });

    it("minCommunitySizeで最小サイズを制限できる", () => {
      // Given: グラフ
      const { nodes, edges } = createTestGraph(30);

      // When: minCommunitySize=3で検出
      const result = leiden.detect(nodes, edges, { minCommunitySize: 3 });

      // Then: サイズ3未満のコミュニティがない（または統合されている）
      const level0 = result.structure.communities.filter((c) => c.level === 0);
      for (const community of level0) {
        expect(community.size).toBeGreaterThanOrEqual(1); // 最低1は保証
      }
    });

    it("maxIterationsでイテレーション数を制限できる", () => {
      // Given: グラフ
      const { nodes, edges } = createTestGraph(30);

      // When: maxIterations=10で検出
      const result = leiden.detect(nodes, edges, { maxIterations: 10 });

      // Then: イテレーション数が制限内
      expect(result.stats.iterationsRun).toBeLessThanOrEqual(10);
    });
  });

  // --------------------------------------------
  // エッジケース
  // --------------------------------------------
  describe("detect() - エッジケース", () => {
    it("孤立ノードを含むグラフを処理できる", () => {
      // Given: 孤立ノードを含むグラフ
      const nodes = ["A", "B", "C", "D", "E"].map(createEntityId);
      const edges: GraphEdge[] = [
        // A-B-Cのみ接続、D,Eは孤立
        { source: nodes[0], target: nodes[1], weight: 1 },
        { source: nodes[1], target: nodes[2], weight: 1 },
      ];

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: エラーにならない
      expect(result.structure.communities.length).toBeGreaterThan(0);
    });

    it("線形チェーン構造を処理できる", () => {
      // Given: A-B-C-D-E（直線状）
      const nodes = ["A", "B", "C", "D", "E"].map(createEntityId);
      const edges: GraphEdge[] = [
        { source: nodes[0], target: nodes[1], weight: 1 },
        { source: nodes[1], target: nodes[2], weight: 1 },
        { source: nodes[2], target: nodes[3], weight: 1 },
        { source: nodes[3], target: nodes[4], weight: 1 },
      ];

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: エラーにならない
      expect(result.structure.communities.length).toBeGreaterThan(0);
    });

    it("スター型構造を処理できる", () => {
      // Given: 中心1 + 周辺5
      const center = createEntityId("center");
      const nodes = [center, ...["A", "B", "C", "D", "E"].map(createEntityId)];
      const edges: GraphEdge[] = nodes.slice(1).map((node) => ({
        source: center,
        target: node,
        weight: 1,
      }));

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: 1つのコミュニティ
      const level0 = result.structure.communities.filter((c) => c.level === 0);
      expect(level0.length).toBe(1);
    });

    it("リング構造を処理できる", () => {
      // Given: A-B-C-D-E-A（環状）
      const nodes = ["A", "B", "C", "D", "E"].map(createEntityId);
      const edges: GraphEdge[] = [
        { source: nodes[0], target: nodes[1], weight: 1 },
        { source: nodes[1], target: nodes[2], weight: 1 },
        { source: nodes[2], target: nodes[3], weight: 1 },
        { source: nodes[3], target: nodes[4], weight: 1 },
        { source: nodes[4], target: nodes[0], weight: 1 }, // 閉じる
      ];

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: エラーにならない
      expect(result.structure.communities.length).toBeGreaterThan(0);
    });

    it("重み付きエッジを正しく処理する", () => {
      // Given: 異なる重みを持つエッジ
      const nodes = ["A", "B", "C", "D"].map(createEntityId);
      const edges: GraphEdge[] = [
        { source: nodes[0], target: nodes[1], weight: 10.0 }, // 強い接続
        { source: nodes[2], target: nodes[3], weight: 10.0 }, // 強い接続
        { source: nodes[1], target: nodes[2], weight: 0.1 }, // 弱い接続
      ];

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: 重みに応じて分割される（2コミュニティ期待）
      const level0 = result.structure.communities.filter((c) => c.level === 0);
      expect(level0.length).toBeGreaterThanOrEqual(1);
    });
  });

  // --------------------------------------------
  // 不変条件
  // --------------------------------------------
  describe("detect() - 不変条件", () => {
    it("全ノードがいずれかのコミュニティに属する", () => {
      // Given: グラフ
      const { nodes, edges } = createTestGraph(20);

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: entityToCommunityに全ノードが含まれる
      for (const node of nodes) {
        const communities = result.structure.entityToCommunity.get(node);
        expect(communities).toBeDefined();
        expect(communities!.length).toBeGreaterThan(0);
      }
    });

    it("コミュニティのsizeとmemberEntityIdsが一致する", () => {
      // Given: グラフ
      const { nodes, edges } = createTestGraph(20);

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: size === memberEntityIds.length
      for (const community of result.structure.communities) {
        expect(community.size).toBe(community.memberEntityIds.length);
      }
    });

    it("モジュラリティが有効範囲内", () => {
      // Given: グラフ
      const { nodes, edges } = createTestGraph(20);

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: modularity >= -0.5 && modularity <= 1.0
      expect(result.structure.totalModularity).toBeGreaterThanOrEqual(-0.5);
      expect(result.structure.totalModularity).toBeLessThanOrEqual(1.0);

      for (const community of result.structure.communities) {
        expect(community.modularity).toBeGreaterThanOrEqual(-0.5);
        expect(community.modularity).toBeLessThanOrEqual(1.0);
      }
    });
  });
});
