# 統合テスト設計書: コミュニティ検出 (Leiden)

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| タスクID | CONV-08-02                |
| タスク名 | コミュニティ検出 (Leiden) |
| 作成日   | 2026-01-10                |
| スキル   | integration-testing       |

---

## 1. 統合テスト戦略

### 1.1 テスト範囲

| スコープ         | 対象コンポーネント                            | テストレベル |
| ---------------- | --------------------------------------------- | ------------ |
| コンポーネント間 | LeidenAlgorithm ↔ CommunityDetector           | 中間統合     |
| データ層連携     | CommunityDetector ↔ SQLiteCommunityRepository | データ統合   |
| 外部連携         | CommunityDetector ↔ IKnowledgeGraphStore      | 外部連携     |
| エンドツーエンド | GraphStore → Leiden → Repository → 取得       | E2E統合      |

### 1.2 テストアプローチ

| アプローチ           | 適用場面                 | ツール/手法          |
| -------------------- | ------------------------ | -------------------- |
| ボトムアップ         | リポジトリ層から順次統合 | 実DB（テスト用）     |
| モック利用           | 外部GraphStore連携テスト | vi.fn()モック        |
| テストデータベース   | 統合テスト用インメモリDB | better-sqlite3       |
| トランザクション分離 | 各テストの独立性確保     | beforeEach/afterEach |

---

## 2. コンポーネント依存関係

### 2.1 依存関係図

```
┌─────────────────────────────────────────────────────────────┐
│                   CommunityDetector                          │
│                   (Application Service)                      │
├─────────────────────────────────────────────────────────────┤
│                           │                                  │
│    ┌──────────────────────┼──────────────────────┐          │
│    │                      │                      │          │
│    ▼                      ▼                      ▼          │
│ ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│ │ LeidenAlgo-  │  │ IKnowledge-   │  │ ICommunity-      │  │
│ │ rithm        │  │ GraphStore    │  │ Repository       │  │
│ │ (Domain)     │  │ (Port)        │  │ (Port)           │  │
│ └──────────────┘  └───────┬───────┘  └────────┬─────────┘  │
│                           │                    │            │
└───────────────────────────┼────────────────────┼────────────┘
                            │                    │
                            ▼                    ▼
                   ┌───────────────┐  ┌──────────────────┐
                   │ SQLiteKnow-   │  │ SQLiteCommunity- │
                   │ ledgeGraph-   │  │ Repository       │
                   │ Store         │  │ (Adapter)        │
                   └───────┬───────┘  └────────┬─────────┘
                           │                    │
                           └────────┬───────────┘
                                    │
                                    ▼
                           ┌───────────────┐
                           │ SQLite/Turso  │
                           │ Database      │
                           └───────────────┘
```

### 2.2 統合ポイント

| 統合ポイント | 上流              | 下流                 | データ形式              |
| ------------ | ----------------- | -------------------- | ----------------------- |
| IP-01        | CommunityDetector | LeidenAlgorithm      | EntityId[], GraphEdge[] |
| IP-02        | CommunityDetector | IKnowledgeGraphStore | Result<Entity[], Error> |
| IP-03        | CommunityDetector | ICommunityRepository | Community, CommunityId  |
| IP-04        | SQLiteRepository  | Drizzle ORM          | SQL Operations          |

---

## 3. 統合テストシナリオ

### 3.1 GraphStore連携テスト

**ファイル**: `community-detector.integration.test.ts`

```typescript
describe("CommunityDetector GraphStore連携", () => {
  describe("データ取得", () => {
    it("GraphStoreからエンティティを取得できる", async () => {
      // Given: GraphStoreにエンティティが存在
      await graphStore.upsertEntity(testEntity);

      // When: detect()を実行
      const result = await detector.detect();

      // Then: GraphStoreのデータを使用してコミュニティを検出
      expect(isOk(result)).toBe(true);
    });

    it("GraphStoreからリレーションを取得できる", async () => {
      // Given: GraphStoreにリレーションが存在
      await graphStore.upsertRelation(testRelation);

      // When: detect()を実行
      const result = await detector.detect();

      // Then: リレーションがエッジとして使用される
      expect(isOk(result)).toBe(true);
    });
  });
});
```

### 3.2 データフローテスト

**ファイル**: `community-detector.flow.test.ts`

```typescript
describe("CommunityDetector データフロー", () => {
  it("GraphStore → Leiden → Repository の完全フロー", async () => {
    // Given: GraphStoreにテストデータ
    await setupGraphData(graphStore, testGraph);

    // When: detect → save → get の一連のフロー
    const detectResult = await detector.detect();
    expect(isOk(detectResult)).toBe(true);

    const saveResult = await detector.saveResults(detectResult.data.structure);
    expect(isOk(saveResult)).toBe(true);

    const getResult = await detector.getCommunitiesByLevel(0);
    expect(isOk(getResult)).toBe(true);

    // Then: 検出→保存→取得が一貫
    expect(getResult.data.length).toBe(
      detectResult.data.structure.communities.filter((c) => c.level === 0)
        .length,
    );
  });

  it("エンティティ→コミュニティマッピングが正しく保存される", async () => {
    // Given: 検出結果がある
    const detectResult = await detector.detect();
    await detector.saveResults(detectResult.data.structure);

    // When: エンティティからコミュニティを取得
    const entityId = testGraph.nodes[0];
    const result = await detector.getCommunitiesForEntity(entityId);

    // Then: マッピングが正しい
    expect(isOk(result)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });
});
```

