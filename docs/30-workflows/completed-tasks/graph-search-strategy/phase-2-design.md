# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 2                     |
| Phase名    | 設計                  |
| 前提Phase  | Phase 1               |
| 後続Phase  | Phase 3               |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | graph-search-strategy |

---

## 目的

Phase 1で定義した要件を実現可能な構造に落とし込む。GraphSearchStrategyのアーキテクチャ、クラス設計、データフローを設計する。

## 背景

GraphSearchStrategyは、既存のISearchStrategyインターフェースに準拠しつつ、Knowledge Graph Store、Embedding Provider、Community Summarizerの3つの依存サービスを統合する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: システム構造の設計とパターン選定

**実行手順**:

1. 既存のISearchStrategy実装（KeywordSearchStrategy, VectorSearchStrategy）を参照
2. GraphSearchStrategyのクラス構造を設計
3. 依存関係（DI: Dependency Injection）を設計
4. ASCII図でアーキテクチャを可視化

**期待される成果物**:

- アーキテクチャ設計書（`outputs/phase-2/architecture-design.md`）

---

### タスク2: ドメインモデリング

**目的**: エンティティ・関係・型の定義

**実行手順**:

1. 入力型（GraphSearchOptions）を設計
2. 出力型（SearchResultItem拡張メタデータ）を設計
3. 内部型（エンティティチャンク、パス情報等）を設計

**期待される成果物**:

- ドメインモデル（`outputs/phase-2/domain-model.md`）

---

### タスク3: データフロー設計

**目的**: 検索処理の流れを設計

**実行手順**:

1. localSearch のデータフローを設計
2. globalSearch のデータフローを設計
3. relationshipSearch のデータフローを設計
4. スコアリングロジックを設計

**期待される成果物**:

- データフロー図（`outputs/phase-2/data-flow.md`）

---

## 参照資料

| 参照資料        | パス                                                                         | 内容             |
| --------------- | ---------------------------------------------------------------------------- | ---------------- |
| Phase 1成果物   | `outputs/phase-1/requirements-definition.md`                                 | 要件定義         |
| 既存実装        | `packages/shared/src/services/search/strategies/`                            | 参照実装         |
| ISearchStrategy | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | インターフェース |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                     |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| ISearchStrategy      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                | 検索戦略インターフェース |
| IKnowledgeGraphStore | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | グラフストアAPI          |

---

## 成果物

| 成果物         | パス                                     | 内容             |
| -------------- | ---------------------------------------- | ---------------- |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | システム構造     |
| ドメインモデル | `outputs/phase-2/domain-model.md`        | エンティティ定義 |
| データフロー   | `outputs/phase-2/data-flow.md`           | 処理フロー       |

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント        | 契約定義                                                                   |
| ------------------- | -------------------------------------------------------------------------- |
| GraphStore          | IKnowledgeGraphStore.findSimilarEntities(), traverse(), findShortestPath() |
| EmbeddingProvider   | IEmbeddingProvider.embedSingle()                                           |
| CommunitySummarizer | ICommunitySummarizer.searchSummaries()                                     |
| ChunkRepository     | entity_chunk_links経由でチャンク取得                                       |

---

## 完了条件

- [ ] アーキテクチャが定義されている（クラス図、依存関係図）
- [ ] ドメインモデルが作成されている（型定義、インターフェース）
- [ ] データフローが設計されている（3種類の検索フロー）
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3: 設計レビューゲート へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 既存ISearchStrategy実装の参照
2. GraphSearchStrategyクラス構造設計
3. 依存関係（DI）設計
4. 入力型（GraphSearchOptions）設計
5. 出力型・内部型設計
6. localSearchデータフロー設計
7. globalSearchデータフロー設計
8. relationshipSearchデータフロー設計
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/graph-search-strategy --phase 2
```

---

## Phase実行記録

| 項目            | 内容                     |
| --------------- | ------------------------ |
| 実行開始日時    | {{EXECUTION_START}}      |
| 実行完了日時    | {{EXECUTION_END}}        |
| 実行者          | {{EXECUTOR}}             |
| 成果物確認      | [ ] 全て生成済み         |
| artifacts.json  | [ ] 更新済み             |
| 次Phase移行可否 | [ ] 可 / [ ] 否（理由:） |

---

## 設計詳細

### クラス設計

```typescript
// packages/shared/src/services/search/strategies/graph-search-strategy.ts

export class GraphSearchStrategy implements ISearchStrategy {
  readonly name = "graph";

  constructor(
    private readonly graphStore: IKnowledgeGraphStore,
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly communitySummarizer?: ICommunitySummarizer
  ) {}

  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions
  ): Promise<Result<SearchResultItem[], Error>>;

  // 内部メソッド
  private async localSearch(...): Promise<Result<SearchResultItem[], Error>>;
  private async globalSearch(...): Promise<Result<SearchResultItem[], Error>>;
  private async relationshipSearch(...): Promise<Result<SearchResultItem[], Error>>;

  // ユーティリティ
  private async extractQueryEntities(query: string): Promise<EntityMatch[]>;
  private async getEntityChunks(entityId: EntityId, filters?: SearchFilters): Promise<Result<ChunkInfo[], Error>>;
  private calculateLocalScore(entitySimilarity: number, chunkRelevance: number): number;
  private calculatePathScore(distance: number, chunkRelevance: number): number;
  private calculateTraversalScore(depth: number, chunkRelevance: number): number;
}
```

### GraphSearchOptions型

```typescript
export interface GraphSearchOptions {
  /** クエリタイプ（検索戦略の選択に使用） */
  queryType?: QueryType;

  /** エンティティ類似度の閾値（デフォルト: 0.5） */
  entityThreshold?: number;

  /** コミュニティ類似度の閾値（デフォルト: 0.4） */
  communityThreshold?: number;

  /** グラフトラバーサルの最大深度（デフォルト: 3） */
  traversalDepth?: number;

  /** フィルタする関係タイプ */
  relationTypes?: string[];
}
```

### 検索フロー概要

```
┌──────────────────────────────────────────────────────────────┐
│                    GraphSearchStrategy.search()               │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  options.queryType                                             │
│        │                                                       │
│        ├─ "local" ────→ localSearch()                         │
│        │                 │                                     │
│        │                 ├─ embedQuery()                       │
│        │                 ├─ findSimilarEntities()              │
│        │                 └─ getEntityChunks()                  │
│        │                                                       │
│        ├─ "global" ───→ globalSearch()                        │
│        │                 │                                     │
│        │                 ├─ embedQuery()                       │
│        │                 └─ searchSummaries()                  │
│        │                                                       │
│        └─ "relationship" → relationshipSearch()               │
│                           │                                    │
│                           ├─ extractQueryEntities()            │
│                           ├─ findShortestPath()                │
│                           └─ traverse()                        │
│                                                                │
│  結果を score でソート → limit 件を返却                       │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-strategy/phase-3-design-review.md`
