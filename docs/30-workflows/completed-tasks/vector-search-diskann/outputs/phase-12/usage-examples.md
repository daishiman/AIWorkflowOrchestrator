# VectorSearchStrategy 使用例ドキュメント

## Phase 12 Task 2: 使用例ドキュメント

---

## 1. 基本的な使用例

### 1.1 VectorSearchStrategyの初期化

```typescript
import { VectorSearchStrategy } from "@repo/shared/services/search/strategies";
import { OpenAIEmbeddingProvider } from "@repo/shared/services/embedding";
import { createDb } from "@repo/shared/db";

// データベース接続
const db = createDb(process.env.DATABASE_URL);

// 埋め込みプロバイダー
const embeddingProvider = new OpenAIEmbeddingProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-small",
});

// VectorSearchStrategy初期化
const vectorStrategy = new VectorSearchStrategy(db, embeddingProvider);
```

### 1.2 基本検索

```typescript
// 基本的な検索
const result = await vectorStrategy.search("TypeScript 型安全", 10);

if (result.isOk()) {
  const items = result.value;
  console.log(`${items.length}件の結果が見つかりました`);

  items.forEach((item) => {
    console.log(`ID: ${item.id}`);
    console.log(`スコア: ${item.score.toFixed(3)}`);
    console.log(`内容: ${item.content.text.substring(0, 100)}...`);
    console.log("---");
  });
} else {
  console.error(`エラー: ${result.error.message}`);
}
```

### 1.3 日本語クエリ検索

```typescript
// 日本語での検索
const result = await vectorStrategy.search("関数型プログラミングの基礎", 20);

if (result.isOk()) {
  result.value.forEach((item) => {
    console.log(`${item.score.toFixed(2)}: ${item.content.text}`);
  });
}
```

---

## 2. フィルタ付き検索

### 2.1 fileIdsフィルタ

特定のファイルIDに限定して検索。

```typescript
import type { FileId } from "@repo/shared/types/rag/branded";

const result = await vectorStrategy.search("React コンポーネント", 10, {
  fileIds: ["file-001" as FileId, "file-002" as FileId],
});

if (result.isOk()) {
  console.log(`指定ファイル内で ${result.value.length}件見つかりました`);
}
```

### 2.2 minRelevanceフィルタ

最小類似度スコアを指定してフィルタリング。

```typescript
const result = await vectorStrategy.search("GraphQL スキーマ設計", 50, {
  minRelevance: 0.5, // 0.5以上の類似度のみ
});

if (result.isOk()) {
  console.log(`類似度0.5以上: ${result.value.length}件`);
  // 全ての結果がscore >= 0.5
}
```

### 2.3 複合フィルタ

複数のフィルタを組み合わせる。

```typescript
const result = await vectorStrategy.search("APIエンドポイント設計", 20, {
  fileIds: ["api-spec.md" as FileId],
  minRelevance: 0.3,
});

if (result.isOk()) {
  result.value.forEach((item) => {
    console.log(`${item.sources.chunkId}: ${item.score}`);
  });
}
```

---

## 3. キャッシュ付きバージョン

### 3.1 CachedVectorSearchStrategyの初期化

```typescript
import { CachedVectorSearchStrategy } from "@repo/shared/services/search/strategies";

// デフォルト設定（5分TTL、最大1000エントリ）
const cachedStrategy = new CachedVectorSearchStrategy(db, embeddingProvider);

// カスタム設定
const customCachedStrategy = new CachedVectorSearchStrategy(
  db,
  embeddingProvider,
  {
    cacheMaxAge: 10 * 60 * 1000, // 10分
    maxCacheSize: 500, // 最大500エントリ
  },
);
```

### 3.2 キャッシュ効果の確認

```typescript
// 1回目: キャッシュミス（埋め込み生成あり）
const result1 = await cachedStrategy.search("React hooks", 10);
let stats = cachedStrategy.getCacheStats();
console.log(`ミス: ${stats.misses}, ヒット: ${stats.hits}`); // ミス: 1, ヒット: 0

// 2回目: キャッシュヒット（埋め込み生成スキップ）
const result2 = await cachedStrategy.search("React hooks", 10);
stats = cachedStrategy.getCacheStats();
console.log(`ミス: ${stats.misses}, ヒット: ${stats.hits}`); // ミス: 1, ヒット: 1

// ヒット率確認
console.log(`ヒット率: ${(stats.hitRate * 100).toFixed(1)}%`); // 50.0%
```

### 3.3 キャッシュキーの正規化

大文字小文字や空白は正規化されるため、同一クエリとして扱われる。

