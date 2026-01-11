# アーキテクチャ設計書 - キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | CONV-07-02 |
| Phase    | 2          |
| 作成日   | 2026-01-11 |

---

## アーキテクチャ概要

### レイヤー構成

```
┌─────────────────────────────────────────────────────────────┐
│                    HybridRAG Search                         │
│              (将来: CONV-07-07で統合予定)                   │
└────────────────────────────┬────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ KeywordSearch   │ │ SemanticSearch  │ │ GraphSearch     │
│ Strategy        │ │ Strategy        │ │ Strategy        │
│ (本タスク)      │ │ (CONV-07-03)    │ │ (CONV-07-04)    │
└────────┬────────┘ └─────────────────┘ └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Database Layer (chunks-search.ts)              │
│  - searchChunksByKeyword()                                  │
│  - searchChunksByPhrase()                                   │
│  - searchChunksByNear()                                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  SQLite FTS5 + BM25                         │
│                    chunks_fts Table                         │
└─────────────────────────────────────────────────────────────┘
```

---

## クラス設計

### KeywordSearchStrategy クラス

```typescript
// packages/shared/src/services/search/keyword-search-strategy.ts

import { Result, ok, err } from "neverthrow";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type {
  SearchQuery,
  SearchResultItem,
  SearchStrategyMetrics,
  StrategyMetric,
  Highlight,
  RelevanceScore,
  SearchResultContent,
  SearchResultSources,
} from "../../types/rag/search/types";
import {
  searchChunksByKeyword,
  searchChunksByPhrase,
  searchChunksByNear,
  type FtsSearchResult,
  type SearchResponse,
} from "../../db/queries/chunks-search";

/**
 * キーワード検索タイプ
 */
export type KeywordSearchType = "keyword" | "phrase" | "near";

/**
 * キーワード検索オプション
 */
export interface KeywordSearchOptions {
  /** 検索タイプ */
  searchType: KeywordSearchType;
  /** NEAR検索時の単語間距離 */
  nearDistance?: number;
  /** BM25スケールファクター */
  scaleFactor?: number;
}

/**
 * キーワード検索エラー
 */
export class KeywordSearchError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_QUERY" | "DB_ERROR" | "TIMEOUT",
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "KeywordSearchError";
  }
}

/**
 * FTS5/BM25によるキーワード検索戦略
 */
export class KeywordSearchStrategy {
  readonly strategyType = "keyword" as const;

  private metrics: StrategyMetric = {
    enabled: true,
    resultCount: 0,
    processingTime: 0,
    topScore: 0,
  };

  private totalSearches = 0;
  private totalProcessingTime = 0;

  constructor(private readonly db: LibSQLDatabase<Record<string, never>>) {}

  /**
   * キーワード検索を実行
   */
  async search(
    query: SearchQuery,
    options?: KeywordSearchOptions,
  ): Promise<Result<SearchResultItem[], KeywordSearchError>> {
    // 実装詳細は Phase 5 で記述
  }

  /**
   * 検索メトリクスを取得
   */
  getMetrics(): SearchStrategyMetrics {
    return {
      keyword: this.metrics,
      semantic: {
        enabled: false,
        resultCount: 0,
        processingTime: 0,
        topScore: 0,
      },
      graph: { enabled: false, resultCount: 0, processingTime: 0, topScore: 0 },
    };
  }

  // === Private Methods ===

  /**
   * 検索タイプを決定
   */
  private determineSearchType(
    query: SearchQuery,
    options?: KeywordSearchOptions,
  ): KeywordSearchType {
    // オプションで明示されていればそれを使用
    if (options?.searchType) {
      return options.searchType;
    }
    // デフォルトはキーワード検索
    return "keyword";
  }

  /**
   * キーワード検索（OR検索）を実行
   */
  private async executeKeywordSearch(
    queryText: string,
    limit: number,
    fileId?: string,
    scaleFactor?: number,
  ): Promise<SearchResponse> {
    // searchChunksByKeyword() を呼び出し
  }

  /**
   * フレーズ検索を実行
   */
  private async executePhraseSearch(
    queryText: string,
    limit: number,
    fileId?: string,
    scaleFactor?: number,
  ): Promise<SearchResponse> {
    // searchChunksByPhrase() を呼び出し
  }

  /**
   * NEAR検索を実行
   */
  private async executeNearSearch(
    queryText: string,
    limit: number,
    nearDistance: number,
    fileId?: string,
    scaleFactor?: number,
  ): Promise<SearchResponse> {
    // searchChunksByNear() を呼び出し
  }

  /**
   * FtsSearchResult を SearchResultItem に変換
   */
  private toSearchResultItem(
    ftsResult: FtsSearchResult,
    index: number,
  ): SearchResultItem {
    // 変換ロジック
  }

  /**
   * ハイライト情報を抽出
   */
  private extractHighlights(
    content: string,
    highlightedContent: string,
  ): Highlight[] {
    // <mark> タグ位置からオフセットを計算
  }

  /**
   * メトリクスを更新
   */
  private updateMetrics(
    resultCount: number,
    processingTime: number,
    topScore: number,
  ): void {
    this.totalSearches++;
    this.totalProcessingTime += processingTime;
    this.metrics = {
      enabled: true,
      resultCount,
      processingTime,
      topScore,
    };
  }
}
```

