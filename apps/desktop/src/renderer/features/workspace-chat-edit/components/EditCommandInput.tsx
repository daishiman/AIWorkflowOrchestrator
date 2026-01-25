/**
 * EditCommandInput コンポーネント
 *
 * 編集コマンドの入力コンポーネント
 */

import type { FC, KeyboardEvent, ChangeEvent } from "react";
import { useState, useCallback, memo } from "react";
import type {
  EditCommand,
  EditCommandType,
  EditCommandOptions,
} from "../types";
import { cn } from "../../../lib/utils";
import { Spinner } from "./common";

export interface EditCommandInputProps {
  /** 対象コンテキストID */
  targetContextId: string;
  /** 送信時コールバック */
  onSubmit: (command: EditCommand) => void;
  /** 無効化フラグ */
  disabled?: boolean;
  /** ローディング状態 */
  isLoading?: boolean;
  /** 初期コマンドタイプ */
  initialType?: EditCommandType;
  /** デフォルトオプション */
  defaultOptions?: EditCommandOptions;
  /** サイズバリアント */
  size?: "sm" | "md";
  /** 送信後にリセットするか */
  resetOnSubmit?: boolean;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * コマンドタイプのラベル
 */
const commandTypeLabels: Record<EditCommandType, string> = {
  continue: "続きを書く",
  refactor: "リファクタリング",
  "generate-test": "テスト生成",
  "add-comment": "コメント追加",
  custom: "カスタム",
};

/**
 * EditCommandInput コンポーネント
 *
 * React.memo で最適化
 */
export const EditCommandInput: FC<EditCommandInputProps> = memo(
  ({
    targetContextId,
    onSubmit,
    disabled = false,
    isLoading = false,
    initialType = "continue",
    defaultOptions,
    size = "md",
    resetOnSubmit = false,
    className,
  }) => {
    const [commandType, setCommandType] =
      useState<EditCommandType>(initialType);
    const [instruction, setInstruction] = useState("");

    const isDisabled = disabled || isLoading;
    const isCustom = commandType === "custom";
    const canSubmit = !isCustom || instruction.trim().length > 0;

    // コマンドタイプ変更ハンドラ
    const handleTypeChange = useCallback(
      (e: ChangeEvent<HTMLSelectElement>) => {
        setCommandType(e.target.value as EditCommandType);
      },
      [],
    );

    // 指示入力ハンドラ
    const handleInstructionChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        setInstruction(e.target.value);
      },
      [],
    );

    // 送信ハンドラ
    const handleSubmit = useCallback(() => {
      if (!canSubmit || isDisabled) return;

      const command: EditCommand = {
        type: commandType,
        targetContextId,
        instruction: isCustom ? instruction.trim() : undefined,
        options: defaultOptions,
      };

      onSubmit(command);

      if (resetOnSubmit && isCustom) {
        setInstruction("");
      }
    }, [
      commandType,
      targetContextId,
      instruction,
      isCustom,
      canSubmit,
      isDisabled,
      defaultOptions,
      onSubmit,
      resetOnSubmit,
    ]);

    // キーボードイベントハンドラ
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        // Ctrl+Enter または Cmd+Enter で送信
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          handleSubmit();
        }
      },
      [handleSubmit],
    );

    return (
      <form
        role="form"
        className={cn("flex flex-col gap-3", className)}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        onKeyDown={handleKeyDown}
        aria-busy={isLoading}
      >
        {/* コマンドタイプセレクタ */}
        <div className="flex items-center gap-2">
          <select
            value={commandType}
            onChange={handleTypeChange}
            className={cn(
              "flex-1 px-3 py-2 rounded-md",
              "border border-slate-300 dark:border-slate-600",
              "bg-white dark:bg-slate-800",
              "text-slate-900 dark:text-slate-100",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              size === "sm" && "px-2 py-1 text-sm",
            )}
            disabled={isDisabled}
            aria-label="コマンドタイプ"
          >
            {Object.entries(commandTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* カスタム指示入力（customタイプのみ） */}
        {isCustom && (
          <div className="flex flex-col gap-1">
            <textarea
              value={instruction}
              onChange={handleInstructionChange}
              placeholder="カスタム指示を入力..."
              maxLength={10000}
              className={cn(
                "w-full px-3 py-2 rounded-md resize-none",
                "border border-slate-300 dark:border-slate-600",
                "bg-white dark:bg-slate-800",
                "text-slate-900 dark:text-slate-100",
                "placeholder:text-slate-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                size === "sm" && "px-2 py-1 text-sm",
              )}
              rows={3}
              disabled={isDisabled}
              aria-label="カスタム指示"
            />
            <span className="text-xs text-slate-500">
              {instruction.length}/10,000文字
            </span>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          className={cn(
            "w-full px-4 py-2 rounded-md",
            "bg-blue-600 text-white font-medium",
            "hover:bg-blue-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "inline-flex items-center justify-center gap-2",
            size === "sm" && "px-3 py-1.5 text-sm",
          )}
          disabled={isDisabled || !canSubmit}
          aria-label="コマンドを実行"
        >
          {isLoading && <Spinner size="sm" />}
          送信
        </button>
      </form>
    );
  },
);

EditCommandInput.displayName = "EditCommandInput";

export default EditCommandInput;
