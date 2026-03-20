# 実装ガイド: HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目         | 値                                                          |
| ------------ | ----------------------------------------------------------- |
| タスクID     | `UT-RAG-08-002`                                             |
| 対象ファイル | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日       | 2026-03-20                                                  |
| Phase        | 12 - ドキュメント                                           |

---

## Part 1: 中学生レベル概念説明

### このタスクで何を作ったか

AIを使った「賢い検索エンジン」を組み立てる**工場**を完成させました。

### 工場の組み立てライン

工場には2種類の組み立てラインがあります。

**`createFull()` — 全部品搭載の高性能ライン**

自動車工場でたとえると「フル装備の最上級モデル」を作るラインです。

- AI が質問の種類を判断するスタッフ（分類係）
- キーワード検索・意味検索・グラフ検索の 3 種類の検索機
- 検索結果を賢い順に並び替えるスタッフ（リランク係）
- 「この答えは正しいか？」を検証してウェブ検索で補正するスタッフ（間違い訂正係）

これら全部を一度に組み立てて、完成品のエンジンを返します。

**`createLite()` — 標準部品だけの基本ライン**

「シンプルで速い標準モデル」を作るラインです。

- ルールだけで質問を分類するスタッフ（AI は使わない）
- 3 種類の検索機（フル版と同じ）
- 並び替え係と間違い訂正係は省略（コスト節約）

### 変換アダプター

工場にはちょっと困った部品があります。「キーワード検索機」（`KeywordSearchStrategy`）は、工場の標準コネクタ（`ISearchStrategy`）の形と合いません。

そこで登場するのが **`KeywordSearchStrategyAdapter`**（変換アダプター）です。

家電のコンセントを海外で使うときの「変換プラグ」と同じ仕組みです。キーワード検索機をアダプターに差し込むと、工場が理解できる標準コネクタ形式に変換されます。変換ルールはシンプルです。

| 元の形式                | 変換後の形式（SearchQuery） |
| ----------------------- | --------------------------- |
| `query`（文字列）       | `text` フィールド           |
| `limit`（件数）         | `limit` フィールド          |
| `filters?.fileIds`      | `fileIds` フィールド        |
| `filters?.minRelevance` | `minRelevance` フィールド   |

### 入荷チェック（バリデーション）

工場が組み立てを始める前に、**入荷検査係**（`validateFullConfig`）が「必要な部品が全部届いているか」を確認します。

部品が足りないまま組み立てを始めると、途中で止まって大変なことになります。だから事前に止めます。

| チェック内容                                     | 足りないときのメッセージ                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `rerankerType=cohere` なのに API キーなし        | `HybridRAGFactory.createFull(): cohereApiKey is required when rerankerType is 'cohere'`   |
| `rerankerType=voyage` なのに API キーなし        | `HybridRAGFactory.createFull(): voyageApiKey is required when rerankerType is 'voyage'`   |
| `rerankerType=llm` なのに LLM クライアントなし   | `HybridRAGFactory.createFull(): rerankerLlmClient is required when rerankerType is 'llm'` |
| `enableCRAG=true` なのに CRAG 用クライアントなし | `HybridRAGFactory.createFull(): cragLlmClient is required when enableCRAG is true`        |

### 3 種の AI スタッフ

フル機能ラインには 3 人の AI スタッフがいます。それぞれ「別の会社から派遣された別の人」です。

| スタッフ            | 役割                                   | 設定プロパティ                             |
| ------------------- | -------------------------------------- | ------------------------------------------ |
| `llmProvider`       | 分類係（質問の種類を判断する）         | `ILLMProvider`（抽出サービスの interface） |
| `rerankerLlmClient` | 並び替え係（検索結果の順位を整える）   | `ILLMClient`（llm/types の interface）     |
| `cragLlmClient`     | 間違い訂正係（答えの正しさを検証する） | `ILLMClient`（crag/types の interface）    |

同じ AI サービスのインスタンスを 3 役兼任させることは**技術的には可能**です。ただし、工場のルールとして「それぞれ別々に渡してもらう」ことになっています。工場が勝手に兼任の設定をすることはありません（設定するのは呼び出し元の責任）。

### graph strategy の制約（正直な説明）

グラフ検索（`GraphSearchStrategy`）には現在ひとつの制約があります。

