import React, { memo } from "react";
import clsx from "clsx";

export type GuidanceVariant = "error" | "handoff" | "blocked";

export interface GuidanceBlockProps {
  variant: GuidanceVariant;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const variantStyles: Record<
  GuidanceVariant,
  { container: string; icon: string; button: string }
> = {
  error: {
    container: "border-[var(--status-error)] bg-[var(--status-error)]/5",
    icon: "text-[var(--status-error)]",
    button:
      "bg-[var(--status-error)] text-[var(--text-inverse)] hover:opacity-90",
  },
  handoff: {
    container: "border-[var(--status-warning)] bg-[var(--status-warning)]/5",
    icon: "text-[var(--status-warning)]",
    button:
      "bg-[var(--status-warning)] text-[var(--text-inverse)] hover:opacity-90",
  },
  blocked: {
    container: "border-[var(--status-primary)] bg-[var(--status-primary)]/5",
    icon: "text-[var(--status-primary)]",
    button:
      "bg-[var(--status-primary)] text-[var(--text-inverse)] hover:opacity-90",
  },
};

const variantIcons: Record<GuidanceVariant, string> = {
  error: "\u26A0",
  handoff: "\u2192",
  blocked: "\u24D8",
};

export const GuidanceBlock = memo<GuidanceBlockProps>(
  ({
    variant,
    message,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
  }) => {
    const styles = variantStyles[variant];

    return (
      <div
        role="status"
        data-testid="workspace-guidance-block"
        className={clsx(
          "flex flex-col items-center gap-3 rounded-xl border p-6 text-center",
          "transition-colors duration-200",
          styles.container,
        )}
      >
        <span className={clsx("text-2xl", styles.icon)} aria-hidden="true">
          {variantIcons[variant]}
        </span>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {message}
        </p>

        {(actionLabel && onAction) ||
        (secondaryActionLabel && onSecondaryAction) ? (
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            {actionLabel && onAction ? (
              <button
                type="button"
                onClick={onAction}
                className={clsx(
                  "rounded-lg px-4 py-2 text-sm font-medium",
                  "transition-opacity duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2",
                  styles.button,
                )}
              >
                {actionLabel}
              </button>
            ) : null}

            {secondaryActionLabel && onSecondaryAction ? (
              <button
                type="button"
                onClick={onSecondaryAction}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors duration-200 hover:border-[var(--status-primary)] hover:text-[var(--status-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2"
              >
                {secondaryActionLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

GuidanceBlock.displayName = "GuidanceBlock";
