# HybridRAG統合 - 統合テスト設計書

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | CONV-07-07    |
| タスク名   | HybridRAG統合 |
| Phase      | 4             |
| 作成日     | 2026-01-17    |
| ステータス | 完了          |

---

## 1. 統合テスト概要

### 1.1 目的

HybridRAGEngineの4ステージパイプラインが、各コンポーネント間で正しく連携することを検証する。

### 1.2 テスト範囲

| コンポーネント         | 役割                 | テスト対象 |
| ---------------------- | -------------------- | ---------- |
| QueryClassifier        | クエリ分類・重み決定 | Yes        |
| KeywordSearchStrategy  | キーワード検索       | Yes        |
| SemanticSearchStrategy | ベクトル検索         | Yes        |
| GraphSearchStrategy    | グラフ検索           | Yes        |
| RRFFusion              | 検索結果統合         | Yes        |
| IReranker              | 再ランキング         | Yes        |
| CorrectiveRAG          | 結果評価・補正       | Yes        |

---

## 2. 統合テストシナリオ

### 2.1 パイプライン連携シナリオ

#### シナリオ1: 4ステージパイプライン（CRAG無効）

```
Query → QueryClassification → TripleSearch (並列) → RRFFusion → Reranking → Response
```

**検証項目**:

- QueryClassifierが呼び出される
- 3検索戦略が並列実行される
- RRFFusionがMap<string, SearchResult[]>を受け取る
- Rerankerが FusedSearchResult[]を受け取り、リランク済み結果を返す
- レスポンスにqueryType, searchWeights, pipelineStagesが含まれる

#### シナリオ2: 5ステージパイプライン（CRAG有効）

```
Query → QueryClassification → TripleSearch (並列) → RRFFusion → Reranking → CRAG → Response
```

**検証項目**:

- 上記シナリオ1の検証項目に加えて:
- CRAGが呼び出される
- レスポンスにcragActionが含まれる
- 必要に応じてaugmentedContextが含まれる

---

### 2.2 部分失敗フォールバックシナリオ

#### シナリオ3: 検索戦略の部分失敗

| ケース | 失敗する戦略       | 期待結果                  |
| ------ | ------------------ | ------------------------- |
| 3a     | Keyword            | Semantic + Graph で継続   |
| 3b     | Semantic           | Keyword + Graph で継続    |
| 3c     | Graph              | Keyword + Semantic で継続 |
| 3d     | Keyword + Semantic | Graph のみで継続          |
| 3e     | Keyword + Graph    | Semantic のみで継続       |
| 3f     | Semantic + Graph   | Keyword のみで継続        |

**検証項目**:

- 少なくとも1つの検索戦略が成功すれば、パイプラインが継続する
- 成功した戦略の結果のみがFusionに渡される

#### シナリオ4: Rerankingの失敗

```
TripleSearch → Fusion → Reranking(失敗) → フォールバック(Fusion結果) → Response
```

**検証項目**:

- Reranking失敗時、Fusion結果がそのまま使用される
- rerankedScoreは設定されない
- パイプラインは成功として完了する

#### シナリオ5: CRAGの失敗

```
Reranking → CRAG(失敗) → フォールバック(Reranking結果) → Response
```

**検証項目**:

- CRAG失敗時、Reranking結果がそのまま使用される
- cragActionはメタデータに含まれない
- パイプラインは成功として完了する

---

### 2.3 全失敗シナリオ

#### シナリオ6: 全検索戦略の失敗

```
TripleSearch(全失敗) → エラー
```

**検証項目**:

- `All search strategies failed`エラーが返される
- Fusionは呼び出されない

#### シナリオ7: QueryClassificationの失敗

```
QueryClassification(失敗) → 即座にエラー
```

**検証項目**:

- QueryClassifier失敗時、検索戦略は実行されない
- 適切なエラーが返される

---

### 2.4 CRAGアクションシナリオ

#### シナリオ8: CRAG action=correct

**条件**: 検索結果が十分に関連性が高い

**検証項目**:

