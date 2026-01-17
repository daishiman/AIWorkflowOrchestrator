# HybridRAG統合 - アーキテクチャ設計書

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | CONV-07-07    |
| タスク名   | HybridRAG統合 |
| Phase      | 2             |
| 作成日     | 2026-01-17    |
| ステータス | 完了          |

---

## 1. パイプラインアーキテクチャ

### 1.1 全体構造

```
┌─────────────────────────────────────────────────────────────────┐
│                    HybridRAGEngine                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                            │
│  │ Stage 1         │                                            │
│  │ Query           │ ──→ queryType, weights                     │
│  │ Classification  │                                            │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────┐                    │
│  │ Stage 2: Triple Search (並列実行)        │                    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │                    │
│  │  │ Keyword │ │ Semantic│ │  Graph  │   │                    │
│  │  │  FTS5   │ │ DiskANN │ │  KG     │   │                    │
│  │  └────┬────┘ └────┬────┘ └────┬────┘   │                    │
│  │       │           │           │        │                    │
│  └───────┴───────────┴───────────┴────────┘                    │
│                      │                                          │
│                      ▼                                          │
│  ┌─────────────────┐                                            │
│  │ Stage 3a        │                                            │
│  │ RRF Fusion      │ ──→ fusedResults                           │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │ Stage 3b        │                                            │
│  │ Reranking       │ ──→ rerankedResults                        │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │ Stage 4 (Opt)   │                                            │
│  │ CRAG            │ ──→ correctedResults + augmentedContext    │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│      HybridRAGResponse                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 各ステージの詳細

#### Stage 1: Query Classification

| 項目         | 詳細                                               |
| ------------ | -------------------------------------------------- |
| 入力         | `query: string`                                    |
| 出力         | `{ queryType: QueryType, weights: SearchWeights }` |
| 責務         | クエリを分類し、検索戦略の重みを決定               |
| 依存         | `QueryClassifier`                                  |
| 実行時間目標 | < 50ms（ルールベース）, < 200ms（LLMベース）       |

#### Stage 2: Triple Search

| 項目         | 詳細                                                               |
| ------------ | ------------------------------------------------------------------ |
| 入力         | `query, searchLimit, filters, options`                             |
| 出力         | `Map<strategy, SearchResultItem[]>`                                |
| 責務         | 3種類の検索を並列実行                                              |
| 依存         | `KeywordSearchStrategy, VectorSearchStrategy, GraphSearchStrategy` |
| 実行時間目標 | < 200ms（並列実行）                                                |

**並列実行戦略**:

```typescript
Promise.all([
  keywordStrategy.search(query, searchLimit, filters),
  semanticStrategy.search(query, searchLimit, filters, { threshold }),
  graphStrategy.search(query, searchLimit, filters, {
    queryType,
    traversalDepth,
  }),
]);
```

#### Stage 3a: RRF Fusion

| 項目         | 詳細                                                        |
| ------------ | ----------------------------------------------------------- |
| 入力         | `Map<strategy, SearchResultItem[]>, weights: SearchWeights` |
| 出力         | `FusedSearchResult[]`                                       |
| 責務         | RRFアルゴリズムで検索結果を統合                             |
| 依存         | `RRFFusion`                                                 |
| 実行時間目標 | < 10ms（インメモリ処理）                                    |

#### Stage 3b: Reranking

| 項目         | 詳細                                                         |
| ------------ | ------------------------------------------------------------ |
| 入力         | `query: string, results: FusedSearchResult[], limit: number` |
| 出力         | `FusedSearchResult[]`（再ランキング済み）                    |
| 責務         | Cross-encoderによる再ランキング                              |
| 依存         | `IReranker` (CohereReranker, LLMReranker, NoOpReranker)      |
| 実行時間目標 | < 200ms（10件リランク時）                                    |

#### Stage 4: CRAG (Optional)

| 項目         | 詳細                                                   |
| ------------ | ------------------------------------------------------ |
| 入力         | `query: string, results: FusedSearchResult[]`          |
| 出力         | `CRAGResult { results, evaluation, augmentedContext }` |
| 責務         | 関連性評価、結果補正、Web検索による補強                |
| 依存         | `CorrectiveRAG`                                        |
| 実行時間目標 | < 300ms（評価+補正）                                   |
| 有効化条件   | `crag !== null && options.enableCRAG !== false`        |

---

## 2. エラーハンドリング戦略

### 2.1 エラー分類

| エラー種別     | 発生箇所                    | 重要度 |
| -------------- | --------------------------- | ------ |
| 致命的エラー   | Stage 1失敗                 | High   |
| 部分的エラー   | Stage 2の一部検索戦略が失敗 | Low    |
| 回復可能エラー | Stage 3b/4の失敗            | Low    |

### 2.2 ステージ別エラーハンドリング

#### Stage 1: Query Classification 失敗時

```typescript
if (!classificationResult.success) {
  return err(classificationResult.error); // 即座にエラーを返す
}
```

- **理由**: 検索重みが決定できないため、続行不可能

#### Stage 2: Triple Search 部分失敗時

```typescript
const resultSets = new Map<string, SearchResult[]>();

if (keywordResults.success) {
  resultSets.set("keyword", keywordResults.data);
}
if (semanticResults.success) {
  resultSets.set("semantic", semanticResults.data);
}
if (graphResults.success) {
  resultSets.set("graph", graphResults.data);
}

