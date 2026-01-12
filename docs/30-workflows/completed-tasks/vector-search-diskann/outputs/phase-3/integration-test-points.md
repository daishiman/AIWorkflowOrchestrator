# Phase 3: 統合テスト観点

## 目的

VectorSearchStrategyの統合テストで検証すべき観点を整理し、Phase 6（テスト拡充）の準備を行う。

---

## 1. 統合ポイント

### 1.1 IEmbeddingProvider → VectorSearchStrategy

**統合箇所**: `generateQueryEmbedding()` メソッド

```
クエリ文字列 → IEmbeddingProvider.embed() → EmbeddingResult → Float32Array
```

| テスト観点   | シナリオ                   | 期待結果                              |
| ------------ | -------------------------- | ------------------------------------- |
| 正常系       | 有効なクエリで埋め込み生成 | Float32Arrayが返される                |
| APIエラー    | embed()がエラーをスロー    | Result.err(EmbeddingError)            |
| タイムアウト | 30秒以上応答なし           | Result.err(TimeoutError)              |
| レート制限   | 429エラー                  | Result.err(RateLimitError), retriable |
| 空クエリ     | 空文字列を渡す             | バリデーションでResult.err()          |

---

### 1.2 VectorSearchStrategy → libSQL

**統合箇所**: `executeVectorSearch()` メソッド

```
Float32Array → searchByVector() → VectorSearchResult[]
```

| テスト観点         | シナリオ               | 期待結果                           |
| ------------------ | ---------------------- | ---------------------------------- |
| 正常系             | 有効なベクトルで検索   | VectorSearchResult[]が返される     |
| 空結果             | マッチするデータなし   | 空配列が返される                   |
| DB接続エラー       | 接続失敗               | Result.err(DatabaseError)          |
| クエリタイムアウト | 10秒以上応答なし       | Result.err(QueryTimeoutError)      |
| ベクトル次元不一致 | 異なる次元数のベクトル | Result.err(DimensionMismatchError) |

---

### 1.3 検索結果 → HybridRAG統合

**統合箇所**: `search()` メソッドの戻り値

```
VectorSearchResult[] → toSearchResultItem() → SearchResultItem[] → HybridRAG
```

| テスト観点 | シナリオ                     | 期待結果             |
| ---------- | ---------------------------- | -------------------- |
| 型互換性   | SearchResultItem型に準拠     | 型チェックパス       |
| スコア範囲 | 全結果のscoreが0.0-1.0       | アサーション成功     |
| ソート順   | 類似度降順                   | 先頭が最高スコア     |
| メトリクス | getMetrics()が正確な値を返す | 処理時間・件数が正確 |

---

## 2. 統合テストシナリオ

### 2.1 E2E正常系シナリオ

**シナリオ名**: 埋め込み生成→検索→結果取得

```typescript
// テストシナリオ
describe("VectorSearchStrategy E2E", () => {
  it("should return search results for valid query", async () => {
    // Arrange
    const strategy = new VectorSearchStrategy(db, embeddingProvider);
    const query = "TypeScriptの型安全性について";
    const limit = 10;

    // Act
    const result = await strategy.search(query, limit);

    // Assert
    expect(result.isOk()).toBe(true);
    expect(result.value.length).toBeLessThanOrEqual(limit);
    result.value.forEach((item) => {
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(1);
      expect(item.type).toBe("chunk");
    });
  });
});
```

**検証ポイント**:

- [ ] Result.ok()が返される
- [ ] 結果件数がlimit以下
- [ ] 各結果のscoreが0.0-1.0
- [ ] 全結果のtypeが"chunk"

---

### 2.2 異常系シナリオ: 埋め込み生成失敗

**シナリオ名**: API障害時のエラーハンドリング

```typescript
describe("VectorSearchStrategy Error Handling", () => {
  it("should return error when embedding generation fails", async () => {
    // Arrange
    const mockProvider = {
      embed: vi.fn().mockRejectedValue(new Error("API connection failed")),
      // ... other methods
    };
    const strategy = new VectorSearchStrategy(db, mockProvider);

    // Act
    const result = await strategy.search("test query", 10);

    // Assert
    expect(result.isErr()).toBe(true);
    expect(result.error.message).toContain("Failed to generate embedding");
  });
});
```

**検証ポイント**:

