# HybridRAG統合エンジン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-rag-search.md](./interfaces-rag-search.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| v1.2.4     | 2026-03-21 | UT-RAG-08-002 実装完了反映: factory method 状態、current runtime snapshot、config 契約、follow-up 定義を実装実体へ同期 |
| v1.2.3     | 2026-03-20 | UT-RAG-08-002 Phase 1-13 仕様書作成完了を反映: Factory 設計（3LLM系統分離・Reranker4分岐・CRAG条件分岐）を記録、Phase 3 レビュー結果を追記、wiring blocker 更新 |
| v1.2.2     | 2026-03-20 | UT-RAG-08-002 実装準備: 仕様抽出順を契約正本優先へ補正し、graph store 契約と same-wave 完了粒度を追記 |
| v1.2.1     | 2026-03-20 | UT-RAG-08-002 実装準備: wiring blocker checklist と Phase 12 same-wave sync 対象を追記 |
| v1.2.0     | 2026-03-20 | UT-RAG-08-002 実装準備: Factory wiring inventory、型互換性メモ、仕様抽出セットを追加 |
| v1.1.1     | 2026-03-19 | Task08 current-state sync: `HybridRAGFactory.createFull/createLite` の guidance stub 化と `[FACTORY_NOT_READY]` runtime を明記 |
| v1.0.0     | 2025-01-15 | 初版作成                                           |
| v1.1.0     | 2026-01-26 | spec-guidelines準拠: コードブロックを表形式に変換 |

4ステージパイプラインを統合した検索エンジン。Keyword/Semantic/Graph検索を並列実行し、RRF統合→Reranking→CRAG補正を行う。

**実装場所**: `packages/shared/src/services/search/hybrid-rag-engine.ts`

---

## HybridRAGEngineクラス

| メソッド | 戻り値                                    | 説明                |
| -------- | ----------------------------------------- | ------------------- |
| search() | Promise<Result<HybridRAGResponse, Error>> | HybridRAG検索を実行 |

**コンストラクタパラメータ**:

| パラメータ       | 型                 | 必須 | 説明                             |
| ---------------- | ------------------ | ---- | -------------------------------- |
| queryClassifier  | IQueryClassifier   | ✅   | クエリ分類器                     |
| searchStrategies | オブジェクト       | ✅   | 検索戦略（下記searchStrategies） |
| fusion           | IFusionStrategy    | ✅   | 結果統合戦略                     |
| reranker         | IReranker          | ✅   | リランカー                       |
| crag             | ICorrectiveRAG     | ✅   | Corrective RAG（null許容）       |
| options          | HybridRAGOptions   | -    | エンジンオプション               |

**searchStrategies構造**:

| プロパティ | 型              | 説明                   |
| ---------- | --------------- | ---------------------- |
| keyword    | ISearchStrategy | キーワード検索戦略     |
| semantic   | ISearchStrategy | セマンティック検索戦略 |
| graph      | ISearchStrategy | グラフ検索戦略         |

---

## HybridRAGResponse

| プロパティ       | 型                  | 説明                       |
| ---------------- | ------------------- | -------------------------- |
| results          | HybridRAGResult[]   | 最終検索結果               |
| metadata         | object              | パイプライン実行メタデータ |
| augmentedContext | string \| undefined | CRAGによる補強コンテキスト |

**metadata**:

| プロパティ     | 型                    | 説明                   |
| -------------- | --------------------- | ---------------------- |
| queryType      | QueryType             | クエリタイプ           |
| searchWeights  | SearchWeights         | 検索戦略の重み         |
| pipelineStages | PipelineStageResult[] | 各ステージの実行結果   |
| totalDuration  | number                | 全体処理時間（ミリ秒） |
| cragAction     | RelevanceAction?      | CRAGの評価アクション   |

---

## HybridRAGResult

| プロパティ | 型                      | 説明                                   |
| ---------- | ----------------------- | -------------------------------------- |
| chunkId    | ChunkId                 | チャンクID                             |
| content    | string                  | コンテンツ本文                         |
| score      | number                  | 総合スコア（0.0-1.0）                  |
| sources    | SourceInfo[]            | ソース情報（検索戦略、ランク、スコア） |
| metadata   | Record<string, unknown> | メタデータ                             |

---

## PipelineStageResult

| プロパティ  | 型     | 説明               |
| ----------- | ------ | ------------------ |
| stage       | string | ステージ名         |
| duration    | number | 実行時間（ミリ秒） |
| inputCount  | number | 入力件数           |
| outputCount | number | 出力件数           |

**stage 値**: `"query_classification"` | `"triple_search"` | `"rrf_fusion"` | `"reranking"` | `"crag"`