if (resultSets.size === 0) {
  return err(new Error("All search strategies failed"));
}
// 1つ以上成功していれば続行
```

- **理由**: 部分的な結果でも価値がある

#### Stage 3b: Reranking 失敗時

```typescript
const rerankedResults = rerankedResult.success
  ? rerankedResult.data
  : fusedResults.slice(0, rerankLimit); // フォールバック

if (!rerankedResult.success) {
  console.warn("Reranking failed, using fused results");
}
```

- **理由**: Rerankingなしでも検索結果は提供可能

#### Stage 4: CRAG 失敗時

```typescript
if (cragResult.success) {
  finalResults = cragResult.data.results;
  augmentedContext = cragResult.data.augmentedContext;
  cragAction = cragResult.data.evaluation.action;
} else {
  // rerankedResultsをそのまま使用
}
```

- **理由**: CRAGなしでも基本的な検索結果は提供可能

### 2.3 エラーフロー図

```
Stage 1 失敗 ──────────────────────────────→ エラーを返す
    │
    ▼ 成功
Stage 2 全て失敗 ─────────────────────────→ エラーを返す
    │
    ▼ 1つ以上成功
Stage 3a (RRF) ────────────────────────────→ 継続
    │
    ▼
Stage 3b 失敗 ─→ fusedResultsで続行 ──────→ 継続（警告ログ）
    │ 成功
    ▼
Stage 4 失敗 ──→ rerankedResultsで続行 ──→ 成功（CRAGメタデータなし）
    │ 成功
    ▼
成功（完全版HybridRAGResponse）
```

---

## 3. パフォーマンス最適化設計

### 3.1 並列実行戦略

| 最適化項目        | 実装方法                                      |
| ----------------- | --------------------------------------------- |
| Triple Search並列 | `Promise.all()`で3検索戦略を並列実行          |
| 早期終了          | Stage 1失敗時は即座にエラーを返す             |
| 結果数制御        | `searchLimitMultiplier`で各戦略の取得数を調整 |

### 3.2 検索結果数の最適化

```typescript
private calculateSearchLimit(
  finalLimit: number,
  options?: SearchOptions
): number {
  const multiplier = options?.searchLimitMultiplier ?? 3;
  return Math.ceil(finalLimit * multiplier);
}
```

| パラメータ              | デフォルト値 | 説明                           |
| ----------------------- | ------------ | ------------------------------ |
| `searchLimitMultiplier` | 3            | 最終結果数に対する倍率         |
| CRAG有効時のrerankLimit | `limit * 2`  | CRAGでフィルタされる可能性考慮 |

### 3.3 レイテンシ目標

| メトリクス       | 目標値   | 備考             |
| ---------------- | -------- | ---------------- |
| 全体（CRAG無効） | < 500ms  | Stage 1-3bの合計 |
| 全体（CRAG有効） | < 1000ms | Stage 1-4の合計  |
| Stage 1          | < 200ms  | LLMベースの場合  |
| Stage 2          | < 200ms  | 並列実行         |
| Stage 3a         | < 10ms   | インメモリ処理   |
| Stage 3b         | < 200ms  | 10件リランク時   |
| Stage 4          | < 300ms  | 評価+補正        |

### 3.4 メモリ使用量最適化

| 最適化項目     | 実装方法                                           |
| -------------- | -------------------------------------------------- |
| 結果数制限     | 各ステージで`limit`パラメータを適用                |
| 早期スライス   | 最終結果は`results.slice(0, limit)`で制限          |
| 中間結果の破棄 | ステージ完了後、中間データは参照されなくなりGC対象 |

---

## 4. データフロー設計

### 4.1 型変換フロー

```
SearchResultItem[] ──(Stage 2)──→
  ↓
Map<string, SearchResultItem[]> ──(Fusion)──→
  ↓
FusedSearchResult[] ──(Reranking)──→
  ↓
FusedSearchResult[] ──(CRAG)──→
  ↓
FusedSearchResult[] ──(Mapping)──→
  ↓
HybridRAGResult[]
```

### 4.2 最終マッピング

```typescript
const results: HybridRAGResult[] = finalResults.slice(0, limit).map((r) => ({
  chunkId: r.chunkId,
  content: r.content,
  score: r.rerankedScore ?? r.fusedScore,
  sources: r.sources,
  metadata: r.metadata,
}));
```

---

## 5. 拡張性設計

### 5.1 新しい検索戦略の追加

現在のインターフェースは3戦略に固定されているが、将来的な拡張を考慮:

```typescript
// 現在（Phase 5で実装）
searchStrategies: {
  keyword: ISearchStrategy;
  semantic: ISearchStrategy;
  graph: ISearchStrategy;
}

// 将来の拡張（参考）
// searchStrategies: Map<string, ISearchStrategy>
```

### 5.2 新しいRerankerの追加

`IReranker`インターフェースを実装すれば追加可能:

- 現在: CohereReranker, VoyageReranker, LLMReranker, NoOpReranker
- 将来: 新しいリランカー実装も同じインターフェースで追加可能

---

## 6. 変更履歴

| 日付       | 版  | 変更内容 |
| ---------- | --- | -------- |
| 2026-01-17 | 1.0 | 初版作成 |
