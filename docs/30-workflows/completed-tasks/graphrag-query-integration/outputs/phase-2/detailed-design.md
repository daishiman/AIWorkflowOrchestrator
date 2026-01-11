# GraphRAGクエリ統合 詳細設計書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| タスクID   | CONV-08-04                 |
| 機能名     | graphrag-query-integration |
| Phase      | 2                          |
| 作成日     | 2026-01-11                 |
| 前提タスク | Phase 1（要件定義）        |

---

## 1. インターフェース設計

### 1.1 IGraphRAGQueryService インターフェース

```typescript
/**
 * GraphRAGクエリサービスインターフェース
 * @description コミュニティ要約を活用したGraphRAGクエリ処理
 */
interface IGraphRAGQueryService {
  /**
   * GraphRAGクエリを実行し、コミュニティ要約を含む回答を生成
   * @param query ユーザークエリ（空文字不可）
   * @param options クエリオプション
   * @returns 回答とメタデータを含むResult
   */
  query(
    query: string,
    options?: GraphRAGQueryOptions,
  ): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>>;
}
```

### 1.2 GraphRAGQueryOptions 型定義

```typescript
/**
 * GraphRAGクエリオプション
 */
interface GraphRAGQueryOptions {
  /**
   * 最大検索結果数
   * @minimum 1
   * @maximum 20
   * @default 10
   */
  limit?: number;

  /**
   * コミュニティ階層レベル（指定時はそのレベルのみ検索）
   * @minimum 0
   * @maximum 5
   */
  communityLevel?: number;

  /**
   * 要約のconfidence閾値（これ未満は除外）
   * @minimum 0
   * @maximum 1
   * @default 0.5
   */
  confidenceThreshold?: number;

  /**
   * 検索戦略の重み
   * keyword + semantic + graph = 1.0
   */
  searchWeights?: SearchWeights;

  /**
   * コミュニティ要約検索を有効化
   * @default true
   */
  enableCommunitySummary?: boolean;
}
```

### 1.3 GraphRAGQueryResponse 型定義

```typescript
/**
 * GraphRAGクエリレスポンス
 */
interface GraphRAGQueryResponse {
  /** 生成された回答テキスト */
  answer: string;

  /** 参照したコミュニティ要約 */
  communitySummaries: CommunitySummaryReference[];

  /** 参照したチャンク（将来拡張用、現Phase空配列） */
  chunks: ChunkReference[];

  /** 参照したエンティティ（将来拡張用、現Phase空配列） */
  entities: EntityReference[];

  /** 処理メタデータ */
  metadata: QueryMetadata;
}

/**
 * コミュニティ要約参照
 */
interface CommunitySummaryReference {
  /** コミュニティID */
  communityId: CommunityId;

  /** 階層レベル */
  level: number;

  /** 要約テキスト */
  summary: string;

  /** 要約の信頼度 */
  confidence: number;

  /** クエリとの関連度スコア */
  relevanceScore: number;
}

/**
 * チャンク参照（将来拡張用）
 */
interface ChunkReference {
  chunkId: string;
  content: string;
  relevanceScore: number;
}

/**
 * エンティティ参照（将来拡張用）
 */
interface EntityReference {
  entityId: string;
  name: string;
  type: string;
  relevanceScore: number;
}

/**
 * クエリメタデータ
 */
interface QueryMetadata {
  /** 判定されたクエリタイプ */
  queryType: QueryType;

  /** 処理時間（ミリ秒） */
  processingTimeMs: number;

  /** 使用された検索戦略 */
  searchStrategy: SearchStrategy;

  /** コミュニティ要約検索が実行されたか */
  communitySummarySearchExecuted: boolean;
}

/**
 * 検索戦略
 */
interface SearchStrategy {
  /** コミュニティ要約を使用したか */
  usedCommunitySummary: boolean;

  /** フォールバックが発生したか */
  fallbackOccurred: boolean;

  /** フォールバック理由（該当時） */
  fallbackReason?: string;
}
```

---

## 2. エラー型定義

### 2.1 GraphRAGQueryError

```typescript
/**
 * GraphRAGクエリエラー型
 */
type GraphRAGQueryError =
  | InvalidQueryError
  | ClassificationFailedError
  | CommunitySearchFailedError
  | LLMGenerationFailedError;

interface InvalidQueryError {
  code: "INVALID_QUERY";
  message: string;
  details?: {
    field: string;
    reason: string;
  };
}

interface ClassificationFailedError {
  code: "CLASSIFICATION_FAILED";
  message: string;
  cause?: Error;
}

interface CommunitySearchFailedError {
  code: "COMMUNITY_SEARCH_FAILED";
  message: string;
  cause?: Error;
}

interface LLMGenerationFailedError {
  code: "LLM_GENERATION_FAILED";
  message: string;
  cause?: Error;
}
```

