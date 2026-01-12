# GraphSearchStrategy 要件定義書

> Phase 1 成果物
> 作成日: 2026-01-13
> 機能名: graph-search-strategy

---

## 概要

GraphSearchStrategyは、HybridRAGのTriple Search（Keyword/Semantic/Graph）における3つ目の検索戦略として、Knowledge Graphを活用した検索機能を提供する。エンティティ、関係、コミュニティ構造を活用し、テキストマッチングやベクトル類似度では発見できない意味的な関連性を検索する。

---

## 機能要件（FR）

### FR-001: ISearchStrategyインターフェース準拠

GraphSearchStrategyはISearchStrategyインターフェースを実装する。

| プロパティ/メソッド | 型                                           | 説明               |
| ------------------- | -------------------------------------------- | ------------------ |
| name                | `"graph"`                                    | 戦略名（readonly） |
| search()            | `Promise<Result<SearchResultItem[], Error>>` | 検索実行           |
| getMetrics()        | `StrategyMetric`                             | 検索メトリクス取得 |

**実装場所**: `packages/shared/src/services/search/strategies/graph-search-strategy.ts`

---

### FR-002: ローカル検索（localSearch）

エンティティベースの検索機能。クエリに関連するエンティティを見つけ、関連コンテンツを取得する。

**処理フロー**:

1. クエリからエンティティ埋め込みを生成（IEmbeddingProvider.embed）
2. 類似エンティティを検索（IKnowledgeGraphStore.findSimilarEntities）
3. エンティティに関連するチャンクを取得
4. スコアリングして結果を返却

**入力**:

- query: string（検索クエリ）
- limit: number（取得件数）
- filters?: SearchFilters（フィルター）

**出力**:

- SearchResultItem[]（チャンク結果）

---

### FR-003: グローバル検索（globalSearch）

コミュニティサマリベースの検索機能。高レベルの概念的な質問に対応する。

**処理フロー**:

1. クエリ埋め込みを生成（IEmbeddingProvider.embed）
2. 類似コミュニティサマリを検索（ICommunitySummarizer.searchSummaries）
3. コミュニティ情報を結果として返却

**入力**:

- query: string（検索クエリ）
- limit: number（取得件数）
- filters?: SearchFilters（フィルター）

**出力**:

- SearchResultItem[]（コミュニティ結果）

---

### FR-004: 関係検索（relationshipSearch）

エンティティ間の関係を辿る検索機能。「AとBの関係は？」のような質問に対応する。

**処理フロー**:

1. クエリからエンティティを抽出（埋め込み類似検索）
2. エンティティ間の最短経路を検索（IKnowledgeGraphStore.findShortestPath）
3. パス上のエッジに関連するチャンクを取得
4. グラフトラバーサルで関連コンテンツも取得（IKnowledgeGraphStore.traverse）

**入力**:

- query: string（検索クエリ）
- limit: number（取得件数）
- filters?: SearchFilters（フィルター）
- options.traversalDepth?: number（トラバーサル深度、デフォルト: 2）

**出力**:

- SearchResultItem[]（関係ベースの結果）

---

### FR-005: クエリタイプ対応

QueryType（local/global/relationship）に応じた検索戦略の自動選択。

| クエリタイプ   | 検索メソッド         | 用途                     |
| -------------- | -------------------- | ------------------------ |
| local          | localSearch()        | 具体的な情報検索         |
| global         | globalSearch()       | 全体概要の把握           |
| relationship   | relationshipSearch() | エンティティ間の関係検索 |
| （デフォルト） | localSearch()        | タイプ未指定時           |

**search()メソッドのオプション拡張**:

```typescript
interface GraphSearchOptions {
  queryType?: "local" | "global" | "relationship";
  traversalDepth?: number; // relationship検索時の深度
  entityThreshold?: number; // エンティティ類似度閾値
}
```

---

### FR-006: スコアリング

検索結果に0-1の範囲で関連度スコアを付与する。

| 検索タイプ   | スコア計算                                      |
| ------------ | ----------------------------------------------- |
| local        | エンティティ類似度 × 0.6 + チャンク関連度 × 0.4 |
| global       | コミュニティサマリ類似度                        |
| relationship | パス距離スコア × 0.5 + チャンク関連度 × 0.5     |

