# Phase 1: 機能要件定義書

## 目的

VectorSearchStrategyが満たすべき機能要件と非機能要件を明確に定義する。

---

## 1. 機能要件

### FR-01: クエリテキストから埋め込み生成

**説明**: ユーザーの検索クエリテキストを受け取り、IEmbeddingProviderを使用して埋め込みベクトルを生成する。

**入力**:

- `queryText: string` - 検索クエリテキスト（1-1000文字）

**出力**:

- `Float32Array` - 埋め込みベクトル

**処理フロー**:

1. クエリテキストのバリデーション（長さ、空文字チェック）
2. IEmbeddingProvider.embed() を呼び出し
3. EmbeddingResult.embedding（number[]）を Float32Array に変換
4. エラー時は Result.err() を返す

---

### FR-02: libSQLベクトル検索でチャンク取得

**説明**: 生成された埋め込みベクトルを使用し、libSQLのDiskANNインデックスで類似チャンクを取得する。

**入力**:

- `queryVector: Float32Array` - クエリ埋め込みベクトル
- `limit: number` - 最大取得件数（デフォルト: 20）
- `filters: SearchFilters` - 検索フィルター

**出力**:

- `VectorSearchResult[]` - 類似度順にソートされた検索結果

**処理フロー**:

1. searchByVector() 関数を呼び出し
2. フィルター条件を適用（fileIds, minSimilarity）
3. 結果を類似度降順でソート

---

### FR-03: コサイン類似度スコア計算

**説明**: libSQLのvector_distance_cos()関数の結果を0-1の類似度スコアに変換する。

**計算式**:

```typescript
similarity = 1 - distance / 2;
```

**範囲**:
| 距離 | 類似度 | 意味 |
| -------- | ------ | -------- |
| 0.0 | 1.0 | 完全一致 |
| 1.0 | 0.5 | 直交 |
| 2.0 | 0.0 | 正反対 |

---

### FR-04: SearchResultItem形式への変換

**説明**: VectorSearchResultをSearchResultItem形式に変換する。

**変換マッピング**:

| VectorSearchResult | SearchResultItem          |
| ------------------ | ------------------------- |
| chunkId            | id, sources.chunkId       |
| similarity         | score, relevance.semantic |
| content            | content.text              |
| contextualContent  | content.summary           |
| -                  | type = "chunk"            |

**RelevanceScore設定**:

```typescript
relevance: {
  combined: similarity,
  semantic: similarity,
  keyword: 0,
  graph: 0,
  rerank: null,
  crag: null
}
```

---

### FR-05: フィルター条件の適用

**説明**: SearchFiltersに基づいて検索結果をフィルタリングする。

| フィルター   | サポート状況 | 実装方法                   |
| ------------ | ------------ | -------------------------- |
| fileIds      | 対応         | WHERE c.file_id IN (...)   |
| entityTypes  | 未対応       | Phase 2で検討              |
| dateRange    | 未対応       | Phase 2で検討              |
| minRelevance | 対応         | similarity >= minRelevance |

---

### FR-06: 閾値によるフィルタリング

**説明**: 最小類似度閾値未満の結果を除外する。

**デフォルト閾値**: 0.0（フィルタなし）

**実装**:

```typescript
results.filter((r) => r.similarity >= minRelevance);
```

---

### FR-07: 結果の類似度順ソート

**説明**: 検索結果を類似度の降順（高い順）でソートする。

**ソート順**:

1. 類似度降順（similarity DESC）
2. 同点時はchunkId昇順（安定ソート）

---

## 2. 非機能要件

### NFR-01: パフォーマンス

| データ規模     | 目標レスポンス時間 | 備考                    |
| -------------- | ------------------ | ----------------------- |
| < 10,000件     | < 50ms             | インデックス不要        |
| 10,000-100,000 | < 100ms            | DiskANNインデックス推奨 |
| > 100,000件    | < 200ms            | DiskANNインデックス必須 |

**埋め込み生成時間は別途計上**:

- API呼び出し: 100-500ms
- キャッシュヒット時: < 10ms

---

### NFR-02: エラーハンドリング

**Result<T, Error>パターン**を使用:

| エラー種別       | 対応方法                    |
| ---------------- | --------------------------- |
| 埋め込み生成失敗 | Result.err(EmbeddingError)  |
| DB接続エラー     | Result.err(DatabaseError)   |
| タイムアウト     | Result.err(TimeoutError)    |
| バリデーション   | Result.err(ValidationError) |

---

### NFR-03: 型安全性

- TypeScript strictモード準拠
- Branded Types使用（ChunkId, FileId等）
- Zodスキーマによる実行時バリデーション

---

### NFR-04: テスタビリティ

- 依存関係の注入（IEmbeddingProvider, LibSQLDatabase）
- モック可能なインターフェース設計
- 純粋関数による変換ロジック

---

### NFR-05: 拡張性

- CachedVectorSearchStrategy による埋め込みキャッシュ対応
- カスタム距離メトリクス対応（cosine, l2, dot）
- 将来的なfilter拡張（entityTypes, dateRange）

---

## 3. 統合テスト連携要件

### データフロー定義

```
クエリテキスト
    │
    ▼
IEmbeddingProvider.embed()
    │
    ├── 成功: EmbeddingResult
    │       │
    │       ▼
    │   Float32Array変換
    │       │
    │       ▼
    │   searchByVector()
    │       │
    │       ├── 成功: VectorSearchResult[]
    │       │       │
    │       │       ▼
    │       │   SearchResultItem[]変換
    │       │       │
    │       │       ▼
    │       │   Result.ok(SearchResult)
    │       │
    │       └── 失敗: Result.err(DatabaseError)
    │
    └── 失敗: Result.err(EmbeddingError)
```

### API障害時の動作

1. **IEmbeddingProvider障害**:
   - タイムアウト: 30秒後にエラー返却
   - APIエラー: リトライ後にエラー返却
   - 回復: 次回リクエストで自動再試行

2. **データベース障害**:
   - 接続エラー: 即時エラー返却
   - クエリタイムアウト: 10秒後にエラー返却

---

## 4. 制約事項

| 制約                 | 値       | 理由                   |
| -------------------- | -------- | ---------------------- |
| クエリテキスト最大長 | 1000文字 | トークン数制限         |
| 最大取得件数         | 100件    | メモリ・パフォーマンス |
| ベクトル次元数       | 512-4096 | サポートモデル範囲     |
| 類似度スコア範囲     | 0.0-1.0  | 正規化済み             |

---

## まとめ

| 要件ID | 要件名               | 優先度 | 状態   |
| ------ | -------------------- | ------ | ------ |
| FR-01  | 埋め込み生成         | 必須   | 未実装 |
| FR-02  | ベクトル検索         | 必須   | 未実装 |
| FR-03  | 類似度計算           | 必須   | 未実装 |
| FR-04  | SearchResultItem変換 | 必須   | 未実装 |
| FR-05  | フィルター適用       | 必須   | 未実装 |
| FR-06  | 閾値フィルタリング   | 必須   | 未実装 |
| FR-07  | 類似度ソート         | 必須   | 未実装 |
| NFR-01 | パフォーマンス       | 高     | 未実装 |
| NFR-02 | エラーハンドリング   | 高     | 未実装 |
| NFR-03 | 型安全性             | 高     | 未実装 |
| NFR-04 | テスタビリティ       | 中     | 未実装 |
| NFR-05 | 拡張性               | 中     | 未実装 |
