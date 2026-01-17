/**
 * @file RelevanceEvaluator実装
 * @description CONV-07-06: Corrective RAG - LLMベースの関連性評価クラス
 */

import { ok, err, type Result } from "../../../types/rag/result";
import type { FusedSearchResult } from "../fusion/types";
import type { ChunkId } from "../../../types/rag/branded";
import {
  CRAG_DEFAULTS,
  type EvaluatorOptions,
  type ILLMClient,
  type IRelevanceEvaluator,
  type IndividualScore,
  type RelevanceAction,
  type RelevanceEvaluation,
} from "./types";

/**
 * LLMレスポンスの評価項目
 */
interface LLMEvaluationItem {
  score: number;
  reason: string;
}

/**
 * LLMレスポンスの評価結果
 */
interface LLMEvaluationResponse {
  evaluations: LLMEvaluationItem[];
}

/**
 * LLMベースの関連性評価器
 */
export class RelevanceEvaluator implements IRelevanceEvaluator {
  private readonly maxEvaluate: number;
  private readonly correctThreshold: number;
  private readonly incorrectThreshold: number;

  constructor(
    private readonly llmClient: ILLMClient,
    options?: EvaluatorOptions,
  ) {
    this.maxEvaluate = options?.maxEvaluate ?? CRAG_DEFAULTS.MAX_EVALUATE;
    this.correctThreshold =
      options?.correctThreshold ?? CRAG_DEFAULTS.CORRECT_THRESHOLD;
    this.incorrectThreshold =
      options?.incorrectThreshold ?? CRAG_DEFAULTS.INCORRECT_THRESHOLD;
  }

  /**
   * 検索結果全体の関連性を評価
   */
  async evaluate(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<RelevanceEvaluation, Error>> {
    // 空の結果の場合は即座にincorrectを返す
    if (results.length === 0) {
      return ok({
        overallScore: 0,
        action: "incorrect",
        individualScores: [],
        reasoning: "No search results to evaluate",
      });
    }

    // 評価対象を上位maxEvaluate件に制限
    const targetResults = results.slice(0, this.maxEvaluate);

    // LLMでの評価を実行
    const prompt = this.buildEvaluationPrompt(query, targetResults);
    const llmResult = await this.llmClient.complete({
      prompt,
      maxTokens: CRAG_DEFAULTS.MAX_TOKENS,
      temperature: CRAG_DEFAULTS.TEMPERATURE,
    });

    if (!llmResult.success) {
      return err(
        new Error(`LLM evaluation failed: ${llmResult.error.message}`),
      );
    }

    // レスポンスをパース
    const parsedResponse = this.parseEvaluationResponse(
      llmResult.data,
      targetResults,
    );

    // 個別スコアを構築
    const individualScores = this.buildIndividualScores(
      targetResults,
      parsedResponse,
    );

    // 全体スコアを計算（加重平均）
    const overallScore = this.calculateOverallScore(individualScores);

    // アクションを決定
    const action = this.determineAction(overallScore);

    // 推論理由を生成
    const reasoning = this.generateReasoning(
      action,
      overallScore,
      parsedResponse,
    );

    return ok({
      overallScore,
      action,
      individualScores,
      reasoning,
    });
  }

  /**
   * LLM評価用のプロンプトを構築
   */
  private buildEvaluationPrompt(
    query: string,
    results: FusedSearchResult[],
  ): string {
    const resultsText = results
      .map(
        (r, i) =>
          `[Result ${i + 1}]\nContent: ${r.content.slice(0, 500)}${r.content.length > 500 ? "..." : ""}`,
      )
      .join("\n\n");

    return `You are a relevance evaluator for a RAG (Retrieval-Augmented Generation) system.

Evaluate the relevance of each search result to the given query.

Query: ${query}

Search Results:
${resultsText}

For each result, provide a relevance score from 0 to 10 where:
- 0-2: Completely irrelevant
- 3-4: Weakly related
- 5-6: Partially relevant
- 7-8: Highly relevant
- 9-10: Directly answers the query

Respond in JSON format:
{
  "evaluations": [
    {"score": <number>, "reason": "<brief reason>"},
    ...
  ]
}

Evaluate all ${results.length} results in order.`;
  }

  /**
   * LLMレスポンスをパース
   */
  private parseEvaluationResponse(
    response: string,
    results: FusedSearchResult[],
  ): LLMEvaluationResponse {
    try {
      // JSONを抽出（前後の余分なテキストを除去）
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.createFallbackResponse(results.length);
      }

      const parsed = JSON.parse(jsonMatch[0]) as LLMEvaluationResponse;

      // 評価配列が存在し、かつ空でないことを確認
      if (!parsed.evaluations || parsed.evaluations.length === 0) {
        return this.createFallbackResponse(results.length);
      }

      // 結果数が足りない場合はフォールバック値で補完
      while (parsed.evaluations.length < results.length) {
        parsed.evaluations.push({ score: 5, reason: "No evaluation provided" });
      }

      return parsed;
    } catch {
      return this.createFallbackResponse(results.length);
    }
  }

  /**
   * フォールバック用のレスポンスを作成
   */
  private createFallbackResponse(count: number): LLMEvaluationResponse {
    return {
      evaluations: Array(count)
        .fill(null)
        .map(() => ({
          score: 5,
          reason: "Parse error - using fallback score",
        })),
    };
  }

  /**
   * 個別スコアを構築
   */
  private buildIndividualScores(
    results: FusedSearchResult[],
    parsedResponse: LLMEvaluationResponse,
  ): IndividualScore[] {
    return results.map((result, i) => {
      const evaluation = parsedResponse.evaluations[i];
      // LLMスコア（0-10）を0-1に正規化
      const normalizedScore = Math.min(Math.max(evaluation.score / 10, 0), 1);

      return {
        chunkId: result.chunkId as ChunkId,
        score: normalizedScore,
        reason: evaluation.reason,
      };
    });
  }

  /**
   * 全体スコアを加重平均で計算
   * 上位の結果により高い重みを付与: weights[i] = 1 / (i + 1)
   */
  private calculateOverallScore(scores: IndividualScore[]): number {
    if (scores.length === 0) return 0;

    let weightedSum = 0;
    let weightSum = 0;

    for (let i = 0; i < scores.length; i++) {
      const weight = 1 / (i + 1);
      weightedSum += scores[i].score * weight;
      weightSum += weight;
    }

    return weightedSum / weightSum;
  }

  /**
   * スコアに基づいてアクションを決定
   */
  private determineAction(score: number): RelevanceAction {
    if (score >= this.correctThreshold) {
      return "correct";
    }
    if (score <= this.incorrectThreshold) {
      return "incorrect";
    }
    return "ambiguous";
  }

  /**
   * 評価結果の推論理由を生成
   */
  private generateReasoning(
    action: RelevanceAction,
    score: number,
    response: LLMEvaluationResponse,
  ): string {
    const scorePercent = (score * 100).toFixed(1);
    const topReasons = response.evaluations
      .slice(0, 3)
      .map((e) => e.reason)
      .join("; ");

    switch (action) {
      case "correct":
        return `Results are highly relevant (${scorePercent}% confidence). ${topReasons}`;
      case "incorrect":
        return `Results are not relevant (${scorePercent}% confidence). ${topReasons}`;
      case "ambiguous":
        return `Results have mixed relevance (${scorePercent}% confidence). ${topReasons}`;
    }
  }
}