```typescript
await cachedStrategy.search("React Hooks", 10); // ミス
await cachedStrategy.search("react hooks", 10); // ヒット（同一キー）
await cachedStrategy.search("  react hooks  ", 10); // ヒット（同一キー）

const stats = cachedStrategy.getCacheStats();
console.log(`キャッシュサイズ: ${stats.size}`); // 1
```

### 3.4 キャッシュクリア

```typescript
// キャッシュをクリア
cachedStrategy.clearCache();

const stats = cachedStrategy.getCacheStats();
console.log(`サイズ: ${stats.size}`); // 0
console.log(`ヒット: ${stats.hits}`); // 0
console.log(`ミス: ${stats.misses}`); // 0
```

---

## 4. メトリクス取得

### 4.1 検索後のメトリクス

```typescript
const result = await vectorStrategy.search("パフォーマンス最適化", 10);
const metrics = vectorStrategy.getMetrics();

console.log(`結果数: ${metrics.resultCount}`);
console.log(`処理時間: ${metrics.processingTime.toFixed(2)}ms`);
console.log(`最高スコア: ${metrics.topScore.toFixed(3)}`);
console.log(`有効: ${metrics.enabled}`);
```

---

## 5. エラーハンドリング

### 5.1 入力エラー

```typescript
// 空クエリ
const result1 = await vectorStrategy.search("", 10);
if (result1.isErr()) {
  console.log(result1.error.message); // "Query cannot be empty"
}

// クエリ長超過
const longQuery = "a".repeat(1001);
const result2 = await vectorStrategy.search(longQuery, 10);
if (result2.isErr()) {
  console.log(result2.error.message); // "Query exceeds maximum length of 1000 characters"
}

// limit範囲外
const result3 = await vectorStrategy.search("test", 0);
if (result3.isErr()) {
  console.log(result3.error.message); // "Limit must be between 1 and 100"
}
```

### 5.2 APIエラーハンドリング

```typescript
try {
  const result = await vectorStrategy.search("テスト", 10);

  if (result.isErr()) {
    // 埋め込みAPI失敗などのエラー
    console.error(`検索エラー: ${result.error.message}`);
    // フォールバック処理
    return fallbackSearch(query);
  }

  return result.value;
} catch (error) {
  // 予期しないエラー
  console.error("予期しないエラー:", error);
  throw error;
}
```

---

## 6. HybridRAG統合

### 6.1 Triple Searchでの使用

```typescript
import { HybridRAGSearchStrategy } from "@repo/shared/services/search";
import { KeywordSearchStrategy } from "@repo/shared/services/search/strategies";
import { GraphSearchStrategy } from "@repo/shared/services/search/strategies";

// 3つの検索戦略を初期化
const keywordStrategy = new KeywordSearchStrategy(db);
const semanticStrategy = new VectorSearchStrategy(db, embeddingProvider);
const graphStrategy = new GraphSearchStrategy(db);

// HybridRAGで統合
const hybridStrategy = new HybridRAGSearchStrategy({
  keyword: keywordStrategy,
  semantic: semanticStrategy,
  graph: graphStrategy,
  weights: {
    keyword: 0.3,
    semantic: 0.5,
    graph: 0.2,
  },
});

// 統合検索実行
const result = await hybridStrategy.search("TypeScript ベストプラクティス", 20);
```

### 6.2 Semantic検索のみ使用

```typescript
// HybridRAGでSemantic検索のみを有効化
const hybridStrategy = new HybridRAGSearchStrategy({
  semantic: new VectorSearchStrategy(db, embeddingProvider),
  weights: {
    keyword: 0,
    semantic: 1.0,
    graph: 0,
  },
});

const result = await hybridStrategy.search("機械学習モデル", 10);
```

---

## 7. パフォーマンス最適化

### 7.1 キャッシュ活用

```typescript
// 高頻度クエリにはCachedVectorSearchStrategyを使用
const cachedStrategy = new CachedVectorSearchStrategy(db, embeddingProvider, {
  cacheMaxAge: 15 * 60 * 1000, // 15分（利用パターンに応じて調整）
  maxCacheSize: 2000, // メモリに余裕があれば増加
});
```

### 7.2 適切なlimit設定

```typescript
// 必要最小限のlimitを指定
const result = await vectorStrategy.search(query, 10); // 10件で十分な場合

// 大量結果が必要な場合でも最大100件まで
const manyResults = await vectorStrategy.search(query, 100);
```

### 7.3 minRelevanceでフィルタリング

```typescript
// 低品質結果を早期にフィルタリング
const result = await vectorStrategy.search(query, 50, {
  minRelevance: 0.4, // 関連性の低い結果を除外
});
```

---

## Phase 12 Task 2 完了記録

| 項目     | 内容           |
| -------- | -------------- |
| 完了日時 | 2026-01-12     |
| 成果物   | 本ドキュメント |
| 判定     | 完了           |
