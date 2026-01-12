# Phase 2: VectorSearchOptions設計書

## 目的

VectorSearchStrategyの検索オプション型を設計し、柔軟な検索パラメータ制御を実現する。

---

## 1. 既存VectorSearchOptions（db/queries/vector-search.ts）

### 1.1 現在の定義

```typescript
export interface VectorSearchOptions {
  /** 取得する最大件数 @default 10 */
  limit?: number;

  /** 最小類似度閾値 (0.0 ~ 1.0) @default undefined */
  minSimilarity?: number;

  /** ファイルIDでフィルタリング @default undefined */
  fileIds?: string[];

  /** 埋め込みモデルIDでフィルタリング @default undefined */
  modelId?: string;
}
```

### 1.2 既存オプションの再利用

VectorSearchStrategyは既存の `VectorSearchOptions` を内部で使用し、
SearchFilters からの変換を行う。

---

## 2. SearchFilters → VectorSearchOptions変換

### 2.1 変換マッピング

| SearchFilters  | VectorSearchOptions | 変換処理                 |
| -------------- | ------------------- | ------------------------ |
| `fileIds`      | `fileIds`           | FileId[] → string[] 変換 |
| `minRelevance` | `minSimilarity`     | そのまま使用（0.0-1.0）  |
| `entityTypes`  | -                   | 未対応（将来拡張）       |
| `dateRange`    | -                   | 未対応（将来拡張）       |
| `workspaceIds` | -                   | 未対応（将来拡張）       |

### 2.2 変換関数

```typescript
function toVectorSearchOptions(
  limit: number,
  filters?: SearchFilters,
): VectorSearchOptions {
  return {
    limit,
    minSimilarity: filters?.minRelevance,
    fileIds: filters?.fileIds?.map((id) => id.toString()),
  };
}
```

---

## 3. VectorSearchStrategyOptions（新規）

### 3.1 型定義

```typescript
/**
 * VectorSearchStrategy固有のオプション
 * コンストラクタで設定するデフォルト動作の制御
 */
export interface VectorSearchStrategyOptions {
  /**
   * デフォルト類似度閾値（0.0-1.0）
   * @default undefined（フィルタなし）
   */
  defaultMinSimilarity?: number;

  /**
   * デフォルト取得件数
   * @default 20
   */
  defaultLimit?: number;

  /**
   * 埋め込みモデルID（特定モデルのみ検索）
   * @default undefined（全モデル対象）
   */
  modelId?: string;
}
```

### 3.2 使用例

```typescript
const strategy = new VectorSearchStrategy(db, embeddingProvider, {
  defaultMinSimilarity: 0.5,
  defaultLimit: 20,
  modelId: "text-embedding-3-small",
});
```

---

## 4. 定数定義

### 4.1 制限値

```typescript
/**
 * 最小取得件数
 */
export const MIN_LIMIT = 1;

/**
 * 最大取得件数
 */
export const MAX_LIMIT = 100;

/**
 * デフォルト取得件数
 */
export const DEFAULT_LIMIT = 20;

/**
 * 最大クエリ長
 */
export const MAX_QUERY_LENGTH = 1000;
```

### 4.2 類似度閾値

```typescript
/**
 * 類似度の最小値
 */
export const MIN_SIMILARITY = 0.0;

/**
 * 類似度の最大値
 */
export const MAX_SIMILARITY = 1.0;

/**
 * 推奨閾値: 高品質結果のみ
 */
export const HIGH_QUALITY_THRESHOLD = 0.7;

/**
 * 推奨閾値: バランス
 */
export const BALANCED_THRESHOLD = 0.5;

/**
 * 推奨閾値: 広範囲検索
 */
export const BROAD_SEARCH_THRESHOLD = 0.3;
```

---

## 5. バリデーション

### 5.1 limit バリデーション

```typescript
function validateLimit(limit: number): Result<void, Error> {
  if (!Number.isInteger(limit)) {
    return Result.err(new Error("Limit must be an integer"));
  }
  if (limit < MIN_LIMIT || limit > MAX_LIMIT) {
    return Result.err(
      new Error(`Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`),
    );
  }
  return Result.ok(undefined);
}
```

### 5.2 minSimilarity バリデーション

```typescript
function validateMinSimilarity(minSimilarity?: number): Result<void, Error> {
  if (minSimilarity === undefined) {
    return Result.ok(undefined);
  }
  if (minSimilarity < MIN_SIMILARITY || minSimilarity > MAX_SIMILARITY) {
    return Result.err(
      new Error(
        `minSimilarity must be between ${MIN_SIMILARITY} and ${MAX_SIMILARITY}`,
      ),
    );
  }
  return Result.ok(undefined);
}
```

---

## 6. 将来拡張

### 6.1 追加予定フィルター

| フィルター     | 優先度 | 実装Phase |
| -------------- | ------ | --------- |
| `dateRange`    | 中     | 将来      |
| `entityTypes`  | 低     | 将来      |
| `workspaceIds` | 低     | 将来      |
| `tags`         | 低     | 将来      |

### 6.2 距離メトリクス拡張

```typescript
type DistanceMetric = "cosine" | "l2" | "dot";

interface AdvancedVectorSearchOptions extends VectorSearchOptions {
  /** 距離メトリクス @default "cosine" */
  metric?: DistanceMetric;
}
```

---

## まとめ

| 項目                        | 設計内容                           |
| --------------------------- | ---------------------------------- |
| VectorSearchOptions         | 既存型を再利用                     |
| SearchFilters変換           | fileIds, minRelevance対応          |
| VectorSearchStrategyOptions | デフォルト値設定用の新規型         |
| バリデーション              | limit, minSimilarityの範囲チェック |
| 将来拡張                    | dateRange, entityTypes対応準備     |
