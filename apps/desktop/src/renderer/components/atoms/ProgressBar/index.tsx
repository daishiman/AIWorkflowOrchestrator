import React from "react";
import clsx from "clsx";

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "default" | "success" | "warning" | "error";
  showLabel?: boolean;
  className?: string;
}

const colorClasses = {
  default: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-orange-400",
  error: "bg-red-500",
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = "default",
  showLabel = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={clsx("w-full", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full transition-all duration-300 ease-out",
            colorClasses[color],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div
          className="mt-1 text-xs text-gray-400 text-right"
          aria-live="polite"
        >
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

ProgressBar.displayName = "ProgressBar";
