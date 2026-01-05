# RRF Fusion + Reranking - タスク指示書

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | CONV-07-05                                         |
| タスク名     | RRF Fusion + Reranking                             |
| 親タスク     | CONV-07 (HybridRAG検索エンジン)                    |
| 依存タスク   | CONV-07-02, CONV-07-03, CONV-07-04 (3つの検索戦略) |
| 規模         | 中                                                 |
| 見積もり工数 | 0.5日                                              |
| ステータス   | 未実施                                             |

---

## 1. 目的

3つの検索戦略（キーワード・ベクトル・グラフ）の結果をReciprocal Rank Fusion (RRF)で統合し、Cross-Encoder Rerankingで最終順位を決定する。

---

## 2. 成果物

- `packages/shared/src/services/search/fusion/rrf-fusion.ts`
- `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts`
- `packages/shared/src/services/search/reranking/__tests__/reranker.test.ts`

---

## 3. 入力

- 3つの検索戦略からの結果セット
- クエリ文字列
- 各検索戦略の重み（Query Classifierから）
- リランキングオプション

---

## 4. 出力

統合・リランキング済みの検索結果

```typescript
export interface FusedSearchResult {
  chunkId: ChunkId;
  content: string;
  fusedScore: number;
  rerankedScore?: number;
  sources: Array<{
    strategy: "keyword" | "semantic" | "graph";
    rank: number;
    score: number;
  }>;
  metadata: Record<string, unknown>;
}
```

---

## 5. 実装仕様

### 5.1 RRF Fusion

```typescript
// packages/shared/src/services/search/fusion/rrf-fusion.ts
import type { SearchResult } from "../types";
import type { SearchWeights } from "../query-classifier";

/**
 * Reciprocal Rank Fusion (RRF) による検索結果統合
 *
 * RRFスコア計算式:
 * score(d) = Σ (weight_i / (k + rank_i(d)))
 *
 * 参考: https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
 */
export class RRFFusion {
  /**
   * RRFのkパラメータ（デフォルト: 60）
   * 大きいほどランキング差の影響が緩和される
   */
  private readonly k: number;

  constructor(k: number = 60) {
    this.k = k;
  }

  /**
   * 複数の検索結果をRRFで統合
   */
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[] {
    // 1. 各ドキュメントのRRFスコアを計算
    const scoreMap = new Map<
      string,
      {
        chunkId: ChunkId;
        content: string;
        rrfScore: number;
        sources: Array<{ strategy: string; rank: number; score: number }>;
        metadata: Record<string, unknown>;
      }
    >();

    // 2. 各検索戦略の結果を処理
    for (const [strategy, results] of resultSets) {
      const weight = this.getWeight(strategy, weights);

      results.forEach((result, index) => {
        const rank = index + 1; // 1-indexed
        const rrfContribution = weight / (this.k + rank);

        const existing = scoreMap.get(result.chunkId);
        if (existing) {
          existing.rrfScore += rrfContribution;
          existing.sources.push({
            strategy,
            rank,
            score: result.score,
          });
          // メタデータをマージ
          existing.metadata = { ...existing.metadata, ...result.metadata };
        } else {
          scoreMap.set(result.chunkId, {
            chunkId: result.chunkId,
            content: result.content,
            rrfScore: rrfContribution,
            sources: [{ strategy, rank, score: result.score }],
            metadata: result.metadata,
          });
        }
      });
    }

    // 3. RRFスコアでソートして返す
    const fused = Array.from(scoreMap.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .map((item) => ({
        chunkId: item.chunkId,
        content: item.content,
        fusedScore: this.normalizeScore(item.rrfScore),
        sources: item.sources as FusedSearchResult["sources"],
        metadata: item.metadata,
      }));

    return fused;
  }

  /**
   * 戦略名から重みを取得
   */
  private getWeight(strategy: string, weights: SearchWeights): number {
    switch (strategy) {
      case "keyword":
        return weights.keyword;
      case "semantic":
        return weights.semantic;
      case "graph":
        return weights.graph;
      default:
        return 1;
    }
  }

  /**
   * RRFスコアを0-1に正規化
   */
  private normalizeScore(rrfScore: number): number {
    // 理論上の最大値: 3 * (1 / (k + 1)) when all strategies rank #1
    const theoreticalMax = 3 / (this.k + 1);
    return Math.min(1, rrfScore / theoreticalMax);
  }
}

/**
 * 重み付きスコア統合（RRFの代替）
 * 各検索戦略のスコアを直接重み付け平均
 */
export class WeightedScoreFusion {
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[] {
    const scoreMap = new Map<
      string,
      {
        chunkId: ChunkId;
        content: string;
        weightedScore: number;
        totalWeight: number;
        sources: Array<{ strategy: string; rank: number; score: number }>;
        metadata: Record<string, unknown>;
      }
    >();

    for (const [strategy, results] of resultSets) {
      const weight = this.getWeight(strategy, weights);

      results.forEach((result, index) => {
        const existing = scoreMap.get(result.chunkId);
        if (existing) {
          existing.weightedScore += result.score * weight;
          existing.totalWeight += weight;
          existing.sources.push({
            strategy,
            rank: index + 1,
            score: result.score,
          });
          existing.metadata = { ...existing.metadata, ...result.metadata };
        } else {
          scoreMap.set(result.chunkId, {
            chunkId: result.chunkId,
            content: result.content,
            weightedScore: result.score * weight,
            totalWeight: weight,
            sources: [{ strategy, rank: index + 1, score: result.score }],
            metadata: result.metadata,
          });
        }
      });
    }

    return Array.from(scoreMap.values())
      .map((item) => ({
        chunkId: item.chunkId,
        content: item.content,
        fusedScore: item.weightedScore / item.totalWeight,
        sources: item.sources as FusedSearchResult["sources"],
        metadata: item.metadata,
      }))
      .sort((a, b) => b.fusedScore - a.fusedScore);
  }

  private getWeight(strategy: string, weights: SearchWeights): number {
    switch (strategy) {
      case "keyword":
        return weights.keyword;
      case "semantic":
        return weights.semantic;
      case "graph":
        return weights.graph;
      default:
        return 1;
    }
  }
}
```

