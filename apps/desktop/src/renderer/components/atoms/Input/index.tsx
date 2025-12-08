import React, { forwardRef, KeyboardEvent } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../Icon";

export interface InputProps {
  type?: "text" | "password" | "email" | "search";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onEnter?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-required"?: boolean;
  "aria-invalid"?: boolean;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      placeholder,
      value,
      onChange,
      disabled = false,
      error = false,
      leftIcon,
      rightIcon,
      onEnter,
      onFocus,
      onBlur,
      id,
      name,
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
      "aria-required": ariaRequired,
      "aria-invalid": ariaInvalid,
      className,
    },
    ref,
  ) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onEnter) {
        onEnter();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <div className={clsx("relative flex items-center", className)}>
        {leftIcon && (
          <div className="absolute left-3 pointer-events-none">
            <Icon name={leftIcon} size={18} className="text-gray-400" />
          </div>
        )}

        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={ariaInvalid ?? error}
          aria-describedby={ariaDescribedBy}
          aria-label={ariaLabel}
          aria-required={ariaRequired}
          className={clsx(
            "w-full px-3 py-2 rounded-lg",
            "bg-white/5 border border-white/10",
            "text-white placeholder:text-gray-400",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            error && "border-red-500 focus:ring-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
          )}
        />

        {rightIcon && (
          <div className="absolute right-3 pointer-events-none">
            <Icon name={rightIcon} size={18} className="text-gray-400" />
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