---

## SearchOptions（HybridRAG）

| プロパティ            | 型      | デフォルト | 説明                         |
| --------------------- | ------- | ---------- | ---------------------------- |
| enableCRAG            | boolean | undefined  | CRAGを有効にするか           |
| searchLimitMultiplier | number  | 3          | 各戦略の結果数倍率           |
| vectorThreshold       | number  | undefined  | ベクトル検索の類似度閾値     |
| graphDepth            | number  | undefined  | グラフ検索のトラバーサル深度 |

---

## HybridRAGOptions

| プロパティ        | 型      | デフォルト | 説明                     |
| ----------------- | ------- | ---------- | ------------------------ |
| defaultEnableCRAG | boolean | true       | デフォルトでCRAGを有効化 |
| timeout           | number  | undefined  | タイムアウト（ミリ秒）   |

---

## 定数

| 定数名                          | 値  | 説明                 |
| ------------------------------- | --- | -------------------- |
| DEFAULT_LIMIT                   | 10  | デフォルト検索結果数 |
| MAX_LIMIT                       | 100 | 最大検索結果数       |
| DEFAULT_SEARCH_LIMIT_MULTIPLIER | 3   | デフォルト結果数倍率 |

---

## HybridRAGFactory

HybridRAGEngineのファクトリクラス。設定に基づいて適切なコンポーネントを組み立てる。

**実装場所**: `packages/shared/src/services/search/hybrid-rag-factory.ts`

### ファクトリメソッド

| メソッド           | 状態 | 説明 |
| ------------------ | ---- | ---- |
| createFull()       | 実装済み | フル機能エンジン用 entry point。`HybridRAGEngine` を返し、classifier / 3 strategy / fusion / reranker / CRAG を配線する |
| createLite()       | 実装済み | 軽量版エンジン用 entry point。rule-based classifier + no-op reranker + null CRAG を返す |
| createForTesting() | 実装済 | テスト用エンジン（モック注入） |

### current runtime snapshot（2026-03-21）

| 項目 | 状態 |
| --- | --- |
| production wiring | 接続済み |
| 仕様書ステータス | UT-RAG-08-002 Phase 12 完了。Phase 13 PR 作成のみ未着手 |
| local placeholder types | 0件。実型 import へ置換済み |
| 推奨呼び出し | production code では `createFull()` / `createLite()` を利用可能。テスト用途では `createForTesting()` を利用 |

### Phase 3 設計レビュー結果（UT-RAG-08-002）

| 項目 | 判定 | 備考 |
| --- | --- | --- |
| 総合ゲート | PASS → Phase 4 へ | ILLMClient 型問題は config alias 設計（P64）で解決済み |
| RV-01: Factory パターン | PASS | `static` メソッド・helper 分離・`createForTesting()` 一貫性 OK |
| RV-02: 型置換 config 契約 | PASS | 5 placeholder 全削除対象、alias で衝突回避、`FullHybridRAGConfig` 確定 |
| RV-03: エラーハンドリング | PASS | P62 準拠。4 ケースの明示エラーと prefix `HybridRAGFactory.createFull():` 確定 |
| RV-04: Engine コンストラクタ整合 | PASS | `RRFFusion(k: number)` 直接引数形式確認済み |
| RV-05: DIP・関心分離 | PASS | keyword bridge を adapter へ閉じ込める設計確定 |
| RV-06: テスタビリティ | PASS | full/lite/error path 分離テスト可能 |
| RV-07: ILLMClient 互換性 | PASS with note | `RerankerLLMClient` / `CragLLMClient` alias で分離設計。詳細は P64 参照 |
| RV-08: Phase 12 sync 対象 | PASS | `architecture-rag.md` / `rag-search-hybrid.md` / `rag-query-pipeline.md` 必須同期確定 |

**検出された known issues（follow-up 化）**:

| 問題 | 状態 | 参照 |
| --- | --- | --- |
| `ILLMClient` crag/types vs llm/types 形状差分 | config alias で設計上吸収済み。P64 として記録 | `architecture-rag.md#P64` |
| `KeywordSearchStrategy` が `ISearchStrategy` 非互換 | adapter 設計で解決。Phase 5 で実装 | `wiring blocker checklist` |
| `HybridRAGEngine` graph queryType 伝播不足 | Phase 10 follow-up 候補として記録 | `DT-08` |
| `RRFFusion` コンストラクタが `RRFFusionOptions` ではなく直接 `k: number` | 仕様書修正済み（`new RRFFusion(k: number = 60)`） | `DT-04` |

### FullHybridRAGConfig