- [ ] Result.err()が返される
- [ ] エラーメッセージが適切
- [ ] 例外がスローされない

---

### 2.3 異常系シナリオ: DB接続エラー

**シナリオ名**: データベース障害時のエラーハンドリング

```typescript
describe("VectorSearchStrategy Database Error", () => {
  it("should return error when database connection fails", async () => {
    // Arrange
    const mockDb = {
      all: vi.fn().mockRejectedValue(new Error("Connection refused")),
    };
    const strategy = new VectorSearchStrategy(mockDb, embeddingProvider);

    // Act
    const result = await strategy.search("test query", 10);

    // Assert
    expect(result.isErr()).toBe(true);
    expect(result.error.message).toContain("Database error");
  });
});
```

**検証ポイント**:

- [ ] Result.err()が返される
- [ ] エラータイプがDatabaseError
- [ ] retriableフラグが適切に設定

---

## 3. モック/スタブ戦略

### 3.1 IEmbeddingProviderモック

```typescript
const createMockEmbeddingProvider = (
  overrides?: Partial<IEmbeddingProvider>,
): IEmbeddingProvider => ({
  modelId: "test-model" as EmbeddingModelId,
  providerName: "test" as ProviderName,
  dimensions: 1536,
  maxTokens: 8192,
  embed: vi.fn().mockResolvedValue({
    embedding: new Array(1536).fill(0.1),
    tokenCount: 10,
  }),
  embedBatch: vi.fn(),
  countTokens: vi.fn().mockReturnValue(10),
  healthCheck: vi.fn().mockResolvedValue(true),
  ...overrides,
});
```

### 3.2 LibSQLDatabaseモック

```typescript
const createMockDb = (): LibSQLDatabase<Record<string, never>> => ({
  all: vi.fn().mockResolvedValue([
    {
      embedding_id: "emb-1",
      chunk_id: "chunk-1",
      content: "Test content",
      contextual_content: null,
      distance: 0.2,
    },
  ]),
  // ... other methods as needed
});
```

### 3.3 テストデータファクトリ

```typescript
const createTestVectorSearchResult = (
  overrides?: Partial<VectorSearchResult>,
): VectorSearchResult => ({
  embeddingId: "emb-test",
  chunkId: "chunk-test",
  content: "Test chunk content",
  contextualContent: null,
  distance: 0.3,
  similarity: 0.85,
  ...overrides,
});
```

---

## 4. 統合テストマトリクス

| ID    | カテゴリ       | シナリオ                     | 優先度 | Phase   |
| ----- | -------------- | ---------------------------- | ------ | ------- |
| IT-01 | E2E正常系      | 埋め込み→検索→結果取得       | 高     | Phase 6 |
| IT-02 | エラー処理     | 埋め込み生成失敗             | 高     | Phase 6 |
| IT-03 | エラー処理     | DB接続エラー                 | 高     | Phase 6 |
| IT-04 | フィルター     | fileIdsフィルター適用        | 中     | Phase 6 |
| IT-05 | フィルター     | minRelevance閾値適用         | 中     | Phase 6 |
| IT-06 | パフォーマンス | 100ms以下で結果返却          | 中     | Phase 7 |
| IT-07 | キャッシュ     | 同一クエリのキャッシュヒット | 中     | Phase 6 |
| IT-08 | 境界値         | limit=1, limit=100           | 低     | Phase 6 |
| IT-09 | 空結果         | マッチなし時の動作           | 低     | Phase 6 |

---

## 5. テスト環境要件

### 5.1 テストデータベース

- インメモリlibSQL使用
- テストごとにクリーンアップ
- 事前にembeddings/chunksテーブルにテストデータ投入

### 5.2 モックサーバー不要

- IEmbeddingProviderはモックで代替
- 実際のAPI呼び出しなし

### 5.3 テスト分離

- 各テストは独立して実行可能
- 共有状態なし

---

## まとめ

| カテゴリ       | テストケース数 | 優先度 |
| -------------- | -------------- | ------ |
| E2E正常系      | 1              | 高     |
| エラー処理     | 2              | 高     |
| フィルター     | 2              | 中     |
| パフォーマンス | 1              | 中     |
| キャッシュ     | 1              | 中     |
| 境界値・その他 | 2              | 低     |
| **合計**       | **9**          | -      |
