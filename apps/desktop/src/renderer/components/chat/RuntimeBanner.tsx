import React from "react";

export interface RuntimeBannerProps {
  capability: "integratedRuntime" | "terminalSurface" | "both" | "none";
  onTerminalSwitch?: () => void;
  className?: string;
}

export const RuntimeBanner: React.FC<RuntimeBannerProps> = ({
  capability,
  className,
}) => {
  const labels: Record<string, string> = {
    integratedRuntime: "API利用中",
    terminalSurface: "Terminal経由",
    both: "API利用中 + Terminal",
    none: "設定が必要です",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="runtime-banner"
      data-capability={capability}
      className={className}
    >
      {labels[capability] ?? "不明"}
    </div>
  );
};
