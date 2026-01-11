# GraphRAGクエリ統合 実装ガイド

## メタ情報

| 項目   | 内容                       |
| ------ | -------------------------- |
| Phase  | 12                         |
| 機能名 | graphrag-query-integration |
| 作成日 | 2026-01-11                 |

---

## Part 1: 概念的な説明

### 例え話で理解する

GraphRAGクエリ統合とは、「図書館の司書が本を探すときに、本棚ごとの要約メモを活用する」ようなものです。

**従来の方法**:

- 司書（システム）が本（情報）を1冊ずつ確認して探す
- 時間がかかり、全体像が見えにくい

**新しい方法（コミュニティ要約統合）**:

- 各本棚（コミュニティ）に「この棚にはこんな本がある」という要約メモがある
- 司書はまず要約メモを見て、関連しそうな本棚を素早く特定
- 関連する本棚の情報を使って、より的確な回答を生成

### なぜこの機能が必要か

1. **回答品質の向上**: 関連する情報をグループ化して把握することで、より包括的な回答が可能
2. **処理効率の改善**: 要約を活用することで、不要な検索を減らせる
3. **階層的な情報活用**: 概要から詳細まで、適切な粒度の情報を選択できる

### 全体の流れ（図解）

```
ユーザークエリ
↓
[1] クエリを分析
↓
[2] 関連するコミュニティ要約を検索
↓
[3] 要約をコンテキストとしてLLMに渡す
↓
[4] より質の高い回答を生成
↓
ユーザーへ回答を返す
```

### 具体例で理解する

**シナリオ**: ユーザーが「このプロジェクトの認証機能について教えてください」と質問

1. **クエリ分析**: システムが「認証」「機能」というキーワードを認識
2. **コミュニティ要約検索**: 「認証」に関連するコミュニティ要約を取得
   - 「認証モジュールは JWT を使用し、OAuth2.0 をサポート...」
3. **プロンプト構築**: 要約をコンテキストとしてLLMに提供
4. **回答生成**: 要約情報を基に、包括的で正確な回答を生成

---

## Part 2: 技術的な詳細

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GraphRAGQueryService                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────┐        ┌──────────────────────────────────────┐   │
│  │      query()         │───────→│    ICommunitySummarizer              │   │
│  │  (メインエントリ)     │        │    .searchSummaries()                │   │
│  └──────────────────────┘        └──────────────────────────────────────┘   │
│           │                                      │                          │
│           │ 並列実行                              ↓                          │
│           │        ┌──────────────────────────────────────────────────┐     │
│           │        │        CommunitySummaryReference[]               │     │
│           │        │    (コミュニティ要約参照のリスト)                  │     │
│           │        └──────────────────────────────────────────────────┘     │
│           │                                      │                          │
│           ↓                                      ↓                          │
│  ┌──────────────────────┐        ┌──────────────────────────────────────┐   │
│  │  IQueryClassifier    │        │        buildPrompt()                 │   │
│  │     .classify()      │───────→│  (クエリと要約からプロンプト構築)      │   │
│  └──────────────────────┘        └──────────────────────────────────────┘   │
│                                                  │                          │
│                                                  ↓                          │
│                                  ┌──────────────────────────────────────┐   │
│                                  │        ILLMProvider                  │   │
│                                  │         .generate()                  │   │
│                                  │      (回答テキスト生成)               │   │
│                                  └──────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### データフロー

1. **入力**: ユーザークエリ + GraphRAGQueryOptions
2. **バリデーション**: Zodスキーマでオプションを検証（limit: 1-20, confidenceThreshold: 0-1）
3. **並列処理**: Promise.all で以下を同時実行
   - クエリ分類（IQueryClassifier.classify）
   - コミュニティ要約検索（ICommunitySummarizer.searchSummaries）