検索エンジン（`HybridRAGEngine`）は質問の種類（`queryType`）を内部で判断しますが、その情報をグラフ検索機まで**届けていません**。グラフ検索機は常に `local` mode として動作します。

これは「本来は渡すべきだが、今回のタスクでは直さない」と決めた既知の制約です（KL-01: queryType 非伝播）。将来の改善タスクに回されています。

---

## Part 2: 開発者向け実装詳細

### 設計の全体像

```
packages/shared/src/services/search/
  hybrid-rag-factory.ts              # このファイルが対象
  strategies/
    keyword-search-strategy-adapter.ts  # 新規追加（DT-03）
```

### DT-01: 型 import と alias 設計

現行コードの `@placeholder` 型定義を全て削除し、実型へ置換します。

```typescript
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { IEmbeddingProvider } from "../embedding/providers/interfaces";
import type { ILLMProvider } from "../extraction/interfaces";
import type { IKnowledgeGraphStore } from "../graph/knowledge-graph-store";
import type { ICommunitySummarizer } from "../graph/interfaces/community-summarizer.interface";
import type { ILLMClient as RerankerLLMClient } from "../llm/types";
import type { ILLMClient as CragLLMClient, IWebSearcher } from "./crag/types";
```

**alias 設計の理由**: `../llm/types` と `./crag/types` はどちらも `ILLMClient` という同名 interface を export しています。両方を同一ファイルで使うには alias が必須です。`RerankerLLMClient` / `CragLLMClient` という名前にすることで、どちらの用途かがコードを読むだけで明確になります（KL-02 の既知制約でもある）。

### DT-02: FullHybridRAGConfig の型定義と 3 LLM 系統分離

現行コードの `llmClient: ILLMClient` は 3 種の用途を 1 プロパティに混在させています。設計後は明示的に分離します。

```typescript
export interface FullHybridRAGConfig {
  // インフラ
  db: LibSQLDatabase<Record<string, never>>;
  embeddingProvider: IEmbeddingProvider;
  graphStore: IKnowledgeGraphStore;

  // LLM 系統 1: 質問分類
  llmProvider: ILLMProvider;

  // Reranker
  rerankerType: "cohere" | "voyage" | "llm" | "none";
  rerankerLlmClient?: RerankerLLMClient; // LLM 系統 2: rerankerType=llm 時のみ使用
  cohereApiKey?: string;
  cohereModel?: string;
  voyageApiKey?: string;
  rerankerBatchSize?: number;

  // CRAG
  enableCRAG?: boolean;
  cragLlmClient?: CragLLMClient; // LLM 系統 3: enableCRAG=true 時のみ使用
  webSearcher?: IWebSearcher;
  enableWebSearch?: boolean;
  enableRefinement?: boolean;
  cragMaxEvaluate?: number;
  cragCorrectThreshold?: number;
  cragIncorrectThreshold?: number;
  ambiguousFilterThreshold?: number;

  // Optional
  communitySummarizer?: ICommunitySummarizer;
  rrfK?: number;
}
```

**3 LLM 系統分離の設計理由**: 1 プロパティで兼用すると、どの interface が実際に必要かが呼び出し元から判断できません。明示的に分離することで、factory 外で「同じインスタンスを渡す」「別インスタンスを渡す」のどちらの選択も caller の意図として明確になります。

`LiteHybridRAGConfig` は `db / embeddingProvider / graphStore` の 3 プロパティのみを持ちます（LLM 系統は全て不要）。

### DT-03: KeywordSearchStrategyAdapter の bridge 責務

`KeywordSearchStrategy` は `search(query: SearchQuery, limit?: number): Promise<SearchResultItem[]>` という独自シグネチャを持ち、`ISearchStrategy` の `search(query: string, limit?: number, filters?: SearchFilters)` と互換しません。

adapter がこの変換を一手に引き受けます。

```typescript
// packages/shared/src/services/search/strategies/keyword-search-strategy-adapter.ts

export class KeywordSearchStrategyAdapter implements ISearchStrategy {
  constructor(private readonly inner: KeywordSearchStrategy) {}

  get name(): string {
    return "keyword";
  }

  async search(
    query: string,
    limit?: number,
    filters?: SearchFilters,
  ): Promise<SearchResultItem[]> {
    const searchQuery: SearchQuery = {
      text: query,
      limit,
      fileIds: filters?.fileIds,
      minRelevance: filters?.minRelevance,
    };
    return this.inner.search(searchQuery, limit);
  }
}
```

