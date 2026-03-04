import React, { memo } from "react";
import { EmptyState } from "../../atoms/EmptyState";
import { SkeletonCard } from "../../atoms/SkeletonCard";

export interface CardGridProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  minCardWidth?: number;
  gap?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  isLoading?: boolean;
  skeletonCount?: number;
}

function CardGridComponent<T>({
  items,
  renderCard,
  minCardWidth = 280,
  gap = "var(--spacing-4)",
  emptyMessage = "データがありません",
  emptyIcon = "file",
  isLoading = false,
  skeletonCount = 6,
}: CardGridProps<T>): React.ReactElement {
  if (isLoading) {
    return (
      <div
        role="grid"
        className="grid"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
          gap,
        }}
      >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div key={`skeleton-${index}`} role="gridcell">
            <SkeletonCard variant="default" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        icon={emptyIcon as never}
        description="条件を変更して再検索してください"
      />
    );
  }

  return (
    <div
      role="grid"
      className="grid"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
        gap,
      }}
    >
      {items.map((item, index) => (
        <div key={index} role="gridcell">
          {renderCard(item, index)}
        </div>
      ))}
    </div>
  );
}

const CardGridMemo = memo(CardGridComponent) as typeof CardGridComponent & {
  displayName?: string;
};
CardGridMemo.displayName = "CardGrid";

export const CardGrid = CardGridMemo;
