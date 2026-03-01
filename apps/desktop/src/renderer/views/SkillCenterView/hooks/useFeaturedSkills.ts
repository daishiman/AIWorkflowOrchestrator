/**
 * useFeaturedSkills Hook
 *
 * 未追加スキルから最大 maxCount 件を選定する。
 * popularity 降順ソート + カテゴリ多様性確保（同カテゴリ最大2件）。
 *
 * @module SkillCenterView/hooks/useFeaturedSkills
 */

import { useMemo } from "react";
import type { SkillMetadata } from "@repo/shared/types/skill";

/**
 * useFeaturedSkills の引数型
 */
export interface UseFeaturedSkillsParams {
  /** 利用可能な全スキルメタデータ */
  allSkills: SkillMetadata[];
  /** インポート済みスキル名の配列 */
  importedSkillNames: string[];
  /** 最大選定件数（デフォルト: 3） */
  maxCount?: number;
}

/**
 * スキルのスコアを計算する。
 * agents / references / indexes の総数で人気度を近似する。
 */
function computePopularity(skill: SkillMetadata): number {
  return skill.agents.length + skill.references.length + skill.indexes.length;
}

/**
 * カテゴリ推論ヘルパー。
 * description から簡易的にカテゴリを推論する。
 */
function inferCategory(skill: SkillMetadata): string {
  const desc = skill.description.toLowerCase();
  if (desc.includes("test") || desc.includes("テスト")) return "testing";
  if (desc.includes("design") || desc.includes("設計")) return "design";
  if (desc.includes("security") || desc.includes("セキュリティ"))
    return "security";
  if (desc.includes("doc") || desc.includes("ドキュメント"))
    return "documentation";
  if (desc.includes("perf") || desc.includes("パフォーマンス"))
    return "performance";
  if (
    desc.includes("dev") ||
    desc.includes("開発") ||
    desc.includes("build") ||
    desc.includes("ビルド")
  )
    return "development";
  return "other";
}

/**
 * カテゴリ多様性を確保しつつスキルを選定する。
 * 同カテゴリは最大 maxPerCategory 件に制限する。
 *
 * TODO(human): ensureCategoryDiversity の選定アルゴリズムを
 * ユーザーフィードバックに基づいて改善する。
 * 現在はスコア順 + カテゴリ上限の単純なアルゴリズム。
 */
function ensureCategoryDiversity(
  sortedSkills: SkillMetadata[],
  maxCount: number,
  maxPerCategory: number,
): SkillMetadata[] {
  const categoryCounts = new Map<string, number>();
  const result: SkillMetadata[] = [];
  const skipped: SkillMetadata[] = [];

  // パス1: カテゴリ多様性を優先して選定
  for (const skill of sortedSkills) {
    if (result.length >= maxCount) break;

    const category = inferCategory(skill);
    const currentCount = categoryCounts.get(category) ?? 0;

    if (currentCount < maxPerCategory) {
      result.push(skill);
      categoryCounts.set(category, currentCount + 1);
    } else {
      skipped.push(skill);
    }
  }

  // パス2: まだ maxCount に満たない場合、スキップされたスキルで埋める
  for (const skill of skipped) {
    if (result.length >= maxCount) break;
    result.push(skill);
  }

  return result;
}

/**
 * おすすめスキルを選定するフック。
 *
 * @param params - フックパラメータ
 * @returns 選定されたおすすめスキル配列
 */
export function useFeaturedSkills(
  params: UseFeaturedSkillsParams,
): SkillMetadata[] {
  const { allSkills, importedSkillNames, maxCount = 3 } = params;

  return useMemo(() => {
    const importedSet = new Set(importedSkillNames);
    const unimported = allSkills.filter(
      (s) => !importedSet.has(String(s.name)),
    );

    // popularity 降順ソート
    const sorted = [...unimported].sort(
      (a, b) => computePopularity(b) - computePopularity(a),
    );

    // カテゴリ多様性確保（同カテゴリ最大2件）
    return ensureCategoryDiversity(sorted, maxCount, 2);
  }, [allSkills, importedSkillNames, maxCount]);
}
