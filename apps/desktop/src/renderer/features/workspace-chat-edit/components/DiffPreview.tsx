/**
 * DiffPreview コンポーネント
 *
 * 差分プレビューモーダルコンポーネント
 */

import type { FC, KeyboardEvent, MouseEvent } from "react";
import { useEffect, useRef, useMemo, useId, memo } from "react";
import { DiffEditor } from "./DiffEditor";
import { ApplyControls } from "./ApplyControls";
import type { GeneratedResult, ApplyResult } from "../types";
import { cn } from "../../../lib/utils";
import { CloseIcon } from "./common";

export interface DiffPreviewProps {
  /** 生成結果 */
  result: GeneratedResult;
  /** 表示状態 */
  isOpen: boolean;
  /** 閉じる時コールバック */
  onClose: () => void;
  /** 適用成功時コールバック */
  onApplied?: (result: ApplyResult) => void;
  /** 却下時コールバック */
  onRejected?: () => void;
}

/**
 * ファイル拡張子から言語を検出
 */
const detectLanguage = (filePath: string): string => {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    json: "json",
    md: "markdown",
    css: "css",
    scss: "scss",
    html: "html",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    go: "go",
    rs: "rust",
    java: "java",
    c: "c",
    cpp: "cpp",
    h: "c",
    hpp: "cpp",
  };
  return languageMap[ext || ""] || "plaintext";
};

/**
 * ファイル名をパスから取得
 */
const getFileName = (filePath: string): string => {
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] || filePath;
};

/**
 * DiffPreview コンポーネント
 *
 * React.memo で最適化
 */
export const DiffPreview: FC<DiffPreviewProps> = memo(
  ({ result, isOpen, onClose, onApplied, onRejected }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const titleId = useId();

    // 差分統計を計算
    const diffStats = useMemo(() => {
      let added = 0;
      let removed = 0;

      for (const hunk of result.diffHunks) {
        if (hunk.type === "add") {
          added += hunk.newLines.length;
        } else if (hunk.type === "remove") {
          removed += hunk.originalLines.length;
        } else if (hunk.type === "modify") {
          added += hunk.newLines.length;
          removed += hunk.originalLines.length;
        }
      }

      return { added, removed };
    }, [result.diffHunks]);

    // キーボードイベントハンドラ
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    // オーバーレイクリックハンドラ
    const handleOverlayClick = (e: MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    // 適用ハンドラ
    const handleApplied = (applyResult: ApplyResult) => {
      onApplied?.(applyResult);
    };

    // 却下ハンドラ
    const handleRejected = () => {
      onRejected?.();
    };

    // フォーカストラップ
    useEffect(() => {
      if (!isOpen) return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      // フォーカス可能な要素を取得
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      // 初期フォーカス
      firstElement?.focus();

      const handleTab = (e: globalThis.KeyboardEvent) => {
        if (e.key !== "Tab") return;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      };

      document.addEventListener("keydown", handleTab);
      return () => document.removeEventListener("keydown", handleTab);
    }, [isOpen]);

    // 表示されていない場合は何も表示しない
    if (!isOpen) {
      return null;
    }

    const language = detectLanguage(result.targetFilePath);
    const fileName = getFileName(result.targetFilePath);
    const isDisabled = result.status !== "pending";

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed inset-0 z-50",
          "flex items-center justify-center",
          "bg-black/50",
        )}
        onKeyDown={handleKeyDown}
        data-testid="diff-preview-overlay"
        onClick={handleOverlayClick}
      >
        <div
          ref={dialogRef}
          className={cn(
            "w-full max-w-5xl max-h-[90vh]",
            "bg-white dark:bg-slate-900 rounded-lg shadow-xl",
            "flex flex-col overflow-hidden",
            "m-4",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <h2
                id={titleId}
                className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                title={result.targetFilePath}
              >
                {fileName}
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">+{diffStats.added}</span>
                <span className="text-red-600">-{diffStats.removed}</span>
              </div>
            </div>
            <button
              type="button"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onClose}
              aria-label="閉じる"
            >
              <CloseIcon size="lg" className="text-slate-500" />
            </button>
          </div>

          {/* DiffEditor */}
          <div className="flex-1 overflow-hidden">
            <DiffEditor
              original={result.originalContent}
              modified={result.generatedContent}
              language={language}
              height="100%"
            />
          </div>

          {/* フッター（ApplyControls） */}
          <div className="flex justify-end gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <ApplyControls
              resultId={result.id}
              onApplied={handleApplied}
              onRejected={handleRejected}
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
    );
  },
);

DiffPreview.displayName = "DiffPreview";

export default DiffPreview;
