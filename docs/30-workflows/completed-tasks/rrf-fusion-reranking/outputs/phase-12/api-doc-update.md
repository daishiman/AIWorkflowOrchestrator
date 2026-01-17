# Phase 12: API/インターフェースドキュメント更新記録

## 実行日時

2026-01-14

## 更新対象ドキュメント

| #   | ドキュメント               | 更新内容                      | 状態 |
| --- | -------------------------- | ----------------------------- | ---- |
| 1   | `interfaces-rag-search.md` | FusedSearchResult型の追加     | 完了 |
| 2   | `interfaces-rag-search.md` | IRerankerインターフェース追加 | 完了 |
| 3   | `architecture-rag.md`      | Fusion/Rerankingフロー追加    | 完了 |

## 追加された型定義

### FusedSearchResult

```typescript
/**
 * Fusion処理後の検索結果
 * 複数の検索戦略から統合されたスコアを持つ
 */
interface FusedSearchResult extends SearchChunkResult {
  /** 0-1に正規化されたFusionスコア */
  fusedScore: number;
  /** Reranker適用後のスコア（オプション） */
  rerankedScore?: number;
  /** この結果を返した検索戦略のソース情報 */
  sources: SourceInfo[];
}

interface SourceInfo {
  /** 検索戦略名 (keyword | semantic | graph) */
  strategy: string;
  /** 元の戦略での順位 */
  rank: number;
  /** 元の戦略でのスコア */
  score: number;
}
```

### IFusionStrategy

```typescript
/**
 * 検索結果統合戦略のインターフェース
 */
interface IFusionStrategy {
  /**
   * 複数の検索結果リストを統合する
   * @param results - 各検索戦略からの結果配列
   * @param limit - 返す結果の最大数
   * @returns 統合された検索結果
   */
  fuse(results: SearchChunkResult[][], limit: number): FusedSearchResult[];
}
```

### IReranker

```typescript
/**
 * 検索結果リランキングのインターフェース
 */
interface IReranker {
  /**
   * 検索結果をクエリとの関連性でリランキングする
   * @param query - 検索クエリ
   * @param chunks - リランキング対象の検索結果
   * @param limit - 返す結果の最大数
   * @returns リランキングされた結果（Result型でラップ）
   */
  rerank(
    query: string,
    chunks: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}
```

## アーキテクチャ図更新

```
┌─────────────────────────────────────────────────────────────────┐
│                     Search Query                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Search Strategy Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Keyword   │  │  Semantic   │  │    Graph    │              │
│  │   Search    │  │   Search    │  │   Search    │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Fusion Layer                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  RRFFusion                              │    │
│  │  - Reciprocal Rank Fusion アルゴリズム                  │    │
│  │  - 重複チャンクのマージ                                 │    │
│  │  - fusedScore計算（0-1正規化）                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Reranking Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    LLM      │  │   Cohere    │  │   Voyage    │              │
│  │  Reranker   │  │  Reranker   │  │  Reranker   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  NoOpReranker (Fallback)                │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Final Results                               │
│  - rerankedScoreでソート                                        │
│  - 上位N件を返却                                                │
└─────────────────────────────────────────────────────────────────┘
```

## 更新内容詳細

### interfaces-rag-search.md への追加

1. **FusedSearchResult型**: 統合された検索結果の型定義
2. **SourceInfo型**: 検索ソース情報の型定義
3. **IFusionStrategy**: Fusion戦略インターフェース
4. **IReranker**: Rerankerインターフェース
5. **RerankerType**: Reranker種別の列挙型

### architecture-rag.md への追加

1. **Fusion Layer**: RRF Fusionの概念と処理フロー
2. **Reranking Layer**: 各Rerankerの役割と選択基準
3. **データフロー図**: 検索からFusion、Rerankingまでの流れ
4. **フォールバック戦略**: エラー時の動作

## 判定結果

**PASS**: API/インターフェースドキュメント更新完了

## 次のステップ

実装ガイド作成（タスク2）へ進む
