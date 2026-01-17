# HybridRAG統合 - ファクトリ設計書

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | CONV-07-07    |
| タスク名   | HybridRAG統合 |
| Phase      | 2             |
| 作成日     | 2026-01-17    |
| ステータス | 完了          |

---

## 1. HybridRAGFactory 概要

### 1.1 責務

- 設定に基づいて適切なコンポーネントを組み立て、`HybridRAGEngine`インスタンスを生成
- 3種類のエンジン生成メソッドを提供（Full/Lite/Testing）
- コンポーネントの依存関係を解決

### 1.2 クラス構造

```typescript
export class HybridRAGFactory {
  // フル機能エンジン
  static createFull(config: FullHybridRAGConfig): HybridRAGEngine;

  // 軽量版エンジン
  static createLite(config: LiteHybridRAGConfig): HybridRAGEngine;

  // テスト用エンジン
  static createForTesting(mocks: TestMocks): HybridRAGEngine;

  // Private: Reranker生成
  private static createReranker(config: FullHybridRAGConfig): IReranker;

  // Private: CRAG生成
  private static createCRAG(config: FullHybridRAGConfig): CorrectiveRAG;
}
```

---

## 2. createFull メソッド

### 2.1 概要

フル機能のHybridRAGエンジンを生成する。LLMベースのQueryClassifier、選択可能なReranker、CRAG機能を含む。

### 2.2 設定インターフェース

```typescript
export interface FullHybridRAGConfig {
  // 必須: データベース・プロバイダー
  db: DrizzleClient;
  embeddingProvider: IEmbeddingProvider;
  graphStore: IKnowledgeGraphStore;
  llmClient: ILLMClient;

  // Reranker設定
  rerankerType: "cohere" | "voyage" | "llm" | "none";
  cohereApiKey?: string;
  cohereModel?: string;
  voyageApiKey?: string;
  rerankerBatchSize?: number;

  // RRF設定
  rrfK?: number;

  // CRAG設定
  enableCRAG?: boolean;
  cragMaxEvaluate?: number;
  cragCorrectThreshold?: number;
  cragIncorrectThreshold?: number;
  ambiguousFilterThreshold?: number;

  // Web検索設定
  webSearcher?: IWebSearcher;
  enableWebSearch?: boolean;
  enableRefinement?: boolean;
}
```

### 2.3 生成されるコンポーネント

| コンポーネント        | 設定                               |
| --------------------- | ---------------------------------- |
| QueryClassifier       | LLMベース（`useLLM: true`）        |
| KeywordSearchStrategy | 標準                               |
| VectorSearchStrategy  | 標準                               |
| GraphSearchStrategy   | 標準                               |
| RRFFusion             | `rrfK`パラメータ（デフォルト: 60） |
| IReranker             | `rerankerType`に応じて選択         |
| CorrectiveRAG         | `enableCRAG`がtrueの場合のみ       |

### 2.4 実装フロー

```typescript
static createFull(config: FullHybridRAGConfig): HybridRAGEngine {
  // 1. Query Classifier（LLMベース）
  const queryClassifier = new QueryClassifier(config.llmClient, {
    useLLM: true,
  });

  // 2. Search Strategies
  const keywordStrategy = new KeywordSearchStrategy(config.db);
  const vectorStrategy = new VectorSearchStrategy(
    config.db,
    config.embeddingProvider
  );
  const graphStrategy = new GraphSearchStrategy(
    config.graphStore,
    config.embeddingProvider
  );

  // 3. Fusion
  const fusion = new RRFFusion(config.rrfK ?? 60);

  // 4. Reranker
  const reranker = this.createReranker(config);

  // 5. CRAG（オプション）
  const crag = config.enableCRAG ? this.createCRAG(config) : null;

  return new HybridRAGEngine(
    queryClassifier,
    { keyword: keywordStrategy, semantic: vectorStrategy, graph: graphStrategy },
    fusion,
    reranker,
    crag
  );
}
```

### 2.5 Reranker生成ロジック

```typescript
private static createReranker(config: FullHybridRAGConfig): IReranker {
  switch (config.rerankerType) {
    case "cohere":
      if (!config.cohereApiKey) {
        throw new Error("Cohere API key required for cohere reranker");
      }
      return new CohereReranker(
        config.cohereApiKey,
        config.cohereModel ?? "rerank-multilingual-v3.0"
      );

    case "voyage":
      if (!config.voyageApiKey) {
        throw new Error("Voyage API key required for voyage reranker");
      }
      return new VoyageReranker(config.voyageApiKey);

    case "llm":
      return new LLMReranker(config.llmClient, {
        batchSize: config.rerankerBatchSize ?? 10,
      });

    case "none":
    default:
      return new NoOpReranker();
  }
}
```