**スコア正規化**:

- 全スコアは0.0〜1.0の範囲
- パス距離スコア = 1 / (1 + pathLength)
- 埋め込み類似度はコサイン類似度（0〜1）

---

### FR-007: フィルタ対応

SearchFiltersによる検索結果のフィルタリング。

| フィルタ     | 対応状況    | 説明                     |
| ------------ | ----------- | ------------------------ |
| fileIds      | ✅ 対応     | 特定ファイルに限定       |
| entityTypes  | ✅ 対応     | エンティティタイプで制限 |
| minRelevance | ✅ 対応     | 最低スコア閾値           |
| dateRange    | ❌ 将来対応 | 日付範囲フィルタ         |

---

### FR-008: エラーハンドリング

Result型パターンによる明示的なエラー処理。

| エラー種別                | 対処                        |
| ------------------------- | --------------------------- |
| EmbeddingProviderError    | err()でラップして返却       |
| GraphStoreError           | err()でラップして返却       |
| CommunitySummarizerError  | err()でラップして返却       |
| ValidationError           | err()でラップして返却       |
| エンティティ不足（0件）   | 空配列をok()で返却          |
| CommunitySummarizer未設定 | localSearchにフォールバック |

---

## 非機能要件（NFR）

### NFR-001: パフォーマンス

| 指標                       | 基準      |
| -------------------------- | --------- |
| localSearch応答時間        | < 200ms   |
| globalSearch応答時間       | < 300ms   |
| relationshipSearch応答時間 | < 500ms   |
| 同時リクエスト             | 10req/sec |

---

### NFR-002: 型安全性

- Branded Types使用（EntityId, RelationId, ChunkId, CommunityId等）
- Result<T, Error>パターン遵守
- strict TypeScript設定（noImplicitAny, strictNullChecks等）

---

### NFR-003: テスト品質

| 指標              | 最低基準 |
| ----------------- | -------- |
| Line Coverage     | 80%      |
| Branch Coverage   | 60%      |
| Function Coverage | 80%      |

---

### NFR-004: コード品質

- ESLint警告なし
- TypeScript型エラーなし
- JSDocコメント記述（publicメソッド）
- SOLID原則適用

---

## 接続要件

### GraphStore接続

IKnowledgeGraphStore経由でエンティティ・関係を取得。

| メソッド               | 用途                             |
| ---------------------- | -------------------------------- |
| findSimilarEntities()  | 埋め込みベースのエンティティ検索 |
| traverse()             | グラフトラバーサル               |
| findShortestPath()     | 最短経路探索                     |
| getRelationsByEntity() | エンティティの関係取得           |

---

### EmbeddingProvider接続

IEmbeddingProvider経由でクエリ埋め込みを生成。

| メソッド | 用途                       |
| -------- | -------------------------- |
| embed()  | 単一テキストの埋め込み生成 |

---

### CommunitySummarizer接続

ICommunitySummarizer経由でコミュニティサマリを検索。

| メソッド          | 用途               |
| ----------------- | ------------------ |
| searchSummaries() | セマンティック検索 |

---

## データフロー

```
Query
  │
  ▼
┌────────────────────┐
│ GraphSearchStrategy │
│   ├─ localSearch()  │
│   ├─ globalSearch() │
│   └─ relationshipSearch()
└────────────────────┘
  │
  ├──────────────┬──────────────┐
  ▼              ▼              ▼
IEmbedding    IKnowledge    ICommunity
Provider      GraphStore    Summarizer
  │              │              │
  ▼              ▼              ▼
Query         Entity/        Community
Embedding     Relation       Summaries
  │              │              │
  └──────────────┴──────────────┘
                 │
                 ▼
          SearchResultItem[]
```

---

## 依存関係

### 必須依存

| 依存先               | 型        | 用途         |
| -------------------- | --------- | ------------ |
| IKnowledgeGraphStore | interface | グラフ操作   |
| IEmbeddingProvider   | interface | 埋め込み生成 |

### オプション依存

| 依存先               | 型        | 用途           |
| -------------------- | --------- | -------------- |
| ICommunitySummarizer | interface | グローバル検索 |

---

## 変更履歴

| 日付       | 変更内容                |
| ---------- | ----------------------- |
| 2026-01-13 | 初版作成（Phase 1完了） |
