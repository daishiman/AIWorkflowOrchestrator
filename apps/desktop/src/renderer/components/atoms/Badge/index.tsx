import React, { forwardRef, memo } from "react";
import clsx from "clsx";

export interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  children?: React.ReactNode;
  content?: string | number;
}

const baseStyles = clsx(
  "inline-flex items-center justify-center",
  "rounded-full font-medium whitespace-nowrap",
  "transition-colors duration-200",
);

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
  primary: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  success: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  warning: "bg-[var(--status-warning)] text-[var(--text-inverse)]",
  error: "bg-[var(--status-error)] text-[var(--text-inverse)]",
  info: "bg-[var(--status-info)] text-[var(--text-inverse)]",
};

const sizeStyles: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-xs h-5",
  md: "px-2.5 py-1 text-sm h-6",
};

export const Badge = memo(
  forwardRef<HTMLSpanElement, BadgeProps>(
    (
      {
        variant = "default",
        size = "md",
        className,
        children,
        content,
        ...props
      },
      ref,
    ) => {
      const displayContent =
        children ?? (content !== undefined ? String(content) : undefined);

      const ariaProps: Record<string, string> = {};
      if (typeof content === "number" && !props["aria-label"]) {
        ariaProps["aria-label"] = `${content}件`;
      }

      return (
        <span
          ref={ref}
          className={clsx(
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            className,
          )}
          role="status"
          {...ariaProps}
          {...props}
        >
          {displayContent}
        </span>
      );
    },
  ),
);

Badge.displayName = "Badge";
