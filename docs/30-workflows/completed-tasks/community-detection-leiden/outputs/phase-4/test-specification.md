# テスト仕様書: コミュニティ検出 (Leiden)

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| タスクID | CONV-08-02                |
| タスク名 | コミュニティ検出 (Leiden) |
| 作成日   | 2026-01-10                |
| スキル   | tdd-principles            |
| Phase    | Red（テストファースト）   |

---

## 1. テスト設計チャーター

### 1.1 テスト目的

| 目的ID | 目的                                         | 期待結果                            |
| ------ | -------------------------------------------- | ----------------------------------- |
| TP-001 | Leidenアルゴリズムが正しくコミュニティを検出 | CommunityStructureが返される        |
| TP-002 | 階層的なコミュニティ構造が生成される         | parent/child関係が正しく設定される  |
| TP-003 | パラメータによる検出制御が機能する           | resolution/maxLevels/seedが影響する |
| TP-004 | 検出結果の永続化が正しく動作する             | DB保存・取得が成功する              |
| TP-005 | エラーハンドリングが適切に機能する           | Result.err()が返される              |

### 1.2 テスト対象コンポーネント

| コンポーネント            | テスト種別       | 優先度 |
| ------------------------- | ---------------- | ------ |
| LeidenAlgorithm           | Unit Test        | 高     |
| CommunityDetector         | Unit Test        | 高     |
| SQLiteCommunityRepository | Integration Test | 中     |
| ICommunityDetector        | Contract Test    | 中     |

---

## 2. TDDサイクル計画

### 2.1 Red Phase（現フェーズ）

失敗するテストを作成する。

| サイクル | テスト対象                       | 失敗理由                              |
| -------- | -------------------------------- | ------------------------------------- |
| R-001    | 基本的なコミュニティ検出         | LeidenAlgorithmが未実装               |
| R-002    | 空グラフ処理                     | 空グラフハンドリングが未実装          |
| R-003    | 階層構造生成                     | buildHierarchy()が未実装              |
| R-004    | seedによる再現性                 | shuffleArray()が未実装                |
| R-005    | 検出結果の保存                   | CommunityDetector.saveResults()未実装 |
| R-006    | エンティティからコミュニティ取得 | getCommunitiesForEntity()未実装       |

### 2.2 テストファイル構成

```
packages/shared/src/services/graph/__tests__/
├── leiden-algorithm.test.ts       # LeidenAlgorithm Unit Tests
├── community-detector.test.ts     # CommunityDetector Unit Tests
├── community-repository.test.ts   # SQLiteCommunityRepository Integration Tests
└── community-detector.integration.test.ts  # End-to-End Integration Tests
```

---

## 3. テストケース設計

### 3.1 LeidenAlgorithm テストケース

#### TC-LA-001: 基本的なコミュニティ検出

```typescript
describe("LeidenAlgorithm", () => {
  describe("detect()", () => {
    it("接続されたグラフからコミュニティを検出できる", () => {
      // Given: 明確な2クラスター構造のグラフ
      const nodes = [
        createEntityId("A"),
        createEntityId("B"),
        createEntityId("C"),
        createEntityId("D"),
        createEntityId("E"),
        createEntityId("F"),
      ];
      const edges = [
        // クラスター1: A-B-C
        { source: createEntityId("A"), target: createEntityId("B"), weight: 1 },
        { source: createEntityId("B"), target: createEntityId("C"), weight: 1 },
        { source: createEntityId("C"), target: createEntityId("A"), weight: 1 },
        // クラスター2: D-E-F
        { source: createEntityId("D"), target: createEntityId("E"), weight: 1 },
        { source: createEntityId("E"), target: createEntityId("F"), weight: 1 },
        { source: createEntityId("F"), target: createEntityId("D"), weight: 1 },
        // ブリッジ（弱い接続）
        {
          source: createEntityId("C"),
          target: createEntityId("D"),
          weight: 0.1,
        },
      ];

      // When: 検出を実行
      const result = leiden.detect(nodes, edges);

      // Then: 2つのコミュニティが検出される
      expect(result.structure.communities.length).toBeGreaterThanOrEqual(2);
      expect(result.structure.totalModularity).toBeGreaterThan(0);
    });
  });
});
```

#### TC-LA-002: 空グラフ処理

