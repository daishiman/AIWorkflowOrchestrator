import React, { forwardRef } from "react";
import clsx from "clsx";

export interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  resize?: "none" | "vertical" | "horizontal" | "both";
  disabled?: boolean;
  fontFamily?: "sans" | "mono";
  id?: string;
  name?: string;
  className?: string;
  "aria-describedby"?: string;
  "aria-label"?: string;
}

const resizeClasses = {
  none: "resize-none",
  vertical: "resize-y",
  horizontal: "resize-x",
  both: "resize",
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      value,
      onChange,
      placeholder,
      rows = 4,
      resize = "vertical",
      disabled = false,
      fontFamily = "sans",
      id,
      name,
      className,
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };

    return (
      <textarea
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        className={clsx(
          "w-full px-3 py-2 rounded-lg",
          "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
          "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
          disabled && "opacity-50 cursor-not-allowed",
          fontFamily === "mono" && "font-mono",
          resizeClasses[resize],
          className,
        )}
      />
    );
  },
);

TextArea.displayName = "TextArea";