---

## データフロー

### 検索実行フロー

```
1. HybridRAGSearch / 直接呼び出し
   │
   ▼
2. KeywordSearchStrategy.search(query, options)
   │
   ├─ 入力検証（空クエリチェック）
   │
   ├─ 検索タイプ決定
   │    - keyword: OR検索
   │    - phrase: 完全一致
   │    - near: 近接検索
   │
   ├─ DB層関数呼び出し
   │    ├─ searchChunksByKeyword()
   │    ├─ searchChunksByPhrase()
   │    └─ searchChunksByNear()
   │
   ├─ 結果変換
   │    └─ FtsSearchResult → SearchResultItem
   │
   ├─ メトリクス更新
   │
   └─ Result<SearchResultItem[], KeywordSearchError> を返却
```

### 結果変換マッピング

```
FtsSearchResult                    SearchResultItem
─────────────────                  ────────────────
id                          →     sources.chunkId
fileId                      →     sources.fileId
content                     →     content.text
contextualContent           →     content.context
parentHeader                →     (metadata)
score                       →     score, relevance.keyword
highlightedContent          →     highlights[]
chunkIndex                  →     (metadata)
```

---

## インターフェース詳細

### 入力: SearchQuery

```typescript
interface SearchQuery {
  readonly text: string;              // 検索テキスト
  readonly type: QueryType;           // クエリタイプ（参考情報）
  readonly embedding: Float32Array | null;  // 未使用（Keyword検索では）
  readonly filters: SearchFilters;    // フィルター
  readonly options: SearchOptions;    // オプション
}

// 使用するフィールド
- text: 検索クエリ文字列
- filters.fileIds: ファイルIDフィルタ（配列の先頭を使用）
- options.limit: 最大結果件数
- options.includeHighlights: ハイライト有効化
```

### 出力: SearchResultItem

```typescript
interface SearchResultItem {
  readonly id: string; // 一意ID（生成）
  readonly type: "chunk"; // 固定
  readonly score: number; // 0.0-1.0
  readonly relevance: RelevanceScore; // スコア詳細
  readonly content: SearchResultContent;
  readonly highlights: Highlight[];
  readonly sources: SearchResultSources;
}

// RelevanceScore
{
  combined: number; // = keyword（単独なので同値）
  keyword: number; // BM25正規化スコア
  semantic: 0; // 未使用
  graph: 0; // 未使用
  rerankScore: null;
  cragScore: null;
}
```

---

## エラーハンドリング

### エラー分類

| エラーコード    | 原因                           | 対応                   |
| --------------- | ------------------------------ | ---------------------- |
| `INVALID_QUERY` | 空クエリ、不正な形式           | 空配列を返す or エラー |
| `DB_ERROR`      | DB接続エラー、クエリ実行エラー | エラーをラップして返却 |
| `TIMEOUT`       | 検索タイムアウト               | エラーをラップして返却 |

### 戻り値パターン

```typescript
// 正常系
Result.ok(searchResultItems);

// 空クエリ
Result.ok([]); // 空配列（エラーではない）

// エラー
Result.err(new KeywordSearchError("message", "DB_ERROR", originalError));
```

---

## ディレクトリ構成

```
packages/shared/src/services/search/
├── keyword-search-strategy.ts        # メイン実装
├── keyword-search-strategy.types.ts  # 型定義（オプション）
├── index.ts                          # エクスポート追加
└── __tests__/
    ├── keyword-search-strategy.test.ts           # ユニットテスト
    └── keyword-search-strategy.integration.test.ts  # 統合テスト
```

---

## 依存関係

### 使用する外部モジュール

| モジュール           | 用途                           |
| -------------------- | ------------------------------ |
| `neverthrow`         | Result型（エラーハンドリング） |
| `drizzle-orm/libsql` | DB型定義                       |
| `nanoid`             | ID生成                         |

### 内部依存

| モジュール                       | 用途         |
| -------------------------------- | ------------ |
| `../../db/queries/chunks-search` | FTS5検索関数 |
| `../../types/rag/search/types`   | 型定義       |

---

## パフォーマンス考慮事項

### 最適化ポイント

1. **DB層の直接利用**
   - 既存の最適化されたFTS5クエリを活用
   - 不要なデータ変換を最小化

2. **結果変換の効率化**
   - `Array.map()` での一括変換
   - オブジェクト生成の最小化

3. **メトリクス収集**
   - `performance.now()` による正確な計測
   - 低オーバーヘッドの実装

### 目標性能

| 処理                | 目標    |
| ------------------- | ------- |
| 検索実行（keyword） | < 100ms |
| 検索実行（phrase）  | < 100ms |
| 検索実行（near）    | < 150ms |
| 結果変換            | < 10ms  |

---

## 参照資料

| 資料名               | パス                                              |
| -------------------- | ------------------------------------------------- |
| DB層実装             | `packages/shared/src/db/queries/chunks-search.ts` |
| 型定義               | `packages/shared/src/types/rag/search/types.ts`   |
| インターフェース定義 | `packages/shared/src/types/rag/interfaces.ts`     |
