# VectorSearchStrategy - 実装ガイド

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| 機能名   | VectorSearchStrategy（セマンティック検索） |
| 作成日   | 2026-01-12                                 |
| 対象読者 | 開発者・技術者・学習者                     |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. VectorSearchStrategyって何？

### 1.1 身近な例で考えてみよう

図書館で本を探すときを想像してください。

**普通の検索（キーワード検索）**:

```
「TypeScript 入門」と検索
  → タイトルに「TypeScript」と「入門」が入っている本だけ見つかる
  → 「JavaScript の基礎」という関連する本は見つからない
```

**意味で探す検索（セマンティック検索）**:

```
「プログラミング言語の基礎を学びたい」と検索
  → 「TypeScript入門」も
  → 「JavaScript基礎」も
  → 「プログラミング初心者ガイド」も
  → 意味が似ている本が全部見つかる！
```

VectorSearchStrategyは、この「意味で探す検索」を実現する機能です。

### 1.2 なぜ必要なの？

**❌ 悪い例（キーワードだけの検索）**:

- 「エラー処理」で検索したのに「例外ハンドリング」の記事が見つからない
- 同じ意味なのに違う言葉を使っているから

**⭕ 良い例（セマンティック検索）**:

- 「エラー処理」で検索すると「例外ハンドリング」の記事も見つかる
- 言葉は違っても意味が似ているから

### 1.3 今回作ったもの

| 日本語             | 英語                       | 役割                          |
| ------------------ | -------------------------- | ----------------------------- |
| ベクトル検索       | VectorSearchStrategy       | 意味で文書を検索する          |
| キャッシュ付き検索 | CachedVectorSearchStrategy | 同じ検索を高速化する          |
| 埋め込み           | Embedding                  | 文章を数字の列に変換したもの  |
| 類似度             | Similarity                 | 2つの文章がどれだけ似ているか |

---

## 2. どうやって動くの？

### 2.1 全体の流れ

```
ステップ1: 検索クエリを受け取る
    「TypeScriptのエラー処理について」
           ↓
ステップ2: 文章を数字の列（ベクトル）に変換
    [0.12, -0.45, 0.78, ...] (1536個の数字)
           ↓
ステップ3: データベースで似ている文書を探す
    DiskANNインデックスで高速検索
           ↓
ステップ4: 似ている順に並べて返す
    スコア0.92: 「TypeScriptの例外処理ガイド」
    スコア0.85: 「エラーハンドリングのベストプラクティス」
    スコア0.73: 「try-catch文の使い方」
```

### 2.2 埋め込み（Embedding）とは？

文章を「数字の列」に変換することを**埋め込み**と呼びます。

```
「猫」   → [0.2, 0.8, 0.1, ...]
「犬」   → [0.3, 0.7, 0.2, ...]  ← 猫と似た数字になる
「車」   → [0.9, 0.1, 0.5, ...]  ← 猫とは全然違う数字になる
```

似た意味の言葉は、似た数字の列になります。
これを使って「意味が似ているか」を計算できるのです。

### 2.3 コサイン類似度とは？

2つのベクトル（数字の列）がどれだけ同じ方向を向いているかを測る方法です。

```
完全に同じ方向 → 類似度 1.0（100%似ている）
直角の方向     → 類似度 0.5
反対の方向     → 類似度 0.0（全く似ていない）
```

---

## 3. 作ったものの全体像

```
┌─────────────────────────────────────────────────────────────┐
│                    HybridRAG検索システム                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ KeywordSearch   │  │ VectorSearch    │  │ GraphSearch │  │
│  │ (キーワード検索) │  │ (意味検索) ★今回│  │ (関係検索)  │  │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘  │
│           │                    │                   │          │
│           └────────────────────┼───────────────────┘          │
│                                ↓                              │
│                    ┌─────────────────────┐                   │
│                    │   RRF（結果統合）    │                   │
│                    │   3つの結果を合わせる │                   │
│                    └─────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

今回作った「VectorSearch」は、HybridRAGの3つの検索戦略のうちの1つです。

---

# Part 2: 技術的な詳細（開発者向け）

## 1. アーキテクチャ概要

### 1.1 ファイル構成

```
packages/shared/src/services/search/strategies/
├── types.ts                    # 共通型定義・定数・Result型
├── vector-search-strategy.ts   # VectorSearchStrategy実装
├── cached-vector-search-strategy.ts  # キャッシュ付き実装
└── index.ts                    # バレルエクスポート
```

### 1.2 クラス階層

```
ISearchStrategy（インターフェース）
├── VectorSearchStrategy
│   └── search(): Promise<Result<SearchResultItem[], Error>>
│   └── getMetrics(): StrategyMetric
│
└── CachedVectorSearchStrategy
    └── 内部でVectorSearchStrategyを使用
    └── LRUキャッシュで埋め込みを再利用
