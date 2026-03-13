/**
 * @file useSkillAnalysis.ts
 * @description スキル分析ビューのビジネスロジック・状態管理カスタムフック
 * @feature skill-improver
 * @task TASK-10A-F (Phase 5: Store駆動ライフサイクルUI統合)
 *
 * SkillAnalysisView.tsx から状態管理ロジックを抽出。
 * - 分析実行・結果管理 → Zustand store action 経由
 * - 提案選択トグル → ローカル state
 * - 選択適用 → Zustand store action 経由
 * - 全自動改善 → Zustand store action 経由
 *
 * TASK-10A-F: window.electronAPI 直接呼び出しを排除し、
 * agentSlice の store action 経由に統一。
 */

import { useState, useEffect, useCallback } from "react";
import type {
  ImprovementResult,
  Suggestion,
} from "@repo/shared/types/skill-improver";
import {
  useCurrentAnalysis,
  useIsAnalyzingSkill,
  useIsImprovingSkill,
  useSkillError,
  useAnalyzeSkill,
  useApplySkillImprovements,
  useAutoImproveSkill,
} from "../../../store";

// ============================================
// Types
// ============================================

export interface UseSkillAnalysisReturn {
  /** 分析結果（未取得時はnull） */
  analysis: ReturnType<typeof useCurrentAnalysis>;
  /** 分析中フラグ */
  isAnalyzing: boolean;
  /** 改善適用中フラグ */
  isImproving: boolean;
  /** 選択された提案のインデックスSet */
  selectedSuggestions: Set<number>;
  /** エラーメッセージ（エラーなし時はnull） */
  error: string | null;
  /** 改善適用結果（未適用時はnull） */
  improvementResult: ImprovementResult | null;
  /** 分析を手動実行する */
  handleAnalyze: () => Promise<void>;
  /** 提案の選択/選択解除をトグルする */
  handleToggleSuggestion: (index: number) => void;
  /** auto-fixable な提案のみを選択する */
  handleSelectAutoFixable: () => void;
  /** 選択した提案を適用する */
  handleApplySelected: () => Promise<void>;
  /** 全自動改善を実行する */
  handleAutoImprove: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

export const buildAutoFixableSelection = (
  suggestions: Suggestion[],
): Set<number> => {
  const selected = new Set<number>();
  suggestions.forEach((suggestion, index) => {
    if (suggestion.autoFixable) {
      selected.add(index);
    }
  });
  return selected;
};

/**
 * スキル分析のビジネスロジックを管理するカスタムフック
 *
 * @param skillName - 分析対象のスキル名
 * @returns 分析状態とハンドラ関数
 */
export const useSkillAnalysis = (skillName: string): UseSkillAnalysisReturn => {
  // ---- Store state (P31対策: 個別セレクタで取得) ----
  const analysis = useCurrentAnalysis();
  const isAnalyzing = useIsAnalyzingSkill();
  const isImproving = useIsImprovingSkill();
  const error = useSkillError();

  // ---- Store actions (P31対策: 個別セレクタで取得) ----
  const analyzeSkill = useAnalyzeSkill();
  const applySkillImprovements = useApplySkillImprovements();
  const autoImproveSkill = useAutoImproveSkill();

  // ---- Local state (ローカルUI状態は引き続きuseState) ----
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(
    new Set(),
  );
  const [improvementResult, setImprovementResult] =
    useState<ImprovementResult | null>(null);

  // ---- Handlers ----

  const handleAnalyze = useCallback(async () => {
    try {
      await analyzeSkill(skillName);
      setSelectedSuggestions(new Set());
    } catch {
      // Store側でskillErrorに設定済み。UIクラッシュ防止
    }
  }, [analyzeSkill, skillName]);

  const handleToggleSuggestion = useCallback((index: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleSelectAutoFixable = useCallback(() => {
    if (!analysis) return;
    setSelectedSuggestions(buildAutoFixableSelection(analysis.suggestions));
  }, [analysis]);

  const handleApplySelected = useCallback(async () => {
    if (!analysis || selectedSuggestions.size === 0) return;

    const selected: Suggestion[] = [];
    for (const index of selectedSuggestions) {
      if (analysis.suggestions[index]) {
        selected.push(analysis.suggestions[index]);
      }
    }

    try {
      await applySkillImprovements(skillName, selected);
      setImprovementResult(null);
    } catch {
      // store action 内部でエラーをskillErrorに格納済み。UIクラッシュ防止
    }
  }, [analysis, selectedSuggestions, skillName, applySkillImprovements]);

  const handleAutoImprove = useCallback(async () => {
    const isConfirmed = window.confirm("全自動改善を実行しますか？");
    if (!isConfirmed) return;

    try {
      await autoImproveSkill(skillName);
      setImprovementResult(null);
    } catch {
      // store action 内部でエラーをskillErrorに格納済み。UIクラッシュ防止
    }
  }, [skillName, autoImproveSkill]);

  // ---- Effects ----

  useEffect(() => {
    handleAnalyze();
  }, [handleAnalyze]);

  return {
    analysis,
    isAnalyzing,
    isImproving,
    selectedSuggestions,
    error,
    improvementResult,
    handleAnalyze,
    handleToggleSuggestion,
    handleSelectAutoFixable,
    handleApplySelected,
    handleAutoImprove,
  };
};
