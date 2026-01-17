# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装                  |
| 前提Phase  | Phase 4               |
| 後続Phase  | Phase 6               |
| ステータス | 未実施                |
| 作成日     | 2026-01-17            |
| 機能名     | hybridrag-integration |

---

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う（TDD Green状態）。

## 背景

TDDアプローチに従い、失敗状態（Red）のテストを通過させる実装を行う。実装は最小限に抑え、テストが通ることを優先する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: HybridRAGEngine実装

**目的**: 4ステージパイプラインを実装する

**実行手順**:

1. ファイル作成: `packages/shared/src/services/search/hybrid-rag-engine.ts`
2. 型定義を実装:

   ```typescript
   export interface HybridRAGResponse {
     results: HybridRAGResult[];
     metadata: {
       queryType: QueryType;
       searchWeights: SearchWeights;
       pipelineStages: PipelineStageResult[];
       totalDuration: number;
       cragAction?: "correct" | "incorrect" | "ambiguous";
     };
     augmentedContext?: string;
   }

   export interface HybridRAGResult {
     chunkId: ChunkId;
     content: string;
     score: number;
     sources: Array<{
       strategy: "keyword" | "semantic" | "graph";
       rank: number;
       score: number;
     }>;
     metadata: Record<string, unknown>;
   }

   export interface PipelineStageResult {
     stage: string;
     duration: number;
     inputCount: number;
     outputCount: number;
   }
   ```

3. HybridRAGEngineクラスを実装:
   - コンストラクタ（依存注入）
   - `search()`メソッド（4ステージパイプライン）
   - `calculateSearchLimit()`プライベートメソッド
4. パイプラインの各ステージを実装:
   - Stage 1: Query Classification
   - Stage 2: Triple Search（並列実行）
   - Stage 3: RRF Fusion + Reranking
   - Stage 4: CRAG（オプション）

**期待される成果物**:

- `packages/shared/src/services/search/hybrid-rag-engine.ts`

---

### タスク2: HybridRAGFactory実装

**目的**: ファクトリパターンでエンジン生成を実装する

**実行手順**:

1. ファイル作成: `packages/shared/src/services/search/hybrid-rag-factory.ts`
2. 設定インターフェースを実装:

   ```typescript
   export interface FullHybridRAGConfig {
     db: DrizzleClient;
     embeddingProvider: IEmbeddingProvider;
     graphStore: IKnowledgeGraphStore;
     llmClient: ILLMClient;
     rerankerType: "cohere" | "voyage" | "llm" | "none";
     cohereApiKey?: string;
     cohereModel?: string;
     voyageApiKey?: string;
     rerankerBatchSize?: number;
     rrfK?: number;
     enableCRAG?: boolean;
     cragMaxEvaluate?: number;
     cragCorrectThreshold?: number;
     cragIncorrectThreshold?: number;
     ambiguousFilterThreshold?: number;
     webSearcher?: IWebSearcher;
     enableWebSearch?: boolean;
     enableRefinement?: boolean;
   }

   export interface LiteHybridRAGConfig {
     db: DrizzleClient;
     embeddingProvider: IEmbeddingProvider;
     graphStore: IKnowledgeGraphStore;
   }

   export interface TestMocks {
     queryClassifier: QueryClassifier;
     keywordStrategy: ISearchStrategy;
     semanticStrategy: ISearchStrategy;
     graphStrategy: ISearchStrategy;
     fusion?: RRFFusion;
     reranker?: IReranker;
     crag?: CorrectiveRAG;
   }
   ```

3. HybridRAGFactoryクラスを実装:
   - `createFull()` 静的メソッド
   - `createLite()` 静的メソッド
   - `createForTesting()` 静的メソッド
   - `createReranker()` プライベート静的メソッド
   - `createCRAG()` プライベート静的メソッド

**期待される成果物**:

- `packages/shared/src/services/search/hybrid-rag-factory.ts`

---

### タスク3: エクスポート更新

**目的**: index.tsにエクスポートを追加する

**実行手順**:

1. `packages/shared/src/services/search/index.ts` を更新:
   ```typescript
   // HybridRAG Engine
   export {
     HybridRAGEngine,
     type HybridRAGOptions,
     type SearchOptions,
     type HybridRAGResponse,
     type HybridRAGResult,
   } from "./hybrid-rag-engine";
   export {
     HybridRAGFactory,
     type FullHybridRAGConfig,
     type LiteHybridRAGConfig,
   } from "./hybrid-rag-factory";
   ```

**期待される成果物**:

- `packages/shared/src/services/search/index.ts`（更新）

---

## 参照資料

| 参照資料       | パス                                                                      | 内容             |
| -------------- | ------------------------------------------------------------------------- | ---------------- |
| Phase 2成果物  | `outputs/phase-2/interface-design.md`                                     | インターフェース |
| Phase 4成果物  | `packages/shared/src/services/search/__tests__/hybrid-rag-engine.test.ts` | テストコード     |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-07-07-hybridrag-integration.md`   | 実装仕様         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                         | 内容                                 |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | ISearchStrategy, FusedSearchResult等 |
| RAGアーキテクチャ設計   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | パイプライン構造                     |

---

## 成果物

| 成果物           | パス                                                        | 内容           |
| ---------------- | ----------------------------------------------------------- | -------------- |
| HybridRAGEngine  | `packages/shared/src/services/search/hybrid-rag-engine.ts`  | エンジン実装   |
| HybridRAGFactory | `packages/shared/src/services/search/hybrid-rag-factory.ts` | ファクトリ実装 |
| エクスポート     | `packages/shared/src/services/search/index.ts`              | 更新           |

---

## 統合テスト連携【必須】

パイプライン統合の実装とテスト支援コード整備:

| 実装項目       | 内容                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| Stage 1実装    | QueryClassifier.classify()呼び出し、Result型エラーハンドリング         |
| Stage 2実装    | Promise.allによる並列検索、部分失敗時のフォールバック                  |
| Stage 3実装    | RRFFusion.fuse() + IReranker.rerank()、Reranking失敗時のフォールバック |
| Stage 4実装    | CorrectiveRAG.process()（オプション）、CRAG失敗時のフォールバック      |
| メトリクス記録 | 各ステージのduration, inputCount, outputCount記録                      |

---

## 完了条件

- [ ] HybridRAGEngineクラスが実装されている
- [ ] 4ステージパイプラインが実装されている
- [ ] HybridRAGFactoryクラスが実装されている
- [ ] Full/Lite/Testingの各モードが動作する
- [ ] エクスポートが更新されている
- [ ] すべてのテストが成功状態（Green）である
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4が完了していること（テストがRed状態）
- **後続**: Phase 6（テスト拡充）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- タスク1（HybridRAGEngine実装）: {{result}}
- タスク2（HybridRAGFactory実装）: {{result}}
- タスク3（エクスポート更新）: {{result}}

### TDD確認

- [ ] 全テストがGreen状態であることを確認

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/hybridrag-integration/phase-6-test-expansion.md`