```

### 1.3 依存関係

```
VectorSearchStrategy
├── db: LibSQLDatabase          # データベース接続
└── embeddingProvider: IEmbeddingProvider  # 埋め込み生成API

CachedVectorSearchStrategy
├── vectorSearchStrategy: VectorSearchStrategy
├── embeddingProvider: IEmbeddingProvider
└── LRUキャッシュ（内部）
```

---

## 2. 核となる設計判断

### 2.1 Result型の採用

```typescript
// なぜResult型: try-catchよりも型安全にエラーを扱える
// 呼び出し側が必ずエラーを処理することを強制できる
export type Result<T, E> = Ok<T> | Err<E>;

export class Ok<T> {
  constructor(readonly value: T) {}
  isOk(): this is Ok<T> {
    return true;
  }
  isErr(): this is Err<never> {
    return false;
  }
}

export class Err<E> {
  constructor(readonly error: E) {}
  isOk(): this is Ok<never> {
    return false;
  }
  isErr(): this is Err<E> {
    return true;
  }
}
```

**なぜtry-catchではないか**:

- 例外は型情報が失われる（どんなエラーが発生するかわからない）
- 例外処理を忘れてもコンパイルエラーにならない
- Result型なら戻り値の型として明示されるため、処理漏れを防げる

### 2.2 定数の設計

```typescript
// なぜ定数化: マジックナンバーを避け、変更時に一箇所で済む
export const MAX_QUERY_LENGTH = 1000; // なぜ1000: 平均的なクエリは50文字以下、余裕を持たせて設定
export const MIN_LIMIT = 1; // なぜ1: 最低でも1件は必要
export const MAX_LIMIT = 100; // なぜ100: 多すぎるとメモリ・パフォーマンス問題
export const DEFAULT_LIMIT = 10; // なぜ10: UX調査で最適な初期表示数
export const DEFAULT_MIN_RELEVANCE = 0; // なぜ0: フィルタなしがデフォルト
```

### 2.3 類似度計算

```typescript
// なぜこの変換: libSQLのvector_distance_cosは「距離」を返す（0〜2）
// コサイン距離は 2 - 2*cos(θ) で計算される
// これを類似度（0〜1）に変換: similarity = 1 - distance / 2
const similarity = 1 - distance / 2;

// 例: distance=0 → similarity=1.0（完全一致）
// 例: distance=2 → similarity=0.0（完全に反対）
```

---

## 3. SQLクエリ設計

### 3.1 ベクトル検索クエリ

```sql
-- なぜこのクエリ構造: DiskANNインデックスを活用した高速ANN検索
-- vector_top_k()はlibSQL拡張関数で、近似最近傍探索を実行
SELECT
  c.id AS chunk_id,
  c.content,
  c.token_count,
  c.chunk_index,
  c.file_id,
  c.created_at,
  c.updated_at,
  e.embedding,
  vector_distance_cos(e.embedding, X'${queryEmbeddingHex}') AS distance
FROM vector_top_k('embeddings_idx', X'${queryEmbeddingHex}', ${limit})
JOIN chunks c ON c.id = id
LEFT JOIN embeddings e ON e.chunk_id = c.id
WHERE 1=1
  ${filterClause}
