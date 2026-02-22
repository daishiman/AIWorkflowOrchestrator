import React, { memo } from "react";
import clsx from "clsx";

export interface SkeletonCardProps {
  height?: string;
  borderRadius?: string;
  variant?: "default" | "stat" | "list-item";
  animate?: boolean;
}

const lineBase = "bg-[var(--bg-tertiary)] opacity-60 rounded";

function DefaultVariant() {
  return (
    <div className="space-y-3">
      <div
        data-testid="skeleton-header"
        className={clsx(lineBase, "w-[60%] h-3")}
      />
      <div
        data-testid="skeleton-body-1"
        className={clsx(lineBase, "w-[80%] h-2")}
      />
      <div
        data-testid="skeleton-body-2"
        className={clsx(lineBase, "w-full h-2")}
      />
    </div>
  );
}

function StatVariant() {
  return (
    <div className="space-y-3">
      <div
        data-testid="skeleton-number"
        className={clsx(lineBase, "w-[40%] h-6")}
      />
      <div
        data-testid="skeleton-label"
        className={clsx(lineBase, "w-[60%] h-2")}
      />
    </div>
  );
}

function ListItemVariant() {
  return (
    <div className="flex gap-3">
      <div
        data-testid="skeleton-icon"
        className={clsx(lineBase, "w-8 h-8 rounded-full flex-shrink-0")}
      />
      <div className="flex-1 space-y-3">
        <div
          data-testid="skeleton-text-1"
          className={clsx(lineBase, "w-[70%] h-2")}
        />
        <div
          data-testid="skeleton-text-2"
          className={clsx(lineBase, "w-[50%] h-2")}
        />
      </div>
    </div>
  );
}

const variantComponents: Record<
  NonNullable<SkeletonCardProps["variant"]>,
  React.FC
> = {
  default: DefaultVariant,
  stat: StatVariant,
  "list-item": ListItemVariant,
};

export const SkeletonCard: React.FC<SkeletonCardProps> = memo(
  ({ height, borderRadius, variant = "default", animate = true }) => {
    const VariantContent = variantComponents[variant];

    return (
      <div
        className={clsx(
          "bg-[var(--bg-tertiary)] rounded-lg p-4",
          animate && "animate-pulse",
        )}
        style={{
          ...(height ? { height } : {}),
          ...(borderRadius ? { borderRadius } : {}),
        }}
        role="status"
        aria-label="読み込み中"
        aria-busy="true"
      >
        <VariantContent />
      </div>
    );
  },
);

SkeletonCard.displayName = "SkeletonCard";
