/**
 * @file Fusion型定義
 * @description CONV-07-05: RRF Fusion + Reranking - Fusion関連の型定義
 */

import type { ChunkId } from "../../../types/rag/branded";
import type { SearchWeights } from "../types";

// =============================================================================
// 検索結果型
// =============================================================================

/**
 * 検索戦略からの検索結果
 */
export interface SearchResult {
  /** チャンクID */
  chunkId: ChunkId;
  /** チャンクのコンテンツ */
  content: string;
  /** 検索スコア（戦略固有） */
  score: number;
  /** 検索ソース戦略 */
  source: "keyword" | "semantic" | "graph";
  /** メタデータ */
  metadata: Record<string, unknown>;
}

// =============================================================================
// Fusion結果型
// =============================================================================

/**
 * ソース情報
 */
export interface SourceInfo {
  /** 検索戦略 */
  strategy: "keyword" | "semantic" | "graph";
  /** その戦略での順位 */
  rank: number;
  /** その戦略でのスコア */
  score: number;
}

/**
 * Fusion後の検索結果
 */
export interface FusedSearchResult {
  /** チャンクID */
  chunkId: ChunkId;
  /** チャンクのコンテンツ */
  content: string;
  /** Fusionスコア（0-1正規化） */
  fusedScore: number;
  /** リランキングスコア（リランキング後のみ） */
  rerankedScore?: number;
  /** ソース情報（どの戦略で何位だったか） */
  sources: SourceInfo[];
  /** マージされたメタデータ */
  metadata: Record<string, unknown>;
}

// =============================================================================
// Fusionストラテジーインターフェース
// =============================================================================

/**
 * Fusionストラテジーインターフェース
 */
export interface IFusionStrategy {
  /**
   * 複数の検索結果セットを統合
   * @param resultSets 戦略名→検索結果のMap
   * @param weights 各戦略の重み
   * @returns Fusion後の検索結果
   */
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[];
}