**単一責務の確認**: adapter は `SearchQuery` 変換と `source="keyword"` の維持だけを担います。`KeywordSearchStrategy` 本体の public interface は変更しません（FR-02 準拠）。

### DT-04: createFull() の組み立て手順

```typescript
static createFull(config: FullHybridRAGConfig): HybridRAGEngine {
  validateFullConfig(config);

  const classifier = new LLMQueryClassifier(
    config.llmProvider,
    new RuleBasedQueryClassifier(),
  );
  const keyword = new KeywordSearchStrategyAdapter(
    new KeywordSearchStrategy(config.db),
  );
  const semantic = new VectorSearchStrategy(config.db, config.embeddingProvider);
  const graph = new GraphSearchStrategy(
    config.graphStore,
    config.embeddingProvider,
    config.communitySummarizer,
  );
  const fusion = new RRFFusion(config.rrfK ?? 60);
  const reranker = createReranker(config);
  const crag = createCrag(config);

  return new HybridRAGEngine(
    classifier,
    { keyword, semantic, graph },
    fusion,
    reranker,
    crag,
  );
}
```

### DT-05: createLite() の組み立て手順

```typescript
static createLite(config: LiteHybridRAGConfig): HybridRAGEngine {
  const classifier = new RuleBasedQueryClassifier();
  const keyword = new KeywordSearchStrategyAdapter(
    new KeywordSearchStrategy(config.db),
  );
  const semantic = new VectorSearchStrategy(config.db, config.embeddingProvider);
  const graph = new GraphSearchStrategy(
    config.graphStore,
    config.embeddingProvider,
  );
  const fusion = new RRFFusion();
  const reranker = new NoOpReranker();
  const crag = null;

  return new HybridRAGEngine(
    classifier,
    { keyword, semantic, graph },
    fusion,
    reranker,
    crag,
  );
}
```

### DT-06: validateFullConfig の 4 条件（P62/P42 準拠）

```typescript
function validateFullConfig(config: FullHybridRAGConfig): void {
  if (config.rerankerType === "cohere" && !config.cohereApiKey?.trim()) {
    throw new Error(
      "HybridRAGFactory.createFull(): cohereApiKey is required when rerankerType is 'cohere'",
    );
  }
  if (config.rerankerType === "voyage" && !config.voyageApiKey?.trim()) {
    throw new Error(
      "HybridRAGFactory.createFull(): voyageApiKey is required when rerankerType is 'voyage'",
    );
  }
  if (config.rerankerType === "llm" && !config.rerankerLlmClient) {
    throw new Error(
      "HybridRAGFactory.createFull(): rerankerLlmClient is required when rerankerType is 'llm'",
    );
  }
  if (config.enableCRAG === true && !config.cragLlmClient) {
    throw new Error(
      "HybridRAGFactory.createFull(): cragLlmClient is required when enableCRAG is true",
    );
  }
}
```

**P62 準拠（DEFAULT_CONFIG への暗黙 fallback 禁止）**: 依存が足りない場合はエラーで止める。デフォルト値で黙って続行しない。

**P42 準拠（`.trim()` バリデーション）**: API キーは `!value?.trim()` で「空文字・スペースのみ」を同時に拒否する（型チェック → 空文字列 → トリム空文字列の 3 段バリデーション）。

### DT-07: createReranker の 4 分岐

```typescript
function createReranker(config: FullHybridRAGConfig): IReranker {
  switch (config.rerankerType) {
    case "cohere":
      return new CohereReranker(config.cohereApiKey!, config.cohereModel, {
        batchSize: config.rerankerBatchSize,
      });
    case "voyage":
      return new VoyageReranker(config.voyageApiKey!, {
        batchSize: config.rerankerBatchSize,
      });
    case "llm":
      return new LLMReranker(config.rerankerLlmClient!);
    case "none":
    default:
      return new NoOpReranker();
  }
}
```