### 5.2 Cross-Encoder Reranker

```typescript
// packages/shared/src/services/search/reranking/cross-encoder-reranker.ts
import type { FusedSearchResult } from "../fusion/rrf-fusion";
import { ok, err, type Result } from "@/types/result";

/**
 * Cross-Encoder Rerankerインターフェース
 */
export interface IReranker {
  rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}

/**
 * LLMベースのCross-Encoder Reranker
 * クエリと各候補の関連度を直接評価
 */
export class LLMReranker implements IReranker {
  constructor(
    private readonly llmClient: ILLMClient,
    private readonly options: RerankerOptions = {},
  ) {}

  async rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    if (candidates.length === 0) {
      return ok([]);
    }

    // 候補数が少ない場合はリランキングをスキップ
    if (candidates.length <= limit && !this.options.alwaysRerank) {
      return ok(candidates.slice(0, limit));
    }

    try {
      // バッチでスコアリング（効率化のため）
      const batchSize = this.options.batchSize ?? 10;
      const scoredCandidates: Array<
        FusedSearchResult & { rerankScore: number }
      > = [];

      for (let i = 0; i < candidates.length; i += batchSize) {
        const batch = candidates.slice(i, i + batchSize);
        const scores = await this.scoreBatch(query, batch);

        if (!scores.success) {
          // エラー時はフォールバック（fusedScoreをそのまま使用）
          console.warn("Reranking failed, using fused scores:", scores.error);
          return ok(candidates.slice(0, limit));
        }

        batch.forEach((candidate, idx) => {
          scoredCandidates.push({
            ...candidate,
            rerankScore: scores.data[idx],
          });
        });
      }

      // リランクスコアでソート
      scoredCandidates.sort((a, b) => b.rerankScore - a.rerankScore);

      // rerankedScoreを設定して返す
      return ok(
        scoredCandidates.slice(0, limit).map((c) => ({
          ...c,
          rerankedScore: c.rerankScore,
        })),
      );
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Reranking failed"),
      );
    }
  }

  /**
   * バッチでスコアリング
   */
  private async scoreBatch(
    query: string,
    candidates: FusedSearchResult[],
  ): Promise<Result<number[], Error>> {
    const prompt = this.buildScoringPrompt(query, candidates);

    const response = await this.llmClient.complete({
      prompt,
      maxTokens: 100,
      temperature: 0,
    });

    if (!response.success) {
      return err(response.error);
    }

    // レスポンスをパースしてスコアを抽出
    const scores = this.parseScores(response.data, candidates.length);
    return ok(scores);
  }

  /**
   * スコアリング用プロンプトを構築
   */
  private buildScoringPrompt(
    query: string,
    candidates: FusedSearchResult[],
  ): string {
    const candidateList = candidates
      .map(
        (c, i) =>
          `[${i + 1}] ${c.content.slice(0, 500)}${c.content.length > 500 ? "..." : ""}`,
      )
      .join("\n\n");

    return `Query: "${query}"

Rate the relevance of each document to the query on a scale of 0-10.
Return only the scores as a comma-separated list.

Documents:
${candidateList}

