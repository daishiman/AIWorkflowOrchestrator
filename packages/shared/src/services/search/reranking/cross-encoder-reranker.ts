/**
 * @file Cross-Encoder Reranker 実装
 * @description CONV-07-05: RRF Fusion + Reranking - Phase 5 実装
 */

import { ok, err, type Result } from "../../../types/rag/result";
import type { ILLMClient } from "../../llm/types";
import type { FusedSearchResult } from "../fusion/types";
import type {
  IReranker,
  LLMRerankerOptions,
  CohereRerankerOptions,
  VoyageRerankerOptions,
  CohereRerankResponse,
  VoyageRerankResponse,
} from "./types";

// =============================================================================
// LLMReranker
// =============================================================================

/**
 * LLMを使用したリランカー
 *
 * @description
 * バッチ処理でLLMにスコアリングを依頼し、結果をリランキングする。
 */
export class LLMReranker implements IReranker {
  private readonly llm: ILLMClient;
  private readonly options: Required<LLMRerankerOptions>;

  private static readonly DEFAULT_OPTIONS: Required<LLMRerankerOptions> = {
    batchSize: 10,
    skipIfBelowLimit: false,
    promptTemplate: `以下のクエリとドキュメントの関連度を0-10で評価してください。
各ドキュメントにスコアをカンマ区切りで回答してください。

クエリ: {{query}}

ドキュメント:
{{documents}}

スコア（カンマ区切り）:`,
  };

  constructor(llm: ILLMClient, options: LLMRerankerOptions = {}) {
    this.llm = llm;
    this.options = { ...LLMReranker.DEFAULT_OPTIONS, ...options };
  }

  /**
   * LLMでリランキング
   */
  async rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    // 候補数がlimit以下でスキップ設定の場合
    if (this.options.skipIfBelowLimit && candidates.length <= limit) {
      return ok(candidates);
    }

    try {
      const scores = await this.scoreBatch(query, candidates);
      if (!scores.success) {
        // フォールバック: fusedScore順で返却
        return ok(candidates.slice(0, limit));
      }

      // スコアを適用してソート
      const scoredCandidates = candidates.map((candidate, i) => ({
        ...candidate,
        rerankedScore: scores.data[i] ?? candidate.fusedScore,
      }));

      scoredCandidates.sort(
        (a, b) => (b.rerankedScore ?? 0) - (a.rerankedScore ?? 0),
      );

      return ok(scoredCandidates.slice(0, limit));
    } catch {
      // フォールバック
      return ok(candidates.slice(0, limit));
    }
  }

  /**
   * バッチでスコアリング
   */
  private async scoreBatch(
    query: string,
    candidates: FusedSearchResult[],
  ): Promise<Result<number[], Error>> {
    const allScores: number[] = [];

    // バッチ処理
    for (let i = 0; i < candidates.length; i += this.options.batchSize) {
      const batch = candidates.slice(i, i + this.options.batchSize);
      const prompt = this.buildScoringPrompt(query, batch);

      const result = await this.llm.complete(prompt);
      if (!result.success) {
        return err(result.error);
      }

      const parsedScores = this.parseScores(result.data, batch.length);
      if (!parsedScores) {
        return err(new Error("Failed to parse LLM scores"));
      }

      allScores.push(...parsedScores);
    }

    return ok(allScores);
  }

  /**
   * スコアリング用プロンプトを構築
   */
  private buildScoringPrompt(
    query: string,
    candidates: FusedSearchResult[],
  ): string {
    const documents = candidates
      .map((c, i) => `${i + 1}. ${c.content.slice(0, 200)}`)
      .join("\n");

    return this.options.promptTemplate
      .replace("{{query}}", query)
      .replace("{{documents}}", documents);
  }

  /**
   * LLMレスポンスからスコアをパース
   */
  private parseScores(
    response: string,
    expectedCount: number,
  ): number[] | null {
    try {
      const matches = response.match(/\d+/g);
      if (!matches || matches.length < expectedCount) {
        return null;
      }

      const scores = matches.slice(0, expectedCount).map((s) => {
        const score = parseInt(s, 10);
        return Math.min(10, Math.max(0, score)) / 10; // 0-1に正規化
      });

      return scores;
    } catch {
      return null;
    }
  }
}