### 3.3 エラーハンドリングテスト

**ファイル**: `community-detector.error.test.ts`

```typescript
describe("CommunityDetector エラーハンドリング", () => {
  describe("GraphStore障害", () => {
    it("GraphStore障害時にResult.errを返す", async () => {
      // Given: GraphStoreがエラーを返す
      mockGraphStore.getAllEntities.mockResolvedValue(
        err(new Error("Database connection failed")),
      );

      // When: detect()を実行
      const result = await detector.detect();

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
      expect(result.error.message).toContain("connection");
    });
  });

  describe("Repository障害", () => {
    it("保存失敗時にResult.errを返す", async () => {
      // Given: Repositoryがエラーを返す
      mockCommunityRepo.insertMany.mockResolvedValue(
        err(new Error("Insert failed")),
      );

      // When: saveResults()を実行
      const result = await detector.saveResults(testStructure);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });
  });

  describe("存在しないデータ", () => {
    it("存在しないコミュニティIDでエラー", async () => {
      // Given: 存在しないID
      const invalidId = createCommunityId("non-existent");

      // When: getCommunityMembers()を実行
      const result = await detector.getCommunityMembers(invalidId);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
      expect(result.error.message).toContain("not found");
    });
  });
});
```

### 3.4 再現性テスト

**ファイル**: `community-detector.reproducibility.test.ts`

```typescript
describe("CommunityDetector 再現性", () => {
  it("同一seedで同一結果が得られる", async () => {
    // Given: 同一データとseed
    const seed = 12345;
    await setupGraphData(graphStore, testGraph);

    // When: 同じseedで2回実行
    const result1 = await detector.detect({ seed });
    const result2 = await detector.detect({ seed });

    // Then: 結果が一致
    expect(isOk(result1)).toBe(true);
    expect(isOk(result2)).toBe(true);
    expect(result1.data.structure.communities.length).toBe(
      result2.data.structure.communities.length,
    );
    expect(result1.data.structure.totalModularity).toBe(
      result2.data.structure.totalModularity,
    );
  });

  it("異なるseedで異なる結果が得られる可能性", async () => {
    // Given: 同一データ、異なるseed
    await setupGraphData(graphStore, largTestGraph);

    // When: 異なるseedで実行
    const result1 = await detector.detect({ seed: 1 });
    const result2 = await detector.detect({ seed: 2 });

    // Then: 結果は異なる可能性がある（or 同じ場合もある）
    expect(isOk(result1)).toBe(true);
    expect(isOk(result2)).toBe(true);
    // Note: 小さなグラフでは結果が同じになることもある
  });
});
```

---

## 4. テストデータ管理

### 4.1 テストフィクスチャ

```typescript
/**
 * テストフィクスチャ: 2クラスター構造
 */
const twoClusterFixture = {
  entities: [
    { id: "entity-1", name: "Entity A", type: "concept" },
    { id: "entity-2", name: "Entity B", type: "concept" },
    { id: "entity-3", name: "Entity C", type: "concept" },
    { id: "entity-4", name: "Entity D", type: "concept" },
    { id: "entity-5", name: "Entity E", type: "concept" },
    { id: "entity-6", name: "Entity F", type: "concept" },
  ],
  relations: [
    // クラスター1: 1-2-3
    { source: "entity-1", target: "entity-2", type: "related", weight: 1.0 },
    { source: "entity-2", target: "entity-3", type: "related", weight: 1.0 },
    { source: "entity-3", target: "entity-1", type: "related", weight: 1.0 },
    // クラスター2: 4-5-6
    { source: "entity-4", target: "entity-5", type: "related", weight: 1.0 },
    { source: "entity-5", target: "entity-6", type: "related", weight: 1.0 },
    { source: "entity-6", target: "entity-4", type: "related", weight: 1.0 },
    // ブリッジ
    { source: "entity-3", target: "entity-4", type: "related", weight: 0.1 },
  ],
};

/**
 * テストフィクスチャ: 大規模グラフ
 */
function createLargeGraphFixture(nodeCount: number) {
  const entities = Array.from({ length: nodeCount }, (_, i) => ({
    id: `entity-${i}`,
    name: `Entity ${i}`,
    type: "concept",
  }));

  const relations: Array<{
    source: string;
    target: string;
    type: string;
    weight: number;
  }> = [];
  const clusterSize = Math.ceil(nodeCount / 5);

  for (let cluster = 0; cluster < 5; cluster++) {
    const start = cluster * clusterSize;
    const end = Math.min(start + clusterSize, nodeCount);

    for (let i = start; i < end; i++) {
      for (let j = i + 1; j < end; j++) {
        relations.push({
          source: entities[i].id,
          target: entities[j].id,
          type: "related",
          weight: 0.8 + Math.random() * 0.2,
        });
      }
    }
  }

  // クラスター間ブリッジ
  for (let cluster = 0; cluster < 4; cluster++) {
    relations.push({
      source: entities[cluster * clusterSize].id,
      target: entities[(cluster + 1) * clusterSize].id,
      type: "related",
      weight: 0.1,
    });
  }

  return { entities, relations };
}
```

