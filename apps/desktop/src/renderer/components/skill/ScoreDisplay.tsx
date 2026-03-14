/**
 * @file ScoreDisplay.tsx
 * @description スキル分析結果のスコア表示コンポーネント
 * @feature skill-improver
 * @task TASK-UI-SCORE-DISPLAY
 *
 * 総合スコアとカテゴリ別分析結果を視覚的に表示する。
 * Apple HIG準拠のデザイン、8pxグリッド、WCAG 2.1 AA対応。
 */

import React, { memo } from "react";
import { BarChart3 } from "lucide-react";
import type {
  SkillAnalysis,
  AnalysisCategory,
} from "@repo/shared/types/skill-improver";

// ============================================
// Types
// ============================================

export interface ScoreDisplayProps {
  /** スキル分析結果 */
  analysis: SkillAnalysis;
  /** 改善前スナップショット分析結果（Δスコア表示用、省略時は非表示） */
  previousAnalysis?: SkillAnalysis | null;
}

/**
 * スコア差分の方向
 */
export type ScoreDeltaDirection = "up" | "neutral" | "down";

/**
 * スコア差分情報
 * - value: 差分の絶対値（|current - previous|）
 * - direction: 上昇/変化なし/低下の方向
 * - raw: 符号付きの差分値（current - previous）
 */
export interface ScoreDelta {
  value: number;
  direction: ScoreDeltaDirection;
  raw: number;
}

/**
 * スコア差分を計算する
 * |raw| <= 2 を "neutral" とみなす（微細変動を変化なしとして扱う）
 *
 * @param current - 改善後スコア
 * @param previous - 改善前スコア
 * @returns ScoreDelta
 */
export function calculateScoreDelta(
  current: number,
  previous: number,
): ScoreDelta {
  const raw = current - previous;
  const value = Math.abs(raw);
  const direction: ScoreDeltaDirection =
    value <= 2 ? "neutral" : raw > 0 ? "up" : "down";
  return { value, direction, raw };
}

export interface ScoreDeltaBadgeProps {
  delta: ScoreDelta | null;
}

// ============================================
// Score Delta Styles (P47準拠: モジュールスコープ export)
// ============================================

/** スコア差分の方向ごとのバッジスタイル（P47準拠: Record<ScoreDeltaDirection, string>） */
export const scoreDeltaStyles: Record<ScoreDeltaDirection, string> = {
  up: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  neutral: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
  down: "bg-[var(--status-error)] text-[var(--text-inverse)]",
};

// ============================================
// Score Variant (P47準拠: モジュールスコープ export)
// ============================================

export type ScoreVariant = "success" | "warning" | "error";

/** スコアバリアントごとのテキストカラースタイル */
export const scoreVariantStyles: Record<ScoreVariant, string> = {
  success: "text-[var(--status-success)]",
  warning: "text-[var(--status-warning)]",
  error: "text-[var(--status-error)]",
};

/** スコアバリアントごとのプログレスバー背景スタイル */
export const scoreBarStyles: Record<ScoreVariant, string> = {
  success: "bg-[var(--status-success)]",
  warning: "bg-[var(--status-warning)]",
  error: "bg-[var(--status-error)]",
};

/**
 * スコア値からバリアントを判定する
 * - 80-100: success（成功色）
 * - 60-79: warning（警告色）
 * - 0-59: error（エラー色）
 */
export const getScoreVariant = (score: number): ScoreVariant => {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "error";
};

// ============================================
// Sub-components
// ============================================

/**
 * ScoreDeltaBadge - スコア差分バッジ
 *
 * delta が null の場合はレンダリングしない（初回評価時など）。
 * Apple HIG準拠: rounded-full、8pxグリッド準拠のpadding
 */
export const ScoreDeltaBadge: React.FC<ScoreDeltaBadgeProps> = ({ delta }) => {
  if (delta === null) return null;

  const { direction, raw } = delta;
  const styleClass = scoreDeltaStyles[direction];

  let label: string;
  if (direction === "up") {
    label = `+${raw}点向上`;
  } else if (direction === "down") {
    label = `${raw}点低下`;
  } else {
    label = "変化なし";
  }

  return (
    <span
      data-testid="score-delta-badge"
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styleClass}`}
      aria-label={`スコア差分: ${label}`}
    >
      {direction === "up" && <span aria-hidden="true">↑ </span>}
      {direction === "down" && <span aria-hidden="true">↓ </span>}
      {label}
    </span>
  );
};

/**
 * OverallScore - 総合スコア表示
 */
const OverallScore: React.FC<{ score: number; delta?: ScoreDelta | null }> = ({
  score,
  delta,
}) => {
  const variant = getScoreVariant(score);

  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <h3 className="text-sm font-medium text-[var(--text-secondary)]">
        総合スコア
      </h3>
      <span className={`text-4xl font-bold ${scoreVariantStyles[variant]}`}>
        {score}
      </span>
      {delta !== undefined && <ScoreDeltaBadge delta={delta ?? null} />}
    </div>
  );
};

/**
 * CategoryBar - カテゴリ別スコアバー
 */
const CategoryBar: React.FC<{ category: AnalysisCategory }> = ({
  category,
}) => {
  const variant = getScoreVariant(category.score);

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {category.name}
        </span>
        <span
          className={`text-sm font-semibold ${scoreVariantStyles[variant]}`}
        >
          {category.score}
        </span>
      </div>

      {/* プログレスバー */}
      <div
        role="progressbar"
        aria-valuenow={category.score}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${scoreBarStyles[variant]}`}
          style={{ width: `${category.score}%` }}
        />
      </div>

      {/* 詳細テキスト */}
      {category.details && (
        <p className="text-xs text-[var(--text-secondary)]">
          {category.details}
        </p>
      )}

      {/* 課題リスト */}
      {category.issues.length > 0 && (
        <ul className="mt-1 flex flex-col gap-1">
          {category.issues.map((issue) => (
            <li
              key={issue}
              className="text-xs text-[var(--text-secondary)] pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[6px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--text-muted)]"
            >
              {issue}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ============================================
// Main Component
// ============================================

/**
 * ScoreDisplay - スキル分析スコア表示コンポーネント
 *
 * 総合スコアとカテゴリ別分析結果をプログレスバー付きで表示する。
 * スコアに応じて成功/警告/エラーの色分けを適用する。
 */
export const ScoreDisplay: React.FC<ScoreDisplayProps> = memo(
  ({ analysis, previousAnalysis }) => {
    const delta =
      previousAnalysis != null
        ? calculateScoreDelta(
            analysis.overallScore,
            previousAnalysis.overallScore,
          )
        : null;

    return (
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4">
        {/* ヘッダー */}
        <div className="flex items-center gap-2">
          <BarChart3
            className="h-4 w-4 text-[var(--text-secondary)]"
            aria-hidden="true"
          />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            スキル分析結果
          </h2>
        </div>

        {/* 総合スコア */}
        <OverallScore score={analysis.overallScore} delta={delta} />

        {/* カテゴリ別分析 */}
        {analysis.categories.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">
              カテゴリ別分析
            </h3>
            {analysis.categories.map((category) => (
              <CategoryBar key={category.name} category={category} />
            ))}
          </div>
        )}
      </div>
    );
  },
);

ScoreDisplay.displayName = "ScoreDisplay";
