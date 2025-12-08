import React from "react";
import clsx from "clsx";

export interface FormFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  required = false,
  error,
  children,
  htmlFor,
  className,
}) => {
  const fieldId = htmlFor || `field-${React.useId()}`;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const enhancedChildren = React.cloneElement(children as React.ReactElement, {
    id: fieldId,
    "aria-describedby": clsx(descriptionId, errorId).trim() || undefined,
    "aria-invalid": error ? "true" : undefined,
    "aria-required": required ? "true" : undefined,
  });

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-white/80 flex items-center gap-1"
      >
        {label}
        {required && (
          <span className="text-red-400" aria-label="required">
            *
          </span>
        )}
      </label>

      {description && (
        <p id={descriptionId} className="text-xs text-white/50">
          {description}
        </p>
      )}

      <div className="relative">{enhancedChildren}</div>

      {error && (
        <p
          id={errorId}
          className="text-sm text-red-400 flex items-start gap-1"
          role="alert"
        >
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

FormField.displayName = "FormField";
