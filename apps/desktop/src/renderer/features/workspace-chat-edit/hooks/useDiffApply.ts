/**
 * useDiffApply - 差分計算と適用フック
 *
 * @description 差分の計算、プレビュー、ファイルへの適用を管理するカスタムフック
 */

import { useCallback, useMemo } from "react";
import { useStore } from "../../../store";
import type { DiffHunk, GeneratedResult, ApplyResult } from "../types";

/**
 * 差分計算オプション
 */
interface _DiffOptions {
  /** コンテキスト行数（差分の前後に表示する行数） */
  contextLines?: number;
  /** 空白の違いを無視するか */
  ignoreWhitespace?: boolean;
}

/**
 * useDiffApply フック戻り値型
 */
export interface UseDiffApplyReturn {
  /** 現在の生成結果 */
  currentResult: GeneratedResult | null;
  /** 差分プレビュー表示中 */
  isDiffPreviewOpen: boolean;
  /** ローディング中 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 差分を計算する */
  calculateDiff: (original: string, generated: string) => DiffHunk[];
  /** 結果を適用する */
  applyResult: (resultId: string) => Promise<ApplyResult>;
  /** 結果を却下する */
  rejectResult: (resultId: string) => void;
  /** 差分プレビューを開く */
  openDiffPreview: (resultId: string) => void;
  /** 差分プレビューを閉じる */
  closeDiffPreview: () => void;
}

/**
 * 行単位で差分を計算
 * Myers diff algorithmの簡易版
 */
const calculateLineDiff = (
  originalLines: string[],
  newLines: string[],
): DiffHunk[] => {
  const hunks: DiffHunk[] = [];

  // LCS (Longest Common Subsequence) を使用した差分計算
  const lcs = buildLCS(originalLines, newLines);
  let originalIndex = 0;
  let newIndex = 0;
  let lcsIndex = 0;

  while (originalIndex < originalLines.length || newIndex < newLines.length) {
    // LCS の次の要素を探す
    const lcsLine = lcsIndex < lcs.length ? lcs[lcsIndex] : null;

    // 変更されたセクションを収集
    const removedLines: string[] = [];
    const addedLines: string[] = [];
    const originalStartLine = originalIndex + 1;
    const newStartLine = newIndex + 1;

    // 削除された行を収集
    while (
      originalIndex < originalLines.length &&
      (lcsLine === null || originalLines[originalIndex] !== lcsLine)
    ) {
      removedLines.push(originalLines[originalIndex]);
      originalIndex++;
    }

    // 追加された行を収集
    while (
      newIndex < newLines.length &&
      (lcsLine === null || newLines[newIndex] !== lcsLine)
    ) {
      addedLines.push(newLines[newIndex]);
      newIndex++;
    }

    // Hunkを作成
    if (removedLines.length > 0 && addedLines.length > 0) {
      // modify
      hunks.push({
        type: "modify",
        originalStartLine,
        originalEndLine: originalStartLine + removedLines.length - 1,
        newStartLine,
        newEndLine: newStartLine + addedLines.length - 1,
        originalLines: removedLines,
        newLines: addedLines,
      });
    } else if (removedLines.length > 0) {
      // remove
      hunks.push({
        type: "remove",
        originalStartLine,
        originalEndLine: originalStartLine + removedLines.length - 1,
        newStartLine,
        newEndLine: newStartLine - 1,
        originalLines: removedLines,
        newLines: [],
      });
    } else if (addedLines.length > 0) {
      // add
      hunks.push({
        type: "add",
        originalStartLine,
        originalEndLine: originalStartLine - 1,
        newStartLine,
        newEndLine: newStartLine + addedLines.length - 1,
        originalLines: [],
        newLines: addedLines,
      });
    }

    // LCSの行をスキップ
    if (lcsLine !== null && originalIndex < originalLines.length) {
      originalIndex++;
      newIndex++;
      lcsIndex++;
    }
  }

  return hunks;
};

/**
 * LCS (Longest Common Subsequence) を構築
 */
const buildLCS = (a: string[], b: string[]): string[] => {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // DP テーブルを構築
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // LCS を再構築
  const lcs: string[] = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
};

/**
 * useDiffApply フック
 */
export const useDiffApply = (): UseDiffApplyReturn => {
  // Zustand store から状態を取得
  // ChatEditSliceはAppStoreにフラットにマージされる
  const generatedResults = useStore((state) => state.generatedResults);
  const currentResultId = useStore((state) => state.currentResultId);
  const isDiffPreviewOpen = useStore((state) => state.isDiffPreviewOpen);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);

  // Actions
  const approveResultAction = useStore((state) => state.approveResult);
  const rejectResultAction = useStore((state) => state.rejectResult);
  const openDiffPreviewAction = useStore((state) => state.openDiffPreview);
  const closeDiffPreviewAction = useStore((state) => state.closeDiffPreview);
  const setErrorAction = useStore((state) => state.setError);

  /**
   * 現在の結果を取得
   */
  const currentResult = useMemo(() => {
    if (!currentResultId) return null;
    return (
      generatedResults.find((r: GeneratedResult) => r.id === currentResultId) ??
      null
    );
  }, [generatedResults, currentResultId]);

  /**
   * 差分を計算
   */
  const calculateDiff = useCallback(
    (original: string, generated: string): DiffHunk[] => {
      // 同じ内容の場合は空配列
      if (original === generated) {
        return [];
      }

      const originalLines = original.split("\n");
      const newLines = generated.split("\n");

      return calculateLineDiff(originalLines, newLines);
    },
    [],
  );

  /**
   * 結果を適用
   */
  const applyResult = useCallback(
    async (resultId: string): Promise<ApplyResult> => {
      if (!approveResultAction) {
        return {
          success: false,
          filePath: "",
          appliedAt: new Date(),
          error: "Action not available",
        };
      }

      try {
        return await approveResultAction(resultId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setErrorAction?.("WRITE_ERROR");
        return {
          success: false,
          filePath: "",
          appliedAt: new Date(),
          error: errorMessage,
        };
      }
    },
    [approveResultAction, setErrorAction],
  );

  /**
   * 結果を却下
   */
  const rejectResult = useCallback(
    (resultId: string) => {
      rejectResultAction?.(resultId);
    },
    [rejectResultAction],
  );

  /**
   * 差分プレビューを開く
   */
  const openDiffPreview = useCallback(
    (resultId: string) => {
      openDiffPreviewAction?.(resultId);
    },
    [openDiffPreviewAction],
  );

  /**
   * 差分プレビューを閉じる
   */
  const closeDiffPreview = useCallback(() => {
    closeDiffPreviewAction?.();
  }, [closeDiffPreviewAction]);

  return {
    currentResult,
    isDiffPreviewOpen,
    isLoading,
    error,
    calculateDiff,
    applyResult,
    rejectResult,
    openDiffPreview,
    closeDiffPreview,
  };
};

export default useDiffApply;
