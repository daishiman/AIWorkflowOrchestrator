/**
 * @file CorrectiveRAG実装
 * @description CONV-07-06: Corrective RAG - 検索結果の評価・補正処理クラス
 */

import { ok, err, type Result } from "../../../types/rag/result";
import type { FusedSearchResult } from "../fusion/types";
import {
  CRAG_DEFAULTS,
  type CRAGOptions,
  type CRAGResult,
  type CorrectionAction,
  type ICorrectiveRAG,
  type IRelevanceEvaluator,
  type IWebSearcher,
  type RelevanceEvaluation,
  type WebSearchResult,
} from "./types";

/**
 * Corrective RAGメインクラス
 * 検索結果を評価し、必要に応じて補正処理を行う
 */
export class CorrectiveRAG implements ICorrectiveRAG {
  private readonly enableWebSearch: boolean;
  private readonly enableRefinement: boolean;
  private readonly ambiguousFilterThreshold: number;
  private readonly minResultsBeforeWebSearch: number;
  private readonly webSearchLimit: number;

  constructor(
    private readonly evaluator: IRelevanceEvaluator,
    private readonly webSearcher: IWebSearcher | null,
    options?: CRAGOptions,
  ) {
    this.enableWebSearch = options?.enableWebSearch ?? false;
    this.enableRefinement = options?.enableRefinement ?? false;
    this.ambiguousFilterThreshold =
      options?.ambiguousFilterThreshold ??
      CRAG_DEFAULTS.AMBIGUOUS_FILTER_THRESHOLD;
    this.minResultsBeforeWebSearch =
      options?.minResultsBeforeWebSearch ??
      CRAG_DEFAULTS.MIN_RESULTS_BEFORE_WEB_SEARCH;
    this.webSearchLimit =
      options?.webSearchLimit ?? CRAG_DEFAULTS.WEB_SEARCH_LIMIT;
  }

