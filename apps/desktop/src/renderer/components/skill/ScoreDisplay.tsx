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
import type {
  LifecycleEvaluationSnapshot,
  LifecycleGateDecision,
  GateStatus,
} from "@repo/shared/types";
import { getLifecycleGateLabel } from "../../store/skillEvaluation";

// ============================================
// Types
// ============================================

export interface ScoreDisplayProps {
  /** スキル分析結果 */
  analysis: SkillAnalysis;
  /** 最新 gate decision */
  gateDecision?: LifecycleGateDecision | null;
  /** 最新 snapshot */
  snapshot?: LifecycleEvaluationSnapshot | null;
}

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

const gateBadgeStyles: Record<GateStatus, string> = {
  revise_required:
    "border-[var(--status-error)]/20 bg-[var(--status-error)]/10 text-[var(--status-error)]",
  save_with_warning:
    "border-[var(--status-warning)]/20 bg-[var(--status-warning)]/10 text-[var(--status-warning)]",
  use_with_warning:
    "border-[var(--status-warning)]/20 bg-[var(--status-warning)]/10 text-[var(--status-warning)]",
  use_ready:
    "border-[var(--status-success)]/20 bg-[var(--status-success)]/10 text-[var(--status-success)]",
  recommended:
    "border-[var(--status-primary)]/20 bg-[var(--status-primary)]/10 text-[var(--status-primary)]",
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
 * OverallScore - 総合スコア表示
 */
const OverallScore: React.FC<{ score: number }> = ({ score }) => {
  const variant = getScoreVariant(score);

  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <h3 className="text-sm font-medium text-[var(--text-secondary)]">
        総合スコア
      </h3>
      <span className={`text-4xl font-bold ${scoreVariantStyles[variant]}`}>
        {score}
      </span>
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
  ({ analysis, gateDecision = null, snapshot = null }) => {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4">
        {/* ヘッダー */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3
              className="h-4 w-4 text-[var(--text-secondary)]"
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              スキル分析結果
            </h2>
          </div>
          {gateDecision ? (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${gateBadgeStyles[gateDecision.status]}`}
              data-testid="score-display-gate-badge"
            >
              {getLifecycleGateLabel(gateDecision.status)}
            </span>
          ) : null}
        </div>

        {/* 総合スコア */}
        <OverallScore score={analysis.overallScore} />

        {gateDecision || snapshot ? (
          <div className="grid gap-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                Gate
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                {gateDecision ? gateDecision.summary : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                Next
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                {gateDecision?.nextSurface ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                Delta
              </p>
              <p
                className="mt-2 text-sm font-medium text-[var(--text-primary)]"
                data-testid="score-display-gate-delta"
              >
                {typeof snapshot?.deltaFromPrevious === "number"
                  ? `${snapshot.deltaFromPrevious > 0 ? "+" : ""}${snapshot.deltaFromPrevious}`
                  : "n/a"}
              </p>
            </div>
          </div>
        ) : null}

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