Scores (comma-separated, e.g., "8,5,9,3"):`;
  }

  /**
   * LLMレスポンスからスコアをパース
   */
  private parseScores(response: string, expectedCount: number): number[] {
    const scores = response
      .trim()
      .split(",")
      .map((s) => {
        const parsed = parseFloat(s.trim());
        return isNaN(parsed) ? 5 : Math.max(0, Math.min(10, parsed)) / 10;
      });

    // 不足分は中央値で埋める
    while (scores.length < expectedCount) {
      scores.push(0.5);
    }

    return scores.slice(0, expectedCount);
  }
}

/**
 * Cohere Rerank APIを使用したReranker
 */
export class CohereReranker implements IReranker {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = "rerank-multilingual-v3.0",
  ) {}

  async rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    if (candidates.length === 0) {
      return ok([]);
    }

    try {
      const response = await fetch("https://api.cohere.ai/v1/rerank", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          query,
          documents: candidates.map((c) => c.content),
          top_n: limit,
          return_documents: false,
        }),
      });

      if (!response.ok) {
        return err(new Error(`Cohere API error: ${response.status}`));
      }

      const data = (await response.json()) as CohereRerankResponse;

      // インデックスを使って結果を再構築
      const reranked = data.results.map((r) => ({
        ...candidates[r.index],
        rerankedScore: r.relevance_score,
      }));

      return ok(reranked);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Cohere rerank failed"),
      );
    }
  }
}

/**
 * Voyage AI Rerankerを使用
 */
export class VoyageReranker implements IReranker {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = "rerank-2",
  ) {}

  async rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    if (candidates.length === 0) {
      return ok([]);
    }

    try {
      const response = await fetch("https://api.voyageai.com/v1/rerank", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          query,
          documents: candidates.map((c) => c.content),
          top_k: limit,
        }),
      });

      if (!response.ok) {
        return err(new Error(`Voyage API error: ${response.status}`));
      }

      const data = (await response.json()) as VoyageRerankResponse;

      const reranked = data.data.map((r) => ({
        ...candidates[r.index],
        rerankedScore: r.relevance_score,
      }));

      return ok(reranked);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Voyage rerank failed"),
      );
    }
  }
}

/**
 * Rerankerなし（フォールバック用）
 */
export class NoOpReranker implements IReranker {
  async rerank(
    _query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    return ok(candidates.slice(0, limit));
  }
}

export interface RerankerOptions {
  /**
   * 常にリランキングを実行するか
   */
  alwaysRerank?: boolean;

  /**
   * バッチサイズ
   */
  batchSize?: number;
}

interface CohereRerankResponse {
  results: Array<{
    index: number;
    relevance_score: number;
  }>;
}

interface VoyageRerankResponse {
  data: Array<{
    index: number;
    relevance_score: number;
  }>;
}
```

---

## 6. テストケース

