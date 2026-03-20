# RAGクエリパイプライン（GraphRAG・HybridRAG）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-rag.md](./architecture-rag.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                   |
| ---------- | ---------- | ---------------------------------------------------------- |
| v1.2.1     | 2026-03-21 | UT-RAG-08-002 実装完了反映: createFull/createLite を実装済みへ更新し、graph queryType 非伝播を既知制約として明記 |
| v1.2.0     | 2026-03-20 | UT-RAG-08-002 Phase 1-13 仕様書作成完了を反映: HybridRAGFactory pipeline runtime を更新、createFull/createLite 設計詳細を追記 |
| v1.1.1     | 2026-03-19 | Task08 current-state sync: GraphRAG fallback metadata と HybridRAGFactory not-ready runtime を追記 |
| v1.0.0     | 2025-01-20 | 初版作成                                                   |
| v1.1.0     | 2026-01-26 | spec-guidelines準拠: コードブロックを表形式・文章に変換    |

---

## 概要

RAG検索結果を統合し、最適な回答を生成するパイプライン。GraphRAGクエリサービスとHybridRAG統合パイプラインを定義。

---

## GraphRAGクエリサービス

### 概要

コミュニティ要約を活用してユーザークエリに対する包括的な回答を生成するサービス。
ICommunitySummarizer.searchSummaries()と連携し、関連するコミュニティ要約をコンテキストとしてLLMに提供する。

### RAGパイプラインにおける位置づけ

GraphRAGクエリサービスは、RAGパイプラインの最終段に位置し、コミュニティ要約を活用してユーザークエリに回答を生成する。

**前段処理フロー**:
ドキュメント → 変換 → チャンキング → NER → コミュニティ検出 → コミュニティ要約 → GraphRAGクエリサービス

**GraphRAGQueryService（IGraphRAGQueryService実装）**

| 処理ステップ       | 説明                                       |
| ------------------ | ------------------------------------------ |
| validateInput()    | 入力クエリの検証                           |
| Promise.all()      | 以下の2処理を並列実行                      |
| - classifyQuery()  | クエリタイプの分類                         |
| - searchWithFallback() | フォールバック付きコミュニティ要約検索 |
| buildPrompt()      | LLM用プロンプトの構築                      |
| llmProvider.generate() | 回答テキストの生成                     |

### 主要インターフェース

**IGraphRAGQueryService**: GraphRAGクエリサービスの抽象インターフェース

| メソッド | 説明                 |
| -------- | -------------------- |
| query()  | クエリ実行・回答生成 |

**GraphRAGQueryOptions**: クエリオプション

| オプション             | デフォルト | 説明                          |
| ---------------------- | ---------- | ----------------------------- |
| limit                  | 10         | 最大検索結果数（1-20）        |
| communityLevel         | -          | コミュニティ階層レベル（0-5） |
| confidenceThreshold    | 0.5        | confidence閾値（0-1）         |
| enableCommunitySummary | true       | コミュニティ要約検索を有効化  |

### current fallback metadata（2026-03-19）

| フィールド | 説明 |
| --- | --- |
| `fallbackOccurred` | community search failure による fallback 発生有無 |
| `fallbackReason` | fallback の原因文字列（`error.message`） |

### 依存関係

| 依存サービス         | 用途                 |
| -------------------- | -------------------- |
| IQueryClassifier     | クエリタイプ分類     |
| ICommunitySummarizer | コミュニティ要約検索 |
| IEmbeddingProvider   | 埋め込み生成         |
| ILLMProvider         | 回答テキスト生成     |

### 実装ファイル

| 種別       | パス                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| サービス   | `packages/shared/src/services/search/graphrag-query-service.ts`                            |
| 型定義     | `packages/shared/src/services/search/graphrag-query-service.ts`                            |
| テスト     | `packages/shared/src/services/search/__tests__/graphrag-query-service.test.ts`             |
| 統合テスト | `packages/shared/src/services/search/__tests__/graphrag-query-service.integration.test.ts` |

### テスト品質

- **44テストケース**（単体24 + 統合20）
- **100% Line Coverage**, **91.66% Branch Coverage**, **100% Function Coverage**

