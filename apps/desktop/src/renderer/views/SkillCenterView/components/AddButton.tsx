/**
 * AddButton Component
 *
 * ツール追加ボタン。モーフィングアニメーション付き。
 * - [追加する] -> スピナー -> チェック -> [追加済み!]
 * - idle / processing / success の3状態遷移
 * - P47 対策: variantStyles を Record 定数でモジュールスコープに export
 *
 * @module SkillCenterView/components/AddButton
 */

import React, { memo } from "react";
import clsx from "clsx";
import { Icon } from "../../../components/atoms/Icon";

export type AddButtonState = "idle" | "processing" | "success";

/** ボタン状態ごとのスタイル定義（P47 対策: モジュールスコープ export） */
export const addButtonStyles: Record<AddButtonState, string> = {
  idle: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  processing: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  success: "bg-[var(--status-success-subtle)] text-[var(--status-success)]",
};

/** 追加済みスタイル */
export const addedStyle =
  "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]";

export interface AddButtonProps {
  /** ボタン状態 */
  status: AddButtonState;
  /** 追加済みフラグ */
  isAdded: boolean;
  /** 追加ハンドラ */
  onAdd: () => void;
  /** ボタンサイズ */
  size?: "default" | "featured";
}

/**
 * ツール追加ボタンコンポーネント。
 */
export const AddButton: React.FC<AddButtonProps> = memo(
  ({ status, isAdded, onAdd, size = "default" }) => {
    const isDisabled = isAdded || status !== "idle";

    const sizeStyles =
      size === "featured"
        ? "px-4 py-2 text-sm rounded-lg"
        : "px-3 py-1.5 text-xs rounded-md";

    // isAdded + status="success" は success スタイルを優先（モーフィング完了状態）
    const currentStyle =
      isAdded && status !== "success" ? addedStyle : addButtonStyles[status];

    const renderContent = () => {
      if (isAdded && status === "success") {
        return (
          <>
            <Icon name="check" size={size === "featured" ? 16 : 14} />
            <span>追加済み!</span>
          </>
        );
      }

      if (isAdded) {
        return (
          <>
            <Icon name="check" size={size === "featured" ? 16 : 14} />
            <span>追加済み</span>
          </>
        );
      }

      switch (status) {
        case "processing":
          return (
            <>
              <Icon name="loader-2" size={size === "featured" ? 16 : 14} spin />
              <span role="status" aria-label="処理中" data-testid="spinner">
                追加中...
              </span>
            </>
          );
        case "success":
          return (
            <>
              <Icon name="check" size={size === "featured" ? 16 : 14} />
              <span>追加済み!</span>
            </>
          );
        default:
          return (
            <>
              <Icon name="plus" size={size === "featured" ? 16 : 14} />
              <span>追加する</span>
            </>
          );
      }
    };

    return (
      <button
        type="button"
        className={clsx(
          "inline-flex items-center gap-1.5 font-medium",
          "transition-all duration-200 ease-out",
          "will-change-transform",
          "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-offset-1",
          "disabled:cursor-not-allowed",
          sizeStyles,
          currentStyle,
        )}
        disabled={isDisabled}
        onClick={onAdd}
        aria-label={
          isAdded
            ? "追加済みツール"
            : status === "processing"
              ? "ツール追加中"
              : "ツールを追加する"
        }
        aria-busy={status === "processing"}
        data-testid="add-button"
        data-state={isAdded ? "added" : status}
      >
        {renderContent()}
      </button>
    );
  },
);

AddButton.displayName = "AddButton";
