# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 5                          |
| Phase名    | 実装                       |
| 前提Phase  | Phase 4                    |
| 後続Phase  | Phase 6                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-11                 |
| 機能名     | graphrag-query-integration |

---

## 目的

TDDの「Green」フェーズとして、Phase 4で作成したテストを通す最小限の実装を行う。Phase 2の設計に基づき、GraphRAGクエリサービスにコミュニティ要約検索を統合する。

## 背景

TDD（テスト駆動開発）の「Green」フェーズでは、テストを通すための最小限のコードを実装する。過度な最適化やリファクタリングはPhase 8で行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型定義の実装

**目的**: Phase 2で設計した型定義を実装する

**実行手順**:

1. GraphRAGQueryService 関連の型定義を作成する

```typescript
// packages/shared/src/services/search/types/graphrag-query.ts

import type { CommunityId } from "../../graph/types";
import type { QueryType, SearchWeights, SearchStrategy } from "./search";

/** GraphRAGクエリオプション */
export interface GraphRAGQueryOptions {
  /** 最大検索結果数 */
  limit?: number;
  /** コミュニティ階層レベル（指定時はそのレベルのみ検索） */
  communityLevel?: number;
  /** 要約のconfidence閾値（これ以下は除外） */
  confidenceThreshold?: number;
  /** 検索戦略の重み */
  searchWeights?: SearchWeights;
  /** コミュニティ要約検索を有効化（デフォルト: true） */
  enableCommunitySummary?: boolean;
}

/** GraphRAGクエリレスポンス */
export interface GraphRAGQueryResponse {
  /** 生成された回答テキスト */
  answer: string;
  /** 参照したコミュニティ要約 */
  communitySummaries: CommunitySummaryReference[];
  /** 参照したチャンク */
  chunks: ChunkReference[];
  /** 参照したエンティティ */
  entities: EntityReference[];
  /** 処理メタデータ */
  metadata: QueryMetadata;
}

/** コミュニティ要約参照 */
export interface CommunitySummaryReference {
  communityId: CommunityId;
  level: number;
  summary: string;
  relevanceScore: number;
}

/** クエリメタデータ */
export interface QueryMetadata {
  queryType: QueryType;
  processingTimeMs: number;
  searchStrategy: SearchStrategy;
}

/** GraphRAGクエリエラー */
export type GraphRAGQueryError =
  | { code: "EMBEDDING_FAILED"; message: string }
  | { code: "COMMUNITY_SEARCH_FAILED"; message: string }
  | { code: "HYBRID_SEARCH_FAILED"; message: string }
  | { code: "LLM_GENERATION_FAILED"; message: string }
  | { code: "INVALID_QUERY"; message: string };
```

2. バリデーションスキーマを実装する

```typescript
// packages/shared/src/services/search/schemas/graphrag-query.ts

import { z } from "zod";
import { SearchWeightsSchema } from "./search";

export const GraphRAGQueryOptionsSchema = z.object({
  limit: z.number().int().min(1).max(20).optional().default(10),
  communityLevel: z.number().int().min(0).max(5).optional(),
  confidenceThreshold: z.number().min(0).max(1).optional().default(0.5),
  searchWeights: SearchWeightsSchema.optional(),
  enableCommunitySummary: z.boolean().optional().default(true),
});
```

**期待される成果物**:

- `packages/shared/src/services/search/types/graphrag-query.ts`
- `packages/shared/src/services/search/schemas/graphrag-query.ts`

---

### タスク2: インターフェースの実装

**目的**: IGraphRAGQueryService インターフェースを実装する

**実行手順**:

1. インターフェース定義を作成する

```typescript
// packages/shared/src/services/search/interfaces/graphrag-query-service.ts

import type { Result } from "../../../types/result";
import type {
  GraphRAGQueryOptions,
  GraphRAGQueryResponse,
  GraphRAGQueryError,
} from "../types";

/** GraphRAGクエリサービスインターフェース */
export interface IGraphRAGQueryService {
  /**
   * GraphRAGクエリを実行し、コミュニティ要約を含む回答を生成
   * @param query ユーザークエリ
   * @param options クエリオプション
   * @returns 回答レスポンスまたはエラー
   */
  query(
    query: string,
    options?: GraphRAGQueryOptions,
  ): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>>;
}
```

