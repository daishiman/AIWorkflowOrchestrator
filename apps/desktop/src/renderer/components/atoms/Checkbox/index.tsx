import React from "react";
import clsx from "clsx";
import { Icon } from "../Icon";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
  "aria-label": ariaLabel,
}) => {
  const checkboxId =
    id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  const descriptionId = description ? `${checkboxId}-description` : undefined;

  return (
    <div className={clsx("flex items-start gap-2", className)}>
      <div className="relative inline-flex items-center mt-0.5">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          aria-checked={checked}
          aria-label={ariaLabel ?? label}
          aria-describedby={descriptionId}
        />
        <label
          htmlFor={checkboxId}
          className={clsx(
            "w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all",
            "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900",
            checked
              ? "bg-blue-500 border-blue-500"
              : "bg-transparent border-white/30",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-white/50",
          )}
        >
          {checked && (
            <Icon
              name="check"
              size={16}
              className="text-white"
              aria-hidden="true"
            />
          )}
        </label>
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={checkboxId}
              className={clsx(
                "text-sm text-white select-none",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span
              id={descriptionId}
              className={clsx(
                "text-xs text-white/60",
                disabled && "opacity-50",
              )}
            >
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

Checkbox.displayName = "Checkbox";
