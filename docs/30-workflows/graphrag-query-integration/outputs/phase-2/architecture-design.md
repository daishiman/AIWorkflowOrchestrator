# GraphRAGクエリ統合 アーキテクチャ設計書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| タスクID   | CONV-08-04                 |
| 機能名     | graphrag-query-integration |
| Phase      | 2                          |
| 作成日     | 2026-01-11                 |
| 前提タスク | Phase 1（要件定義）        |

---

## 1. アーキテクチャ概要

### 1.1 全体アーキテクチャ図

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Application Layer                              │
│                      (GraphRAGQueryService)                             │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    query(query, options)                          │   │
│  │                            │                                      │   │
│  │  ┌────────────────────────┼────────────────────────┐             │   │
│  │  ▼                        ▼                        ▼             │   │
│  │ [Validation]        [Classification]        [Search Strategy]    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│ IQueryClassifier │     │ ICommunitySummarizer │     │ IEmbeddingProvider│
│ (クエリ分類)     │     │ (コミュニティ検索)   │     │ (埋め込み生成)    │
│                  │     │                      │     │                   │
│ classify()       │     │ searchSummaries()    │     │ embed()           │
│ getSearchWeights │     │                      │     │                   │
└─────────────────┘     └─────────────────────┘     └──────────────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    ▼
                       ┌────────────────────────┐
                       │    PromptBuilder        │
                       │ (プロンプト構築)        │
                       │                         │
                       │ buildPrompt()           │
                       └────────────────────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │    ILLMProvider         │
                       │ (回答生成)              │
                       │                         │
                       │ generate()              │
                       └────────────────────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │ GraphRAGQueryResponse   │
                       └────────────────────────┘
