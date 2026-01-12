# API設計書 - キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | CONV-07-02 |
| Phase    | 2          |
| 作成日   | 2026-01-11 |

---

## Public API

### KeywordSearchStrategy クラス

#### コンストラクタ

```typescript
constructor(db: LibSQLDatabase<Record<string, never>>)
```

| パラメータ | 型                                      | 説明                                |
| ---------- | --------------------------------------- | ----------------------------------- |
| `db`       | `LibSQLDatabase<Record<string, never>>` | Drizzle ORMデータベースインスタンス |

**使用例**:

```typescript
import { KeywordSearchStrategy } from "@repo/shared/services/search";
import { db } from "@repo/shared/db";

const strategy = new KeywordSearchStrategy(db);
```

---

#### search メソッド

```typescript
async search(
  query: SearchQuery,
  options?: KeywordSearchOptions
): Promise<Result<SearchResultItem[], KeywordSearchError>>
```

| パラメータ | 型                     | 必須 | 説明           |
| ---------- | ---------------------- | ---- | -------------- |
| `query`    | `SearchQuery`          | ✅   | 検索クエリ     |
| `options`  | `KeywordSearchOptions` | -    | 検索オプション |

**SearchQuery の使用フィールド**:

| フィールド                  | 型         | 説明                                  |
| --------------------------- | ---------- | ------------------------------------- |
| `text`                      | `string`   | 検索テキスト（1-1000文字）            |
| `filters.fileIds`           | `string[]` | ファイルIDフィルタ（先頭要素を使用）  |
| `options.limit`             | `number`   | 最大結果件数（1-100、デフォルト: 20） |
| `options.includeHighlights` | `boolean`  | ハイライト含有フラグ                  |

**KeywordSearchOptions**:

```typescript
interface KeywordSearchOptions {
  /** 検索タイプ */
  searchType: "keyword" | "phrase" | "near";
  /** NEAR検索時の単語間距離（1-50、デフォルト: 5） */
  nearDistance?: number;
  /** BM25スケールファクター（デフォルト: 0.5） */
  scaleFactor?: number;
}
```

**戻り値**:

```typescript
Result<SearchResultItem[], KeywordSearchError>;
```

- 成功時: `Result.ok(SearchResultItem[])`
- 失敗時: `Result.err(KeywordSearchError)`
- 空クエリ時: `Result.ok([])` （エラーではない）

**使用例**:

```typescript
// キーワード検索（OR）
const result = await strategy.search(
  {
    text: "TypeScript React",
    type: "local",
    embedding: null,
    filters: { fileIds: [], entityTypes: [], dateRange: null, minRelevance: 0 },
    options: {
      limit: 10,
      offset: 0,
      includeMetadata: true,
      includeHighlights: true,
      rerankEnabled: false,
      cragEnabled: false,
      strategies: ["keyword"],
      weights: { keyword: 1, semantic: 0, graph: 0 },
    },
  },
  { searchType: "keyword" },
);

if (result.isOk()) {
  console.log(result.value); // SearchResultItem[]
} else {
  console.error(result.error); // KeywordSearchError
}

// フレーズ検索
const phraseResult = await strategy.search(query, {
  searchType: "phrase",
});

// NEAR検索
const nearResult = await strategy.search(query, {
  searchType: "near",
  nearDistance: 5,
});
```

---

#### getMetrics メソッド

```typescript
getMetrics(): SearchStrategyMetrics
```

**戻り値**:

```typescript
interface SearchStrategyMetrics {
  keyword: StrategyMetric;
  semantic: StrategyMetric;
  graph: StrategyMetric;
}

interface StrategyMetric {
  enabled: boolean;
  resultCount: number;
  processingTime: number; // ミリ秒
  topScore: number; // 0.0-1.0
}
```

**使用例**:

```typescript
const metrics = strategy.getMetrics();
console.log(metrics.keyword.processingTime); // 最後の検索の処理時間
console.log(metrics.keyword.resultCount); // 最後の検索の結果件数
```

---

## 型定義

### KeywordSearchType

```typescript
type KeywordSearchType = "keyword" | "phrase" | "near";
```

| 値          | 説明                 | FTS5クエリ形式         |
| ----------- | -------------------- | ---------------------- |
| `'keyword'` | OR検索（デフォルト） | `term1 OR term2`       |
| `'phrase'`  | 完全一致検索         | `"term1 term2"`        |
| `'near'`    | 近接検索             | `NEAR(term1 term2, N)` |

---

### KeywordSearchOptions

```typescript
interface KeywordSearchOptions {
  /** 検索タイプ（デフォルト: 'keyword'） */
  searchType: KeywordSearchType;

  /** NEAR検索時の単語間距離（デフォルト: 5、最大: 50） */
  nearDistance?: number;

  /** BM25スケールファクター（デフォルト: 0.5） */
  scaleFactor?: number;
}
```

