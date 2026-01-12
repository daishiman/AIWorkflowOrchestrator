# GraphSearchStrategy テスト仕様書

> Phase 4 成果物
> 作成日: 2026-01-13
> 機能名: graph-search-strategy

---

## 概要

Phase 1の受け入れ基準をテストケースにマッピングし、TDD（Red）フェーズでのテスト設計を行う。

---

## テスト戦略

### テストレベル

| レベル   | 対象                          | 目的                               |
| -------- | ----------------------------- | ---------------------------------- |
| ユニット | GraphSearchStrategy各メソッド | 個々のメソッドの動作検証           |
| 統合     | 依存サービス連携              | IKnowledgeGraphStore等との連携確認 |

### カバレッジ目標

| 指標     | 目標値 | 説明             |
| -------- | ------ | ---------------- |
| Line     | 80%+   | 実行行カバレッジ |
| Branch   | 60%+   | 分岐カバレッジ   |
| Function | 80%+   | 関数カバレッジ   |

---

## 受け入れ基準→テストマッピング

### FR-001: ISearchStrategy実装

| 受け入れ基準                       | テストケース                        | テストファイル |
| ---------------------------------- | ----------------------------------- | -------------- |
| nameプロパティが"graph"を返す      | `name property returns "graph"`     | unit           |
| search()がResult型を返す           | `search returns Result type`        | unit           |
| getMetrics()がStrategyMetricを返す | `getMetrics returns StrategyMetric` | unit           |

### FR-002: ローカル検索

| 受け入れ基準                           | テストケース                           | テストファイル |
| -------------------------------------- | -------------------------------------- | -------------- |
| エンティティベース検索が動作する       | `localSearch finds entities`           | unit           |
| エンティティメタデータが含まれる       | `results include entity metadata`      | unit           |
| 類似度閾値でフィルタされる             | `filters by entity threshold`          | unit           |
| エンティティが見つからない場合は空配列 | `returns empty array when no entities` | unit           |
| 関連チャンクが取得される               | `retrieves entity chunks`              | integration    |

### FR-003: グローバル検索

| 受け入れ基準                                | テストケース                                  | テストファイル |
| ------------------------------------------- | --------------------------------------------- | -------------- |
| コミュニティサマリベース検索が動作する      | `globalSearch finds community summaries`      | unit           |
| コミュニティレベル情報が含まれる            | `results include community level`             | unit           |
| CommunitySummarizer未設定時はフォールバック | `fallbacks to localSearch when no summarizer` | unit           |

### FR-004: 関係検索

| 受け入れ基準                       | テストケース                           | テストファイル |
| ---------------------------------- | -------------------------------------- | -------------- |
| エンティティ間の関係検索が動作する | `relationshipSearch finds paths`       | unit           |
| パス距離がメタデータに含まれる     | `results include path distance`        | unit           |
| 2エンティティ未満はフォールバック  | `fallbacks when less than 2 entities`  | unit           |
| 最大深度を超えない                 | `respects max traversal depth`         | unit           |
| 最短経路が検索される               | `finds shortest path between entities` | integration    |

### FR-005: クエリタイプ対応

| 受け入れ基準                                 | テストケース                             | テストファイル |
| -------------------------------------------- | ---------------------------------------- | -------------- |
| queryType="local"で正しくルーティング        | `routes to localSearch for local type`   | unit           |
| queryType="global"で正しくルーティング       | `routes to globalSearch for global type` | unit           |
| queryType="relationship"で正しくルーティング | `routes to relationshipSearch`           | unit           |
| デフォルトはlocalSearch                      | `defaults to localSearch`                | unit           |

### FR-006: スコアリング

| 受け入れ基準                 | テストケース                             | テストファイル |
| ---------------------------- | ---------------------------------------- | -------------- |
| スコアが0-1の範囲            | `scores are in 0-1 range`                | unit           |
| 結果がスコア順でソートされる | `results are sorted by score`            | unit           |
| localスコア計算が正しい      | `local score = entity*0.6 + chunk*0.4`   | unit           |
| globalスコア計算が正しい     | `global score equals summary similarity` | unit           |
| pathスコア計算が正しい       | `path score = distance*0.5 + chunk*0.5`  | unit           |

### FR-007: フィルタ対応

| 受け入れ基準                      | テストケース                   | テストファイル |
| --------------------------------- | ------------------------------ | -------------- |
| fileIdsフィルタが適用される       | `applies fileIds filter`       | unit           |
| entityTypesフィルタが適用される   | `applies entityTypes filter`   | unit           |
| relationTypesフィルタが適用される | `applies relationTypes filter` | unit           |

