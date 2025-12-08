import React, { memo } from "react";
import clsx from "clsx";

export interface SkipLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * スキップリンクコンポーネント
 * キーボードユーザーがナビゲーションをスキップしてメインコンテンツに直接移動できるようにする
 * WCAG 2.4.1 準拠
 */
export const SkipLink: React.FC<SkipLinkProps> = memo(
  ({ href, children = "メインコンテンツへスキップ", className }) => {
    return (
      <a
        href={href}
        className={clsx(
          "sr-only focus:not-sr-only",
          "focus:absolute focus:top-4 focus:left-4 focus:z-50",
          "focus:px-4 focus:py-2 focus:rounded-lg",
          "focus:bg-blue-500 focus:text-white",
          "focus:outline-none focus:ring-2 focus:ring-blue-300",
          className,
        )}
      >
        {children}
      </a>
    );
  },
);

SkipLink.displayName = "SkipLink";