```typescript
it("空のグラフでもエラーにならない", () => {
  // Given: 空のグラフ
  const nodes: EntityId[] = [];
  const edges: GraphEdge[] = [];

  // When: 検出を実行
  const result = leiden.detect(nodes, edges);

  // Then: 空のCommunityStructureが返る
  expect(result.structure.communities).toHaveLength(0);
  expect(result.structure.levels).toBe(0);
});
```

#### TC-LA-003: 階層構造生成

```typescript
it("階層的なコミュニティ構造を生成する", () => {
  // Given: 大規模なグラフ
  const { nodes, edges } = generateLargeGraph(50);

  // When: maxLevels=3で検出
  const result = leiden.detect(nodes, edges, { maxLevels: 3 });

  // Then: 階層構造が生成される
  expect(result.structure.levels).toBeLessThanOrEqual(3);
  expect(result.structure.levels).toBeGreaterThan(0);

  // 親子関係の検証
  const level1Communities = result.structure.communities.filter(
    (c) => c.level === 1,
  );
  for (const community of level1Communities) {
    expect(community.parentCommunityId).toBeDefined();
  }
});
```

#### TC-LA-004: seedによる再現性

```typescript
it("seedを指定すると再現可能な結果が得られる", () => {
  // Given: 同一グラフとseed
  const { nodes, edges } = generateLargeGraph(30);
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
});
```

### 3.2 CommunityDetector テストケース

#### TC-CD-001: 検出と保存

```typescript
describe("CommunityDetector", () => {
  it("検出結果を保存・取得できる", async () => {
    // Given: GraphStoreにデータがある
    // When: detect() → saveResults() → getCommunitiesByLevel()
    const detectResult = await detector.detect();
    expect(isOk(detectResult)).toBe(true);

    const saveResult = await detector.saveResults(detectResult.data.structure);
    expect(isOk(saveResult)).toBe(true);

    const getResult = await detector.getCommunitiesByLevel(0);
    expect(isOk(getResult)).toBe(true);
    expect(getResult.data.length).toBeGreaterThan(0);
  });
});
```

#### TC-CD-002: エンティティからコミュニティ取得

```typescript
it("エンティティが属するコミュニティを取得できる", async () => {
  // Given: コミュニティが保存されている
  // When: getCommunitiesForEntity()
  const result = await detector.getCommunitiesForEntity(testEntityId);

  // Then: コミュニティリストが返される
  expect(isOk(result)).toBe(true);
  expect(result.data.length).toBeGreaterThan(0);
});
```

#### TC-CD-003: エラーハンドリング

```typescript
it("存在しないコミュニティのメンバー取得でエラー", async () => {
  // Given: 存在しないコミュニティID
  const invalidId = createCommunityId("non-existent");

  // When: getCommunityMembers()
  const result = await detector.getCommunityMembers(invalidId);

  // Then: Result.err()が返される
  expect(isErr(result)).toBe(true);
  expect(result.error.message).toContain("not found");
});
```

---

## 4. テストデータ設計

### 4.1 テスト用グラフ構造

```typescript
/**
 * 明確な2クラスター構造（テスト用）
 */
const twoCliquesGraph = {
  nodes: ["A", "B", "C", "D", "E", "F"].map(createEntityId),
  edges: [
    // クリーク1: A-B-C（完全グラフ）
    { source: "A", target: "B", weight: 1 },
    { source: "B", target: "C", weight: 1 },
    { source: "C", target: "A", weight: 1 },
    // クリーク2: D-E-F（完全グラフ）
    { source: "D", target: "E", weight: 1 },
    { source: "E", target: "F", weight: 1 },
    { source: "F", target: "D", weight: 1 },
    // ブリッジ（弱い接続）
    { source: "C", target: "D", weight: 0.1 },
  ].map((e) => ({
    source: createEntityId(e.source),
    target: createEntityId(e.target),
    weight: e.weight,
  })),
};

/**
 * 単一コミュニティ構造（完全グラフ）
 */
const singleClique = {
  nodes: ["A", "B", "C", "D"].map(createEntityId),
  edges: [
    { source: "A", target: "B", weight: 1 },
    { source: "A", target: "C", weight: 1 },
    { source: "A", target: "D", weight: 1 },
    { source: "B", target: "C", weight: 1 },
    { source: "B", target: "D", weight: 1 },
    { source: "C", target: "D", weight: 1 },
  ].map((e) => ({
    source: createEntityId(e.source),
    target: createEntityId(e.target),
    weight: e.weight,
  })),
};

/**
 * 孤立ノードを含むグラフ
 */
const graphWithIsolatedNodes = {
  nodes: ["A", "B", "C", "D", "E"].map(createEntityId),
  edges: [
    // A-B-Cのみ接続
    { source: "A", target: "B", weight: 1 },
    { source: "B", target: "C", weight: 1 },
    // D, Eは孤立
  ].map((e) => ({
    source: createEntityId(e.source),
    target: createEntityId(e.target),
    weight: e.weight,
  })),
};
```

