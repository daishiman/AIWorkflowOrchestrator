# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 2                          |
| Phase名    | 設計                       |
| 前提Phase  | Phase 1                    |
| 後続Phase  | Phase 3                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-11                 |
| 機能名     | graphrag-query-integration |

---

## 目的

Phase 1で定義した要件に基づき、GraphRAGクエリへのコミュニティ要約統合のアーキテクチャ設計と詳細設計を行う。既存のICommunitySummarizerインターフェースとQuery Handlerの統合方法を設計する。

## 背景

CONV-08-03で実装されたICommunitySummarizerは、searchSummaries()メソッドでセマンティック検索を提供している。このメソッドをQuery Handler（または検索サービス）に統合し、クエリ応答の品質を向上させる設計が必要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: 全体アーキテクチャを設計し、各コンポーネントの責務と関係を明確化する

**実行手順**:

1. 全体アーキテクチャ図を作成する

```
┌────────────────────────────────────────────────────────────────────┐
│                        Application Layer                            │
│                    (GraphRAG Query Service)                         │
└────────────────────────────────────────────────────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ↓                      ↓                      ↓
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────┐
│ IQueryClassifier │   │ICommunitySummarizer│   │  HybridSearchEngine │
│ (クエリ分類)     │   │ (コミュニティ検索)  │   │  (Chunk/Entity検索)  │
└─────────────────┘   └─────────────────┘   └─────────────────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 ↓
                    ┌─────────────────────┐
                    │   Response Builder   │
                    │ (プロンプト構築・LLM) │
                    └─────────────────────┘
```

2. コンポーネント責務を定義する

| コンポーネント       | 責務                                            |
| -------------------- | ----------------------------------------------- |
| GraphRAGQueryService | クエリ処理の統合・オーケストレーション          |
| IQueryClassifier     | クエリタイプの分類（local/global/relationship） |
| ICommunitySummarizer | コミュニティ要約のセマンティック検索            |
| HybridSearchEngine   | チャンク・エンティティの検索                    |
| ResponseBuilder      | プロンプト構築・LLM呼び出し・回答生成           |

3. 依存関係を設計する

```typescript
// GraphRAGQueryService の依存関係
interface GraphRAGQueryServiceDependencies {
  queryClassifier: IQueryClassifier;
  communitySummarizer: ICommunitySummarizer;
  hybridSearchEngine: IHybridSearchEngine;
  responseBuilder: IResponseBuilder;
  embeddingProvider: IEmbeddingProvider;
}
```

**期待される成果物**:

- アーキテクチャ図
- コンポーネント責務定義
- 依存関係設計

---

### タスク2: 処理フロー設計

**目的**: クエリからコミュニティ要約を含む回答生成までの処理フローを設計する

**実行手順**:

1. メイン処理フローを設計する

```
1. Query Reception
   入力: ユーザークエリ、検索オプション
   処理: 入力バリデーション

2. Query Classification
   処理: IQueryClassifier.classify()
   出力: QueryType (local/global/relationship/hybrid)

3. Query Embedding Generation
   処理: IEmbeddingProvider.embed(query)
   出力: Float32Array (クエリ埋め込み)

4. Community Summary Search (新規追加)
   条件: QueryType が global または relationship の場合に重点実行
   処理: ICommunitySummarizer.searchSummaries(query, options)
   出力: CommunitySummary[]

5. Chunk/Entity Search (既存)
   処理: HybridSearchEngine.search(query, options)
   出力: SearchResultItem[]

6. Result Aggregation
   処理: コミュニティ要約と検索結果の統合・スコアリング
   出力: AggregatedSearchResult

7. Prompt Construction
   処理: ResponseBuilder.buildPrompt(aggregatedResult)
   出力: 回答生成プロンプト

8. LLM Response Generation
   処理: LLMProvider.chat(prompt)
   出力: 回答テキスト

9. Response Formatting
   処理: 参照情報の付与、フォーマット
   出力: GraphRAGQueryResponse
```

2. エラーハンドリングフローを設計する

| エラーポイント   | エラー種別            | ハンドリング                         |
| ---------------- | --------------------- | ------------------------------------ |
| Query Embedding  | EMBEDDING_FAILED      | エラー返却、処理中断                 |
| Community Search | SEARCH_FAILED         | 警告ログ、フォールバック（スキップ） |
| LLM Response     | LLM_GENERATION_FAILED | エラー返却、リトライ（オプション）   |

3. フォールバック戦略を設計する

```
コミュニティ要約検索失敗時:
  → 警告ログを出力
  → チャンク・エンティティ検索結果のみで回答生成
  → 正常終了（degraded mode）

全検索失敗時:
  → エラー返却
  → ユーザーへの適切なエラーメッセージ
```

**期待される成果物**:

- 処理フロー図
- エラーハンドリング設計
- フォールバック戦略

---

### タスク3: インターフェース設計

**目的**: 新規・既存インターフェースの詳細を設計する

**実行手順**:

1. GraphRAGQueryService インターフェースを設計する

