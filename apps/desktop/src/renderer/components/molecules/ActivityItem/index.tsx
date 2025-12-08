import React from "react";
import clsx from "clsx";

export interface ActivityItemProps {
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
  className?: string;
}

const typeColors = {
  info: "bg-blue-400",
  success: "bg-green-400",
  warning: "bg-orange-400",
  error: "bg-red-400",
};

export const ActivityItem: React.FC<ActivityItemProps> = ({
  message,
  time,
  type,
  className,
}) => {
  const dotColor = typeColors[type];

  return (
    <div
      className={clsx(
        "flex items-start gap-3 p-3 rounded-lg",
        "hover:bg-white/5 transition-colors",
        className,
      )}
      role="listitem"
    >
      <div className="flex-shrink-0 pt-1.5">
        <div
          className={clsx("w-2 h-2 rounded-full", dotColor)}
          aria-label={`${type} indicator`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300 leading-relaxed break-words">
          {message}
        </p>
        <time
          className="text-xs text-gray-500 mt-1 block"
          dateTime={time}
          title={time}
        >
          {time}
        </time>
      </div>
    </div>
  );
};

ActivityItem.displayName = "ActivityItem";