| プロパティ        | 型                   | 必須 | 説明                                    |
| ----------------- | -------------------- | ---- | --------------------------------------- |
| db                | DrizzleClient        | ✅   | データベースクライアント                |
| embeddingProvider | IEmbeddingProvider   | ✅   | 埋め込みプロバイダー                    |
| graphStore        | IKnowledgeGraphStore | ✅   | Knowledge Graphストア                   |
| llmProvider       | ILLMProvider         | ✅   | QueryClassifier 用                      |
| rerankerType      | string               | ✅   | "cohere" \| "voyage" \| "llm" \| "none" |
| rerankerLlmClient | ILLMClient           |      | `rerankerType === "llm"` 時に必須       |
| cragLlmClient     | ILLMClient           |      | `enableCRAG === true` 時に必須          |
| enableCRAG        | boolean              |      | CRAG有効化                              |
| communitySummarizer | ICommunitySummarizer |      | GraphSearchStrategy の optional dependency |
| webSearcher       | IWebSearcher         |      | Web検索プロバイダー                     |

### 実装準備メモ（UT-RAG-08-002）

`createFull()` を実装する際は、以下の依存配線を前提にする。

| 依存 | 実装クラス | constructor 実体 | ソース |
| --- | --- | --- | --- |
| QueryClassifier fallback | `RuleBasedQueryClassifier` | 引数なし | `packages/shared/src/services/search/rule-based-query-classifier.ts` |
| QueryClassifier main | `LLMQueryClassifier` | `(llmProvider: ILLMProvider, fallbackClassifier: IQueryClassifier)` | `packages/shared/src/services/search/llm-query-classifier.ts` |
| Keyword | `KeywordSearchStrategy` | `(db: LibSQLDatabase<Record<string, never>>)` | `packages/shared/src/services/search/keyword-search-strategy.ts` |
| Semantic | `VectorSearchStrategy` | `(db: LibSQLDatabase<Record<string, never>>, embeddingProvider: IEmbeddingProvider)` | `packages/shared/src/services/search/strategies/vector-search-strategy.ts` |
| Graph | `GraphSearchStrategy` | `(graphStore: IKnowledgeGraphStore, embeddingProvider: IEmbeddingProvider, communitySummarizer?: ICommunitySummarizer)` | `packages/shared/src/services/search/strategies/graph-search-strategy.ts` |
| Fusion | `RRFFusion` | `(k: number = 60)` | `packages/shared/src/services/search/fusion/rrf-fusion.ts` |
| Reranker | `LLMReranker` / `CohereReranker` / `VoyageReranker` / `NoOpReranker` | 各 constructor は該当実装を参照 | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` |
| CRAG | `CorrectiveRAG` | `(evaluator: IRelevanceEvaluator, webSearcher: IWebSearcher | null, options?: CRAGOptions)` | `packages/shared/src/services/search/crag/corrective-rag.ts` |
| Evaluator | `RelevanceEvaluator` | `(llmClient: ILLMClient, options?: EvaluatorOptions)` | `packages/shared/src/services/search/crag/relevance-evaluator.ts` |

### wiring blocker checklist

UT-RAG-08-002 のような Factory wiring task では、以下を「依存が揃っているか」ではなく「追加設計が必要か」の観点で確認する。

| blocker | 現状 | 必要な対応 | ステータス |
| --- | --- | --- | --- |
| `KeywordSearchStrategy` 非互換 | `HybridRAGEngine` が要求する `ISearchStrategy` を満たさない | `KeywordSearchStrategyAdapter` を追加する | 解消済み |
| QueryClassifier / Reranker / CRAG の LLM 形状差分 | `ILLMProvider` / shared `ILLMClient` / CRAG `ILLMClient` が分裂している | config 側で `llmProvider` / `rerankerLlmClient` / `cragLlmClient` を区別（alias 設計） | 仕様確定済み（DT-01/DT-02） |
| graph queryType 伝播不足 | current engine は graph strategy へ `queryType` を渡さない | limitation として記録し、follow-up 化 | 未解消（UT-RAG-08-006） |
| current runtime snapshot 差分 | system spec では `guidance stub` が正本 | Phase 12 で same-wave sync | 解消済み（2026-03-21） |

### 型互換性メモ

`HybridRAGFactory` 実装時に最も重要な論点は、LLM 関連インターフェースの形状差分である。

| 用途 | 必要な型 | 定義場所 | 差分 |
| --- | --- | --- | --- |
| QueryClassifier | `ILLMProvider` | `services/extraction/interfaces.ts` | `generate(prompt, options)` を要求 |
| LLMReranker | `ILLMClient` | `services/llm/types.ts` | `complete(prompt, options?)` を要求 |
| RelevanceEvaluator | `ILLMClient` | `services/search/crag/types.ts` | `complete({ prompt, maxTokens, temperature })` を要求 |

推奨実装境界:

- `FullHybridRAGConfig` に `llmProvider` を追加し、`LLMQueryClassifier` へ直接渡す
- `llm/types` 側 `ILLMClient` は `LLMReranker` へ直接渡す
- `RelevanceEvaluator` には adapter を介して `crag/types` 側 `ILLMClient` へ変換して渡す

### 推奨仕様抽出セット

UT-RAG-08-002 のような Factory wiring 変更では、以下の順に参照すると必要情報を過不足なく抽出できる。

1. `interfaces-rag.md`
2. `rag-search-hybrid.md`
3. `rag-query-pipeline.md`
4. `interfaces-rag-knowledge-graph-store.md`
5. `rag-search-graph.md`
6. `rag-search-crag.md`
7. `rag-services.md`
8. `architecture-rag.md`

### Phase 12 same-wave sync 対象

`HybridRAGFactory` を `not-ready` から wiring 済みへ更新する task では、少なくとも以下を同一 wave で同期する。

- `architecture-rag.md`
- `rag-search-hybrid.md`
- `rag-query-pipeline.md`
- `task-workflow.md`
- `lessons-learned-current.md`

実装内容に応じて追加:

- `interfaces-rag.md`
- `rag-services.md`

### 関連未タスク（UT-RAG-08-002 follow-up）

UT-RAG-08-002 Phase 3/10 レビューで formalize された follow-up 未タスク。

| タスクID      | タスク名                                        | 優先度 | 発見元                        | 指示書パス |
| ------------- | ----------------------------------------------- | ------ | ----------------------------- | ---------- |
| UT-RAG-08-006 | GraphSearchStrategy queryType 伝播改善          | 中     | Phase 3 多角的チェック / Phase 10 FU-01 | `docs/30-workflows/unassigned-task/task-rag-08-006-graph-query-type-propagation.md` |
| UT-RAG-08-007 | ILLMClient 型定義統一（UT-RAG-08-002 wave）     | 中     | Phase 10 FU-02                | `docs/30-workflows/unassigned-task/task-rag-08-007-illmclient-type-unification.md` |
| UT-RAG-08-008 | Graph global mode での communitySummarizer 活用仕上げ | 中     | Phase 3 多角的チェック / Phase 10 FU-03 | `docs/30-workflows/unassigned-task/task-rag-08-008-community-summarizer-config-extension.md` |
- `interfaces-rag-search.md`
- `interfaces-rag-knowledge-graph-store.md`
- `rag-search-graph.md`
- `rag-search-crag.md`

完了記録として明示する:

- `topic-map.md` 再生成結果
- 関連 `LOGS.md`
- 実装状況テーブル / 関連タスクテーブルの更新有無

### LiteHybridRAGConfig

| プロパティ        | 型                   | 必須 | 説明                     |
| ----------------- | -------------------- | ---- | ------------------------ |
| db                | DrizzleClient        | ✅   | データベースクライアント |
| embeddingProvider | IEmbeddingProvider   | ✅   | 埋め込みプロバイダー     |
| graphStore        | IKnowledgeGraphStore | ✅   | Knowledge Graphストア    |

### TestMocks

| プロパティ       | 型               | 必須 | 説明                                       |
| ---------------- | ---------------- | ---- | ------------------------------------------ |
| queryClassifier  | IQueryClassifier | ✅   | クエリ分類器モック                         |
| keywordStrategy  | ISearchStrategy  | ✅   | キーワード検索モック                       |
| semanticStrategy | ISearchStrategy  | ✅   | セマンティック検索モック                   |
| graphStrategy    | ISearchStrategy  | ✅   | グラフ検索モック                           |
| fusion           | IFusionStrategy  |      | Fusionモック（デフォルト: RRFFusion）      |
| reranker         | IReranker        |      | Rerankerモック（デフォルト: NoOpReranker） |
| crag             | ICorrectiveRAG   |      | CRAGモック                                 |
| options          | HybridRAGOptions |      | エンジンオプション                         |

---

## テスト品質

- **39テストケース**（単体23 + 統合16）
- **94.32% Line Coverage**, **91.66% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/hybridrag-integration/outputs/phase-12/implementation-guide.md`

---

## 関連ドキュメント

- [検索クエリ・結果型定義](./rag-search-types.md)
- [キーワード検索戦略](./rag-search-keyword.md)
- [ベクトル検索戦略](./rag-search-vector.md)
- [グラフ検索戦略](./rag-search-graph.md)
- [Corrective RAG](./rag-search-crag.md)
- [HybridRAGパイプライン](./rag-query-pipeline.md)
