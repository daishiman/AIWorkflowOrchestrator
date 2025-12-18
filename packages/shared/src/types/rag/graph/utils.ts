/**
 * @file Knowledge Graphユーティリティ関数
 * @module @repo/shared/types/rag/graph/utils
 * @description エンティティ名正規化、重要度計算、グラフ密度計算等の再利用可能なロジック
 */

import type { EntityId } from "../branded";
import type {
  EntityEntity,
  RelationEntity,
  EntityType,
  RelationType,
} from "./types";
import { RelationTypes } from "./types";

// =============================================================================
// 定数定義
// =============================================================================

/**
 * 重要度計算の基準接続数（この数で基本スコア1.0に到達）
 */
const BASE_SCORE_CONNECTION_THRESHOLD = 20;

/**
 * 入次数ボーナスの基準（この数で最大ボーナスに到達）
 */
const IN_DEGREE_BONUS_THRESHOLD = 10;

/**
 * 最大入次数ボーナス値
 */
const MAX_IN_DEGREE_BONUS = 0.2;

/**
 * グラフ形成に必要な最小ノード数
 */
const MIN_GRAPH_NODES = 2;

/**
 * 最大スコア/密度値（上限クリップ用）
 */
const MAX_NORMALIZED_VALUE = 1.0;

// =============================================================================
// 1. normalizeEntityName - エンティティ名の正規化
// =============================================================================

/**
 * エンティティ名を正規化
 *
 * 統一フォーマットに変換し、重複排除・検索性向上を実現する。
 * - 小文字化
 * - 連続空白を単一空白に変換
 * - 特殊文字除去（英数字、空白、ハイフンのみ残す）
 * - 前後空白除去
 *
 * @param name 元のエンティティ名
 * @returns 正規化されたエンティティ名
 * @example
 * normalizeEntityName("React.js") // => "reactjs"
 * normalizeEntityName("Claude 3.5 Sonnet") // => "claude 3 5 sonnet"
 * normalizeEntityName("  TypeScript  ") // => "typescript"
 */
export function normalizeEntityName(name: string): string {
  return name
    .toLowerCase() // 小文字化
    .replace(/(\d)\.(\d)/g, "$1 $2") // 数字間のピリオドを空白に変換（3.5 → 3 5）
    .replace(/\s+/g, " ") // 連続空白を単一空白に
    .replace(/[^\p{L}\p{N}\s-]/gu, "") // 特殊文字除去（Unicode対応、文字と数字とハイフンのみ残す）
    .replace(/_/g, "") // アンダースコア除去
    .trim(); // 前後空白除去
}

// =============================================================================
// 2. getInverseRelationType - 逆関係タイプの取得
// =============================================================================

/**
 * 関係タイプの逆関係マップ
 * 双方向関係（related_to, concurrent_with, collaborates_with）は含まない
 */
const INVERSE_RELATION_MAP: Record<RelationType, RelationType | null> = {
  // 汎用関係
  part_of: RelationTypes.HAS_PART,
  has_part: RelationTypes.PART_OF,
  belongs_to: RelationTypes.HAS_PART,
  related_to: null, // 双方向関係

  // 時間的関係
  preceded_by: RelationTypes.FOLLOWED_BY,
  followed_by: RelationTypes.PRECEDED_BY,
  concurrent_with: null, // 双方向関係

  // 技術的関係
  uses: RelationTypes.USED_BY,
  used_by: RelationTypes.USES,
  implements: null, // 単方向関係
  extends: null, // 単方向関係
  depends_on: null, // 単方向関係
  calls: null, // 単方向関係
  imports: null, // 単方向関係

  // 階層関係
  parent_of: RelationTypes.CHILD_OF,
  child_of: RelationTypes.PARENT_OF,

  // 参照関係
  references: RelationTypes.REFERENCED_BY,
  referenced_by: RelationTypes.REFERENCES,
  defines: RelationTypes.DEFINED_BY,
  defined_by: RelationTypes.DEFINES,

  // 人物関係
  authored_by: null, // 単方向関係
  works_for: null, // 単方向関係
  collaborates_with: null, // 双方向関係
} as const;

