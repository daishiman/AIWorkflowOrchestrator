/**
 * DiffPreview - 差分プレビューパネル
 *
 * @description Monaco Diff Editorを使用して差分をプレビューし、適用/却下を行うコンポーネント
 */

import React, { memo, useCallback, useEffect, useRef } from "react";
import type { GeneratedResult } from "@/renderer/features/workspace-chat-edit/types";

/**
 * Monaco Editor の差分エディタインターフェース
 * @see https://microsoft.github.io/monaco-editor/
 */
interface MonacoDiffEditorRef {
  getOriginalEditor: () => unknown;
  getModifiedEditor: () => unknown;
  dispose: () => void;
}

/**
 * DiffPreview Props
 */
interface DiffPreviewProps {
  /** 生成結果 */
  result: GeneratedResult;
  /** 適用ハンドラ */
  onApprove: () => void;
  /** 却下ハンドラ */
  onReject: () => void;
  /** 閉じるハンドラ */
  onClose?: () => void;
  /** ローディング状態 */
  isLoading?: boolean;
}

/**
 * 差分統計を計算
 */
const calculateDiffStats = (
  result: GeneratedResult,
): { added: number; removed: number; modified: number } => {
  return result.diffHunks.reduce(
    (acc, hunk) => {
      if (hunk.type === "add") {
        acc.added += hunk.newLines.length;
      } else if (hunk.type === "remove") {
        acc.removed += hunk.originalLines.length;
      } else if (hunk.type === "modify") {
        acc.modified += Math.max(
          hunk.originalLines.length,
          hunk.newLines.length,
        );
      }
      return acc;
    },
    { added: 0, removed: 0, modified: 0 },
  );
};

/**
 * 言語からMonaco言語IDへのマッピング
 */
const getMonacoLanguage = (language: string): string => {
  const mapping: Record<string, string> = {
    typescript: "typescript",
    javascript: "javascript",
    python: "python",
    rust: "rust",
    go: "go",
    java: "java",
    markdown: "markdown",
    json: "json",
    html: "html",
    css: "css",
    plaintext: "plaintext",
  };
  return mapping[language] || "plaintext";
};

/**
 * DiffPreview コンポーネント
 */
export const DiffPreview: React.FC<DiffPreviewProps> = memo(
  ({ result, onApprove, onReject, onClose, isLoading = false }) => {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<MonacoDiffEditorRef | null>(null);

    // 差分統計
    const stats = calculateDiffStats(result);

    // Monaco Diff Editor の初期化
    useEffect(() => {
      let mounted = true;

      const initEditor = async () => {
        if (!editorContainerRef.current || !mounted) return;

        try {
          // 動的インポートでMonacoを読み込み
          const monaco = await import("monaco-editor");

          if (!mounted || !editorContainerRef.current) return;

          // 既存のエディタを破棄
          if (editorRef.current) {
            editorRef.current.dispose();
          }

          // Diff Editor を作成
          const editor = monaco.editor.createDiffEditor(
            editorContainerRef.current,
            {
              automaticLayout: true,
              readOnly: true,
              renderSideBySide: true,
              enableSplitViewResizing: true,
              originalEditable: false,
              ignoreTrimWhitespace: false,
              renderIndicators: true,
              scrollBeyondLastLine: false,
              minimap: { enabled: false },
            },
          );

          // モデルを設定
          const originalModel = monaco.editor.createModel(
            result.originalContent,
            getMonacoLanguage(result.command.targetContextId), // 言語は後で取得が必要
          );

          const modifiedModel = monaco.editor.createModel(
            result.generatedContent,
            getMonacoLanguage(result.command.targetContextId),
          );

          editor.setModel({
            original: originalModel,
            modified: modifiedModel,
          });

          editorRef.current = editor as unknown as MonacoDiffEditorRef;
        } catch (error) {
          console.error("Failed to initialize Monaco Diff Editor:", error);
        }
      };

      initEditor();

      return () => {
        mounted = false;
        if (editorRef.current) {
          editorRef.current.dispose();
          editorRef.current = null;
        }
      };
    }, [result.originalContent, result.generatedContent]);

    // キーボードショートカット
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        // Ctrl/Cmd + Enter で適用
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          onApprove();
        }
        // Escape で却下/閉じる
        if (e.key === "Escape") {
          e.preventDefault();
          if (onClose) {
            onClose();
          } else {
            onReject();
          }
        }
      },
      [onApprove, onReject, onClose],
    );

    return (
      <div
        className="flex flex-col h-full bg-white dark:bg-gray-800"
        role="dialog"
        aria-label="差分プレビュー"
        aria-describedby="diff-preview-description"
        onKeyDown={handleKeyDown}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              差分プレビュー
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {result.targetFilePath.split("/").pop()}
            </span>
          </div>

          {/* 差分統計 */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600 dark:text-green-400">
              +{stats.added} 追加
            </span>
            <span className="text-red-600 dark:text-red-400">
              -{stats.removed} 削除
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">
              ~{stats.modified} 変更
            </span>
          </div>
        </div>

        {/* 説明文（スクリーンリーダー向け） */}
        <p id="diff-preview-description" className="sr-only">
          元のファイルと生成されたファイルの差分を表示しています。
          適用ボタンで変更をファイルに書き込み、却下ボタンで変更を破棄します。
        </p>

        {/* Monaco Diff Editor */}
        <div ref={editorContainerRef} className="flex-1 min-h-0" />

        {/* フッター */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">
              ⌘+Enter
            </kbd>
            <span className="ml-1">適用</span>
            <span className="mx-2">|</span>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">
              Esc
            </kbd>
            <span className="ml-1">閉じる</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReject}
              disabled={isLoading}
              className="
                px-4 py-2 text-sm font-medium rounded-md
                text-gray-700 dark:text-gray-300
                bg-gray-100 dark:bg-gray-700
                hover:bg-gray-200 dark:hover:bg-gray-600
                focus:outline-none focus:ring-2 focus:ring-gray-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-150
              "
              aria-label="変更を却下"
            >
              却下
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={isLoading}
              className="
                px-4 py-2 text-sm font-medium rounded-md
                text-white
                bg-blue-600 hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-150
              "
              aria-label="変更を適用"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  適用中...
                </span>
              ) : (
                "適用"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

DiffPreview.displayName = "DiffPreview";

export default DiffPreview;
