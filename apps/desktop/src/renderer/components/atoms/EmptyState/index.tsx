import React, { memo } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../Icon";
import { SuggestionBubble } from "../SuggestionBubble";
import { Button } from "../Button";

interface ActionObject {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?: React.ReactNode | ActionObject;
  suggestions?: Array<{ label: string; icon?: string; onClick: () => void }>;
  compact?: boolean;
  mood?: "welcoming" | "encouraging" | "celebrating";
  className?: string;
}

const isActionObject = (
  action: EmptyStateProps["action"],
): action is ActionObject => {
  return (
    action !== null &&
    action !== undefined &&
    typeof action === "object" &&
    !React.isValidElement(action) &&
    "label" in action &&
    "onClick" in action
  );
};

const moodIconColors: Record<NonNullable<EmptyStateProps["mood"]>, string> = {
  welcoming: "text-[var(--status-primary)]",
  encouraging: "text-[var(--status-info)]",
  celebrating: "text-[var(--status-success)]",
};

/**
 * 空状態表示コンポーネント
 * データがない場合の表示パターンを提供
 */
export const EmptyState: React.FC<EmptyStateProps> = memo(
  ({
    title,
    description,
    icon,
    action,
    suggestions,
    compact = false,
    mood,
    className,
  }) => {
    const iconSize = compact ? 32 : 48;
    const iconColorClass = mood
      ? moodIconColors[mood]
      : "text-[var(--text-muted)]";

    return (
      <div
        role="status"
        className={clsx("flex items-center justify-center h-full", className)}
      >
        <div
          data-testid="empty-state-inner"
          className={clsx("text-center", compact ? "p-5" : "p-8")}
        >
          {icon && (
            <div className="mb-4">
              <div
                data-testid="icon-wrapper"
                className={clsx(
                  iconColorClass,
                  mood === "celebrating" && "animate-bounce",
                )}
              >
                <Icon
                  name={icon}
                  size={iconSize}
                  className="mx-auto"
                  color="currentColor"
                />
              </div>
            </div>
          )}
          <p
            className={clsx(
              "text-[var(--text-secondary)] mb-2",
              compact ? "text-base" : "text-lg",
            )}
          >
            {title}
          </p>
          {description && (
            <p className="text-sm text-[var(--text-muted)]">{description}</p>
          )}
          {action && (
            <div className="mt-4">
              {isActionObject(action) ? (
                <Button
                  variant={action.variant ?? "primary"}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ) : (
                action
              )}
            </div>
          )}
          {suggestions && suggestions.length > 0 && (
            <div
              data-testid="suggestions-container"
              className="flex flex-wrap justify-center gap-2 mt-4"
            >
              {suggestions.map((suggestion) => (
                <SuggestionBubble
                  key={suggestion.label}
                  label={suggestion.label}
                  icon={suggestion.icon}
                  onClick={suggestion.onClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);

EmptyState.displayName = "EmptyState";
