import React from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../../atoms/Icon";
import { ProgressBar } from "../../atoms/ProgressBar";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: IconName;
  color?: "default" | "success" | "warning" | "error";
  progress?: {
    value: number;
    max: number;
  };
  className?: string;
}

const colorVariants = {
  default: { icon: "text-blue-400", value: "text-white" },
  success: { icon: "text-green-400", value: "text-green-400" },
  warning: { icon: "text-orange-400", value: "text-orange-400" },
  error: { icon: "text-red-400", value: "text-red-400" },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = "default",
  progress,
  className,
}) => {
  const colors = colorVariants[color];

  return (
    <div
      className={clsx(
        "rounded-2xl p-4",
        "bg-white/5 backdrop-blur-sm",
        "border border-white/10",
        "transition-all duration-200",
        "hover:bg-white/10 hover:border-white/20",
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div
            className={clsx(
              "flex-shrink-0 w-10 h-10 rounded-xl",
              "bg-white/5 backdrop-blur-sm",
              "flex items-center justify-center",
            )}
          >
            <Icon name={icon} size={20} className={colors.icon} />
          </div>
        )}
        <span className="text-sm font-medium text-gray-400">{title}</span>
      </div>

      <div className={clsx("text-3xl font-bold mb-3", colors.value)}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>

      {progress && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <ProgressBar
            value={progress.value}
            max={progress.max}
            color={color}
            showLabel
          />
        </div>
      )}
    </div>
  );
};

StatCard.displayName = "StatCard";
