/**
 * FileContextDropZone コンポーネント
 *
 * ファイルドラッグ＆ドロップを受け付けるゾーンコンポーネント
 */

import type { FC, DragEvent, ReactNode } from "react";
import { useRef } from "react";
import { useFileContext } from "../hooks";
import { MAX_FILE_SIZE, MAX_FILE_CONTEXTS } from "../types";
import { cn } from "../../../lib/utils";

export interface FileContextDropZoneProps {
  /** ファイルドロップ時コールバック */
  onFilesDropped?: (files: File[]) => void;
  /** 最大ファイル数（デフォルト: 10） */
  maxFiles?: number;
  /** 最大ファイルサイズ（デフォルト: 10MB） */
  maxFileSize?: number;
  /** 子要素 */
  children?: ReactNode;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * Electronのファイルパス拡張
 */
interface ElectronFile extends File {
  path?: string;
}

/**
 * FileContextDropZone コンポーネント
 */
export const FileContextDropZone: FC<FileContextDropZoneProps> = ({
  onFilesDropped,
  maxFiles: _maxFiles = MAX_FILE_CONTEXTS, // Reserved for future validation
  maxFileSize = MAX_FILE_SIZE,
  children,
  className,
}) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const {
    isDragging,
    error,
    canAddContext,
    setDragging,
    attachFile,
    clearError,
  } = useFileContext();

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // ドロップゾーン外に出た場合のみ
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setDragging(false);
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files) as ElectronFile[];

    // ファイルがない場合は終了
    if (files.length === 0) {
      return;
    }

    // バリデーション: サイズチェック
    for (const file of files) {
      if (file.size > maxFileSize) {
        // エラーはuseFileContext内で処理される
        return;
      }
    }

    // バリデーション: コンテキスト追加可能チェック
    if (!canAddContext) {
      // エラーはuseFileContext内で処理される
      return;
    }

    // コールバック呼び出し
    onFilesDropped?.(files);

    // 各ファイルを添付
    for (const file of files) {
      if (file.path) {
        try {
          await attachFile(file.path);
        } catch {
          // エラーはuseFileContext内で処理される
        }
      }
    }
  };

  return (
    <div
      ref={dropZoneRef}
      role="region"
      aria-dropeffect="copy"
      aria-label="ファイルドロップゾーン"
      className={cn("relative", className)}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 子要素 */}
      {children}

      {/* ドロップオーバーレイ */}
      {isDragging && (
        <div
          role="status"
          aria-live="assertive"
          className={cn(
            "absolute inset-0 z-50",
            "bg-blue-500/10 border-2 border-dashed border-blue-500",
            "flex items-center justify-center rounded-lg",
          )}
        >
          <div className="flex flex-col items-center gap-2 p-4 bg-white/90 dark:bg-slate-900/90 rounded-lg shadow-lg">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              ファイルをドロップして添付
            </span>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div
          className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
          role="alert"
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            type="button"
            className="mt-2 text-xs text-red-700 dark:text-red-300 underline"
            onClick={clearError}
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};

export default FileContextDropZone;
