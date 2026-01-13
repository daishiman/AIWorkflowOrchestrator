/**
 * @file RRF Fusion + WeightedScoreFusion 実装
 * @description CONV-07-05: RRF Fusion + Reranking - Phase 5 実装
 */

import type { ChunkId } from "../../../types/rag/branded";
import type { SearchWeights } from "../types";
import type {
  IFusionStrategy,
  SearchResult,
  FusedSearchResult,
  SourceInfo,
} from "./types";

// =============================================================================
// RRFFusion
// =============================================================================

/**
 * RRF (Reciprocal Rank Fusion) アルゴリズムによるFusion
 *
 * @description
 * スコア計算式: score(d) = Σ (weight_i / (k + rank_i(d)))
 *
 * @see https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
 */
export class RRFFusion implements IFusionStrategy {
  private readonly k: number;

  /**
   * @param k RRFパラメータ（デフォルト: 60）
   */
  constructor(k: number = 60) {
    this.k = k;
  }

  /**
   * 複数の検索結果セットをRRFアルゴリズムで統合
   * @param resultSets 戦略名→検索結果のMap
   * @param weights 各戦略の重み
   * @returns Fusion後の検索結果（fusedScore降順）
   */
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[] {
    // チャンクIDごとにRRFスコアとソース情報を集約
    const chunkMap = new Map<
      string,
      {
        chunkId: ChunkId;
        content: string;
        rrfScore: number;
        sources: SourceInfo[];
        metadata: Record<string, unknown>;
      }
    >();

    // 各戦略の結果を処理
    for (const [strategy, results] of resultSets) {
      const weight = this.getWeight(strategy, weights);
      if (weight === 0 || results.length === 0) continue;

      results.forEach((result, index) => {
        const rank = index + 1;
        const rrfContribution = weight / (this.k + rank);
        const chunkIdStr = result.chunkId as string;

        const existing = chunkMap.get(chunkIdStr);
        if (existing) {
          // 既存のチャンクにソース情報を追加
          existing.rrfScore += rrfContribution;
          existing.sources.push({
            strategy: result.source,
            rank,
            score: result.score,
          });
          // メタデータをマージ
          existing.metadata = { ...existing.metadata, ...result.metadata };
        } else {
          // 新規チャンクを追加
          chunkMap.set(chunkIdStr, {
            chunkId: result.chunkId,
            content: result.content,
            rrfScore: rrfContribution,
            sources: [
              {
                strategy: result.source,
                rank,
                score: result.score,
              },
            ],
            metadata: result.metadata,
          });
        }
      });
    }

    // FusedSearchResultに変換し、スコアを正規化
    const fused: FusedSearchResult[] = Array.from(chunkMap.values()).map(
      (item) => ({
        chunkId: item.chunkId,
        content: item.content,
        fusedScore: this.normalizeScore(item.rrfScore),
        sources: item.sources,
        metadata: item.metadata,
      }),
    );

    // fusedScore降順でソート
    return fused.sort((a, b) => b.fusedScore - a.fusedScore);
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
        return 0;
    }
  }

  /**
   * RRFスコアを0-1に正規化
   * @param rrfScore 生のRRFスコア
   * @returns 正規化されたスコア（0-1）
   */
  private normalizeScore(rrfScore: number): number {
    // 理論最大値: 3 * (1 / (k + 1)) when all strategies rank #1 with weight 1
    const theoreticalMax = 3 / (this.k + 1);
    return Math.min(1, rrfScore / theoreticalMax);
  }
}

// =============================================================================
// WeightedScoreFusion
// =============================================================================

/**
 * 加重平均によるFusion
 *
 * @description
 * スコア計算式: fusedScore = Σ(score_i * weight_i) / Σ(weight_i)
 */
export class WeightedScoreFusion implements IFusionStrategy {
  /**
   * 複数の検索結果セットを加重平均で統合
   * @param resultSets 戦略名→検索結果のMap
   * @param weights 各戦略の重み
   * @returns Fusion後の検索結果（fusedScore降順）
   */
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[] {
    // チャンクIDごとにスコアとソース情報を集約
    const chunkMap = new Map<
      string,
      {
        chunkId: ChunkId;
        content: string;
        weightedScoreSum: number;
        weightSum: number;
        sources: SourceInfo[];
        metadata: Record<string, unknown>;
      }
    >();

    // 各戦略の結果を処理
    for (const [strategy, results] of resultSets) {
      const weight = this.getWeight(strategy, weights);
      if (weight === 0 || results.length === 0) continue;

      results.forEach((result, index) => {
        const rank = index + 1;
        const chunkIdStr = result.chunkId as string;

        const existing = chunkMap.get(chunkIdStr);
        if (existing) {
          // 既存のチャンクにスコアを加算
          existing.weightedScoreSum += result.score * weight;
          existing.weightSum += weight;
          existing.sources.push({
            strategy: result.source,
            rank,
            score: result.score,
          });
          // メタデータをマージ
          existing.metadata = { ...existing.metadata, ...result.metadata };
        } else {
          // 新規チャンクを追加
          chunkMap.set(chunkIdStr, {
            chunkId: result.chunkId,
            content: result.content,
            weightedScoreSum: result.score * weight,
            weightSum: weight,
            sources: [
              {
                strategy: result.source,
                rank,
                score: result.score,
              },
            ],
            metadata: result.metadata,
          });
        }
      });
    }

    // FusedSearchResultに変換（加重平均を計算）
    const fused: FusedSearchResult[] = Array.from(chunkMap.values()).map(
      (item) => ({
        chunkId: item.chunkId,
        content: item.content,
        fusedScore:
          item.weightSum > 0 ? item.weightedScoreSum / item.weightSum : 0,
        sources: item.sources,
        metadata: item.metadata,
      }),
    );

    // fusedScore降順でソート
    return fused.sort((a, b) => b.fusedScore - a.fusedScore);
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
        return 0;
    }
  }
}