2. 依存関係インターフェースを確認する

```typescript
// 既存インターフェースの確認
// - ICommunitySummarizer (packages/shared/src/services/graph/interfaces)
// - IQueryClassifier (packages/shared/src/services/search/interfaces)
// - IEmbeddingProvider (packages/shared/src/services/llm/interfaces)
// - ILLMProvider (packages/shared/src/services/llm/interfaces)
```

**期待される成果物**:

- `packages/shared/src/services/search/interfaces/graphrag-query-service.ts`

---

### タスク3: GraphRAGQueryService の実装

**目的**: メインサービスクラスを実装する

**実行手順**:

1. サービスクラスを作成する

```typescript
// packages/shared/src/services/search/graphrag-query-service.ts

import type { Result } from "../../types/result";
import type { ICommunitySummarizer } from "../graph/interfaces";
import type { IQueryClassifier } from "./interfaces";
import type { IEmbeddingProvider, ILLMProvider } from "../llm/interfaces";
import type {
  GraphRAGQueryOptions,
  GraphRAGQueryResponse,
  GraphRAGQueryError,
  CommunitySummaryReference,
} from "./types";
import { GraphRAGQueryOptionsSchema } from "./schemas";

interface GraphRAGQueryServiceDependencies {
  communitySummarizer: ICommunitySummarizer;
  queryClassifier: IQueryClassifier;
  embeddingProvider: IEmbeddingProvider;
  llmProvider: ILLMProvider;
}

export class GraphRAGQueryService implements IGraphRAGQueryService {
  private readonly communitySummarizer: ICommunitySummarizer;
  private readonly queryClassifier: IQueryClassifier;
  private readonly embeddingProvider: IEmbeddingProvider;
  private readonly llmProvider: ILLMProvider;

  constructor(deps: GraphRAGQueryServiceDependencies) {
    this.communitySummarizer = deps.communitySummarizer;
    this.queryClassifier = deps.queryClassifier;
    this.embeddingProvider = deps.embeddingProvider;
    this.llmProvider = deps.llmProvider;
  }

  async query(
    query: string,
    options?: GraphRAGQueryOptions,
  ): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>> {
    const startTime = performance.now();

    // 1. 入力バリデーション
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        error: { code: "INVALID_QUERY", message: "Query cannot be empty" },
      };
    }

    // 2. オプションのバリデーションとデフォルト値適用
    const validatedOptions = GraphRAGQueryOptionsSchema.parse(options ?? {});

    // 3. クエリ分類
    const classificationResult = await this.queryClassifier.classify(query);
    const queryType = classificationResult.success
      ? classificationResult.data.type
      : "hybrid";

    // 4. コミュニティ要約検索
    let communitySummaries: CommunitySummaryReference[] = [];
    if (validatedOptions.enableCommunitySummary) {
      const summaryResult = await this.searchCommunitySummaries(
        query,
        validatedOptions,
      );
      communitySummaries = summaryResult;
    }

    // 5. プロンプト構築
    const prompt = this.buildPrompt(query, communitySummaries);

    // 6. LLM回答生成
    const llmResult = await this.llmProvider.chat(prompt);
    if (!llmResult.success) {
      return {
        success: false,
        error: {
          code: "LLM_GENERATION_FAILED",
          message: llmResult.error?.message ?? "LLM generation failed",
        },
      };
    }

    // 7. レスポンス構築
    const processingTimeMs = performance.now() - startTime;
    return {
      success: true,
      data: {
        answer: llmResult.data.content,
        communitySummaries,
        chunks: [],
        entities: [],
        metadata: {
          queryType,
          processingTimeMs,
          searchStrategy: "hybrid",
        },
      },
    };
  }

  private async searchCommunitySummaries(
    query: string,
    options: Required<GraphRAGQueryOptions>,
  ): Promise<CommunitySummaryReference[]> {
    const searchResult = await this.communitySummarizer.searchSummaries(query, {
      limit: options.limit,
      level: options.communityLevel,
    });

    if (!searchResult.success) {
      // フォールバック: エラー時は空配列を返す
      console.warn("Community summary search failed, falling back to empty");
      return [];
    }

    // confidence閾値でフィルタリング
    return searchResult.data
      .filter((s) => s.confidence >= options.confidenceThreshold)
      .map((s) => ({
        communityId: s.communityId,
        level: s.level,
        summary: s.summary,
        relevanceScore: s.confidence,
      }));
  }

  private buildPrompt(
    query: string,
    communitySummaries: CommunitySummaryReference[],
  ): string {
    let prompt = `質問: ${query}\n\n`;

    if (communitySummaries.length > 0) {
      prompt += "## 関連するコミュニティの概要\n\n";
      for (const summary of communitySummaries) {
        prompt += `### レベル${summary.level}コミュニティ\n`;
        prompt += `${summary.summary}\n\n`;
      }
    }

    prompt += "上記の情報を参考に、質問に対して詳細に回答してください。";
    return prompt;
  }
}
```

**期待される成果物**:

- `packages/shared/src/services/search/graphrag-query-service.ts`

---

### タスク4: テスト実行とGreen状態確認

**目的**: 全てのテストが成功状態（Green）であることを確認する

**実行手順**:

1. テストを実行する

```bash
# テスト実行
pnpm --filter @repo/shared test -- --run src/services/search/__tests__/graphrag-query-service.test.ts
```

2. 全テストがGreen状態であることを確認する

```
Expected: All tests PASS (Green state)
```

3. 失敗するテストがある場合、実装を修正する

**期待される成果物**:

- テスト実行結果（全て成功）
- Green状態の確認記録

---

### タスク5: エクスポートの追加

**目的**: 新しいモジュールをパッケージのエクスポートに追加する

**実行手順**:

1. インデックスファイルを更新する

```typescript
// packages/shared/src/services/search/index.ts に追加
export { GraphRAGQueryService } from "./graphrag-query-service";
export type { IGraphRAGQueryService } from "./interfaces";
export type {
  GraphRAGQueryOptions,
  GraphRAGQueryResponse,
  GraphRAGQueryError,
  CommunitySummaryReference,
  QueryMetadata,
} from "./types";
```

**期待される成果物**:

- 更新された `index.ts`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装時に以下のシステム仕様を参照してください。

| 参照資料             | パス                                                                                          | 内容                   |
| -------------------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| コミュニティ要約仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | searchSummaries() 仕様 |
| RAGアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                       | Result型パターン       |

---

## 成果物

| 成果物           | パス                                                                       | 内容                      |
| ---------------- | -------------------------------------------------------------------------- | ------------------------- |
| 型定義           | `packages/shared/src/services/search/types/graphrag-query.ts`              | GraphRAG型定義            |
| スキーマ         | `packages/shared/src/services/search/schemas/graphrag-query.ts`            | Zodバリデーションスキーマ |
| インターフェース | `packages/shared/src/services/search/interfaces/graphrag-query-service.ts` | サービスインターフェース  |
| サービス実装     | `packages/shared/src/services/search/graphrag-query-service.ts`            | メインサービスクラス      |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 5での統合テスト連携アクション**:

Query Handler ↔ CommunitySummarizer接続の実装を行うこと。

具体的には以下を実装に含める:

- ICommunitySummarizer.searchSummaries() の呼び出し実装
- エラー時のフォールバック処理
- 依存注入によるテスト容易性の確保

---

## 完了条件

- [ ] 型定義が実装されている
- [ ] バリデーションスキーマが実装されている
- [ ] IGraphRAGQueryService インターフェースが定義されている
- [ ] GraphRAGQueryService クラスが実装されている
- [ ] ICommunitySummarizer.searchSummaries() が統合されている
- [ ] エラーハンドリング（フォールバック）が実装されている
- [ ] 全てのテストがGreen状態（成功）である
- [ ] エクスポートが追加されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run src/services/search/__tests__/graphrag-query-service.test.ts
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graphrag-query-integration/phase-6-test-expansion.md`