### 2.2 エラーコード定数

```typescript
const GraphRAGQueryErrorCode = {
  INVALID_QUERY: "INVALID_QUERY",
  CLASSIFICATION_FAILED: "CLASSIFICATION_FAILED",
  COMMUNITY_SEARCH_FAILED: "COMMUNITY_SEARCH_FAILED",
  LLM_GENERATION_FAILED: "LLM_GENERATION_FAILED",
} as const;

type GraphRAGQueryErrorCode =
  (typeof GraphRAGQueryErrorCode)[keyof typeof GraphRAGQueryErrorCode];
```

---

## 3. Zodバリデーションスキーマ

### 3.1 オプションスキーマ

```typescript
import { z } from "zod";

/**
 * SearchWeightsスキーマ（既存を参照）
 */
const searchWeightsSchema = z
  .object({
    keyword: z.number().min(0).max(1),
    semantic: z.number().min(0).max(1),
    graph: z.number().min(0).max(1),
  })
  .refine(
    (weights) => {
      const sum = weights.keyword + weights.semantic + weights.graph;
      return Math.abs(sum - 1.0) < 0.02;
    },
    { message: "検索重みの合計は1.0である必要があります" },
  );

/**
 * GraphRAGQueryOptionsスキーマ
 */
const graphRAGQueryOptionsSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1, "limitは1以上である必要があります")
    .max(20, "limitは20以下である必要があります")
    .optional()
    .default(10),

  communityLevel: z
    .number()
    .int()
    .min(0, "communityLevelは0以上である必要があります")
    .max(5, "communityLevelは5以下である必要があります")
    .optional(),

  confidenceThreshold: z
    .number()
    .min(0, "confidenceThresholdは0以上である必要があります")
    .max(1, "confidenceThresholdは1以下である必要があります")
    .optional()
    .default(0.5),

  searchWeights: searchWeightsSchema.optional(),

  enableCommunitySummary: z.boolean().optional().default(true),
});

/**
 * クエリ入力スキーマ
 */
const graphRAGQueryInputSchema = z.object({
  query: z
    .string()
    .min(1, "クエリは空にできません")
    .max(10000, "クエリは10000文字以下である必要があります"),
  options: graphRAGQueryOptionsSchema.optional(),
});
```

---

## 4. 依存性注入設計

### 4.1 依存関係インターフェース

```typescript
/**
 * GraphRAGQueryServiceの依存関係
 */
interface GraphRAGQueryServiceDependencies {
  /** クエリ分類器 */
  queryClassifier: IQueryClassifier;

  /** コミュニティ要約サービス */
  communitySummarizer: ICommunitySummarizer;

  /** 埋め込みプロバイダー */
  embeddingProvider: IEmbeddingProvider;

  /** LLMプロバイダー */
  llmProvider: ILLMProvider;
}
```

### 4.2 コンストラクタ設計

```typescript
class GraphRAGQueryService implements IGraphRAGQueryService {
  private readonly queryClassifier: IQueryClassifier;
  private readonly communitySummarizer: ICommunitySummarizer;
  private readonly embeddingProvider: IEmbeddingProvider;
  private readonly llmProvider: ILLMProvider;

  constructor(dependencies: GraphRAGQueryServiceDependencies) {
    this.queryClassifier = dependencies.queryClassifier;
    this.communitySummarizer = dependencies.communitySummarizer;
    this.embeddingProvider = dependencies.embeddingProvider;
    this.llmProvider = dependencies.llmProvider;
  }

  async query(
    query: string,
    options?: GraphRAGQueryOptions,
  ): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>> {
    // 実装は Phase 5 で行う
  }
}
```

---

## 5. ICommunitySummarizer統合設計

### 5.1 searchSummaries呼び出し

```typescript
/**
 * コミュニティ要約を検索
 */
private async searchCommunitySummaries(
  query: string,
  options: GraphRAGQueryOptions,
): Promise<Result<CommunitySummary[], Error>> {
  // 検索オプションを構築
  const searchOptions: CommunitySummarySearchOptions = {
    limit: options.limit ?? 10,
    level: options.communityLevel,
  };

  // ICommunitySummarizer.searchSummaries() を呼び出し
  return this.communitySummarizer.searchSummaries(query, searchOptions);
}
```