- 結果は補正されずそのまま返される
- cragAction: "correct"がメタデータに含まれる
- augmentedContextは含まれない

#### シナリオ9: CRAG action=incorrect

**条件**: 検索結果が関連性が低い

**検証項目**:

- Web検索で結果が補強される
- cragAction: "incorrect"がメタデータに含まれる
- augmentedContextが含まれる

#### シナリオ10: CRAG action=ambiguous

**条件**: 検索結果の関連性が曖昧

**検証項目**:

- 結果がフィルタリングされる
- cragAction: "ambiguous"がメタデータに含まれる
- 低関連性の結果が除外される

---

## 3. データフロー検証

### 3.1 型変換フロー

```
[Stage 1: QueryClassification]
  Input:  query: string
  Output: { queryType: QueryType, weights: SearchWeights }

[Stage 2: TripleSearch]
  Input:  query: string, limit: number, filters?: SearchFilters
  Output: Map<"keyword" | "semantic" | "graph", SearchResult[]>

[Stage 3a: RRFFusion]
  Input:  Map<string, SearchResult[]>, weights: SearchWeights
  Output: FusedSearchResult[]

[Stage 3b: Reranking]
  Input:  query: string, FusedSearchResult[], limit: number
  Output: FusedSearchResult[] (with rerankedScore)

[Stage 4: CRAG]
  Input:  query: string, FusedSearchResult[]
  Output: CRAGResult { results, evaluation, augmentedContext? }

[Final Mapping]
  Input:  FusedSearchResult[]
  Output: HybridRAGResult[]
```

### 3.2 重複チャンク処理

**シナリオ**: 同一チャンクが複数の検索戦略から返された場合

```
Keyword:  [chunk-A (rank=1), chunk-B (rank=2), chunk-C (rank=3)]
Semantic: [chunk-A (rank=2), chunk-D (rank=1), chunk-E (rank=3)]
Graph:    [chunk-A (rank=1), chunk-F (rank=2), chunk-G (rank=3)]
```

**期待結果**:

```
Fused: [
  { chunkId: "chunk-A", sources: [
      { strategy: "keyword", rank: 1, score: 0.9 },
      { strategy: "semantic", rank: 2, score: 0.8 },
      { strategy: "graph", rank: 1, score: 0.85 }
    ]
  },
  ...
]
```

---

## 4. パフォーマンステスト設計

### 4.1 並列実行効果測定

**テスト内容**: 3検索戦略の並列実行による時間短縮を検証

**テスト方法**:

```typescript
// 各戦略に異なる遅延を設定
const mockKeyword: delay 50ms
const mockSemantic: delay 30ms
const mockGraph: delay 40ms

// 並列実行時の合計時間
const elapsed = measure(engine.search(...))

// 期待: elapsed < 50ms * 3 = 150ms
expect(elapsed).toBeLessThan(150)
```

### 4.2 レイテンシ目標

| ステージ         | 目標     | 測定方法                                        |
| ---------------- | -------- | ----------------------------------------------- |
| 全体（CRAG無効） | < 500ms  | totalDuration                                   |
| 全体（CRAG有効） | < 1000ms | totalDuration                                   |
| Stage 1          | < 200ms  | pipelineStages["query_classification"].duration |
| Stage 2          | < 200ms  | pipelineStages["triple_search"].duration        |
| Stage 3a         | < 10ms   | pipelineStages["rrf_fusion"].duration           |
| Stage 3b         | < 200ms  | pipelineStages["reranking"].duration            |
| Stage 4          | < 300ms  | pipelineStages["crag"].duration                 |

---

## 5. テストファイル構成

```
packages/shared/src/services/search/__tests__/
├── hybrid-rag-engine.test.ts           # ユニットテスト
├── hybrid-rag-engine.integration.test.ts # 統合テスト
└── (future) hybrid-rag-engine.perf.test.ts # パフォーマンステスト
```

---

## 6. 変更履歴

| 日付       | 版  | 変更内容 |
| ---------- | --- | -------- |
| 2026-01-17 | 1.0 | 初版作成 |
