import React, { memo } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../Icon";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?: React.ReactNode;
  className?: string;
}

/**
 * 空状態表示コンポーネント
 * データがない場合の表示パターンを提供
 */
export const EmptyState: React.FC<EmptyStateProps> = memo(
  ({ title, description, icon, action, className }) => {
    return (
      <div
        className={clsx("flex items-center justify-center h-full", className)}
      >
        <div className="text-center">
          {icon && (
            <div className="mb-4">
              <Icon name={icon} size={48} className="text-gray-500 mx-auto" />
            </div>
          )}
          <p className="text-gray-400 mb-2">{title}</p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    );
  },
);

EmptyState.displayName = "EmptyState";
