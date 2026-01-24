/**
 * useFileContext - ファイルコンテキスト管理フック
 *
 * @description ファイルの添付・削除・読み込みを管理するカスタムフック
 */

import { useCallback } from "react";
import { useStore } from "../../../store";
import type { FileContext, FileReadResult, TextSelection } from "../types";
import { MAX_FILE_CONTEXTS, MAX_FILE_SIZE } from "../types";

/**
 * chatEditAPI インターフェース（Preload API）
 */
interface ChatEditAPI {
  readFile: (filePath: string) => Promise<FileReadResult>;
  detectLanguage: (filePath: string) => Promise<string>;
  getEditorSelection: () => Promise<TextSelection | null>;
}

/**
 * グローバルウィンドウにchatEditAPIを追加
 */
declare global {
  interface Window {
    chatEditAPI?: ChatEditAPI;
  }
}

/**
 * useFileContext フック戻り値型
 */
export interface UseFileContextReturn {
  /** 添付されたファイルコンテキスト一覧 */
  fileContexts: FileContext[];
  /** アクティブなコンテキストID */
  activeContextId: string | null;
  /** ドラッグ中フラグ */
  isDragging: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 警告メッセージ（大きいファイル等） */
  warning: string | null;
  /** リトライ可能かどうか */
  isRetryable: boolean;
  /** ファイルを添付する */
  attachFile: (filePath: string, selection?: TextSelection) => Promise<void>;
  /** ファイルコンテキストを追加（直接追加用） */
  addFileContext: (context: Omit<FileContext, "id" | "addedAt">) => void;
  /** ファイルコンテキストを削除 */
  removeFileContext: (id: string) => void;
  /** 全コンテキストをクリア */
  clearAllContexts: () => void;
  /** アクティブコンテキストを設定 */
  setActiveContext: (id: string | null) => void;
  /** ドラッグ状態を設定 */
  setDragging: (dragging: boolean) => void;
  /** エラーをクリア */
  clearError: () => void;
  /** ワークスペースから利用可能なファイルを取得 */
  getAvailableFiles: () => { path: string; name: string }[];
  /** コンテキストを追加可能か */
  canAddContext: boolean;
  /** コンテキストの合計サイズ */
  totalContextSize: number;
}

/**
 * ファイル名をパスから取得
 */
const getFileNameFromPath = (filePath: string): string => {
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] || filePath;
};

/**
 * useFileContext フック
 */
