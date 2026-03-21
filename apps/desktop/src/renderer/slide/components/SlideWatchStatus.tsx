import React from "react";

interface SlideWatchStatusProps {
  watching: boolean;
  watchPath?: string;
  syncDirection?: "forward" | "reverse";
}

export const dotStyles: Record<string, string> = {
  active: "bg-[#34C759] dark:bg-[#30D158]",
  inactive: "bg-[#C6C6C8] dark:bg-[#38383A]",
};

export const labelMap: Record<string, string> = {
  active: "監視中",
  inactive: "停止中",
};

const directionLabel: Record<"forward" | "reverse", string> = {
  forward: "→",
  reverse: "←",
};

export const SlideWatchStatus: React.FC<SlideWatchStatusProps> = ({
  watching,
  watchPath,
  syncDirection,
}) => {
  const stateKey = watching ? "active" : "inactive";

  return (
    <div
      role="status"
      data-testid="slide-watch-status"
      className="flex items-center gap-2 text-sm"
      aria-label={`監視状態: ${labelMap[stateKey]}`}
    >
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${dotStyles[stateKey]}`}
        aria-hidden="true"
      />
      <span className="text-[#3C3C43] dark:text-[rgba(235,235,245,0.6)]">
        {labelMap[stateKey]}
      </span>
      {syncDirection !== undefined && (
        <span
          className="text-[#3C3C43] dark:text-[rgba(235,235,245,0.6)]"
          aria-label={`同期方向: ${directionLabel[syncDirection]}`}
        >
          {directionLabel[syncDirection]}
        </span>
      )}
      {watchPath !== undefined && (
        <span
          className="truncate text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]"
          title={watchPath}
        >
          {watchPath}
        </span>
      )}
    </div>
  );
};
