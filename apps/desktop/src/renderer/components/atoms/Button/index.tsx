import React, { forwardRef } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../Icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      type = "button",
      onClick,
      ...props
    },
    ref,
  ) => {
    const baseStyles = clsx(
      "inline-flex items-center justify-center gap-2",
      "rounded-lg font-medium transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      fullWidth && "w-full",
    );

    const variantStyles = {
      primary: clsx(
        "bg-[var(--status-primary)] text-[var(--text-inverse)]",
        "hover:opacity-90",
        "focus:ring-[var(--status-primary)]",
        "active:opacity-80",
      ),
      secondary: clsx(
        "border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]",
        "hover:bg-[var(--bg-hover)]",
        "focus:ring-[var(--status-primary)]",
        "active:bg-[var(--bg-tertiary)]",
      ),
      ghost: clsx(
        "bg-transparent text-[var(--text-primary)]",
        "hover:bg-[var(--bg-hover)]",
        "focus:ring-[var(--status-primary)]",
        "active:bg-[var(--bg-tertiary)]",
      ),
      danger: clsx(
        "bg-[var(--status-error)] text-[var(--text-inverse)]",
        "hover:bg-[var(--status-error-hover)]",
        "focus:ring-[var(--status-error)]",
        "active:opacity-80",
      ),
    };

    const sizeStyles = {
      sm: "px-3 py-1 text-sm h-8",
      md: "px-4 py-2 text-sm h-10",
      lg: "px-6 py-3 text-base h-12",
    };

    const iconSize = {
      sm: 14,
      md: 16,
      lg: 18,
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        onClick={onClick}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Icon name="loader-2" size={iconSize[size]} spin aria-hidden="true" />
        )}
        {!loading && leftIcon && (
          <Icon name={leftIcon} size={iconSize[size]} aria-hidden="true" />
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <Icon name={rightIcon} size={iconSize[size]} aria-hidden="true" />
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
