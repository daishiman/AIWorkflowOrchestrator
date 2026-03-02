/**
 * @file SkillAnalysisView.tsx
 * @description スキル分析ビュー organism コンポーネント
 * @feature skill-improver
 * @task TASK-10A-B
 *
 * スキルの分析結果を表示し、改善提案の選択・適用・全自動改善を行う。
 * ScoreDisplay / SuggestionList / RiskPanel を統合する organism。
 *
 * Phase 8 リファクタリング:
 * - ビジネスロジック → useSkillAnalysis カスタムフック
 * - 本コンポーネントはレイアウト + 子コンポーネントへのprops渡しのみ
 *
 * Apple HIG準拠: 8pxグリッド、角丸12px、CSS変数によるテーマ対応
 */

import React from "react";
import { X } from "lucide-react";
import { ScoreDisplay } from "./ScoreDisplay";
import { SuggestionList } from "./SuggestionList";
import { RiskPanel } from "./RiskPanel";
import { useSkillAnalysis } from "./hooks/useSkillAnalysis";

// ============================================
// Types
// ============================================

export interface SkillAnalysisViewProps {
  /** 分析対象のスキル名 */
  skillName: string;
  /** ビューを閉じるコールバック */
  onClose: () => void;
}

// ============================================
// Main Component
// ============================================

export const SkillAnalysisView: React.FC<SkillAnalysisViewProps> = ({
  skillName,
  onClose,
}) => {
  const {
    analysis,
    isAnalyzing,
    isImproving,
    selectedSuggestions,
    error,
    handleAnalyze,
    handleToggleSuggestion,
    handleApplySelected,
    handleAutoImprove,
  } = useSkillAnalysis(skillName);

  return (
    <div
      className="flex h-full flex-col bg-[var(--bg-primary)]"
      data-testid="skill-analysis-view"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-[var(--border-primary)] px-6 py-4">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          {skillName}
        </h1>
        <button
          onClick={onClose}
          aria-label="閉じる"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--bg-tertiary)]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* ローディング状態 */}
        {isAnalyzing && !analysis && (
          <div className="flex items-center justify-center gap-3 py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
            <span className="text-sm text-[var(--text-secondary)]">
              分析中...
            </span>
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div
            role="alert"
            className="flex flex-col items-center gap-4 rounded-xl bg-[var(--status-error)]/5 p-6"
          >
            <p className="text-sm text-[var(--status-error)]">{error}</p>
            <button
              onClick={handleAnalyze}
              className="rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors duration-200 hover:opacity-90"
            >
              再試行
            </button>
          </div>
        )}

        {/* 分析結果 */}
        {analysis && !error && (
          <>
            <ScoreDisplay analysis={analysis} />
            <SuggestionList
              suggestions={analysis.suggestions}
              selected={selectedSuggestions}
              onToggle={handleToggleSuggestion}
            />
            <RiskPanel risks={analysis.risks} />
          </>
        )}
      </div>

      {/* フッター */}
      {analysis && !error && (
        <div className="flex gap-3 border-t border-[var(--border-primary)] px-6 py-4">
          <button
            onClick={handleApplySelected}
            disabled={
              isImproving || selectedSuggestions.size === 0 || isAnalyzing
            }
            className="rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            選択を適用
          </button>
          <button
            onClick={handleAutoImprove}
            disabled={isImproving || isAnalyzing}
            className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            全自動改善
          </button>
        </div>
      )}
    </div>
  );
};

SkillAnalysisView.displayName = "SkillAnalysisView";