---

### KeywordSearchError

```typescript
class KeywordSearchError extends Error {
  readonly code: "INVALID_QUERY" | "DB_ERROR" | "TIMEOUT";
  readonly cause?: Error;

  constructor(
    message: string,
    code: "INVALID_QUERY" | "DB_ERROR" | "TIMEOUT",
    cause?: Error,
  );
}
```

| コード          | 説明              | 対処法                 |
| --------------- | ----------------- | ---------------------- |
| `INVALID_QUERY` | 不正なクエリ形式  | クエリを修正           |
| `DB_ERROR`      | DB接続/実行エラー | リトライ or 上位に伝播 |
| `TIMEOUT`       | 検索タイムアウト  | リトライ or 上位に伝播 |

---

## エクスポート

### index.ts

```typescript
// packages/shared/src/services/search/index.ts

export { KeywordSearchStrategy } from "./keyword-search-strategy";
export type {
  KeywordSearchType,
  KeywordSearchOptions,
  KeywordSearchError,
} from "./keyword-search-strategy";
```

---

## バリデーションルール

### クエリテキスト

| ルール   | 値       | 動作                 |
| -------- | -------- | -------------------- |
| 最小長   | 1文字    | 空文字は空配列を返す |
| 最大長   | 1000文字 | 超過時はエラー       |
| 空白のみ | -        | 空配列を返す         |

### limit

| ルール     | 値  | 動作              |
| ---------- | --- | ----------------- |
| 最小値     | 1   | 最小1件           |
| 最大値     | 100 | 超過時は100に制限 |
| デフォルト | 20  | 未指定時          |

### nearDistance

| ルール     | 値  | 動作             |
| ---------- | --- | ---------------- |
| 最小値     | 1   | 最小1トークン    |
| 最大値     | 50  | 超過時は50に制限 |
| デフォルト | 5   | 未指定時         |

---

## パフォーマンス仕様

### 応答時間目標

| 検索タイプ | 目標（10,000チャンク） | 測定基準         |
| ---------- | ---------------------- | ---------------- |
| keyword    | < 100ms                | 95パーセンタイル |
| phrase     | < 100ms                | 95パーセンタイル |
| near       | < 150ms                | 95パーセンタイル |

### スケーリング

| データ量        | 想定応答時間 |
| --------------- | ------------ |
| 1,000チャンク   | < 50ms       |
| 10,000チャンク  | < 100ms      |
| 100,000チャンク | < 500ms      |

---

## 使用例（完全版）

```typescript
import { KeywordSearchStrategy } from "@repo/shared/services/search";
import { db } from "@repo/shared/db";
import type { SearchQuery } from "@repo/shared/types/rag/search/types";

// 1. インスタンス生成
const keywordSearch = new KeywordSearchStrategy(db);

// 2. SearchQuery 構築
const query: SearchQuery = {
  text: "machine learning TypeScript",
  type: "local",
  embedding: null,
  filters: {
    fileIds: ["file-123"], // オプション
    entityTypes: [],
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
    weights: { keyword: 1, semantic: 0, graph: 0 },
  },
};

// 3. キーワード検索実行
const keywordResult = await keywordSearch.search(query, {
  searchType: "keyword",
});

if (keywordResult.isOk()) {
  for (const item of keywordResult.value) {
    console.log(
      `[${item.score.toFixed(2)}] ${item.content.text.slice(0, 100)}...`,
    );
    console.log(`  ChunkID: ${item.sources.chunkId}`);
    console.log(`  FileID: ${item.sources.fileId}`);
  }
}

// 4. フレーズ検索実行
const phraseResult = await keywordSearch.search(
  { ...query, text: "machine learning" },
  { searchType: "phrase" },
);

// 5. NEAR検索実行
const nearResult = await keywordSearch.search(
  { ...query, text: "machine learning" },
  { searchType: "near", nearDistance: 10 },
);

// 6. メトリクス確認
const metrics = keywordSearch.getMetrics();
console.log(`処理時間: ${metrics.keyword.processingTime}ms`);
console.log(`結果件数: ${metrics.keyword.resultCount}`);
```

---

## 互換性

### 既存システムとの互換性

| コンポーネント     | 互換性 | 備考                 |
| ------------------ | ------ | -------------------- |
| chunks-search.ts   | ✅     | DB層をそのまま利用   |
| SearchQuery型      | ✅     | 既存型に準拠         |
| SearchResultItem型 | ✅     | 既存型に準拠         |
| HybridRAGSearch    | 🔜     | CONV-07-07で統合予定 |

### 将来の拡張性

| 拡張ポイント   | 説明                                  |
| -------------- | ------------------------------------- |
| キャッシュ追加 | `search()` 内でキャッシュ層を追加可能 |
| 新規検索タイプ | `KeywordSearchType` に追加可能        |
| メトリクス拡張 | `StrategyMetric` を拡張可能           |
