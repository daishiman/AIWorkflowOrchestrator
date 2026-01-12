# キーワード検索戦略 実装ガイド

## Part 1: 概念的説明

### なぜキーワード検索戦略が必要か

HybridRAG検索エンジンでは、複数の検索手法を組み合わせて最適な結果を得ます。キーワード検索戦略は、その中で「言葉そのもの」に着目した検索を担当します。

**比喩**: 図書館で本を探す場面を想像してください。「TypeScript」という本を探すとき、司書は2つの方法を使えます：

1. **キーワード検索**: 「TypeScript」という文字が含まれる本を探す
2. **意味検索**: 「プログラミング言語」「JavaScript」など関連する概念から探す

キーワード検索戦略は、この1番目の方法を担当します。SQLite FTS5という高速な全文検索エンジンを使い、BM25というスコアリングアルゴリズムで関連度を計算します。

### 3つの検索モード

```
                      検索クエリ
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Keyword  │    │  Phrase  │    │   NEAR   │
    │          │    │          │    │          │
    │ OR検索   │    │ 完全一致 │    │ 近接検索 │
    └──────────┘    └──────────┘    └──────────┘
         │               │               │
         ▼               ▼               ▼
    "React Vue"    "exact phrase"   NEAR(A B, 5)
    → React OR Vue  → そのまま検索   → 5語以内に両方
```

| モード  | 使用場面             | 例                      |
| ------- | -------------------- | ----------------------- |
| Keyword | 一般的な検索         | `React Vue`             |
| Phrase  | 正確なフレーズを検索 | `"exact phrase"`        |
| NEAR    | 近接する単語を検索   | `searchNear(["A","B"])` |

### BM25スコアの正規化

FTS5のBM25関数は負の値を返します（小さいほど関連性が高い）。これを0-1の範囲に変換するためにシグモイド関数を使用します。

```
正規化スコア = 1 / (1 + exp(rawScore × 0.5))
```

| rawScore | 正規化後 | 意味       |
| -------- | -------- | ---------- |
| -20.0    | 0.9999   | 非常に関連 |
| -10.0    | 0.9933   | 高関連     |
| 0        | 0.5      | 中程度     |
| 10.0     | 0.0067   | 低関連     |

---

## Part 2: 技術的詳細

### アーキテクチャ

```
packages/shared/src/services/search/
├── keyword-search-strategy.ts    # メイン実装
├── index.ts                      # エクスポート
└── __tests__/
    ├── keyword-search-strategy.test.ts           # ユニットテスト
    └── keyword-search-strategy.integration.test.ts # 統合テスト
```

### クラス設計

```typescript
export class KeywordSearchStrategy implements IKeywordSearchStrategy {
  // 定数
  export const MAX_QUERY_LENGTH = 1000;
  export const DEFAULT_SCALE_FACTOR = 0.5;
  export const SEARCH_TIMEOUT_MS = 10000;

  // メソッド
  search(query: SearchQuery): Promise<Result<SearchResultItem[], KeywordSearchError>>
  searchNear(terms: string[], options?: KeywordNearOptions): Promise<Result<...>>
  normalizeScore(rawScore: number, scaleFactor?: number): number
  buildFTS5Query(text: string): string
  toSearchResultItem(ftsResult: FtsSearchResult): SearchResultItem
  getStrategyName(): string
  getMetrics(): StrategyMetric
}
```

### エラー型設計

```typescript
type KeywordSearchError =
  | { type: "validation"; message: string }
  | { type: "database"; message: string; cause?: Error }
  | { type: "timeout"; message: string };
```

| エラー型   | 発生条件                     | 対処                 |
| ---------- | ---------------------------- | -------------------- |
| validation | クエリ長超過、無効形式       | ユーザーに修正を促す |
| database   | DB接続エラー、クエリ実行失敗 | リトライまたは通知   |
| timeout    | 検索が10秒を超過             | タイムアウト通知     |

### DB層との連携

キーワード検索戦略は `chunks-search.ts` のクエリ関数を使用します。

```typescript
// 使用するDB関数
import {
  searchChunksByKeyword, // OR検索
  searchChunksByPhrase, // フレーズ検索
  searchChunksByNear, // NEAR検索
  escapeFts5Query, // クエリエスケープ
} from "../../db/queries/chunks-search";
```

### 使用例

```typescript
import { KeywordSearchStrategy } from "@repo/shared/services/search";

const db = getDatabase(); // LibSQLDatabase
const strategy = new KeywordSearchStrategy(db);

// 基本検索
const result = await strategy.search({
  text: "TypeScript tutorial",
  type: "local",
  embedding: null,
  filters: {
    fileIds: null,
    entityTypes: null,
    dateRange: null,
    minRelevance: 0,
  },
  options: {
    limit: 20,
    offset: 0,
    includeMetadata: true,
    includeHighlights: true,
    rerankEnabled: false,
    cragEnabled: false,
    strategies: ["keyword"],
    weights: { keyword: 1.0, semantic: 0, graph: 0 },
  },
});

if (isOk(result)) {
  console.log(result.data); // SearchResultItem[]
} else {
  console.error(result.error); // KeywordSearchError
}

// NEAR検索
const nearResult = await strategy.searchNear(["search", "words"], {
  nearDistance: 5,
  limit: 20,
});
```

---

## 用語集

| 用語                  | 読み方                       | 意味                                    |
| --------------------- | ---------------------------- | --------------------------------------- |
| FTS5                  | エフティーエスファイブ       | SQLiteの全文検索エンジン（バージョン5） |
| BM25                  | ビーエムにじゅうご           | 文書の関連度スコアリングアルゴリズム    |
| KeywordSearchStrategy | キーワードサーチストラテジー | キーワード検索戦略クラス                |
| SearchResultItem      | サーチリザルトアイテム       | 検索結果の個別アイテム                  |
| StrategyMetric        | ストラテジーメトリック       | 検索戦略のパフォーマンス指標            |
| NEAR検索              | ニアサーチ                   | 近接キーワード検索                      |
