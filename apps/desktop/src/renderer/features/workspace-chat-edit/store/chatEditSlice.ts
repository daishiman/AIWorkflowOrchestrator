/**
 * chatEditSlice - workspace-chat-edit 機能の状態管理
 *
 * @description ファイルコンテキスト、生成結果、UI状態を管理するZustand Slice
 */

import type { StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  ChatEditSlice,
  ChatEditState,
  FileContext,
  GeneratedResult,
  GeneratedResultStatus,
  DiffHunk,
  ApplySummary,
} from "../types";
import { MAX_FILE_CONTEXTS } from "../types";

// ========================================
// Helper Functions
// ========================================

/**
 * 結果のステータスを更新するヘルパー関数
 */
const updateResultStatus = (
  results: GeneratedResult[],
  resultId: string,
  status: GeneratedResultStatus,
): GeneratedResult[] =>
  results.map((r) => (r.id === resultId ? { ...r, status } : r));

/**
 * DiffHunksからサマリーを計算するヘルパー関数
 */
const calculateDiffSummary = (diffHunks: DiffHunk[]): ApplySummary => ({
  linesAdded: diffHunks
    .filter((h) => h.type === "add")
    .reduce((sum, h) => sum + h.newLines.length, 0),
  linesRemoved: diffHunks
    .filter((h) => h.type === "remove")
    .reduce((sum, h) => sum + h.originalLines.length, 0),
  linesModified: diffHunks
    .filter((h) => h.type === "modify")
    .reduce((sum, h) => sum + h.newLines.length, 0),
});

// ========================================
// Initial State
// ========================================

/**
 * 初期状態
 */
const initialState: ChatEditState = {
  fileContexts: [],
  activeContextId: null,
  generatedResults: [],
  currentResultId: null,
  isLoading: false,
  isDiffPreviewOpen: false,
  error: null,
  isDragging: false,
};

/**
 * chatEditSlice 作成関数
 */