```typescript
interface IGraphRAGQueryService {
  /**
   * GraphRAGクエリを実行し、コミュニティ要約を含む回答を生成
   */
  query(
    query: string,
    options?: GraphRAGQueryOptions,
  ): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>>;
}

interface GraphRAGQueryOptions {
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

interface GraphRAGQueryResponse {
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

interface CommunitySummaryReference {
  communityId: CommunityId;
  level: number;
  summary: string;
  relevanceScore: number;
}

interface QueryMetadata {
  queryType: QueryType;
  processingTimeMs: number;
  searchStrategy: SearchStrategy;
}
```

2. 既存インターフェースとの統合ポイントを設計する

```typescript
// ICommunitySummarizer.searchSummaries() の呼び出し
const searchResult = await this.communitySummarizer.searchSummaries(query, {
  limit: options.limit ?? 5,
  level: options.communityLevel,
});

// 結果の変換
if (searchResult.success) {
  const summaryRefs = searchResult.data
    .filter((s) => s.confidence >= (options.confidenceThreshold ?? 0.5))
    .map((s) => ({
      communityId: s.communityId,
      level: s.level,
      summary: s.summary,
      relevanceScore: s.confidence,
    }));
}
```

3. プロンプトテンプレートを設計する

```typescript
const COMMUNITY_CONTEXT_PROMPT = `
以下のコミュニティ要約は、質問に関連するトピックの概要です。
回答を生成する際の参考にしてください。

## コミュニティ要約

{{#each communitySummaries}}
### {{level}}階層: {{summary}}
主要エンティティ: {{mainEntities}}
キーワード: {{keywords}}

{{/each}}
`;
```

**期待される成果物**:

- インターフェース定義
- 統合ポイント設計
- プロンプトテンプレート

---

### タスク4: データ構造設計

**目的**: 処理で使用するデータ構造を設計する

**実行手順**:

1. 型定義を設計する

```typescript
// エラー型
type GraphRAGQueryError =
  | { code: "EMBEDDING_FAILED"; message: string }
  | { code: "COMMUNITY_SEARCH_FAILED"; message: string }
  | { code: "HYBRID_SEARCH_FAILED"; message: string }
  | { code: "LLM_GENERATION_FAILED"; message: string }
  | { code: "INVALID_QUERY"; message: string };

// 集約結果型
interface AggregatedSearchResult {
  communitySummaries: CommunitySummary[];
  chunks: SearchResultItem[];
  entities: SearchResultItem[];
  totalTokenCount: number;
}

// コンテキスト構築用
interface PromptContext {
  query: string;
  queryType: QueryType;
  communitySummaries: CommunitySummary[];
  relevantChunks: string[];
  relevantEntities: string[];
}
```

2. バリデーションスキーマを設計する

```typescript
const GraphRAGQueryOptionsSchema = z.object({
  limit: z.number().int().min(1).max(20).optional().default(10),
  communityLevel: z.number().int().min(0).max(5).optional(),
  confidenceThreshold: z.number().min(0).max(1).optional().default(0.5),
  searchWeights: SearchWeightsSchema.optional(),
  enableCommunitySummary: z.boolean().optional().default(true),
});
```

**期待される成果物**:

- 型定義一覧
- バリデーションスキーマ

---

### タスク5: 設計ドキュメントの作成

**目的**: 設計内容を正式なドキュメントとして出力する

**実行手順**:

1. `outputs/phase-2/architecture-design.md` にアーキテクチャ設計書を作成
2. `outputs/phase-2/detailed-design.md` に詳細設計書を作成
3. 図表、シーケンス図を含める

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`
- `outputs/phase-2/detailed-design.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                          | 内容                           |
| -------------------- | --------------------------------------------------------------------------------------------- | ------------------------------ |
| コミュニティ要約仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | searchSummaries() 仕様         |
| RAGアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                       | クエリ分類器・検索パイプライン |
| 検索型定義           | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                  | SearchWeights等の型定義        |

---

## 成果物

| 成果物               | パス                                     | 内容                       |
| -------------------- | ---------------------------------------- | -------------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | 全体構成、コンポーネント図 |
| 詳細設計書           | `outputs/phase-2/detailed-design.md`     | インターフェース、型定義   |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 2での統合テスト連携アクション**:

統合ポイント（searchSummaries API）を設計に反映すること。

具体的には以下を設計に含める:

- ICommunitySummarizer との接続インターフェース
- GraphRAGQueryService → ICommunitySummarizer の呼び出しシーケンス
- エラー時のフォールバック動作

---

## 完了条件

- [ ] アーキテクチャ図が作成されている
- [ ] コンポーネント責務が定義されている
- [ ] 処理フローが設計されている
- [ ] エラーハンドリング設計が完了している
- [ ] IGraphRAGQueryService インターフェースが定義されている
- [ ] プロンプトテンプレートが設計されている
- [ ] 型定義が完了している
- [ ] バリデーションスキーマが設計されている
- [ ] `outputs/phase-2/architecture-design.md` が作成されている
- [ ] `outputs/phase-2/detailed-design.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graphrag-query-integration/phase-3-design-review.md`