### 2.6 CRAG生成ロジック

```typescript
private static createCRAG(config: FullHybridRAGConfig): CorrectiveRAG {
  const evaluator = new RelevanceEvaluator(config.llmClient, {
    maxEvaluate: config.cragMaxEvaluate ?? 5,
    correctThreshold: config.cragCorrectThreshold ?? 0.7,
    incorrectThreshold: config.cragIncorrectThreshold ?? 0.3,
  });

  return new CorrectiveRAG(evaluator, config.webSearcher ?? null, {
    enableWebSearch: config.enableWebSearch ?? false,
    enableRefinement: config.enableRefinement ?? true,
    ambiguousFilterThreshold: config.ambiguousFilterThreshold ?? 0.4,
  });
}
```

---

## 3. createLite メソッド

### 3.1 概要

軽量版のHybridRAGエンジンを生成する。ルールベースのQueryClassifier、NoOpReranker、CRAG無効。

### 3.2 設定インターフェース

```typescript
export interface LiteHybridRAGConfig {
  // 必須: データベース・プロバイダー
  db: DrizzleClient;
  embeddingProvider: IEmbeddingProvider;
  graphStore: IKnowledgeGraphStore;
}
```

### 3.3 生成されるコンポーネント

| コンポーネント        | 設定                            |
| --------------------- | ------------------------------- |
| QueryClassifier       | ルールベース（`useLLM: false`） |
| KeywordSearchStrategy | 標準                            |
| VectorSearchStrategy  | 標準                            |
| GraphSearchStrategy   | 標準                            |
| RRFFusion             | デフォルトパラメータ（k=60）    |
| IReranker             | NoOpReranker                    |
| CorrectiveRAG         | null（無効）                    |

### 3.4 実装フロー

```typescript
static createLite(config: LiteHybridRAGConfig): HybridRAGEngine {
  // 1. Query Classifier（ルールベース）
  const queryClassifier = new QueryClassifier(null, { useLLM: false });

  // 2. Search Strategies
  const keywordStrategy = new KeywordSearchStrategy(config.db);
  const vectorStrategy = new VectorSearchStrategy(
    config.db,
    config.embeddingProvider
  );
  const graphStrategy = new GraphSearchStrategy(
    config.graphStore,
    config.embeddingProvider
  );

  // 3. Fusion
  const fusion = new RRFFusion();

  // 4. NoOpReranker
  const reranker = new NoOpReranker();

  // 5. CRAG無効
  return new HybridRAGEngine(
    queryClassifier,
    { keyword: keywordStrategy, semantic: vectorStrategy, graph: graphStrategy },
    fusion,
    reranker,
    null
  );
}
```

### 3.5 使用例

```typescript
// レイテンシ重視の軽量版エンジン
const liteEngine = HybridRAGFactory.createLite({
  db: drizzleClient,
  embeddingProvider: openaiEmbedding,
  graphStore: knowledgeGraphStore,
});

// CRAG/Rerankingなしの高速検索
const result = await liteEngine.search("TypeScriptの型システム", 10);
```

---

## 4. createForTesting メソッド

### 4.1 概要

テスト用のHybridRAGエンジンを生成する。各コンポーネントをモックとして注入可能。

### 4.2 設定インターフェース

```typescript
export interface TestMocks {
  // 必須: 主要コンポーネントのモック
  queryClassifier: QueryClassifier;
  keywordStrategy: ISearchStrategy;
  semanticStrategy: ISearchStrategy;
  graphStrategy: ISearchStrategy;

  // オプション: その他コンポーネント
  fusion?: RRFFusion;
  reranker?: IReranker;
  crag?: CorrectiveRAG;
}
```

### 4.3 実装フロー

```typescript
static createForTesting(mocks: TestMocks): HybridRAGEngine {
  return new HybridRAGEngine(
    mocks.queryClassifier,
    {
      keyword: mocks.keywordStrategy,
      semantic: mocks.semanticStrategy,
      graph: mocks.graphStrategy,
    },
    mocks.fusion ?? new RRFFusion(),
    mocks.reranker ?? new NoOpReranker(),
    mocks.crag ?? null
  );
}
```

### 4.4 テストでの使用例

