# Phase 12: 使用例ドキュメント作成記録

## 実行日時

2026-01-14

## 作成ドキュメント

`references/usage-examples-fusion-reranking.md`

## 使用例一覧

| #   | 使用例                     | 内容                   | 状態 |
| --- | -------------------------- | ---------------------- | ---- |
| 1   | 基本的なFusion             | 3戦略の結果統合        | 完了 |
| 2   | 重み調整                   | semantic重視の設定例   | 完了 |
| 3   | Reranker選択               | 各Rerankerの使い分け   | 完了 |
| 4   | フォールバック設定         | 障害時の動作設定       | 完了 |
| 5   | パフォーマンスチューニング | 大量データ処理の最適化 | 完了 |

## 使用例概要

### 例1: 基本的なFusion

```typescript
import { RRFFusion } from "@repo/shared/services/search/fusion/rrf-fusion";

// RRF Fusionインスタンスを作成（k=60がデフォルト）
const fusion = new RRFFusion();

// 3つの検索戦略からの結果
const keywordResults = await keywordSearch(query);
const semanticResults = await semanticSearch(query);
const graphResults = await graphSearch(query);

// 結果を統合
const fusedResults = fusion.fuse(
  [keywordResults, semanticResults, graphResults],
  20, // 上位20件を取得
);
```

### 例2: 重み調整（WeightedScoreFusion）

```typescript
import { WeightedScoreFusion } from "@repo/shared/services/search/fusion/rrf-fusion";

// Semantic検索を重視する設定
const fusion = new WeightedScoreFusion([
  { strategy: "keyword", weight: 0.2 },
  { strategy: "semantic", weight: 0.6 },
  { strategy: "graph", weight: 0.2 },
]);

const fusedResults = fusion.fuse(results, 20);
```

### 例3: Reranker選択

```typescript
// ユースケース別Reranker選択ガイド
//
// 1. CohereReranker - 多言語対応、高精度
//    用途: 多言語コンテンツ、高精度が必要な場合
//
// 2. VoyageReranker - 高速、コスト効率
//    用途: 大量処理、コスト重視
//
// 3. LLMReranker - カスタマイズ可能
//    用途: 特殊なランキング基準が必要な場合
//
// 4. NoOpReranker - フォールバック用
//    用途: API障害時、テスト時

import { CohereReranker } from "@repo/shared/services/search/reranking";

const reranker = new CohereReranker({
  apiKey: process.env.COHERE_API_KEY!,
  model: "rerank-multilingual-v3.0",
});

const result = await reranker.rerank(query, fusedResults, 10);
if (result.ok) {
  return result.value;
} else {
  // フォールバック処理
  return fusedResults.slice(0, 10);
}
```

### 例4: フォールバック設定

```typescript
import { createRerankerWithFallback } from "@repo/shared/services/search/reranking";

// フォールバックチェーン: Cohere -> Voyage -> NoOp
const reranker = createRerankerWithFallback([
  new CohereReranker({ apiKey: cohereKey }),
  new VoyageReranker({ apiKey: voyageKey }),
  new NoOpReranker(),
]);

// いずれかが成功するまで試行
const results = await reranker.rerank(query, chunks, limit);
```

### 例5: パフォーマンスチューニング

```typescript
// 大量データ処理の最適化設定

// 1. Fusion段階で絞り込み
const fusedResults = fusion.fuse(results, 50); // 上位50件に絞る

// 2. Reranking対象を制限
const rerankedResults = await reranker.rerank(
  query,
  fusedResults.slice(0, 30), // Rerankingは上位30件のみ
  10, // 最終結果は10件
);

// 3. バッチ処理（LLMRerankerの場合）
const llmReranker = new LLMReranker({
  batchSize: 10, // 10件ずつ処理
  maxConcurrency: 3, // 並列度3
});
```

## 判定結果

**PASS**: 使用例ドキュメント作成完了

## 次のステップ

JSDocコメント確認（タスク4）へ進む
