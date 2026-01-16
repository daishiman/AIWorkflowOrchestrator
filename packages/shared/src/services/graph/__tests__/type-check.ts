/**
 * @file 型チェックテスト
 * @description コンパイル時の型チェックで検証
 * このファイルはTypeScriptコンパイラによる型チェックのみで使用
 * 実行時には使用しない
 */

// =============================================================================
// Entity Types
// =============================================================================

import type { StoredEntity, ExtractedEntity, EntityMention } from "../index";

type _StoredEntityCheck = StoredEntity;
type _ExtractedEntityCheck = ExtractedEntity;
type _EntityMentionCheck = EntityMention;

// =============================================================================
// Relation Types
// =============================================================================

import type {
  StoredRelation,
  ExtractedRelation,
  RelationEvidence,
} from "../index";

type _StoredRelationCheck = StoredRelation;
type _ExtractedRelationCheck = ExtractedRelation;
type _RelationEvidenceCheck = RelationEvidence;

// =============================================================================
// Graph Types
// =============================================================================

import type {
  GraphNode,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  GraphEdge,
} from "../index";

type _GraphNodeCheck = GraphNode;
type _GraphPathCheck = GraphPath;
type _GraphTraversalResultCheck = GraphTraversalResult;
type _GraphStatsCheck = GraphStats;
type _GraphEdgeCheck = GraphEdge;

// =============================================================================
// Community Types
// =============================================================================

import type {
  Community,
  CommunitySummary,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  CommunityDetectionStats,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
} from "../index";

type _CommunityCheck = Community;
type _CommunitySummaryCheck = CommunitySummary;
type _CommunityStructureCheck = CommunityStructure;
type _CommunityDetectionOptionsCheck = CommunityDetectionOptions;
type _CommunityDetectionResultCheck = CommunityDetectionResult;
type _CommunityDetectionStatsCheck = CommunityDetectionStats;
type _CommunitySummarizationOptionsCheck = CommunitySummarizationOptions;
type _CommunitySummarizationResultCheck = CommunitySummarizationResult;

// =============================================================================
// Query Types
// =============================================================================

import type {
  EntityQuery,
  TraversalOptions,
  RelationQueryOptions,
} from "../index";

type _EntityQueryCheck = EntityQuery;
type _TraversalOptionsCheck = TraversalOptions;
type _RelationQueryOptionsCheck = RelationQueryOptions;

// =============================================================================
// Value Exports (enum, class, function)
// =============================================================================

import {
  CommunityErrorCode,
  CommunityDetectionError,
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
  normalizeEntityName,
} from "../index";

// Verify enum values exist at runtime
const _enumCheck1: CommunityErrorCode = CommunityErrorCode.NOT_FOUND;
const _enumCheck2: CommunitySummarizationErrorCode =
  CommunitySummarizationErrorCode.LLM_GENERATION_FAILED;

// Verify classes are constructable
const _classCheck1: CommunityDetectionError = new CommunityDetectionError(
  "test",
  CommunityErrorCode.NOT_FOUND,
);
const _classCheck2: CommunitySummarizationError =
  new CommunitySummarizationError(
    "test",
    CommunitySummarizationErrorCode.LLM_GENERATION_FAILED,
  );

// Verify function is callable
const _funcCheck: string = normalizeEntityName("Test");

// コンパイルエラーがなければ型エクスポートは正しい
export {};