**詳細参照**: [interfaces-rag-graphrag-query.md](./interfaces-rag-graphrag-query.md)

---

## HybridRAG統合パイプライン

### 概要

HybridRAGは、複数の検索戦略を組み合わせて最適な検索結果を提供する統合検索エンジン。
4ステージパイプラインにより、各検索戦略の長所を活かした高精度な検索を実現する。

**実装場所**: `packages/shared/src/services/search/hybrid-rag-engine.ts`

### アーキテクチャ概要

HybridRAG 4-Stage Pipelineは、クエリ分類から最終回答生成まで4つのステージで構成される。

#### Stage 1: Query Classification

クエリを分析し、検索戦略の重みを決定するステージ。

| コンポーネント    | 出力                              |
| ----------------- | --------------------------------- |
| IQueryClassifier  | QueryType + SearchWeights         |

#### Stage 2: Triple Search（並列実行）

3つの検索戦略をPromise.allで並列実行するステージ。

| 検索戦略             | 技術基盤            | 説明                   |
| -------------------- | ------------------- | ---------------------- |
| KeywordSearchStrategy| FTS5/BM25           | キーワードベース検索   |
| VectorSearchStrategy | DiskANN             | ベクトル類似度検索     |
| GraphSearchStrategy  | Knowledge Graph     | グラフ構造ベース検索   |

#### Stage 3a: RRF Fusion

Reciprocal Rank Fusionで3つの検索結果を統合する。スコア計算式は weight_i / (k + rank_i) の総和で算出。

#### Stage 3b: Reranking

CrossEncoderまたはLLMを使用してクエリと結果の関連性を再評価する。

#### Stage 4: CRAG（Optional）

Corrective RAGで結果品質を評価・補正する。品質に応じて3つのアクションを選択。

| アクション | 動作                       |
| ---------- | -------------------------- |
| CORRECT    | 結果をそのまま使用         |
| REFINE     | 低品質結果をフィルタリング |
| AUGMENT    | Web検索で結果を補強        |

#### 最終出力: HybridRAGResponse

| フィールド       | 説明                         |
| ---------------- | ---------------------------- |
| results[]        | 検索結果の配列               |
| metadata         | 処理メタデータ               |
| augmentedContext | CRAG補強時の追加コンテキスト |

### データフロー

1. **Stage 1: Query Classification**
   - クエリを分析し、4タイプ（local/global/relationship/hybrid）に分類
   - タイプに応じた検索戦略の重みを決定

2. **Stage 2: Triple Search（並列実行）**
   - 3つの検索戦略をPromise.allで並列実行
   - 各戦略は独立して動作し、部分失敗に対応

3. **Stage 3a: RRF Fusion**
   - 3つの検索結果をRRFアルゴリズムで統合
   - 重み付きスコア計算: `score = Σ(weight_i / (k + rank_i))`

4. **Stage 3b: Reranking**
   - クエリと結果の関連性を再評価
   - フォールバック: 失敗時はFusion結果をそのまま使用

5. **Stage 4: CRAG（オプション）**
   - 結果の品質を評価し、必要に応じて補正
   - フォールバック: 失敗時はReranking結果をそのまま使用

---

## クエリタイプと検索重み

| タイプ       | 特徴                 | keyword | semantic | graph |
| ------------ | -------------------- | ------- | -------- | ----- |
| local        | 特定情報の検索       | 0.20    | 0.60     | 0.20  |
| global       | 全体概要の把握       | 0.10    | 0.30     | 0.60  |
| relationship | 関係性・比較の質問   | 0.10    | 0.20     | 0.70  |
| hybrid       | 判断困難時のバランス | 0.33    | 0.33     | 0.34  |

---

## フォールバック設計