ORDER BY distance ASC
```

**なぜvector_top_k()**:

- 全件スキャンせずにインデックスを使用
- O(log N)の計算量で検索可能
- 大規模データでも高速

**なぜHex変換**:

- libSQLはBLOB型でベクトルを格納
- Float32ArrayをHex文字列に変換して渡す

### 3.2 フィルタ適用

```typescript
// なぜ別メソッド: 責務分離と再利用性
private buildFilterClause(filters: SearchFilters): string {
  const clauses: string[] = [];

  // なぜfileIdsフィルタ: 特定ファイルのみ検索したいケース
  if (filters.fileIds?.length) {
    const escaped = filters.fileIds.map(id => `'${this.escapeString(id)}'`);
    clauses.push(`c.file_id IN (${escaped.join(",")})`);
  }

  // なぜminRelevanceフィルタ: 低品質な結果を除外
  // ただしDBでは距離(distance)を使うため変換が必要
  // minRelevance = 0.5 → maxDistance = 2 * (1 - 0.5) = 1.0
  if (filters.minRelevance !== undefined) {
    const maxDistance = 2 * (1 - filters.minRelevance);
    clauses.push(`vector_distance_cos(e.embedding, X'${hex}') <= ${maxDistance}`);
  }

  return clauses.length ? ` AND ${clauses.join(" AND ")}` : "";
}
```

---

## 4. キャッシュ戦略

### 4.1 LRUキャッシュ設計

```typescript
// なぜLRU: 最も使われていないエントリを優先的に削除
// 頻繁に使われるクエリの埋め込みは保持される
private cache: Map<string, CacheEntry> = new Map();

interface CacheEntry {
  embedding: Float32Array;  // 埋め込みベクトル
  expiresAt: number;        // 有効期限（ミリ秒）
}

// なぜ5分TTL:
// - 短すぎる→キャッシュヒット率低下
// - 長すぎる→メモリ圧迫
// - 5分は一般的なセッション中の再検索をカバー
private readonly ttl: number = 5 * 60 * 1000;