```typescript
describe("RRFFusion", () => {
  const createMockResults = (
    strategy: string,
    count: number,
  ): SearchResult[] => {
    return Array.from({ length: count }, (_, i) => ({
      chunkId: `chunk-${strategy}-${i}` as ChunkId,
      content: `Content ${strategy} ${i}`,
      score: 1 - i * 0.1,
      source: strategy as SearchResult["source"],
      metadata: {},
    }));
  };

  it("3つの検索結果を統合する", () => {
    const fusion = new RRFFusion();
    const resultSets = new Map([
      ["keyword", createMockResults("keyword", 5)],
      ["semantic", createMockResults("semantic", 5)],
      ["graph", createMockResults("graph", 5)],
    ]);
    const weights = { keyword: 0.33, semantic: 0.33, graph: 0.34 };

    const fused = fusion.fuse(resultSets, weights);

    expect(fused.length).toBeGreaterThan(0);
    expect(fused[0].fusedScore).toBeDefined();
  });

  it("重複するチャンクが正しく統合される", () => {
    const fusion = new RRFFusion();
    const sharedChunk = {
      chunkId: "shared-chunk" as ChunkId,
      content: "Shared content",
      score: 0.9,
      source: "keyword" as const,
      metadata: {},
    };

    const resultSets = new Map([
      ["keyword", [sharedChunk, ...createMockResults("keyword", 2)]],
      [
        "semantic",
        [
          { ...sharedChunk, source: "semantic" as const },
          ...createMockResults("semantic", 2),
        ],
      ],
    ]);
    const weights = { keyword: 0.5, semantic: 0.5, graph: 0 };

    const fused = fusion.fuse(resultSets, weights);

    // 共有チャンクは1回だけ出現し、両方のソースが記録される
    const sharedResult = fused.find((r) => r.chunkId === "shared-chunk");
    expect(sharedResult).toBeDefined();
    expect(sharedResult!.sources.length).toBe(2);
  });

  it("重みが正しく適用される", () => {
    const fusion = new RRFFusion();
    const resultSets = new Map([
      ["keyword", createMockResults("keyword", 3)],
      ["semantic", createMockResults("semantic", 3)],
      ["graph", createMockResults("graph", 3)],
    ]);

    // graphを重視
    const graphHeavyWeights = { keyword: 0.1, semantic: 0.1, graph: 0.8 };
    const graphHeavyFused = fusion.fuse(resultSets, graphHeavyWeights);

    // graphの1位がトップに来やすい
    const topSource = graphHeavyFused[0].sources.find((s) => s.rank === 1);
    expect(topSource?.strategy).toBe("graph");
  });

  it("fusedScoreが0-1の範囲", () => {
    const fusion = new RRFFusion();
    const resultSets = new Map([
      ["keyword", createMockResults("keyword", 10)],
      ["semantic", createMockResults("semantic", 10)],
      ["graph", createMockResults("graph", 10)],
    ]);
    const weights = { keyword: 0.33, semantic: 0.33, graph: 0.34 };

    const fused = fusion.fuse(resultSets, weights);

    for (const result of fused) {
      expect(result.fusedScore).toBeGreaterThanOrEqual(0);
      expect(result.fusedScore).toBeLessThanOrEqual(1);
    }
  });
});

describe("CohereReranker", () => {
  it("候補をリランキングする", async () => {
    const reranker = new CohereReranker("test-api-key");
    const candidates = createMockFusedResults(10);

    // Mock fetch
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            { index: 2, relevance_score: 0.95 },
            { index: 0, relevance_score: 0.85 },
            { index: 1, relevance_score: 0.75 },
          ],
        }),
    } as Response);

    const result = await reranker.rerank("test query", candidates, 3);

    expect(result.success).toBe(true);
    expect(result.data.length).toBe(3);
    expect(result.data[0].rerankedScore).toBe(0.95);
  });

  it("API エラー時にエラーを返す", async () => {
    const reranker = new CohereReranker("test-api-key");
    const candidates = createMockFusedResults(5);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const result = await reranker.rerank("test query", candidates, 3);

    expect(result.success).toBe(false);
  });
});

describe("LLMReranker", () => {
  it("バッチでスコアリングする", async () => {
    const mockLLM = {
      complete: vi.fn().mockResolvedValue(ok("8,7,9,6,5")),
    };
    const reranker = new LLMReranker(mockLLM as any, { batchSize: 5 });
    const candidates = createMockFusedResults(5);

    const result = await reranker.rerank("test query", candidates, 3);

    expect(result.success).toBe(true);
    expect(result.data.length).toBe(3);
    // 最高スコア(9/10=0.9)が1位
    expect(result.data[0].rerankedScore).toBe(0.9);
  });
});

describe("NoOpReranker", () => {
  it("順序を変えずにlimitを適用する", async () => {
    const reranker = new NoOpReranker();
    const candidates = createMockFusedResults(10);

    const result = await reranker.rerank("test query", candidates, 5);

    expect(result.success).toBe(true);
    expect(result.data.length).toBe(5);
    expect(result.data[0].chunkId).toBe(candidates[0].chunkId);
  });
});
```

---

## 7. 完了条件

- [ ] `RRFFusion`クラスが実装済み
- [ ] `WeightedScoreFusion`クラスが実装済み
- [ ] RRFスコア計算が正しく動作する
- [ ] 検索戦略の重みが正しく適用される
- [ ] 重複チャンクが正しく統合される
- [ ] `LLMReranker`が実装済み
- [ ] `CohereReranker`が実装済み
- [ ] `VoyageReranker`が実装済み
- [ ] リランキングのバッチ処理が動作する
- [ ] エラー時のフォールバックが動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-07-06: Corrective RAG (CRAG)

---

## 9. 参照情報

- CONV-07-01: Query Classifier（重み決定）
- CONV-07-02, 03, 04: 3つの検索戦略
- [RRF Paper](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)
- [Cohere Rerank API](https://docs.cohere.com/reference/rerank)
- [Voyage AI Rerank](https://docs.voyageai.com/reference/reranker-api-reference)

---

## 10. Fusion戦略比較

| 戦略               | メリット                   | デメリット               | 使用場面                   |
| ------------------ | -------------------------- | ------------------------ | -------------------------- |
| RRF                | ランク情報のみで動作、堅牢 | スコアの絶対値を無視     | 異なるスコア分布の統合     |
| Weighted Score     | スコアの絶対値を活用       | スコア分布の正規化が必要 | 類似スコア分布の統合       |
| Reranking (Cohere) | 高精度、多言語対応         | API費用、レイテンシ      | 本番環境、品質重視         |
| Reranking (LLM)    | カスタマイズ可能           | 費用、レイテンシ         | 特殊なドメイン             |
| No Reranking       | 高速、コストなし           | Fusion結果のまま         | 開発・テスト、低レイテンシ |