/**
 * 関係タイプの逆関係を取得
 *
 * 双方向グラフ構築を支援する。
 *
 * @param relationType 元の関係タイプ
 * @returns 逆関係タイプ（逆関係がない場合はnull）
 * @example
 * getInverseRelationType("uses") // => "used_by"
 * getInverseRelationType("part_of") // => "has_part"
 * getInverseRelationType("related_to") // => null（双方向関係）
 */
export function getInverseRelationType(
  relationType: RelationType,
): RelationType | null {
  return INVERSE_RELATION_MAP[relationType] ?? null;
}

// =============================================================================
// 3. calculateEntityImportance - エンティティ重要度計算
// =============================================================================

/**
 * エンティティの重要度を計算（簡易PageRank）
 *
 * エンティティの接続数に基づいて重要度スコアを計算する。
 * - 基本スコア: 接続数 / 20（20接続で最大1.0）
 * - 入次数ボーナス: 被参照数 / 10（最大+0.2）
 *
 * @param entityId 対象エンティティのID
 * @param relations エンティティに関連する関係の配列
 * @returns 重要度スコア（0.0〜1.0）
 * @example
 * // エンティティAに10個の関係がある場合
 * calculateEntityImportance(entityA.id, relations) // => 0.5
 */
export function calculateEntityImportance(
  entityId: EntityId,
  relations: readonly RelationEntity[],
): number {
  // 出次数（sourceId = entityId）
  const outDegree = relations.filter((r) => r.sourceId === entityId).length;

  // 入次数（targetId = entityId）
  const inDegree = relations.filter((r) => r.targetId === entityId).length;

  // 合計接続数
  const totalDegree = outDegree + inDegree;

  // 基本スコア
  const baseScore = Math.min(
    totalDegree / BASE_SCORE_CONNECTION_THRESHOLD,
    MAX_NORMALIZED_VALUE,
  );

  // 入次数ボーナス（被参照が多いほど重要）
  const inDegreeBonus = Math.min(
    inDegree / IN_DEGREE_BONUS_THRESHOLD,
    MAX_IN_DEGREE_BONUS,
  );

  // 最終スコア
  return Math.min(baseScore + inDegreeBonus, MAX_NORMALIZED_VALUE);
}

// =============================================================================
// 4. generateCommunityName - コミュニティ名の生成
// =============================================================================

/**
 * コミュニティ名を自動生成
 *
 * コミュニティのメンバーエンティティから、人間が理解しやすい名前を生成する。
 * - 1個: エンティティ名
 * - 2個: "A & B"
 * - 3個以上: "A, B & N others"
 *
 * @param entities コミュニティのメンバーエンティティ配列
 * @returns 生成されたコミュニティ名
 * @example
 * generateCommunityName([reactEntity]) // => "React"
 * generateCommunityName([reactEntity, nextEntity]) // => "React & Next.js"
 * generateCommunityName([react, next, remix, gatsby])
 * // => "React, Next.js & 2 others"
 */
export function generateCommunityName(
  entities: readonly EntityEntity[],
): string {
  if (entities.length === 0) {
    return "Empty Community";
  }

  // 重要度順にソート（降順）
  const sortedEntities = [...entities].sort(
    (a, b) => b.importance - a.importance,
  );

  if (sortedEntities.length === 1) {
    // 1個: エンティティ名のみ
    return sortedEntities[0].name;
  }

  if (sortedEntities.length === 2) {
    // 2個: "A & B"
    return `${sortedEntities[0].name} & ${sortedEntities[1].name}`;
  }

  // 3個以上: "A, B & N others"
  const topTwo = sortedEntities.slice(0, 2);
  const othersCount = sortedEntities.length - 2;

  return `${topTwo[0].name}, ${topTwo[1].name} & ${othersCount} others`;
}

// =============================================================================
// 5. getEntityTypeCategory - エンティティタイプのカテゴリ取得
// =============================================================================

/**
 * エンティティタイプのカテゴリマップ
 */
