/**
 * CategoryTabs Component
 *
 * 横スクロール可能なカテゴリタブ。
 * - role="tablist" / role="tab" / aria-selected
 * - キーボード: 矢印キー移動、Enter/Space 選択
 * - 下線インジケータのスライドアニメーション（200ms ease-out）
 *
 * @module SkillCenterView/components/CategoryTabs
 */

import React, { memo, useRef, useCallback } from "react";
import clsx from "clsx";

export const CATEGORIES = [
  { id: "all", label: "すべて" },
  { id: "dev", label: "開発ツール" },
  { id: "writing", label: "文書作成" },
  { id: "analysis", label: "データ分析" },
  { id: "automation", label: "自動化" },
  { id: "other", label: "その他" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export interface CategoryTabsProps {
  /** 現在選択中のカテゴリ（null は "all" と同等） */
  selectedCategory: CategoryId | string | null;
  /** カテゴリ変更ハンドラ */
  onCategoryChange: (category: CategoryId) => void;
}

/** タブのスタイル定義 */
export const tabStyles = {
  base: clsx(
    "relative px-4 py-2 text-sm font-medium whitespace-nowrap",
    "rounded-lg transition-colors duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-offset-2",
  ),
  selected: "text-[var(--status-primary)]",
  unselected:
    "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
  indicator: clsx(
    "absolute bottom-0 left-0 right-0 h-0.5",
    "bg-[var(--status-primary)]",
    "transition-all duration-200 ease-out",
  ),
} as const;

/**
 * カテゴリタブコンポーネント。
 */
export const CategoryTabs: React.FC<CategoryTabsProps> = memo(
  ({ selectedCategory, onCategoryChange }) => {
    const tabListRef = useRef<HTMLDivElement>(null);

    // null は "all" と同等として扱う
    const effectiveCategory = selectedCategory ?? "all";

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>, tabIndex: number) => {
        let nextIndex = tabIndex;

        switch (event.key) {
          case "ArrowRight":
          case "ArrowDown":
            event.preventDefault();
            nextIndex = (tabIndex + 1) % CATEGORIES.length;
            break;
          case "ArrowLeft":
          case "ArrowUp":
            event.preventDefault();
            nextIndex = (tabIndex - 1 + CATEGORIES.length) % CATEGORIES.length;
            break;
          case "Home":
            event.preventDefault();
            nextIndex = 0;
            break;
          case "End":
            event.preventDefault();
            nextIndex = CATEGORIES.length - 1;
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            onCategoryChange(CATEGORIES[tabIndex].id);
            return;
          default:
            return;
        }

        const nextCategory = CATEGORIES[nextIndex];
        onCategoryChange(nextCategory.id);

        // フォーカスを次のタブに移動
        const tabList = tabListRef.current;
        if (tabList) {
          const buttons =
            tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]');
          buttons[nextIndex]?.focus();
        }
      },
      [onCategoryChange],
    );

    return (
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="ツールカテゴリ"
        className="flex gap-1 overflow-x-auto scrollbar-none pb-1"
        data-testid="category-tabs"
      >
        {CATEGORIES.map((cat, index) => {
          const isSelected = cat.id === effectiveCategory;

          return (
            <button
              key={cat.id}
              role="tab"
              type="button"
              id={`tab-${cat.id}`}
              aria-selected={isSelected}
              aria-controls={`tabpanel-${cat.id}`}
              tabIndex={isSelected ? 0 : -1}
              className={clsx(
                tabStyles.base,
                isSelected ? tabStyles.selected : tabStyles.unselected,
              )}
              onClick={() => onCategoryChange(cat.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              data-testid={`category-tab-${cat.id}`}
            >
              {cat.label}
              {isSelected && (
                <span
                  className={tabStyles.indicator}
                  data-testid="tab-indicator"
                />
              )}
            </button>
          );
        })}
      </div>
    );
  },
);

CategoryTabs.displayName = "CategoryTabs";
