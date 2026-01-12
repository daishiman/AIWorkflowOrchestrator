# Phase 8: 関数分割・統合記録

## 目的

関数の責務を明確化し、長すぎる関数の分割や重複コードの統合を検討する。

---

## 1. 現状分析

### 1.1 VectorSearchStrategy の関数構成

| メソッド                 | 行数 | 責務                     | 分割要否 |
| ------------------------ | ---- | ------------------------ | -------- |
| search()                 | 30行 | 検索オーケストレーション | 不要     |
| validateInput()          | 15行 | 入力バリデーション       | 不要     |
| generateQueryEmbedding() | 12行 | 埋め込み生成             | 不要     |
| executeVectorSearch()    | 10行 | DB検索実行               | 不要     |
| toSearchResultItem()     | 27行 | 結果変換                 | 不要     |
| getMetrics()             | 3行  | メトリクス取得           | 不要     |

### 1.2 CachedVectorSearchStrategy の関数構成

| メソッド                 | 行数 | 責務                     | 分割要否 |
| ------------------------ | ---- | ------------------------ | -------- |
| search()                 | 35行 | 検索オーケストレーション | 不要     |
| validateInput()          | 15行 | 入力バリデーション       | 不要     |
| getOrGenerateEmbedding() | 25行 | キャッシュ付き埋め込み   | 不要     |
| executeVectorSearch()    | 10行 | DB検索実行               | 不要     |
| toSearchResultItem()     | 27行 | 結果変換                 | 不要     |
| evictIfNeeded()          | 8行  | キャッシュエビクション   | 不要     |
| getCacheKey()            | 3行  | キャッシュキー生成       | 不要     |
| getMetrics()             | 3行  | メトリクス取得           | 不要     |
| clearCache()             | 4行  | キャッシュクリア         | 不要     |
| getCacheStats()          | 8行  | キャッシュ統計取得       | 不要     |

---

## 2. 関数分割の検討

### 2.1 search() メソッドの分析

**現在の構造**（既に適切に分割済み）:

```
search()
  ├─ 1. validateInput()         → 入力チェック
  ├─ 2. generateQueryEmbedding() → 埋め込み生成
  │      or getOrGenerateEmbedding()
  ├─ 3. executeVectorSearch()   → DB検索
  ├─ 4. toSearchResultItem()    → 結果変換（map）
  ├─ 5. minRelevanceフィルタ    → 後処理
  └─ 6. メトリクス更新          → 計測完了
```

**評価**:

- 各ステップが独立した関数に分離されている
- search()は純粋なオーケストレーション役
- さらなる分割は不要

### 2.2 toSearchResultItem() の分析

```typescript
// 27行 - 単純なマッピング処理
private toSearchResultItem(result: VectorSearchResult): SearchResultItem {
  return {
    id: result.chunkId,
    type: "chunk",
    score: result.similarity,
    relevance: { ... },
    content: { ... },
    highlights: [],
    sources: { ... },
  };
}
```

**評価**:

- 単純なデータ変換で、分割すると逆に複雑化
- 現状維持が適切

---

## 3. 重複コード統合の検討

### 3.1 重複メソッドの特定

| メソッド              | 重複状態 | 統合方法         | 実施判断   |
| --------------------- | -------- | ---------------- | ---------- |
| validateInput()       | 完全重複 | 基底クラスへ抽出 | **見送り** |
| executeVectorSearch() | 完全重複 | 基底クラスへ抽出 | **見送り** |
| toSearchResultItem()  | 完全重複 | 基底クラスへ抽出 | **見送り** |

### 3.2 見送り理由

1. **影響範囲が大きい**: 基底クラス導入は全テストに影響
2. **テストカバレッジ維持**: 現在98.71%のカバレッジを維持優先
3. **複雑性増加**: 継承階層追加による複雑性 vs 重複除去のトレードオフ
4. **将来の拡張性**: 3つ目の戦略（GraphSearchStrategy等）追加時に再検討

### 3.3 代替案

将来の統合に備え、以下の設計を記録:

```typescript
// 将来の実装案（現時点では未実装）
abstract class BaseVectorSearchStrategy implements ISearchStrategy {
  protected readonly db: LibSQLDatabase<Record<string, never>>;
  protected readonly embeddingProvider: IEmbeddingProvider;
  protected lastMetric: StrategyMetric;

  // 共通メソッド
  protected validateInput(query: string, limit: number): Result<void, Error>;
  protected executeVectorSearch(
    queryVector: Float32Array,
    limit: number,
    filters?: SearchFilters,
  ): Promise<VectorSearchResult[]>;
  protected toSearchResultItem(result: VectorSearchResult): SearchResultItem;

  // 抽象メソッド（サブクラスで実装）
  protected abstract generateOrGetEmbedding(
    query: string,
  ): Promise<Result<Float32Array, Error>>;
}
```

---

## 4. 実施した変更

**変更なし**

### 理由

1. **関数分割**: search()は既に適切に分割されている
2. **重複統合**: 影響範囲を考慮し見送り
3. **テスト維持**: 98.71%カバレッジを維持

---

## 5. テスト確認

コード変更なしのため、テスト実行不要。

---

## Phase 8 タスク3 完了記録

| 項目     | 内容                            |
| -------- | ------------------------------- |
| 完了日時 | 2026-01-12                      |
| 分割検討 | search()は既に適切に分割        |
| 統合検討 | 基底クラス導入は見送り          |
| 変更件数 | 0件                             |
| 重複率   | 52%（将来の統合候補として記録） |
| 次タスク | タスク4: 型安全性の強化         |