export const useFileContext = (): UseFileContextReturn => {
  // Zustand storeからstate取得
  // ChatEditSliceはAppStoreにフラットにマージされる
  const fileContexts = useStore((state) => state.fileContexts);
  const activeContextId = useStore((state) => state.activeContextId);
  const isDragging = useStore((state) => state.isDragging);
  const storeError = useStore((state) => state.error);

  // Actions
  const addFileContextAction = useStore((state) => state.addFileContext);
  const removeFileContextAction = useStore((state) => state.removeFileContext);
  const clearAllContextsAction = useStore((state) => state.clearAllContexts);
  const setActiveContextAction = useStore((state) => state.setActiveContext);
  const setDraggingAction = useStore((state) => state.setDragging);
  const setErrorAction = useStore((state) => state.setError);

  // workspaceSliceからファイル一覧を取得
  // TODO: Workspace型にopenFilesプロパティを追加するか、別の方法でファイル一覧を取得する
  const openFiles: Array<{ path: string; name?: string }> = [];

  // 内部状態
  const warning: string | null = null;
  const isRetryable = storeError === "READ_ERROR" || storeError === "LLM_ERROR";

  /**
   * ファイルを添付
   */
  const attachFile = useCallback(
    async (filePath: string, selection?: TextSelection): Promise<void> => {
      if (!window.chatEditAPI) {
        setErrorAction?.("API_NOT_AVAILABLE");
        throw new Error("chatEditAPI is not available");
      }

      // 重複チェック
      const isDuplicate = fileContexts.some(
        (c: FileContext) => c.filePath === filePath,
      );
      if (isDuplicate) {
        setErrorAction?.("DUPLICATE_FILE");
        throw new Error("File already attached");
      }

      // 最大数チェック
      if (fileContexts.length >= MAX_FILE_CONTEXTS) {
        setErrorAction?.("MAX_CONTEXTS_EXCEEDED");
        throw new Error("Maximum number of contexts reached");
      }

      // ファイル読み込み
      const result = await window.chatEditAPI.readFile(filePath);

      if (!result.success) {
        const errorCode = result.error?.code || "READ_ERROR";
        setErrorAction?.(errorCode);
        throw new Error(result.error?.message || "Failed to read file");
      }

      // ファイルサイズチェック
      if (result.fileSize && result.fileSize > MAX_FILE_SIZE) {
        setErrorAction?.("TOO_LARGE");
        throw new Error("File size exceeds 10MB limit");
      }

      // コンテキスト追加
      addFileContextAction?.({
        filePath,
        fileName: getFileNameFromPath(filePath),
        content: result.content || "",
        selection,
        language: result.language || "plaintext",
        fileSize: result.fileSize || 0,
      });
    },
    [fileContexts, addFileContextAction, setErrorAction],
  );

  /**
   * ファイルコンテキストを直接追加
   */
  const addFileContext = useCallback(
    (context: Omit<FileContext, "id" | "addedAt">) => {
      // 選択範囲のバリデーション
      if (context.selection) {
        const { startLine, endLine, startColumn, endColumn } =
          context.selection;

        // 逆順チェック
        if (
          startLine > endLine ||
          (startLine === endLine && startColumn > endColumn)
        ) {
          setErrorAction?.("INVALID_SELECTION");
          throw new Error("Invalid selection range");
        }

        // 範囲外チェック
        const lineCount = context.content.split("\n").length;
        if (endLine > lineCount) {
          setErrorAction?.("SELECTION_OUT_OF_RANGE");
          throw new Error("Selection out of range");
        }
      }

      addFileContextAction?.(context);
    },
    [addFileContextAction, setErrorAction],
  );

  /**
   * ファイルコンテキストを削除
   */
  const removeFileContext = useCallback(
    (id: string) => {
      removeFileContextAction?.(id);
    },
    [removeFileContextAction],
  );

  /**
   * 全コンテキストをクリア
   */
  const clearAllContexts = useCallback(() => {
    clearAllContextsAction?.();
  }, [clearAllContextsAction]);

  /**
   * アクティブコンテキストを設定
   */
  const setActiveContext = useCallback(
    (id: string | null) => {
      setActiveContextAction?.(id);
    },
    [setActiveContextAction],
  );

  /**
   * ドラッグ状態を設定
   */
  const setDragging = useCallback(
    (dragging: boolean) => {
      setDraggingAction?.(dragging);
    },
    [setDraggingAction],
  );

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setErrorAction?.(null);
  }, [setErrorAction]);

  /**
   * 利用可能なファイルを取得
   */
  const getAvailableFiles = useCallback(() => {
    return openFiles.map((file: { path: string; name?: string }) => ({
      path: file.path,
      name: file.name || getFileNameFromPath(file.path),
    }));
  }, [openFiles]);

  // 派生状態
  const canAddContext = fileContexts.length < MAX_FILE_CONTEXTS;
  const totalContextSize = fileContexts.reduce(
    (sum: number, c: FileContext) => sum + c.fileSize,
    0,
  );

  return {
    fileContexts,
    activeContextId,
    isDragging,
    error: storeError,
    warning,
    isRetryable,
    attachFile,
    addFileContext,
    removeFileContext,
    clearAllContexts,
    setActiveContext,
    setDragging,
    clearError,
    getAvailableFiles,
    canAddContext,
    totalContextSize,
  };
};

export default useFileContext;