### 5.2 結果のフィルタリングと変換

```typescript
/**
 * 検索結果をフィルタリングして変換
 */
private filterAndTransformSummaries(
  summaries: CommunitySummary[],
  confidenceThreshold: number,
): CommunitySummaryReference[] {
  return summaries
    .filter((summary) => summary.confidence >= confidenceThreshold)
    .map((summary) => ({
      communityId: summary.communityId,
      level: summary.level,
      summary: summary.summary,
      confidence: summary.confidence,
      relevanceScore: summary.confidence, // 初期実装ではconfidenceをスコアとして使用
    }));
}
```

### 5.3 フォールバック処理

```typescript
/**
 * コミュニティ要約検索のフォールバック処理
 */
private async searchWithFallback(
  query: string,
  options: GraphRAGQueryOptions,
): Promise<{
  summaries: CommunitySummaryReference[];
  fallbackOccurred: boolean;
  fallbackReason?: string;
}> {
  // コミュニティ要約検索が無効の場合
  if (options.enableCommunitySummary === false) {
    return {
      summaries: [],
      fallbackOccurred: false,
    };
  }

  const result = await this.searchCommunitySummaries(query, options);

  if (!result.success) {
    // 検索失敗時はフォールバック
    console.warn('Community summary search failed:', result.error.message);
    return {
      summaries: [],
      fallbackOccurred: true,
      fallbackReason: result.error.message,
    };
  }

  const filtered = this.filterAndTransformSummaries(
    result.data,
    options.confidenceThreshold ?? 0.5,
  );

  return {
    summaries: filtered,
    fallbackOccurred: false,
  };
}
```

---

## 6. プロンプト構築設計

### 6.1 プロンプトテンプレート

```typescript
/**
 * コミュニティ要約コンテキストプロンプト
 */
const COMMUNITY_CONTEXT_TEMPLATE = `
以下のコミュニティ要約は、質問に関連するトピックの概要です。
回答を生成する際の参考にしてください。

## コミュニティ要約

