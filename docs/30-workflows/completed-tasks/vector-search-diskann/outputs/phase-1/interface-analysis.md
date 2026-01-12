# Phase 1: インターフェース分析

## 目的

VectorSearchStrategy実装に必要な既存インターフェース定義を確認し、整合性を確保する。

---

## 1. ISearchStrategy インターフェース

### 現状確認

`packages/shared/src/services/search/` ディレクトリを調査した結果、汎用的な `ISearchStrategy` インターフェースは**まだ定義されていない**。

現在存在するのは：

- `IKeywordSearchStrategy`: キーワード検索専用インターフェース
- `IQueryClassifier`: クエリ分類器インターフェース
- `IGraphRAGQueryService`: GraphRAGクエリサービスインターフェース

### 設計方針

Phase 2で汎用的な `ISearchStrategy` インターフェースを新規定義する。
既存の `IKeywordSearchStrategy` を参考に、統一されたインターフェースを設計する。

---

## 2. SearchResult / SearchResultItem 型定義

**ファイル**: `packages/shared/src/types/rag/search/types.ts`

### SearchResult（統合検索結果）

| プロパティ     | 型                    | 説明                 |
| -------------- | --------------------- | -------------------- |
| query          | SearchQuery           | 実行されたクエリ     |
| results        | SearchResultItem[]    | 検索結果アイテム配列 |
| totalCount     | number                | 総結果数             |
| processingTime | number                | 処理時間（ミリ秒）   |
| strategies     | SearchStrategyMetrics | 各戦略のメトリクス   |

### SearchResultItem（個別検索結果）

| プロパティ | 型                  | 説明                             |
| ---------- | ------------------- | -------------------------------- |
| id         | string              | 結果アイテムID                   |
| type       | SearchResultType    | タイプ（chunk/entity/community） |
| score      | number              | 総合スコア（0.0-1.0）            |
| relevance  | RelevanceScore      | 詳細スコア                       |
| content    | SearchResultContent | コンテンツ                       |
| highlights | Highlight[]         | ハイライト情報                   |
| sources    | SearchResultSources | ソース情報                       |

### RelevanceScore（関連度スコア詳細）

| プロパティ | 型                | 説明                  |
| ---------- | ----------------- | --------------------- |
| combined   | number            | 統合スコア（0.0-1.0） |
| keyword    | number            | Keyword検索スコア     |
| semantic   | number            | Semantic検索スコア    |
| graph      | number            | Graph検索スコア       |
| rerank     | number \| null    | Rerankスコア          |
| crag       | CRAGScore \| null | CRAG評価スコア        |

---

## 3. SearchFilters（検索フィルター）

**ファイル**: `packages/shared/src/types/rag/search/types.ts`

| プロパティ   | 型                            | 説明                         |
| ------------ | ----------------------------- | ---------------------------- |
| fileIds      | ReadonlyArray<FileId> \| null | ファイルIDフィルター         |
| entityTypes  | ReadonlyArray<string> \| null | エンティティタイプフィルター |
| dateRange    | DateRange \| null             | 日付範囲フィルター           |
| minRelevance | number                        | 最小関連度（0.0-1.0）        |

### DateRange

| プロパティ | 型           | 説明     |
| ---------- | ------------ | -------- |
| start      | Date \| null | 開始日時 |
| end        | Date \| null | 終了日時 |

---

## 4. SearchOptions（検索オプション）

| プロパティ        | 型               | 説明                  |
| ----------------- | ---------------- | --------------------- |
| limit             | number           | 最大取得件数（1-100） |
| offset            | number           | オフセット            |
| includeMetadata   | boolean          | メタデータを含む      |
| includeHighlights | boolean          | ハイライトを含む      |
| rerankEnabled     | boolean          | リランキング有効化    |
| cragEnabled       | boolean          | CRAG評価有効化        |
| strategies        | SearchStrategy[] | 使用する検索戦略      |
| weights           | SearchWeights    | 各戦略の重み          |

---

## 5. SearchWeights（検索重み）

| プロパティ | 型     | 説明                    |
| ---------- | ------ | ----------------------- |
| keyword    | number | Keyword検索重み（0-1）  |
| semantic   | number | Semantic検索重み（0-1） |
| graph      | number | Graph検索重み（0-1）    |

**制約**: 3つの重みの合計は1.0（浮動小数点誤差0.02許容）

---

## 6. 型ガード関数

| 関数              | 説明                      |
| ----------------- | ------------------------- |
| isChunkResult     | Chunk結果かどうか判定     |
| isEntityResult    | Entity結果かどうか判定    |
| isCommunityResult | Community結果かどうか判定 |

---

## 7. VectorSearchStrategyで使用する型の特定

VectorSearchStrategyが返すべき型：

```typescript
// 主な出力型
interface VectorSearchOutput {
  type: "chunk"; // Semantic検索はchunk単位
  score: number; // コサイン類似度（0.0-1.0）
  relevance: {
    combined: number;
    semantic: number; // = score
    keyword: 0; // 使用しない
    graph: 0; // 使用しない
    rerank: null;
    crag: null;
  };
  sources: {
    chunkId: ChunkId;
    fileId: FileId;
    entityIds: [];
    communityId: null;
    relationIds: [];
  };
}
```

---

## まとめ

| 項目               | 状態       | 備考                  |
| ------------------ | ---------- | --------------------- |
| ISearchStrategy    | **未定義** | Phase 2で新規設計必要 |
| SearchResult       | 定義済み   | types.ts              |
| SearchResultItem   | 定義済み   | types.ts              |
| SearchFilters      | 定義済み   | types.ts              |
| SearchOptions      | 定義済み   | types.ts              |
| VectorSearchResult | 定義済み   | vector-search.ts      |

---

## 次のステップ

Phase 2で以下を設計：

1. 汎用 `ISearchStrategy` インターフェースの定義
2. `VectorSearchStrategy` クラスの詳細設計
3. 既存型との整合性確保