// なぜ1000エントリ:
// - 1536次元 × 4bytes × 1000 = 約6MB
// - メモリ使用量とヒット率のバランス
private readonly maxSize: number = 1000;
```

### 4.2 キャッシュキー設計

```typescript
// なぜnormalizeKey: 表記揺れを吸収してキャッシュヒット率を上げる
private normalizeKey(query: string): string {
  return query
    .toLowerCase()           // 大文字小文字を統一
    .trim()                  // 前後の空白を除去
    .replace(/\s+/g, " ");   // 連続空白を1つに
}
```

---

## 5. エラーハンドリング

### 5.1 エラーカテゴリ

| エラータイプ     | 発生条件                     | 対応方法               |
| ---------------- | ---------------------------- | ---------------------- |
| 空クエリ         | query.trim() === ""          | 即座にErr返却          |
| 長すぎるクエリ   | query.length > 1000          | 即座にErr返却          |
| 不正なlimit      | limit < 1 または limit > 100 | 即座にErr返却          |
| 埋め込み生成失敗 | API接続エラー等              | エラーをラップして返却 |

### 5.2 エラーメッセージ

```typescript
// なぜ具体的なメッセージ: デバッグ・ユーザー対応を容易に
const ERRORS = {
  EMPTY_QUERY: "Query cannot be empty",
  QUERY_TOO_LONG: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`,
  INVALID_LIMIT: `Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`,
  EMBEDDING_FAILED: "Failed to generate embedding",
} as const;
```

---

## 6. テスト構成

| テストファイル                             | テスト数 | カバー範囲                 |
| ------------------------------------------ | -------- | -------------------------- |
| vector-search-strategy.test.ts             | 35       | 単体テスト（モック使用）   |
| vector-search-strategy.integration.test.ts | 15       | 統合テスト（実DB使用）     |
| cached-vector-search-strategy.test.ts      | 33       | キャッシュ戦略テスト       |
| **合計**                                   | **83**   | Line 98.71%, Branch 95.65% |

---

## 7. 使用例

### 7.1 基本的な使い方

```typescript
import { VectorSearchStrategy } from "@repo/shared/services/search/strategies";

// 初期化
const strategy = new VectorSearchStrategy(db, embeddingProvider);

// 検索実行
const result = await strategy.search("TypeScriptのエラー処理", 10);

// 結果処理
if (result.isOk()) {
  result.value.forEach((item) => {
    console.log(`[${item.score.toFixed(3)}] ${item.content.text.slice(0, 50)}`);
  });
} else {
  console.error("検索エラー:", result.error.message);
}
```

### 7.2 フィルタ使用

```typescript
// 特定ファイルのみ検索
const result = await strategy.search("API設計", 10, {
  fileIds: ["file-123", "file-456"],
  minRelevance: 0.5, // 類似度50%以上のみ
});
```

### 7.3 キャッシュ付き検索

```typescript
import { CachedVectorSearchStrategy } from "@repo/shared/services/search/strategies";

// 初期化（カスタムTTL・サイズ指定可能）
const cached = new CachedVectorSearchStrategy(
  new VectorSearchStrategy(db, embeddingProvider),
  embeddingProvider,
  { ttlMs: 10 * 60 * 1000, maxSize: 500 }, // 10分、最大500エントリ
);

// 検索（2回目以降はキャッシュヒット）
await cached.search("TypeScript", 10); // API呼び出し
await cached.search("typescript", 10); // キャッシュヒット（大文字小文字無視）

// キャッシュ統計確認
const stats = cached.getCacheStats();
console.log(`ヒット率: ${(stats.hitRate * 100).toFixed(1)}%`);
```

---

## 8. 注意点

### 8.1 埋め込みモデルの一貫性

```typescript
// ❌ 使用禁止: 異なるモデルで埋め込み生成
const strategy = new VectorSearchStrategy(db, text3SmallProvider);
// DBにはtext-embedding-ada-002で生成した埋め込みが入っている
// → 次元数やベクトル空間が異なるため、検索結果が不正確になる

// ⭕ 正しい使い方: 同じモデルを使用
const strategy = new VectorSearchStrategy(db, textAda002Provider);
// DBにもtext-embedding-ada-002で生成した埋め込みが入っている
// → 正確な類似度計算が可能
```

### 8.2 バッチ処理の推奨

```typescript
// ❌ 非推奨: 1件ずつ検索（API呼び出しが増える）
for (const query of queries) {
  await strategy.search(query, 10);
}

// ⭕ 推奨: CachedVectorSearchStrategyを使用
const cached = new CachedVectorSearchStrategy(strategy, provider);
for (const query of queries) {
  await cached.search(query, 10); // 重複クエリはキャッシュから
}
```

---

## 9. 用語集

| 用語              | 読み方                   | 説明                                                                           |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------ |
| Embedding         | エンベディング           | テキストを数値ベクトルに変換したもの。似た意味のテキストは似たベクトルになる。 |
| Vector Search     | ベクトルサーチ           | ベクトル間の距離・類似度を計算して検索する手法。                               |
| DiskANN           | ディスクアン             | Microsoftが開発した高速近似最近傍探索アルゴリズム。SSD上で動作可能。           |
| Cosine Similarity | コサインシミラリティ     | 2つのベクトルの方向の類似性を測る指標。0〜1の値で表す。                        |
| LRU Cache         | エルアールユーキャッシュ | Least Recently Used。最も使われていないものから削除するキャッシュ戦略。        |
| ANN               | エーエヌエヌ             | Approximate Nearest Neighbors。近似最近傍探索の略。                            |
| Result型          | リザルトがた             | 成功(Ok)と失敗(Err)を型で表現するパターン。Rust言語由来。                      |
| ISearchStrategy   | アイサーチストラテジー   | 検索戦略の共通インターフェース。HybridRAGで使用。                              |
| HybridRAG         | ハイブリッドラグ         | Keyword・Semantic・Graph検索を組み合わせたRAGアーキテクチャ。                  |
| RRF               | アールアールエフ         | Reciprocal Rank Fusion。複数の検索結果を統合するアルゴリズム。                 |

---

## 10. 次のステップ

| タスクID   | タスク名                 | 状態   | 優先度 |
| ---------- | ------------------------ | ------ | ------ |
| CONV-07-XX | dateRangeフィルタ実装    | 未実施 | 中     |
| CONV-07-XX | fileTypesフィルタ実装    | 未実施 | 中     |
| CONV-07-XX | workspaceIdsフィルタ実装 | 未実施 | 中     |
| CONV-07-XX | Rerankスコア対応         | 未実施 | 低     |
| CONV-07-XX | CRAGスコア対応           | 未実施 | 低     |

---

## Phase 12-1 完了記録

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| 完了日時 | 2026-01-12                                 |
| 成果物   | 本ドキュメント（実装ガイド）               |
| 内容     | Part 1（概念的説明）+ Part 2（技術的詳細） |
| 判定     | 完了                                       |