`validateFullConfig` が事前にチェック済みのため、`cohere` / `voyage` / `llm` 分岐では `!` non-null assertion を安全に使用できます（P48 例外: バリデーション済み後の展開）。

### DT-08: createCrag の条件分岐

```typescript
function createCrag(config: FullHybridRAGConfig): ICorrectiveRAG | null {
  if (!config.enableCRAG) {
    return null;
  }
  // validateFullConfig で cragLlmClient の存在を保証済み
  return new CorrectiveRAG(
    new RelevanceEvaluator(config.cragLlmClient!),
    config.webSearcher,
    {
      maxEvaluate: config.cragMaxEvaluate,
      correctThreshold: config.cragCorrectThreshold,
      incorrectThreshold: config.cragIncorrectThreshold,
      ambiguousFilterThreshold: config.ambiguousFilterThreshold,
      enableWebSearch: config.enableWebSearch,
      enableRefinement: config.enableRefinement,
    },
  );
}
```

`enableCRAG` が falsy の場合は `null` を返すだけです。CRAG 機能を使わない場合に余分なインスタンスを生成しないシンプルな分岐です。

### createForTesting() との設計的一貫性

`createForTesting()` は現行コードで既に完全動作しており、変更不要です。

```typescript
static createForTesting(mocks: TestMocks): HybridRAGEngine {
  return new HybridRAGEngine(
    mocks.queryClassifier,
    { keyword: mocks.keywordStrategy, semantic: mocks.semanticStrategy, graph: mocks.graphStrategy },
    mocks.fusion ?? new RRFFusion(),
    mocks.reranker ?? new NoOpReranker(),
    mocks.crag ?? null,
    mocks.options ?? {},
  );
}
```

`createFull()` / `createLite()` / `createForTesting()` は全て `new HybridRAGEngine(classifier, strategies, fusion, reranker, crag)` という同じシグネチャで engine を構築します。factory method のどれを使っても同じ engine が得られる一貫性が保たれています。

### 既知制約

| ID    | 内容                                                                                                            | 対処                                     |
| ----- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| KL-01 | `HybridRAGEngine` が `GraphSearchStrategy` へ `queryType` を渡さない                                            | 本 task のスコープ外。follow-up タスクへ |
| KL-02 | `RerankerLLMClient` (`../llm/types`) と `CragLLMClient` (`./crag/types`) が同名の `ILLMClient` だが別 interface | import alias で回避。統一は別タスクへ    |

KL-01 の影響: graph strategy は常に `local` mode として動作する。`queryType` が `"global"` や `"relationship"` の場合でも、graph strategy 側で最適化されたロジックを使えない。動作は正常だがパフォーマンス上限が低い。

KL-02 の影響: factory ファイル内では `RerankerLLMClient` / `CragLLMClient` の alias で明示的に区別できている。ただし 2 種の `ILLMClient` が型レベルで統一されていないため、caller 側が混乱するリスクがある。

### helper 境界の一覧

| helper               | 入力                  | 出力                     | 役割             |
| -------------------- | --------------------- | ------------------------ | ---------------- |
| `validateFullConfig` | `FullHybridRAGConfig` | `void` (or throws)       | 必須依存チェック |
| `createReranker`     | `FullHybridRAGConfig` | `IReranker`              | reranker 4 分岐  |
| `createCrag`         | `FullHybridRAGConfig` | `ICorrectiveRAG \| null` | CRAG 条件分岐    |

`KeywordSearchStrategyAdapter` は `strategies/` サブディレクトリに分離して、factory ファイルの責務をオーケストレーションのみに保ちます（DIP 準拠: factory は抽象に依存）。

---

## 関連ファイル

| ファイル                                                                            | 役割                        |
| ----------------------------------------------------------------------------------- | --------------------------- |
| `packages/shared/src/services/search/hybrid-rag-factory.ts`                         | メイン実装                  |
| `packages/shared/src/services/search/strategies/keyword-search-strategy-adapter.ts` | 新規追加: keyword bridge    |
| `packages/shared/src/services/search/hybrid-rag-engine.ts`                          | engine 本体（変更なし）     |
| `packages/shared/src/services/search/reranking/`                                    | reranker 実装群（変更なし） |
| `packages/shared/src/services/search/crag/`                                         | CRAG 実装群（変更なし）     |