```

### 1.2 コンポーネント一覧

| コンポーネント         | 種別         | 責務                                            |
| ---------------------- | ------------ | ----------------------------------------------- |
| GraphRAGQueryService   | 新規サービス | クエリ処理の統合・オーケストレーション          |
| IQueryClassifier       | 既存I/F      | クエリタイプの分類（local/global/relationship） |
| ICommunitySummarizer   | 既存I/F      | コミュニティ要約のセマンティック検索            |
| IEmbeddingProvider     | 既存I/F      | クエリ埋め込みの生成                            |
| ILLMProvider           | 既存I/F      | 回答テキストの生成                              |
| PromptBuilder          | 新規内部     | コンテキストからプロンプトを構築                |
| GraphRAGQueryValidator | 新規内部     | 入力バリデーション                              |

---

## 2. コンポーネント責務定義

### 2.1 GraphRAGQueryService（新規）

**責務**: クエリ処理全体のオーケストレーション

```
入力: ユーザークエリ + オプション
出力: GraphRAGQueryResponse (回答 + 参照情報)
```

**主要操作**:

1. 入力バリデーション
2. クエリ分類の実行
3. コミュニティ要約検索の実行
4. プロンプト構築
5. LLM回答生成
6. レスポンス整形

### 2.2 IQueryClassifier（既存）

**責務**: クエリタイプの判定と検索重みの提供

```typescript
interface IQueryClassifier {
  classify(
    query: string,
    options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>>;
  getSearchWeights(type: QueryType): SearchWeights;
}
```

**活用方法**: クエリタイプに応じてコミュニティ要約検索の重要度を調整

### 2.3 ICommunitySummarizer（既存）

**責務**: コミュニティ要約のセマンティック検索

```typescript
interface ICommunitySummarizer {
  searchSummaries(
    query: string,
    options?: CommunitySummarySearchOptions,
  ): Promise<Result<CommunitySummary[], Error>>;
}
```

**活用方法**: クエリに関連するコミュニティ要約を取得

### 2.4 PromptBuilder（新規内部コンポーネント）

**責務**: 検索結果からLLMプロンプトを構築

```
入力: クエリ + コミュニティ要約 + クエリタイプ
出力: LLMプロンプト文字列
```

---

## 3. 依存関係設計

### 3.1 依存性注入構造

```typescript
interface GraphRAGQueryServiceDependencies {
  /** クエリ分類器 */
  queryClassifier: IQueryClassifier;
  /** コミュニティ要約サービス */
  communitySummarizer: ICommunitySummarizer;
  /** 埋め込みプロバイダー（クエリ埋め込み用） */
  embeddingProvider: IEmbeddingProvider;
  /** LLMプロバイダー（回答生成用） */
  llmProvider: ILLMProvider;
}
```

### 3.2 依存関係図

```
GraphRAGQueryService
         │
         ├─▶ IQueryClassifier (外部依存)
         │       └── RuleBasedQueryClassifier / LLMQueryClassifier
         │
         ├─▶ ICommunitySummarizer (外部依存)
         │       └── CommunitySummarizer
         │
         ├─▶ IEmbeddingProvider (外部依存)
         │       └── OpenAIEmbeddingProvider / VoyageEmbeddingProvider
         │
         └─▶ ILLMProvider (外部依存)
                 └── AnthropicProvider / OpenAIProvider
```

### 3.3 依存性逆転の原則

- 全ての外部依存はインターフェース経由で注入
- テスト時はモックに差し替え可能
- 具象クラスへの直接依存なし

---

## 4. データフロー

### 4.1 正常系フロー

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Query Reception                                                   │
│    入力: query: string, options?: GraphRAGQueryOptions               │
│    処理: Zodスキーマによるバリデーション                              │
│    出力: 検証済みの入力                                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Query Classification                                              │
│    処理: IQueryClassifier.classify(query)                            │
│    出力: QueryClassification { type, confidence, ... }               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Community Summary Search                                          │
│    条件: options.enableCommunitySummary !== false                    │
│    処理: ICommunitySummarizer.searchSummaries(query, searchOptions)  │
│    出力: CommunitySummary[]                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Confidence Filtering                                              │
│    処理: confidence >= threshold のみ抽出                            │
│    出力: FilteredCommunitySummary[]                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Prompt Construction                                               │
│    処理: PromptBuilder.build(query, filteredSummaries, queryType)    │
│    出力: プロンプト文字列                                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. LLM Response Generation                                           │
│    処理: ILLMProvider.generate(prompt)                               │
│    出力: LLMGenerateResult { text, tokensUsed }                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. Response Formatting                                               │
│    処理: 回答と参照情報の整形                                         │
│    出力: GraphRAGQueryResponse                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 シーケンス図

```
User          GraphRAGQueryService    IQueryClassifier    ICommunitySummarizer    ILLMProvider
  │                   │                      │                      │                   │
  │ query(q, opts)    │                      │                      │                   │
  │──────────────────▶│                      │                      │                   │
  │                   │                      │                      │                   │
  │                   │ validate(q, opts)    │                      │                   │
  │                   │─────────┐            │                      │                   │
  │                   │◀────────┘            │                      │                   │
  │                   │                      │                      │                   │
  │                   │ classify(q)          │                      │                   │
  │                   │─────────────────────▶│                      │                   │
  │                   │◀─────────────────────│                      │                   │
  │                   │ QueryClassification  │                      │                   │
  │                   │                      │                      │                   │
  │                   │ searchSummaries(q)   │                      │                   │
  │                   │─────────────────────────────────────────────▶│                  │
  │                   │◀─────────────────────────────────────────────│                  │
  │                   │ CommunitySummary[]   │                      │                   │
  │                   │                      │                      │                   │
  │                   │ buildPrompt(...)     │                      │                   │
  │                   │─────────┐            │                      │                   │
  │                   │◀────────┘            │                      │                   │
  │                   │                      │                      │                   │
  │                   │ generate(prompt)     │                      │                   │
  │                   │──────────────────────────────────────────────────────────────────▶│
  │                   │◀──────────────────────────────────────────────────────────────────│
  │                   │ LLMGenerateResult    │                      │                   │
  │                   │                      │                      │                   │
  │◀──────────────────│                      │                      │                   │
  │ GraphRAGQueryResponse                    │                      │                   │
```

---

## 5. エラーハンドリング設計

### 5.1 エラー種別と対応

| エラーポイント       | エラーコード            | 対応                                 |
| -------------------- | ----------------------- | ------------------------------------ |
| 入力バリデーション   | INVALID_QUERY           | エラー返却、即座に終了               |
| クエリ分類失敗       | CLASSIFICATION_FAILED   | 警告ログ、hybrid タイプで続行        |
| コミュニティ検索失敗 | COMMUNITY_SEARCH_FAILED | 警告ログ、空配列でフォールバック続行 |
| LLM生成失敗          | LLM_GENERATION_FAILED   | エラー返却                           |

### 5.2 フォールバック戦略

```typescript
// コミュニティ要約検索失敗時のフォールバック
if (!summaryResult.success) {
  console.warn("Community summary search failed, continuing without summaries");
  // 空配列として処理続行（degraded mode）
  communitySummaries = [];
}

// クエリ分類失敗時のフォールバック
if (!classificationResult.success) {
  console.warn("Query classification failed, using hybrid type");
  queryType = "hybrid";
}
```

### 5.3 結果型

```typescript
type GraphRAGQueryError =
  | { code: "INVALID_QUERY"; message: string }
  | { code: "CLASSIFICATION_FAILED"; message: string }
  | { code: "COMMUNITY_SEARCH_FAILED"; message: string }
  | { code: "LLM_GENERATION_FAILED"; message: string };

// 全操作はResult型で返却
type QueryResult = Result<GraphRAGQueryResponse, GraphRAGQueryError>;
```

---

## 6. 非機能要件への対応

### 6.1 パフォーマンス

| 項目               | 対応策                                           |
| ------------------ | ------------------------------------------------ |
| 検索レイテンシ     | limit パラメータで結果数を制限（デフォルト10件） |
| コンテキスト長制限 | 要約テキストのトークン数を監視、超過時は打ち切り |
| 並行リクエスト     | 依存関係のない処理は並列実行を検討（将来拡張）   |

### 6.2 テスタビリティ

| 項目         | 対応策                                           |
| ------------ | ------------------------------------------------ |
| DI対応       | 全外部依存をコンストラクタ注入                   |
| モック可能性 | インターフェース経由の依存で容易にモック化       |
| 副作用分離   | 純粋関数（バリデーション、フィルタリング）を分離 |

### 6.3 セキュリティ

| 項目           | 対応策                              |
| -------------- | ----------------------------------- |
| 入力検証       | Zodスキーマで全入力をバリデーション |
| プロンプト構築 | ユーザー入力を適切にエスケープ      |

---

## 7. ファイル構成

```
packages/shared/src/services/search/
├── graphrag-query-service.ts              # サービス実装
├── types/
│   └── graphrag-query.ts                  # 型定義
├── schemas/
│   └── graphrag-query.ts                  # Zodスキーマ
├── interfaces/
│   └── graphrag-query-service.ts          # インターフェース定義
├── prompts/
│   └── graphrag-query-prompt.ts           # プロンプトテンプレート
└── __tests__/
    ├── graphrag-query-service.test.ts     # ユニットテスト
    └── graphrag-query-service.integration.test.ts  # 統合テスト
```

---

## 8. 完了条件チェック

- [x] アーキテクチャ図が作成されている
- [x] コンポーネント責務が定義されている
- [x] 依存関係設計が完了している
- [x] データフローが設計されている
- [x] エラーハンドリング設計が完了している
- [x] 非機能要件への対応が設計されている

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-11 | 1.0.0      | 初版作成 |
