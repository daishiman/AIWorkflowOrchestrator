# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 2                     |
| Phase名    | 設計                  |
| 前提Phase  | Phase 1               |
| 後続Phase  | Phase 3               |
| ステータス | 未実施                |
| 作成日     | 2026-01-17            |
| 機能名     | hybridrag-integration |

---

## 目的

Phase 1で定義された要件を実現可能な構造に落とし込み、HybridRAGEngineとHybridRAGFactoryの詳細設計を行う。

## 背景

HybridRAG検索エンジンは、Query Classification → Triple Search → RRF Fusion + Reranking → CRAGの4ステージパイプラインで構成される。各ステージの責務と連携方法を明確に設計し、保守性・拡張性の高い実装を目指す。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: HybridRAGEngineのパイプライン構造を設計する

**実行手順**:

1. パイプラインアーキテクチャを設計:
   ```
   HybridRAGEngine
   ├── Stage 1: Query Classification
   │   └── QueryClassifier.classify() → queryType, weights
   ├── Stage 2: Triple Search (並列実行)
   │   ├── KeywordSearchStrategy.search()
   │   ├── VectorSearchStrategy.search()
   │   └── GraphSearchStrategy.search()
   ├── Stage 3: RRF Fusion + Reranking
   │   ├── RRFFusion.fuse() → fusedResults
   │   └── IReranker.rerank() → rerankedResults
   └── Stage 4: CRAG (オプション)
       └── CorrectiveRAG.process() → correctedResults + augmentedContext
   ```
2. エラーハンドリング戦略を設計:
   - Stage 2の部分的失敗: 1つ以上の検索戦略が成功すれば続行
   - Stage 3のReranking失敗: fusedResultsをそのまま使用
   - Stage 4のCRAG失敗: rerankedResultsをそのまま使用
3. パフォーマンス最適化戦略を設計:
   - Stage 2の並列実行（Promise.all）
   - 検索結果数の倍率設定（searchLimitMultiplier）

**期待される成果物**:

- パイプラインアーキテクチャ図
- エラーハンドリング戦略書
- パフォーマンス最適化設計

---

### タスク2: インターフェース設計

**目的**: HybridRAGEngineの入出力インターフェースを設計する

**実行手順**:

1. 入力インターフェースを設計:
   ```typescript
   interface SearchOptions {
     enableCRAG?: boolean; // CRAG有効化フラグ
     searchLimitMultiplier?: number; // 各検索戦略の結果数倍率
     vectorThreshold?: number; // ベクトル検索の閾値
     graphDepth?: number; // グラフ検索の深度
   }
   ```
2. 出力インターフェースを設計:

   ```typescript
   interface HybridRAGResponse {
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

   interface HybridRAGResult {
     chunkId: ChunkId;
     content: string;
     score: number;
     sources: Array<{ strategy; rank; score }>;
     metadata: Record<string, unknown>;
   }

   interface PipelineStageResult {
     stage: string;
     duration: number;
     inputCount: number;
     outputCount: number;
   }
   ```

3. コンストラクタインターフェースを設計:
   ```typescript
   constructor(
     queryClassifier: QueryClassifier,
     searchStrategies: {
       keyword: ISearchStrategy;
       semantic: ISearchStrategy;
       graph: ISearchStrategy;
     },
     fusion: RRFFusion,
     reranker: IReranker,
     crag: CorrectiveRAG | null,
     options?: HybridRAGOptions
   )
   ```

**期待される成果物**:

- 型定義設計書（全インターフェース）

---

### タスク3: ファクトリ設計

**目的**: HybridRAGFactoryの設計を行う

**実行手順**:

1. createFullメソッドを設計:
   - フル機能エンジン（LLM QueryClassifier、Reranker、CRAG有効）
   - 必要な設定項目: db, embeddingProvider, graphStore, llmClient, rerankerType等
2. createLiteメソッドを設計:
   - 軽量版エンジン（ルールベースClassifier、NoOpReranker、CRAG無効）
   - 必要な設定項目: db, embeddingProvider, graphStore
3. createForTestingメソッドを設計:
   - テスト用エンジン（モック注入可能）
   - 必要な設定項目: 各コンポーネントのモック

**期待される成果物**:

- ファクトリ設計書（各メソッドの設定インターフェース）

---

## 参照資料

| 参照資料                | パス                                                                         | 内容       |
| ----------------------- | ---------------------------------------------------------------------------- | ---------- |
| Phase 1成果物           | `outputs/phase-1/requirements-definition.md`                                 | 要件定義   |
| 元タスク指示書          | `docs/30-workflows/unassigned-task/task-07-07-hybridrag-integration.md`      | 実装仕様   |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | 型定義参照 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                         | 内容                                    |
| ----------------------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | ISearchStrategy, SearchResultItem等     |
| RAGアーキテクチャ設計   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | QueryClassifier, VectorSearchStrategy等 |

---

## 成果物

| 成果物               | パス                                     | 内容             |
| -------------------- | ---------------------------------------- | ---------------- |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md` | パイプライン構造 |
| インターフェース設計 | `outputs/phase-2/interface-design.md`    | 型定義           |
| ファクトリ設計       | `outputs/phase-2/factory-design.md`      | Factory設計      |

---

## 統合テスト連携【必須】

統合ポイント/契約（パイプラインの各ステージ）を設計に反映する:

| 統合ポイント              | 契約定義                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------- |
| QueryClassifier → Engine  | `classify(query): Result<{queryType, weights}, Error>`                                  |
| Engine → SearchStrategies | `search(query, limit, filters, options): Result<SearchResultItem[], Error>`（並列実行） |
| SearchStrategies → Fusion | `fuse(resultSets, weights): FusedSearchResult[]`                                        |
| Fusion → Reranker         | `rerank(query, results, limit): Result<FusedSearchResult[], Error>`                     |
| Reranker → CRAG           | `process(query, results): Result<CRAGResult, Error>`                                    |

---

## 完了条件

- [ ] パイプラインアーキテクチャが設計されている
- [ ] エラーハンドリング戦略が定義されている
- [ ] 入出力インターフェースが設計されている
- [ ] ファクトリの各メソッドが設計されている
- [ ] 各統合ポイントの契約が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- タスク1（アーキテクチャ設計）: {{result}}
- タスク2（インターフェース設計）: {{result}}
- タスク3（ファクトリ設計）: {{result}}

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

`docs/30-workflows/hybridrag-integration/phase-3-design-review.md`
