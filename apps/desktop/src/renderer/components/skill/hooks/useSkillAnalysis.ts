/**
 * @file useSkillAnalysis.ts
 * @description スキル分析ビューのビジネスロジック・状態管理カスタムフック
 * @feature skill-improver
 * @task TASK-10A-B (Phase 8 リファクタリング)
 *
 * SkillAnalysisView.tsx から状態管理ロジックを抽出。
 * - 分析実行・結果管理
 * - 提案選択トグル
 * - 選択適用
 * - 全自動改善
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  ImprovementResult,
  SkillAnalysis,
  Suggestion,
} from "@repo/shared/types/skill-improver";

// ============================================
// Types
// ============================================

export interface UseSkillAnalysisReturn {
  /** 分析結果（未取得時はnull） */
  analysis: SkillAnalysis | null;
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

const IMPROVEMENT_RESULT_PREVIEW_MS = 250;

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
  // ---- State ----
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isImproving, setIsImproving] = useState<boolean>(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(
    new Set(),
  );
  const [error, setError] = useState<string | null>(null);
  const [improvementResult, setImprovementResult] =
    useState<ImprovementResult | null>(null);
  const isMountedRef = useRef(true);

  // ---- Handlers ----

  const handleAnalyze = useCallback(async () => {
    if (!isMountedRef.current) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await window.electronAPI.skill.analyze(skillName);
      if (!isMountedRef.current) return;
      setAnalysis(result);
      setSelectedSuggestions(new Set());
    } catch (err) {
      if (!isMountedRef.current) return;
      const message =
        err instanceof Error ? err.message : "分析中にエラーが発生しました";
      setError(message);
      setAnalysis(null);
    } finally {
      if (isMountedRef.current) {
        setIsAnalyzing(false);
      }
    }
  }, [skillName]);

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

    setIsImproving(true);
    try {
      const result = await window.electronAPI.skill.applyImprovements(
        skillName,
        selected,
      );
      if (!isMountedRef.current) return;
      setImprovementResult(result);

      await new Promise((resolve) =>
        window.setTimeout(resolve, IMPROVEMENT_RESULT_PREVIEW_MS),
      );
      if (!isMountedRef.current) return;
      // 改善適用成功後に分析結果を再取得
      await handleAnalyze();
      if (isMountedRef.current) {
        setImprovementResult(null);
      }
    } catch {
      // エラー処理: 既存挙動を維持し、UIクラッシュのみ防止
    } finally {
      if (isMountedRef.current) {
        setIsImproving(false);
      }
    }
  }, [analysis, selectedSuggestions, skillName, handleAnalyze]);

  const handleAutoImprove = useCallback(async () => {
    const isConfirmed = window.confirm("全自動改善を実行しますか？");
    if (!isConfirmed) return;

    setIsImproving(true);
    try {
      const result = await window.electronAPI.skill.autoImprove(skillName);
      if (!isMountedRef.current) return;
      setImprovementResult(result);

      await new Promise((resolve) =>
        window.setTimeout(resolve, IMPROVEMENT_RESULT_PREVIEW_MS),
      );
      if (!isMountedRef.current) return;
      // 全自動改善成功後に分析結果を再取得
      await handleAnalyze();
      if (isMountedRef.current) {
        setImprovementResult(null);
      }
    } catch {
      // エラー処理: 既存挙動を維持し、UIクラッシュのみ防止
    } finally {
      if (isMountedRef.current) {
        setIsImproving(false);
      }
    }
  }, [skillName, handleAnalyze]);

  // ---- Effects ----

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