// =============================================================================
// CohereReranker
// =============================================================================

/**
 * Cohere Rerank APIを使用したリランカー
 *
 * @description
 * Cohere Rerank API (https://api.cohere.ai/v1/rerank) を呼び出す。
 */
export class CohereReranker implements IReranker {
  private readonly apiKey: string;
  private readonly options: Required<CohereRerankerOptions>;

  private static readonly DEFAULT_OPTIONS: Required<CohereRerankerOptions> = {
    model: "rerank-multilingual-v3.0",
    timeoutMs: 30000,
    endpoint: "https://api.cohere.ai/v1/rerank",
  };

  constructor(apiKey: string, options: CohereRerankerOptions = {}) {
    this.apiKey = apiKey;
    this.options = { ...CohereReranker.DEFAULT_OPTIONS, ...options };
  }

  /**
   * Cohere APIでリランキング
   */
  async rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    try {
      const response = await fetch(this.options.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.options.model,
          query,
          documents: candidates.map((c) => c.content),
          top_n: limit,
        }),
      });

      if (!response.ok) {
        return err(
          new Error(
            `Cohere API error: ${response.status} ${response.statusText}`,
          ),
        );
      }

      const data = (await response.json()) as CohereRerankResponse;

      // レスポンスを元にrerankedScoreを設定
      const rerankedResults: FusedSearchResult[] = data.results.map((r) => ({
        ...candidates[r.index],
        rerankedScore: r.relevance_score,
      }));

      return ok(rerankedResults);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Cohere API request failed"),
      );
    }
  }
}

// =============================================================================
// VoyageReranker
// =============================================================================

/**
 * Voyage AI Rerank APIを使用したリランカー
 *
 * @description
 * Voyage AI Rerank API (https://api.voyageai.com/v1/rerank) を呼び出す。
 */
export class VoyageReranker implements IReranker {
  private readonly apiKey: string;
  private readonly options: Required<VoyageRerankerOptions>;

  private static readonly DEFAULT_OPTIONS: Required<VoyageRerankerOptions> = {
    model: "rerank-2",
    timeoutMs: 30000,
    endpoint: "https://api.voyageai.com/v1/rerank",
  };

  constructor(apiKey: string, options: VoyageRerankerOptions = {}) {
    this.apiKey = apiKey;
    this.options = { ...VoyageReranker.DEFAULT_OPTIONS, ...options };
  }

  /**
   * Voyage APIでリランキング
   */
  async rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    try {
      const response = await fetch(this.options.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.options.model,
          query,
          documents: candidates.map((c) => c.content),
          top_k: limit,
        }),
      });

      if (!response.ok) {
        return err(
          new Error(
            `Voyage API error: ${response.status} ${response.statusText}`,
          ),
        );
      }

      const data = (await response.json()) as VoyageRerankResponse;

      // レスポンスを元にrerankedScoreを設定
      const rerankedResults: FusedSearchResult[] = data.data.map((r) => ({
        ...candidates[r.index],
        rerankedScore: r.relevance_score,
      }));

      return ok(rerankedResults);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Voyage API request failed"),
      );
    }
  }
}

// =============================================================================
// NoOpReranker
// =============================================================================

/**
 * 何もしないリランカー（フォールバック用）
 *
 * @description
 * 順序を変えずにlimitを適用するだけのパススルーリランカー。
 */
export class NoOpReranker implements IReranker {
  /**
   * パススルーリランキング（順序を変えずにlimit適用）
   */
  async rerank(
    _query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>> {
    // fusedScoreをrerankedScoreにコピーして返却
    const results = candidates.slice(0, limit).map((c) => ({
      ...c,
      rerankedScore: c.fusedScore,
    }));

    return ok(results);
  }
}