export const createChatEditSlice: StateCreator<ChatEditSlice> = (set, get) => ({
  // 初期状態
  ...initialState,

  /**
   * ファイルコンテキストを追加
   */
  addFileContext: (contextData) => {
    const state = get();

    // 最大数チェック
    if (state.fileContexts.length >= MAX_FILE_CONTEXTS) {
      set({ error: "MAX_CONTEXTS_EXCEEDED" });
      return;
    }

    // 重複チェック
    const isDuplicate = state.fileContexts.some(
      (c) => c.filePath === contextData.filePath,
    );
    if (isDuplicate) {
      set({ error: "DUPLICATE_FILE" });
      return;
    }

    const newContext: FileContext = {
      ...contextData,
      id: uuidv4(),
      addedAt: new Date(),
    };

    set({
      fileContexts: [...state.fileContexts, newContext],
      activeContextId: newContext.id,
      error: null,
    });
  },

  /**
   * ファイルコンテキストを削除
   */
  removeFileContext: (id) => {
    const state = get();
    const newContexts = state.fileContexts.filter((c) => c.id !== id);

    set({
      fileContexts: newContexts,
      activeContextId:
        state.activeContextId === id
          ? newContexts.length > 0
            ? newContexts[0].id
            : null
          : state.activeContextId,
    });
  },

  /**
   * 全コンテキストをクリア
   */
  clearAllContexts: () => {
    set({
      fileContexts: [],
      activeContextId: null,
    });
  },

  /**
   * アクティブコンテキストを設定
   */
  setActiveContext: (id) => {
    set({ activeContextId: id });
  },

  /**
   * 生成結果を設定
   */
  setGeneratedResult: (result) => {
    const state = get();
    const existingIndex = state.generatedResults.findIndex(
      (r) => r.id === result.id,
    );

    if (existingIndex >= 0) {
      // 既存の結果を更新
      const newResults = [...state.generatedResults];
      newResults[existingIndex] = result;
      set({
        generatedResults: newResults,
        currentResultId: result.id,
        isDiffPreviewOpen: true,
      });
    } else {
      // 新しい結果を追加
      set({
        generatedResults: [...state.generatedResults, result],
        currentResultId: result.id,
        isDiffPreviewOpen: true,
      });
    }
  },

  /**
   * 結果を承認（ファイル書き込み）
   */
  approveResult: async (resultId) => {
    const state = get();
    const result = state.generatedResults.find((r) => r.id === resultId);

    if (!result) {
      return {
        success: false,
        filePath: "",
        appliedAt: new Date(),
        error: "RESULT_NOT_FOUND",
      };
    }

    try {
      // IPC経由でファイル書き込み
      // window.chatEditAPI.writeFile() を呼び出す
      const chatEditAPI = (
        window as unknown as {
          chatEditAPI?: {
            writeFile: (
              filePath: string,
              content: string,
              options: { createBackup: boolean },
            ) => Promise<{
              success: boolean;
              backupPath?: string;
              error?: { code: string; message: string };
            }>;
          };
        }
      ).chatEditAPI;
      const writeResult = await chatEditAPI?.writeFile(
        result.targetFilePath,
        result.generatedContent,
        { createBackup: true },
      );

      if (!writeResult?.success) {
        set({ error: writeResult?.error?.code || "WRITE_ERROR" });
        return {
          success: false,
          filePath: result.targetFilePath,
          appliedAt: new Date(),
          error: writeResult?.error?.message || "Failed to write file",
        };
      }

      // ステータスを更新（ヘルパー関数を使用）
      set({
        generatedResults: updateResultStatus(
          state.generatedResults,
          resultId,
          "approved",
        ),
        isDiffPreviewOpen: false,
        currentResultId: null,
        error: null,
      });

      return {
        success: true,
        filePath: result.targetFilePath,
        appliedAt: new Date(),
        backupPath: writeResult.backupPath,
        summary: calculateDiffSummary(result.diffHunks),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({ error: "WRITE_ERROR" });
      return {
        success: false,
        filePath: result.targetFilePath,
        appliedAt: new Date(),
        error: errorMessage,
      };
    }
  },

  /**
   * 結果を却下（ヘルパー関数を使用）
   */
  rejectResult: (resultId) => {
    const state = get();

    set({
      generatedResults: updateResultStatus(
        state.generatedResults,
        resultId,
        "rejected",
      ),
      isDiffPreviewOpen: false,
      currentResultId: null,
    });
  },

  /**
   * 結果をクリア
   */
  clearResults: () => {
    set({
      generatedResults: [],
      currentResultId: null,
      isDiffPreviewOpen: false,
    });
  },

  /**
   * 差分プレビューを開く
   */
  openDiffPreview: (resultId) => {
    set({
      currentResultId: resultId,
      isDiffPreviewOpen: true,
    });
  },

  /**
   * 差分プレビューを閉じる
   */
  closeDiffPreview: () => {
    set({
      isDiffPreviewOpen: false,
      currentResultId: null,
    });
  },

  /**
   * ローディング状態を設定
   */
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  /**
   * エラーを設定
   */
  setError: (error) => {
    set({ error });
  },

  /**
   * ドラッグ状態を設定
   */
  setDragging: (dragging) => {
    set({ isDragging: dragging });
  },

  /**
   * 状態をリセット
   */
  reset: () => {
    set(initialState);
  },
});

/**
 * chatEditSlice セレクター
 */
export const chatEditSelectors = {
  /**
   * 現在の結果を取得
   */
  getCurrentResult: (state: ChatEditSlice): GeneratedResult | undefined => {
    if (!state.currentResultId) return undefined;
    return state.generatedResults.find((r) => r.id === state.currentResultId);
  },

  /**
   * アクティブなコンテキストを取得
   */
  getActiveContext: (state: ChatEditSlice): FileContext | undefined => {
    if (!state.activeContextId) return undefined;
    return state.fileContexts.find((c) => c.id === state.activeContextId);
  },

  /**
   * コンテキストの合計サイズを取得
   */
  getTotalContextSize: (state: ChatEditSlice): number => {
    return state.fileContexts.reduce((sum, c) => sum + c.fileSize, 0);
  },

  /**
   * 追加可能かどうか
   */
  canAddContext: (state: ChatEditSlice): boolean => {
    return state.fileContexts.length < MAX_FILE_CONTEXTS;
  },

  /**
   * ペンディング中の結果があるか
   */
  hasPendingResults: (state: ChatEditSlice): boolean => {
    return state.generatedResults.some((r) => r.status === "pending");
  },
};

export default createChatEditSlice;

// Export types
export type { ChatEditSlice, ChatEditState, ChatEditActions } from "../types";
