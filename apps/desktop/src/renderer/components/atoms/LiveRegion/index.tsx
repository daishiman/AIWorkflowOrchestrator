import React, { memo } from "react";
import clsx from "clsx";

export interface LiveRegionProps {
  message: string;
  politeness?: "polite" | "assertive";
  atomic?: boolean;
  className?: string;
}

/**
 * ライブリージョンコンポーネント
 * スクリーンリーダーに動的コンテンツの変更を通知する
 * WCAG 4.1.3 準拠
 */
export const LiveRegion: React.FC<LiveRegionProps> = memo(
  ({ message, politeness = "polite", atomic = true, className }) => {
    return (
      <div
        role="status"
        aria-live={politeness}
        aria-atomic={atomic}
        className={clsx("sr-only", className)}
      >
        {message}
      </div>
    );
  },
);

LiveRegion.displayName = "LiveRegion";