{{#each communitySummaries}}
### レベル {{level}} コミュニティ
{{summary}}

主要エンティティ: {{mainEntities}}
キーワード: {{keywords}}
信頼度: {{confidence}}

{{/each}}
`;

/**
 * メインプロンプトテンプレート
 */
const MAIN_PROMPT_TEMPLATE = `
あなたはナレッジベースに基づいて質問に回答するアシスタントです。

{{#if hasCommunitySummaries}}
${COMMUNITY_CONTEXT_TEMPLATE}
{{/if}}

## ユーザーの質問

{{query}}

## 回答指示

- 提供されたコンテキスト情報に基づいて回答してください
- コンテキストに含まれない情報は推測しないでください
- 回答は簡潔かつ正確に行ってください
- 日本語で回答してください
`;
```

### 6.2 プロンプトビルダー

```typescript
/**
 * プロンプトを構築
 */
private buildPrompt(
  query: string,
  communitySummaries: CommunitySummaryReference[],
  queryType: QueryType,
): string {
  const hasCommunitySummaries = communitySummaries.length > 0;

  // テンプレートを適用
  let prompt = MAIN_PROMPT_TEMPLATE
    .replace('{{query}}', this.escapeForPrompt(query))
    .replace('{{#if hasCommunitySummaries}}', hasCommunitySummaries ? '' : '{{!--')
    .replace('{{/if}}', hasCommunitySummaries ? '' : '--}}');

  if (hasCommunitySummaries) {
    const summaryContext = communitySummaries
      .map((s) => `### レベル ${s.level} コミュニティ\n${s.summary}\n信頼度: ${s.confidence}`)
      .join('\n\n');

    prompt = prompt.replace('{{#each communitySummaries}}...{{/each}}', summaryContext);
  }

  return prompt;
}

/**
 * ユーザー入力をエスケープ
 */
private escapeForPrompt(input: string): string {
  // 基本的なエスケープ処理
  return input
    .replace(/{{/g, '{ {')
    .replace(/}}/g, '} }');
}
```

---

## 7. メイン処理フロー実装設計

### 7.1 query メソッド設計

```typescript
async query(
  query: string,
  options?: GraphRAGQueryOptions,
): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>> {
  const startTime = Date.now();

  // 1. 入力バリデーション
  const validationResult = this.validateInput(query, options);
  if (!validationResult.success) {
    return err(validationResult.error);
  }
  const validatedOptions = validationResult.data;

  // 2. クエリ分類
  const classificationResult = await this.classifyQuery(query);
  const queryType = classificationResult.success
    ? classificationResult.data.type
    : 'hybrid'; // フォールバック

  // 3. コミュニティ要約検索
  const searchResult = await this.searchWithFallback(query, validatedOptions);

  // 4. プロンプト構築
  const prompt = this.buildPrompt(query, searchResult.summaries, queryType);

  // 5. LLM回答生成
  const llmResult = await this.llmProvider.generate(prompt, {
    temperature: 0.7,
    maxTokens: 1000,
  });

  if (!llmResult.success) {
    return err({
      code: 'LLM_GENERATION_FAILED',
      message: `LLM generation failed: ${llmResult.error.message}`,
      cause: llmResult.error,
    });
  }

  // 6. レスポンス構築
  const processingTimeMs = Date.now() - startTime;

  return ok({
    answer: llmResult.data.text,
    communitySummaries: searchResult.summaries,
    chunks: [], // 将来拡張用
    entities: [], // 将来拡張用
    metadata: {
      queryType,
      processingTimeMs,
      searchStrategy: {
        usedCommunitySummary: searchResult.summaries.length > 0,
        fallbackOccurred: searchResult.fallbackOccurred,
        fallbackReason: searchResult.fallbackReason,
      },
      communitySummarySearchExecuted: validatedOptions.enableCommunitySummary,
    },
  });
}
```

### 7.2 バリデーション設計

```typescript
/**
 * 入力をバリデーション
 */
private validateInput(
  query: string,
  options?: GraphRAGQueryOptions,
): Result<Required<GraphRAGQueryOptions>, InvalidQueryError> {
  const parseResult = graphRAGQueryInputSchema.safeParse({ query, options });

  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0];
    return err({
      code: 'INVALID_QUERY',
      message: firstError?.message ?? 'Validation failed',
      details: {
        field: firstError?.path.join('.') ?? 'unknown',
        reason: firstError?.message ?? 'Unknown validation error',
      },
    });
  }

  return ok(parseResult.data.options);
}
```

---

## 8. テスト設計

### 8.1 ユニットテストケース

| テストケース                      | 入力                              | 期待結果                              |
| --------------------------------- | --------------------------------- | ------------------------------------- |
| 正常系: 基本クエリ                | "概要を教えて"                    | success: true, answer: 非空文字列     |
| 正常系: オプション指定            | query + { limit: 5 }              | success: true, 結果5件以下            |
| 正常系: コミュニティ検索無効      | { enableCommunitySummary: false } | communitySummaries: []                |
| 異常系: 空クエリ                  | ""                                | error: INVALID_QUERY                  |
| 異常系: 無効なlimit               | { limit: -1 }                     | error: INVALID_QUERY                  |
| 異常系: 無効なconfidenceThreshold | { confidenceThreshold: 1.5 }      | error: INVALID_QUERY                  |
| フォールバック: 検索失敗          | (モック検索失敗)                  | success: true, fallbackOccurred: true |
| フォールバック: LLM失敗           | (モックLLM失敗)                   | error: LLM_GENERATION_FAILED          |

### 8.2 統合テストケース

| テストケース                      | 検証内容                                         |
| --------------------------------- | ------------------------------------------------ |
| E2E: クエリ→分類→検索→生成        | 全コンポーネントの連携動作                       |
| 分類器連携: global クエリ         | global タイプでコミュニティ要約が活用される      |
| 分類器連携: local クエリ          | local タイプでも要約が補助的に使用される         |
| 要約検索連携: 複数レベル          | 複数階層の要約が正しく取得される                 |
| 要約検索連携: confidence フィルタ | 閾値未満の要約が除外される                       |
| フォールバック連携: 検索エラー    | 検索失敗時にフォールバックして回答生成が完了する |

---

## 9. 完了条件チェック

- [x] IGraphRAGQueryService インターフェースが定義されている
- [x] GraphRAGQueryOptions 型が定義されている
- [x] GraphRAGQueryResponse 型が定義されている
- [x] GraphRAGQueryError 型が定義されている
- [x] Zodバリデーションスキーマが設計されている
- [x] 依存性注入構造が設計されている
- [x] ICommunitySummarizer統合ポイントが設計されている
- [x] プロンプトテンプレートが設計されている
- [x] メイン処理フローが設計されている
- [x] テストケースが設計されている

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-11 | 1.0.0      | 初版作成 |
