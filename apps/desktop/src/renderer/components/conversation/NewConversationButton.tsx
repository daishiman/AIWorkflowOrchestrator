/**
 * NewConversationButton Component
 *
 * Atom component for creating new conversations.
 *
 * @module @repo/desktop/renderer/components/conversation/NewConversationButton
 */

import React, { useCallback } from "react";

export interface NewConversationButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function NewConversationButton({
  onClick,
  label = "新規",
  disabled = false,
  isLoading = false,
  variant = "primary",
  size = "md",
}: NewConversationButtonProps): React.ReactElement {
  const isDisabled = disabled || isLoading;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((event.key === "Enter" || event.key === " ") && !isDisabled) {
        event.preventDefault();
        onClick();
      }
    },
    [onClick, isDisabled],
  );

  const sizeClasses: Record<string, string> = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-4 py-3 text-lg",
  };

  const variantClasses: Record<string, string> = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  };

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      aria-label={label}
      className={`${variant} ${size} ${sizeClasses[size]} ${variantClasses[variant]} inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {isLoading ? (
        <span
          data-testid="loading-spinner"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        <svg
          data-testid="new-conversation-icon"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
}