### 4.2 テスト用グラフ生成関数

```typescript
/**
 * 大規模グラフを生成
 */
function generateLargeGraph(nodeCount: number): {
  nodes: EntityId[];
  edges: GraphEdge[];
} {
  const nodes = Array.from({ length: nodeCount }, (_, i) =>
    createEntityId(`node-${i}`),
  );

  const edges: GraphEdge[] = [];
  // クラスター構造を持つエッジを生成
  const clusterSize = Math.ceil(nodeCount / 5);
  for (let cluster = 0; cluster < 5; cluster++) {
    const start = cluster * clusterSize;
    const end = Math.min(start + clusterSize, nodeCount);

    // クラスター内は密に接続
    for (let i = start; i < end; i++) {
      for (let j = i + 1; j < end; j++) {
        edges.push({
          source: nodes[i],
          target: nodes[j],
          weight: 0.8 + Math.random() * 0.2,
        });
      }
    }
  }

  // クラスター間は疎に接続
  for (let cluster = 0; cluster < 4; cluster++) {
    edges.push({
      source: nodes[cluster * clusterSize],
      target: nodes[(cluster + 1) * clusterSize],
      weight: 0.1,
    });
  }

  return { nodes, edges };
}
```

---

## 5. モック設計

### 5.1 IKnowledgeGraphStore モック

```typescript
const mockGraphStore: IKnowledgeGraphStore = {
  getEntity: vi.fn().mockResolvedValue(ok(null)),
  getAllEntities: vi.fn().mockResolvedValue(ok([])),
  getRelationsByEntity: vi.fn().mockResolvedValue(ok([])),
  getStats: vi.fn().mockResolvedValue(ok({ entities: 0, relations: 0 })),
  // ... other methods
};
```

### 5.2 ICommunityRepository モック

```typescript
const mockCommunityRepo: ICommunityRepository = {
  insert: vi.fn().mockResolvedValue(ok({})),
  insertMany: vi.fn().mockResolvedValue(ok([])),
  findById: vi.fn().mockResolvedValue(ok(null)),
  findByEntityId: vi.fn().mockResolvedValue(ok([])),
  findByLevel: vi.fn().mockResolvedValue(ok([])),
  deleteAll: vi.fn().mockResolvedValue(ok(undefined)),
  addEntityCommunityMapping: vi.fn().mockResolvedValue(ok(undefined)),
  addEntityCommunityMappings: vi.fn().mockResolvedValue(ok(undefined)),
};
```

---

## 6. テスト実行計画

### 6.1 実行順序

| 順序 | テストファイル                         | 目的                   |
| ---- | -------------------------------------- | ---------------------- |
| 1    | leiden-algorithm.test.ts               | アルゴリズム単体テスト |
| 2    | community-detector.test.ts             | サービス単体テスト     |
| 3    | community-repository.test.ts           | リポジトリ統合テスト   |
| 4    | community-detector.integration.test.ts | エンドツーエンドテスト |

### 6.2 実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/shared test

# 特定ファイルのみ
pnpm --filter @repo/shared test -- leiden-algorithm

# カバレッジ付き
pnpm --filter @repo/shared test -- --coverage
```

---

## 7. テストカバレッジ目標

| カテゴリ          | 目標    | 測定方法          |
| ----------------- | ------- | ----------------- |
| Line Coverage     | 80%以上 | vitest --coverage |
| Branch Coverage   | 75%以上 | vitest --coverage |
| Function Coverage | 90%以上 | vitest --coverage |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-10 | 初版作成 |
