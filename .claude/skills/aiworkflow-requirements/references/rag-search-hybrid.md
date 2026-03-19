# HybridRAG統合エンジン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-rag-search.md](./interfaces-rag-search.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
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
| createFull()       | guidance stub | フル機能エンジン用 entry point。current runtime では `[FACTORY_NOT_READY]` を含む Error を throw |
| createLite()       | guidance stub | 軽量版エンジン用 entry point。current runtime では `[FACTORY_NOT_READY]` を含む Error を throw |
| createForTesting() | 実装済 | テスト用エンジン（モック注入） |

### current runtime snapshot（2026-03-19）

| 項目 | 状態 |
| --- | --- |
| production wiring | 未接続 |
| local placeholder types | `IEmbeddingProvider` / `IKnowledgeGraphStore` / `ILLMClient` / `IWebSearcher` をファイル内 placeholder として保持 |
| 推奨呼び出し | production code は `createFull()` / `createLite()` を前提にしない。テスト用途のみ `createForTesting()` を使用 |

### FullHybridRAGConfig

| プロパティ        | 型                   | 必須 | 説明                                    |
| ----------------- | -------------------- | ---- | --------------------------------------- |
| db                | DrizzleClient        | ✅   | データベースクライアント                |
| embeddingProvider | IEmbeddingProvider   | ✅   | 埋め込みプロバイダー                    |
| graphStore        | IKnowledgeGraphStore | ✅   | Knowledge Graphストア                   |
| llmClient         | ILLMClient           | ✅   | LLMクライアント                         |
| rerankerType      | string               | ✅   | "cohere" \| "voyage" \| "llm" \| "none" |
| enableCRAG        | boolean              |      | CRAG有効化                              |
| webSearcher       | IWebSearcher         |      | Web検索プロバイダー                     |

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
