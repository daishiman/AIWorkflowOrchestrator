/**
 * @file cta-visibility.ts
 * @description ScoringGate x CTA 制御マトリクスの純粋関数
 * @task TASK-SKILL-LIFECYCLE-05
 *
 * 16パターン（ScoringGate 4段階 x CTA 4種類）のCTA表示状態を決定する。
 * Phase 1 usage-scenario-table.md の CTA マトリクス定義に準拠。
 */

import type { ScoringGate, ScoringGateResult } from "./skill-improver";
import { getScoreGateResult } from "./skill-improver";

/**
 * CTA の表示状態
 */
export type CTAState = "primary" | "secondary" | "disabled" | "hidden";

/**
 * CTA 種別
 */
export type CTAType =
  | "USE_NOW"
  | "SAVE_LATER"
  | "IMPROVE_FIRST"
  | "IMPROVE_RECOMMENDED";

/**
 * 全CTA の表示状態マップ
 */
export interface CTAVisibility {
  useNow: CTAState;
  saveLater: CTAState;
  improveFirst: CTAState;
  improveRecommended: CTAState;
  isHighlighted: boolean;
}

/**
 * ScoringGate → CTAVisibility の静的マッピングテーブル
 * 02-code-quality.md: ユニオン型の網羅には Record<EnumType, Config> を使用
 */
const CTA_VISIBILITY_MAP: Record<ScoringGate, CTAVisibility> = {
  NEEDS_IMPROVEMENT: {
    useNow: "disabled",
    saveLater: "disabled",
    improveFirst: "primary",
    improveRecommended: "hidden",
    isHighlighted: false,
  },
  SAVE_ALLOWED: {
    useNow: "disabled",
    saveLater: "primary",
    improveFirst: "secondary",
    improveRecommended: "secondary",
    isHighlighted: false,
  },
  USE_ALLOWED: {
    useNow: "primary",
    saveLater: "secondary",
    improveFirst: "hidden",
    improveRecommended: "hidden",
    isHighlighted: false,
  },
  RECOMMENDED: {
    useNow: "primary",
    saveLater: "secondary",
    improveFirst: "hidden",
    improveRecommended: "hidden",
    isHighlighted: true,
  },
};

/**
 * ScoringGateResult から CTA の表示状態を決定する
 *
 * @param gateResult - ScoringGateResult（score, canSave, canUse, isRecommended フラグ）
 * @returns CTAVisibility - 全CTA の表示状態
 */
export function getCTAVisibility(gateResult: ScoringGateResult): CTAVisibility {
  return CTA_VISIBILITY_MAP[gateResult.gate];
}

/**
 * スコアから直接 CTA の表示状態を取得する便利関数
 */
export function getCTAVisibilityFromScore(score: number): CTAVisibility {
  return getCTAVisibility(getScoreGateResult(score));
}