```typescript
describe("HybridRAGEngine", () => {
  it("4ステージパイプラインが正常に動作する", async () => {
    // モック作成
    const mockQueryClassifier = {
      classify: vi.fn().mockResolvedValue(
        ok({
          queryType: "local",
          weights: { keyword: 0.35, semantic: 0.35, graph: 0.3 },
        }),
      ),
    };

    const mockKeywordStrategy = {
      name: "keyword",
      search: vi.fn().mockResolvedValue(ok(createMockResults(5))),
    };

    const mockSemanticStrategy = {
      name: "semantic",
      search: vi.fn().mockResolvedValue(ok(createMockResults(5))),
    };

    const mockGraphStrategy = {
      name: "graph",
      search: vi.fn().mockResolvedValue(ok(createMockResults(5))),
    };

    // テスト用エンジン生成
    const engine = HybridRAGFactory.createForTesting({
      queryClassifier: mockQueryClassifier as any,
      keywordStrategy: mockKeywordStrategy as any,
      semanticStrategy: mockSemanticStrategy as any,
      graphStrategy: mockGraphStrategy as any,
    });

    // テスト実行
    const result = await engine.search("test query", 10);

    expect(result.success).toBe(true);
    expect(mockQueryClassifier.classify).toHaveBeenCalledWith("test query");
    expect(mockKeywordStrategy.search).toHaveBeenCalled();
  });
});
```

---

## 5. 設定パラメータ一覧

### 5.1 FullHybridRAGConfig パラメータ

| パラメータ               | 型                   | 必須 | デフォルト                 | 説明                     |
| ------------------------ | -------------------- | ---- | -------------------------- | ------------------------ |
| db                       | DrizzleClient        | Yes  | -                          | データベースクライアント |
| embeddingProvider        | IEmbeddingProvider   | Yes  | -                          | 埋め込みプロバイダー     |
| graphStore               | IKnowledgeGraphStore | Yes  | -                          | グラフストア             |
| llmClient                | ILLMClient           | Yes  | -                          | LLMクライアント          |
| rerankerType             | string               | Yes  | -                          | Rerankerタイプ           |
| cohereApiKey             | string               | No   | -                          | Cohere APIキー           |
| cohereModel              | string               | No   | "rerank-multilingual-v3.0" | Cohereモデル             |
| voyageApiKey             | string               | No   | -                          | Voyage APIキー           |
| rerankerBatchSize        | number               | No   | 10                         | Rerankerバッチサイズ     |
| rrfK                     | number               | No   | 60                         | RRF Fusion k値           |
| enableCRAG               | boolean              | No   | false                      | CRAG有効化               |
| cragMaxEvaluate          | number               | No   | 5                          | CRAG評価最大件数         |
| cragCorrectThreshold     | number               | No   | 0.7                        | correct判定閾値          |
| cragIncorrectThreshold   | number               | No   | 0.3                        | incorrect判定閾値        |
| ambiguousFilterThreshold | number               | No   | 0.4                        | ambiguous時フィルタ閾値  |
| webSearcher              | IWebSearcher         | No   | null                       | Web検索プロバイダー      |
| enableWebSearch          | boolean              | No   | false                      | Web検索有効化            |
| enableRefinement         | boolean              | No   | true                       | リファインメント有効化   |

### 5.2 LiteHybridRAGConfig パラメータ

| パラメータ        | 型                   | 必須 | デフォルト | 説明                     |
| ----------------- | -------------------- | ---- | ---------- | ------------------------ |
| db                | DrizzleClient        | Yes  | -          | データベースクライアント |
| embeddingProvider | IEmbeddingProvider   | Yes  | -          | 埋め込みプロバイダー     |
| graphStore        | IKnowledgeGraphStore | Yes  | -          | グラフストア             |

---

## 6. エラーハンドリング

### 6.1 createFull のエラー

| エラー条件                             | エラーメッセージ                              |
| -------------------------------------- | --------------------------------------------- |
| `rerankerType: "cohere"` でAPIキーなし | "Cohere API key required for cohere reranker" |
| `rerankerType: "voyage"` でAPIキーなし | "Voyage API key required for voyage reranker" |

### 6.2 エラー処理例

```typescript
try {
  const engine = HybridRAGFactory.createFull({
    db: drizzleClient,
    embeddingProvider: openaiEmbedding,
    graphStore: knowledgeGraphStore,
    llmClient: anthropicClient,
    rerankerType: "cohere",
    // cohereApiKey: undefined  // APIキーなし
  });
} catch (error) {
  console.error("Engine creation failed:", error.message);
  // "Cohere API key required for cohere reranker"
}
```

---

## 7. 変更履歴

| 日付       | 版  | 変更内容 |
| ---------- | --- | -------- |
| 2026-01-17 | 1.0 | 初版作成 |
