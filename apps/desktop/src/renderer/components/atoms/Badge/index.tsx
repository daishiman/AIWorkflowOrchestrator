import React, { forwardRef } from "react";
import clsx from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant = "default", size = "md", className, children, ...props },
    ref,
  ) => {
    const baseStyles = clsx(
      "inline-flex items-center justify-center",
      "rounded-full font-medium whitespace-nowrap",
      "transition-colors duration-200",
    );

    const variantStyles = {
      default: "bg-gray-600 text-white",
      success: "bg-green-500 text-white",
      warning: "bg-orange-400 text-white",
      error: "bg-red-500 text-white",
      info: "bg-blue-500 text-white",
    };

    const sizeStyles = {
      sm: "px-2 py-0.5 text-xs h-5",
      md: "px-2.5 py-1 text-sm h-6",
    };

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
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
