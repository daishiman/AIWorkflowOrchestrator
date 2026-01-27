/**
 * FileAttachmentButton コンポーネント
 *
 * ファイル選択ダイアログを開くボタンコンポーネント
 */

import type { FC, KeyboardEvent, ReactNode } from "react";
import { memo, useState } from "react";
import { cn } from "../../../lib/utils";
import { useFileContext } from "../hooks";

/**
 * FileAttachmentButton Props
 */
export interface FileAttachmentButtonProps {
  /** ファイル選択後コールバック */
  onFilesSelected?: (paths: string[]) => void;
  /** 複数選択許可（デフォルト: true） */
  multiple?: boolean;
  /** 許可する拡張子（デフォルト: ['*']） */
  accept?: string[];
  /** 最大選択数（デフォルト: 10） */
  maxFiles?: number;
  /** 無効化フラグ */
  disabled?: boolean;
  /** 追加CSSクラス */
  className?: string;
  /** ボタンテキスト（デフォルト: "ファイルを添付"） */
  children?: ReactNode;
}

/**
 * FileAttachmentButton コンポーネント
 *
 * React.memo で最適化
 */
export const FileAttachmentButton: FC<FileAttachmentButtonProps> = memo(
  ({
    onFilesSelected,
    multiple = true,
    accept = ["*"],
    maxFiles = 10,
    disabled = false,
    className,
    children,
  }) => {
    const { canAddContext, attachFile } = useFileContext();
    const [isLoading, setIsLoading] = useState(false);

    const isDisabled = disabled || !canAddContext || isLoading;
    const buttonText = children ?? "ファイルを添付";

    /**
     * ファイル選択ダイアログを開く
     */
    const handleOpenDialog = async () => {
      if (isDisabled) return;

      // electronAPIの存在確認
      const electronAPI = (
        window as unknown as {
          electronAPI?: {
            fileSelection: {
              openDialog: (options: {
                title: string;
                multiSelections: boolean;
                filterCategory?: string;
                customFilters?: Array<{ name: string; extensions: string[] }>;
              }) => Promise<{
                success: boolean;
                data?: { canceled: boolean; filePaths: string[] };
                error?: string;
              }>;
            };
          };
        }
      ).electronAPI;

      if (!electronAPI?.fileSelection?.openDialog) {
        console.error("electronAPI.fileSelection.openDialog is not available");
        return;
      }

      setIsLoading(true);
      try {
        const result = await electronAPI.fileSelection.openDialog({
          title: "ファイルを選択",
          multiSelections: multiple,
          filterCategory: accept?.[0] === "*" ? "all" : undefined,
          customFilters:
            accept?.[0] !== "*"
              ? [
                  {
                    name: "Allowed Files",
                    extensions: accept.map((ext) => ext.replace(".", "")),
                  },
                ]
              : undefined,
        });

        if (!result.success || result.data?.canceled) {
          return;
        }

        const filePaths = result.data?.filePaths ?? [];

        // 最大ファイル数制限
        const limitedPaths = filePaths.slice(0, maxFiles);

        // 各ファイルを添付
        for (const filePath of limitedPaths) {
          try {
            await attachFile(filePath);
          } catch (error) {
            console.error(`Failed to attach file: ${filePath}`, error);
          }
        }

        // コールバック通知
        onFilesSelected?.(limitedPaths);
      } finally {
        setIsLoading(false);
      }
    };

    /**
     * キーボードハンドラ
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleOpenDialog();
      }
    };

    return (
      <button
        type="button"
        role="button"
        className={cn(
          // レイアウト
          "inline-flex items-center gap-2 px-4 py-2",
          // 外観
          "bg-blue-500 text-white rounded-md",
          "border border-blue-600",
          // ホバー
          "hover:bg-blue-600",
          // 無効化
          "disabled:bg-slate-300 disabled:cursor-not-allowed disabled:text-slate-500",
          // フォーカス
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          // トランジション
          "transition-colors duration-200",
          className,
        )}
        onClick={handleOpenDialog}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        aria-label="ファイルを添付"
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : 0}
      >
        {/* 添付アイコン (Paperclip) */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>

        {/* ボタンテキスト */}
        <span>{buttonText}</span>
      </button>
    );
  },
);

FileAttachmentButton.displayName = "FileAttachmentButton";

export default FileAttachmentButton;
