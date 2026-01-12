# Phase 5: 実装（TDD: Green）- タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装                  |
| 前提Phase  | Phase 4               |
| 後続Phase  | Phase 6               |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | graph-search-strategy |

---

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。TDD原則に従い、テストをパスさせることに集中する。

## 背景

TDDのGreenフェーズでは、テストを通すための最小限の実装を行う。過度な最適化やリファクタリングはPhase 8で行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: GraphSearchStrategyクラス実装

**目的**: ISearchStrategyインターフェースを実装

**実行手順**:

1. `packages/shared/src/services/search/strategies/graph-search-strategy.ts`を作成
2. constructorで依存関係を注入
3. name プロパティを実装（"graph"）
4. search()メソッドのスケルトンを実装
5. getMetrics()メソッドを実装

**期待される成果物**:

- GraphSearchStrategyクラス

---

### タスク2: localSearch実装

**目的**: エンティティベースの検索機能を実装

**実行手順**:

1. クエリの埋め込みを生成（embeddingProvider.embedSingle）
2. 類似エンティティを検索（graphStore.findSimilarEntities）
3. エンティティに関連するチャンクを取得（getEntityChunks）
4. スコアを計算（calculateLocalScore）
5. 結果をSearchResultItem形式で返却

**期待される成果物**:

- localSearchメソッド

---

### タスク3: globalSearch実装

**目的**: コミュニティサマリベースの検索機能を実装

**実行手順**:

1. クエリの埋め込みを生成
2. 類似コミュニティサマリを検索（communitySummarizer.searchSummaries）
3. コミュニティ情報を含む結果を返却
4. CommunitySummarizer未設定時のフォールバック実装

**期待される成果物**:

- globalSearchメソッド

---

### タスク4: relationshipSearch実装

**目的**: エンティティ間の関係検索機能を実装

**実行手順**:

1. クエリからエンティティを抽出（extractQueryEntities）
2. エンティティ間の最短経路を検索（graphStore.findShortestPath）
3. パス上のエッジに関連するチャンクを取得
4. グラフトラバーサルで関連コンテンツを取得（graphStore.traverse）
5. 2エンティティ未満の場合はlocalSearchにフォールバック

**期待される成果物**:

- relationshipSearchメソッド

---

### タスク5: ユーティリティ関数実装

**目的**: スコアリング・ヘルパー関数を実装

**実行手順**:

1. calculateLocalScore() - ローカル検索のスコア計算
2. calculatePathScore() - パス検索のスコア計算
3. calculateTraversalScore() - トラバーサル検索のスコア計算
4. extractQueryEntities() - クエリからエンティティ抽出
5. getEntityChunks() - エンティティに関連するチャンク取得
6. getRelationChunks() - 関係に関連するチャンク取得

**期待される成果物**:

- ユーティリティ関数群

---

## 参照資料

| 参照資料       | パス                                                                    | 内容          |
| -------------- | ----------------------------------------------------------------------- | ------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                 | Phase 4成果物 |
| アーキテクチャ | `outputs/phase-2/architecture-design.md`                                | Phase 2成果物 |
| タスク指示書   | `docs/30-workflows/unassigned-task/task-07-04-graph-search-strategy.md` | 実装例        |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                     |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| ISearchStrategy      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                | 検索戦略インターフェース |
| IKnowledgeGraphStore | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | グラフストアAPI          |

---

## 成果物

| 成果物     | パス                                                                      | 説明     |
| ---------- | ------------------------------------------------------------------------- | -------- |
| 実装コード | `packages/shared/src/services/search/strategies/graph-search-strategy.ts` | 機能実装 |

---

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目            | 内容                                                      |
| ------------------- | --------------------------------------------------------- |
| GraphStore接続      | IKnowledgeGraphStore経由でfindSimilarEntities等を呼び出し |
| EmbeddingProvider   | IEmbeddingProvider.embedSingle()でクエリ埋め込み生成      |
| CommunitySummarizer | ICommunitySummarizer.searchSummaries()でサマリ検索        |
| エラーハンドリング  | Result型でラップして返却                                  |

---

## 完了条件

- [ ] GraphSearchStrategyクラスが実装済み
- [ ] localSearch（エンティティベース）が動作する
- [ ] globalSearch（コミュニティサマリベース）が動作する
- [ ] relationshipSearch（関係検索）が動作する
- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6: テスト拡充 へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 4テストファイルの確認
2. GraphSearchStrategyクラスの基本構造実装
3. localSearch()メソッドの実装
4. globalSearch()メソッドの実装
5. relationshipSearch()メソッドの実装
6. スコアリング・フィルタリング実装
7. エラーハンドリング実装
8. ユニットテスト成功確認（Green状態）
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/graph-search-strategy --phase 5
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

## TDD検証

```bash
# テスト実行コマンド
pnpm test -- --filter="GraphSearchStrategy"

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## 実装コード例

```typescript
// packages/shared/src/services/search/strategies/graph-search-strategy.ts
import type {
  ISearchStrategy,
  SearchResultItem,
  SearchFilters,
} from "../types";
import type { IKnowledgeGraphStore } from "@/services/graph/interfaces";
import type { IEmbeddingProvider } from "@/services/embedding/provider";
import type { ICommunitySummarizer } from "@/services/graph/interfaces";
import type { QueryType } from "../query-classifier";
import { ok, err, type Result } from "@/types/result";

export interface GraphSearchOptions {
  queryType?: QueryType;
  entityThreshold?: number;
  communityThreshold?: number;
  traversalDepth?: number;
  relationTypes?: string[];
}

export class GraphSearchStrategy implements ISearchStrategy {
  readonly name = "graph" as const;

  constructor(
    private readonly graphStore: IKnowledgeGraphStore,
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly communitySummarizer?: ICommunitySummarizer,
  ) {}

  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions,
  ): Promise<Result<SearchResultItem[], Error>> {
    try {
      const queryType = options?.queryType ?? "local";

      switch (queryType) {
        case "global":
          return this.globalSearch(query, limit, filters, options);
        case "relationship":
          return this.relationshipSearch(query, limit, filters, options);
        case "local":
        default:
          return this.localSearch(query, limit, filters, options);
      }
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Graph search failed"),
      );
    }
  }

  getMetrics(): StrategyMetric {
    // 実装
  }

  // 内部メソッドの実装...
}
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-strategy/phase-6-test-enhancement.md`