| シナリオ | 動作 |
| --- | --- |
| GraphRAG community search 失敗 | warn を出し、空配列 + `fallbackOccurred=true` + `fallbackReason` で続行 |
| GraphRAG `enableCommunitySummary=false` | 検索自体を実行せず空配列で継続 |
| 1つの検索戦略が失敗 | 残りの戦略の結果で続行 |
| 2つの検索戦略が失敗 | 残りの1戦略の結果で続行 |
| 全検索戦略が失敗 | エラーを返す |
| Rerankingが失敗 | Fusion結果をそのまま使用 |
| CRAGが失敗 | Reranking結果をそのまま使用 |

---

## パフォーマンス目標

| ステージ      | 目標レイテンシ                           |
| ------------- | ---------------------------------------- |
| Triple Search | < 200ms                                  |
| RRF Fusion    | < 10ms                                   |
| Reranking     | < 200ms                                  |
| CRAG          | < 300ms                                  |
| **合計**      | < 500ms (CRAG無効) / < 1000ms (CRAG有効) |

---

## HybridRAGFactory

設定に基づいてHybridRAGEngineを生成するファクトリクラス。

| メソッド | 用途 | 状態 |
| --- | --- | --- |
| createFull() | フル機能版（LLM分類、CRAG有効） | 実装済み |
| createLite() | 軽量版（ルールベース、CRAG無効） | 実装済み |
| createForTesting() | テスト用（モック注入可能） | 実装済 |

**NOTE**: current runtime では createFull() / createLite() を production wiring として利用できる。既知制約は graph queryType 非伝播のみで、GraphSearchStrategy は `local` mode 相当で動作する。

### createFull() 組み立て設計（UT-RAG-08-002）

3LLM系統分離・Reranker4分岐・CRAG条件分岐を明示的に切り分ける設計。

| ステップ | 処理 | 使用クラス |
| --- | --- | --- |
| 1 | config バリデーション | `validateFullConfig(config)` |
| 2 | Query Classifier 生成 | `LLMQueryClassifier(config.llmProvider, new RuleBasedQueryClassifier())` |
| 3 | Keyword strategy 生成 | `KeywordSearchStrategyAdapter(new KeywordSearchStrategy(config.db))` |
| 4 | Semantic strategy 生成 | `VectorSearchStrategy(config.db, config.embeddingProvider)` |
| 5 | Graph strategy 生成 | `GraphSearchStrategy(config.graphStore, config.embeddingProvider, config.communitySummarizer?)` |
| 6 | Fusion 生成 | `new RRFFusion(config.rrfK ?? 60)` |
| 7 | Reranker 生成 | `createReranker(config)` — 4分岐（cohere/voyage/llm/none） |
| 8 | CRAG 生成 | `createCrag(config)` — 条件分岐（enableCRAG + cragLlmClient） |
| 9 | Engine 生成 | `new HybridRAGEngine(...)` |

**3LLM系統の分離**:

| 系統 | config フィールド | 渡し先 |
| --- | --- | --- |
| QueryClassifier 用 | `llmProvider: ILLMProvider` | `LLMQueryClassifier` |
| LLMReranker 用 | `rerankerLlmClient: ILLMClient（llm/types）` | `LLMReranker` |
| RelevanceEvaluator 用 | `cragLlmClient: ILLMClient（crag/types）` | `RelevanceEvaluator` |

### createLite() 組み立て設計（UT-RAG-08-002）

| ステップ | 処理 |
| --- | --- |
| 1 | `RuleBasedQueryClassifier()` — 引数なし |
| 2 | `KeywordSearchStrategyAdapter(new KeywordSearchStrategy(config.db))` |
| 3 | `VectorSearchStrategy(config.db, config.embeddingProvider)` |
| 4 | `GraphSearchStrategy(config.graphStore, config.embeddingProvider)` |
| 5 | `new RRFFusion()` — デフォルト k=60 |
| 6 | `new NoOpReranker()` |
| 7 | `crag = null` |

---

## テスト品質

- **39テストケース**（単体23 + 統合16）
- **94.32% Line Coverage**, **91.66% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/hybridrag-integration/outputs/phase-12/implementation-guide.md`

---

## 関連ドキュメント

- [RAGアーキテクチャ概要](./architecture-rag.md)
- [RAGサービス群](./rag-services.md)
- [ベクトル検索・同期](./rag-vector-search.md)