const ENTITY_TYPE_CATEGORY_MAP: Record<EntityType, string> = {
  // 1. 人物・組織カテゴリ (4種類)
  person: "人物・組織",
  organization: "人物・組織",
  role: "人物・組織",
  team: "人物・組織",

  // 2. 場所・時間カテゴリ (3種類)
  location: "場所・時間",
  date: "場所・時間",
  event: "場所・時間",

  // 3. ビジネス・経営カテゴリ (9種類)
  company: "ビジネス・経営",
  product: "ビジネス・経営",
  service: "ビジネス・経営",
  brand: "ビジネス・経営",
  strategy: "ビジネス・経営",
  metric: "ビジネス・経営",
  business_process: "ビジネス・経営",
  market: "ビジネス・経営",
  customer: "ビジネス・経営",

  // 4. 技術全般カテゴリ (5種類)
  technology: "技術全般",
  tool: "技術全般",
  method: "技術全般",
  standard: "技術全般",
  protocol: "技術全般",

  // 5. コード・ソフトウェアカテゴリ (7種類)
  programming_language: "コード・ソフトウェア",
  framework: "コード・ソフトウェア",
  library: "コード・ソフトウェア",
  api: "コード・ソフトウェア",
  function: "コード・ソフトウェア",
  class: "コード・ソフトウェア",
  module: "コード・ソフトウェア",

  // 6. 抽象概念カテゴリ (5種類)
  concept: "抽象概念",
  theory: "抽象概念",
  principle: "抽象概念",
  pattern: "抽象概念",
  model: "抽象概念",

  // 7. ドキュメント構造カテゴリ (5種類)
  document: "ドキュメント構造",
  chapter: "ドキュメント構造",
  section: "ドキュメント構造",
  paragraph: "ドキュメント構造",
  heading: "ドキュメント構造",

  // 8. ドキュメント要素カテゴリ (9種類)
  keyword: "ドキュメント要素",
  summary: "ドキュメント要素",
  figure: "ドキュメント要素",
  table: "ドキュメント要素",
  list: "ドキュメント要素",
  quote: "ドキュメント要素",
  code_snippet: "ドキュメント要素",
  formula: "ドキュメント要素",
  example: "ドキュメント要素",

  // 9. メディアカテゴリ (4種類)
  image: "メディア",
  video: "メディア",
  audio: "メディア",
  diagram: "メディア",

  // 10. その他カテゴリ (1種類)
  other: "その他",
} as const;

/**
 * エンティティタイプのカテゴリを取得
 *
 * カテゴリ別の処理・フィルタリングを支援する。
 *
 * @param entityType エンティティタイプ
 * @returns カテゴリ名
 * @example
 * getEntityTypeCategory("person") // => "人物・組織"
 * getEntityTypeCategory("technology") // => "技術全般"
 * getEntityTypeCategory("document") // => "ドキュメント構造"
 */
export function getEntityTypeCategory(entityType: EntityType): string {
  return ENTITY_TYPE_CATEGORY_MAP[entityType] ?? "その他";
}

// =============================================================================
// 6. calculateGraphDensity - グラフ密度の計算
// =============================================================================

/**
 * グラフ密度を計算
 *
 * Knowledge Graph全体の密度（疎密度）を計算し、グラフの特性を定量化する。
 * - density = 0.0: 疎グラフ（関係がほとんどない）
 * - density = 0.5: 中密度グラフ
 * - density = 1.0: 完全グラフ（すべて相互接続）
 *
 * @param entityCount エンティティ総数
 * @param relationCount 関係総数
 * @returns グラフ密度（0.0〜1.0）
 * @example
 * calculateGraphDensity(100, 200) // => 0.0404
 * calculateGraphDensity(10, 45) // => 1.0（完全グラフ）
 */
export function calculateGraphDensity(
  entityCount: number,
  relationCount: number,
): number {
  // 最小ノード数未満の場合、グラフは形成されない
  if (entityCount < MIN_GRAPH_NODES) {
    return 0.0;
  }

  // 最大可能エッジ数（無向グラフ）
  const maxEdges = (entityCount * (entityCount - 1)) / 2;

  // グラフ密度
  const density = relationCount / maxEdges;

  // 上限クリップ（異常値対策）
  return Math.min(density, MAX_NORMALIZED_VALUE);
}