4. **フィルタリング**: confidence閾値でコミュニティ要約をフィルタリング
5. **プロンプト構築**: 要約をコンテキストとして組み込み
6. **回答生成**: ILLMProvider.generate()で回答生成
7. **出力**: Result<GraphRAGQueryResponse, GraphRAGQueryError>

### 主要インターフェース

```typescript
interface IGraphRAGQueryService {
  query(
    query: string,
    options?: GraphRAGQueryOptions,
  ): Promise<Result<GraphRAGQueryResponse, GraphRAGQueryError>>;
}

interface GraphRAGQueryOptions {
  limit?: number; // 最大検索結果数 (1-20, デフォルト: 10)
  communityLevel?: number; // コミュニティ階層レベル (0-5)
  confidenceThreshold?: number; // confidence閾値 (0-1, デフォルト: 0.5)
  searchWeights?: SearchWeights; // 検索戦略の重み
  enableCommunitySummary?: boolean; // コミュニティ要約検索を有効化 (デフォルト: true)
}

interface GraphRAGQueryResponse {
  answer: string; // 生成された回答テキスト
  communitySummaries: CommunitySummaryReference[]; // 参照したコミュニティ要約
  chunks: ChunkReference[]; // 参照したチャンク（将来拡張用）
  entities: EntityReference[]; // 参照したエンティティ（将来拡張用）
  metadata: QueryMetadata; // 処理メタデータ
}
```

### エラーハンドリング設計

| エラー種別              | 対処方法                       | 理由                           |
| ----------------------- | ------------------------------ | ------------------------------ |
| INVALID_QUERY           | エラー返却                     | 不正な入力は早期に拒否         |
| CLASSIFICATION_FAILED   | ハイブリッド型にフォールバック | クエリ処理を継続可能にするため |
| COMMUNITY_SEARCH_FAILED | フォールバック（空配列）       | クエリ処理を継続可能にするため |
| LLM_GENERATION_FAILED   | エラー返却                     | 回答生成は必須のため           |

### セキュリティ対策

| 対策項目             | 実装内容                                   |
| -------------------- | ------------------------------------------ |
| 入力バリデーション   | Zodスキーマによる厳密な型・範囲検証        |
| クエリ長制限         | MAX_QUERY_LENGTH (10000文字) による制限    |
| プロンプトエスケープ | `{{ }}` のエスケープでインジェクション防止 |
| 機密情報保護         | DIパターンによりAPIキーをコード外で管理    |

### 依存関係注入パターン

```typescript
// サービス初期化例
const service = new GraphRAGQueryService({
  queryClassifier: mockQueryClassifier, // IQueryClassifier
  communitySummarizer: mockCommunitySummarizer, // ICommunitySummarizer
  embeddingProvider: mockEmbeddingProvider, // IEmbeddingProvider
  llmProvider: mockLLMProvider, // ILLMProvider
});
```

このDIパターンにより：

- テスト時はモックを注入可能
- 本番環境では実際のプロバイダーを注入
- 依存関係の変更が容易

### 用語集

| 用語                 | 読み方             | 意味                                                          |
| -------------------- | ------------------ | ------------------------------------------------------------- |
| GraphRAG             | グラフラグ         | Graph Retrieval-Augmented Generation。グラフ構造を活用したRAG |
| Community            | コミュニティ       | 意味的に関連するエンティティのクラスタ                        |
| CommunitySummary     | コミュニティ要約   | コミュニティの内容を要約したテキスト                          |
| confidence           | コンフィデンス     | 検索結果の確信度（0-1）                                       |
| Result<T, E>         | リザルト           | 成功/失敗を表す型パターン（neverthrow風）                     |
| CommunityId          | コミュニティID     | Branded Typeによる型安全なコミュニティ識別子                  |
| ICommunitySummarizer | コミュニティ要約器 | コミュニティ要約の検索・生成を担当するインターフェース        |
| IQueryClassifier     | クエリ分類器       | クエリのタイプを判定するインターフェース                      |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-11 | 1.0.0      | 初版作成 |
