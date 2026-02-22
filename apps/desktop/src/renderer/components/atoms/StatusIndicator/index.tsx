import React, { memo } from "react";
import clsx from "clsx";

export interface StatusIndicatorProps {
  status: "running" | "success" | "error" | "warning" | "idle" | "offline";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  label?: string;
}

const statusColorMap: Record<StatusIndicatorProps["status"], string> = {
  running: "bg-[var(--status-primary)]",
  success: "bg-[var(--status-success)]",
  error: "bg-[var(--status-error)]",
  warning: "bg-[var(--status-warning)]",
  idle: "bg-[var(--text-muted)]",
  offline: "bg-[var(--text-muted)]",
};

const sizeMap: Record<NonNullable<StatusIndicatorProps["size"]>, string> = {
  sm: "w-2 h-2",
  md: "w-[10px] h-[10px]",
  lg: "w-[14px] h-[14px]",
};

const StatusIndicatorComponent: React.FC<StatusIndicatorProps> = ({
  status,
  size = "md",
  pulse,
  label,
}) => {
  const isPulse = pulse ?? status === "running";
  const isOffline = status === "offline";

  return (
    <span
      role="status"
      aria-label={label ?? `ステータス: ${status}`}
      className={clsx(
        "inline-block rounded-full",
        statusColorMap[status],
        sizeMap[size],
        isPulse && "animate-pulse",
        isOffline && "border border-dashed border-[var(--border-default)]",
      )}
    />
  );
};

export const StatusIndicator = memo(StatusIndicatorComponent);
StatusIndicator.displayName = "StatusIndicator";