### 4.2 テストデータベースセットアップ

```typescript
/**
 * テスト用インメモリDBセットアップ
 */
function createTestDatabase(): BetterSQLite3Database {
  const sqlite = new Database(":memory:");
  createTestSchema(sqlite);
  return drizzle(sqlite);
}

/**
 * テストDBスキーマ作成
 */
function createTestSchema(sqlite: Database.Database): void {
  sqlite.exec(`
    -- Communities table
    CREATE TABLE communities (
      id TEXT PRIMARY KEY,
      level INTEGER NOT NULL,
      member_entity_ids TEXT NOT NULL DEFAULT '[]',
      parent_community_id TEXT,
      child_community_ids TEXT NOT NULL DEFAULT '[]',
      size INTEGER NOT NULL,
      internal_edges INTEGER NOT NULL DEFAULT 0,
      external_edges INTEGER NOT NULL DEFAULT 0,
      modularity REAL NOT NULL DEFAULT 0,
      summary TEXT,
      summary_embedding BLOB,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX communities_level_idx ON communities(level);
    CREATE INDEX communities_parent_idx ON communities(parent_community_id);

    -- Entity-Community mapping table
    CREATE TABLE entity_communities (
      entity_id TEXT NOT NULL,
      community_id TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (entity_id, community_id),
      FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
    );

    CREATE INDEX entity_communities_entity_idx ON entity_communities(entity_id);
    CREATE INDEX entity_communities_community_idx ON entity_communities(community_id);
  `);
}
```

---

## 5. テスト分離戦略

### 5.1 トランザクション分離

```typescript
describe("CommunityDetector Integration", () => {
  let db: BetterSQLite3Database;
  let graphStore: IKnowledgeGraphStore;
  let detector: ICommunityDetector;

  beforeEach(async () => {
    // 各テスト前に新しいDBを作成
    db = createTestDatabase();
    graphStore = createKnowledgeGraphStore(db);
    detector = createCommunityDetector(db, graphStore);
  });

  afterEach(async () => {
    // テスト後にクリーンアップ
    // インメモリDBは自動破棄
  });
});
```

### 5.2 並列実行対応

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // 統合テストは直列実行
    testTimeout: 30000,
    hookTimeout: 10000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true, // 統合テストは単一プロセス
      },
    },
  },
});
```

---

## 6. テストカテゴリとファイル構成

### 6.1 ファイル構成

```
packages/shared/src/services/graph/__tests__/
├── leiden-algorithm.test.ts              # ユニットテスト
├── community-detector.test.ts            # ユニットテスト（モック使用）
├── community-repository.test.ts          # 統合テスト（実DB）
├── community-detector.integration.test.ts # GraphStore連携
├── community-detector.flow.test.ts       # データフロー
├── community-detector.error.test.ts      # エラーハンドリング
├── community-detector.reproducibility.test.ts # 再現性
└── fixtures/
    ├── test-graphs.ts                    # テストグラフ定義
    └── test-database.ts                  # テストDB設定
```

### 6.2 テストカテゴリ

| カテゴリ       | ファイル                   | 実行時間 | 依存   |
| -------------- | -------------------------- | -------- | ------ |
| ユニットテスト | \*.test.ts                 | < 1秒    | モック |
| 統合テスト     | \*.integration.test.ts     | < 5秒    | 実DB   |
| フローテスト   | \*.flow.test.ts            | < 10秒   | 実DB   |
| エラーテスト   | \*.error.test.ts           | < 3秒    | モック |
| 再現性テスト   | \*.reproducibility.test.ts | < 5秒    | 実DB   |

---

## 7. CI/CD統合

### 7.1 テスト実行設定

```yaml
# .github/workflows/test.yml
jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Run integration tests
        run: pnpm --filter @repo/shared test -- --coverage
        timeout-minutes: 10
```

### 7.2 テスト結果レポート

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    reporters: ["verbose", "json"],
    outputFile: {
      json: "./test-results/results.json",
    },
    coverage: {
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
    },
  },
});
```

---

## 8. 検証チェックリスト

### 8.1 統合テスト観点

- [ ] GraphStore連携: データ取得が正しく動作
- [ ] Repository連携: CRUD操作が正しく動作
- [ ] データフロー: detect → save → get が一貫
- [ ] エラー伝播: Result.errが正しく伝播
- [ ] トランザクション: 部分失敗時のロールバック
- [ ] 再現性: seed指定で同一結果

### 8.2 パフォーマンス観点

- [ ] 1000ノード検出: < 10秒
- [ ] メモリ使用量: < グラフの3倍
- [ ] 同時実行: デッドロックなし

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-10 | 初版作成 |