### FR-008: エラーハンドリング

| 受け入れ基準                      | テストケース                               | テストファイル |
| --------------------------------- | ------------------------------------------ | -------------- |
| 埋め込みプロバイダーエラー時にerr | `returns err on embedding failure`         | unit           |
| グラフストアエラー時にerr         | `returns err on graph store failure`       | unit           |
| 部分的エラーでも他の結果を返す    | `returns partial results on partial error` | unit           |
| 空クエリでエラーを返す            | `returns err on empty query`               | unit           |
| クエリが長すぎる場合にエラー      | `returns err on query too long`            | unit           |
| 無効なlimitでエラー               | `returns err on invalid limit`             | unit           |

---

## テストカテゴリ

### 正常系テスト

| カテゴリ           | テスト数 | 概要                         |
| ------------------ | -------- | ---------------------------- |
| 基本検索           | 5        | search()メソッドの基本動作   |
| localSearch        | 6        | エンティティベース検索       |
| globalSearch       | 5        | コミュニティサマリベース検索 |
| relationshipSearch | 6        | 関係パスベース検索           |
| スコアリング       | 6        | スコア計算と結果ソート       |
| フィルタ           | 5        | 各種フィルタ適用             |

### 異常系テスト

| カテゴリ           | テスト数 | 概要                 |
| ------------------ | -------- | -------------------- |
| バリデーション     | 4        | 入力検証エラー       |
| 依存サービスエラー | 4        | 外部サービス障害     |
| 部分エラー         | 2        | 一部失敗時の継続動作 |

### 境界値テスト

| カテゴリ  | テスト数 | 概要                        |
| --------- | -------- | --------------------------- |
| limit境界 | 4        | limit=1, limit=100等        |
| 閾値境界  | 4        | threshold=0, threshold=1等  |
| 深度境界  | 3        | traversalDepth=1, depth=5等 |

---

## モック設計

### IKnowledgeGraphStore モック

```typescript
const mockGraphStore: IKnowledgeGraphStore = {
  findSimilarEntities: vi.fn(),
  traverse: vi.fn(),
  findShortestPath: vi.fn(),
  getRelationsByEntity: vi.fn(),
  // 他のメソッドはテスト対象外
};
```

### IEmbeddingProvider モック

```typescript
const mockEmbeddingProvider: IEmbeddingProvider = {
  modelId: "text-embedding-3-small",
  providerName: "openai",
  dimensions: 384,
  maxTokens: 8192,
  embed: vi.fn().mockResolvedValue({
    embedding: new Float32Array(384),
    tokenCount: 10,
  }),
  embedBatch: vi.fn(),
  countTokens: vi.fn(),
  healthCheck: vi.fn(),
};
```

### ICommunitySummarizer モック

```typescript
const mockCommunitySummarizer: ICommunitySummarizer = {
  summarize: vi.fn(),
  summarizeAll: vi.fn(),
  searchSummaries: vi.fn(),
  updateSummary: vi.fn(),
};
```

---

## テストデータ

### サンプルエンティティ

```typescript
const mockEntities: EntityMatch[] = [
  {
    entityId: "entity-1" as EntityId,
    name: "TypeScript",
    type: "technology",
    similarity: 0.85,
    description: "プログラミング言語",
  },
  {
    entityId: "entity-2" as EntityId,
    name: "JavaScript",
    type: "technology",
    similarity: 0.75,
  },
];
```

### サンプルチャンク

```typescript
const mockChunks: ChunkInfo[] = [
  {
    chunkId: "chunk-1" as ChunkId,
    content: "TypeScriptの型システムについて",
    contextualContent: "プログラミング言語の解説",
    relevance: 0.9,
  },
];
```

### サンプルパス

```typescript
const mockPath: PathInfo = {
  entityIds: ["entity-1", "entity-2"] as EntityId[],
  relationIds: ["rel-1"] as RelationId[],
  distance: 1,
  relations: [
    {
      relationId: "rel-1" as RelationId,
      sourceEntityId: "entity-1" as EntityId,
      targetEntityId: "entity-2" as EntityId,
      relationType: "related_to",
    },
  ],
};
```

---

## 変更履歴

| 日付       | 変更内容                |
| ---------- | ----------------------- |
| 2026-01-13 | 初版作成（Phase 4完了） |