  /**
   * 検索結果を評価・補正
   */
  async process(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<CRAGResult, Error>> {
    // 空の結果の場合
    if (results.length === 0) {
      return this.handleEmptyResults(query);
    }

    // 関連性評価を実行
    const evaluationResult = await this.evaluator.evaluate(query, results);

    if (!evaluationResult.success) {
      return err(evaluationResult.error);
    }

    const evaluation = evaluationResult.data;

    // アクションに基づいて処理を分岐
    switch (evaluation.action) {
      case "correct":
        return this.handleCorrect(query, results, evaluation);
      case "incorrect":
        return this.handleIncorrect(query, results, evaluation);
      case "ambiguous":
        return this.handleAmbiguous(query, results, evaluation);
    }
  }

  /**
   * 空の結果を処理
   */
  private async handleEmptyResults(
    query: string,
  ): Promise<Result<CRAGResult, Error>> {
    const corrections: CorrectionAction[] = [
      { type: "discard", reason: "No results to process" },
    ];

    // Web検索が有効な場合は補強を試みる
    if (this.enableWebSearch && this.webSearcher) {
      const webResult = await this.performWebSearch(query);
      if (webResult.success && webResult.data.length > 0) {
        corrections.push({ type: "web_search", searchQuery: query });
        return ok({
          results: [],
          evaluation: {
            relevanceScore: 0,
            action: "incorrect",
            corrections,
          },
          augmentedContext: this.formatWebResults(webResult.data),
        });
      }
    }

    return ok({
      results: [],
      evaluation: {
        relevanceScore: 0,
        action: "incorrect",
        corrections,
      },
    });
  }

  /**
   * correct判定時の処理
   * 結果をそのまま返却（オプションでRefinement）
   */
  private async handleCorrect(
    _query: string,
    results: FusedSearchResult[],
    evaluation: RelevanceEvaluation,
  ): Promise<Result<CRAGResult, Error>> {
    const corrections: CorrectionAction[] = [
      { type: "keep", reason: "Results are sufficiently relevant" },
    ];

    let finalResults = results;

    // Refinementが有効な場合は知識の洗練を行う
    if (this.enableRefinement) {
      finalResults = this.refineKnowledge(results, evaluation);
      // Refinement実行時は常にアクションを記録（ソート順の変更も含む）
      corrections.push({
        type: "refine",
        refinedQuery: "Applied refinement",
      });
    }

    return ok({
      results: finalResults,
      evaluation: {
        relevanceScore: evaluation.overallScore,
        action: "correct",
        corrections,
      },
    });
  }

  /**
   * incorrect判定時の処理
   * 元の結果を破棄し、Web検索で補強
   */
  private async handleIncorrect(
    query: string,
    _results: FusedSearchResult[],
    evaluation: RelevanceEvaluation,
  ): Promise<Result<CRAGResult, Error>> {
    const corrections: CorrectionAction[] = [
      { type: "discard", reason: "Results are not relevant" },
    ];

    // Web検索が有効な場合
    if (this.enableWebSearch && this.webSearcher) {
      const webResult = await this.performWebSearch(query);

      if (!webResult.success) {
        return err(webResult.error);
      }

      corrections.push({ type: "web_search", searchQuery: query });

      return ok({
        results: [], // incorrect時は元の結果を破棄
        evaluation: {
          relevanceScore: evaluation.overallScore,
          action: "incorrect",
          corrections,
        },
        augmentedContext: this.formatWebResults(webResult.data),
      });
    }

    // Web検索が無効な場合は空の結果を返却
    return ok({
      results: [],
      evaluation: {
        relevanceScore: evaluation.overallScore,
        action: "incorrect",
        corrections,
      },
    });
  }

  /**
   * ambiguous判定時の処理
   * 低スコアの結果をフィルタし、必要に応じてWeb検索で補強
   */
  private async handleAmbiguous(
    query: string,
    results: FusedSearchResult[],
    evaluation: RelevanceEvaluation,
  ): Promise<Result<CRAGResult, Error>> {
    const corrections: CorrectionAction[] = [];

    // 個別スコアに基づいてフィルタリング
    const filteredResults = this.filterByIndividualScores(results, evaluation);

    if (filteredResults.length < results.length) {
      corrections.push({
        type: "discard",
        reason: `Filtered ${results.length - filteredResults.length} low-relevance results`,
      });
    }

    // フィルタ後の結果が少ない場合はWeb検索で補強
    let augmentedContext: string | undefined;

    if (
      this.enableWebSearch &&
      this.webSearcher &&
      filteredResults.length < this.minResultsBeforeWebSearch
    ) {
      const webResult = await this.performWebSearch(query);

      if (webResult.success && webResult.data.length > 0) {
        corrections.push({ type: "web_search", searchQuery: query });
        augmentedContext = this.formatWebResults(webResult.data);
      }
    }

    // Refinementが有効な場合
    let finalResults = filteredResults;
    if (this.enableRefinement && filteredResults.length > 0) {
      finalResults = this.refineKnowledge(filteredResults, evaluation);
      corrections.push({ type: "refine", refinedQuery: "Applied refinement" });
    }

    return ok({
      results: finalResults,
      evaluation: {
        relevanceScore: evaluation.overallScore,
        action: "ambiguous",
        corrections,
      },
      augmentedContext,
    });
  }

  /**
   * 個別スコアに基づいて結果をフィルタ
   */
  private filterByIndividualScores(
    results: FusedSearchResult[],
    evaluation: RelevanceEvaluation,
  ): FusedSearchResult[] {
    const scoreMap = new Map(
      evaluation.individualScores.map((s) => [s.chunkId, s.score]),
    );

    return results.filter((result) => {
      const score = scoreMap.get(result.chunkId);
      return score !== undefined && score >= this.ambiguousFilterThreshold;
    });
  }

  /**
   * Knowledge Refinement - 結果の知識を洗練
   */
  private refineKnowledge(
    results: FusedSearchResult[],
    evaluation: RelevanceEvaluation,
  ): FusedSearchResult[] {
    // スコア順でソートし、上位の結果を優先
    const scoreMap = new Map(
      evaluation.individualScores.map((s) => [s.chunkId, s.score]),
    );

    return [...results].sort((a, b) => {
      const scoreA = scoreMap.get(a.chunkId) ?? 0;
      const scoreB = scoreMap.get(b.chunkId) ?? 0;
      return scoreB - scoreA;
    });
  }

  /**
   * Web検索を実行
   */
  private async performWebSearch(
    query: string,
  ): Promise<Result<WebSearchResult[], Error>> {
    if (!this.webSearcher) {
      return ok([]);
    }

    return this.webSearcher.search(query, this.webSearchLimit);
  }

  /**
   * Web検索結果をフォーマット
   */
  private formatWebResults(results: WebSearchResult[]): string {
    if (results.length === 0) {
      return "";
    }

    return results
      .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.snippet}`)
      .join("\n\n");
  }
}
